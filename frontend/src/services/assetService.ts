import { MOCK_ASSETS } from './mockData'
import type { Asset, AssetFilter } from './models.ts'

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
}
