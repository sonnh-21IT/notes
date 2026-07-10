import { getSupabaseClient } from '@/data/supabase/client'

export const NOTE_COVERS_BUCKET = 'note-covers'
export const COVER_MAX_BYTES = 5 * 1024 * 1024
export const COVER_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
])

const EXT_BY_MIME = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif',
}

export function coverPathFromPublicUrl(url) {
  if (!url || typeof url !== 'string') return null
  const marker = `/object/public/${NOTE_COVERS_BUCKET}/`
  const index = url.indexOf(marker)
  if (index === -1) return null
  return decodeURIComponent(url.slice(index + marker.length).split('?')[0])
}

export function assertCoverFile(file) {
  if (!(file instanceof File)) {
    throw new Error('Choose an image file.')
  }
  if (!COVER_MIME_TYPES.has(file.type)) {
    throw new Error('Use a JPEG, PNG, WebP, or GIF image.')
  }
  if (file.size > COVER_MAX_BYTES) {
    throw new Error('Image must be 5MB or smaller.')
  }
}

function randomId() {
  return crypto.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
}

export async function adminUploadCoverImage(file) {
  assertCoverFile(file)

  const supabase = getSupabaseClient()
  const { data: { session } } = await supabase.auth.getSession()
  const userId = session?.user?.id
  if (!userId) throw new Error('Sign in to upload a cover image.')

  const ext = EXT_BY_MIME[file.type] || 'bin'
  const path = `${userId}/${Date.now()}-${randomId()}.${ext}`

  const { error } = await supabase.storage
    .from(NOTE_COVERS_BUCKET)
    .upload(path, file, {
      cacheControl: '3600',
      contentType: file.type,
      upsert: false,
    })

  if (error) throw error

  const { data } = supabase.storage.from(NOTE_COVERS_BUCKET).getPublicUrl(path)
  return data.publicUrl
}

export async function adminDeleteCoverImage(url) {
  const path = coverPathFromPublicUrl(url)
  if (!path) return false

  const supabase = getSupabaseClient()
  const { error } = await supabase.storage.from(NOTE_COVERS_BUCKET).remove([path])
  if (error) throw error
  return true
}
