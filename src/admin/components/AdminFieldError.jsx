function AdminFieldError({ message }) {
  if (!message) return null
  return <p className="admin-field-error">{message}</p>
}

export default AdminFieldError
