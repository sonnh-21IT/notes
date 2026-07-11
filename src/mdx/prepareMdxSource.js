/**
 * Normalize MDX pasted from other docs stacks (frontmatter, fumadocs imports)
 * so runtime evaluate() can use site mdxComponents instead.
 */
export function prepareMdxSource(source) {
  let text = String(source ?? '').replace(/^\uFEFF/, '').trim()
  if (!text) return ''

  if (text.startsWith('---')) {
    const end = text.indexOf('\n---', 3)
    if (end !== -1) {
      text = text.slice(end + 4).trimStart()
    }
  }

  // Drop ESM imports — components come from MDXProvider / mdxComponents
  text = text.replace(/^\s*import\s[\s\S]*?;\s*$/gm, '')

  // Drop markdown thematic breaks (--- / *** / ___) left as section dividers.
  // MDX turns those into <hr>; intentional rules can still use <hr />.
  text = text.replace(/^\s*(?:-{3,}|\*{3,}|_{3,})\s*$/gm, '')

  // Consecutive <Badge>…</Badge> (text-only body) → one <Badges> row.
  // Use [^<]* so a lone badge cannot swallow later siblings via backtracking.
  text = text.replace(/(?:<Badge\b[^>]*>[^<]*<\/Badge>\s*){2,}/g, (block) => {
    if (/<\/?Badges\b/.test(block)) return block
    return `<Badges>\n${block.trim()}\n</Badges>\n\n`
  })

  return text.trim()
}
