import api from './api'
import type { MonitoringData } from './models.ts'
import { MOCK_MONITORING } from './mockData'

export const monitoringService = {
  async getMonitoringData(): Promise<MonitoringData> {
    // const { data } = await api.get<MonitoringData>('/monitoring/status')
    // return data

    await new Promise((r) => setTimeout(r, 400))

    return MOCK_MONITORING
  },
}
