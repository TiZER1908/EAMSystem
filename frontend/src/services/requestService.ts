import type { RequestFilter, Request } from './models.ts'
import { MOCK_REQUESTS } from './mockData'

export const requestService = {
  async getRequests(filter: RequestFilter): Promise<{ content: Request[]; totalElements: number }> {
    // return api.get('/requests', { params: filter })
    await new Promise((r) => setTimeout(r, 300))

    let filtered = [...MOCK_REQUESTS]

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

  async getRequestById(id: number): Promise<Request> {
    // const { data } = await api.get<Request>(`/requests/${id}`)
    // return data

    await new Promise((r) => setTimeout(r, 200))
    const request = MOCK_REQUESTS.find((r) => r.id === id)
    if (!request) throw new Error('Request not found')
    return request as Request
  },
}
