-- CreateTable
CREATE TABLE `users` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `passwordHash` VARCHAR(191) NOT NULL,
    `role` ENUM('CUSTOMER', 'ADMIN') NOT NULL DEFAULT 'CUSTOMER',
    `phone` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `users_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `addresses` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `phone` VARCHAR(191) NOT NULL,
    `line1` VARCHAR(191) NOT NULL,
    `line2` VARCHAR(191) NULL,
    `city` VARCHAR(191) NOT NULL,
    `state` VARCHAR(191) NOT NULL,
    `pincode` VARCHAR(191) NOT NULL,
    `isDefault` BOOLEAN NOT NULL DEFAULT false,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `categories` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `slug` VARCHAR(191) NOT NULL,
    `image` VARCHAR(191) NULL,
    `description` VARCHAR(191) NULL,
    `parentId` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `categories_slug_key`(`slug`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `products` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `slug` VARCHAR(191) NOT NULL,
    `description` TEXT NOT NULL,
    `price` DECIMAL(10, 2) NOT NULL,
    `comparePrice` DECIMAL(10, 2) NULL,
    `categoryId` VARCHAR(191) NOT NULL,
    `stock` INTEGER NOT NULL DEFAULT 0,
    `isFeatured` BOOLEAN NOT NULL DEFAULT false,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `tags` TEXT NULL,
    `material` VARCHAR(191) NULL,
    `careInstr` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `products_slug_key`(`slug`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `product_images` (
    `id` VARCHAR(191) NOT NULL,
    `productId` VARCHAR(191) NOT NULL,
    `url` VARCHAR(191) NOT NULL,
    `altText` VARCHAR(191) NULL,
    `position` INTEGER NOT NULL DEFAULT 0,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `product_variants` (
    `id` VARCHAR(191) NOT NULL,
    `productId` VARCHAR(191) NOT NULL,
    `size` VARCHAR(191) NOT NULL,
    `color` VARCHAR(191) NULL,
    `stock` INTEGER NOT NULL DEFAULT 0,
    `sku` VARCHAR(191) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `cart_items` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `productId` VARCHAR(191) NOT NULL,
    `variantId` VARCHAR(191) NULL,
    `quantity` INTEGER NOT NULL DEFAULT 1,

    UNIQUE INDEX `cart_items_userId_productId_variantId_key`(`userId`, `productId`, `variantId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `orders` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `addressId` VARCHAR(191) NOT NULL,
    `totalAmount` DECIMAL(10, 2) NOT NULL,
    `status` ENUM('PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'REFUNDED') NOT NULL DEFAULT 'PENDING',
    `paymentStatus` ENUM('PENDING', 'PAID', 'FAILED', 'REFUNDED') NOT NULL DEFAULT 'PENDING',
    `paymentMethod` ENUM('RAZORPAY', 'COD') NOT NULL,
    `razorpayOrderId` VARCHAR(191) NULL,
    `razorpayPayId` VARCHAR(191) NULL,
    `notes` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `order_items` (
    `id` VARCHAR(191) NOT NULL,
    `orderId` VARCHAR(191) NOT NULL,
    `productId` VARCHAR(191) NOT NULL,
    `variantId` VARCHAR(191) NULL,
    `quantity` INTEGER NOT NULL,
    `price` DECIMAL(10, 2) NOT NULL,
    `size` VARCHAR(191) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `wishlists` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `wishlists_userId_key`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `wishlist_items` (
    `id` VARCHAR(191) NOT NULL,
    `wishlistId` VARCHAR(191) NOT NULL,
    `productId` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `wishlist_items_wishlistId_productId_key`(`wishlistId`, `productId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `reviews` (
    `id` VARCHAR(191) NOT NULL,
    `productId` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `rating` INTEGER NOT NULL,
    `comment` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `reviews_productId_userId_key`(`productId`, `userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `blog_posts` (
    `id` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `slug` VARCHAR(191) NOT NULL,
    `excerpt` TEXT NULL,
    `content` LONGTEXT NOT NULL,
    `coverImage` VARCHAR(191) NULL,
    `authorId` VARCHAR(191) NOT NULL,
    `isPublished` BOOLEAN NOT NULL DEFAULT false,
    `publishedAt` DATETIME(3) NULL,
    `category` VARCHAR(191) NULL,
    `tags` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `blog_posts_slug_key`(`slug`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `collections` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `slug` VARCHAR(191) NOT NULL,
    `description` TEXT NULL,
    `heroImage` VARCHAR(191) NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `collections_slug_key`(`slug`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `collection_products` (
    `collectionId` VARCHAR(191) NOT NULL,
    `productId` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`collectionId`, `productId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `store_settings` (
    `id` VARCHAR(191) NOT NULL DEFAULT 'singleton',
    `data` JSON NOT NULL,
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `addresses` ADD CONSTRAINT `addresses_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `categories` ADD CONSTRAINT `categories_parentId_fkey` FOREIGN KEY (`parentId`) REFERENCES `categories`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `products` ADD CONSTRAINT `products_categoryId_fkey` FOREIGN KEY (`categoryId`) REFERENCES `categories`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `product_images` ADD CONSTRAINT `product_images_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `products`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `product_variants` ADD CONSTRAINT `product_variants_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `products`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `cart_items` ADD CONSTRAINT `cart_items_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `cart_items` ADD CONSTRAINT `cart_items_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `products`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `cart_items` ADD CONSTRAINT `cart_items_variantId_fkey` FOREIGN KEY (`variantId`) REFERENCES `product_variants`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `orders` ADD CONSTRAINT `orders_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `orders` ADD CONSTRAINT `orders_addressId_fkey` FOREIGN KEY (`addressId`) REFERENCES `addresses`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `order_items` ADD CONSTRAINT `order_items_orderId_fkey` FOREIGN KEY (`orderId`) REFERENCES `orders`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `order_items` ADD CONSTRAINT `order_items_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `products`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `order_items` ADD CONSTRAINT `order_items_variantId_fkey` FOREIGN KEY (`variantId`) REFERENCES `product_variants`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `wishlists` ADD CONSTRAINT `wishlists_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `wishlist_items` ADD CONSTRAINT `wishlist_items_wishlistId_fkey` FOREIGN KEY (`wishlistId`) REFERENCES `wishlists`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `wishlist_items` ADD CONSTRAINT `wishlist_items_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `products`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `reviews` ADD CONSTRAINT `reviews_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `products`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `reviews` ADD CONSTRAINT `reviews_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `blog_posts` ADD CONSTRAINT `blog_posts_authorId_fkey` FOREIGN KEY (`authorId`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `collection_products` ADD CONSTRAINT `collection_products_collectionId_fkey` FOREIGN KEY (`collectionId`) REFERENCES `collections`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `collection_products` ADD CONSTRAINT `collection_products_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `products`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- Seed Data for TeesIndia Production Database
SET FOREIGN_KEY_CHECKS = 0;

INSERT INTO users (id, name, email, passwordHash, role, createdAt, updatedAt) VALUES ('a308db94-605d-4485-8e4d-2f445e509d85', 'Admin', 'admin@teesindia.com', '$2a$12$LSGXo699JJRnsB0MIUJFPOemRWwwV42D3fmWLCI63JY2bgPauxA1u', 'ADMIN', '2026-09-24 15:00:32', '2026-09-24 15:00:32');
INSERT INTO categories (id, name, slug, description, createdAt) VALUES ('aa86ae5a-d0d9-4003-a28d-895ecf654803', 'Men', 'men', 'Men''s clothing collection', '2026-09-24 15:00:32');
INSERT INTO categories (id, name, slug, description, createdAt) VALUES ('bbeff045-c67e-41db-a0cd-1e91a092332a', 'Women', 'women', 'Women''s clothing collection', '2026-09-24 15:00:32');
INSERT INTO categories (id, name, slug, description, createdAt) VALUES ('8997cbe0-171d-4a89-9fc8-e5023a49a66a', 'Oversized', 'oversized', 'Oversized streetwear', '2026-09-24 15:00:32');
INSERT INTO categories (id, name, slug, description, createdAt) VALUES ('6f5f9871-3b09-408e-b4ce-e5f733738d31', 'Accessories', 'accessories', 'Fashion accessories', '2026-09-24 15:00:32');
INSERT INTO categories (id, name, slug, description, createdAt) VALUES ('278efea8-6c0b-480e-8df8-2cb955eeee88', 'Hoodies', 'hoodies', 'Premium hoodies', '2026-09-24 15:00:32');
INSERT INTO products (id, name, slug, description, price, comparePrice, categoryId, stock, isFeatured, isActive, tags, material, careInstr, createdAt, updatedAt) VALUES ('981d6da0-4e24-4b76-9e56-0ca8d91e151f', 'Classic Black Tee', 'classic-black-tee', 'Premium quality classic black tee crafted from 100% combed cotton. Designed for comfort and style. Made in India.', 599, 799, 'aa86ae5a-d0d9-4003-a28d-895ecf654803', 50, 1, 1, 'tshirt,premium,india,cotton', '100% Combed Cotton, 180 GSM', 'Machine wash cold with similar colors.
Do not bleach.
Tumble dry low.
Iron on low heat.
Do not dry clean.', '2026-09-24 15:00:32', '2026-09-24 15:00:32');
INSERT INTO product_variants (id, productId, size, stock) VALUES ('9edb158a-cab5-4bb2-90e0-4a950ea26994', '981d6da0-4e24-4b76-9e56-0ca8d91e151f', 'S', 10);
INSERT INTO product_variants (id, productId, size, stock) VALUES ('902e24f4-a295-444e-87c9-401e4f5ef4fe', '981d6da0-4e24-4b76-9e56-0ca8d91e151f', 'M', 16);
INSERT INTO product_variants (id, productId, size, stock) VALUES ('7ba39537-74cf-40a8-aa76-ffc559ff1581', '981d6da0-4e24-4b76-9e56-0ca8d91e151f', 'L', 16);
INSERT INTO product_variants (id, productId, size, stock) VALUES ('5085bbf8-e6ab-41f1-84c5-48a1f74bb6fb', '981d6da0-4e24-4b76-9e56-0ca8d91e151f', 'XL', 12);
INSERT INTO product_variants (id, productId, size, stock) VALUES ('0b526ead-974d-432a-a558-c89f47157342', '981d6da0-4e24-4b76-9e56-0ca8d91e151f', 'XXL', 6);
INSERT INTO products (id, name, slug, description, price, comparePrice, categoryId, stock, isFeatured, isActive, tags, material, careInstr, createdAt, updatedAt) VALUES ('bfd3f6f5-c824-4787-b907-e74627dbc991', 'Essential White Tee', 'essential-white-tee', 'Premium quality essential white tee crafted from 100% combed cotton. Designed for comfort and style. Made in India.', 599, 799, 'aa86ae5a-d0d9-4003-a28d-895ecf654803', 45, 1, 1, 'tshirt,premium,india,cotton', '100% Combed Cotton, 180 GSM', 'Machine wash cold with similar colors.
Do not bleach.
Tumble dry low.
Iron on low heat.
Do not dry clean.', '2026-09-24 15:00:32', '2026-09-24 15:00:32');
INSERT INTO product_variants (id, productId, size, stock) VALUES ('7919f2b3-02cc-4567-b809-3be3e5cc33c2', 'bfd3f6f5-c824-4787-b907-e74627dbc991', 'S', 9);
INSERT INTO product_variants (id, productId, size, stock) VALUES ('d199791b-d1b2-454e-b728-a086f7758622', 'bfd3f6f5-c824-4787-b907-e74627dbc991', 'M', 15);
INSERT INTO product_variants (id, productId, size, stock) VALUES ('0e4af27c-5774-4695-ab9e-3039258f9441', 'bfd3f6f5-c824-4787-b907-e74627dbc991', 'L', 15);
INSERT INTO product_variants (id, productId, size, stock) VALUES ('3a10e821-c1cb-4cfd-a59f-b658a1ea5b30', 'bfd3f6f5-c824-4787-b907-e74627dbc991', 'XL', 11);
INSERT INTO product_variants (id, productId, size, stock) VALUES ('f8be8a41-2c4c-412e-ae7a-c4ae0cd5891b', 'bfd3f6f5-c824-4787-b907-e74627dbc991', 'XXL', 5);
INSERT INTO products (id, name, slug, description, price, comparePrice, categoryId, stock, isFeatured, isActive, tags, material, careInstr, createdAt, updatedAt) VALUES ('b1c4aca7-8da0-40d6-9261-a748fe6e2ef9', 'Minimal Logo Tee', 'minimal-logo-tee', 'Premium quality minimal logo tee crafted from 100% combed cotton. Designed for comfort and style. Made in India.', 699, 999, 'aa86ae5a-d0d9-4003-a28d-895ecf654803', 30, 1, 1, 'tshirt,premium,india,cotton', '100% Combed Cotton, 180 GSM', 'Machine wash cold with similar colors.
Do not bleach.
Tumble dry low.
Iron on low heat.
Do not dry clean.', '2026-09-24 15:00:32', '2026-09-24 15:00:32');
INSERT INTO product_variants (id, productId, size, stock) VALUES ('6c0751b0-82bf-4ada-b217-ce1208d18a4a', 'b1c4aca7-8da0-40d6-9261-a748fe6e2ef9', 'S', 6);
INSERT INTO product_variants (id, productId, size, stock) VALUES ('2ea89e88-8582-4745-be68-bb1124f106f2', 'b1c4aca7-8da0-40d6-9261-a748fe6e2ef9', 'M', 10);
INSERT INTO product_variants (id, productId, size, stock) VALUES ('43e37438-6ee8-4178-a4ce-56e004609962', 'b1c4aca7-8da0-40d6-9261-a748fe6e2ef9', 'L', 10);
INSERT INTO product_variants (id, productId, size, stock) VALUES ('e452b622-d837-4fce-9520-6a382b140f87', 'b1c4aca7-8da0-40d6-9261-a748fe6e2ef9', 'XL', 7);
INSERT INTO product_variants (id, productId, size, stock) VALUES ('df5a5ce5-2014-4f50-a731-606095f78f49', 'b1c4aca7-8da0-40d6-9261-a748fe6e2ef9', 'XXL', 3);
INSERT INTO products (id, name, slug, description, price, comparePrice, categoryId, stock, isFeatured, isActive, tags, material, careInstr, createdAt, updatedAt) VALUES ('1664b2f0-db11-4ac6-a562-482109a4a53a', 'Drop Shoulder Oversized', 'drop-shoulder-oversized', 'Premium quality drop shoulder oversized crafted from 100% combed cotton. Designed for comfort and style. Made in India.', 899, 1299, '8997cbe0-171d-4a89-9fc8-e5023a49a66a', 25, 1, 1, 'tshirt,premium,india,cotton', '100% Combed Cotton, 180 GSM', 'Machine wash cold with similar colors.
Do not bleach.
Tumble dry low.
Iron on low heat.
Do not dry clean.', '2026-09-24 15:00:32', '2026-09-24 15:00:32');
INSERT INTO product_variants (id, productId, size, stock) VALUES ('e674cb2b-5454-48b3-bf4e-f038583a1a63', '1664b2f0-db11-4ac6-a562-482109a4a53a', 'S', 5);
INSERT INTO product_variants (id, productId, size, stock) VALUES ('f1ce80d1-b934-4ec3-9a57-e8ec98ead7eb', '1664b2f0-db11-4ac6-a562-482109a4a53a', 'M', 8);
INSERT INTO product_variants (id, productId, size, stock) VALUES ('608ccb7d-2a4b-431d-8be7-2e99a4310785', '1664b2f0-db11-4ac6-a562-482109a4a53a', 'L', 8);
INSERT INTO product_variants (id, productId, size, stock) VALUES ('4261a677-cec7-45e9-8d36-02a041513896', '1664b2f0-db11-4ac6-a562-482109a4a53a', 'XL', 6);
INSERT INTO product_variants (id, productId, size, stock) VALUES ('3205e389-c156-452c-a939-60c2cda2b5c3', '1664b2f0-db11-4ac6-a562-482109a4a53a', 'XXL', 3);
INSERT INTO products (id, name, slug, description, price, comparePrice, categoryId, stock, isFeatured, isActive, tags, material, careInstr, createdAt, updatedAt) VALUES ('6f5564ee-6b48-4f55-aab1-77391c87eb3d', 'Streetwear Hoodie Black', 'streetwear-hoodie-black', 'Premium quality streetwear hoodie black crafted from 100% combed cotton. Designed for comfort and style. Made in India.', 1499, 1999, '278efea8-6c0b-480e-8df8-2cb955eeee88', 20, 1, 1, 'tshirt,premium,india,cotton', '100% Combed Cotton, 180 GSM', 'Machine wash cold with similar colors.
Do not bleach.
Tumble dry low.
Iron on low heat.
Do not dry clean.', '2026-09-24 15:00:32', '2026-09-24 15:00:32');
INSERT INTO product_variants (id, productId, size, stock) VALUES ('b91d82cb-d297-4002-a72b-acf188744f4c', '6f5564ee-6b48-4f55-aab1-77391c87eb3d', 'S', 4);
INSERT INTO product_variants (id, productId, size, stock) VALUES ('ceae808f-1ffd-4aaa-a1ed-dbd9558d5a9d', '6f5564ee-6b48-4f55-aab1-77391c87eb3d', 'M', 6);
INSERT INTO product_variants (id, productId, size, stock) VALUES ('54cf6b6e-b669-46db-b29e-24e622e66819', '6f5564ee-6b48-4f55-aab1-77391c87eb3d', 'L', 6);
INSERT INTO product_variants (id, productId, size, stock) VALUES ('299abf7d-27bd-48e5-ae61-11c9182feeab', '6f5564ee-6b48-4f55-aab1-77391c87eb3d', 'XL', 5);
INSERT INTO product_variants (id, productId, size, stock) VALUES ('36a5a0bb-dfda-4268-8d14-e77158641a00', '6f5564ee-6b48-4f55-aab1-77391c87eb3d', 'XXL', 2);
INSERT INTO products (id, name, slug, description, price, comparePrice, categoryId, stock, isFeatured, isActive, tags, material, careInstr, createdAt, updatedAt) VALUES ('ccfa91e8-6473-44b8-86e6-71cc40dee8e3', 'Women Crop Tee', 'women-crop-tee', 'Premium quality women crop tee crafted from 100% combed cotton. Designed for comfort and style. Made in India.', 549, 749, 'bbeff045-c67e-41db-a0cd-1e91a092332a', 40, 1, 1, 'tshirt,premium,india,cotton', '100% Combed Cotton, 180 GSM', 'Machine wash cold with similar colors.
Do not bleach.
Tumble dry low.
Iron on low heat.
Do not dry clean.', '2026-09-24 15:00:32', '2026-09-24 15:00:32');
INSERT INTO product_variants (id, productId, size, stock) VALUES ('3b7d5e93-e030-4ecb-994d-9476eac1a01d', 'ccfa91e8-6473-44b8-86e6-71cc40dee8e3', 'S', 8);
INSERT INTO product_variants (id, productId, size, stock) VALUES ('cd0e9e60-eee2-4de1-8da5-0f9802313636', 'ccfa91e8-6473-44b8-86e6-71cc40dee8e3', 'M', 13);
INSERT INTO product_variants (id, productId, size, stock) VALUES ('78bdb7ad-e2f3-4160-b802-067b36029739', 'ccfa91e8-6473-44b8-86e6-71cc40dee8e3', 'L', 13);
INSERT INTO product_variants (id, productId, size, stock) VALUES ('ebda6f52-3d0b-4d4a-b145-c911df25c29f', 'ccfa91e8-6473-44b8-86e6-71cc40dee8e3', 'XL', 10);
INSERT INTO product_variants (id, productId, size, stock) VALUES ('bc49fccc-2ccb-41a9-8bf4-86926452d731', 'ccfa91e8-6473-44b8-86e6-71cc40dee8e3', 'XXL', 5);
INSERT INTO products (id, name, slug, description, price, comparePrice, categoryId, stock, isFeatured, isActive, tags, material, careInstr, createdAt, updatedAt) VALUES ('a0965516-ba80-46a1-98ac-8630b319a364', 'Graphic Print Tee', 'graphic-print-tee', 'Premium quality graphic print tee crafted from 100% combed cotton. Designed for comfort and style. Made in India.', 749, 999, 'aa86ae5a-d0d9-4003-a28d-895ecf654803', 35, 0, 1, 'tshirt,premium,india,cotton', '100% Combed Cotton, 180 GSM', 'Machine wash cold with similar colors.
Do not bleach.
Tumble dry low.
Iron on low heat.
Do not dry clean.', '2026-09-24 15:00:32', '2026-09-24 15:00:32');
INSERT INTO product_variants (id, productId, size, stock) VALUES ('bf2ae287-f817-4398-bd0a-64ba879454b0', 'a0965516-ba80-46a1-98ac-8630b319a364', 'S', 7);
INSERT INTO product_variants (id, productId, size, stock) VALUES ('1f372048-88aa-4969-9bfa-174178870019', 'a0965516-ba80-46a1-98ac-8630b319a364', 'M', 11);
INSERT INTO product_variants (id, productId, size, stock) VALUES ('12e5aa0d-3ca7-45e7-8e83-8fea37dc43a2', 'a0965516-ba80-46a1-98ac-8630b319a364', 'L', 11);
INSERT INTO product_variants (id, productId, size, stock) VALUES ('a3a0e2c2-4ef3-499e-91d8-009407ecc6af', 'a0965516-ba80-46a1-98ac-8630b319a364', 'XL', 8);
INSERT INTO product_variants (id, productId, size, stock) VALUES ('c74a184d-e917-4f75-b58f-c460ca10d26c', 'a0965516-ba80-46a1-98ac-8630b319a364', 'XXL', 4);
INSERT INTO products (id, name, slug, description, price, comparePrice, categoryId, stock, isFeatured, isActive, tags, material, careInstr, createdAt, updatedAt) VALUES ('2ae5ce1c-c045-4793-af3d-f8c653f50f71', 'Vintage Wash Tee', 'vintage-wash-tee', 'Premium quality vintage wash tee crafted from 100% combed cotton. Designed for comfort and style. Made in India.', 849, 1099, 'aa86ae5a-d0d9-4003-a28d-895ecf654803', 15, 0, 1, 'tshirt,premium,india,cotton', '100% Combed Cotton, 180 GSM', 'Machine wash cold with similar colors.
Do not bleach.
Tumble dry low.
Iron on low heat.
Do not dry clean.', '2026-09-24 15:00:32', '2026-09-24 15:00:32');
INSERT INTO product_variants (id, productId, size, stock) VALUES ('fc51a25c-de76-4e2f-8f79-d3fe1c3301fa', '2ae5ce1c-c045-4793-af3d-f8c653f50f71', 'S', 3);
INSERT INTO product_variants (id, productId, size, stock) VALUES ('f05dd414-a98c-48d6-bdd2-cbfa988d05f8', '2ae5ce1c-c045-4793-af3d-f8c653f50f71', 'M', 5);
INSERT INTO product_variants (id, productId, size, stock) VALUES ('a5883be7-9185-4157-9942-5c64d2766773', '2ae5ce1c-c045-4793-af3d-f8c653f50f71', 'L', 5);
INSERT INTO product_variants (id, productId, size, stock) VALUES ('0f4795fd-1b95-45d3-bf77-cd0a5f998f18', '2ae5ce1c-c045-4793-af3d-f8c653f50f71', 'XL', 3);
INSERT INTO product_variants (id, productId, size, stock) VALUES ('f53eb6cd-4e03-4f98-bf6b-43d4b971510a', '2ae5ce1c-c045-4793-af3d-f8c653f50f71', 'XXL', 1);
INSERT INTO blog_posts (id, title, slug, excerpt, content, authorId, isPublished, publishedAt, category, tags, createdAt, updatedAt) VALUES ('0942ae2d-256c-4428-b24e-08425be585ef', 'Why Quality Matters in Streetwear', 'why-quality-matters', 'At Teesindia, we believe every stitch tells a story. Here\'s why we obsess over quality.', '# Why Quality Matters

At Teesindia, quality isn''t just a word — it''s our promise.

## The Fabric Story
We source only the finest 100% combed cotton for our garments. Every piece goes through rigorous quality checks before reaching you.

## Our Process
1. Design with purpose
2. Source premium materials
3. Craft with care
4. Quality check at every step

## Why It Matters
Great clothes make you feel great. That''s why we never compromise.', 'a308db94-605d-4485-8e4d-2f445e509d85', 1, '2026-09-24 15:00:32', 'brand', 'quality,streetwear,india', '2026-09-24 15:00:32', '2026-09-24 15:00:32');

SET FOREIGN_KEY_CHECKS = 1;