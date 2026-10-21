import api from './api'
import type { DictionaryType, DictionaryItem } from './models.ts'
import {
  MOCK_DICT_ASSET_TYPES,
  MOCK_DICT_DEPARTMENTS,
  MOCK_DICT_LOCATIONS,
  MOCK_DICT_UNITS,
  MOCK_DICT_SPARE_PART_CATEGORIES,
} from './mockData'

export const dictionaryService = {
  async getDictionaryItems(type: DictionaryType): Promise<DictionaryItem[]> {
    // const { data } = await api.get<DictionaryItem[]>(`/dictionaries/${type}`)
    // return data

    await new Promise((r) => setTimeout(r, 300))

    switch (type) {
      case 'ASSET_TYPES':
        return MOCK_DICT_ASSET_TYPES
      case 'DEPARTMENTS':
        return MOCK_DICT_DEPARTMENTS
      case 'LOCATIONS':
        return MOCK_DICT_LOCATIONS
      case 'UNITS':
        return MOCK_DICT_UNITS
      case 'SPARE_PART_CATEGORIES':
        return MOCK_DICT_SPARE_PART_CATEGORIES
      default:
        return []
    }
  },
}
