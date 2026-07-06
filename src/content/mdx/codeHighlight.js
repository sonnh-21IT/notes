import { createHighlighter } from 'shiki'

const THEMES = { light: 'one-light', dark: 'one-dark-pro' }
const LANG_ALIASES = { md: 'markdown', sh: 'bash', yml: 'yaml', ts: 'typescript', js: 'javascript' }

let highlighterPromise

function getHighlighter() {
  highlighterPromise ??= createHighlighter({
    themes: [THEMES.light, THEMES.dark],
    langs: ['text'],
  })
  return highlighterPromise
}

async function resolveLanguage(highlighter, lang) {
  const id = LANG_ALIASES[lang?.trim()] ?? (lang?.trim() || 'text')
  if (highlighter.getLoadedLanguages().includes(id)) return id

  try {
    await highlighter.loadLanguage(id)
    return id
  } catch {
    if (id !== 'text' && !highlighter.getLoadedLanguages().includes('text')) {
      await highlighter.loadLanguage('text')
    }
    return 'text'
  }
}

export function extractShikiCodeHtml(html) {
  const match = html.match(/<code[^>]*>([\s\S]*)<\/code>/i)
  return match?.[1] ?? html
}

export async function highlightCodeToHtml(code, lang) {
  const highlighter = await getHighlighter()
  const language = await resolveLanguage(highlighter, lang)

  const html = highlighter.codeToHtml(code, {
    lang: language,
    themes: THEMES,
    defaultColor: false,
  })

  return extractShikiCodeHtml(html)
}
