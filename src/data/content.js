import { isSupabaseConfigured } from '@/data/supabase/client'
import {
  loadSupabaseCategoriesList,
  loadSupabaseNoteBySlug,
  loadSupabaseNotesPage,
  loadSupabasePinnedNotes,
  loadSupabasePageContent,
  loadSupabaseSiteContent,
  loadSupabaseTagsList,
} from '@/data/supabase/content.provider'
import { clearAsyncCache, withCache } from '@/utils/asyncCache'

export const PUBLIC_CACHE_KEYS = {
  site: 'site-content',
  tags: 'tags-list',
  categories: 'categories-list',
  page: (slug) => `page:${slug}`,
  note: (slug) => `note:${slug}`,
}

function assertSupabaseReady() {
  if (!isSupabaseConfigured()) {
    throw new Error('Site data isn\'t configured.')
  }
}

const siteContentInvalidators = new Set()

export function onSiteContentInvalidate(listener) {
  siteContentInvalidators.add(listener)
  return () => siteContentInvalidators.delete(listener)
}

export function invalidatePublicCache(...keys) {
  for (const key of keys) clearAsyncCache(key)
}

export function invalidateSiteContent() {
  invalidatePublicCache(PUBLIC_CACHE_KEYS.site)
  for (const listener of siteContentInvalidators) listener()
}

export function invalidateTagsList() {
  invalidatePublicCache(PUBLIC_CACHE_KEYS.tags)
}

export function invalidateCategoriesList() {
  invalidatePublicCache(PUBLIC_CACHE_KEYS.categories)
}

export function invalidatePageContent(slug) {
  if (slug) invalidatePublicCache(PUBLIC_CACHE_KEYS.page(slug))
}

export function invalidateNoteContent(slug) {
  if (slug) invalidatePublicCache(PUBLIC_CACHE_KEYS.note(slug))
}

const cachedSiteContent = withCache(
  () => loadSupabaseSiteContent(),
  () => PUBLIC_CACHE_KEYS.site,
)

const cachedTagsList = withCache(
  () => loadSupabaseTagsList(),
  () => PUBLIC_CACHE_KEYS.tags,
)

const cachedCategoriesList = withCache(
  () => loadSupabaseCategoriesList(),
  () => PUBLIC_CACHE_KEYS.categories,
)

const cachedPageContent = withCache(
  async (slug) => {
    const page = await loadSupabasePageContent(slug)
    const { withBodyMdx } = await import('@/mdx/compileMdx')
    return withBodyMdx(page)
  },
  (slug) => PUBLIC_CACHE_KEYS.page(slug),
)

const cachedNoteBySlug = withCache(
  async (slug) => {
    const note = await loadSupabaseNoteBySlug(slug)
    const { withBodyMdx } = await import('@/mdx/compileMdx')
    return withBodyMdx(note)
  },
  (slug) => PUBLIC_CACHE_KEYS.note(slug),
)

export function loadSiteContent() {
  assertSupabaseReady()
  return cachedSiteContent()
}

export function loadPageContent(slug) {
  assertSupabaseReady()
  return cachedPageContent(slug)
}

export function loadNotesPage(options) {
  assertSupabaseReady()
  return loadSupabaseNotesPage(options)
}

export function loadPinnedNotes(options) {
  assertSupabaseReady()
  return loadSupabasePinnedNotes(options)
}

export function loadTagsList() {
  assertSupabaseReady()
  return cachedTagsList()
}

export function loadCategoriesList() {
  assertSupabaseReady()
  return cachedCategoriesList()
}

export function loadNoteBySlug(slug) {
  assertSupabaseReady()
  return cachedNoteBySlug(slug)
}
