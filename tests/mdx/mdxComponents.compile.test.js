import { describe, expect, it } from 'vitest'
import { compileMdx } from '@/mdx/compileMdx'

const sample = `---
title: Components
---

# Hello

<Callout type="info">Note body</Callout>
<Banner>Heads up</Banner>
<Badge>Ready</Badge>
<Terminal title="shell">

\`\`\`bash
echo hi
\`\`\`

</Terminal>
<Endpoint method="GET" path="/v1/health">ok</Endpoint>
<Endpoint method="POST" path="/v1/notes" summary="Create note">
desc
<Params>
  <Field name="Authorization" type="header" required>Bearer</Field>
</Params>
<RequestBody type="application/json">
  <Fields>
    <Field name="title" type="string" required>Title</Field>
  </Fields>
</RequestBody>
<Responses>
  <Response status="201" description="Created" />
  <Response status="400" description="Bad request">nope</Response>
</Responses>
</Endpoint>
<Fields>
  <Field name="id" type="uuid" required>Primary key</Field>
</Fields>
<Option flag="--dry-run">Print only</Option>
<Output>done</Output>
<Timeline>
  <TimelineItem date="2025" title="Ship">v1</TimelineItem>
</Timeline>
<Compare>
  <CompareItem label="A">one</CompareItem>
  <CompareItem label="B">two</CompareItem>
</Compare>
<Window title="app.png">

![x](/cover.png)

</Window>
<Repo href="https://example.com" title="example" description="demo" />
`

describe('mdx component registry', () => {
  it('compiles tech-note components', async () => {
    const Component = await compileMdx(sample)
    expect(typeof Component).toBe('function')
  })
})
