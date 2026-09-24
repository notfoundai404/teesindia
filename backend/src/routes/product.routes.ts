import { Router, Request, Response } from 'express';
import prisma from '../lib/prisma';
import { authenticate, requireAdmin, AuthRequest } from '../middlewares/auth.middleware';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { uploadToDrive, isDriveConfigured } from '../lib/drive';

// ─── On-demand ISR revalidation ──────────────────────────────────────────────────
async function revalidateFrontend(scope: 'products' | 'settings' | 'all' = 'products'): Promise<void> {
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
  const secret = process.env.REVALIDATE_SECRET;
  if (!secret) return;
  try {
    await fetch(`${frontendUrl}/api/revalidate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-revalidate-secret': secret },
      body: JSON.stringify({ scope }),
    });
  } catch (err) {
    console.warn('[Revalidation] Failed to ping frontend:', (err as Error).message);
  }
}

const router = Router();

// ── Storage: auto-select Drive (if configured) or local disk ──────────────────
const diskStorage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    const dir = path.join(__dirname, '../../uploads/products');
    fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (_req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, unique + path.extname(file.originalname));
  },
});

// Memory storage is used when Drive is configured (buffer piped to Drive API)
const upload = multer({
  storage: isDriveConfigured() ? multer.memoryStorage() : diskStorage,
  limits: { fileSize: 5 * 1024 * 1024 },
});

/**
 * Resolves uploaded files to { url } objects.
 * - If Drive is configured → uploads each buffer to Drive, returns Drive URL
 * - Otherwise → returns local /uploads/products/<filename> URL
 */
async function resolveImageUrls(files: Express.Multer.File[]): Promise<{ url: string }[]> {
  if (isDriveConfigured()) {
    const results = await Promise.all(
      files.map(f => uploadToDrive(f.buffer, f.originalname, f.mimetype))
    );
    return results.map(r => ({ url: r.webContentLink }));
  }
  return files.map(f => ({ url: `/uploads/products/${f.filename}` }));
}


// GET /api/products — list with filters
router.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const { category, search, minPrice, maxPrice, sort = 'newest', page = '1', limit = '12', featured, includeInactive } = req.query;

    const where: any = {};
    if (includeInactive !== 'true') {
      where.isActive = true;
    }
    if (category) where.category = { slug: category as string };
    if (featured === 'true') where.isFeatured = true;
    if (search) where.OR = [
      { name: { contains: search as string } },
      { description: { contains: search as string } },
      { tags: { contains: search as string } },
    ];
    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price.gte = parseFloat(minPrice as string);
      if (maxPrice) where.price.lte = parseFloat(maxPrice as string);
    }

    const orderBy: any = sort === 'price_asc' ? { price: 'asc' }
      : sort === 'price_desc' ? { price: 'desc' }
      : { createdAt: 'desc' };

    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);
    const take = parseInt(limit as string);

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        orderBy,
        skip,
        take,
        include: {
          images: { orderBy: { position: 'asc' }, take: 2 },
          category: { select: { name: true, slug: true } },
          reviews: { select: { rating: true } },
        },
      }),
      prisma.product.count({ where }),
    ]);

    const productsWithRating = products.map(p => ({
      ...p,
      avgRating: p.reviews.length ? p.reviews.reduce((a, r) => a + r.rating, 0) / p.reviews.length : null,
      reviewCount: p.reviews.length,
    }));

    res.json({ products: productsWithRating, total, page: parseInt(page as string), pages: Math.ceil(total / take) });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch products', error: err });
  }
});

// GET /api/products/:slug — single product (by slug or id)
router.get('/:slug', async (req: Request, res: Response): Promise<void> => {
  try {
    const { includeInactive } = req.query;
    const where: any = {
      OR: [
        { slug: req.params.slug },
        { id: req.params.slug },
      ],
    };
    if (includeInactive !== 'true') {
      where.isActive = true;
    }

    const product = await prisma.product.findFirst({
      where,
      include: {
        images: { orderBy: { position: 'asc' } },
        category: true,
        variants: true,
        reviews: {
          include: { user: { select: { name: true } } },
          orderBy: { createdAt: 'desc' },
        },
      },
    });
    if (!product) { res.status(404).json({ message: 'Product is unavailable or has been removed' }); return; }
    res.json({ product });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch product', error: err });
  }
});

// POST /api/products — create (admin)
router.post('/', authenticate, requireAdmin, upload.array('images', 10), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, slug, description, price, comparePrice, compareAtPrice, categoryId, category, stock, isFeatured, isActive, tags, material, careInstr, sizes, imageUrls: rawImageUrls, externalImages, collectionIds, collections } = req.body;
    const resolvedCategoryId = categoryId || category;
    const resolvedComparePrice = comparePrice || compareAtPrice;
    const resolvedIsActive = isActive !== undefined ? (isActive === 'true' || isActive === true) : true;
    const files = req.files as Express.Multer.File[];

    const uploadedUrls = files?.length ? await resolveImageUrls(files) : [];

    // Parse external image URLs if passed
    let additionalImageUrls: { url: string }[] = [];
    const urlsToParse = rawImageUrls || externalImages;
    if (urlsToParse) {
      try {
        const parsed = typeof urlsToParse === 'string' ? JSON.parse(urlsToParse) : urlsToParse;
        if (Array.isArray(parsed)) {
          additionalImageUrls = parsed.filter((u: any) => typeof u === 'string' && u.trim()).map((u: string) => ({ url: u.trim() }));
        }
      } catch (e) {
        // ignore parse error
      }
    }
    const combinedImages = [...uploadedUrls, ...additionalImageUrls];

    // Parse collections if passed
    let parsedCollectionIds: string[] = [];
    const rawCollections = collectionIds || collections;
    if (rawCollections) {
      try {
        const parsed = typeof rawCollections === 'string' ? JSON.parse(rawCollections) : rawCollections;
        if (Array.isArray(parsed)) {
          parsedCollectionIds = parsed.filter((c: any) => typeof c === 'string' && c.trim());
        }
      } catch (e) {
        // ignore parse error
      }
    }

    // Parse variants/sizes if passed
    let parsedVariants: { size: string; color?: string; stock: number; sku?: string }[] = [];
    if (sizes) {
      try {
        parsedVariants = typeof sizes === 'string' ? JSON.parse(sizes) : sizes;
      } catch (e) {
        // ignore parse error
      }
    }

    const product = await prisma.product.create({
      data: {
        name, slug, description,
        price: parseFloat(price),
        comparePrice: resolvedComparePrice ? parseFloat(resolvedComparePrice) : null,
        categoryId: resolvedCategoryId,
        stock: parseInt(stock || '0'),
        isFeatured: isFeatured === 'true' || isFeatured === true,
        isActive: resolvedIsActive,
        tags: typeof tags === 'string' ? tags : JSON.stringify(tags || []),
        material,
        careInstr,
        images: combinedImages.length ? {
          create: combinedImages.map((img, i) => ({ url: img.url, position: i })),
        } : undefined,
        variants: parsedVariants.length ? {
          create: parsedVariants.map(v => ({
            size: v.size || 'M',
            color: v.color || 'Standard',
            stock: Number(v.stock) || 0,
            sku: `${slug}-${v.size || 'M'}-${Date.now()}`.toUpperCase(),
          })),
        } : undefined,
        collections: parsedCollectionIds.length ? {
          create: parsedCollectionIds.map(cId => ({ collectionId: cId })),
        } : undefined,
      },
      include: { images: true, variants: true, category: true, collections: true },
    });

    res.status(201).json({ product });
    // Purge product catalog cache on the CDN instantly
    revalidateFrontend('products').catch(() => {});
  } catch (err) {
    res.status(500).json({ message: 'Failed to create product', error: err });
  }
});

// PUT /api/products/:id — update (admin)
router.put('/:id', authenticate, requireAdmin, upload.array('images', 10), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, slug, description, price, comparePrice, compareAtPrice, categoryId, category, stock, isFeatured, tags, material, careInstr, isActive, deleteImageIds, sizes } = req.body;
    const files = req.files as Express.Multer.File[];

    const resolvedCategoryId = categoryId || category;
    const resolvedComparePrice = comparePrice !== undefined ? comparePrice : compareAtPrice;

    const data: any = {};
    if (name) data.name = name;
    if (slug) data.slug = slug;
    if (description !== undefined) data.description = description;
    if (resolvedCategoryId) data.categoryId = resolvedCategoryId;
    if (tags !== undefined) data.tags = typeof tags === 'string' ? tags : JSON.stringify(tags || []);
    if (material !== undefined) data.material = material;
    if (careInstr !== undefined) data.careInstr = careInstr;
    if (price) data.price = parseFloat(price);
    if (resolvedComparePrice !== undefined) data.comparePrice = resolvedComparePrice ? parseFloat(resolvedComparePrice) : null;
    if (stock !== undefined) data.stock = parseInt(stock);
    if (isFeatured !== undefined) data.isFeatured = isFeatured === 'true' || isFeatured === true;
    if (isActive !== undefined) {
      data.isActive = isActive === 'true' || isActive === true;
      if (!data.isActive) {
        // Purge cart items referencing this deactivated product
        await prisma.cartItem.deleteMany({ where: { productId: req.params.id } }).catch(() => {});
      }
    }

    // Remove deleted images if specified
    if (deleteImageIds) {
      const idsToDelete: string[] = typeof deleteImageIds === 'string' ? JSON.parse(deleteImageIds) : deleteImageIds;
      if (Array.isArray(idsToDelete) && idsToDelete.length) {
        await prisma.productImage.deleteMany({
          where: { id: { in: idsToDelete }, productId: req.params.id },
        });
      }
    }

    if (files?.length) {
      const imageUrls = await resolveImageUrls(files);
      const existingCount = await prisma.productImage.count({ where: { productId: req.params.id } });
      data.images = {
        create: imageUrls.map((img, i) => ({ url: img.url, position: existingCount + i })),
      };
    }

    if (sizes) {
      let parsedVariants: { size: string; color?: string; stock: number; sku?: string }[] = [];
      try {
        parsedVariants = typeof sizes === 'string' ? JSON.parse(sizes) : sizes;
      } catch (e) {}

      if (parsedVariants.length) {
        // delete existing variants and recreate
        await prisma.productVariant.deleteMany({ where: { productId: req.params.id } });
        data.variants = {
          create: parsedVariants.map(v => ({
            size: v.size || 'M',
            color: v.color || 'Standard',
            stock: Number(v.stock) || 0,
            sku: `${slug || req.params.id}-${v.size || 'M'}-${Date.now()}`.toUpperCase(),
          })),
        };
      }
    }

    const product = await prisma.product.update({
      where: { id: req.params.id },
      data,
      include: { images: true, variants: true, category: true },
    });
    res.json({ product });
    // Purge product + individual product page from CDN cache
    revalidateFrontend('products').catch(() => {});
  } catch (err) {
    res.status(500).json({ message: 'Failed to update product', error: err });
  }
});

// DELETE /api/products/:id — delete (admin)
router.delete('/:id', authenticate, requireAdmin, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    // 1. Purge all customer cart items referencing this product
    await prisma.cartItem.deleteMany({ where: { productId: req.params.id } }).catch(() => {});
    // 2. Deactivate product (soft-delete protects order relational integrity)
    await prisma.product.update({ where: { id: req.params.id }, data: { isActive: false } });
    res.json({ message: 'Product deactivated and removed from carts' });
    // Purge product catalog cache instantly
    revalidateFrontend('products').catch(() => {});
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete product', error: err });
  }
});

// POST /api/products/:id/reviews
router.post('/:id/reviews', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { rating, comment } = req.body;
    const review = await prisma.review.upsert({
      where: { productId_userId: { productId: req.params.id, userId: req.user!.id } },
      update: { rating: parseInt(rating), comment },
      create: { productId: req.params.id, userId: req.user!.id, rating: parseInt(rating), comment },
    });
    res.status(201).json({ review });
  } catch (err) {
    res.status(500).json({ message: 'Failed to add review', error: err });
  }
});

export default router;
