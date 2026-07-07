# Portfolio

Personal profile site with a notes/blog section. React SPA backed by Supabase for content and admin.

## Stack

- **Frontend:** React 19, Vite, React Router
- **Content:** MDX (runtime compile via `@mdx-js/mdx`)
- **CMS:** Supabase (Postgres + Auth + RLS)
- **SEO:** `react-helmet-async` for per-page title and Open Graph meta

## Project layout

```
src/
├── app/              # App shell, router
├── pages/            # Public routes (about, notes, not-found)
├── admin/            # Admin UI (settings, static pages, notes CRUD)
├── mdx/              # MDX compile pipeline + article components
├── data/             # Public/admin data facades
│   └── supabase/     # Supabase query implementations
├── context/          # Auth + site settings providers
├── hooks/            # Shared data hooks
├── shared/           # Cross-page UI (e.g. notes filters)
├── ui/               # Shell components (header, PageMeta, …)
├── layouts/          # MainLayout
├── styles/           # CSS layers (foundation → shared → public → admin)
└── utils/
```

### Components (`ui` vs `shared` vs `mdx`)

| Folder | Put here when… | Examples |
|--------|----------------|----------|
| `ui/` | Site shell or generic UI used anywhere | `SiteHeader`, `PageLoading`, `PageMeta`, `ThemeToggle` |
| `shared/` | Domain UI imported by **2+ features** (public + admin) | `NotesFilterBar` |
| `mdx/` | MDX pipeline and article rendering | `MdxBody`, `CodeBlock`, `ArticleHeader` |
| `admin/components/` | Admin-only UI | `AdminField`, `AdminListItem` |

Matching CSS for `shared/` components lives in `styles/shared/` (not under `public/`).

### Data model

| Table | Purpose |
|-------|---------|
| `settings` | Site header/footer (title, tagline, social links) |
| `content` | Static MDX pages (`about`, `notes` intro, `not-found`) |
| `notes` | Blog/note articles with metadata (`pinned` for About highlights) |
| `categories`, `tags`, `note_tags` | Taxonomy for notes |

The `content` table is **static pages** in the database. The `src/mdx/` folder is the **MDX rendering layer** — different things, same word avoided in code paths.

## Setup

1. Copy `.env.example` → `.env` and fill Supabase keys.
2. Create your admin user in Supabase → **Authentication → Users → Add user**.
3. Copy that user's **UUID** and replace `00000000-0000-0000-0000-000000000000` in `supabase/schema.sql` (`is_site_owner()`).
4. Apply `supabase/schema.sql` in the Supabase SQL editor.
5. **Authentication → Providers** → disable public sign-up (only your account should exist).
6. Seed content (optional): `npm run sync:supabase` (requires `content/` folder + `SUPABASE_SERVICE_ROLE_KEY`).
7. `npm install && npm run dev`

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Dev server |
| `npm run build` | Production build (root path, e.g. custom domain) |
| `npm run build:pages` | Build for GitHub Pages (`/notes/` base) |
| `npm run preview:pages` | Preview GitHub Pages build locally |
| `npm run sync:supabase` | Push local `content/` files to Supabase |
| `npm run lint` | ESLint |
| `npm run test` | Unit tests (Vitest) |
| `npm run validate` | Lint + test + build (local CI check) |

## Code quality

- **Lint:** ESLint 10 flat config with React Hooks rules
- **Tests:** Vitest on pure logic (`validation`, `formDirty`, `slugify`) — no component harness
- **CI:** GitHub Actions runs lint + test before every Pages deploy
- **Patterns:** Data facades, editor hooks (`useAdmin*Editor`, `useAdminSettings`), lazy routes, route `errorElement`

Intentionally skipped (overkill for this size): full TypeScript, TanStack Query, react-hook-form, E2E.

### Memory (browser)

Typical tab usage: **~80–150 MB** production, **~150–250 MB** in Vite dev (React StrictMode doubles some work). Main costs: **Shiki** (syntax highlight, lazy-loaded per code block), **MDX runtime compile**, fonts.

