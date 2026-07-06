import ContentStatusIndicator from '@/ui/ContentStatusIndicator'

function PageLoading({ label = 'Loading content' }) {
  return (
    <div className="page-loading">
      <ContentStatusIndicator label={label} />
    </div>
  )
}

export default PageLoading
