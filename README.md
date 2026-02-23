# Realtime Chat App

A production-ready realtime chat app built with Next.js App Router, TypeScript, Convex, Clerk, Tailwind CSS, and shadcn/ui.

## Features

- Clerk authentication with user profile sync to Convex.
- User list with live search.
- One-on-one realtime messaging.
- Message timestamps.
- Empty states across the UI.
- Responsive layout (mobile and desktop).
- Online/offline presence.
- Typing indicator.
- Unread message counts.
- Smart auto-scroll with new-message button.

## Tech Stack

- Next.js (App Router)
- TypeScript
- Convex (database + realtime)
- Clerk (authentication)
- Tailwind CSS
- shadcn/ui

## Project Structure

```
convex/           # Convex schema + functions
src/app/          # Next.js app routes and layouts
src/components/   # UI and feature components
src/lib/          # Utilities
```

## Prerequisites

- Node.js 18+ (recommended)
- A Clerk application
- Convex project

## Environment Variables

Create .env.local in the project root:

```
NEXT_PUBLIC_CONVEX_URL=
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/chat
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/chat
```

## Local Development

Install dependencies:

```
npm install
```

Start Convex (generates convex/_generated):

```
npx convex dev
```

Start Next.js:

```
npm run dev
```

Open http://localhost:3000

## Authentication Setup (Clerk)

1. Create a Clerk application.
2. Enable Email and Google sign-in (or your preferred providers).
3. Create a JWT template named "convex" in Clerk.
4. Add Clerk keys to .env.local.

## Convex Setup

1. Run `npx convex dev` locally to create the project and generate types.
2. For production, run `npx convex deploy` and set NEXT_PUBLIC_CONVEX_URL to the production URL.

## Deployment

Recommended: Vercel

Steps:

1. Push the repo to GitHub.
2. Import the repo into Vercel.
3. Set all environment variables in Vercel (use production Clerk keys).
4. Deploy.

## Notes

- Do not commit .env.local.
- Keep .next/, .convex/, and convex/_generated/ out of git.

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Lint the codebase
