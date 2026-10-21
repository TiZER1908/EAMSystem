export type AssetStatus = 'ACTIVE' | 'UNDER_REPAIR' | 'INACTIVE' | 'DECOMMISSIONED'
export type RequestStatus = 'NEW' | 'ACCEPTED' | 'IN_PROGRESS' | 'CLOSED' | 'REJECTED' | 'CANCELLED'
export type RequestPriority = 'LOW' | 'NORMAL' | 'HIGH' | 'CRITICAL'
export type UserRole = 'ADMIN' | 'MASTER' | 'TECHNICIAN' | 'REQUESTER'
export type UserStatus = 'ACTIVE' | 'BLOCKED'
export type SparePartStatus = 'ACTIVE' | 'ARCHIVED'
export type WorkOrderStatus =
  'DRAFT' | 'ASSIGNED' | 'IN_PROGRESS' | 'COMPLETED' | 'CLOSED' | 'CANCELLED'
export type DictionaryType =
  'ASSET_TYPES' | 'DEPARTMENTS' | 'LOCATIONS' | 'UNITS' | 'SPARE_PART_CATEGORIES'

export interface BaseEntity {
  isDeleted: boolean
  deletedAt: string | null
  deletedBy: number | null
}

export interface Asset extends BaseEntity {
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

export interface KpiCard {
  id: string
  label: string
  value: number
  subtitle: string
  color: 'blue' | 'orange' | 'green' | 'red'
  roles: string[]
}

export interface RecentRequest {
  id: number
  asset: string
  author: string
  status: RequestStatus
  priority: RequestPriority
  time: string
}

export interface EventItem {
  id: number
  icon: string
  text: string
  time: string
  type: 'success' | 'info' | 'warning' | 'error'
}

export interface SystemStatusItem {
  name: string
  status: 'up' | 'warning' | 'down'
  value: string
}

export interface ClusterNode {
  name: string
  role: 'Leader' | 'Replica'
  state: 'running' | 'streaming' | 'stopped'
  lagMb: number
}

export interface MonitoringEvent {
  id: number
  timestamp: string
  type: 'INFO' | 'WARNING' | 'CRITICAL'
  message: string
}

export interface AppMetrics {
  health: 'UP' | 'DOWN'
  uptimeSeconds: number
  version: string
  httpRequestsPerSecond: number
  httpAvgResponseTimeMs: number
  errorRatePercentage: number
}

export interface ResourceMetrics {
  jvmHeapUsedMb: number
  jvmHeapMaxMb: number
  cpuUsagePercentage: number
  hikariActiveConnections: number
  hikariMaxConnections: number
  hikariPendingConnections: number
}

export interface MonitoringData {
  cluster: {
    leader: string
    replicasCount: number
    maxReplicationLagMb: number
    haproxyStatus: 'UP' | 'DOWN'
    nodes: ClusterNode[]
  }
  app: AppMetrics
  resources: ResourceMetrics
  events: MonitoringEvent[]
}

export type ReportType =
  | 'OPEN_REQUESTS'
  | 'WORK_ORDERS_IN_PROGRESS'
  | 'MECHANICS_WORKLOAD'
  | 'OVERDUE_WORK_ORDERS'
  | 'ASSET_HISTORY'

export interface ReportParams {
  type: ReportType
  dateFrom: string
  dateTo: string
}

export interface ReportData {
  title: string
  headers: string[]
  rows: string[][]
}

export interface Request extends BaseEntity {
  id: number
  assetName: string
  inventoryNumber: string
  authorName: string
  description: string
  priority: RequestPriority
  status: RequestStatus
  rejectionReason: string | null
  createdAt: string
}

export interface RequestFilter {
  search: string
  status: RequestStatus | 'ALL'
  authorId?: number
  page: number
  size: number
}

export interface SparePart extends BaseEntity {
  id: number
  name: string
  article: string
  categoryName: string
  unitName: string
  stockQuantity: number
  status: SparePartStatus
}

export interface SparePartFilter {
  search: string
  categoryId?: number
  page: number
  size: number
}

export interface User extends BaseEntity {
  id: number
  username: string
  email: string
  lastName: string
  firstName: string
  middleName: string | null
  phone: string | null
  role: UserRole
  status: UserStatus
  createdAt: string
}

export interface UserFilter {
  search: string
  role: UserRole | 'ALL'
  page: number
  size: number
}

export interface WorkOrder extends BaseEntity {
  id: number
  requestId: number | null
  assetName: string
  inventoryNumber: string
  masterName: string
  technicianName: string | null
  status: WorkOrderStatus
  plannedStartDate: string
  plannedEndDate: string
  actualStartDate: string | null
  actualEndDate: string | null
  cancelReason: string | null
  createdAt: string
}

export interface WorkOrderFilter {
  search: string
  status: WorkOrderStatus | 'ALL'
  technicianId?: number
  page: number
  size: number
}

export interface DictionaryItem {
  id: number
  name: string
  description?: string
  parentName?: string
  shortName?: string
}
