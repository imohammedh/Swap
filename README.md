# Swap

Swap is a marketplace + social discovery app .

 ![Swap showcase](./showCaseIMage/OG-Image.svg)


Users can:
- Browse and search listings without signing in
- Swipe like/dislike on listings (sign-in required)
- Create listings with up to 5 images
- Send offers to sellers
- Chat in real-time style conversations between buyer and seller
- Manage account/profile, listings, favorites, offers, messages, and notifications

The app is built with Next.js + Convex + Convex Auth, and uses shadcn UI components.

## Tech Stack

- Frontend: Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS v4
- UI: shadcn-style components in `components/ui`, Lucide icons
- Backend: Convex (database, queries, mutations, file storage)
- Auth: Convex Auth with:
  - GitHub OAuth
  - Email/password with verification code (OTP)
- Email provider: Resend (verification email delivery)

## Core Features

- Public browsing
  - Home browse view with categories and featured listings
  - Search route with advanced filters (location, price, payment type, condition)
  - Product details route with image gallery and thumbnail navigation
- Swipe mode
  - Tinder-style listing deck
  - Like/dislike persisted in `swipes`
  - Owner notifications created for likes/dislikes
- Listing onboarding
  - Multi-step form (`/onboarding/listing`)
  - Egypt city dropdown
  - Multi-file image upload (max 5)
- Offers
  - Buyer creates offer from listing page
  - Seller sees received offers in account area
- Messaging
  - Start conversation from listing
  - Send/receive messages
  - Conversation unread tracking
- Account area
  - Profile editing (name, phone, profile image upload)
  - My listings, favorites, offers, messages, settings

## Routes

Main routes:
- `/` home (browse + swap views)
- `/search` results with advanced filtering
- `/products/[id]` listing details page (dynamic slug route)
- `/signin` auth page
- `/onboarding/listing` create listing flow

Account routes:
- `/account`
- `/account/my-listings`
- `/account/favorites`
- `/account/offers`
- `/account/messages`
- `/account/settings`
- `/account/blog`

Note:
- There is no static `/products` page. Use `/products/[slug]`.

## Data Model (Convex)

Defined in `convex/schema.ts`.

Tables:
- `users` (from Convex Auth tables)
- `listings`
- `swipes`
- `offers`
- `notifications`
- `conversations`
- `messages`

Important listing fields:
- `slug`, `title`, `categoryId`, `priceEgp`, `location`
- `images[]`, `summary`, `description`
- `paymentType`, `condition`
- `likeCount`, `dislikeCount`, `isPublished`

## Backend API Overview

- `convex/listings.ts`
  - `listPublic`, `listMine`, `listFavorites`, `getBySlug`, `create`, `swipe`
- `convex/offers.ts`
  - `create`, `listReceived`, `updateStatus`
- `convex/messages.ts`
  - `startConversation`, `listMine`, `getMessages`, `sendMessage`, `markConversationRead`
- `convex/notifications.ts`
  - `listMine`, `markAllRead`
- `convex/users.ts`
  - `me`, `updateProfile`
- `convex/files.ts`
  - `generateUploadUrl`

## Authentication

Configured in `convex/auth.ts`.

Providers:
- GitHub OAuth
- Password auth with email verification code

Email verification:
- 6-digit code generated server-side
- Sent via Resend API
- Code expiry: 10 minutes

## Environment Variables

Copy `.env.example` to `.env.local` and fill values:

- `CONVEX_DEPLOY_KEY` (for production/preview deploys)
- `AUTH_GITHUB_ID`
- `AUTH_GITHUB_SECRET`
- `AUTH_RESEND_KEY`
- `AUTH_EMAIL_FROM`

`next.config.ts` already allows remote images from Unsplash and Convex storage hosts.

## Getting Started

1. Install dependencies
```bash
npm install
```

2. Add env vars
```bash
cp .env.example .env.local
```
Then edit `.env.local`.

3. Start development
```bash
npm run dev
```

This runs both:
- Next frontend
- Convex backend

## NPM Scripts

- `npm run dev` - run frontend + backend in parallel
- `npm run dev:frontend` - Next.js dev server
- `npm run dev:backend` - Convex dev server
- `npm run predev` - Convex warmup/setup workflow + dashboard
- `npm run build` - production build
- `npm run start` - run production server
- `npm run lint` - ESLint

## Project Structure

- `app/` Next.js routes and pages
- `components/` shared UI and layout components
- `components/ui/` shadcn-style primitives
- `convex/` backend queries/mutations/auth/schema
- `lib/` categories, Egypt cities, helpers
- `public/` static assets

## Troubleshooting

- Next dev lock error (`.next/dev/lock`)
  - Another Next instance is running. Stop old process and restart.

- `next/image` host not configured
  - Add host to `next.config.ts > images.remotePatterns`.

- Auth email sends but no sign-in
  - Confirm `AUTH_RESEND_KEY` and `AUTH_EMAIL_FROM` are valid.
  - Make sure provider config in `convex/auth.ts` matches your flow.

- TypeScript/Convex errors after schema changes
  - Restart Convex dev and regenerate types if needed:
```bash
npx convex dev
```

## Current Product Behavior Notes

- Guests can browse/search freely.
- Sign-in is required for:
  - Swiping like/dislike
  - Creating listings
  - Sending offers/messages
- Swiping your own listing is ignored safely (no crash).
- Listing image upload supports up to 5 files.

## License

Private project.
