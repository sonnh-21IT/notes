import { Component } from 'react'

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
        <section className="page-stack content content-error">
          <h1 className="content-title">Something went wrong</h1>
          <p className="content-lead">{this.state.error.message}</p>
          <button
            type="button"
            className="admin-button admin-button--ghost"
            onClick={() => this.setState({ error: null })}
          >
            Try again
          </button>
        </section>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
