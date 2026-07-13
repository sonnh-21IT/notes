import { noteDirtySnapshot } from '@/admin/lib/formDirty'
import { todayIsoDate } from '@/utils/dates'
import { slugify } from '@/utils/slugify'

export function findTagByName(tags, name) {
  const normalized = name.trim().toLowerCase()
  if (!normalized) return null
  return tags.find((tag) => tag.name.toLowerCase() === normalized) ?? null
}

export function snapshotFromFields(fields) {
  return noteDirtySnapshot(fields)
}

export function emptyNoteFormFields() {
  return {
    slug: '',
    title: '',
    summary: '',
    categoryId: '',
    selectedTagIds: [],
    publishedAt: todayIsoDate(),
    coverImage: '',
    published: true,
    pinned: false,
    body: '',
  }
}

export function draftToFields(draft) {
  return {
    slug: draft.slug ?? '',
    title: draft.title ?? '',
    summary: draft.summary ?? '',
    categoryId: draft.categoryId != null ? String(draft.categoryId) : '',
    selectedTagIds: draft.tagIds ?? [],
    publishedAt: draft.publishedAt || todayIsoDate(),
    coverImage: draft.coverImage ?? '',
    published: draft.published ?? true,
    pinned: draft.pinned ?? false,
    body: draft.body ?? '',
  }
}

export function noteToFields(note) {
  return {
    slug: note.slug,
    title: note.title,
    summary: note.summary,
    categoryId: note.categoryId != null ? String(note.categoryId) : '',
    selectedTagIds: note.tagIds ?? [],
    publishedAt: note.publishedAt || todayIsoDate(),
    coverImage: note.coverImage ?? '',
    published: note.published ?? true,
    pinned: note.pinned ?? false,
    body: note.body ?? '',
  }
}

export function readInitialNoteFields(routeSlug, locationState) {
  if (routeSlug !== 'new') return emptyNoteFormFields()

  const draft = locationState?.draft
  if (draft?.editSlug === routeSlug) return draftToFields(draft)

  return emptyNoteFormFields()
}

export function readInitialSlugManual(routeSlug, locationState) {
  if (routeSlug !== 'new') return false

  const draft = locationState?.draft
  if (draft?.editSlug !== routeSlug) return false

  const draftSlug = (draft.slug ?? '').trim()
  return Boolean(draftSlug && draftSlug !== slugify(draft.title ?? ''))
}

export function buildNotePayload({
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
    summary,
    categoryId: categoryId ? Number(categoryId) : null,
    tagIds: selectedTagIds,
    publishedAt: publishedAt || todayIsoDate(),
    coverImage: coverImage.trim() || null,
    published,
    pinned,
    body,
  }
}
