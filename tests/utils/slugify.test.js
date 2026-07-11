import { describe, expect, it } from 'vitest'
import { sanitizeSlugInput, slugify } from '@/utils/slugify'

describe('slugify', () => {
  it('lowercases and hyphenates', () => {
    expect(slugify('Hello World')).toBe('hello-world')
  })

  it('strips special characters', () => {
    expect(slugify('Foo & Bar!!!')).toBe('foo-bar')
  })

  it('collapses repeated hyphens', () => {
    expect(slugify('a   b___c')).toBe('a-b-c')
  })

  it('strips accents', () => {
    expect(slugify('Café résumé')).toBe('cafe-resume')
  })

  it('handles empty input', () => {
    expect(slugify('')).toBe('')
    expect(slugify(null)).toBe('')
  })
})

describe('sanitizeSlugInput', () => {
  it('keeps trailing hyphen while typing', () => {
    expect(sanitizeSlugInput('hello-')).toBe('hello-')
  })

  it('keeps hyphens between words', () => {
    expect(sanitizeSlugInput('hello-world')).toBe('hello-world')
  })

  it('strips leading hyphens', () => {
    expect(sanitizeSlugInput('-hello')).toBe('hello')
  })
})
