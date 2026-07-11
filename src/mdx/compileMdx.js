import { evaluate } from '@mdx-js/mdx'
import * as jsxRuntime from 'react/jsx-runtime'
import { mdxCompileOptions } from '@/mdx/mdxCompileOptions'
import { prepareMdxSource } from '@/mdx/prepareMdxSource'

export async function compileMdx(source) {
  const text = prepareMdxSource(source)
  if (!text) return null

  try {
    const { default: Component } = await evaluate(text, {
      ...jsxRuntime,
      ...mdxCompileOptions,
    })
    return Component
  } catch (err) {
    const detail = err instanceof Error ? err.message : String(err)
    throw new Error(
      `Couldn't render this page. See components.md for supported MDX tags. ${detail}`,
    )
  }
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
