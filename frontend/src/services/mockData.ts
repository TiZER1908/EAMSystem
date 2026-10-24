import type {
  Asset,
  AssetStatus,
  Request,
  RequestStatus,
  WorkOrder,
  WorkOrderStatus,
  SparePart,
  User,
  AssetType,
  Location,
  Unit,
  SparePartCategory,
  AssetHistory,
  AssetAttachment,
  AuditLog,
  KpiCard,
  SystemStatusItem,
  MonitoringData,
  RequestPriority,
  ReportData,
} from './models'

export const MOCK_ASSET_TYPES: AssetType[] = [
  { id: 1, name: 'Станок', description: 'Металлообрабатывающее оборудование' },
  { id: 2, name: 'Компрессор', description: 'Оборудование для сжатия воздуха' },
  { id: 3, name: 'Сервер', description: 'Вычислительная техника' },
  { id: 4, name: 'Насос', description: 'Насосное оборудование' },
  { id: 5, name: 'Кран', description: 'Грузоподъемное оборудование' },
  { id: 6, name: 'Генератор', description: 'Электрогенератор' },
]

export const MOCK_LOCATIONS: Location[] = [
  { id: 1, name: 'Цех №1, Участок А', parentLocationId: null, description: null },
  { id: 2, name: 'Цех №1, Участок Б', parentLocationId: null, description: null },
  { id: 3, name: 'Цех №2, Участок А', parentLocationId: null, description: null },
  { id: 4, name: 'Серверная, Стойка 1', parentLocationId: null, description: null },
]

export const MOCK_UNITS: Unit[] = [
  { id: 1, name: 'Штука', shortName: 'шт' },
  { id: 2, name: 'Килограмм', shortName: 'кг' },
  { id: 3, name: 'Метр', shortName: 'м' },
  { id: 4, name: 'Литр', shortName: 'л' },
]

export const MOCK_SPARE_PART_CATEGORIES: SparePartCategory[] = [
  { id: 1, name: 'Подшипники' },
  { id: 2, name: 'Ремни' },
  { id: 3, name: 'Расходные материалы' },
  { id: 4, name: 'Фильтры' },
  { id: 5, name: 'Уплотнения' },
  { id: 6, name: 'Электрика' },
]

