export type RequestStatus = 'NEW' | 'ACCEPTED' | 'IN_PROGRESS' | 'CLOSED' | 'REJECTED' | 'CANCELLED'
export type RequestPriority = 'LOW' | 'NORMAL' | 'HIGH' | 'CRITICAL'

export interface Request {
  id: number
  assetName: string
  inventoryNumber: string
  authorName: string
  description: string
  priority: RequestPriority
  status: RequestStatus
  createdAt: string
}

export interface RequestFilter {
  search: string
  status: RequestStatus | 'ALL'
  authorId?: number
  page: number
  size: number
}

export const requestService = {
  async getRequests(filter: RequestFilter): Promise<{ content: Request[]; totalElements: number }> {
    // return api.get('/requests', { params: filter })
    await new Promise((r) => setTimeout(r, 300))

    const allRequests: Request[] = [
      {
        id: 101,
        assetName: 'Станок ЧПУ',
        inventoryNumber: 'INV-001',
        authorName: 'Петров П.',
        description: 'Не запускается шпиндель',
        priority: 'HIGH',
        status: 'NEW',
        createdAt: '2026-10-17T10:30:00',
      },
      {
        id: 102,
        assetName: 'Компрессор',
        inventoryNumber: 'INV-002',
        authorName: 'Иванов И.',
        description: 'Постоянно работает без остановки',
        priority: 'NORMAL',
        status: 'ACCEPTED',
        createdAt: '2026-10-16T14:15:00',
      },
      {
        id: 103,
        assetName: 'Сервер Dell R740',
        inventoryNumber: 'INV-003',
        authorName: 'Сидоров С.',
        description: 'Шумит кулер, перегрев',
        priority: 'CRITICAL',
        status: 'IN_PROGRESS',
        createdAt: '2026-10-16T09:00:00',
      },
      {
        id: 104,
        assetName: 'Конвейер',
        inventoryNumber: 'INV-004',
        authorName: 'Кузнецов К.',
        description: 'Порвалась лента',
        priority: 'LOW',
        status: 'CLOSED',
        createdAt: '2026-10-15T11:20:00',
      },
      {
        id: 105,
        assetName: 'Насос',
        inventoryNumber: 'INV-005',
        authorName: 'Петров П.',
        description: 'Течет сальник',
        priority: 'NORMAL',
        status: 'NEW',
        createdAt: '2026-10-17T08:45:00',
      },
      {
        id: 106,
        assetName: 'Станок фрезерный',
        inventoryNumber: 'INV-006',
        authorName: 'Иванов И.',
        description: 'Сбилась калибровка',
        priority: 'HIGH',
        status: 'REJECTED',
        createdAt: '2026-10-14T16:30:00',
      },
      {
        id: 107,
        assetName: 'Генератор',
        inventoryNumber: 'INV-008',
        authorName: 'Сидоров С.',
        description: 'Не держит нагрузку',
        priority: 'CRITICAL',
        status: 'IN_PROGRESS',
        createdAt: '2026-10-16T12:00:00',
      },
      {
        id: 108,
        assetName: 'Пресс гидравлический',
        inventoryNumber: 'INV-009',
        authorName: 'Петров П.',
        description: 'Утечка масла',
        priority: 'HIGH',
        status: 'CANCELLED',
        createdAt: '2026-10-13T10:10:00',
      },
      {
        id: 109,
        assetName: 'Сварочный аппарат',
        inventoryNumber: 'INV-010',
        authorName: 'Иванов И.',
        description: 'Не подает газ',
        priority: 'NORMAL',
        status: 'ACCEPTED',
        createdAt: '2026-10-17T09:30:00',
      },
      {
        id: 110,
        assetName: 'Станок токарный',
        inventoryNumber: 'INV-011',
        authorName: 'Сидоров С.',
        description: 'Люфт в суппорте',
        priority: 'NORMAL',
        status: 'NEW',
        createdAt: '2026-10-15T13:45:00',
      },
      {
        id: 111,
        assetName: 'Робот-манипулятор',
        inventoryNumber: 'INV-012',
        authorName: 'Петров П.',
        description: 'Ошибка на пульте управления',
        priority: 'CRITICAL',
        status: 'NEW',
        createdAt: '2026-10-17T11:00:00',
      },
      {
        id: 112,
        assetName: 'Шлифовальный станок',
        inventoryNumber: 'INV-015',
        authorName: 'Иванов И.',
        description: 'Вибрация при работе',
        priority: 'LOW',
        status: 'CLOSED',
        createdAt: '2026-10-12T10:00:00',
      },
    ]

    let filtered = [...allRequests]

    if (filter.authorId) {
      const authorIdMap: Record<string, number> = {
        'Петров П.': 1,
        'Иванов И.': 2,
        'Сидоров С.': 3,
      }
    }

    if (filter.search) {
      const s = filter.search.toLowerCase()
      filtered = filtered.filter(
        (r) =>
          r.assetName.toLowerCase().includes(s) ||
          r.inventoryNumber.toLowerCase().includes(s) ||
          r.description.toLowerCase().includes(s) ||
          r.authorName.toLowerCase().includes(s),
      )
    }

    if (filter.status !== 'ALL') {
      filtered = filtered.filter((r) => r.status === filter.status)
    }

    const start = (filter.page - 1) * filter.size
    const content = filtered.slice(start, start + filter.size)

    return { content, totalElements: filtered.length }
  },
}
