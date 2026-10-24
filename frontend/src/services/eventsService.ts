import api from './api'
import { MOCK_AUDIT_EVENTS, MOCK_USERS } from './mockData'
import type { AuditLogView, AuditEventFilter } from './models'

export const eventsService = {
  async getEvents(
    filter: AuditEventFilter,
  ): Promise<{ content: AuditLogView[]; totalElements: number }> {
    // const { data } = await api.get('/events', { params: filter })
    // return data

    await new Promise((r) => setTimeout(r, 300))

    let filtered = [...MOCK_AUDIT_EVENTS]

    if (filter.search) {
      const s = filter.search.toLowerCase()
      filtered = filtered.filter(
        (e) => e.details?.toLowerCase().includes(s) || e.entityType.toLowerCase().includes(s),
      )
    }

    if (filter.action !== 'ALL') {
      filtered = filtered.filter((e) => e.action === filter.action)
    }

    if (filter.dateFrom) {
      filtered = filtered.filter((e) => new Date(e.createdAt) >= new Date(filter.dateFrom))
    }

    if (filter.dateTo) {
      const to = new Date(filter.dateTo)
      to.setHours(23, 59, 59, 999)
      filtered = filtered.filter((e) => new Date(e.createdAt) <= to)
    }

    filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

    const start = (filter.page - 1) * filter.size
    const paginated = filtered.slice(start, start + filter.size)

    const content: AuditLogView[] = paginated.map((log) => {
      const user = MOCK_USERS.find((u) => u.id === log.userId)
      return {
        ...log,
        user: user
          ? {
              id: user.id,
              lastName: user.lastName,
              firstName: user.firstName,
              middleName: user.middleName,
              role: user.role,
            }
          : null,
      }
    })

    return { content, totalElements: filtered.length }
  },
}
