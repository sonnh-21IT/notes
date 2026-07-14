import { isSupabaseConfigured } from '@/data/supabase/client'
import * as provider from '@/data/supabase/admin.provider'
import * as coverImage from '@/data/supabase/coverImage'

function assertSupabaseReady() {
  if (!isSupabaseConfigured()) {
    throw new Error('Admin isn\'t configured yet.')
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
export const deleteTag = guard(provider.adminDeleteTag)
export const deleteCategory = guard(provider.adminDeleteCategory)
export const listNotes = guard(provider.adminListNotes)
export const getNote = guard(provider.adminGetNote)
export const upsertNote = guard(provider.adminUpsertNote)
export const updateNoteFlags = guard(provider.adminUpdateNoteFlags)
export const isContentAdmin = guard(provider.adminIsContentAdmin)
export const getAuthUserId = guard(provider.adminGetAuthUserId)
export const deleteNote = guard(provider.adminDeleteNote)
export const uploadCoverImage = guard(coverImage.adminUploadCoverImage)
export const deleteCoverImage = guard(coverImage.adminDeleteCoverImage)
