import { describe, expect, it } from 'vitest'
import { prepareMdxSource } from '@/mdx/prepareMdxSource'

describe('prepareMdxSource', () => {
  it('strips frontmatter and imports', () => {
    const source = `---
title: About
---

import { Card } from "fumadocs-ui/components/card";

# Hello

<Card title="A">ok</Card>
`
    expect(prepareMdxSource(source)).toBe(`# Hello

<Card title="A">ok</Card>`)
  })

  it('leaves plain mdx alone', () => {
    expect(prepareMdxSource('# Hi\n\nThere.')).toBe('# Hi\n\nThere.')
  })

  it('wraps consecutive badges so they share one row', () => {
    const source = `<Badge>Kubernetes</Badge>
<Badge>Linux</Badge>
<Badge>Networking</Badge>
`
    const prepared = prepareMdxSource(source)
    expect(prepared).toContain('<Badges>')
    expect(prepared).toContain('</Badges>')
    expect(prepared.match(/<Badge>/g)).toHaveLength(3)
  })

  it('does not let a lone badge swallow later badge runs', () => {
    const source = `<Badge color="yellow">WIP</Badge>

### Next

para

<Badge>a</Badge>
<Badge>b</Badge>
`
    const prepared = prepareMdxSource(source)
    expect(prepared).toContain('<Badge color="yellow">WIP</Badge>')
    expect(prepared.indexOf('### Next')).toBeLessThan(prepared.indexOf('<Badges>'))
    expect(prepared).toContain('<Badges>')
    expect(prepared).toContain('<Badge>a</Badge>')
    expect(prepared).toContain('<Badge>b</Badge>')
    expect(prepared.match(/<Badges>/g)).toHaveLength(1)
  })

  it('strips body thematic breaks but keeps table separators', () => {
    const source = `# A

---

## B

| Col | Val |
| --- | --- |
| x | y |

***
`
    expect(prepareMdxSource(source)).toBe(`# A

## B

| Col | Val |
| --- | --- |
| x | y |`)
  })
})
