import { isSafeAssetUrl } from '@/utils/safeUrl'

const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/

export const SLUG_TAKEN_MESSAGE = 'This URL name is already taken.'

export function isValidNoteSlug(slug) {
  const trimmed = slug?.trim() ?? ''
  if (!trimmed) return false
  return SLUG_RE.test(trimmed)
}

function isValidCoverUrl(value) {
  return isSafeAssetUrl(value)
}

function isValidHttpUrl(value) {
  try {
    const url = new URL(value)
    return url.protocol === 'http:' || url.protocol === 'https:' || url.protocol === 'mailto:' || url.protocol === 'tel:'
  } catch {
    return false
  }
}

function isValidDateString(value) {
  if (!DATE_RE.test(value)) return false
  const date = new Date(`${value}T00:00:00`)
  return !Number.isNaN(date.getTime())
}

export function validateNoteFields({ slug, title, summary, body, coverImage, publishedAt }) {
  const errors = {}
  const trimmedSlug = slug?.trim() ?? ''

  if (!trimmedSlug) {
    errors.slug = 'URL name is required.'
  } else if (!isValidNoteSlug(trimmedSlug)) {
    errors.slug = 'Use lowercase letters, numbers, and hyphens only.'
  }

  if (!title?.trim()) {
    errors.title = 'Title is required.'
  }

  if (!summary?.trim()) {
    errors.summary = 'Summary is required.'
  }

  if (!body?.trim()) {
    errors.body = 'Article content is required.'
  }

  const cover = coverImage?.trim()
  if (cover && !isValidCoverUrl(cover)) {
    errors.coverImage = 'Cover image link is invalid.'
  }

  if (publishedAt && !isValidDateString(publishedAt)) {
    errors.publishedAt = 'Use a valid date (YYYY-MM-DD).'
  }

  return { valid: Object.keys(errors).length === 0, errors }
}

export function validateContentBody(body) {
  const errors = {}
  if (!body?.trim()) {
    errors.body = 'Page content can\'t be empty.'
  }
  return { valid: Object.keys(errors).length === 0, errors }
}

export function validateSettings({ headerTitle, socialLinks }) {
  const errors = {}

  if (!headerTitle?.trim()) {
    errors.headerTitle = 'Site title is required.'
  }

  socialLinks.forEach((link, index) => {
    const label = link.label?.trim()
    const url = link.url?.trim()
    const id = link.id?.trim()
    if (!label && !url && !id) return

    if ((label || url) && !label) {
      errors[`socialLinks.${index}.label`] = 'Label is required when URL is set.'
    }
    if ((label || url) && !url) {
      errors[`socialLinks.${index}.url`] = 'URL is required when label is set.'
    }
    if (url && !isValidHttpUrl(url)) {
      errors[`socialLinks.${index}.url`] = 'Enter a valid URL (https://…).'
    }
  })

  return { valid: Object.keys(errors).length === 0, errors }
}

export function fieldClassName(base, hasError) {
  if (!hasError) return base
  const invalidClass = base.includes('admin-textarea') ? 'admin-textarea--invalid' : 'admin-input--invalid'
  return `${base} ${invalidClass}`
}
