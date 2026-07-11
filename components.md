# MDX components

Components available in About / Notes / static `content` bodies (and admin MDX preview).

**Do not `import` them in MDX.** They are registered in `src/mdx/mdxComponents.jsx` and injected at compile time.

YAML frontmatter and `import … from "fumadocs-ui/…"` lines are stripped automatically (`prepareMdxSource`). Standalone markdown `---` / `***` / `___` lines in the body are also stripped (they used to become noisy `<hr>`). Need a real rule → use `<hr />`.

Styles live next to each component under `src/styles/public/mdx/`.

Full paste-ready demo (includes nested combos): [components.sample.mdx](components.sample.mdx).


## Quick reference

| Component | Purpose |
|-----------|---------|
| `Callout` | Aside with left border (`info` / `warn` / `danger` / `success`) |
| `Banner` | Short notice, same visual language as Callout |
| `Badge` / `Badges` | Pill tags (like note tags, no icon) |
| `Card` / `Cards` | 2-column skill / topic grid |
| `Step` / `Steps` | Numbered process (continuous rail) |
| `Tab` / `Tabs` | Tabbed panels |
| `Accordion` / `Accordions` | Expand / collapse sections |
| `File` / `Folder` / `Files` | File tree |
| `Figure` | Image + caption (16:9, click to zoom) |
| `Frame` | Bordered media wrapper (16:9) |
| `Video` | Local / hosted video file (16:9) |
| `YouTube` | YouTube embed (16:9) |
| `Tweet` | X / Twitter embed |
| `Kbd` | Keyboard key |
| `Button` | CTA link |
| `Column` / `Columns` | Two-column prose layout |
| `Terminal` | Shell / command session block |
| `Output` | Command stdout / log dump |
| `Endpoint` | HTTP method + path (+ optional Swagger-lite sections) |
| `Params` / `RequestBody` / `Responses` / `Response` | Sections inside a detailed `Endpoint` |
| `Field` / `Fields` | API / schema field list |
| `Option` | CLI flag docs |
| `Timeline` / `TimelineItem` | Chronological events |
| `Compare` / `CompareItem` | Before / after (or A / B) |
| `Window` | macOS-style chrome around media (16:9) |
| `Repo` | Repository / project link card |

Markdown still works as usual: headings, lists, tables, GFM, fenced code (Shiki), images, links, task lists.


## Callout

Left hairline border. No automatic “Note” label — only show a title if you pass `title`.

| Prop | Type | Default | Notes |
|------|------|---------|-------|
| `type` | `info` \| `warn` \| `warning` \| `danger` \| `error` \| `success` | `info` | Changes border color |
| `title` | string | — | Optional heading |
| `children` | MDX | — | Body |

```mdx
<Callout type="info">
Website này không phải CV online — đây là nơi ghi lại những gì mình học.
</Callout>

<Callout type="warn" title="Production">
Đừng deploy vào giờ cao điểm nếu chưa có rollback.
</Callout>
```


## Banner

Same idea as Callout (left border, no fill). Use for short one-liners.

| Prop | Type | Default |
|------|------|---------|
| `type` | `info` \| `warn` \| `danger` \| `success` | `info` |
| `children` | MDX | — |

```mdx
<Banner>Deploy xong nhớ check monitoring.</Banner>
```


## Badge / Badges

Looks like note tags (accent fill, pill). No icons.

| Prop | Type | Notes |
|------|------|-------|
| `color` | `green` \| `red` \| `yellow` \| `blue` \| `success` \| `danger` \| `warning` \| `info` | Optional tone |
| `children` | **plain text only** | No nested JSX / markdown |

Consecutive `<Badge>…</Badge>` blocks (separated only by whitespace) are auto-wrapped in `<Badges>` so they sit on one flex row (`.prose` is a CSS grid).

```mdx
<Badge>Kubernetes</Badge>
<Badge>Linux</Badge>
<Badge color="green">Ready</Badge>

<!-- or explicit -->
<Badges>
  <Badge>Observability</Badge>
  <Badge>Networking</Badge>
</Badges>
```

