import { RefreshCw } from 'lucide-react'
import { useMemo } from 'react'
import AdminCoverImageField from '@/admin/components/AdminCoverImageField'
import AdminField from '@/admin/components/AdminField'
import AdminFieldError from '@/admin/components/AdminFieldError'
import AdminNoteFlags from '@/admin/components/AdminNoteFlags'
import AdminSelect from '@/admin/components/AdminSelect'
import AdminSlugStatus from '@/admin/components/AdminSlugStatus'
import AdminTagSection from '@/admin/components/AdminTagSection'
import AdminValidationSummary from '@/admin/components/AdminValidationSummary'
import { fieldClassName } from '@/admin/lib/validation'

function AdminNoteForm({ form, onSubmit }) {
  const {
    isNew,
    title,
    handleTitleChange,
    slug,
    handleSlugChange,
    refreshSlugFromTitle,
    slugStatus,
    summary,
    setSummary,
    categoryId,
    setCategoryId,
    coverImage,
    coverUploading,
    handleCoverSelect,
    handleCoverRemove,
    body,
    setBody,
    categories,
    categoriesDisabled,
    categoryFieldError,
    setCategoryFieldError,
    creatingCategory,
    handleCreateCategory,
    fieldErrors,
    clearFieldError,
    selectedTags,
    tagsDisabled,
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
    published,
    pinned,
    onTogglePublished,
    onTogglePinned,
  } = form

  const slugInvalid = isNew
    ? slugStatus === 'unavailable' || Boolean(fieldErrors.slug)
    : Boolean(fieldErrors.slug)

  const summaryErrors = useMemo(() => {
    if (!isNew) return fieldErrors
    const next = { ...fieldErrors }
    delete next.slug
    return next
  }, [fieldErrors, isNew])

  return (
    <form
      className="admin-form-body"
      onSubmit={(event) => {
        event.preventDefault()
        onSubmit()
      }}
    >
      <div className="admin-note-metadata">
        <div className="admin-note-meta">
          <AdminField label="Title" error={fieldErrors.title} className="admin-field--full">
            <div className="admin-title-input-row">
              <input
                className={fieldClassName('admin-input', fieldErrors.title)}
                value={title}
                onChange={(e) => handleTitleChange(e.target.value)}
              />
              <AdminNoteFlags
                published={published}
                pinned={pinned}
                onTogglePublished={onTogglePublished}
                onTogglePinned={onTogglePinned}
              />
            </div>
          </AdminField>

          <div className="admin-slug-category-row">
            <label className="admin-field admin-slug-field">
              <span className="admin-label">URL name</span>
              <div className={`admin-slug-input-wrap${isNew ? ' admin-slug-input-wrap--affixed' : ''}`}>
                <input
                  className={fieldClassName('admin-input', slugInvalid)}
                  value={slug}
                  onChange={(e) => handleSlugChange(e.target.value)}
                  disabled={!isNew}
                  placeholder={isNew ? 'my-new-note' : undefined}
                  aria-invalid={slugInvalid || undefined}
                />
                {isNew ? (
                  <div className="admin-slug-input-affixes">
                    <button
                      type="button"
                      className="admin-slug-refresh"
                      aria-label="Update URL name from title"
                      title="Update from title"
                      onClick={refreshSlugFromTitle}
                    >
                      <RefreshCw size={12} strokeWidth={2.25} aria-hidden="true" />
                    </button>
                    <AdminSlugStatus status={slugStatus} />
                  </div>
                ) : null}
              </div>
            </label>

            <label className="admin-field admin-category-field">
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
                disabled={categoriesDisabled}
                onCreate={handleCreateCategory}
                creating={creatingCategory}
                createError={categoryFieldError}
                emptyLabel="None"
              />
            </label>
          </div>
        </div>

        <div className="admin-note-taxonomy">
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
            disabled={tagsDisabled}
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
        </div>

        <div className="admin-note-meta">
          <AdminField label="Summary" error={fieldErrors.summary} className="admin-field--full">
            <textarea
              className={fieldClassName('admin-textarea', fieldErrors.summary)}
              rows={2}
              value={summary}
              onChange={(e) => {
                setSummary(e.target.value)
                clearFieldError('summary')
              }}
            />
          </AdminField>

          <div className="admin-field admin-field--full">
            <span className="admin-label">Cover image</span>
            <AdminCoverImageField
              value={coverImage}
              uploading={coverUploading}
              onSelectFile={handleCoverSelect}
              onRemove={handleCoverRemove}
            />
            <AdminFieldError message={fieldErrors.coverImage} />
          </div>
        </div>
      </div>

      <AdminField label="Article content" error={fieldErrors.body} className="admin-note-body">
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

      <AdminValidationSummary errors={summaryErrors} />
    </form>
  )
}

export default AdminNoteForm
