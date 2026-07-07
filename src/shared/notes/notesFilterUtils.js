export function activeFilterItems(selectedCategories, selectedTags) {
  return [
    ...selectedCategories.map((item) => ({ kind: 'category', ...item })),
    ...selectedTags.map((item) => ({ kind: 'tag', ...item })),
  ]
}
