# Subperonline (Suburban Toppers CRM)

Phase 1: UI shell with realistic mock data.
Phase 2: CRM functionality (data, persistence, auth) — TBD.

## Stack

- Next.js 16 (App Router) + TypeScript
- Tailwind CSS v4 (`@theme` block in `src/app/globals.css`)
- Lucide React (icons)
- Recharts (area + donut charts)
- TanStack Table v8 (data tables)
- Space Grotesk (display) + Inter (UI), via `next/font/google`

## Develop

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## Project structure

```
src/
  app/                  # Next.js App Router
    layout.tsx          # Root layout (fonts, metadata)
    page.tsx            # Redirects to /dashboard
    globals.css         # Design tokens (@theme) + base styles
    dashboard/          # Dashboard page
    clients/            # Clients list + [id] record
    leads/              # Leads & Outreach
    stock/              # Stock (3 tabs)
    schedule/           # Schedule (dual-location calendar)
    reports/            # Reports index + [type] sub-pages
    maintenance/        # Maintenance index + [section] sub-pages
  components/
    ui/                 # Bespoke design-system primitives
    layout/             # App shell, sidebar
    charts/             # Recharts wrappers
  lib/
    utils.ts            # cn(), formatters
    mock-data.ts        # Hardcoded placeholder data
```

## Design reference

The full visual spec is in `/DESIGN.md` at the repo root (or in the chat
where it was shared). The `@theme` block in `globals.css` is the single
source of truth for all design tokens.
