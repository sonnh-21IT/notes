import { evaluate } from '@mdx-js/mdx'
import * as jsxRuntime from 'react/jsx-runtime'
import { mdxCompileOptions } from '@/mdx/mdxCompileOptions'

export async function compileMdx(source) {
  const text = source?.trim()
  if (!text) return null

  const { default: Component } = await evaluate(text, {
    ...jsxRuntime,
    ...mdxCompileOptions,
  })

  return Component
}

export function isMdxContentReady(content) {
  if (!content?.body?.trim()) return true
  return typeof content.MdxContent === 'function'
}

export async function withBodyMdx(metadata) {
  if (!metadata) return null

  const body = metadata.body?.trim()
  const MdxContent = body ? await compileMdx(body) : null

  return {
    ...metadata,
    MdxContent,
  }
}
