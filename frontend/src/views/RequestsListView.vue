<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { requestService } from '@/services/requestService'
import type { Request, RequestStatus, RequestPriority } from '@/services/models.ts'

const authStore = useAuthStore
const role = computed(() => authStore.user.role)

const canCreate = computed(() => true)

const canSeeAll = computed(() => ['ADMIN', 'MASTER'].includes(role.value))

const requests = ref<Request[]>([])
const totalElements = ref(0)
const loading = ref(true)

const search = ref('')
const statusFilter = ref<RequestStatus | 'ALL'>('ALL')
const page = ref(1)
const size = ref(10)

async function loadRequests() {
  loading.value = true
  try {
    const currentUserId = canSeeAll.value ? undefined : 1

    const result = await requestService.getRequests({
      search: search.value,
      status: statusFilter.value,
      authorId: currentUserId,
      page: page.value,
      size: size.value,
    })
    requests.value = result.content
    totalElements.value = result.totalElements
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadRequests()
})

let searchTimeout: ReturnType<typeof setTimeout>
watch(search, () => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    page.value = 1
    loadRequests()
  }, 300)
})

watch(statusFilter, () => {
  page.value = 1
  loadRequests()
})

watch(page, () => {
  loadRequests()
})

const totalPages = computed(() => Math.ceil(totalElements.value / size.value))

function nextPage() {
  if (page.value < totalPages.value) page.value++
}

function prevPage() {
  if (page.value > 1) page.value--
}

function statusLabel(status: RequestStatus): string {
  const map: Record<RequestStatus, string> = {
    NEW: 'Новая',
    ACCEPTED: 'Принята',
    IN_PROGRESS: 'В работе',
    CLOSED: 'Закрыта',
    REJECTED: 'Отклонена',
    CANCELLED: 'Отменена',
  }
  return map[status]
}

function priorityLabel(priority: RequestPriority): string {
  const map: Record<RequestPriority, string> = {
    LOW: 'Низкий',
    NORMAL: 'Обычный',
    HIGH: 'Высокий',
    CRITICAL: 'Критичный',
  }
  return map[priority]
}

function formatDate(dateStr: string): string {
  if (!dateStr) return '—'
  const d = new Date(dateStr)
  return d.toLocaleDateString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}
</script>

<template>
  <div class="requests">
    <!-- Заголовок и кнопка создания -->
    <div class="requests__header">
      <div>
        <h1 class="requests__title">Заявки</h1>
        <p class="requests__subtitle">
          {{ canSeeAll ? 'Всего в системе' : 'Ваши заявки' }}: {{ totalElements }}
        </p>
      </div>

      <button v-if="canCreate" class="btn btn--primary"><span>+</span> Создать заявку</button>
    </div>

    <div class="requests__filters">
      <div class="filter-group">
        <label class="filter-label">Поиск</label>
        <input
          v-model="search"
          type="text"
          class="filter-input"
          placeholder="Поиск по оборудованию, описанию или автору..."
        />
      </div>

      <div class="filter-group">
        <label class="filter-label">Статус</label>
        <select v-model="statusFilter" class="filter-select">
          <option value="ALL">Все</option>
          <option value="NEW">Новая</option>
          <option value="ACCEPTED">Принята</option>
          <option value="IN_PROGRESS">В работе</option>
          <option value="CLOSED">Закрыта</option>
          <option value="REJECTED">Отклонена</option>
          <option value="CANCELLED">Отменена</option>
        </select>
      </div>
    </div>

    <div class="table-wrapper">
      <div v-if="loading" class="table-loading">Загрузка данных...</div>

      <table v-else class="table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Оборудование</th>
            <th>Описание</th>
            <th>Автор</th>
            <th>Приоритет</th>
            <th>Статус</th>
            <th>Дата создания</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="requests.length === 0">
            <td colspan="7" class="table-empty">Заявки не найдены</td>
          </tr>
          <tr v-for="req in requests" :key="req.id" class="table-row">
            <td class="table-cell--mono">#{{ req.id }}</td>
            <td>
              <div class="table-cell--bold">{{ req.assetName }}</div>
              <div class="table-cell--muted" style="font-size: 12px">{{ req.inventoryNumber }}</div>
            </td>
            <td class="table-cell--desc">{{ req.description }}</td>
            <td>{{ req.authorName }}</td>
            <td>
              <span class="badge" :class="`badge--priority-${req.priority.toLowerCase()}`">
                {{ priorityLabel(req.priority) }}
              </span>
            </td>
            <td>
              <span class="badge" :class="`badge--status-${req.status.toLowerCase()}`">
                {{ statusLabel(req.status) }}
              </span>
            </td>
            <td class="table-cell--muted">{{ formatDate(req.createdAt) }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-if="totalPages > 1" class="pagination">
      <button class="pagination__btn" :disabled="page === 1" @click="prevPage">← Назад</button>
      <span class="pagination__info">Страница {{ page }} из {{ totalPages }}</span>
      <button class="pagination__btn" :disabled="page === totalPages" @click="nextPage">
        Вперёд →
      </button>
    </div>
  </div>
</template>

<style scoped>
.requests {
  display: flex;
  flex-direction: column;
  gap: 20px;
  width: 100%;
}

.requests__header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
}