export const MOCK_USERS: User[] = [
  {
    id: 1,
    username: 'admin',
    email: 'admin@eam.local',
    passwordHash: 'hash',
    lastName: 'Администратор',
    firstName: 'Системы',
    middleName: null,
    phone: null,
    role: 'ADMIN',
    status: 'ACTIVE',
    createdAt: '2026-01-10T10:00:00',
    updatedAt: '2026-01-10T10:00:00',
    isDeleted: false,
    deletedAt: null,
    deletedBy: null,
  },
  {
    id: 2,
    username: 'master1',
    email: 'ivanov@eam.local',
    passwordHash: 'hash',
    lastName: 'Иванов',
    firstName: 'Иван',
    middleName: 'Иванович',
    phone: '+7 (999) 123-45-67',
    role: 'MASTER',
    status: 'ACTIVE',
    createdAt: '2026-02-15T09:30:00',
    updatedAt: '2026-02-15T09:30:00',
    isDeleted: false,
    deletedAt: null,
    deletedBy: null,
  },
  {
    id: 3,
    username: 'tech1',
    email: 'petrov@eam.local',
    passwordHash: 'hash',
    lastName: 'Петров',
    firstName: 'Пётр',
    middleName: 'Петрович',
    phone: null,
    role: 'TECHNICIAN',
    status: 'ACTIVE',
    createdAt: '2026-03-20T14:15:00',
    updatedAt: '2026-03-20T14:15:00',
    isDeleted: false,
    deletedAt: null,
    deletedBy: null,
  },
  {
    id: 4,
    username: 'tech2',
    email: 'sidorov@eam.local',
    passwordHash: 'hash',
    lastName: 'Сидоров',
    firstName: 'Сидор',
    middleName: 'Сидорович',
    phone: null,
    role: 'TECHNICIAN',
    status: 'ACTIVE',
    createdAt: '2026-04-11T11:00:00',
    updatedAt: '2026-04-11T11:00:00',
    isDeleted: false,
    deletedAt: null,
    deletedBy: null,
  },
  {
    id: 5,
    username: 'user1',
    email: 'kuznetsov@eam.local',
    passwordHash: 'hash',
    lastName: 'Кузнецов',
    firstName: 'Кузьма',
    middleName: 'Кузьмич',
    phone: null,
    role: 'REQUESTER',
    status: 'BLOCKED',
    createdAt: '2026-05-05T16:45:00',
    updatedAt: '2026-05-05T16:45:00',
    isDeleted: false,
    deletedAt: null,
    deletedBy: null,
  },
  {
    id: 6,
    username: 'master2',
    email: 'morozov@eam.local',
    passwordHash: 'hash',
    lastName: 'Морозов',
    firstName: 'Михаил',
    middleName: 'Михайлович',
    phone: null,
    role: 'MASTER',
    status: 'ACTIVE',
    createdAt: '2026-06-01T08:20:00',
    updatedAt: '2026-06-01T08:20:00',
    isDeleted: false,
    deletedAt: null,
    deletedBy: null,
  },
  {
    id: 7,
    username: 'user2',
    email: 'volkov@eam.local',
    passwordHash: 'hash',
    lastName: 'Волков',
    firstName: 'Владимир',
    middleName: 'Владимирович',
    phone: null,
    role: 'REQUESTER',
    status: 'ACTIVE',
    createdAt: '2026-07-14T13:10:00',
    updatedAt: '2026-07-14T13:10:00',
    isDeleted: false,
    deletedAt: null,
    deletedBy: null,
  },
  {
    id: 8,
    username: 'tech3',
    email: 'sokolov@eam.local',
    passwordHash: 'hash',
    lastName: 'Соколов',
    firstName: 'Сергей',
    middleName: 'Сергеевич',
    phone: null,
    role: 'TECHNICIAN',
    status: 'ACTIVE',
    createdAt: '2026-08-20T10:00:00',
    updatedAt: '2026-08-20T10:00:00',
    isDeleted: false,
    deletedAt: null,
    deletedBy: null,
  },
  {
    id: 9,
    username: 'user3',
    email: 'lebedev@eam.local',
    passwordHash: 'hash',
    lastName: 'Лебедев',
    firstName: 'Леонид',
    middleName: 'Леонидович',
    phone: null,
    role: 'REQUESTER',
    status: 'ACTIVE',
    createdAt: '2026-09-01T12:00:00',
    updatedAt: '2026-09-01T12:00:00',
    isDeleted: false,
    deletedAt: null,
    deletedBy: null,
  },
]

export const MOCK_ASSETS: Asset[] = Array.from({ length: 25 }, (_, i) => {
  const id = i + 1
  const statuses: Asset['status'][] = [
    'ACTIVE',
    'ACTIVE',
    'UNDER_REPAIR',
    'INACTIVE',
    'DECOMMISSIONED',
  ]
  return {
    id,
    inventoryNumber: `INV-${String(id).padStart(3, '0')}`,
    name: `Оборудование #${id}`,
    assetTypeId: (i % 6) + 1,
    model: `Модель-${id}`,
    serialNumber: `SN-${10000 + id}`,
    commissionDate: `202${i % 5}-0${(i % 9) + 1}-15`,
    locationId: (i % 4) + 1,
    responsibleUserId: (i % 7) + 2,
    status: statuses[i % 5] as AssetStatus,
    createdAt: '2026-01-01T10:00:00',
    updatedAt: '2026-01-01T10:00:00',
    isDeleted: false,
    deletedAt: null,
    deletedBy: null,
  }
})
MOCK_ASSETS[0]!.name = 'Станок ЧПУ Haas'
MOCK_ASSETS[1]!.name = 'Компрессор Atlas Copco'
MOCK_ASSETS[2]!.name = 'Сервер Dell PowerEdge'

