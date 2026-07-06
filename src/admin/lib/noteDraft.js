const DRAFT_KEY = 'admin-note-draft'

export function saveNoteDraft(draft) {
  sessionStorage.setItem(DRAFT_KEY, JSON.stringify(draft))
}

export function loadNoteDraft() {
  const raw = sessionStorage.getItem(DRAFT_KEY)
  if (!raw) return null

  try {
    return JSON.parse(raw)
  } catch {
    return null
  }
}

export function clearNoteDraft() {
  sessionStorage.removeItem(DRAFT_KEY)
}
