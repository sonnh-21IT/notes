import ContentError from '@/ui/ContentError'

function RouteErrorPage() {
  return (
    <ContentError
      label="Interrupted"
      title="This page hit a snag"
      description="We couldn’t finish loading this route. Go back to the site and try another path."
      secondaryTo="/about"
      secondaryLabel="Back to About"
    />
  )
}

export default RouteErrorPage
