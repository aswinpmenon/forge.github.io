# FORGE

Fitness data, forged daily. A modern rebuild of the FORGE PWA in **Vite + Svelte 5 + Tailwind v4**, with an Apple-inspired **Liquid Glass** UI (frosted panels, drifting ambient light, San Francisco type, lime accent). Reuses the existing Supabase backend and Vercel AI endpoints.

## Stack

- **Vite 6** + **Svelte 5** (runes) + **Tailwind v4** (`@tailwindcss/vite`)
- **@supabase/supabase-js** — auth (Google OAuth) + Postgres
- **vite-plugin-pwa** — installable, offline shell

## Run

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # production build → dist/
npm run preview  # preview the build
```

## Config

Secrets live in `.env` (publishable keys, safe for the client):

```
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
VITE_FORGE_AI_API_URL=...      # photo → calories
VITE_FORGE_AI_COACH_URL=...    # health coach
```

## Structure

```
src/
  app.css                 design system (glass utilities, SF font, tokens)
  App.svelte              shell: auth gate, router, nav, check-in modal
  main.js
  lib/
    supabase.js           client + AI endpoints
    toast.js
    components/           AnimatedBg, Glass, Ring, Icon, BottomNav, Toast,
                          LineChart, BarChart, CheckinModal
    stores/               auth, router, data, social, ui
  screens/                Login, Dashboard, Food, Workout, Run, Social,
                          Progress, Database, About
```

## Deploy

### Vercel (recommended)
`vercel.json` is included. Import the repo in Vercel, add the four `VITE_*`
env vars (from `.env.example`), and deploy. SPA rewrites are configured.

### GitHub Pages
`.github/workflows/deploy.yml` builds and publishes `dist/` to Pages on push to
`main`. In the repo settings:
1. **Settings → Pages → Source: GitHub Actions.**
2. **Settings → Secrets and variables → Actions → Variables** — add
   `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_FORGE_AI_API_URL`,
   `VITE_FORGE_AI_COACH_URL` (publishable, safe as plain variables).
3. For a **project page** repo, also add variable `VITE_BASE=/<repo-name>/`.
   For a **user/org page** (e.g. `forge.github.io`) leave it unset (`/`).

### Supabase OAuth redirect (required for login in production)
In the Supabase dashboard → **Authentication → URL Configuration**, add your
deployed origin to **Redirect URLs** (and Site URL), e.g.
`https://<you>.github.io/` or `https://<app>.vercel.app/`. Google login uses
`window.location.origin + pathname` as the redirect.

## Supabase tables (unchanged from v5 schema)

`calorie_log`, `workout_log`, `run_log`, `routine_log`, `body_stats`,
`user_stats`, `friends`, `friend_requests`, `app_config`.

> **Note:** free-tier Supabase projects pause after ~7 days idle. If login/data
> stalls, restore the project from the Supabase dashboard (data is retained).
