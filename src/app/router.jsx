import { Navigate, Route, Routes } from 'react-router-dom'
import MainLayout from '@/layouts/MainLayout'
import { AboutPage } from '@/pages/about'
import { NotesPage, NotePage } from '@/pages/notes'
import { NotFoundPage } from '@/pages/not-found'
import {
  AdminRoute,
  AdminLayout,
  AdminLoginPage,
  AdminSettingsPage,
  AdminContentListPage,
  AdminContentEditPage,
  AdminContentPreviewPage,
  AdminNotesListPage,
  AdminNoteEditPage,
  AdminNotePreviewPage,
} from '@/admin'

function AppRouter() {
  return (
    <Routes>
      <Route path="/admin/login" element={<AdminLoginPage />} />
      <Route path="/admin" element={<AdminRoute />}>
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

      <Route element={<MainLayout />}>
        <Route index element={<Navigate to="/about" replace />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/notes" element={<NotesPage />} />
        <Route path="/notes/:slug" element={<NotePage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  )
}

export default AppRouter
