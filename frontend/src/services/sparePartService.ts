import type { SparePartFilter, SparePartView } from './models.ts'
import { MOCK_SPARE_PARTS, MOCK_SPARE_PART_CATEGORIES, MOCK_UNITS } from './mockData'

export const sparePartService = {
  async getSpareParts(
    filter: SparePartFilter,
  ): Promise<{ content: SparePartView[]; totalElements: number }> {
    // const { data } = await api.get<{ content: SparePartView[]; totalElements: number }>('/spare-parts', { params: filter })
    // return data

    await new Promise((r) => setTimeout(r, 300))

    let filtered = MOCK_SPARE_PARTS.filter((sp) => !sp.isDeleted)

    if (filter.search) {
      const s = filter.search.toLowerCase()
      filtered = filtered.filter((sp) => {
        const category = MOCK_SPARE_PART_CATEGORIES.find((c) => c.id === sp.categoryId)
        const categoryName = category?.name.toLowerCase() || ''

        const article = sp.article ? sp.article.toLowerCase() : ''
        const name = sp.name.toLowerCase()

        return name.includes(s) || article.includes(s) || categoryName.includes(s)
      })
    }

    if (filter.categoryId) {
      filtered = filtered.filter((sp) => sp.categoryId === filter.categoryId)
    }

    const totalElements = filtered.length
    const start = (filter.page - 1) * filter.size
    const paginated = filtered.slice(start, start + filter.size)

    const content: SparePartView[] = paginated.map((sp) => {
      const category = MOCK_SPARE_PART_CATEGORIES.find((c) => c.id === sp.categoryId)
      const unit = MOCK_UNITS.find((u) => u.id === sp.unitId)

      return {
        ...sp,
        category: category ? { id: category.id, name: category.name } : null,
        unit: unit ? { id: unit.id, name: unit.name } : null,
      }
    })

    return { content, totalElements }
  },

  async getSparePartById(id: number): Promise<SparePartView> {
    // const { data } = await api.get<SparePartView>(`/spare-parts/${id}`)
    // return data

    await new Promise((r) => setTimeout(r, 200))
    const sp = MOCK_SPARE_PARTS.find((s) => s.id === id && !s.isDeleted)
    if (!sp) throw new Error('SparePart not found')

    const category = MOCK_SPARE_PART_CATEGORIES.find((c) => c.id === sp.categoryId)
    const unit = MOCK_UNITS.find((u) => u.id === sp.unitId)

    return {
      ...sp,
      category: category ? { id: category.id, name: category.name } : null,
      unit: unit ? { id: unit.id, name: unit.name } : null,
    }
  },
}
