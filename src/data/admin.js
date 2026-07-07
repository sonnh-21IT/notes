import { isSupabaseConfigured } from '@/data/supabase/client'
import * as provider from '@/data/supabase/admin.provider'

function assertSupabaseReady() {
  if (!isSupabaseConfigured()) {
    throw new Error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY')
  }
}

function guard(fn) {
  return (...args) => {
    assertSupabaseReady()
    return fn(...args)
  }
}

export const getSettings = guard(provider.adminGetSettings)
export const updateSettings = guard(provider.adminUpdateSettings)
export const listContent = guard(provider.adminListContent)
export const getContent = guard(provider.adminGetContent)
export const updateContentBody = guard(provider.adminUpdateContentBody)
export const listCategories = guard(provider.adminListCategories)
export const upsertCategory = guard(provider.adminUpsertCategory)
export const listTags = guard(provider.adminListTags)
export const upsertTag = guard(provider.adminUpsertTag)
export const listNotes = guard(provider.adminListNotes)
export const getNote = guard(provider.adminGetNote)
export const upsertNote = guard(provider.adminUpsertNote)
export const updateNoteFlags = guard(provider.adminUpdateNoteFlags)
export const deleteNote = guard(provider.adminDeleteNote)
