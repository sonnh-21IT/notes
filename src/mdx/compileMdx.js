import { evaluate } from '@mdx-js/mdx'
import * as jsxRuntime from 'react/jsx-runtime'
import { mdxCompileOptions } from '@/mdx/mdxCompileOptions'
import { prepareMdxSource } from '@/mdx/prepareMdxSource'

const COMPILE_CACHE_LIMIT = 24
const compileCache = new Map()
const compileInflight = new Map()

function rememberCompiled(key, Component) {
  if (compileCache.size >= COMPILE_CACHE_LIMIT) {
    const oldest = compileCache.keys().next().value
    compileCache.delete(oldest)
  }
  compileCache.set(key, Component)
  return Component
}

export async function compileMdx(source) {
  const text = prepareMdxSource(source)
  if (!text) return null

  if (compileCache.has(text)) return compileCache.get(text)
  if (compileInflight.has(text)) return compileInflight.get(text)

  const pending = evaluate(text, {
    ...jsxRuntime,
    ...mdxCompileOptions,
  })
    .then(({ default: Component }) => rememberCompiled(text, Component))
    .catch((err) => {
      const detail = err instanceof Error ? err.message : String(err)
      throw new Error(
        `Couldn't render this page. See components.md for supported MDX tags. ${detail}`,
      )
    })
    .finally(() => {
      compileInflight.delete(text)
    })

  compileInflight.set(text, pending)
  return pending
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
