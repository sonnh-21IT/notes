function Sk({ className = '' }) {
  return <span className={`sk ${className}`.trim()} aria-hidden="true" />
}

function SkeletonRoot({ as: Tag = 'div', className = '', children }) {
  return (
    <Tag className={className} role="status" aria-live="polite" aria-busy="true">
      <span className="visually-hidden">Loading</span>
      {children}
    </Tag>
  )
}

function NoteListRowSkeleton() {
  return (
    <li className="content-list-item">
      <div className="content-list-link content-list-link--skeleton">
        <Sk className="sk--list-title" />
        <Sk className="sk--list-meta" />
        <Sk className="sk--list-summary" />
      </div>
    </li>
  )
}

/** About MDX body only */
export function AboutPageSkeleton() {
  return (
    <SkeletonRoot className="prose page-skeleton-prose">
      <Sk className="sk--prose-h1" />
      <Sk className="sk--prose-line" />
      <Sk className="sk--prose-line" />
      <Sk className="sk--prose-line sk--prose-line-short" />
      <Sk className="sk--prose-h2" />
      <Sk className="sk--prose-line" />
      <Sk className="sk--prose-line sk--prose-line-short" />
    </SkeletonRoot>
  )
}

/** About pinned block — heading + list (independent of About MDX) */
export function AboutPinnedSkeleton({ rows = 3 }) {
  return (
    <SkeletonRoot className="content-section about-pinned-notes">
      <Sk className="sk--section-title" />
      <Sk className="sk--prose-line sk--prose-line-mid" />
      <ul className="content-list">
        {Array.from({ length: rows }, (_, index) => (
          <NoteListRowSkeleton key={index} />
        ))}
      </ul>
    </SkeletonRoot>
  )
}

/** Notes index intro MDX only */
export function NotesIntroSkeleton() {
  return (
    <SkeletonRoot className="prose page-skeleton-prose">
      <Sk className="sk--prose-h1" />
      <Sk className="sk--prose-line sk--prose-line-mid" />
      <Sk className="sk--prose-line sk--prose-line-short" />
    </SkeletonRoot>
  )
}

/** @deprecated use NotesIntroSkeleton — kept name for clarity at call sites */
export function NotesPageSkeleton() {
  return <NotesIntroSkeleton />
}

/** Single note — all primary content is from DB */
export function NotePageSkeleton() {
  return (
    <SkeletonRoot as="article" className="page-stack content note-page">
      <header className="article-header">
        <Sk className="sk--content-title" />
        <p className="article-meta">
          <Sk className="sk--meta-inline" />
          <span className="article-meta-tags">
            <Sk className="sk--chip" />
            <Sk className="sk--chip" />
          </span>
        </p>
        <div className="article-cover sk" aria-hidden="true" />
      </header>
      <div className="prose page-skeleton-prose">
        <Sk className="sk--prose-line" />
        <Sk className="sk--prose-line" />
        <Sk className="sk--prose-line sk--prose-line-short" />
        <Sk className="sk--prose-h2" />
        <Sk className="sk--prose-line" />
        <Sk className="sk--prose-line sk--prose-line-mid" />
      </div>
    </SkeletonRoot>
  )
}

/** Static MDX page body */
export function ContentPageSkeleton() {
  return (
    <SkeletonRoot className="prose page-skeleton-prose">
      <Sk className="sk--prose-h1" />
      <Sk className="sk--prose-line" />
      <Sk className="sk--prose-line sk--prose-line-short" />
    </SkeletonRoot>
  )
}

/** Notes index — search + filter chips (shown with list skeleton so chrome isn’t half-real) */
export function NotesControlsSkeleton() {
  return (
    <SkeletonRoot className="notes-list-controls">
      <div className="notes-toolbar">
        <div className="notes-search-wrap">
          <Sk className="sk--notes-search" />
        </div>
        <div className="notes-tag-filters" aria-hidden="true">
          <Sk className="sk--chip" />
          <Sk className="sk--chip" />
          <Sk className="sk--chip" />
        </div>
      </div>
    </SkeletonRoot>
  )
}

