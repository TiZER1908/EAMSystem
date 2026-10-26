import type { User, UserFilter, UserShort } from './models.ts'
import { MOCK_USERS } from './mockData'

import api from './api'

export function fullNameShortOneLetter(user: UserShort): string {
  let result = user.lastName
  result += ' ' + user.firstName[0] + '.'
  if (user.middleName) {
    result += ' ' + user.middleName[0] + '.'
  }
  return result
}

export function fullNameShort(user: UserShort): string {
  return [user.lastName, user.firstName, user.middleName].filter(Boolean).join(' ')
}

export function fullNameOneLetter(user: User): string {
  let result = user.lastName
  result += ' ' + user.firstName[0] + '.'
  if (user.middleName) {
    result += ' ' + user.middleName[0] + '.'
  }
  return result
}

export function fullName(user: User): string {
  return [user.lastName, user.firstName, user.middleName].filter(Boolean).join(' ')
}

export const userService = {
  async getUsers(filter: UserFilter): Promise<{ content: User[]; totalElements: number }> {
    // const { data } = await api.get('/users', { params: filter })
    // return data

    await new Promise((r) => setTimeout(r, 300))

    let filtered = [...MOCK_USERS]

    if (filter.search) {
      const s = filter.search.toLowerCase()
      filtered = filtered.filter(
        (u) =>
          u.username.toLowerCase().includes(s) ||
          u.firstName.toLowerCase().includes(s) ||
          u.middleName?.toLowerCase().includes(s) ||
          u.lastName.toLowerCase().includes(s) ||
          u.email.toLowerCase().includes(s),
      )
    }

    if (filter.role !== 'ALL') {
      filtered = filtered.filter((u) => u.role === filter.role)
    }

    const start = (filter.page - 1) * filter.size
    const content = filtered.slice(start, start + filter.size)

    return { content, totalElements: filtered.length }
  },

  async getUserById(id: number): Promise<User> {
    // const { data } = await api.get<User>(`/users/${id}`)
    // return data

    await new Promise((r) => setTimeout(r, 200))
    const user = MOCK_USERS.find((u) => u.id === id)
    if (!user) throw new Error('User not found')
    return user as User
  },

  async getUserByUsername(username: string): Promise<User> {
    // const { data } = await api.get<User>(`/users/${id}`)
    // return data

    await new Promise((r) => setTimeout(r, 200))
    const user = MOCK_USERS.find((u) => u.username === username)
    if (!user) throw new Error('User not found')
    return user as User
  },

  async updateUser(id: number, payload: Partial<User>): Promise<User> {
    // const { data } = await api.put<User>(`/users/${id}`, payload)
    // return data

    await new Promise((r) => setTimeout(r, 300))
    return { ...payload, id } as User
  },

  async blockUser(id: number): Promise<void> {
    // await api.patch(`/users/${id}/block`)
    await new Promise((r) => setTimeout(r, 300))
  },

  async unblockUser(id: number): Promise<void> {
    // await api.patch(`/users/${id}/unblock`)
    await new Promise((r) => setTimeout(r, 300))
  },

  async updateProfile(id: number, payload: Partial<User>): Promise<User> {
    // const { data } = await api.put<User>(`/users/${id}/profile`, payload)
    // return data

    await new Promise((r) => setTimeout(r, 300))
    return { ...payload, id } as User
  },

  async changePassword(
    id: number,
    payload: { currentPassword: string; newPassword: string },
  ): Promise<void> {
    // await api.post(`/users/${id}/change-password`, payload)
    await new Promise((r) => setTimeout(r, 300))
  },

  async createUser(payload: Partial<User> & { password?: string }): Promise<User> {
    // const { data } = await api.post<User>('/users', payload)
    // return data

    await new Promise((r) => setTimeout(r, 500))

    const newUser: User = {
      id: Date.now(),
      username: payload.username || '',
      email: payload.email || '',
      passwordHash: 'hash',
      lastName: payload.lastName || '',
      firstName: payload.firstName || '',
      middleName: payload.middleName || null,
      phone: payload.phone || null,
      role: payload.role || 'REQUESTER',
      status: 'ACTIVE',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isDeleted: false,
      deletedAt: null,
      deletedBy: null,
    }

    return newUser
  },
}
