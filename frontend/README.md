# Inventory SaaS — Frontend

Next.js (App Router) skeleton for task **0.7**: design tokens, auth pages
(signup / login / invite-accept), wired to a stub API so the pages work
before task 0.5 (real signup/login/JWT API) lands.

## Run it

```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:3000.

## Connecting to the real API

Copy `.env.example` to `.env.local` and set `NEXT_PUBLIC_API_URL` to
Elissa's API once it's deployed (task 0.4/0.5). Until then,
`src/lib/api.ts` returns fake success responses so you can build and test
every screen on its own.

## Design tokens

All colors, spacing and radii are CSS variables in
`src/app/globals.css`, wired into Tailwind via `tailwind.config.ts`.
Change a value once there and it updates everywhere.

## Structure

```
src/
  app/
    layout.tsx          root layout, loads globals.css + font
    page.tsx             redirects to /login
    login/page.tsx
    signup/page.tsx
    invite-accept/page.tsx
  components/
    AuthCard.tsx          shared card shell used by all three auth pages
  lib/
    api.ts                stub/real API client (signup, login, acceptInvite)
```