export function NotesListSkeleton({ rows = 4 }) {
  return (
    <SkeletonRoot as="ul" className="content-list">
      {Array.from({ length: rows }, (_, index) => (
        <NoteListRowSkeleton key={index} />
      ))}
    </SkeletonRoot>
  )
}

/** Notes index list section: controls + rows together */
export function NotesListSectionSkeleton({ rows = 4 }) {
  return (
    <>
      <NotesControlsSkeleton />
      <NotesListSkeleton rows={rows} />
    </>
  )
}

/** Admin notes — rows only (header/filters are static) */
export function AdminNotesListSkeleton() {
  return (
    <SkeletonRoot as="ul" className="admin-list">
      {Array.from({ length: 5 }, (_, index) => (
        <li key={index}>
          <div className="admin-list-row admin-list-row--skeleton">
            <div className="admin-list-body">
              <Sk className="sk--admin-row-title" />
              <Sk className="sk--admin-row-meta" />
            </div>
            <div className="admin-note-flags">
              <Sk className="sk--admin-flag" />
              <Sk className="sk--admin-flag" />
            </div>
          </div>
        </li>
      ))}
    </SkeletonRoot>
  )
}

/** Admin content — rows only */
export function AdminContentListSkeleton() {
  return (
    <SkeletonRoot as="ul" className="admin-list">
      {Array.from({ length: 3 }, (_, index) => (
        <li key={index}>
          <div className="admin-list-row admin-list-row--skeleton">
            <div className="admin-list-body">
              <Sk className="sk--admin-row-title" />
              <Sk className="sk--admin-row-meta" />
            </div>
          </div>
        </li>
      ))}
    </SkeletonRoot>
  )
}

/** Admin settings — field values only (page header + Save stay real) */
export function AdminSettingsSkeleton() {
  return (
    <SkeletonRoot>
      <div className="admin-settings-fields">
        <label className="admin-field">
          <span className="admin-label">Title</span>
          <Sk className="sk--admin-input" />
        </label>
        <label className="admin-field">
          <span className="admin-label">Tagline</span>
          <Sk className="sk--admin-input" />
        </label>
      </div>
      <div className="admin-settings-links">
        <div className="admin-field-toolbar">
          <span className="admin-label">Social links</span>
        </div>
        <div className="admin-stack admin-stack--sm">
          <Sk className="sk--admin-input" />
          <Sk className="sk--admin-input" />
        </div>
      </div>
    </SkeletonRoot>
  )
}

/** Admin note editor — field values only */
export function AdminNoteEditSkeleton() {
  return (
    <SkeletonRoot className="admin-form-body">
      <div className="admin-note-metadata">
        <div className="admin-note-meta">
          <label className="admin-field admin-field--full">
            <span className="admin-label">Title</span>
            <div className="admin-title-input-row">
              <Sk className="sk--admin-input sk--admin-input-grow" />
              <Sk className="sk--admin-flag" />
              <Sk className="sk--admin-flag" />
            </div>
          </label>
          <div className="admin-slug-category-row">
            <label className="admin-field admin-slug-field">
              <span className="admin-label">URL name</span>
              <Sk className="sk--admin-input" />
            </label>
            <label className="admin-field admin-category-field">
              <span className="admin-label">Category</span>
              <Sk className="sk--admin-input" />
            </label>
          </div>
        </div>
        <label className="admin-field admin-field--full">
          <span className="admin-label">Summary</span>
          <Sk className="sk--admin-textarea" />
        </label>
        <div className="admin-field admin-field--full">
          <span className="admin-label">Cover image</span>
          <Sk className="sk--admin-cover" />
        </div>
      </div>
      <label className="admin-field admin-note-body">
        <span className="admin-label">Article content</span>
        <Sk className="sk--admin-body" />
      </label>
    </SkeletonRoot>
  )
}

/** Admin content editor — body value only */
export function AdminContentEditSkeleton() {
  return (
    <SkeletonRoot className="admin-form-body">
      <label className="admin-field admin-field--full">
        <span className="admin-label">Article content</span>
        <Sk className="sk--admin-body" />
      </label>
    </SkeletonRoot>
  )
}