**Important:** Badge body must be plain text (`[^<]*`). Nested tags break auto-wrap and can corrupt the MDX tree. Prefer explicit `<Badges>` when unsure.


## Card / Cards

Reading-first grid: uppercase title label. Desktop: 2 columns (stacks to 1 column when nested inside `Column`).

| Prop (`Card`) | Type | Notes |
|---------------|------|-------|
| `title` | string | Section label |
| `description` | string | Optional short line |
| `href` | string | Makes **only the title** a link (`/` or `http(s)`); body stays normal text |
| `children` | MDX | Usually a list |

```mdx
<Cards>
  <Card title="Backend">

  - REST API
  - FastAPI

  </Card>
  <Card title="Notes" description="Write-ups" href="/notes">

  - Postgres
  - Storage

  </Card>
</Cards>
```


## Step / Steps

Numbered process with a **continuous** vertical rail and accent circles.

Prefer markdown headings inside `<Steps>`:

```mdx
<Steps>

### Idea

Clarify the problem and split into shippable parts.

### Backend

API, data model, sync / async workflows.

### Production

Logs, tracing, monitoring.

</Steps>
```

Or explicit steps:

```mdx
<Steps>
  <Step title="Clone">
  git clone …
  </Step>
  <Step title="Run">
  npm run dev
  </Step>
</Steps>
```

| Prop (`Step`) | Type | Notes |
|---------------|------|-------|
| `title` | string | Renders as `h3` if set |
| `children` | MDX | Body under the title |

You can nest Callout / Badge / Files / Option inside a step. Keep step bodies reasonably short so the rail stays readable.


## Tab / Tabs

Each `<Tab>` needs a `title` (tab label). Direct children of `<Tabs>` should be `<Tab>` only (no loose prose between tabs).

````mdx
<Tabs>
  <Tab title="npm">

  ```bash
  npm install
  ```

  </Tab>
  <Tab title="pnpm">

  ```bash
  pnpm install
  ```

  </Tab>
</Tabs>
````

| Prop (`Tab`) | Type | Notes |
|--------------|------|-------|
| `title` | string | Shown in the tab bar |
| `children` | MDX | Panel body |


## Accordion / Accordions

Native `<details>` — no extra JS beyond open state.

| Prop (`Accordion`) | Type | Default |
|--------------------|------|---------|
| `title` | string | — (required for usable UI) |
| `defaultOpen` | boolean | `false` |
| `children` | MDX | — |

```mdx
<Accordions>
  <Accordion title="Why MDX?">
  Markdown for prose, JSX when you need structure.
  </Accordion>
  <Accordion title="Where is content stored?" defaultOpen>
  Supabase `content` / `notes` tables.
  </Accordion>
</Accordions>
```


## File / Folder / Files

File tree for docs.

| Prop | Type | Default | Notes |
|------|------|---------|-------|
| `Files` `label` | string | `Files` | `aria-label` |
| `Folder` `name` | string | — | Folder label |
| `Folder` `defaultOpen` | boolean | `true` | — |
| `File` `name` | string | — | File label |
| `File` `href` | string | — | Optional link (`/` or `http(s)`) |

Folders toggle open/closed. Files hover like folders; with `href` they navigate.

```mdx
<Files>
  <Folder name="src">
    <Folder name="mdx">
      <File name="compileMdx.js" />
      <File name="mdxComponents.jsx" href="/notes" />
    </Folder>
    <File name="main.jsx" />
  </Folder>
  <File name="package.json" />
</Files>
```


## Figure

Safe image URLs only: `http(s):` or site-relative `/…`. Media pane is **16:9** (`object-fit: cover`). Click opens a zoom lightbox (`+` / `−` / scroll / `Esc`).

| Prop | Type | Notes |
|------|------|-------|
| `src` | string | Required |
| `alt` | string | — |
| `caption` | string | Or use `children` as caption |
| `title` | string | `img` title attribute |

```mdx
<Figure
  src="/images/arch.png"
  alt="Architecture"
  caption="Luồng xử lý chính"
/>
```


