import AdminField from '@/admin/components/AdminField'
import { useSyncedDraft } from '@/admin/hooks/useSyncedDraft'
import { fieldClassName } from '@/admin/lib/validation'

function AdminMdxBodyField({
  label = 'Article content',
  value,
  onCommit,
  error,
  onClearError,
  rows = 20,
  className,
}) {
  const [draft, setDraft, flush] = useSyncedDraft(value, onCommit)

  return (
    <AdminField label={label} error={error} className={className}>
      <textarea
        className={fieldClassName('admin-textarea admin-textarea--code', error)}
        rows={rows}
        value={draft}
        onChange={(event) => {
          setDraft(event.target.value)
          onClearError?.()
        }}
        onBlur={flush}
      />
    </AdminField>
  )
}

export default AdminMdxBodyField
