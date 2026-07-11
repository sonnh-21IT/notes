import { describe, expect, it } from 'vitest'
import { parseTweetId, parseYouTubeId } from '@/utils/embedIds'

describe('parseYouTubeId', () => {
  it('accepts bare video id', () => {
    expect(parseYouTubeId('dQw4w9WgXcQ')).toBe('dQw4w9WgXcQ')
  })

  it('parses common youtube urls', () => {
    expect(parseYouTubeId('https://www.youtube.com/watch?v=dQw4w9WgXcQ')).toBe('dQw4w9WgXcQ')
    expect(parseYouTubeId('https://youtu.be/dQw4w9WgXcQ')).toBe('dQw4w9WgXcQ')
    expect(parseYouTubeId('https://www.youtube.com/embed/dQw4w9WgXcQ')).toBe('dQw4w9WgXcQ')
    expect(parseYouTubeId('https://www.youtube.com/shorts/dQw4w9WgXcQ')).toBe('dQw4w9WgXcQ')
  })

  it('rejects invalid input', () => {
    expect(parseYouTubeId('javascript:alert(1)')).toBe(null)
    expect(parseYouTubeId('')).toBe(null)
    expect(parseYouTubeId('too-short')).toBe(null)
  })
})

describe('parseTweetId', () => {
  it('accepts bare tweet id', () => {
    expect(parseTweetId('1234567890123456789')).toBe('1234567890123456789')
  })

  it('parses twitter and x urls', () => {
    expect(parseTweetId('https://twitter.com/user/status/1234567890123456789')).toBe('1234567890123456789')
    expect(parseTweetId('https://x.com/user/status/1234567890123456789')).toBe('1234567890123456789')
  })

  it('rejects invalid input', () => {
    expect(parseTweetId('abc')).toBe(null)
    expect(parseTweetId('')).toBe(null)
  })
})