## Frame

Wrap media / markdown image with a hairline border + optional caption. Inner image is **16:9**; markdown images also get the lightbox.

```mdx
<Frame caption="Screenshot">

![Dashboard](/images/dash.png)

</Frame>
```


## Video

File-based `<video>` (not YouTube). Same URL rules as Figure. Frame is **16:9**.

| Prop | Type | Default |
|------|------|---------|
| `src` | string | — |
| `poster` | string | — |
| `title` | string | Used as caption fallback |
| `caption` | string | — |
| `controls` | boolean | `true` |

```mdx
<Video src="/media/demo.mp4" poster="/media/demo.jpg" caption="Walkthrough" />
```


## YouTube

| Prop | Type | Notes |
|------|------|-------|
| `id` | string | Video id |
| `url` | string | Full watch / share URL (parsed if `id` missing) |
| `title` | string | Caption + iframe title |

```mdx
<YouTube id="dQw4w9WgXcQ" title="Demo" />
<YouTube url="https://www.youtube.com/watch?v=dQw4w9WgXcQ" />
```


## Tweet

Embeds can be blocked by network / X policies — treat as best-effort in preview.

| Prop | Type | Notes |
|------|------|-------|
| `id` | string | Tweet id |
| `url` | string | Status URL |
| `title` | string | iframe title |

```mdx
<Tweet id="1234567890" />
```


## Kbd

```mdx
Nhấn <Kbd>Ctrl</Kbd> + <Kbd>K</Kbd> để mở command palette.
```


## Button

Filled primary / outline secondary. Internal paths use React Router; external open in a new tab.

| Prop | Type | Default |
|------|------|---------|
| `href` | string | Required |
| `variant` | `primary` \| `secondary` | `primary` |
| `children` | text | Label |

```mdx
<Button href="/notes">Xem notes</Button>
<Button href="https://github.com/you" variant="secondary">GitHub</Button>
```


## Column / Columns

Two columns from `640px` up; stacked on small screens. Hairline rules between columns. Nested `Cards` / `Compare` stack to one column inside a `Column` (avoids sparse 2×2 grids).

```mdx
<Columns>
  <Column>

  ### Pros

  - Fast to ship

  </Column>
  <Column>

  ### Cons

  - More moving parts

  </Column>
</Columns>
```


## Terminal

Shell session chrome. Put a fenced code block (or plain text) inside.

| Prop | Type | Default |
|------|------|---------|
| `title` | string | `Terminal` |
| `children` | MDX | Usually a `bash` / `sh` code block |

````mdx
<Terminal title="shell">

```bash
curl -s https://api.example.com/health
```

</Terminal>
````


## Output

Muted dump for stdout / logs (no prompt chrome).

| Prop | Type | Default |
|------|------|---------|
| `title` | string | `Output` |
| `children` | MDX | Text or code block |

````mdx
<Output>

```text
{"status":"ok","uptime":12840}
```

</Output>
````


## Endpoint

HTTP API surface. Compact (method + path) or Swagger-lite with `summary` + nested sections.

Method badges use Swagger-like colors (`GET` / `POST` / `PUT` / `PATCH` / `DELETE` / `HEAD` / `OPTIONS`).

| Prop | Type | Default |
|------|------|---------|
| `method` | string | `GET` |
| `path` | string | — |
| `summary` | string | Shown on the bar when collapsed |
| `defaultOpen` | boolean | `false` |
| `children` | MDX | Description and/or `Params` / `RequestBody` / `Responses` |

When `children` is set, the operation is collapsible (click the bar). Path-only endpoints stay static.

Nested (no import):

| Component | Notes |
|-----------|-------|
| `Params` | Wraps `Field` rows (use `type` as `path` / `query` / `header` / `cookie`) |
| `RequestBody` | Optional `type` content-type; body can hold `Fields` + examples |
| `Responses` | Wraps `Response` rows |
| `Response` | `status`, optional `description`, optional children (example) |

