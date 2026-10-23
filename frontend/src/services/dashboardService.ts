import type { KpiCard, RecentRequest, AuditLog, SystemStatusItem } from './models.ts'
import {
  MOCK_REQUESTS,
  MOCK_DASHBOARD_EVENTS,
  MOCK_DASHBOARD_SYSTEM_STATUS,
  MOCK_DASHBOARD_KPI,
  MOCK_ASSETS,
  MOCK_USERS,
} from './mockData'

export const dashboardService = {
  async getKpiCards(): Promise<KpiCard[]> {
    // const { data } = await api.get<KpiCard[]>('/dashboard/kpi')
    // return data
    await new Promise((r) => setTimeout(r, 200))

    return MOCK_DASHBOARD_KPI
  },

  async getRecentRequests(): Promise<RecentRequest[]> {
    // const { data } = await api.get<RecentRequest[]>('/requests?limit=5')
    // return data
    await new Promise((r) => setTimeout(r, 200))

    return MOCK_REQUESTS.slice(0, 5).map((r) => {
      const asset = MOCK_ASSETS.find((a) => a.id === r.assetId)
      const author = MOCK_USERS.find((u) => u.id === r.authorId)

      return {
        id: r.id,
        assetName: asset?.name || 'Неизвестно',
        authorName: author ? `${author.lastName} ${author.firstName.charAt(0)}.` : 'Неизвестно',
        status: r.status,
        priority: r.priority,
        time: '2 часа назад',
      }
    })
  },

  async getEvents(): Promise<AuditLog[]> {
    // const { data } = await api.get<AuditLog[]>('/dashboard/events')
    // return data
    await new Promise((r) => setTimeout(r, 200))

    return MOCK_DASHBOARD_EVENTS
  },

  async getSystemStatus(): Promise<SystemStatusItem[]> {
    // const { data } = await api.get<SystemStatusItem[]>('/monitoring/status')
    // return data
    await new Promise((r) => setTimeout(r, 200))

    return MOCK_DASHBOARD_SYSTEM_STATUS
  },
}
