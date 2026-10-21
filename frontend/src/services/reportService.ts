import type { ReportParams, ReportData } from './models.ts'
import {
  MOCK_ASSETS,
  MOCK_REPORT_ASSET_HISTORY,
  MOCK_REPORT_MECHANICS,
  MOCK_REPORT_OPEN_REQUESTS,
  MOCK_REPORT_OVERDUE,
  MOCK_REPORT_WORK_ORDERS_IN_PROGRESS,
} from './mockData'

export const reportService = {
  async generateReport(params: ReportParams): Promise<ReportData> {
    // const { data } = await api.post<ReportData>('/reports/generate', params)
    // return data
    await new Promise((r) => setTimeout(r, 500))

    if (params.type === 'OPEN_REQUESTS') {
      return MOCK_REPORT_OPEN_REQUESTS
    }

    if (params.type === 'WORK_ORDERS_IN_PROGRESS') {
      return MOCK_REPORT_WORK_ORDERS_IN_PROGRESS
    }

    if (params.type === 'MECHANICS_WORKLOAD') {
      return MOCK_REPORT_MECHANICS
    }

    if (params.type === 'OVERDUE_WORK_ORDERS') {
      return MOCK_REPORT_OVERDUE
    }

    if (params.type === 'ASSET_HISTORY') {
      return MOCK_REPORT_ASSET_HISTORY
    }

    return {
      title: 'Отчет',
      headers: ['Данные'],
      rows: [['Нет данных за выбранный период']],
    }
  },
}