export const MOCK_REQUESTS: Request[] = Array.from({ length: 120 }, (_, i) => {
  const priorities: Request['priority'][] = ['LOW', 'NORMAL', 'HIGH', 'CRITICAL']
  const statuses: Request['status'][] = [
    'NEW',
    'ACCEPTED',
    'IN_PROGRESS',
    'CLOSED',
    'REJECTED',
    'CANCELLED',
  ]
  return {
    id: 101 + i,
    assetId: (i % 25) + 1,
    authorId: (i % 7) + 2,
    description: `Неисправность оборудования (Заявка #${101 + i})`,
    priority: priorities[i % 4] as RequestPriority,
    status: statuses[i % 6] as RequestStatus,
    rejectionReason: i % 6 === 4 ? 'Не гарантийный случай' : null,
    createdAt: new Date(Date.now() - i * 3600000).toISOString(),
    updatedAt: new Date(Date.now() - i * 3600000).toISOString(),
    isDeleted: false,
    deletedAt: null,
    deletedBy: null,
  }
})

MOCK_REQUESTS[0]!.authorId = 1

export const MOCK_WORK_ORDERS: WorkOrder[] = Array.from({ length: 80 }, (_, i) => {
  const statuses: WorkOrder['status'][] = [
    'DRAFT',
    'ASSIGNED',
    'IN_PROGRESS',
    'COMPLETED',
    'CLOSED',
    'CANCELLED',
  ]
  const isDraft = i % 6 === 0
  return {
    id: 201 + i,
    requestId: i % 2 === 0 ? 101 + i : null,
    assetId: (i % 25) + 1,
    masterId: i % 2 === 0 ? 2 : 6,
    technicianId: isDraft ? null : (i % 3) + 3,
    status: statuses[i % 6] as WorkOrderStatus,
    plannedStartDate: `2026-10-${String((i % 28) + 1).padStart(2, '0')}`,
    plannedEndDate: `2026-10-${String((i % 28) + 2).padStart(2, '0')}`,
    actualStartDate: i % 6 > 1 ? `2026-10-${String((i % 28) + 1).padStart(2, '0')}T09:00:00` : null,
    actualEndDate: i % 6 > 3 ? `2026-10-${String((i % 28) + 2).padStart(2, '0')}T15:00:00` : null,
    cancelReason: i % 6 === 5 ? 'Отменено мастером' : null,
    createdAt: new Date(Date.now() - i * 7200000).toISOString(),
    updatedAt: new Date(Date.now() - i * 7200000).toISOString(),
    isDeleted: false,
    deletedAt: null,
    deletedBy: null,
  }
})

export const MOCK_SPARE_PARTS: SparePart[] = [
  {
    id: 1,
    name: 'Подшипник 6204',
    article: 'BRG-6204',
    categoryId: 1,
    unitId: 1,
    stockQuantity: 45,
    status: 'ACTIVE',
    createdAt: '2026-01-01T10:00:00',
    updatedAt: '2026-01-01T10:00:00',
    isDeleted: false,
    deletedAt: null,
    deletedBy: null,
  },
  {
    id: 2,
    name: 'Ремень приводной A-1000',
    article: 'BLT-A1000',
    categoryId: 2,
    unitId: 1,
    stockQuantity: 12,
    status: 'ACTIVE',
    createdAt: '2026-01-01T10:00:00',
    updatedAt: '2026-01-01T10:00:00',
    isDeleted: false,
    deletedAt: null,
    deletedBy: null,
  },
  {
    id: 3,
    name: 'Масло моторное 5W-40',
    article: 'OIL-5W40',
    categoryId: 3,
    unitId: 4,
    stockQuantity: 20,
    status: 'ACTIVE',
    createdAt: '2026-01-01T10:00:00',
    updatedAt: '2026-01-01T10:00:00',
    isDeleted: false,
    deletedAt: null,
    deletedBy: null,
  },
]

