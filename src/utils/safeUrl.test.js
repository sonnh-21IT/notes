import { describe, expect, it } from 'vitest'
import { isSafeAssetUrl } from '@/utils/safeUrl'

describe('isSafeAssetUrl', () => {
  it('allows site-relative paths', () => {
    expect(isSafeAssetUrl('/images/cover.png')).toBe(true)
  })

  it('allows http and https', () => {
    expect(isSafeAssetUrl('https://example.com/a.png')).toBe(true)
    expect(isSafeAssetUrl('http://example.com/a.png')).toBe(true)
  })

  it('rejects javascript and data urls', () => {
    expect(isSafeAssetUrl('javascript:alert(1)')).toBe(false)
    expect(isSafeAssetUrl('data:text/html,hi')).toBe(false)
  })

  it('rejects empty input', () => {
    expect(isSafeAssetUrl('')).toBe(false)
    expect(isSafeAssetUrl(null)).toBe(false)
  })
})
