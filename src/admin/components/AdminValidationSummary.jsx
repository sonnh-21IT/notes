function AdminValidationSummary({ errors }) {
  const messages = [...new Set(Object.values(errors ?? {}).filter(Boolean))]
  if (!messages.length) return null

  return (
    <div className="admin-validation" role="alert">
      <p className="admin-validation-title">Fix these before continuing:</p>
      <ul className="admin-validation-list">
        {messages.map((message) => (
          <li key={message}>{message}</li>
        ))}
      </ul>
    </div>
  )
}

export default AdminValidationSummary