export const MOCK_ASSET_HISTORY: AssetHistory[] = [
  {
    id: 1,
    assetId: 1,
    eventType: 'CREATED',
    description: 'Актив добавлен в систему',
    oldValue: null,
    newValue: null,
    userId: 1,
    workOrderId: null,
    createdAt: '2020-05-15T10:00:00',
  },
  {
    id: 2,
    assetId: 1,
    eventType: 'STATUS_CHANGED',
    description: 'Смена статуса',
    oldValue: 'INACTIVE',
    newValue: 'ACTIVE',
    userId: 2,
    workOrderId: null,
    createdAt: '2020-05-16T09:00:00',
  },
]

export const MOCK_ASSET_ATTACHMENTS: AssetAttachment[] = [
  {
    id: 1,
    assetId: 1,
    fileName: 'passport_haas_vf2.pdf',
    filePath: '/files/assets/1/passport.pdf',
    fileSize: 1048576,
    contentType: 'application/pdf',
    attachmentType: 'PASSPORT',
    createdAt: '2020-05-15T10:30:00',
    isDeleted: false,
    deletedAt: null,
    deletedBy: null,
  },
  {
    id: 2,
    assetId: 1,
    fileName: 'main_photo.jpg',
    filePath: '/files/assets/1/photo.jpg',
    fileSize: 2097152,
    contentType: 'image/jpeg',
    attachmentType: 'PHOTO',
    createdAt: '2020-05-15T10:35:00',
    isDeleted: false,
    deletedAt: null,
    deletedBy: null,
  },
]

export const MOCK_AUDIT_EVENTS: AuditLog[] = Array.from({ length: 30 }, (_, i) => ({
  id: i + 1,
  userId: (i % 3) + 1,
  action: ['CREATE', 'UPDATE', 'LOGIN', 'FAILOVER'][i % 4] ?? 'CREATE',
  entityType: ['REQUEST', 'WORK_ORDER', 'USER', 'DATABASE'][i % 4] ?? 'REQUEST',
  entityId: i + 100,
  details: `Системное событие #${i + 1}`,
  ipAddress: `192.168.1.${i + 10}`,
  createdAt: new Date(Date.now() - i * 600000).toISOString(),
}))

export const MOCK_DASHBOARD_KPI: KpiCard[] = [
  {
    id: 'assets',
    label: 'Активы',
    value: MOCK_ASSETS.length,
    subtitle: 'всего на балансе',
    color: 'blue',
    roles: ['ADMIN', 'MASTER', 'TECHNICIAN'],
  },
  {
    id: 'requests',
    label: 'Открытые заявки',
    value: MOCK_REQUESTS.filter((r) => r.status === 'NEW').length,
    subtitle: 'ожидают обработки',
    color: 'orange',
    roles: ['ADMIN', 'MASTER', 'TECHNICIAN', 'REQUESTER'],
  },
  {
    id: 'work-orders',
    label: 'Наряды в работе',
    value: MOCK_WORK_ORDERS.filter((r) => r.status === 'IN_PROGRESS').length,
    subtitle: 'выполняются сейчас',
    color: 'green',
    roles: ['ADMIN', 'MASTER', 'TECHNICIAN'],
  },
  {
    id: 'overdue',
    label: 'Просрочено',
    value: 3,
    subtitle: 'требуют внимания',
    color: 'red',
    roles: ['ADMIN', 'MASTER'],
  },
]

export const MOCK_DASHBOARD_EVENTS = MOCK_AUDIT_EVENTS.filter(
  (r) => r.action !== 'LOGIN' && r.action !== 'LOGOUT',
).slice(0, 5)

export const MOCK_DASHBOARD_SYSTEM_STATUS: SystemStatusItem[] = [
  { name: 'Backend Spring Boot', status: 'up', value: 'работает' },
  { name: 'Кластер PostgreSQL', status: 'up', value: '3/3 узла' },
  { name: 'HAProxy', status: 'up', value: 'активен' },
  { name: 'Лаг репликации', status: 'warning', value: '12 МБ' },
]

