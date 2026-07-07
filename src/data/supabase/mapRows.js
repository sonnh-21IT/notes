export const noteListSelect = `
  slug, title, summary, published_at, cover_image, published, pinned, category_id,
  categories ( id, name ),
  note_tags ( tag_id, tags ( id, name ) )
`

export const noteDetailSelect = `
  slug, title, summary, published_at, cover_image, body, published, pinned, category_id,
  categories ( id, name ),
  note_tags ( tag_id, tags ( id, name ) )
`

export function mapNoteRow(row) {
  const tagLinks = row.note_tags ?? []
  const tagsFromJoin = tagLinks.map((link) => link.tags?.name).filter(Boolean)
  const tagIdsFromJoin = tagLinks.map((link) => link.tag_id ?? link.tags?.id).filter(Boolean)

  return {
    slug: row.slug,
    title: row.title,
    summary: row.summary ?? '',
    category: row.categories?.name ?? '',
    categoryId: row.category_id ?? row.categories?.id ?? null,
    tags: tagsFromJoin.length ? tagsFromJoin : (row.tags ?? []),
    tagIds: tagIdsFromJoin.length ? tagIdsFromJoin : (row.tagIds ?? []),
    publishedAt: row.published_at ?? null,
    coverImage: row.cover_image ?? null,
    pinned: row.pinned ?? false,
    body: row.body ?? '',
  }
}

export function mapPageRow(row) {
  return {
    slug: row.slug,
    title: row.title ?? '',
    body: row.body ?? '',
  }
}
