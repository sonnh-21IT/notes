import { describe, expect, it } from 'vitest'
import {
  snapshotEquals,
  noteSnapshot,
  noteDirtySnapshot,
  noteHasUserContent,
  settingsSnapshot,
} from '@/admin/lib/formDirty'

describe('snapshotEquals', () => {
  it('compares serialized snapshots', () => {
    expect(snapshotEquals({ a: 1 }, { a: 1 })).toBe(true)
    expect(snapshotEquals({ a: 1 }, { a: 2 })).toBe(false)
  })
})

describe('noteSnapshot', () => {
  it('normalizes note fields', () => {
    const snapshot = noteSnapshot({
      slug: ' hello ',
      title: ' Title ',
      summary: 'sum',
      categoryId: '2',
      selectedTagIds: [3, 1],
      publishedAt: '',
      coverImage: '  ',
      published: false,
      body: 'body',
    })

    expect(snapshot).toEqual({
      slug: 'hello',
      title: 'Title',
      summary: 'sum',
      categoryId: 2,
      tagIds: [1, 3],
      publishedAt: expect.stringMatching(/^\d{4}-\d{2}-\d{2}$/),
      coverImage: null,
      published: false,
      pinned: false,
      body: 'body',
    })
  })
})

describe('noteDirtySnapshot', () => {
  it('ignores published and pinned', () => {
    const base = {
      slug: 'note',
      title: 'Note',
      summary: '',
      categoryId: null,
      selectedTagIds: [],
      publishedAt: '2026-01-01',
      coverImage: '',
      body: 'body',
    }

    expect(noteDirtySnapshot({ ...base, published: true, pinned: false }))
      .toEqual(noteDirtySnapshot({ ...base, published: false, pinned: true }))
  })
})

describe('noteHasUserContent', () => {
  const empty = {
    slug: '',
    title: '',
    summary: '',
    categoryId: '',
    selectedTagIds: [],
    coverImage: '',
    body: '',
  }

  it('is false when all content fields are empty', () => {
    expect(noteHasUserContent(empty)).toBe(false)
  })

  it('ignores published and pinned', () => {
    expect(noteHasUserContent(empty)).toBe(false)
  })

  it('is true when any content field is filled', () => {
    expect(noteHasUserContent({ ...empty, title: 'Note' })).toBe(true)
    expect(noteHasUserContent({ ...empty, slug: 'note' })).toBe(true)
    expect(noteHasUserContent({ ...empty, categoryId: '1' })).toBe(true)
  })
})

describe('settingsSnapshot', () => {
  it('drops empty social link rows', () => {
    const snapshot = settingsSnapshot({
      headerTitle: 'Site',
      headerTagline: 'Tag',
      socialLinks: [
        { id: '', label: '', url: '' },
        { id: 'gh', label: 'GitHub', url: 'https://github.com' },
      ],
    })

    expect(snapshot.socialLinks).toHaveLength(1)
    expect(snapshot.socialLinks[0].label).toBe('GitHub')
  })
})
