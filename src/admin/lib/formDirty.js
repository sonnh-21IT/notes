import { todayIsoDate } from '@/utils/dates'

export function contentPageSnapshot({ body }) {
  return { body: body ?? '' }
}

export function snapshotEquals(left, right) {
  return JSON.stringify(left) === JSON.stringify(right)
}

export function settingsSnapshot({ headerTitle, headerTagline, socialLinks }) {
  return {
    headerTitle: headerTitle ?? '',
    headerTagline: headerTagline ?? '',
    socialLinks: (socialLinks ?? [])
      .map((link) => ({
        id: link.id ?? '',
        label: link.label ?? '',
        url: link.url ?? '',
      }))
      .filter((link) => link.id || link.label || link.url),
  }
}

export function noteSnapshot({
  slug,
  title,
  summary,
  categoryId,
  selectedTagIds,
  publishedAt,
  coverImage,
  published,
  pinned,
  body,
}) {
  return {
    slug: slug.trim(),
    title: title.trim(),
    summary: summary ?? '',
    categoryId: categoryId ? Number(categoryId) : null,
    tagIds: [...selectedTagIds].sort((a, b) => a - b),
    publishedAt: publishedAt || todayIsoDate(),
    coverImage: coverImage.trim() || null,
    published: published ?? true,
    pinned: pinned ?? false,
    body: body ?? '',
  }
}

export function noteDirtySnapshot(fields) {
  const snapshot = noteSnapshot(fields)
  return Object.fromEntries(
    Object.entries(snapshot).filter(([key]) => key !== 'published' && key !== 'pinned'),
  )
}

export function noteHasUserContent({
  slug,
  title,
  summary,
  categoryId,
  selectedTagIds,
  coverImage,
  body,
}) {
  return Boolean(
    slug?.trim()
    || title?.trim()
    || summary?.trim()
    || body?.trim()
    || categoryId
    || (selectedTagIds?.length ?? 0) > 0
    || coverImage?.trim(),
  )
}
