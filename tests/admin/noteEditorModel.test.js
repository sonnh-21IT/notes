import { describe, expect, it } from 'vitest'
import {
  buildNotePayload,
  draftToFields,
  emptyNoteFormFields,
  findTagByName,
  noteToFields,
  readInitialNoteFields,
  readInitialSlugManual,
} from '@/admin/lib/noteEditorModel'

describe('noteEditorModel', () => {
  it('findTagByName matches case-insensitively', () => {
    const tags = [{ id: 1, name: 'React' }, { id: 2, name: 'Vite' }]
    expect(findTagByName(tags, ' react ').id).toBe(1)
    expect(findTagByName(tags, 'missing')).toBeNull()
  })

  it('maps draft and note rows into form fields', () => {
    const draft = draftToFields({
      slug: 'hello',
      title: 'Hello',
      summary: 's',
      categoryId: 3,
      tagIds: [1],
      publishedAt: '2026-01-01',
      coverImage: 'https://x/y.jpg',
      published: false,
      pinned: true,
      body: '# hi',
    })
    expect(draft.categoryId).toBe('3')
    expect(draft.selectedTagIds).toEqual([1])

    const note = noteToFields({
      slug: 'hello',
      title: 'Hello',
      summary: 's',
      categoryId: 3,
      tagIds: [1],
      publishedAt: '2026-01-01',
      coverImage: null,
      published: true,
      pinned: false,
      body: '# hi',
    })
    expect(note.coverImage).toBe('')
    expect(note.categoryId).toBe('3')
  })

  it('buildNotePayload trims slug/title and normalizes ids', () => {
    expect(buildNotePayload({
      slug: '  hello  ',
      title: '  Hello  ',
      summary: 's',
      categoryId: '3',
      selectedTagIds: [1, 2],
      publishedAt: '',
      coverImage: '  ',
      published: true,
      pinned: false,
      body: 'body',
    })).toMatchObject({
      slug: 'hello',
      title: 'Hello',
      categoryId: 3,
      tagIds: [1, 2],
      coverImage: null,
      body: 'body',
    })
  })

  it('readInitial helpers only hydrate new-note drafts', () => {
    expect(readInitialNoteFields('existing', { draft: { editSlug: 'new', title: 'x' } })).toEqual(
      emptyNoteFormFields(),
    )

    const draft = {
      editSlug: 'new',
      slug: 'custom-slug',
      title: 'Hello World',
      summary: '',
      categoryId: null,
      tagIds: [],
      publishedAt: '2026-01-01',
      coverImage: '',
      published: true,
      pinned: false,
      body: '',
    }
    expect(readInitialNoteFields('new', { draft }).slug).toBe('custom-slug')
    expect(readInitialSlugManual('new', { draft })).toBe(true)
    expect(readInitialSlugManual('new', {
      draft: { ...draft, slug: 'hello-world' },
    })).toBe(false)
  })
})
