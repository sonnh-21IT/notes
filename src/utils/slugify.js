function normalizeSlugChars(value) {
  return String(value ?? '')
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .toLowerCase()
    .replace(/[\s_]+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
}

export function slugify(value) {
  return normalizeSlugChars(value).trim().replace(/^-|-$/g, '')
}

export function sanitizeSlugInput(value) {
  return normalizeSlugChars(value).replace(/^-+/g, '')
}
