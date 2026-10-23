import {
  MOCK_ASSETS,
  MOCK_ASSET_HISTORY,
  MOCK_ASSET_ATTACHMENTS,
  MOCK_DICT_ASSET_TYPES,
  MOCK_DICT_LOCATIONS,
} from './mockData'
import type { Asset, AssetFilter, AssetHistory, AssetAttachment, DictionaryItem } from './models.ts'

export const assetService = {
  async getAssets(filter: AssetFilter): Promise<{ content: Asset[]; totalElements: number }> {
    // return api.get('/assets', { params: filter })
    await new Promise((r) => setTimeout(r, 300))

    let filtered = [...MOCK_ASSETS]

    if (filter.search) {
      const s = filter.search.toLowerCase()
      filtered = filtered.filter(
        (a) =>
          a.name.toLowerCase().includes(s) ||
          a.inventoryNumber.toLowerCase().includes(s) ||
          a.serialNumber.toLowerCase().includes(s),
      )
    }

    if (filter.status !== 'ALL') {
      filtered = filtered.filter((a) => a.status === filter.status)
    }

    const start = (filter.page - 1) * filter.size
    const content = filtered.slice(start, start + filter.size)

    return { content, totalElements: filtered.length }
  },

  async getAssetById(id: number): Promise<Asset> {
    // const { data } = await api.get<Asset>(`/assets/${id}`)
    // return data

    await new Promise((r) => setTimeout(r, 200))
    const asset = MOCK_ASSETS.find((a) => a.id === id)
    if (!asset) throw new Error('Asset not found')
    return asset as Asset
  },
  async getAssetHistory(id: number): Promise<AssetHistory[]> {
    // const { data } = await api.get<AssetHistory[]>(`/assets/${id}/history`)
    // return data

    await new Promise((r) => setTimeout(r, 200))
    return MOCK_ASSET_HISTORY[id] || []
  },

  async getAssetAttachments(id: number): Promise<AssetAttachment[]> {
    // const { data } = await api.get<AssetAttachment[]>(`/assets/${id}/attachments`)
    // return data

    await new Promise((r) => setTimeout(r, 200))
    return MOCK_ASSET_ATTACHMENTS[id] || []
  },

  async updateAsset(id: number, payload: Partial<Asset>): Promise<Asset> {
    // const { data } = await api.put<Asset>(`/assets/${id}`, payload)
    // return data

    await new Promise((r) => setTimeout(r, 300))

    const index = MOCK_ASSETS.findIndex((a) => a.id === id)
    if (index === -1) throw new Error('Asset not found')

    return { ...MOCK_ASSETS[index], ...payload } as Asset
  },

  async getAssetTypes(): Promise<DictionaryItem[]> {
    // const { data } = await api.get<DictionaryItem[]>('/dictionaries/asset-types')
    // return data
    return MOCK_DICT_ASSET_TYPES
  },

  async getLocations(): Promise<DictionaryItem[]> {
    // const { data } = await api.get<DictionaryItem[]>('/dictionaries/locations')
    // return data
    return MOCK_DICT_LOCATIONS
  },
}
