# Portfolio

Personal profile site with a notes/blog section. React SPA backed by Supabase for content and admin.

## Stack

- **Frontend:** React 19, Vite, React Router
- **Content:** MDX (runtime compile via `@mdx-js/mdx`)
- **CMS:** Supabase (Postgres + Auth + Storage + RLS)
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
supabase/
└── schema.sql        # Tables, RLS, Storage bucket, content-admin policies
```

### Components (`ui` vs `shared` vs `mdx`)

| Folder | Put here when… | Examples |
|--------|----------------|----------|
| `ui/` | Site shell or generic UI used anywhere | `SiteHeader`, `PageLoading`, `PageMeta`, `ThemeToggle` |
| `shared/` | Domain UI imported by **2+ features** (public + admin) | `NotesFilterBar` |
| `mdx/` | MDX pipeline and article rendering | `MdxBody`, `CodeBlock`, `ArticleHeader` |
| `admin/components/` | Admin-only UI | `AdminField`, `AdminCoverImageField` |

Matching CSS for `shared/` components lives in `styles/shared/` (not under `public/`).

### Data model

| Table / bucket | Purpose |
|----------------|---------|
| `settings` | Site header/footer (title, tagline, social links) |
| `content` | Static MDX pages (`about`, `notes` intro, `not-found`) |
| `notes` | Blog/note articles (`pinned` for About highlights) |
| `categories`, `tags`, `note_tags` | Taxonomy for notes |
| Storage `note-covers` | Public cover images uploaded from admin |

The `content` table is **static pages** in the database. The `src/mdx/` folder is the **MDX rendering layer** — different things, same word avoided in code paths.

---

## Setup

### 1. Local environment

Requirements: **Node.js 20+**, npm.

```bash
cp .env.example .env
npm install
```

Fill `.env` (see [Environment variables](#environment-variables)):

| Variable | Required for | Where to get it |
|----------|--------------|-----------------|
| `VITE_SUPABASE_URL` | App + admin | Supabase → Project Settings → API → Project URL |
| `VITE_SUPABASE_ANON_KEY` | App + admin | Same page → `anon` `public` key |
| `SUPABASE_SERVICE_ROLE_KEY` | `npm run sync:supabase` only | Same page → `service_role` (secret) |
| `VITE_BASE_PATH` | GitHub Pages builds | Usually unset locally; CI sets `/notes/` |

Never put `SUPABASE_SERVICE_ROLE_KEY` in any `VITE_*` variable — it would ship to the browser.

```bash
npm run dev
```

Open the URL Vite prints (typically `http://localhost:5173`). Admin: `/admin/login`.

### 2. Supabase project

