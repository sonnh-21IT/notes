import { describe, expect, it } from 'vitest'
import {
  isValidNoteSlug,
  validateContentBody,
  validateNoteFields,
  validateSettings,
} from '@/admin/lib/validation'

describe('isValidNoteSlug', () => {
  it('rejects leading or trailing hyphens', () => {
    expect(isValidNoteSlug('-hello')).toBe(false)
    expect(isValidNoteSlug('hello-')).toBe(false)
    expect(isValidNoteSlug('-hello-')).toBe(false)
  })

  it('accepts hyphenated slug', () => {
    expect(isValidNoteSlug('hello-world')).toBe(true)
  })
})

describe('validateNoteFields', () => {
  it('requires slug, title, summary, and body', () => {
    const result = validateNoteFields({
      slug: '',
      title: '',
      summary: '',
      body: '',
      coverImage: '',
      publishedAt: '2025-01-01',
    })

    expect(result.valid).toBe(false)
    expect(result.errors.slug).toBeTruthy()
    expect(result.errors.title).toBeTruthy()
    expect(result.errors.summary).toBeTruthy()
    expect(result.errors.body).toBeTruthy()
    expect(result.errors.coverImage).toBeFalsy()
  })

  it('accepts note without cover image', () => {
    const result = validateNoteFields({
      slug: 'good-slug',
      title: 'Title',
      summary: 'Short summary',
      body: 'body',
      coverImage: '',
      publishedAt: '2025-06-01',
    })

    expect(result.valid).toBe(true)
  })

  it('rejects invalid slug format', () => {
    const result = validateNoteFields({
      slug: 'Bad Slug',
      title: 'Title',
      summary: 'Summary',
      body: 'body',
      coverImage: '/img.png',
      publishedAt: '',
    })

    expect(result.valid).toBe(false)
    expect(result.errors.slug).toBeTruthy()
  })

  it('accepts valid note', () => {
    const result = validateNoteFields({
      slug: 'good-slug',
      title: 'Title',
      summary: 'Short summary',
      body: 'body',
      coverImage: '/img.png',
      publishedAt: '2025-06-01',
    })

    expect(result.valid).toBe(true)
  })

  it('rejects invalid cover image URL', () => {
    const result = validateNoteFields({
      slug: 'good-slug',
      title: 'Title',
      summary: 'Short summary',
      body: 'body',
      coverImage: 'not-a-url',
      publishedAt: '2025-06-01',
    })

    expect(result.valid).toBe(false)
    expect(result.errors.coverImage).toBeTruthy()
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
