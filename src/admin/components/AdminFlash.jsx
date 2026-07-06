function AdminFlash({ type = 'error', children }) {
  if (!children) return null
  return (
    <p className={`admin-flash admin-flash--${type}`} role={type === 'error' ? 'alert' : 'status'}>
      {children}
    </p>
  )
}

export default AdminFlash