export const MOCK_MONITORING: MonitoringData = {
  cluster: {
    leader: 'pg1',
    replicasCount: 2,
    maxReplicationLagMb: 0,
    haproxyStatus: 'UP',
    nodes: [{ name: 'pg1', role: 'Leader', state: 'running', lagMb: 0 }],
  },
  app: {
    health: 'UP',
    uptimeSeconds: 86400,
    version: '1.0.0',
    httpRequestsPerSecond: 15,
    httpAvgResponseTimeMs: 45,
    errorRatePercentage: 0.2,
  },
  resources: {
    jvmHeapUsedMb: 256,
    jvmHeapMaxMb: 512,
    cpuUsagePercentage: 12,
    hikariActiveConnections: 3,
    hikariMaxConnections: 10,
    hikariPendingConnections: 0,
  },
  events: [{ id: 1, timestamp: '2026-10-17T10:05:00', type: 'INFO', message: 'Кластер работает' }],
}

export const MOCK_REPORT_MECHANICS: ReportData = {
  title: 'Загрузка механиков',
  headers: ['Механик', 'В работе', 'Выполнено', 'Просрочено'],
  rows: [
    ['Петров П.П.', '2', '15', '0'],
    ['Сидоров С.С.', '1', '12', '1'],
    ['Кузнецов К.К.', '0', '8', '0'],
    ['Волков В.В.', '3', '5', '2'],
    ['Соколов С.С.', '1', '10', '0'],
  ],
}

export const MOCK_REPORT_OPEN_REQUESTS: ReportData = {
  title: 'Открытые заявки',
  headers: ['ID', 'Оборудование', 'Автор', 'Приоритет', 'Дата создания'],
  rows: [
    ['#101', 'Станок ЧПУ Haas', 'Петров П.', 'Высокий', '17.10.2026'],
    ['#105', 'Насос центробежный', 'Иванов И.', 'Обычный', '17.10.2026'],
    ['#110', 'Станок токарный', 'Сидоров С.', 'Обычный', '15.10.2026'],
    ['#111', 'Робот-манипулятор KUKA', 'Петров П.', 'Критичный', '17.10.2026'],
    ['#117', 'Печь муфельная', 'Сидоров С.', 'Высокий', '17.10.2026'],
    ['#119', 'Станок ленточнопильный', 'Волков В.', 'Высокий', '16.10.2026'],
  ],
}

export const MOCK_REPORT_WORK_ORDERS_IN_PROGRESS: ReportData = {
  title: 'Наряды в работе',
  headers: ['ID', 'Оборудование', 'Исполнитель', 'Срок окончания'],
  rows: [
    ['#201', 'Сервер Dell PowerEdge', 'Петров П.', '18.10.2026'],
    ['#207', 'Станок сверлильный', 'Сидоров С.', '19.10.2026'],
    ['#209', 'Компрессор поршневой', 'Кузнецов К.', '18.10.2026'],
  ],
}

export const MOCK_REPORT_OVERDUE: ReportData = {
  title: 'Просроченные наряды',
  headers: ['ID', 'Оборудование', 'Исполнитель', 'Плановая дата', 'Просрочка (дней)'],
  rows: [['#206', 'Станок шлифовальный', 'Петров П.', '15.10.2026', '2']],
}

export const MOCK_REPORT_ASSET_HISTORY: ReportData = {
  title: 'История ремонтов оборудования',
  headers: ['Оборудование', 'Дата', 'Наряд', 'Исполнитель', 'Статус'],
  rows: [
    ['Станок ЧПУ Haas', '15.10.2026', '#204', 'Петров П.', 'Закрыт'],
    ['Компрессор Atlas Copco', '12.10.2026', '#205', 'Кузнецов К.', 'Выполнен'],
    ['Конвейер ленточный', '01.10.2026', '#199', 'Сидоров С.', 'Закрыт'],
  ],
}