```mdx
<Endpoint method="GET" path="/v1/notes/:slug" />

<Endpoint method="POST" path="/v1/notes" summary="Create a draft note">

Create a note. Body is JSON.

<Params>
  <Field name="Authorization" type="header" required>Bearer token</Field>
  <Field name="dry_run" type="query">If true, do not write.</Field>
</Params>

<RequestBody type="application/json">
  <Fields>
    <Field name="title" type="string" required>Title.</Field>
    <Field name="body" type="string" required>MDX source.</Field>
  </Fields>
</RequestBody>

<Responses>
  <Response status="201" description="Created" />
  <Response status="400" description="Validation error">

  ```json
  { "error": "invalid_slug" }
  ```

  </Response>
</Responses>

</Endpoint>
```


## Field / Fields

Document request/response / config keys. Often used alone or inside `Params` / `RequestBody`.

| Prop (`Field`) | Type | Default |
|----------------|------|---------|
| `name` | string | — |
| `type` | string | — |
| `required` | boolean | `false` |
| `children` | MDX | Description |

```mdx
<Fields>
  <Field name="slug" type="string" required>
  URL segment. Lowercase kebab-case.
  </Field>
  <Field name="published" type="boolean">
  When true, visible on the public site.
  </Field>
</Fields>
```


## Option

CLI flag docs.

| Prop | Type | Notes |
|------|------|-------|
| `flag` | string | e.g. `--port` |
| `type` | string | e.g. `number` |
| `children` | MDX | Description |

```mdx
<Option flag="--port" type="number">
Listen port. Default `5173`.
</Option>
```


## Timeline / TimelineItem

Changelog-style chronology.

| Prop (`TimelineItem`) | Type | Notes |
|-----------------------|------|-------|
| `date` | string | Shown as `<time>` |
| `title` | string | Event title |
| `children` | MDX | Details |

```mdx
<Timeline>
  <TimelineItem date="2024-03" title="First deploy">
  Single VPS + Caddy.
  </TimelineItem>
  <TimelineItem date="2025-01" title="Moved notes to Supabase">
  Auth + RLS for the admin CMS.
  </TimelineItem>
</Timeline>
```


## Compare / CompareItem

Before/after or A/B panels (2 columns on desktop; 1 column when nested in `Column`).

| Prop (`CompareItem`) | Type | Default |
|----------------------|------|---------|
| `label` | string | `Side` |
| `children` | MDX | — |

```mdx
<Compare>
  <CompareItem label="Before">

  Monolith cron jobs.

  </CompareItem>
  <CompareItem label="After">

  Queue + workers.

  </CompareItem>
</Compare>
```


## Window

macOS-style chrome (traffic lights + centered title) around a screenshot / figure. Body is **16:9**; images support lightbox zoom.

| Prop | Type | Default |
|------|------|---------|
| `title` | string | `Window` |
| `children` | MDX | Usually an image |

```mdx
<Window title="kubectl get pods">

![Pods](/images/pods.png)

</Window>
```


## Repo

Link card for a repo or internal project page.

| Prop | Type | Notes |
|------|------|-------|
| `href` | string | Required (`/` or `http(s)`) |
| `title` | string | Defaults to `href` |
| `description` | string | Or use `children` |

```mdx
<Repo
  href="https://github.com/you/portfolio"
  title="you/portfolio"
  description="This site — React + Supabase CMS"
/>
```


## Important notes (avoid breakage)

