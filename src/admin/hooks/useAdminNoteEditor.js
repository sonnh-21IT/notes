import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { useAdminToast } from '@/admin/hooks/useAdminToast'
import useMdxPreview from '@/admin/hooks/useMdxPreview'
import { useNoteEditorActions } from '@/admin/hooks/noteEditor/useNoteEditorActions'
import { useNoteEditorForm } from '@/admin/hooks/noteEditor/useNoteEditorForm'

export function useAdminNoteEditor() {
  const { slug: routeSlug } = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  const toast = useAdminToast()

  const form = useNoteEditorForm({ routeSlug, location, toast })
  const isPreview = form.view === 'preview'
  const { MdxContent, loading: mdxLoading, error: mdxError } = useMdxPreview(form.body, isPreview)

  const actions = useNoteEditorActions({
    form,
    navigate,
    toast,
    mdxError,
  })

  const categoryName = form.catalog.categories.find((item) => String(item.id) === form.categoryId)?.name ?? ''
  const slugSaveBlocked = form.isNew && Boolean(form.slug.trim()) && form.slugStatus !== 'available'
  const saveDisabled = !form.isDirty
    || form.cover.coverUploading
    || (isPreview && mdxLoading)
    || (form.isNew && (!form.hasUserContent || slugSaveBlocked))

  return {
    loading: form.loading,
    isNew: form.isNew,
    slug: form.slug,
    title: form.title,
    published: form.published,
    pinned: form.pinned,
    view: form.view,
    isPreview,
    isDirty: form.isDirty,
    saveDisabled,
    confirm: actions.confirm,
    setConfirm: actions.setConfirm,
    setView: form.setView,
    mdxPreview: { MdxContent, loading: mdxLoading, error: mdxError },
    preview: {
      categoryName,
      selectedTags: form.catalog.selectedTags,
      publishedAt: form.publishedAt,
      coverImage: form.cover.coverImage,
      title: form.title,
    },
    form: {
      isNew: form.isNew,
      title: form.title,
      handleTitleChange: form.handleTitleChange,
      slug: form.slug,
      handleSlugChange: form.handleSlugChange,
      refreshSlugFromTitle: form.refreshSlugFromTitle,
      slugStatus: form.slugStatus,
      summary: form.summary,
      setSummary: form.setSummary,
      categoryId: form.categoryId,
      setCategoryId: form.setCategoryId,
      coverImage: form.cover.coverImage,
      coverUploading: form.cover.coverUploading,
      handleCoverSelect: form.cover.handleCoverSelect,
      handleCoverRemove: form.cover.handleCoverRemove,
      body: form.body,
      setBody: form.setBody,
      categories: form.catalog.categories,
      categoriesDisabled: form.catalog.categoriesDisabled,
      categoryFieldError: form.catalog.categoryFieldError,
      setCategoryFieldError: form.catalog.setCategoryFieldError,
      creatingCategory: form.catalog.creatingCategory,
      handleCreateCategory: form.catalog.handleCreateCategory,
      fieldErrors: form.fieldErrors,
      clearFieldError: form.clearFieldError,
      selectedTags: form.catalog.selectedTags,
      tagsDisabled: form.catalog.tagsDisabled,
      tagQuery: form.catalog.tagQuery,
      setTagQuery: form.catalog.setTagQuery,
      tagFieldError: form.catalog.tagFieldError,
      setTagFieldError: form.catalog.setTagFieldError,
      matchedExistingTag: form.catalog.matchedExistingTag,
      canCreateTag: form.catalog.canCreateTag,
      creatingTag: form.catalog.creatingTag,
      allTags: form.catalog.allTags,
      visibleTags: form.catalog.visibleTags,
      selectedTagIds: form.selectedTagIds,
      handleTagInputKeyDown: form.catalog.handleTagInputKeyDown,
      handleCreateTag: form.catalog.handleCreateTag,
      removeTag: form.catalog.removeTag,
      toggleTag: form.catalog.toggleTag,
      selectTag: form.catalog.selectTag,
      published: form.published,
      pinned: form.pinned,
      onTogglePublished: actions.togglePublished,
      onTogglePinned: actions.togglePinned,
    },
    requestSave: actions.requestSave,
    handleShowPreview: actions.handleShowPreview,
    handleDelete: actions.handleDelete,
    togglePublished: actions.togglePublished,
    togglePinned: actions.togglePinned,
  }
}
