import { createContext, useContext, useMemo } from 'react'

export const AdminToastContext = createContext(null)

export function useAdminToast() {
  const push = useContext(AdminToastContext)
  if (!push) {
    throw new Error('useAdminToast must be used within AdminToastProvider')
  }

  return useMemo(() => ({
    showSuccess: (message) => push(message, 'success'),
    showError: (message) => push(message, 'error'),
  }), [push])
}
