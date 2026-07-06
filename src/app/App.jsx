import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from '@/context/AuthProvider'
import { ContentProvider } from '@/context/ContentProvider'
import ScrollToTop from '@/ui/ScrollToTop'
import AppRouter from '@/app/router'

function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <AuthProvider>
        <ContentProvider>
          <AppRouter />
        </ContentProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
