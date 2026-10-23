import {
  MOCK_ASSETS,
  MOCK_ASSET_HISTORY,
  MOCK_ASSET_ATTACHMENTS,
  MOCK_ASSET_TYPES,
  MOCK_LOCATIONS,
  MOCK_USERS,
} from './mockData'
import type { AssetFilter, AssetView, AssetHistoryView, AssetAttachment, Asset } from './models.ts'

export const assetService = {
  async getAssets(filter: AssetFilter): Promise<{ content: AssetView[]; totalElements: number }> {
    // const { data } = await api.get<{ content: AssetView[]; totalElements: number }>('/assets', { params: filter })
    // return data

    await new Promise((r) => setTimeout(r, 300))

    let filtered = MOCK_ASSETS.filter((a) => !a.isDeleted)

    if (filter.search) {
      const s = filter.search.toLowerCase()
      filtered = filtered.filter(
        (a) =>
          a.name.toLowerCase().includes(s) ||
          a.inventoryNumber.toLowerCase().includes(s) ||
          (a.serialNumber && a.serialNumber.toLowerCase().includes(s)),
      )
    }

    if (filter.status !== 'ALL') {
      filtered = filtered.filter((a) => a.status === filter.status)
    }

    const totalElements = filtered.length
    const start = (filter.page - 1) * filter.size
    const paginated = filtered.slice(start, start + filter.size)

    const content: AssetView[] = paginated.map((asset) => {
      const type = MOCK_ASSET_TYPES.find((t) => t.id === asset.assetTypeId)
      const location = MOCK_LOCATIONS.find((l) => l.id === asset.locationId)
      const respUser = MOCK_USERS.find((u) => u.id === asset.responsibleUserId)

      return {
        ...asset,
        assetType: { id: asset.assetTypeId, name: type?.name || 'Неизвестно' },
        location: { id: asset.locationId, name: location?.name || 'Неизвестно' },
        responsibleUser: respUser
          ? {
              id: respUser.id,
              lastName: respUser.lastName,
              firstName: respUser.firstName,
              middleName: respUser.middleName,
              role: respUser.role,
            }
          : null,
      }
    })

    return { content, totalElements }
  },

  async getAssetById(id: number): Promise<AssetView> {
    // const { data } = await api.get<AssetView>(`/assets/${id}`)
    // return data

    await new Promise((r) => setTimeout(r, 200))
    const asset = MOCK_ASSETS.find((a) => a.id === id && !a.isDeleted)
    if (!asset) throw new Error('Asset not found')

    const type = MOCK_ASSET_TYPES.find((t) => t.id === asset.assetTypeId)
    const location = MOCK_LOCATIONS.find((l) => l.id === asset.locationId)
    const respUser = MOCK_USERS.find((u) => u.id === asset.responsibleUserId)

    return {
      ...asset,
      assetType: { id: asset.assetTypeId, name: type?.name || 'Неизвестно' },
      location: { id: asset.locationId, name: location?.name || 'Неизвестно' },
      responsibleUser: respUser
        ? {
            id: respUser.id,
            lastName: respUser.lastName,
            firstName: respUser.firstName,
            middleName: respUser.middleName,
            role: respUser.role,
          }
        : null,
    }
  },

  async getAssetHistory(id: number): Promise<AssetHistoryView[]> {
    // const { data } = await api.get<AssetHistoryView[]>(`/assets/${id}/history`)
    // return data

    await new Promise((r) => setTimeout(r, 200))
    const rawHistory = MOCK_ASSET_HISTORY.filter((h) => h.assetId === id)

    return rawHistory.map((item) => {
      const user = MOCK_USERS.find((u) => u.id === item.userId)
      return {
        ...item,
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
  },

  async getAssetAttachments(id: number): Promise<AssetAttachment[]> {
    // const { data } = await api.get<AssetAttachment[]>(`/assets/${id}/attachments`)
    // return data

    await new Promise((r) => setTimeout(r, 200))
    return MOCK_ASSET_ATTACHMENTS.filter((att) => att.assetId === id && !att.isDeleted)
  },

  async updateAsset(id: number, payload: Partial<Asset>): Promise<AssetView> {
    // const { data } = await api.put<AssetView>(`/assets/${id}`, payload)
    // return data

    await new Promise((r) => setTimeout(r, 300))

    const index = MOCK_ASSETS.findIndex((a) => a.id === id)
    if (index === -1) throw new Error('Asset not found')

    const updated = { ...MOCK_ASSETS[index]!, ...payload }

    return this.getAssetById(updated.id)
  },
}