1. **No imports** — paste tags directly. Fumadocs-style `import { … } from "…"` lines are stripped; they are never required here.
2. **Unknown tags fail compile** — only names in the quick reference (and plain HTML/markdown) are valid. A typo like `<CallOut>` throws “Couldn't render this page”.
3. **Close every JSX tag** — unclosed `<Callout>` / `<Tabs>` / `<Endpoint>` is the most common preview error.
4. **Blank lines inside JSX are OK** — MDX switches to markdown for lists, paragraphs, and fenced code inside components. Keep a blank line before a markdown list or ` ``` ` fence.
5. **Fenced code inside JSX** — prefer 4-backtick outer fences in docs, or ensure inner ` ```lang ` blocks are complete. Nested fences that share the same fence length break parsing.
6. **Badges are text-only** — do not put links/components inside `<Badge>`. Consecutive badges must be separated by whitespace only for auto-wrap; otherwise wrap with `<Badges>` yourself.
7. **URLs are filtered** — `Figure` / `Video` / `Frame` images / `Repo` / `Button` / `File` `href` only allow `/…` or `http(s):`. `javascript:` and `data:` are dropped (component may render nothing).
8. **Standalone `---` in the body is removed** — use headings or `<hr />` if you need a break. Table separators `| --- | --- |` are fine.
9. **Parent/child pairs** — use `Tabs`→`Tab`, `Cards`→`Card`, `Files`→`Folder`/`File`, `Columns`→`Column`, `Compare`→`CompareItem`, `Timeline`→`TimelineItem`, `Accordions`→`Accordion`, `Endpoint` sections only inside that `Endpoint`.
10. **`Card` + `href`** — only the title is clickable. Hovering body text (lists) must not highlight the title; that is intentional.
11. **Media aspect** — `Figure` / `Frame` / `Video` / `Window` use **16:9** cover crop. Pick images that survive cropping, or accept letterboxing via crop center.
12. **Lightbox** — click images (Figure + markdown images in Frame/Window/prose). Video uses native controls, not the lightbox.
13. **Tweet / YouTube** — embeds depend on network and third-party availability; empty or blocked embeds are possible in some environments.
14. **Admin preview = public compile** — same `prepareMdxSource` + registry. If preview fails, the public page will fail the same way.
15. **Paste from sample carefully** — if the CMS body still has old `---` section dividers, re-paste from current [components.sample.mdx](components.sample.mdx) (or rely on strip, then refresh).


## Combining components

Nesting is supported and encouraged for tech notes, but keep hierarchy shallow.

**What usually works well**

- `Tabs` panels that each contain `Terminal` / `Output` / `Callout` / a small `Steps` block
- `Steps` bodies with `Badge`, `Callout`, `Files`, or `Option`
- `Endpoint` (Swagger-lite) with `Params` / `RequestBody` / `Responses`, optionally inside an `Accordion`
- `Columns` with simple prose, `Cards`, or `Compare` (nested grids auto-stack)
- `Window` / `Frame` / `Figure` beside a `Files` tree (keep trees short)
- `TimelineItem` with a short Callout, checklist, or one media block
- `Terminal` + `Output` as a pair (command then result)

**What to avoid**

- Deep stacks (e.g. Tabs → Accordion → Steps → Columns → Cards → Endpoint) — hard to scan, easy to break JSX
- Putting structural parents in the wrong place (`Tab` outside `Tabs`, `Field` as a page-level orphan when you meant `Params` inside `Endpoint` is OK, but `Response` outside `Responses` is not)
- Wide `Cards` grids inside a narrow `Column` without expecting them to stack
- Huge media + long trees in one viewport — prefer Accordion sections
- Multiple consecutive `---` “section dividers” between demos (stripped anyway; prefer headings)

**Authoring habit:** write the outer shell first (`Tabs` / `Steps` / `Endpoint`), save/preview, then fill children. For full nested demos see [components.sample.mdx](components.sample.mdx) section **Combinations** — treat that file as a visual checklist, not as copy-paste for production About pages.


## Authoring checklist

1. No `import` lines
2. Every JSX tag closed; parents match children
3. Assets use `/…` or `https://…`
4. Badge labels are plain text
5. Preview in admin before publish
6. Prefer one job per section (heading + short support + one primary component)


## Code map

| Concern | Path |
|---------|------|
| Registry | `src/mdx/mdxComponents.jsx` |
| Compile + preprocess | `src/mdx/compileMdx.js`, `src/mdx/prepareMdxSource.js` |
| React components | `src/mdx/components/` |
| Styles | `src/styles/public/mdx/` |
| Render shell | `src/mdx/MdxBody.jsx` |
| Gallery sample | `components.sample.mdx` |
