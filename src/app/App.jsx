import { BrowserRouter } from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'
import ErrorBoundary from '@/ui/ErrorBoundary'
import ScrollToTop from '@/ui/ScrollToTop'
import AppRouter from '@/app/router'
import { routerBasename } from '@/utils/appBase'

function App() {
  return (
    <HelmetProvider>
      <BrowserRouter basename={routerBasename()}>
        <ScrollToTop />
        <ErrorBoundary>
          <AppRouter />
        </ErrorBoundary>
      </BrowserRouter>
    </HelmetProvider>
  )
}

export default App
