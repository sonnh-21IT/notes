import remarkGfm from 'remark-gfm'

export const mdxCompileOptions = {
  remarkPlugins: [remarkGfm],
  providerImportSource: '@mdx-js/react',
}
