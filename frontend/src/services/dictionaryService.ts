import api from './api'
import {
  MOCK_ASSET_TYPES,
  MOCK_LOCATIONS,
  MOCK_UNITS,
  MOCK_SPARE_PART_CATEGORIES,
} from './mockData'
import type { AssetType, Location, Unit, SparePartCategory } from './models'

export const dictionaryService = {
  async getAssetTypes(): Promise<AssetType[]> {
    // const { data } = await api.get<AssetType[]>('/dictionaries/asset-types')
    // return data

    await new Promise((r) => setTimeout(r, 200))
    return MOCK_ASSET_TYPES
  },

  async getLocations(): Promise<Location[]> {
    // const { data } = await api.get<Location[]>('/dictionaries/locations')
    // return data

    await new Promise((r) => setTimeout(r, 200))
    return MOCK_LOCATIONS
  },

  async getUnits(): Promise<Unit[]> {
    // const { data } = await api.get<Unit[]>('/dictionaries/units')
    // return data

    await new Promise((r) => setTimeout(r, 200))
    return MOCK_UNITS
  },

  async getSparePartCategories(): Promise<SparePartCategory[]> {
    // const { data } = await api.get<SparePartCategory[]>('/dictionaries/spare-part-categories')
    // return data

    await new Promise((r) => setTimeout(r, 200))
    return MOCK_SPARE_PART_CATEGORIES
  },
}
