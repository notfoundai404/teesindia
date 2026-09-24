import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create admin user
  const adminHash = await bcrypt.hash('admin123', 12);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@teesindia.com' },
    update: {},
    create: {
      name: 'Admin',
      email: 'admin@teesindia.com',
      passwordHash: adminHash,
      role: 'ADMIN',
    },
  });
  console.log('✅ Admin user:', admin.email);

  // Create categories
  const categories = await Promise.all([
    prisma.category.upsert({ where: { slug: 'men' }, update: {}, create: { name: 'Men', slug: 'men', description: "Men's clothing collection" } }),
    prisma.category.upsert({ where: { slug: 'women' }, update: {}, create: { name: 'Women', slug: 'women', description: "Women's clothing collection" } }),
    prisma.category.upsert({ where: { slug: 'oversized' }, update: {}, create: { name: 'Oversized', slug: 'oversized', description: 'Oversized streetwear' } }),
    prisma.category.upsert({ where: { slug: 'accessories' }, update: {}, create: { name: 'Accessories', slug: 'accessories', description: 'Fashion accessories' } }),
    prisma.category.upsert({ where: { slug: 'hoodies' }, update: {}, create: { name: 'Hoodies', slug: 'hoodies', description: 'Premium hoodies' } }),
  ]);
  console.log('✅ Categories:', categories.map(c => c.name).join(', '));

  // Create sample products
  const productData = [
    { name: 'Classic Black Tee', slug: 'classic-black-tee', price: 599, comparePrice: 799, category: 'men', isFeatured: true, stock: 50 },
    { name: 'Essential White Tee', slug: 'essential-white-tee', price: 599, comparePrice: 799, category: 'men', isFeatured: true, stock: 45 },
    { name: 'Minimal Logo Tee', slug: 'minimal-logo-tee', price: 699, comparePrice: 999, category: 'men', isFeatured: true, stock: 30 },
    { name: 'Drop Shoulder Oversized', slug: 'drop-shoulder-oversized', price: 899, comparePrice: 1299, category: 'oversized', isFeatured: true, stock: 25 },
    { name: 'Streetwear Hoodie Black', slug: 'streetwear-hoodie-black', price: 1499, comparePrice: 1999, category: 'hoodies', isFeatured: true, stock: 20 },
    { name: 'Women Crop Tee', slug: 'women-crop-tee', price: 549, comparePrice: 749, category: 'women', isFeatured: true, stock: 40 },
    { name: 'Graphic Print Tee', slug: 'graphic-print-tee', price: 749, comparePrice: 999, category: 'men', isFeatured: false, stock: 35 },
    { name: 'Vintage Wash Tee', slug: 'vintage-wash-tee', price: 849, comparePrice: 1099, category: 'men', isFeatured: false, stock: 15 },
  ];

  for (const pd of productData) {
    const cat = categories.find(c => c.slug === pd.category)!;
    const product = await prisma.product.upsert({
      where: { slug: pd.slug },
      update: {},
      create: {
        name: pd.name,
        slug: pd.slug,
        description: `Premium quality ${pd.name.toLowerCase()} crafted from 100% combed cotton. Designed for comfort and style. Made in India.`,
        price: pd.price,
        comparePrice: pd.comparePrice,
        categoryId: cat.id,
        stock: pd.stock,
        isFeatured: pd.isFeatured,
        material: '100% Combed Cotton, 180 GSM',
        careInstr: 'Machine wash cold with similar colors.\nDo not bleach.\nTumble dry low.\nIron on low heat.\nDo not dry clean.',
        tags: 'tshirt,premium,india,cotton',
        variants: {
          create: [
            { size: 'S', stock: Math.floor(pd.stock / 5) },
            { size: 'M', stock: Math.floor(pd.stock / 3) },
            { size: 'L', stock: Math.floor(pd.stock / 3) },
            { size: 'XL', stock: Math.floor(pd.stock / 4) },
            { size: 'XXL', stock: Math.floor(pd.stock / 8) },
          ],
        },
      },
    });
    console.log('✅ Product:', product.name);
  }

  // Sample blog post
  await prisma.blogPost.upsert({
    where: { slug: 'why-quality-matters' },
    update: {},
    create: {
      title: 'Why Quality Matters in Streetwear',
      slug: 'why-quality-matters',
      excerpt: 'At Teesindia, we believe every stitch tells a story. Here\'s why we obsess over quality.',
      content: `# Why Quality Matters

At Teesindia, quality isn't just a word — it's our promise.

## The Fabric Story
We source only the finest 100% combed cotton for our garments. Every piece goes through rigorous quality checks before reaching you.

## Our Process
1. Design with purpose
2. Source premium materials
3. Craft with care
4. Quality check at every step

## Why It Matters
Great clothes make you feel great. That's why we never compromise.`,
      isPublished: true,
      publishedAt: new Date(),
      category: 'brand',
      tags: 'quality,streetwear,india',
      authorId: admin.id,
    },
  });

  console.log('✅ Blog post created');
  console.log('\n🎉 Seed complete!');
  console.log('\nAdmin credentials:');
  console.log('  Email: admin@teesindia.com');
  console.log('  Password: admin123');
}

main().catch(console.error).finally(() => prisma.$disconnect());
