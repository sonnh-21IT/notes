import { describe, expect, it } from 'vitest'
import { SITE_DEFAULTS, resolveSiteBrand } from '@/data/siteDefaults'

describe('resolveSiteBrand', () => {
  it('uses defaults when header is empty', () => {
    expect(resolveSiteBrand({})).toEqual(SITE_DEFAULTS)
    expect(resolveSiteBrand()).toEqual(SITE_DEFAULTS)
  })

  it('keeps a custom title without forcing a default tagline', () => {
    expect(resolveSiteBrand({ title: 'Sơn Nguyễn' })).toEqual({
      title: 'Sơn Nguyễn',
      tagline: '',
    })
  })

  it('keeps custom title and tagline', () => {
    expect(resolveSiteBrand({
      title: 'Sơn Nguyễn',
      tagline: 'Building for the web',
    })).toEqual({
      title: 'Sơn Nguyễn',
      tagline: 'Building for the web',
    })
  })
})
