# Teesindia E-Commerce — Project Setup Guide

## Prerequisites
- Node.js v18+
- MySQL 8.0+
- npm

## Quick Start

### 1. Setup Backend

```bash
cd backend

# Copy env file and configure
copy .env.example .env
# Edit .env and set your MySQL credentials

# Install dependencies
npm install

# Generate Prisma client
npm run db:generate

# Run database migrations
npm run db:migrate

# Seed with sample data (optional)
npm run db:seed

# Start dev server
npm run dev
```

Backend runs at: http://localhost:5000

---

### 2. Setup Frontend

```bash
cd frontend

# Dependencies already installed via create-next-app
# Edit .env.local if needed

# Start dev server
npm run dev
```

Frontend runs at: http://localhost:3000

---

## Environment Variables

### Backend (`backend/.env`)
```env
DATABASE_URL="mysql://root:YOUR_PASSWORD@localhost:3306/teesindia"
JWT_SECRET="your-super-secret-key"
JWT_REFRESH_SECRET="your-refresh-secret-key"
PORT=5000
CLIENT_URL="http://localhost:3000"
RAZORPAY_KEY_ID="rzp_test_xxxxx"       # From razorpay.com dashboard
RAZORPAY_KEY_SECRET="your_secret"
```

### Frontend (`frontend/.env.local`)
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_xxxxx
```

---

## Database Setup (MySQL)

1. Create database:
```sql
CREATE DATABASE teesindia;
```

2. Run migrations:
```bash
cd backend && npm run db:migrate
```

3. Seed sample data:
```bash
cd backend && npm run db:seed
```

**Default Admin Login:**
- Email: `admin@teesindia.com`
- Password: `admin123`

---

## Razorpay Setup

1. Sign up at [razorpay.com](https://razorpay.com)
2. Go to Settings → API Keys → Generate Test Key
3. Add `Key ID` and `Key Secret` to `backend/.env`
4. Add `Key ID` to `frontend/.env.local` as `NEXT_PUBLIC_RAZORPAY_KEY_ID`

---

## Project Structure

```
teesindia/
├── backend/                 # Express API
│   ├── src/
│   │   ├── index.ts         # Entry point
│   │   ├── routes/          # API routes
│   │   ├── middlewares/     # Auth middleware
│   │   ├── lib/             # Prisma client
│   │   └── seed.ts          # DB seed data
│   └── prisma/
│       └── schema.prisma    # Database schema
│
└── frontend/                # Next.js App
    └── src/
        ├── app/             # Pages (App Router)
        │   ├── page.tsx     # Home
        │   ├── shop/        # Shop
        │   ├── product/     # Product Detail
        │   ├── checkout/    # Checkout
        │   ├── login/       # Auth
        │   ├── register/    # Auth
        │   ├── admin/       # Admin Dashboard
        │   └── order-success/
        ├── components/
        │   ├── layout/      # Navbar, Footer
        │   ├── cart/        # CartDrawer
        │   └── product/     # ProductCard
        └── lib/
            ├── api.ts       # Axios API client
            └── store.ts     # Zustand state
```

---

## Pages Overview

| Route | Description |
|-------|-------------|
| `/` | Home page (hero, collections, new arrivals) |
| `/shop` | All products with filters and sort |
| `/product/[slug]` | Product detail page |
| `/cart` | Cart (drawer) |
| `/checkout` | Checkout with address + payment |
| `/order-success` | Order confirmation |
| `/login` | Login |
| `/register` | Register |
| `/admin` | Admin dashboard |
| `/admin/products` | Product management |
| `/admin/orders` | Order management |

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14, TypeScript, CSS Modules |
| State | Zustand (persist) |
| HTTP | Axios (with token refresh) |
| Backend | Express.js, TypeScript |
| Database | MySQL via Prisma ORM |
| Auth | JWT (access + refresh tokens, HTTP-only cookies) |
| Payments | Razorpay + Cash on Delivery |
| Fonts | Space Grotesk + Inter (Google Fonts) |
