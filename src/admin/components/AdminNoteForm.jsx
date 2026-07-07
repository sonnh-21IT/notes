import AdminField from '@/admin/components/AdminField'
import AdminSelect from '@/admin/components/AdminSelect'
import AdminTagSection from '@/admin/components/AdminTagSection'
import AdminValidationSummary from '@/admin/components/AdminValidationSummary'
import { fieldClassName } from '@/admin/lib/validation'
import { slugify } from '@/utils/slugify'

function AdminNoteForm({ form, onSubmit }) {
  const {
    isNew,
    published,
    setPublished,
    pinned,
    setPinned,
    title,
    setTitle,
    slug,
    setSlug,
    summary,
    setSummary,
    categoryId,
    setCategoryId,
    coverImage,
    setCoverImage,
    body,
    setBody,
    categories,
    categoryFieldError,
    setCategoryFieldError,
    creatingCategory,
    handleCreateCategory,
    fieldErrors,
    clearFieldError,
    selectedTags,
    tagQuery,
    setTagQuery,
    tagFieldError,
    setTagFieldError,
    matchedExistingTag,
    canCreateTag,
    creatingTag,
    allTags,
    visibleTags,
    selectedTagIds,
    handleTagInputKeyDown,
    handleCreateTag,
    removeTag,
    toggleTag,
    selectTag,
  } = form

  return (
    <form
      className="admin-form-body"
      onSubmit={(event) => {
        event.preventDefault()
        onSubmit()
      }}
    >
      <section className="admin-section admin-note-status">
        <label className="admin-switch admin-switch--compact">
          <input
            type="checkbox"
            className="admin-switch-input"
            checked={published}
            onChange={(e) => setPublished(e.target.checked)}
            aria-label="Published"
          />
          <span className="admin-switch-track" aria-hidden="true">
            <span className="admin-switch-knob" />
          </span>
          <span className="admin-note-status-hint">
            {published ? 'Visible on the public site when saved.' : 'Saved as draft — hidden from the site.'}
          </span>
        </label>

        <label className="admin-switch admin-switch--compact">
          <input
            type="checkbox"
            className="admin-switch-input"
            checked={pinned}
            onChange={(e) => setPinned(e.target.checked)}
            aria-label="Pinned on About"
          />
          <span className="admin-switch-track" aria-hidden="true">
            <span className="admin-switch-knob" />
          </span>
          <span className="admin-note-status-hint">
            {pinned
              ? 'Featured on the About page when published (newest first, max 5).'
              : 'Not featured on the About page.'}
          </span>
        </label>
      </section>

      <div className="admin-note-meta">
        <AdminField label="Title" error={fieldErrors.title} className="admin-field--full">
          <input
            className={fieldClassName('admin-input', fieldErrors.title)}
            value={title}
            onChange={(e) => {
              setTitle(e.target.value)
              clearFieldError('title')
            }}
          />
        </AdminField>

        <AdminField label="Slug" error={fieldErrors.slug}>
          <input
            className={fieldClassName('admin-input', fieldErrors.slug)}
            value={slug}
            onChange={(e) => {
              setSlug(slugify(e.target.value))
              clearFieldError('slug')
            }}
            readOnly={!isNew}
            placeholder={isNew ? 'my-new-note' : undefined}
          />
        </AdminField>

        <label className="admin-field">
          <span className="admin-label">Category</span>
          <AdminSelect
            value={categoryId}
            onChange={(next) => {
              setCategoryId(next)
              setCategoryFieldError('')
            }}
            options={[
              { value: '', label: 'None' },
              ...categories.map((category) => ({
                value: String(category.id),
                label: category.name,
              })),
            ]}
            creatable
            onCreate={handleCreateCategory}
            creating={creatingCategory}
            createError={categoryFieldError}
            emptyLabel="None"
          />
        </label>

        <AdminField label="Summary" className="admin-field--full">
          <textarea className="admin-textarea" rows={2} value={summary} onChange={(e) => setSummary(e.target.value)} />
        </AdminField>

        <AdminField label="Cover image URL" error={fieldErrors.coverImage} className="admin-field--full">
          <input
            className={fieldClassName('admin-input', fieldErrors.coverImage)}
            value={coverImage}
            onChange={(e) => {
              setCoverImage(e.target.value)
              clearFieldError('coverImage')
            }}
          />
        </AdminField>
      </div>

      <AdminTagSection
        selectedTags={selectedTags}
        tagQuery={tagQuery}
        tagFieldError={tagFieldError}
        matchedExistingTag={matchedExistingTag}
        canCreateTag={canCreateTag}
        creatingTag={creatingTag}
        allTags={allTags}
        visibleTags={visibleTags}
        selectedTagIds={selectedTagIds}
        onTagQueryChange={(e) => {
          setTagQuery(e.target.value)
          setTagFieldError('')
        }}
        onTagInputKeyDown={handleTagInputKeyDown}
        onCreateTag={handleCreateTag}
        onRemoveTag={removeTag}
        onToggleTag={toggleTag}
        onAttachExisting={() => {
          selectTag(matchedExistingTag.id)
          setTagQuery('')
        }}
      />

      <AdminField label="Body (MDX)" error={fieldErrors.body} className="admin-note-body">
        <textarea
          className={fieldClassName('admin-textarea admin-textarea--code', fieldErrors.body)}
          rows={20}
          value={body}
          onChange={(e) => {
            setBody(e.target.value)
            clearFieldError('body')
          }}
        />
      </AdminField>

      <AdminValidationSummary errors={fieldErrors} />
    </form>
  )
}

export default AdminNoteForm