1. Create a project at [supabase.com](https://supabase.com).
2. Copy **Project URL** and **anon key** into `.env`.
3. Keep the **service_role** key only for local sync / dashboard — not in the SPA.

### 3. Content-admin Auth user (not the project owner)

Use a **dedicated** Auth user for `/admin` login. Do **not** reuse the email/password of your Supabase organization or project owner account.

Why: the CMS login only needs to write content tables + cover storage. The project owner account retains billing, SQL editor, and service-role access. If the CMS password leaks, an attacker still cannot open the Supabase dashboard or use the service role.

1. Supabase → **Authentication → Users → Add user**
2. Create with email + password (or magic link — this app uses email/password).
3. Open the user → copy **User UID** (UUID).
4. In `supabase/schema.sql`, replace **both** placeholders:

```sql
select auth.uid() = 'paste-content-admin-uuid-here'::uuid;
```

inside `is_content_admin()` (the function appears twice in the file — keep them identical).

### 4. Apply schema + Storage

In Supabase → **SQL Editor**, run `supabase/schema.sql`.

That creates:

- Tables + public read RLS
- `is_content_admin()` gated write policies
- Public Storage bucket `note-covers` (JPEG/PNG/WebP/GIF, max 5MB)

**Existing project** (tables already there): do **not** re-run the `drop table` block. Run from the comment `-- Upgrade existing DBs` to the end of the file (after pasting your UUID).

Confirm: **Storage** shows bucket `note-covers` (public).

### 5. Lock down Auth

**Authentication → Providers → Email:**

- Disable **public sign-up** / “Allow new users to sign up”
- Keep email+password enabled for your one content-admin user

**Authentication → URL Configuration** (for deployed site):

- Site URL: your production origin (e.g. `https://sonnh-21IT.github.io/notes/`)
- Redirect URLs: same origin with `/**`

For local login, also allow `http://localhost:5173/**` if Supabase rejects redirects.

### 6. Seed content (optional)

```bash
# .env must include SUPABASE_SERVICE_ROLE_KEY
npm run sync:supabase
```

Requires a local `content/` folder. Uses the service role (bypasses RLS) — local/CI only.

### 7. Smoke check

1. `npm run dev` → open `/admin/login` with the content-admin user
2. Edit a note, upload a cover image — should succeed
3. Sign out; public site still reads published notes with the anon key

### 8. Deploy to GitHub Pages (optional)

When local + Supabase work, follow **[Deploy to GitHub Pages](#deploy-to-github-pages)** below to publish the static SPA.

---

## Environment variables

See `.env.example`.

| Name | Client? | Purpose |
|------|---------|---------|
| `VITE_SUPABASE_URL` | Yes | Supabase API base URL |
| `VITE_SUPABASE_ANON_KEY` | Yes | Public anon key (RLS enforced) |
| `VITE_BASE_PATH` | Yes (build) | Vite `base` for GitHub Pages (`/notes/`) |
| `SUPABASE_SERVICE_ROLE_KEY` | **No** | Sync script only; never commit; never `VITE_` |

GitHub Actions needs repository secrets: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` (not the service role).

---

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

---

## Code quality

- **Lint:** ESLint 10 flat config with React Hooks rules
- **Tests:** Vitest on pure logic (`validation`, `formDirty`, `slugify`, cover helpers) — no component harness
- **CI:** GitHub Actions runs lint + test before every Pages deploy
- **Patterns:** Data facades, editor hooks (`useAdmin*Editor`, `useAdminSettings`), lazy routes, route `errorElement`

Intentionally skipped (overkill for this size): full TypeScript, TanStack Query, react-hook-form, E2E.

### Memory (browser)

Typical tab usage: **~80–150 MB** production, **~150–250 MB** in Vite dev (React StrictMode doubles some work). Main costs: **Shiki** (syntax highlight, lazy-loaded per code block), **MDX runtime compile**, fonts.

Optimizations in place: lazy `CodeBlock`, Shiki loads only when a code block scrolls near viewport, language whitelist, separate `shiki` chunk.

---

## Admin

- `/admin/login` — Supabase email/password (content-admin user only)
- `/admin/settings` — Header, footer, social links
- `/admin/content` — Edit static MDX pages
- `/admin/notes` — Create/edit/publish notes + cover upload

After saving settings, the public site refetches header/footer via cache invalidation (`invalidateSiteContent`).

---

## Security

Defense is **RLS in Supabase**, not the `/admin` UI (anyone can load the SPA).

| Layer | What it does |
|-------|----------------|
| **`is_content_admin()`** | Only the dedicated CMS Auth UUID can insert/update/delete CMS rows and cover objects |
| **Project owner ≠ CMS login** | Dashboard / billing / service role stay on a separate account |
| **Public policies** | Anonymous read for published notes + site content |
| **Sign-up disabled** | No extra Auth users → no one else passes `is_content_admin()` |
| **Storage `note-covers`** | Public read; upload/update/delete only for content admin |
| **`isSafeAssetUrl`** | MDX `<img>` and cover URLs limited to `http(s):` or `/…` paths |
| **Service role** | `SUPABASE_SERVICE_ROLE_KEY` only for local `sync:supabase` — never in `VITE_*` |

### What the content-admin account can and cannot do

**Can (via anon key + session):** manage `settings`, `content`, `notes`, tags/categories, upload/delete covers in `note-covers`.

**Cannot:** open Supabase dashboard, read `service_role`, change Auth users, alter schema, or bypass RLS. Those stay with the project owner / service role.

### Change content-admin UUID later

```sql
create or replace function public.is_content_admin()
returns boolean
language sql
stable
security invoker
set search_path = public
as $$
  select auth.uid() = 'YOUR-CONTENT-ADMIN-UUID'::uuid;
$$;

grant execute on function public.is_content_admin() to authenticated;
```

Or re-run the **Upgrade existing DBs** section at the bottom of `supabase/schema.sql`.

### Migrating from `is_site_owner()`

Older installs used `is_site_owner()`. The upgrade block drops that function (`cascade`) and installs `is_content_admin()` plus **Content admin** policies. Paste your CMS user UUID before running.

---

## Public routes

| Path | Page |
|------|------|
| `/about` | Profile / intro (MDX from `content` table) |
| `/notes` | Notes index with search, filters, pagination |
| `/notes/:slug` | Single note article |

---

## Architecture notes

- **Hosting:** Static build on GitHub Pages (free). Supabase free tier for DB + auth + storage — no app server.
- **Data facades:** `data/content.js` (read) and `data/admin.js` (write) hide Supabase details from UI.
- **Caching:** Site settings, tags, and categories are cached in-memory; admin mutations call `invalidate*` helpers.
- **Admin editors:** `useAdminContentEditor` and `useAdminNoteEditor` centralize form/preview/save logic.
- **Code splitting:** Routes are lazy-loaded; Shiki and MDX are separate chunks.

---

## Deploy to GitHub Pages

**Cost model:** GitHub Pages hosts the static SPA ($0). Supabase hosts data, auth, and cover storage (free tier). No app server.

This repo is set up as a **project site**: URL shape `https://<user>.github.io/<repo>/` (example: `https://sonnh-21IT.github.io/notes/`). The Vite base path is `/notes/` in CI — change it if your repo name differs (see below).

Workflow: `.github/workflows/deploy-pages.yml` — on every push to `main` (and manual **workflow_dispatch**): `npm ci` → lint → test → `build:pages` → upload Pages artifact → deploy.

### Prerequisites

- Local setup and Supabase schema already working ([Setup](#setup))
- Repo pushed to GitHub
- Content-admin user can log in locally

### Step-by-step

1. **Confirm the public URL**

   | Repo type | Example URL | `VITE_BASE_PATH` |
   |-----------|-------------|------------------|
   | Project site (default here) | `https://USER.github.io/REPO/` | `/REPO/` (e.g. `/notes/`) |
   | User site `USER.github.io` | `https://USER.github.io/` | `/` |
   | Custom domain | `https://example.com/` | `/` |

   If the repo is **not** named `notes`, update `VITE_BASE_PATH` in:
   - `.github/workflows/deploy-pages.yml` (build `env`)
   - `package.json` scripts `build:pages` / `preview:pages` (optional, for local preview)

2. **Add repository secrets**

   GitHub → repo → **Settings → Secrets and variables → Actions → New repository secret**:

   | Secret | Value |
   |--------|--------|
   | `VITE_SUPABASE_URL` | Same as local `.env` |
   | `VITE_SUPABASE_ANON_KEY` | Same as local `.env` (anon key only) |

   Do **not** add `SUPABASE_SERVICE_ROLE_KEY` to GitHub Actions for this workflow.

3. **Enable GitHub Pages**

   **Settings → Pages → Build and deployment:**

   - Source: **GitHub Actions** (not “Deploy from a branch”)

4. **Configure Supabase Auth for production**

   Supabase → **Authentication → URL Configuration**:

   | Field | Example (project site) |
   |-------|------------------------|
   | Site URL | `https://sonnh-21IT.github.io/notes/` |
   | Redirect URLs | `https://sonnh-21IT.github.io/notes/**` |

   Keep a local entry if you still develop against the same project, e.g. `http://localhost:5173/**`.

5. **Deploy**

   - Push to `main`, or
   - **Actions → Deploy to GitHub Pages → Run workflow**

   Wait for the green check. Site URL appears on the workflow summary / Pages settings.

6. **Verify production**

   - Open `https://USER.github.io/REPO/` — public notes load
   - Open `…/admin/login` — content-admin can sign in and save
   - Deep link a note (`…/notes/some-slug`) — SPA fallback via `404.html` works
   - Cover images from Storage still load (public bucket)

### Local preview (same paths as production)

```bash
npm run build:pages
npm run preview:pages
```

Open `http://localhost:4173/notes/` (match your `VITE_BASE_PATH`).

### Custom domain or root user site

1. Set `VITE_BASE_PATH=/` in the workflow build `env` (and in `build:pages` if you use it locally).
2. Point DNS / GitHub Pages custom domain as usual.
3. Update Supabase Site URL + Redirect URLs to that origin.

### SPA routing on Pages

`build:pages` copies `index.html` → `404.html` so client-side routes (e.g. `/notes/some-slug`, `/admin/notes`) work when GitHub Pages would otherwise 404.

### Troubleshooting

| Symptom | Likely fix |
|---------|------------|
| Blank page / assets 404 | Wrong `VITE_BASE_PATH` (must match repo name, with leading and trailing `/`) |
| Build fails: missing env | Secrets `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` not set |
| Login works locally, fails on Pages | Supabase Site URL / Redirect URLs missing the Pages origin |
| Deep links 404 | Confirm `404.html` is in the deploy artifact; Source must be GitHub Actions |
| Pages not updating | Check Actions run on `main`; concurrency group `pages` may still be deploying |