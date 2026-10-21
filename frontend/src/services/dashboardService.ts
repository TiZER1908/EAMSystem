import { type Component } from 'vue'
import type { KpiCard, RecentRequest, EventItem, SystemStatusItem } from './models.ts'
import {
  MOCK_REQUESTS,
  MOCK_DASHBOARD_EVENTS,
  MOCK_DASHBOARD_SYSTEM_STATUS,
  MOCK_DASHBOARD_KPI,
} from './mockData'

export const dashboardService = {
  async getKpiCards(): Promise<KpiCard[]> {
    // return api.get('/dashboard/kpi')
    await new Promise((r) => setTimeout(r, 200))

    return MOCK_DASHBOARD_KPI
  },

  async getRecentRequests(): Promise<RecentRequest[]> {
    // return api.get('/requests?limit=5')
    await new Promise((r) => setTimeout(r, 200))

    return MOCK_REQUESTS.slice(0, 5).map((r) => ({
      id: r.id,
      asset: r.assetName,
      author: r.authorName,
      status: r.status,
      priority: r.priority,
      time: '2 часа назад',
    }))
  },

  async getEvents(): Promise<EventItem[]> {
    // return api.get('/dashboard/events')
    await new Promise((r) => setTimeout(r, 200))

    return MOCK_DASHBOARD_EVENTS
  },

  async getSystemStatus(): Promise<SystemStatusItem[]> {
    // return api.get('/monitoring/status')
    await new Promise((r) => setTimeout(r, 200))

    return MOCK_DASHBOARD_SYSTEM_STATUS
  },
}
