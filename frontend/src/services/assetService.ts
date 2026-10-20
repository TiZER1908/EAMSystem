export type AssetStatus = 'ACTIVE' | 'UNDER_REPAIR' | 'INACTIVE' | 'DECOMMISSIONED'

export interface Asset {
  id: number
  inventoryNumber: string
  name: string
  assetTypeName: string
  model: string
  serialNumber: string
  locationName: string
  responsibleUserName: string
  status: AssetStatus
  commissionDate: string
}

export interface AssetFilter {
  search: string
  status: AssetStatus | 'ALL'
  page: number
  size: number
}

export const assetService = {
  async getAssets(filter: AssetFilter): Promise<{ content: Asset[]; totalElements: number }> {
    // return api.get('/assets', { params: filter })
    await new Promise((r) => setTimeout(r, 300))

    const allAssets: Asset[] = [
      {
        id: 1,
        inventoryNumber: 'INV-001',
        name: 'Станок ЧПУ',
        assetTypeName: 'Станок',
        model: 'Haas VF-2',
        serialNumber: 'SN-12345',
        locationName: 'Цех №1',
        responsibleUserName: 'Петров П.П.',
        status: 'ACTIVE',
        commissionDate: '2020-05-15',
      },
      {
        id: 2,
        inventoryNumber: 'INV-002',
        name: 'Компрессор',
        assetTypeName: 'Компрессор',
        model: 'Atlas Copco GA-30',
        serialNumber: 'SN-67890',
        locationName: 'Цех №1',
        responsibleUserName: 'Иванов И.И.',
        status: 'UNDER_REPAIR',
        commissionDate: '2019-11-20',
      },
      {
        id: 3,
        inventoryNumber: 'INV-003',
        name: 'Сервер Dell R740',
        assetTypeName: 'Сервер',
        model: 'Dell PowerEdge',
        serialNumber: 'SN-11111',
        locationName: 'Серверная',
        responsibleUserName: 'Сидоров С.С.',
        status: 'ACTIVE',
        commissionDate: '2021-02-10',
      },
      {
        id: 4,
        inventoryNumber: 'INV-004',
        name: 'Конвейер',
        assetTypeName: 'Конвейер',
        model: 'Л-2',
        serialNumber: 'SN-22222',
        locationName: 'Цех №2',
        responsibleUserName: 'Кузнецов К.К.',
        status: 'INACTIVE',
        commissionDate: '2018-08-01',
      },
      {
        id: 5,
        inventoryNumber: 'INV-005',
        name: 'Насос',
        assetTypeName: 'Насос',
        model: 'Н-5',
        serialNumber: 'SN-33333',
        locationName: 'Цех №2',
        responsibleUserName: 'Морозов М.М.',
        status: 'ACTIVE',
        commissionDate: '2022-01-15',
      },
      {
        id: 6,
        inventoryNumber: 'INV-006',
        name: 'Станок фрезерный',
        assetTypeName: 'Станок',
        model: 'DMG MORI',
        serialNumber: 'SN-44444',
        locationName: 'Цех №1',
        responsibleUserName: 'Петров П.П.',
        status: 'ACTIVE',
        commissionDate: '2020-09-12',
      },
      {
        id: 7,
        inventoryNumber: 'INV-007',
        name: 'Кран мостовой',
        assetTypeName: 'Кран',
        model: 'КМ-10',
        serialNumber: 'SN-55555',
        locationName: 'Цех №3',
        responsibleUserName: 'Волков В.В.',
        status: 'DECOMMISSIONED',
        commissionDate: '2010-03-20',
      },
      {
        id: 8,
        inventoryNumber: 'INV-008',
        name: 'Генератор',
        assetTypeName: 'Генератор',
        model: 'Caterpillar',
        serialNumber: 'SN-66666',
        locationName: 'Электрощитовая',
        responsibleUserName: 'Соколов С.С.',
        status: 'ACTIVE',
        commissionDate: '2021-06-30',
      },
      {
        id: 9,
        inventoryNumber: 'INV-009',
        name: 'Пресс гидравлический',
        assetTypeName: 'Пресс',
        model: 'ПГ-100',
        serialNumber: 'SN-77777',
        locationName: 'Цех №2',
        responsibleUserName: 'Кузнецов К.К.',
        status: 'UNDER_REPAIR',
        commissionDate: '2019-04-05',
      },
      {
        id: 10,
        inventoryNumber: 'INV-010',
        name: 'Сварочный аппарат',
        assetTypeName: 'Сварочное оборудование',
        model: 'Kemppi',
        serialNumber: 'SN-88888',
        locationName: 'Цех №1',
        responsibleUserName: 'Иванов И.И.',
        status: 'ACTIVE',
        commissionDate: '2023-03-11',
      },
      {
        id: 11,
        inventoryNumber: 'INV-011',
        name: 'Станок токарный',
        assetTypeName: 'Станок',
        model: 'Т-500',
        serialNumber: 'SN-99999',
        locationName: 'Цех №1',
        responsibleUserName: 'Петров П.П.',
        status: 'ACTIVE',
        commissionDate: '2017-12-01',
      },
      {
        id: 12,
        inventoryNumber: 'INV-012',
        name: 'Робот-манипулятор',
        assetTypeName: 'Робот',
        model: 'KUKA KR-6',
        serialNumber: 'SN-10101',
        locationName: 'Цех №2',
        responsibleUserName: 'Сидоров С.С.',
        status: 'ACTIVE',
        commissionDate: '2022-10-20',
      },
      {
        id: 13,
        inventoryNumber: 'INV-013',
        name: 'Кондиционер',
        assetTypeName: 'Климатическое оборудование',
        model: 'Daikin',
        serialNumber: 'SN-20202',
        locationName: 'Офис',
        responsibleUserName: 'Морозов М.М.',
        status: 'INACTIVE',
        commissionDate: '2016-07-14',
      },
      {
        id: 14,
        inventoryNumber: 'INV-014',
        name: 'Источник питания',
        assetTypeName: 'Электрооборудование',
        model: 'APC Smart-UPS',
        serialNumber: 'SN-30303',
        locationName: 'Серверная',
        responsibleUserName: 'Соколов С.С.',
        status: 'ACTIVE',
        commissionDate: '2021-11-02',
      },
      {
        id: 15,
        inventoryNumber: 'INV-015',
        name: 'Шлифовальный станок',
        assetTypeName: 'Станок',
        model: 'Ш-200',
        serialNumber: 'SN-40404',
        locationName: 'Цех №3',
        responsibleUserName: 'Волков В.В.',
        status: 'DECOMMISSIONED',
        commissionDate: '2012-02-28',
      },
    ]

    let filtered = [...allAssets]

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
}
