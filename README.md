# Scaffold React

Reusable Next.js + React scaffold for new frontend projects.

## Stack

- Next.js App Router
- React 19
- TypeScript
- Tailwind CSS 4
- shadcn/ui
- React Query
- Zustand

## Setup

```bash
cp .env.example .env.local
pnpm install --frozen-lockfile
pnpm dev
```

## Quick Start

- Frontend: `pnpm dev`

## Run

- App: `http://localhost:3000`

## Included

- Marketing home
- Login page
- Protected dashboard
- Example items page
- Theme toggle and toast setup
- Full-screen authentication loading overlay with animated loader and `加载中...` label

## Checks

```bash
pnpm exec tsc --noEmit
pnpm lint
pnpm build
```
