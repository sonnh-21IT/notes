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
  body,
  todayIsoDate,
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
    body: body ?? '',
  }
}
