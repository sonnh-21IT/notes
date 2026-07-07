import { describe, expect, it } from 'vitest'
import {
  validateContentBody,
  validateNoteFields,
  validateSettings,
} from '@/admin/lib/validation'

describe('validateNoteFields', () => {
  it('requires slug and title', () => {
    const result = validateNoteFields({
      slug: '',
      title: '',
      body: 'x',
      coverImage: '',
      published: true,
      publishedAt: '2025-01-01',
    })

    expect(result.valid).toBe(false)
    expect(result.errors.slug).toBeTruthy()
    expect(result.errors.title).toBeTruthy()
  })

  it('rejects invalid slug format', () => {
    const result = validateNoteFields({
      slug: 'Bad Slug',
      title: 'Title',
      body: 'body',
      coverImage: '',
      published: true,
      publishedAt: '',
    })

    expect(result.valid).toBe(false)
    expect(result.errors.slug).toBeTruthy()
  })

  it('accepts valid note', () => {
    const result = validateNoteFields({
      slug: 'good-slug',
      title: 'Title',
      body: 'body',
      coverImage: '/img.png',
      published: true,
      publishedAt: '2025-06-01',
    })

    expect(result.valid).toBe(true)
  })
})

describe('validateContentBody', () => {
  it('rejects empty body', () => {
    expect(validateContentBody('').valid).toBe(false)
    expect(validateContentBody('hello').valid).toBe(true)
  })
})

describe('validateSettings', () => {
  it('requires site title', () => {
    const result = validateSettings({ headerTitle: '', socialLinks: [] })
    expect(result.valid).toBe(false)
    expect(result.errors.headerTitle).toBeTruthy()
  })

  it('validates partial social links', () => {
    const result = validateSettings({
      headerTitle: 'Site',
      socialLinks: [{ id: '', label: 'GitHub', url: '' }],
    })

    expect(result.valid).toBe(false)
    expect(result.errors['socialLinks.0.url']).toBeTruthy()
  })
})
