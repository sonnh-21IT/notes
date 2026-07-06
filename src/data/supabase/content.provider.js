import { getSupabaseClient } from '@/data/supabase/client'
import { withBodyMdx } from '@/content/mdx/compileMdx'
import { mapNoteRow, mapPageRow, noteDetailSelect, noteListSelect, sortNotesByCategory } from '@/data/supabase/mapRows'

export async function loadSupabaseSiteContent() {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase
    .from('settings')
    .select('header, footer')
    .eq('id', 1)
    .maybeSingle()

  if (error) throw error
  return {
    header: data?.header ?? {},
    footer: data?.footer ?? {},
  }
}

export async function loadSupabasePageContent(slug) {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase
    .from('content')
    .select('slug, body')
    .eq('slug', slug)
    .maybeSingle()

  if (error) throw error
  if (!data) return null

  return withBodyMdx(mapPageRow(data))
}

export async function loadSupabaseNotesPage({ page = 1, pageSize = 10, query = '', tagIds = [], categoryIds = [] } = {}) {
  const supabase = getSupabaseClient()
  const from = (page - 1) * pageSize
  const to = from + pageSize - 1
  const trimmedQuery = query.trim()
  const tagIdList = [...new Set(tagIds.filter(Boolean))]
  const categoryIdList = [...new Set(categoryIds.filter(Boolean))]

  let slugFilter = null
  if (tagIdList.length) {
    const { data: tagLinks, error: tagLinksError } = await supabase
      .from('note_tags')
      .select('note_slug')
      .in('tag_id', tagIdList)

    if (tagLinksError) throw tagLinksError

    slugFilter = [...new Set((tagLinks ?? []).map((link) => link.note_slug))]
    if (slugFilter.length === 0) {
      return { notes: [], total: 0, page, pageSize, pageCount: 0 }
    }
  }

  const select = `
    slug, title, summary, published_at, cover_image, published, category_id,
    categories ( id, name ),
    note_tags ( tag_id, tags ( id, name ) )
  `

  let builder = supabase
    .from('notes')
    .select(select, { count: 'exact' })
    .eq('published', true)

  if (slugFilter) {
    builder = builder.in('slug', slugFilter)
  }

  if (categoryIdList.length) {
    builder = builder.in('category_id', categoryIdList)
  }

  if (trimmedQuery) {
    const escaped = trimmedQuery.replace(/[%_\\]/g, '\\$&')
    const term = `%${escaped}%`
    builder = builder.or(`title.ilike.${term},summary.ilike.${term}`)
  }

  const { data, error, count } = await builder
    .order('published_at', { ascending: false, nullsFirst: false })
    .range(from, to)

  if (error) throw error

  const total = count ?? 0
  return {
    notes: (data ?? []).map(mapNoteRow),
    total,
    page,
    pageSize,
    pageCount: total === 0 ? 0 : Math.ceil(total / pageSize),
  }
}

export async function loadSupabaseTagsList() {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase.from('tags').select('id, name').order('name')
  if (error) throw error
  return data ?? []
}

export async function loadSupabaseCategoriesList() {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase.from('categories').select('id, name').order('name')
  if (error) throw error
  return data ?? []
}

export async function loadSupabaseNotesList() {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase
    .from('notes')
    .select(noteListSelect)
    .eq('published', true)
    .order('published_at', { ascending: false })

  if (error) throw error
  return sortNotesByCategory((data ?? []).map(mapNoteRow))
}

export async function loadSupabaseNoteBySlug(slug) {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase
    .from('notes')
    .select(noteDetailSelect)
    .eq('slug', slug)
    .eq('published', true)
    .maybeSingle()

  if (error) throw error
  if (!data) return null

  return withBodyMdx(mapNoteRow(data))
}
