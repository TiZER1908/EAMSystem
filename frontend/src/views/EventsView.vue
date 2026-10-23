<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { eventsService } from '@/services/eventsService'
import type { AuditLog } from '@/services/models'

const authStore = useAuthStore
const role = computed(() => authStore.user.role)
const canView = computed(() => ['ADMIN', 'MASTER'].includes(role.value))

const events = ref<AuditLog[]>([])
const totalElements = ref(0)
const loading = ref(true)

const search = ref('')
const actionFilter = ref('ALL')
const dateFrom = ref('')
const dateTo = ref('')
const page = ref(1)
const size = ref(15)

const actions = [
  { value: 'ALL', label: 'Все действия' },
  { value: 'CREATE', label: 'Создание' },
  { value: 'UPDATE', label: 'Изменение' },
  { value: 'DELETE', label: 'Удаление / Архивация' },
  { value: 'LOGIN', label: 'Вход' },
  { value: 'LOGOUT', label: 'Выход' },
  { value: 'FAILOVER', label: 'Failover (система)' },
]

async function loadEvents() {
  if (!canView.value) return
  loading.value = true
  try {
    const result = await eventsService.getEvents({
      search: search.value,
      action: actionFilter.value,
      dateFrom: dateFrom.value,
      dateTo: dateTo.value,
      page: page.value,
      size: size.value,
    })
    events.value = result.content
    totalElements.value = result.totalElements
  } finally {
    loading.value = false
  }
}

onMounted(loadEvents)

let searchTimeout: ReturnType<typeof setTimeout>
watch(search, () => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    page.value = 1
    loadEvents()
  }, 300)
})

watch([actionFilter, dateFrom, dateTo], () => {
  page.value = 1
  loadEvents()
})

watch(page, loadEvents)

const totalPages = computed(() => Math.ceil(totalElements.value / size.value))

function nextPage() {
  if (page.value < totalPages.value) page.value++
}

function prevPage() {
  if (page.value > 1) page.value--
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function actionLabel(action: string): string {
  const map: Record<string, string> = {
    CREATE: 'Создание',
    UPDATE: 'Изменение',
    DELETE: 'Удаление',
    LOGIN: 'Вход',
    LOGOUT: 'Выход',
    FAILOVER: 'Failover',
    BLOCK: 'Блокировка',
    REJECT: 'Отклонение',
  }
  return map[action] ?? action
}

function actionClass(action: string): string {
  if (['DELETE', 'FAILOVER', 'REJECT'].includes(action)) return 'badge--danger'
  if (['CREATE'].includes(action)) return 'badge--success'
  if (['LOGIN', 'LOGOUT'].includes(action)) return 'badge--info'
  return 'badge--warning'
}
</script>

<template>
  <div class="events">
    <div v-if="!canView" class="no-access">У вас нет доступа к журналу событий.</div>

    <template v-else>
      <div class="events__header">
        <div>
          <h1 class="events__title">Журнал событий</h1>
          <p class="events__subtitle">Всего записей: {{ totalElements }}</p>
        </div>
      </div>

      <div class="events__filters">
        <div class="filter-group">
          <label class="filter-label">Поиск</label>
          <input
            v-model="search"
            type="text"
            class="filter-input"
            placeholder="Поиск по пользователю, деталям или типу сущности..."
          />
        </div>
        <div class="filter-group">
          <label class="filter-label">Действие</label>
          <select v-model="actionFilter" class="filter-select">
            <option v-for="a in actions" :key="a.value" :value="a.value">{{ a.label }}</option>
          </select>
        </div>
        <div class="filter-group">
          <label class="filter-label">С</label>
          <input v-model="dateFrom" type="date" class="filter-input" />
        </div>
        <div class="filter-group">
          <label class="filter-label">По</label>
          <input v-model="dateTo" type="date" class="filter-input" />
        </div>
      </div>

      <div class="table-wrapper">
        <div v-if="loading" class="table-loading">Загрузка данных...</div>

        <table v-else class="table">
          <thead>
            <tr>
              <th>Дата и время</th>
              <th>Пользователь</th>
              <th>Действие</th>
              <th>Объект</th>
              <th>Детали</th>
              <th>IP-адрес</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="events.length === 0">
              <td colspan="6" class="table-empty">Событий не найдено</td>
            </tr>
            <tr v-for="event in events" :key="event.id" class="table-row">
              <td class="table-cell--muted">{{ formatDate(event.createdAt) }}</td>
              <td class="table-cell--bold">{{ event.userId }}</td>
              <td>
                <span class="badge" :class="actionClass(event.action)">
                  {{ actionLabel(event.action) }}
                </span>
              </td>
              <td class="table-cell--mono">
                {{ event.entityType }} {{ event.entityId ? `#${event.entityId}` : '' }}
              </td>
              <td class="table-cell--desc">{{ event.details }}</td>
              <td class="table-cell--mono table-cell--muted">{{ event.ipAddress }}</td>
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
    </template>
  </div>
</template>

<style scoped>
.events {
  display: flex;
  flex-direction: column;
  gap: 20px;
  width: 100%;
}

.no-access {
  padding: 40px;
  text-align: center;
  color: #ef4444;
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 12px;
  font-size: 16px;
}

.events__header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.events__title {
  font-size: 24px;
  font-weight: 700;
  color: #1e293b;
  margin: 0 0 4px;
}

.events__subtitle {
  font-size: 14px;
  color: #64748b;
  margin: 0;
}

.events__filters {
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
  min-width: 180px;
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
}

.table-cell--bold {
  font-weight: 500;
  color: #1e293b;
}

.table-cell--muted {
  color: #94a3b8;
}

.table-cell--desc {
  max-width: 400px;
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

.badge--danger {
  background: #fee2e2;
  color: #991b1b;
}
.badge--success {
  background: #d1fae5;
  color: #065f46;
}
.badge--warning {
  background: #fef3c7;
  color: #92400e;
}
.badge--info {
  background: #dbeafe;
  color: #1e40af;
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
