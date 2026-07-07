import { BrowserRouter } from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'
import { AuthProvider } from '@/context/AuthProvider'
import { ContentProvider } from '@/context/ContentProvider'
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
          <AuthProvider>
            <ContentProvider>
              <AppRouter />
            </ContentProvider>
          </AuthProvider>
        </ErrorBoundary>
      </BrowserRouter>
    </HelmetProvider>
  )
}

export default App
