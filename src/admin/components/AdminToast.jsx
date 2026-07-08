import { useCallback, useEffect, useRef, useState } from 'react'
import { CircleAlert, CircleCheck } from 'lucide-react'
import { AdminToastContext } from '@/admin/hooks/useAdminToast'

const TOAST_MS = 4000
const toastIcons = {
  success: CircleCheck,
  error: CircleAlert,
}

function AdminToastProvider({ children }) {
  const [toasts, setToasts] = useState([])
  const timersRef = useRef(new Map())

  const dismiss = useCallback((id) => {
    const timer = timersRef.current.get(id)
    if (timer) {
      clearTimeout(timer)
      timersRef.current.delete(id)
    }
    setToasts((current) => current.filter((toast) => toast.id !== id))
  }, [])

  const push = useCallback((message, type = 'success') => {
    if (!message) return
    const id = crypto.randomUUID()
    setToasts((current) => [...current, { id, message, type }])
    timersRef.current.set(id, setTimeout(() => dismiss(id), TOAST_MS))
  }, [dismiss])

  useEffect(() => () => {
    for (const timer of timersRef.current.values()) clearTimeout(timer)
  }, [])

  return (
    <AdminToastContext.Provider value={push}>
      {children}
      <div className="admin-toast-stack" aria-live="polite" aria-atomic="false">
        {toasts.map((toast) => {
          const Icon = toastIcons[toast.type] ?? CircleAlert
          return (
            <div key={toast.id} className={`admin-toast admin-toast--${toast.type}`} role="status">
              <Icon className="admin-toast-icon" size={18} strokeWidth={2.25} aria-hidden="true" />
              <span className="admin-toast-message">{toast.message}</span>
            </div>
          )
        })}
      </div>
    </AdminToastContext.Provider>
  )
}

export default AdminToastProvider
