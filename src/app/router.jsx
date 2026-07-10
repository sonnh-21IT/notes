import { lazy, Suspense } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import MainLayout from '@/layouts/MainLayout'
import AdminRoute from '@/admin/layouts/AdminRoute'
import AdminLayout from '@/admin/layouts/AdminLayout'
import PageLoading from '@/ui/PageLoading'
import RouteErrorPage from '@/ui/RouteErrorPage'

const AboutPage = lazy(() => import('@/pages/about/AboutPage'))
const NotesPage = lazy(() => import('@/pages/notes/NotesPage'))
const NotePage = lazy(() => import('@/pages/notes/NotePage'))
const NotFoundPage = lazy(() => import('@/pages/not-found/NotFoundPage'))

const AdminLoginPage = lazy(() => import('@/admin/pages/AdminLoginPage'))
const AdminSettingsPage = lazy(() => import('@/admin/pages/AdminSettingsPage'))
const AdminContentListPage = lazy(() => import('@/admin/pages/AdminContentListPage'))
const AdminContentEditPage = lazy(() => import('@/admin/pages/AdminContentEditPage'))
const AdminContentPreviewPage = lazy(() => import('@/admin/pages/AdminContentPreviewPage'))
const AdminNotesListPage = lazy(() => import('@/admin/pages/AdminNotesListPage'))
const AdminNoteEditPage = lazy(() => import('@/admin/pages/AdminNoteEditPage'))
const AdminNotePreviewPage = lazy(() => import('@/admin/pages/AdminNotePreviewPage'))

function RouteFallback() {
  // Chunk load only — not a DB wait, so no skeleton chrome
  return <PageLoading />
}

function AppRouter() {
  return (
    <Suspense fallback={<RouteFallback />}>
      <Routes>
        <Route path="/admin/login" element={<AdminLoginPage />} errorElement={<RouteErrorPage />} />
        <Route path="/admin" element={<AdminRoute />} errorElement={<RouteErrorPage />}>
          <Route element={<AdminLayout />}>
            <Route index element={<Navigate to="/admin/settings" replace />} />
            <Route path="settings" element={<AdminSettingsPage />} />
            <Route path="content" element={<AdminContentListPage />} />
            <Route path="content/:slug/preview" element={<AdminContentPreviewPage />} />
            <Route path="content/:slug" element={<AdminContentEditPage />} />
            <Route path="notes" element={<AdminNotesListPage />} />
            <Route path="notes/:slug/preview" element={<AdminNotePreviewPage />} />
            <Route path="notes/:slug" element={<AdminNoteEditPage />} />
          </Route>
        </Route>

        <Route element={<MainLayout />} errorElement={<RouteErrorPage />}>
          <Route index element={<Navigate to="/about" replace />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/notes" element={<NotesPage />} />
          <Route path="/notes/:slug" element={<NotePage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </Suspense>
  )
}

export default AppRouter
