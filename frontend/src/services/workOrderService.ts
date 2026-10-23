import type { WorkOrderFilter, WorkOrderView } from './models.ts'
import { MOCK_WORK_ORDERS, MOCK_ASSETS, MOCK_USERS, MOCK_REQUESTS } from './mockData'

export const workOrderService = {
  async getWorkOrders(
    filter: WorkOrderFilter,
  ): Promise<{ content: WorkOrderView[]; totalElements: number }> {
    // return api.get('/work-orders', { params: filter })
    await new Promise((r) => setTimeout(r, 300))

    let filtered = MOCK_WORK_ORDERS.filter((wo) => !wo.isDeleted)

    if (filter.technicianId) {
      filtered = filtered.filter((wo) => wo.technicianId === filter.technicianId)
    }

    if (filter.status !== 'ALL') {
      filtered = filtered.filter((wo) => wo.status === filter.status)
    }

    if (filter.search) {
      const s = filter.search.toLowerCase()
      filtered = filtered.filter((wo) => {
        const asset = MOCK_ASSETS.find((a) => a.id === wo.assetId)
        const tech = MOCK_USERS.find((u) => u.id === wo.technicianId)
        const master = MOCK_USERS.find((u) => u.id === wo.masterId)

        const assetName = asset?.name.toLowerCase() || ''
        const invNumber = asset?.inventoryNumber.toLowerCase() || ''
        const techName = `${tech?.lastName} ${tech?.firstName}`.toLowerCase()
        const masterName = `${master?.lastName} ${master?.firstName}`.toLowerCase()

        return (
          assetName.includes(s) ||
          invNumber.includes(s) ||
          techName.includes(s) ||
          masterName.includes(s)
        )
      })
    }

    const totalElements = filtered.length
    const start = (filter.page - 1) * filter.size
    const paginated = filtered.slice(start, start + filter.size)

    const content: WorkOrderView[] = paginated.map((wo) => {
      const asset = MOCK_ASSETS.find((a) => a.id === wo.assetId)
      const master = MOCK_USERS.find((u) => u.id === wo.masterId)
      const tech = wo.technicianId ? MOCK_USERS.find((u) => u.id === wo.technicianId) : null
      const req = wo.requestId ? MOCK_REQUESTS.find((r) => r.id === wo.requestId) : null

      return {
        ...wo,
        asset: {
          id: wo.assetId,
          name: asset?.name || 'Неизвестно',
          inventoryNumber: asset?.inventoryNumber || '',
        },
        master: {
          id: wo.masterId,
          lastName: master?.lastName || '',
          firstName: master?.firstName || '',
          middleName: master?.middleName || null,
          role: master?.role || 'MASTER',
        },
        technician: tech
          ? {
              id: tech.id,
              lastName: tech.lastName,
              firstName: tech.firstName,
              middleName: tech.middleName,
              role: tech.role,
            }
          : null,
        request: req
          ? {
              id: req.id,
              status: req.status,
            }
          : null,
      }
    })

    return { content, totalElements }
  },

  async getWorkOrderById(id: number): Promise<WorkOrderView> {
    // const { data } = await api.get<WorkOrderView>(`/work-orders/${id}`)
    // return data

    await new Promise((r) => setTimeout(r, 200))
    const wo = MOCK_WORK_ORDERS.find((w) => w.id === id && !w.isDeleted)
    if (!wo) throw new Error('WorkOrder not found')

    const asset = MOCK_ASSETS.find((a) => a.id === wo.assetId)
    const master = MOCK_USERS.find((u) => u.id === wo.masterId)
    const tech = wo.technicianId ? MOCK_USERS.find((u) => u.id === wo.technicianId) : null
    const req = wo.requestId ? MOCK_REQUESTS.find((r) => r.id === wo.requestId) : null

    return {
      ...wo,
      asset: {
        id: wo.assetId,
        name: asset?.name || 'Неизвестно',
        inventoryNumber: asset?.inventoryNumber || '',
      },
      master: {
        id: wo.masterId,
        lastName: master?.lastName || '',
        firstName: master?.firstName || '',
        middleName: master?.middleName || null,
        role: master?.role || 'MASTER',
      },
      technician: tech
        ? {
            id: tech.id,
            lastName: tech.lastName,
            firstName: tech.firstName,
            middleName: tech.middleName,
            role: tech.role,
          }
        : null,
      request: req
        ? {
            id: req.id,
            status: req.status,
          }
        : null,
    }
  },
}
