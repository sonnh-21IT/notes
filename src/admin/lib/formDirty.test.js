import { describe, expect, it } from 'vitest'
import { snapshotEquals, noteSnapshot, settingsSnapshot } from '@/admin/lib/formDirty'

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
