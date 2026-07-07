import { describe, expect, it } from 'vitest'
import { slugify } from '@/utils/slugify'

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

  it('handles empty input', () => {
    expect(slugify('')).toBe('')
    expect(slugify(null)).toBe('')
  })
})
