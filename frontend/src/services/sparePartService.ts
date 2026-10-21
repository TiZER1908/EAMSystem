import type { SparePart, SparePartFilter } from './models.ts'
import { MOCK_SPARE_PARTS } from './mockData'

export const sparePartService = {
  async getSpareParts(
    filter: SparePartFilter,
  ): Promise<{ content: SparePart[]; totalElements: number }> {
    // return api.get('/spare-parts', { params: filter })
    await new Promise((r) => setTimeout(r, 300))

    let filtered = [...MOCK_SPARE_PARTS]

    if (filter.search) {
      const s = filter.search.toLowerCase()
      filtered = filtered.filter(
        (sp) =>
          sp.name.toLowerCase().includes(s) ||
          sp.article.toLowerCase().includes(s) ||
          sp.categoryName.toLowerCase().includes(s),
      )
    }

    const start = (filter.page - 1) * filter.size
    const content = filtered.slice(start, start + filter.size)

    return { content, totalElements: filtered.length }
  },

  async getSparePartById(id: number): Promise<SparePart> {
    // const { data } = await api.get<SparePart>(`/spare-parts/${id}`)
    // return data

    await new Promise((r) => setTimeout(r, 200))
    const sp = MOCK_SPARE_PARTS.find((s) => s.id === id)
    if (!sp) throw new Error('SparePart not found')
    return sp as SparePart
  },
}
