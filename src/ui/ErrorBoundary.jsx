import { Component } from 'react'
import ContentError from '@/ui/ContentError'

class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { error: null }
  }

  static getDerivedStateFromError(error) {
    return { error }
  }

  render() {
    if (this.state.error) {
      return (
        <div className="content-error-shell site-shell">
          <main className="site-main">
            <div className="container">
              <ContentError
                label="Interrupted"
                title="This page hit a snag"
                description="Something broke while rendering. You can try again, or head back to a safer page."
                actionLabel="Try again"
                onAction={() => this.setState({ error: null })}
                secondaryTo="/about"
                secondaryLabel="Back to About"
              />
            </div>
          </main>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
