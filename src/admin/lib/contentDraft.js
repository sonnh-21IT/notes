const DRAFT_KEY = 'admin-content-draft'

export function saveContentDraft(draft) {
  sessionStorage.setItem(DRAFT_KEY, JSON.stringify(draft))
}

export function loadContentDraft() {
  const raw = sessionStorage.getItem(DRAFT_KEY)
  if (!raw) return null

  try {
    return JSON.parse(raw)
  } catch {
    return null
  }
}

export function clearContentDraft() {
  sessionStorage.removeItem(DRAFT_KEY)
}

const pageClassBySlug = {
  about: 'about-page',
  notes: 'notes-page',
}

export function contentPreviewClassName(slug) {
  const pageClass = pageClassBySlug[slug] ?? ''
  return ['page-stack', 'content', pageClass, 'admin-preview-article'].filter(Boolean).join(' ')
}
