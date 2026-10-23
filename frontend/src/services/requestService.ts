import type { RequestFilter, RequestView } from './models.ts'
import { MOCK_REQUESTS, MOCK_ASSETS, MOCK_USERS } from './mockData'

export const requestService = {
  async getRequests(
    filter: RequestFilter,
  ): Promise<{ content: RequestView[]; totalElements: number }> {
    // const { data } = await api.get<{ content: RequestView[]; totalElements: number }>('/requests', { params: filter })
    // return data

    await new Promise((r) => setTimeout(r, 300))

    let filtered = MOCK_REQUESTS.filter((r) => !r.isDeleted)

    if (filter.authorId) {
      filtered = filtered.filter((r) => r.authorId === filter.authorId)
    }

    if (filter.status !== 'ALL') {
      filtered = filtered.filter((r) => r.status === filter.status)
    }

    if (filter.search) {
      const s = filter.search.toLowerCase()
      filtered = filtered.filter((r) => {
        const asset = MOCK_ASSETS.find((a) => a.id === r.assetId)
        const author = MOCK_USERS.find((u) => u.id === r.authorId)

        const assetName = asset?.name.toLowerCase() || ''
        const inventoryNumber = asset?.inventoryNumber.toLowerCase() || ''
        const description = r.description.toLowerCase() || ''
        const authorName = `${author?.lastName} ${author?.firstName}`.toLowerCase() || ''

        return (
          assetName.includes(s) ||
          inventoryNumber.includes(s) ||
          description.includes(s) ||
          authorName.includes(s)
        )
      })
    }

    const totalElements = filtered.length
    const start = (filter.page - 1) * filter.size
    const paginated = filtered.slice(start, start + filter.size)

    const content: RequestView[] = paginated.map((req) => {
      const asset = MOCK_ASSETS.find((a) => a.id === req.assetId)
      const author = MOCK_USERS.find((u) => u.id === req.authorId)

      return {
        ...req,
        asset: {
          id: req.assetId,
          name: asset?.name || 'Неизвестно',
          inventoryNumber: asset?.inventoryNumber || '',
        },
        author: {
          id: req.authorId,
          lastName: author?.lastName || '',
          firstName: author?.firstName || '',
          middleName: author?.middleName || null,
          role: author?.role || 'REQUESTER',
        },
      }
    })

    return { content, totalElements }
  },

  async getRequestById(id: number): Promise<RequestView> {
    // const { data } = await api.get<RequestView>(`/requests/${id}`)
    // return data

    await new Promise((r) => setTimeout(r, 200))
    const req = MOCK_REQUESTS.find((r) => r.id === id && !r.isDeleted)
    if (!req) throw new Error('Request not found')

    const asset = MOCK_ASSETS.find((a) => a.id === req.assetId)
    const author = MOCK_USERS.find((u) => u.id === req.authorId)

    return {
      ...req,
      asset: {
        id: req.assetId,
        name: asset?.name || 'Неизвестно',
        inventoryNumber: asset?.inventoryNumber || '',
      },
      author: {
        id: req.authorId,
        lastName: author?.lastName || '',
        firstName: author?.firstName || '',
        middleName: author?.middleName || null,
        role: author?.role || 'REQUESTER',
      },
    }
  },
}
