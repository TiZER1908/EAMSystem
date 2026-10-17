export type SparePartStatus = 'ACTIVE' | 'ARCHIVED'

export interface SparePart {
  id: number
  name: string
  article: string
  categoryName: string
  unitName: string
  stockQuantity: number
  status: SparePartStatus
}

export interface SparePartFilter {
  search: string
  categoryId?: number
  page: number
  size: number
}

export const sparePartService = {
  async getSpareParts(
    filter: SparePartFilter,
  ): Promise<{ content: SparePart[]; totalElements: number }> {
    // return api.get('/spare-parts', { params: filter })
    await new Promise((r) => setTimeout(r, 300))

    const allSpareParts: SparePart[] = [
      {
        id: 1,
        name: 'Подшипник 6204',
        article: 'BRG-6204',
        categoryName: 'Подшипники',
        unitName: 'шт',
        stockQuantity: 45,
        status: 'ACTIVE',
      },
      {
        id: 2,
        name: 'Ремень приводной A-1000',
        article: 'BLT-A1000',
        categoryName: 'Ремни',
        unitName: 'шт',
        stockQuantity: 12,
        status: 'ACTIVE',
      },
      {
        id: 3,
        name: 'Масло моторное 5W-40',
        article: 'OIL-5W40',
        categoryName: 'Расходные материалы',
        unitName: 'л',
        stockQuantity: 20,
        status: 'ACTIVE',
      },
      {
        id: 4,
        name: 'Фильтр воздушный',
        article: 'FLT-AIR-01',
        categoryName: 'Фильтры',
        unitName: 'шт',
        stockQuantity: 8,
        status: 'ACTIVE',
      },
      {
        id: 5,
        name: 'Сальник 25x40x7',
        article: 'SL-2540',
        categoryName: 'Уплотнения',
        unitName: 'шт',
        stockQuantity: 0,
        status: 'ACTIVE',
      },
      {
        id: 6,
        name: 'Контактор КМ 12А',
        article: 'CNT-KM12',
        categoryName: 'Электрика',
        unitName: 'шт',
        stockQuantity: 3,
        status: 'ACTIVE',
      },
      {
        id: 7,
        name: 'Лампа светодиодная 10W',
        article: 'LED-10W',
        categoryName: 'Электрика',
        unitName: 'шт',
        stockQuantity: 15,
        status: 'ACTIVE',
      },
      {
        id: 8,
        name: 'Прокладка ГБЦ',
        article: 'GSK-H01',
        categoryName: 'Уплотнения',
        unitName: 'шт',
        stockQuantity: 2,
        status: 'ACTIVE',
      },
      {
        id: 9,
        name: 'Подшипник 6205',
        article: 'BRG-6205',
        categoryName: 'Подшипники',
        unitName: 'шт',
        stockQuantity: 30,
        status: 'ARCHIVED',
      },
      {
        id: 10,
        name: 'Шланг гидравлический 1/2"',
        article: 'HOSE-12',
        categoryName: 'Гидравлика',
        unitName: 'м',
        stockQuantity: 10,
        status: 'ACTIVE',
      },
      {
        id: 11,
        name: 'Пружина клапанная',
        article: 'SPR-V01',
        categoryName: 'Механика',
        unitName: 'шт',
        stockQuantity: 25,
        status: 'ACTIVE',
      },
      {
        id: 12,
        name: 'Реле времени',
        article: 'RLY-T01',
        categoryName: 'Электрика',
        unitName: 'шт',
        stockQuantity: 1,
        status: 'ACTIVE',
      },
    ]

    let filtered = [...allSpareParts]

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
}
