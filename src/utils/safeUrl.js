export function isSafeAssetUrl(value) {
  if (!value || typeof value !== 'string') return false
  if (value.startsWith('/')) return true

  try {
    const url = new URL(value)
    return url.protocol === 'http:' || url.protocol === 'https:'
  } catch {
    return false
  }
}
