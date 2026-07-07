import AdminFieldError from '@/admin/components/AdminFieldError'

function AdminField({ label, error, className = '', children }) {
  return (
    <label className={className ? `admin-field ${className}` : 'admin-field'}>
      <span className="admin-label">{label}</span>
      {children}
      <AdminFieldError message={error} />
    </label>
  )
}

export default AdminField
