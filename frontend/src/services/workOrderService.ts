export type WorkOrderStatus =
  'DRAFT' | 'ASSIGNED' | 'IN_PROGRESS' | 'COMPLETED' | 'CLOSED' | 'CANCELLED'

export interface WorkOrder {
  id: number
  requestId: number | null
  assetName: string
  inventoryNumber: string
  masterName: string
  technicianName: string | null
  status: WorkOrderStatus
  plannedStartDate: string
  plannedEndDate: string
  createdAt: string
}

export interface WorkOrderFilter {
  search: string
  status: WorkOrderStatus | 'ALL'
  technicianId?: number
  page: number
  size: number
}

export const workOrderService = {
  async getWorkOrders(
    filter: WorkOrderFilter,
  ): Promise<{ content: WorkOrder[]; totalElements: number }> {
    // return api.get('/work-orders', { params: filter })
    await new Promise((r) => setTimeout(r, 300))

    const allWorkOrders: WorkOrder[] = [
      {
        id: 201,
        requestId: 103,
        assetName: 'Сервер Dell R740',
        inventoryNumber: 'INV-003',
        masterName: 'Иванов И.',
        technicianName: 'Петров П.',
        status: 'IN_PROGRESS',
        plannedStartDate: '2026-10-16',
        plannedEndDate: '2026-10-18',
        createdAt: '2026-10-16T10:00:00',
      },
      {
        id: 202,
        requestId: 107,
        assetName: 'Генератор',
        inventoryNumber: 'INV-008',
        masterName: 'Иванов И.',
        technicianName: 'Петров П.',
        status: 'ASSIGNED',
        plannedStartDate: '2026-10-18',
        plannedEndDate: '2026-10-20',
        createdAt: '2026-10-17T09:00:00',
      },
      {
        id: 203,
        requestId: null,
        assetName: 'Станок ЧПУ',
        inventoryNumber: 'INV-001',
        masterName: 'Иванов И.',
        technicianName: 'Сидоров С.',
        status: 'DRAFT',
        plannedStartDate: '2026-10-25',
        plannedEndDate: '2026-10-27',
        createdAt: '2026-10-17T11:30:00',
      },
      {
        id: 204,
        requestId: 104,
        assetName: 'Конвейер',
        inventoryNumber: 'INV-004',
        masterName: 'Иванов И.',
        technicianName: 'Петров П.',
        status: 'CLOSED',
        plannedStartDate: '2026-10-15',
        plannedEndDate: '2026-10-16',
        createdAt: '2026-10-15T12:00:00',
      },
      {
        id: 205,
        requestId: null,
        assetName: 'Компрессор',
        inventoryNumber: 'INV-002',
        masterName: 'Сидоров С.',
        technicianName: 'Кузнецов К.',
        status: 'COMPLETED',
        plannedStartDate: '2026-10-10',
        plannedEndDate: '2026-10-12',
        createdAt: '2026-10-09T08:00:00',
      },
      {
        id: 206,
        requestId: 112,
        assetName: 'Шлифовальный станок',
        inventoryNumber: 'INV-015',
        masterName: 'Иванов И.',
        technicianName: 'Петров П.',
        status: 'CANCELLED',
        plannedStartDate: '2026-10-14',
        plannedEndDate: '2026-10-15',
        createdAt: '2026-10-13T14:00:00',
      },
      {
        id: 207,
        requestId: 102,
        assetName: 'Станок фрезерный',
        inventoryNumber: 'INV-006',
        masterName: 'Иванов И.',
        technicianName: 'Сидоров С.',
        status: 'IN_PROGRESS',
        plannedStartDate: '2026-10-17',
        plannedEndDate: '2026-10-19',
        createdAt: '2026-10-17T08:00:00',
      },
    ]

    let filtered = [...allWorkOrders]

    if (filter.technicianId) {
      filtered = filtered.filter((wo) => wo.technicianName === 'Петров П.') // Заглушка
    }

    if (filter.search) {
      const s = filter.search.toLowerCase()
      filtered = filtered.filter(
        (wo) =>
          wo.assetName.toLowerCase().includes(s) ||
          wo.inventoryNumber.toLowerCase().includes(s) ||
          (wo.technicianName && wo.technicianName.toLowerCase().includes(s)) ||
          (wo.masterName && wo.masterName.toLowerCase().includes(s)),
      )
    }

    if (filter.status !== 'ALL') {
      filtered = filtered.filter((wo) => wo.status === filter.status)
    }

    const start = (filter.page - 1) * filter.size
    const content = filtered.slice(start, start + filter.size)

    return { content, totalElements: filtered.length }
  },
}
