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
import { withBodyMdx } from '@/mdx/compileMdx'
import { clearAsyncCache, withCache } from '@/utils/asyncCache'

export const PUBLIC_CACHE_KEYS = {
  site: 'site-content',
  tags: 'tags-list',
  categories: 'categories-list',
}

function assertSupabaseReady() {
  if (!isSupabaseConfigured()) {
    throw new Error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY')
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

export function loadSiteContent() {
  assertSupabaseReady()
  return cachedSiteContent()
}

export async function loadPageContent(slug) {
  assertSupabaseReady()
  const page = await loadSupabasePageContent(slug)
  return withBodyMdx(page)
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

export async function loadNoteBySlug(slug) {
  assertSupabaseReady()
  const note = await loadSupabaseNoteBySlug(slug)
  return withBodyMdx(note)
}
