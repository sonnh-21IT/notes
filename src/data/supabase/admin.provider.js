import { mapNoteRow, noteDetailSelect, noteListSelect } from '@/data/supabase/mapRows'
import { getSupabaseClient } from '@/data/supabase/client'

function noteToRow(note) {
  return {
    slug: note.slug,
    title: note.title,
    summary: note.summary ?? '',
    category_id: note.categoryId || null,
    published_at: note.publishedAt || new Date().toISOString().slice(0, 10),
    cover_image: note.coverImage || null,
    body: note.body ?? '',
    published: note.published ?? true,
    pinned: note.pinned ?? false,
  }
}

async function syncNoteTags(supabase, noteSlug, tagIds) {
  const { error: deleteError } = await supabase.from('note_tags').delete().eq('note_slug', noteSlug)
  if (deleteError) throw deleteError

  if (!tagIds.length) return

  const { error: insertError } = await supabase.from('note_tags').insert(
    tagIds.map((tagId) => ({ note_slug: noteSlug, tag_id: tagId })),
  )
  if (insertError) throw insertError
}

export async function adminGetSettings() {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase.from('settings').select('header, footer').eq('id', 1).maybeSingle()
  if (error) throw error
  return {
    header: data?.header ?? {},
    footer: data?.footer ?? {},
  }
}

export async function adminUpdateSettings({ header, footer }) {
  const supabase = getSupabaseClient()
  const { error } = await supabase.from('settings').upsert({ id: 1, header, footer })
  if (error) throw error
}

export async function adminListContent() {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase.from('content').select('slug, title').order('slug')
  if (error) throw error
  return data ?? []
}

export async function adminGetContent(slug) {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase.from('content').select('slug, title, body').eq('slug', slug).maybeSingle()
  if (error) throw error
  return data
}

export async function adminUpdateContentBody({ slug, body }) {
  const supabase = getSupabaseClient()
  const { error } = await supabase.from('content').update({ body }).eq('slug', slug)
  if (error) throw error
}

export async function adminListCategories() {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase
    .from('categories')
    .select('id, name')
    .order('name', { ascending: true })
  if (error) throw error
  return data ?? []
}

export async function adminUpsertCategory({ name }) {
  const supabase = getSupabaseClient()
  const trimmed = name.trim()
  const { data, error } = await supabase
    .from('categories')
    .upsert({ name: trimmed }, { onConflict: 'name' })
    .select('id, name')
    .single()
  if (error) throw error
  return data
}

export async function adminListTags() {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase.from('tags').select('id, name').order('name')
  if (error) throw error
  return data ?? []
}

export async function adminUpsertTag({ name }) {
  const supabase = getSupabaseClient()
  const trimmed = name.trim()
  const { data, error } = await supabase
    .from('tags')
    .upsert({ name: trimmed }, { onConflict: 'name' })
    .select('id, name')
    .single()
  if (error) throw error
  return data
}

export async function adminListNotes() {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase
    .from('notes')
    .select(noteListSelect)
    .order('published_at', { ascending: false, nullsFirst: false })
  if (error) throw error
  return (data ?? []).map((row) => ({
    ...mapNoteRow(row),
    published: row.published,
    pinned: row.pinned ?? false,
  }))
}

export async function adminGetNote(slug) {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase.from('notes').select(noteDetailSelect).eq('slug', slug).maybeSingle()
  if (error) throw error
  if (!data) return null
  return { ...mapNoteRow(data), published: data.published, pinned: data.pinned ?? false }
}

export async function adminUpsertNote(note) {
  const supabase = getSupabaseClient()

  const { error } = await supabase.from('notes').upsert(noteToRow(note))
  if (error) throw error

  await syncNoteTags(supabase, note.slug, [...new Set(note.tagIds ?? [])])
}

export async function adminUpdateNoteFlags({ slug, published, pinned }) {
  const supabase = getSupabaseClient()

  if (published === true) {
    const { data, error } = await supabase.from('notes').select('body').eq('slug', slug).maybeSingle()
    if (error) throw error
    if (!data?.body?.trim()) {
      throw new Error('Body is required to publish a note.')
    }
  }

  const patch = {}
  if (published !== undefined) patch.published = published
  if (pinned !== undefined) patch.pinned = pinned
  if (!Object.keys(patch).length) return

  const { error } = await supabase.from('notes').update(patch).eq('slug', slug)
  if (error) throw error
}

export async function adminDeleteNote(slug) {
  const supabase = getSupabaseClient()
  const { error } = await supabase.from('notes').delete().eq('slug', slug)
  if (error) throw error
}
