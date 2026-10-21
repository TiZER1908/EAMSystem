import type { WorkOrder, WorkOrderFilter } from './models.ts'
import { MOCK_WORK_ORDERS } from './mockData'

export const workOrderService = {
  async getWorkOrders(
    filter: WorkOrderFilter,
  ): Promise<{ content: WorkOrder[]; totalElements: number }> {
    // return api.get('/work-orders', { params: filter })
    await new Promise((r) => setTimeout(r, 300))

    let filtered = [...MOCK_WORK_ORDERS]

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

  async getWorkOrderById(id: number): Promise<WorkOrder> {
    // const { data } = await api.get<WorkOrder>(`/work-orders/${id}`)
    // return data

    await new Promise((r) => setTimeout(r, 200))
    const wo = MOCK_WORK_ORDERS.find((w) => w.id === id)
    if (!wo) throw new Error('WorkOrder not found')
    return wo as WorkOrder
  },
}
