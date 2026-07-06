import { isSupabaseConfigured } from '@/data/supabase/client'
import {
  loadSupabaseCategoriesList,
  loadSupabaseNoteBySlug,
  loadSupabaseNotesList,
  loadSupabaseNotesPage,
  loadSupabasePageContent,
  loadSupabaseSiteContent,
  loadSupabaseTagsList,
} from '@/data/supabase/content.provider'

function assertSupabaseReady() {
  if (!isSupabaseConfigured()) {
    throw new Error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY')
  }
}

export function loadSiteContent() {
  assertSupabaseReady()
  return loadSupabaseSiteContent()
}

export function loadPageContent(slug) {
  assertSupabaseReady()
  return loadSupabasePageContent(slug)
}

export function loadNotesList() {
  assertSupabaseReady()
  return loadSupabaseNotesList()
}

export function loadNotesPage(options) {
  assertSupabaseReady()
  return loadSupabaseNotesPage(options)
}

export function loadTagsList() {
  assertSupabaseReady()
  return loadSupabaseTagsList()
}

export function loadCategoriesList() {
  assertSupabaseReady()
  return loadSupabaseCategoriesList()
}

export function loadNoteBySlug(slug) {
  assertSupabaseReady()
  return loadSupabaseNoteBySlug(slug)
}
