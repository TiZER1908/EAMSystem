import api from './api'
import {
  MOCK_ASSET_TYPES,
  MOCK_LOCATIONS,
  MOCK_UNITS,
  MOCK_SPARE_PART_CATEGORIES,
} from './mockData'
import type { AssetType, Location, Unit, SparePartCategory, DictionaryShort } from './models'

export const dictionaryService = {
  async getAssetTypes(): Promise<AssetType[]> {
    const { data } = await api.get<AssetType[]>('/dictionaries/asset-types')
    return data
  },
  async createAssetType(payload: Partial<AssetType>): Promise<AssetType> {
    const { data } = await api.post<AssetType>('/dictionaries/asset-types', payload)
    return data
  },
  async updateAssetType(id: number, payload: Partial<AssetType>): Promise<AssetType> {
    const { data } = await api.put<AssetType>(`/dictionaries/asset-types/${id}`, payload)
    return data
  },
  async deleteAssetType(id: number): Promise<void> {
    await api.delete(`/dictionaries/asset-types/${id}`)
  },

  async getLocations(): Promise<Location[]> {
    const { data } = await api.get<Location[]>('/dictionaries/locations')
    return data
  },
  async createLocation(payload: Partial<Location>): Promise<Location> {
    const { data } = await api.post<Location>('/dictionaries/locations', payload)
    return data
  },
  async updateLocation(id: number, payload: Partial<Location>): Promise<Location> {
    const { data } = await api.put<Location>(`/dictionaries/locations/${id}`, payload)
    return data
  },
  async deleteLocation(id: number): Promise<void> {
    await api.delete(`/dictionaries/locations/${id}`)
  },

  async getUnits(): Promise<Unit[]> {
    const { data } = await api.get<Unit[]>('/dictionaries/units')
    return data
  },
  async createUnit(payload: Partial<Unit>): Promise<Unit> {
    const { data } = await api.post<Unit>('/dictionaries/units', payload)
    return data
  },
  async updateUnit(id: number, payload: Partial<Unit>): Promise<Unit> {
    const { data } = await api.put<Unit>(`/dictionaries/units/${id}`, payload)
    return data
  },
  async deleteUnit(id: number): Promise<void> {
    await api.delete(`/dictionaries/units/${id}`)
  },

  async getSparePartCategories(): Promise<SparePartCategory[]> {
    const { data } = await api.get<SparePartCategory[]>('/dictionaries/spare-part-categories')
    return data
  },
  async createSparePartCategory(payload: Partial<SparePartCategory>): Promise<SparePartCategory> {
    const { data } = await api.post<SparePartCategory>(
      '/dictionaries/spare-part-categories',
      payload,
    )
    return data
  },
  async updateSparePartCategory(
    id: number,
    payload: Partial<SparePartCategory>,
  ): Promise<SparePartCategory> {
    const { data } = await api.put<SparePartCategory>(
      `/dictionaries/spare-part-categories/${id}`,
      payload,
    )
    return data
  },
  async deleteSparePartCategory(id: number): Promise<void> {
    await api.delete(`/dictionaries/spare-part-categories/${id}`)
  },
}
