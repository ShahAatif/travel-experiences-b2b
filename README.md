# Travel Experiences B2B

A production-ready B2B travel experiences platform built with Next.js 14, Prisma, Stripe, and Razorpay.

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Copy the environment file:
   ```bash
   cp .env.example .env
   ```

3. Set up the database:
   ```bash
   npx prisma migrate dev
   npx prisma db seed
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

5. Open http://localhost:3000

## Environment Variables

See `.env.example` for all required environment variables.

## Deployment

This application is ready for deployment on Vercel. Set all environment variables in your Vercel project dashboard.
