import { describe, expect, it } from 'vitest'
import {
  COVER_MAX_BYTES,
  assertCoverFile,
  coverPathFromPublicUrl,
} from '@/data/supabase/coverImage'

describe('coverPathFromPublicUrl', () => {
  it('extracts storage path from public URL', () => {
    const url = 'https://abc.supabase.co/storage/v1/object/public/note-covers/uid/123-file.jpg'
    expect(coverPathFromPublicUrl(url)).toBe('uid/123-file.jpg')
  })

  it('returns null for non-bucket URLs', () => {
    expect(coverPathFromPublicUrl('https://example.com/a.png')).toBeNull()
    expect(coverPathFromPublicUrl('/images/a.png')).toBeNull()
    expect(coverPathFromPublicUrl('')).toBeNull()
  })
})

describe('assertCoverFile', () => {
  it('accepts a valid image file', () => {
    const file = new File(['x'], 'cover.png', { type: 'image/png' })
    expect(() => assertCoverFile(file)).not.toThrow()
  })

  it('rejects wrong type and oversized files', () => {
    expect(() => assertCoverFile(new File(['x'], 'a.txt', { type: 'text/plain' }))).toThrow()
    const big = new File([new Uint8Array(COVER_MAX_BYTES + 1)], 'big.jpg', { type: 'image/jpeg' })
    expect(() => assertCoverFile(big)).toThrow(/5MB/)
  })
})
