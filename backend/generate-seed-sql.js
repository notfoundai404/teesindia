const fs = require('fs');
const bcrypt = require('bcryptjs');
const { randomUUID } = require('crypto');

async function main() {
  const sql = [];
  
  // Helpers
  const escapeString = (str) => {
    if (str === null || str === undefined) return 'NULL';
    return "'" + str.replace(/'/g, "''").replace(/\\/g, "\\\\") + "'";
  };
  const dateStr = () => escapeString(new Date().toISOString().slice(0, 19).replace('T', ' '));

  sql.push('-- Seed Data for TeesIndia Production Database');
  sql.push('SET FOREIGN_KEY_CHECKS = 0;\n');
  
  // 1. User
  const adminId = randomUUID();
  const adminHash = await bcrypt.hash('admin123', 12);
  sql.push(`INSERT INTO users (id, name, email, passwordHash, role, createdAt, updatedAt) VALUES (${escapeString(adminId)}, 'Admin', 'admin@teesindia.com', ${escapeString(adminHash)}, 'ADMIN', ${dateStr()}, ${dateStr()});`);
  
  // 2. Categories
  const catData = [
    { name: 'Men', slug: 'men', description: "Men's clothing collection" },
    { name: 'Women', slug: 'women', description: "Women's clothing collection" },
    { name: 'Oversized', slug: 'oversized', description: 'Oversized streetwear' },
    { name: 'Accessories', slug: 'accessories', description: 'Fashion accessories' },
    { name: 'Hoodies', slug: 'hoodies', description: 'Premium hoodies' },
  ];
  const categories = {};
  for (const c of catData) {
    const cid = randomUUID();
    categories[c.slug] = cid;
    sql.push(`INSERT INTO categories (id, name, slug, description, createdAt) VALUES (${escapeString(cid)}, ${escapeString(c.name)}, ${escapeString(c.slug)}, ${escapeString(c.description)}, ${dateStr()});`);
  }
  
  // 3. Products & Variants
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
    const pid = randomUUID();
    const catId = categories[pd.category];
    const desc = `Premium quality ${pd.name.toLowerCase()} crafted from 100% combed cotton. Designed for comfort and style. Made in India.`;
    const careInstr = 'Machine wash cold with similar colors.\nDo not bleach.\nTumble dry low.\nIron on low heat.\nDo not dry clean.';
    const isFeatured = pd.isFeatured ? 1 : 0;
    
    sql.push(`INSERT INTO products (id, name, slug, description, price, comparePrice, categoryId, stock, isFeatured, isActive, tags, material, careInstr, createdAt, updatedAt) VALUES (${escapeString(pid)}, ${escapeString(pd.name)}, ${escapeString(pd.slug)}, ${escapeString(desc)}, ${pd.price}, ${pd.comparePrice}, ${escapeString(catId)}, ${pd.stock}, ${isFeatured}, 1, 'tshirt,premium,india,cotton', '100% Combed Cotton, 180 GSM', ${escapeString(careInstr)}, ${dateStr()}, ${dateStr()});`);
    
    // Variants
    const sizes = [
      { size: 'S', stock: Math.floor(pd.stock / 5) },
      { size: 'M', stock: Math.floor(pd.stock / 3) },
      { size: 'L', stock: Math.floor(pd.stock / 3) },
      { size: 'XL', stock: Math.floor(pd.stock / 4) },
      { size: 'XXL', stock: Math.floor(pd.stock / 8) },
    ];
    for (const v of sizes) {
      const vid = randomUUID();
      sql.push(`INSERT INTO product_variants (id, productId, size, stock) VALUES (${escapeString(vid)}, ${escapeString(pid)}, ${escapeString(v.size)}, ${v.stock});`);
    }
  }

  // 4. Blog Post
  const blogId = randomUUID();
  const blogContent = `# Why Quality Matters\n\nAt Teesindia, quality isn't just a word — it's our promise.\n\n## The Fabric Story\nWe source only the finest 100% combed cotton for our garments. Every piece goes through rigorous quality checks before reaching you.\n\n## Our Process\n1. Design with purpose\n2. Source premium materials\n3. Craft with care\n4. Quality check at every step\n\n## Why It Matters\nGreat clothes make you feel great. That's why we never compromise.`;
  sql.push(`INSERT INTO blog_posts (id, title, slug, excerpt, content, authorId, isPublished, publishedAt, category, tags, createdAt, updatedAt) VALUES (${escapeString(blogId)}, 'Why Quality Matters in Streetwear', 'why-quality-matters', 'At Teesindia, we believe every stitch tells a story. Here\\'s why we obsess over quality.', ${escapeString(blogContent)}, ${escapeString(adminId)}, 1, ${dateStr()}, 'brand', 'quality,streetwear,india', ${dateStr()}, ${dateStr()});`);
  
  sql.push('\nSET FOREIGN_KEY_CHECKS = 1;');
  
  fs.writeFileSync('seed.sql', sql.join('\n'));
  console.log('✅ Generated seed.sql successfully!');
}

main().catch(console.error);
