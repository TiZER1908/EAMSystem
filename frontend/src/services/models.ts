export type AssetStatus = 'ACTIVE' | 'UNDER_REPAIR' | 'INACTIVE' | 'DECOMMISSIONED'
export type RequestStatus = 'NEW' | 'ACCEPTED' | 'IN_PROGRESS' | 'CLOSED' | 'REJECTED' | 'CANCELLED'
export type RequestPriority = 'LOW' | 'NORMAL' | 'HIGH' | 'CRITICAL'
export type UserRole = 'ADMIN' | 'MASTER' | 'TECHNICIAN' | 'REQUESTER'
export type UserStatus = 'ACTIVE' | 'BLOCKED'
export type SparePartStatus = 'ACTIVE' | 'ARCHIVED'
export type WorkOrderStatus =
  'DRAFT' | 'ASSIGNED' | 'IN_PROGRESS' | 'COMPLETED' | 'CLOSED' | 'CANCELLED'
export type AssetHistoryType = 'CREATED' | 'STATUS_CHANGED' | 'REPAIR' | 'MOVED' | 'COMMENT'
export type AttachmentType = 'INSTRUCTION' | 'PASSPORT' | 'PHOTO'

export interface BaseEntity {
  isDeleted: boolean
  deletedAt: string | null
  deletedBy: number | null
}

export interface User extends BaseEntity {
  id: number
  username: string
  email: string
  passwordHash: string
  lastName: string
  firstName: string
  middleName: string | null
  phone: string | null
  role: UserRole
  status: UserStatus
  createdAt: string
  updatedAt: string
}

export interface AssetType {
  id: number
  name: string
  description: string | null
}

export interface Location {
  id: number
  name: string
  parentLocationId: number | null
  description: string | null
}

export interface SparePartCategory {
  id: number
  name: string
}

export interface Unit {
  id: number
  name: string
  shortName: string
}

export interface Asset extends BaseEntity {
  id: number
  inventoryNumber: string
  name: string
  assetTypeId: number
  model: string | null
  serialNumber: string | null
  commissionDate: string | null
  locationId: number
  responsibleUserId: number | null
  status: AssetStatus
  createdAt: string
  updatedAt: string
}

export interface AssetAttachment extends BaseEntity {
  id: number
  assetId: number
  fileName: string
  filePath: string
  fileSize: number
  contentType: string
  attachmentType: AttachmentType
  createdAt: string
}

export interface Request extends BaseEntity {
  id: number
  assetId: number
  authorId: number
  description: string
  priority: RequestPriority
  status: RequestStatus
  rejectionReason: string | null
  createdAt: string
  updatedAt: string
}

export interface RequestAttachment extends BaseEntity {
  id: number
  requestId: number
  fileName: string
  filePath: string
  fileSize: number
  contentType: string
  createdAt: string
}

export interface WorkOrder extends BaseEntity {
  id: number
  requestId: number | null
  assetId: number
  masterId: number
  technicianId: number | null
  status: WorkOrderStatus
  plannedStartDate: string | null
  plannedEndDate: string | null
  actualStartDate: string | null
  actualEndDate: string | null
  cancelReason: string | null
  createdAt: string
  updatedAt: string
}

export interface WorkOrderTask extends BaseEntity {
  id: number
  workOrderId: number
  name: string
  volume: string | null
  isCompleted: boolean
  completedAt: string | null
  sortOrder: number
}

export interface WorkOrderAttachment extends BaseEntity {
  id: number
  workOrderId: number
  fileName: string
  filePath: string
  fileSize: number
  contentType: string
  createdAt: string
}

export interface SparePart extends BaseEntity {
  id: number
  name: string
  article: string | null
  categoryId: number | null
  unitId: number | null
  stockQuantity: number
  status: SparePartStatus
  createdAt: string
  updatedAt: string
}

export interface WorkOrderSparePart extends BaseEntity {
  id: number
  workOrderId: number
  sparePartId: number
  plannedQuantity: number | null
  actualQuantity: number | null
  isPlanned: boolean
}

export interface Comment extends BaseEntity {
  id: number
  authorId: number
  requestId: number | null
  workOrderId: number | null
  text: string
  createdAt: string
}

export interface AssetHistory {
  id: number
  assetId: number
  eventType: AssetHistoryType
  description: string | null
  oldValue: string | null
  newValue: string | null
  userId: number | null
  workOrderId: number | null
  createdAt: string
}

export interface Notification {
  id: number
  userId: number
  type: string
  message: string
  isRead: boolean
  relatedEntityId: number | null
  relatedEntityType: string | null
  createdAt: string
}

export interface AuditLog {
  id: number
  userId: number | null
  action: string
  entityType: string
  entityId: number | null
  details: string | null
  ipAddress: string | null
  createdAt: string
}

export interface AssetFilter {
  search: string
  status: AssetStatus | 'ALL'
  page: number
  size: number
}
export interface RequestFilter {
  search: string
  status: RequestStatus | 'ALL'
  authorId?: number
  page: number
  size: number
}
export interface WorkOrderFilter {
  search: string
  status: WorkOrderStatus | 'ALL'
  technicianId?: number
  page: number
  size: number
}
export interface UserFilter {
  search: string
  role: UserRole | 'ALL'
  page: number
  size: number
}
export interface SparePartFilter {
  search: string
  categoryId?: number
  page: number
  size: number
}
export interface AuditEventFilter {
  search: string
  action: string
  dateFrom: string
  dateTo: string
  page: number
  size: number
}

export interface UserShort {
  id: number
  lastName: string
  firstName: string
  middleName: string | null
  role: UserRole
}

export interface AssetShort {
  id: number
  inventoryNumber: string
  name: string
}

export interface RequestShort {
  id: number
  status: RequestStatus
}

export interface DictionaryShort {
  id: number
  name: string
  shortName?: string | null
}

export interface AssetView extends Asset {
  assetType: DictionaryShort
  location: DictionaryShort
  responsibleUser: UserShort | null
}

export interface RequestView extends Request {
  asset: AssetShort
  author: UserShort
}

export interface WorkOrderView extends WorkOrder {
  asset: AssetShort
  master: UserShort
  technician: UserShort | null
  request: RequestShort | null
}

export interface SparePartView extends SparePart {
  category: DictionaryShort | null
  unit: DictionaryShort | null
}

export interface UserView extends User {
  fullName: string
}

export interface AssetHistoryView extends AssetHistory {
  user: UserShort | null
}

export interface WorkOrderDetailView extends WorkOrderView {
  tasks: WorkOrderTask[]
  spareParts: (WorkOrderSparePart & { sparePartName: string })[]
}

export interface RecentRequest {
  id: number
  assetName: string
  authorName: string
  status: RequestStatus
  priority: RequestPriority
  time: string
}

export interface KpiCard {
  id: string
  label: string
  value: number
  subtitle: string
  color: 'blue' | 'orange' | 'green' | 'red'
  roles: string[]
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