Optimizations in place: lazy `CodeBlock`, Shiki loads only when a code block scrolls near viewport, language whitelist, separate `shiki` chunk.

## Admin

- `/admin/login` — Supabase email/password auth
- `/admin/settings` — Header, footer, social links
- `/admin/content` — Edit static MDX pages
- `/admin/notes` — Create/edit/publish notes

After saving settings, the public site refetches header/footer via cache invalidation (`invalidateSiteContent`).

## Security

Defense is **RLS in Supabase**, not the `/admin` UI (anyone can load the SPA).

| Layer | What it does |
|-------|----------------|
| **RLS `is_site_owner()`** | Only your Auth user UUID can insert/update/delete CMS data |
| **Public policies** | Anonymous read for published notes + site content |
| **Sign-up disabled** | No extra Auth users → no one else passes `is_site_owner()` |
| **`isSafeAssetUrl`** | MDX `<img>` and cover URLs limited to `http(s):` or `/…` paths |
| **Service role** | `SUPABASE_SERVICE_ROLE_KEY` only for local `sync:supabase` — never in `VITE_*` |

### Set owner UUID

In Supabase → **Authentication → Users**, copy your user's id, then in `supabase/schema.sql`:

```sql
select auth.uid() = 'paste-your-uuid-here'::uuid;
```

inside `is_site_owner()`. Re-run the function + owner policies if the DB already exists (see comments in `schema.sql`).

### Already deployed?

Run in SQL editor (replace UUID):

```sql
create or replace function public.is_site_owner()
returns boolean language sql stable security invoker set search_path = public
as $$ select auth.uid() = 'YOUR-UUID'::uuid; $$;
```

Then drop old `Admin *` policies and apply the `Owner *` policies from `schema.sql`.

## Public routes

| Path | Page |
|------|------|
| `/about` | Profile / intro (MDX from `content` table) |
| `/notes` | Notes index with search, filters, pagination |
| `/notes/:slug` | Single note article |

## Architecture notes

- **Hosting:** Static build on GitHub Pages (free). Supabase free tier for DB + auth — no app server.
- **Data facades:** `data/content.js` (read) and `data/admin.js` (write) hide Supabase details from UI.
- **Caching:** Site settings, tags, and categories are cached in-memory; admin mutations call `invalidate*` helpers.
- **Admin editors:** `useAdminContentEditor` and `useAdminNoteEditor` centralize form/preview/save logic.
- **Code splitting:** Routes are lazy-loaded; Shiki and MDX are separate chunks.

## Deploy to GitHub Pages

**Cost model:** GitHub Pages hosts the static SPA ($0). Supabase hosts data and admin auth (free tier). You only pay if you outgrow free limits.

### One-time setup

1. **GitHub repo** — this project (`sonnh-21IT/notes`) deploys to `https://sonnh-21IT.github.io/notes/`.

2. **Repository secrets** (Settings → Secrets and variables → Actions):
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`

3. **Enable Pages** (Settings → Pages → Build and deployment → Source: **GitHub Actions**).

4. **Supabase Auth URLs** (Authentication → URL Configuration):
   - Site URL: `https://sonnh-21IT.github.io/notes/`
   - Redirect URLs: `https://sonnh-21IT.github.io/notes/**`

5. Push to `main` — workflow `.github/workflows/deploy-pages.yml` builds and deploys.

### Local preview (same paths as production)

```bash
npm run build:pages
npm run preview:pages
```

Open `http://localhost:4173/notes/` (note the `/notes/` prefix).

### Custom domain or root user site

If you use a custom domain or rename the repo to `username.github.io`, set `VITE_BASE_PATH=/` in the workflow and `build:pages` script instead of `/notes/`.

### SPA routing

`build:pages` copies `index.html` → `404.html` so deep links (e.g. `/notes/some-slug`) work on GitHub Pages.
