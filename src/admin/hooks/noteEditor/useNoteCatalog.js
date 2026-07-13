import { useCallback, useEffect, useMemo, useState } from 'react'
import { listCategories, listTags, upsertCategory, upsertTag } from '@/data/admin'
import { invalidateCategoriesList, invalidateTagsList } from '@/data/content'
import { findTagByName } from '@/admin/lib/noteEditorModel'

export function useNoteCatalog({ routeSlug, toast, selectedTagIds, setSelectedTagIds, setCategoryId }) {
  const [categoriesLoading, setCategoriesLoading] = useState(true)
  const [categoriesFailed, setCategoriesFailed] = useState(false)
  const [tagsLoading, setTagsLoading] = useState(true)
  const [tagsFailed, setTagsFailed] = useState(false)
  const [creatingTag, setCreatingTag] = useState(false)
  const [creatingCategory, setCreatingCategory] = useState(false)
  const [categoryFieldError, setCategoryFieldError] = useState('')
  const [categories, setCategories] = useState([])
  const [allTags, setAllTags] = useState([])
  const [tagQuery, setTagQuery] = useState('')
  const [tagFieldError, setTagFieldError] = useState('')
  const [catalogSlug, setCatalogSlug] = useState(routeSlug)

  // Reset fetch flags when the note route changes (avoid setState-in-effect).
  if (catalogSlug !== routeSlug) {
    setCatalogSlug(routeSlug)
    setCategoriesLoading(true)
    setCategoriesFailed(false)
    setTagsLoading(true)
    setTagsFailed(false)
  }

  useEffect(() => {
    let active = true

    listCategories()
      .then((categoryRows) => {
        if (!active) return
        setCategories(categoryRows)
        setCategoriesFailed(false)
      })
      .catch((err) => {
        if (!active) return
        setCategoriesFailed(true)
        toast.showError(err instanceof Error ? err.message : String(err))
      })
      .finally(() => {
        if (active) setCategoriesLoading(false)
      })

    return () => {
      active = false
    }
  }, [routeSlug, toast])

  useEffect(() => {
    let active = true

    listTags()
      .then((tagRows) => {
        if (!active) return
        setAllTags(tagRows)
        setTagsFailed(false)
      })
      .catch((err) => {
        if (!active) return
        setTagsFailed(true)
        toast.showError(err instanceof Error ? err.message : String(err))
      })
      .finally(() => {
        if (active) setTagsLoading(false)
      })

    return () => {
      active = false
    }
  }, [routeSlug, toast])

  const trimmedTagQuery = tagQuery.trim()
  const matchedExistingTag = useMemo(
    () => findTagByName(allTags, trimmedTagQuery),
    [allTags, trimmedTagQuery],
  )
  const canCreateTag = trimmedTagQuery.length > 0 && !matchedExistingTag

  const selectedTags = useMemo(
    () => allTags.filter((tag) => selectedTagIds.includes(tag.id)),
    [allTags, selectedTagIds],
  )

  const visibleTags = useMemo(() => {
    if (!trimmedTagQuery) return allTags
    const needle = trimmedTagQuery.toLowerCase()
    return allTags.filter((tag) => tag.name.toLowerCase().includes(needle))
  }, [allTags, trimmedTagQuery])

  const selectTag = useCallback((tagId) => {
    setSelectedTagIds((current) => (current.includes(tagId) ? current : [...current, tagId]))
  }, [setSelectedTagIds])

  const toggleTag = useCallback((tagId) => {
    setSelectedTagIds((current) =>
      current.includes(tagId) ? current.filter((item) => item !== tagId) : [...current, tagId],
    )
  }, [setSelectedTagIds])

  const removeTag = useCallback((tagId) => {
    setSelectedTagIds((current) => current.filter((item) => item !== tagId))
  }, [setSelectedTagIds])

  const handleCreateCategory = useCallback(async (name) => {
    setCategoryFieldError('')
    setCreatingCategory(true)

    try {
      const created = await upsertCategory({ name })
      invalidateCategoriesList()
      setCategories((current) => [...current, created].sort((a, b) => a.name.localeCompare(b.name)))
      setCategoryId(String(created.id))
    } catch (err) {
      setCategoryFieldError(err instanceof Error ? err.message : String(err))
      throw err
    } finally {
      setCreatingCategory(false)
    }
  }, [setCategoryId])

  const handleCreateTag = useCallback(async () => {
    setTagFieldError('')

    if (!trimmedTagQuery) {
      setTagFieldError('Enter a tag name.')
      return
    }

    const existing = findTagByName(allTags, trimmedTagQuery)
    if (existing) {
      selectTag(existing.id)
      setTagQuery('')
      return
    }

    setCreatingTag(true)
    try {
      const created = await upsertTag({ name: trimmedTagQuery })
      invalidateTagsList()
      setAllTags((current) => [...current, created].sort((a, b) => a.name.localeCompare(b.name)))
      selectTag(created.id)
      setTagQuery('')
    } catch (err) {
      setTagFieldError(err instanceof Error ? err.message : String(err))
    } finally {
      setCreatingTag(false)
    }
  }, [allTags, trimmedTagQuery, selectTag])

  const handleTagInputKeyDown = useCallback((event) => {
    if (event.key !== 'Enter') return
    event.preventDefault()
    if (matchedExistingTag) {
      selectTag(matchedExistingTag.id)
      setTagQuery('')
      return
    }
    handleCreateTag()
  }, [matchedExistingTag, selectTag, handleCreateTag])

  return {
    categories,
    categoriesDisabled: categoriesLoading || categoriesFailed,
    categoryFieldError,
    setCategoryFieldError,
    creatingCategory,
    handleCreateCategory,
    selectedTags,
    tagsDisabled: tagsLoading || tagsFailed,
    tagQuery,
    setTagQuery,
    tagFieldError,
    setTagFieldError,
    matchedExistingTag,
    canCreateTag,
    creatingTag,
    allTags,
    visibleTags,
    handleTagInputKeyDown,
    handleCreateTag,
    removeTag,
    toggleTag,
    selectTag,
  }
}
