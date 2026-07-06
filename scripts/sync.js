import { createClient } from '@supabase/supabase-js'
import { existsSync, readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const contentRoot = join(root, 'content')

function loadEnvFile(path) {
  if (!existsSync(path)) return

  for (const line of readFileSync(path, 'utf8').split('\n')) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue

    const separator = trimmed.indexOf('=')
    if (separator === -1) continue

    const key = trimmed.slice(0, separator).trim()
    let value = trimmed.slice(separator + 1).trim()

    if (
      (value.startsWith('"') && value.endsWith('"'))
      || (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1)
    }

    if (!(key in process.env)) {
      process.env[key] = value
    }
  }
}

loadEnvFile(join(root, '.env'))

function readText(path) {
  return readFileSync(join(contentRoot, path), 'utf8')
}

function readJson(path) {
  return JSON.parse(readFileSync(join(contentRoot, path), 'utf8'))
}

const url = process.env.VITE_SUPABASE_URL
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!url || !serviceKey) {
  const missing = [
    !url && 'VITE_SUPABASE_URL',
    !serviceKey && 'SUPABASE_SERVICE_ROLE_KEY',
  ].filter(Boolean)

  console.error(`Missing in .env: ${missing.join(', ')}`)
  console.error('Copy .env.example → .env and fill Supabase URL + service role key.')
  process.exit(1)
}

const supabase = createClient(url, serviceKey)

const siteContent = readJson('site.json')
const categories = readJson('categories.json')
const tags = readJson('tags.json')
const notesIndex = readJson('notes-index.json')
const aboutMeta = readJson('about.json')
const notesMeta = readJson('notes.json')
const notFoundMeta = readJson('not-found.json')

async function upsertAll() {
  const { error: settingsError } = await supabase
    .from('settings')
    .upsert({
      id: 1,
      header: siteContent.header ?? {},
      footer: siteContent.footer ?? {},
    })

  if (settingsError) throw settingsError

  const pages = [
    { slug: 'about', title: aboutMeta.title, body: readText('about.mdx') },
    { slug: 'notes', title: notesMeta.title, body: readText('notes/index.mdx') },
    { slug: 'not-found', title: notFoundMeta.title, body: readText('not-found.mdx') },
  ]

  const { error: contentError } = await supabase.from('content').upsert(pages)
  if (contentError) throw contentError

  const { error: categoriesError } = await supabase.from('categories').upsert(
    categories.map((item) => ({ name: item.name })),
    { onConflict: 'name' },
  )
  if (categoriesError) throw categoriesError

  const { data: categoryRows, error: categoriesSelectError } = await supabase
    .from('categories')
    .select('id, name')
  if (categoriesSelectError) throw categoriesSelectError

  const categoryIdByName = Object.fromEntries(categoryRows.map((row) => [row.name, row.id]))

  const { error: tagsError } = await supabase.from('tags').upsert(
    tags.map((item) => ({ name: item.name })),
    { onConflict: 'name' },
  )
  if (tagsError) throw tagsError

  const { data: tagRows, error: tagsSelectError } = await supabase.from('tags').select('id, name')
  if (tagsSelectError) throw tagsSelectError

  const tagIdByName = Object.fromEntries(tagRows.map((row) => [row.name, row.id]))

  const notes = notesIndex.map((note) => ({
    slug: note.slug,
    title: note.title,
    summary: note.summary ?? '',
    category_id: categoryIdByName[note.category] ?? null,
    published_at: note.publishedAt ?? null,
    cover_image: note.coverImage ?? null,
    body: readText(note.contentFile),
    published: true,
  }))

  const { error: notesError } = await supabase.from('notes').upsert(notes)
  if (notesError) throw notesError

  const noteTagRows = notesIndex.flatMap((note) =>
    (note.tags ?? [])
      .map((tagName) => tagIdByName[tagName])
      .filter(Boolean)
      .map((tagId) => ({
        note_slug: note.slug,
        tag_id: tagId,
      })),
  )

  const { error: clearTagsError } = await supabase.from('note_tags').delete().neq('note_slug', '')
  if (clearTagsError) throw clearTagsError

  if (noteTagRows.length) {
    const { error: noteTagsError } = await supabase.from('note_tags').upsert(noteTagRows)
    if (noteTagsError) throw noteTagsError
  }

  console.log(
    `Synced settings, ${pages.length} content rows, ${categories.length} categories, ${tags.length} tags, ${notes.length} notes.`,
  )
}

upsertAll().catch((error) => {
  if (error?.code === '42501') {
    console.error('RLS blocked the write. Use SUPABASE_SERVICE_ROLE_KEY (service_role), not the anon key.')
    console.error('Supabase → Project Settings → API → service_role → Reveal')
  } else {
    console.error(error)
  }
  process.exit(1)
})
