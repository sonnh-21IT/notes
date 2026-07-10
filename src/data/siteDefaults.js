/** Fallbacks when settings/content rows are missing or blank. */
export const SITE_DEFAULTS = {
  title: 'Portfolio',
  tagline: 'Notes on building for the web',
}

export function resolveSiteBrand(header = {}) {
  const title = header.title?.trim() || SITE_DEFAULTS.title
  const customTitle = Boolean(header.title?.trim())
  const tagline = header.tagline?.trim() || (customTitle ? '' : SITE_DEFAULTS.tagline)
  return { title, tagline }
}