.requests__title {
  font-size: 24px;
  font-weight: 700;
  color: #1e293b;
  margin: 0 0 4px;
}

.requests__subtitle {
  font-size: 14px;
  color: #64748b;
  margin: 0;
}

.btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  border: none;
  transition: background 0.15s ease;
  font-family: inherit;
  white-space: nowrap;
}

.btn--primary {
  background: #3b82f6;
  color: #fff;
}

.btn--primary:hover {
  background: #2563eb;
}

.requests__filters {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
  background: #fff;
  padding: 16px 20px;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 200px;
  flex: 1;
}

.filter-label {
  font-size: 12px;
  font-weight: 500;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.filter-input,
.filter-select {
  padding: 9px 12px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 14px;
  color: #1e293b;
  background: #fff;
  font-family: inherit;
  transition: border-color 0.15s ease;
}

.filter-input:focus,
.filter-select:focus {
  outline: none;
  border-color: #3b82f6;
}

.table-wrapper {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  overflow-x: auto;
}

.table-loading,
.table-empty {
  padding: 40px;
  text-align: center;
  color: #94a3b8;
  font-size: 14px;
}

.table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
}

.table thead {
  background: #f8fafc;
  border-bottom: 1px solid #e2e8f0;
}

.table th {
  text-align: left;
  padding: 12px 16px;
  font-size: 12px;
  font-weight: 600;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  white-space: nowrap;
}

.table td {
  padding: 12px 16px;
  border-bottom: 1px solid #f1f5f9;
  color: #334155;
}

.table tbody tr:last-child td {
  border-bottom: none;
}

.table-row:hover {
  background: #f8fafc;
}

.table-cell--mono {
  font-family: 'Courier New', monospace;
  font-size: 13px;
  color: #64748b;
  white-space: nowrap;
}

.table-cell--bold {
  font-weight: 500;
  color: #1e293b;
}

.table-cell--muted {
  color: #94a3b8;
}

.table-cell--desc {
  max-width: 300px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.badge {
  display: inline-block;
  padding: 3px 8px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 500;
  white-space: nowrap;
}

.badge--priority-low {
  background: #f1f5f9;
  color: #64748b;
}
.badge--priority-normal {
  background: #dbeafe;
  color: #1e40af;
}
.badge--priority-high {
  background: #fef3c7;
  color: #92400e;
}
.badge--priority-critical {
  background: #fee2e2;
  color: #991b1b;
}

.badge--status-new {
  background: #dbeafe;
  color: #1e40af;
}
.badge--status-accepted {
  background: #e0e7ff;
  color: #3730a3;
}
.badge--status-in_progress {
  background: #fef3c7;
  color: #92400e;
}
.badge--status-closed {
  background: #d1fae5;
  color: #065f46;
}
.badge--status-rejected {
  background: #fee2e2;
  color: #991b1b;
}
.badge--status-cancelled {
  background: #f1f5f9;
  color: #64748b;
}

.pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
}

.pagination__btn {
  padding: 8px 14px;
  border: 1px solid #e2e8f0;
  background: #fff;
  border-radius: 8px;
  font-size: 13px;
  color: #334155;
  cursor: pointer;
  transition: background 0.15s ease;
  font-family: inherit;
}

.pagination__btn:hover:not(:disabled) {
  background: #f8fafc;
}

.pagination__btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.pagination__info {
  font-size: 13px;
  color: #64748b;
}
</style>
