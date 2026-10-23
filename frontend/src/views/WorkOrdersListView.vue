<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { workOrderService } from '@/services/workOrderService'
import type { WorkOrderView, WorkOrderStatus } from '@/services/models.ts'
import { formatShortFIO } from '@/utils/formatters'

const authStore = useAuthStore
const role = computed(() => authStore.user.role)

const canCreate = computed(() => ['ADMIN', 'MASTER'].includes(role.value))
const canSeeAll = computed(() => ['ADMIN', 'MASTER'].includes(role.value))

const workOrders = ref<WorkOrderView[]>([])
const totalElements = ref(0)
const loading = ref(true)

const search = ref('')
const statusFilter = ref<WorkOrderStatus | 'ALL'>('ALL')
const page = ref(1)
const size = ref(10)

async function loadWorkOrders() {
  loading.value = true
  try {
    const currentUserId = canSeeAll.value ? undefined : 1

    const result = await workOrderService.getWorkOrders({
      search: search.value,
      status: statusFilter.value,
      technicianId: currentUserId,
      page: page.value,
      size: size.value,
    })
    workOrders.value = result.content
    totalElements.value = result.totalElements
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadWorkOrders()
})

let searchTimeout: ReturnType<typeof setTimeout>
watch(search, () => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    page.value = 1
    loadWorkOrders()
  }, 300)
})

watch(statusFilter, () => {
  page.value = 1
  loadWorkOrders()
})

watch(page, () => {
  loadWorkOrders()
})

const totalPages = computed(() => Math.ceil(totalElements.value / size.value))

function nextPage() {
  if (page.value < totalPages.value) page.value++
}

function prevPage() {
  if (page.value > 1) page.value--
}

function statusLabel(status: WorkOrderStatus): string {
  const map: Record<WorkOrderStatus, string> = {
    DRAFT: 'Черновик',
    ASSIGNED: 'Назначен',
    IN_PROGRESS: 'В работе',
    COMPLETED: 'Выполнен',
    CLOSED: 'Закрыт',
    CANCELLED: 'Отменён',
  }
  return map[status]
}

function formatDate(dateStr: string): string {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('ru-RU')
}
</script>

<template>
  <div class="work-orders">
    <!-- Заголовок и кнопка создания -->
    <div class="work-orders__header">
      <div>
        <h1 class="work-orders__title">Наряды</h1>
        <p class="work-orders__subtitle">
          {{ canSeeAll ? 'Всего в системе' : 'Ваши наряды' }}: {{ totalElements }}
        </p>
      </div>

      <button v-if="canCreate" class="btn btn--primary"><span>+</span> Создать наряд</button>
    </div>

    <div class="work-orders__filters">
      <div class="filter-group">
        <label class="filter-label">Поиск</label>
        <input
          v-model="search"
          type="text"
          class="filter-input"
          placeholder="Поиск по оборудованию, мастеру или механику..."
        />
      </div>

      <div class="filter-group">
        <label class="filter-label">Статус</label>
        <select v-model="statusFilter" class="filter-select">
          <option value="ALL">Все</option>
          <option value="DRAFT">Черновик</option>
          <option value="ASSIGNED">Назначен</option>
          <option value="IN_PROGRESS">В работе</option>
          <option value="COMPLETED">Выполнен</option>
          <option value="CLOSED">Закрыт</option>
          <option value="CANCELLED">Отменён</option>
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
            <th>Заявка</th>
            <th>Мастер</th>
            <th>Исполнитель</th>
            <th>Сроки</th>
            <th>Статус</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="workOrders.length === 0">
            <td colspan="7" class="table-empty">Наряды не найдены</td>
          </tr>
          <tr v-for="wo in workOrders" :key="wo.id" class="table-row">
            <td class="table-cell--mono">#{{ wo.id }}</td>
            <td>
              <div class="table-cell--bold">
                <router-link :to="`/assets/${wo.asset.id}`" class="table-link" @click.stop>
                  {{ wo.asset.name }}
                </router-link>
              </div>
              <div class="table-cell--muted" style="font-size: 12px">
                {{ wo.asset.inventoryNumber }}
              </div>
            </td>
            <td class="table-cell--muted">
              {{ wo.requestId ? `#${wo.requestId}` : 'ППР' }}
            </td>
            <td class="table-cell--bold">
              <router-link :to="`/users/${wo.master.id}`" class="table-link" @click.stop>
                {{ formatShortFIO(wo.master) }}
              </router-link>
            </td>
            <td class="table-cell--bold">
              <router-link
                v-if="wo.technician?.lastName"
                :to="`/users/${wo.technician?.id}`"
                class="table-link"
                @click.stop
              >
                {{ formatShortFIO(wo.technician) }}
              </router-link>
              <span v-else class="table-cell--muted">Не назначен</span>
            </td>
            <td class="table-cell--muted">
              <span v-if="wo.actualStartDate && wo.actualEndDate"
                >с {{ formatDate(wo.actualStartDate) }} до {{ formatDate(wo.actualEndDate) }}</span
              >
              <span v-else-if="wo.actualStartDate && !wo.actualEndDate"
                >с {{ formatDate(wo.actualStartDate) }}</span
              >
              <span v-else-if="!wo.actualStartDate && wo.actualEndDate"
                >до {{ formatDate(wo.actualEndDate) }}</span
              >
              <span v-else-if="wo.status == 'DRAFT'">Ожидает планирования</span>
              <span v-else>Сроки не указаны</span>
            </td>
            <td>
              <span class="badge" :class="`badge--status-${wo.status.toLowerCase()}`">
                {{ statusLabel(wo.status) }}
              </span>
            </td>
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
.work-orders {
  display: flex;
  flex-direction: column;
  gap: 20px;
  width: 100%;
}

.work-orders__header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
}

.work-orders__title {
  font-size: 24px;
  font-weight: 700;
  color: #1e293b;
  margin: 0 0 4px;
}

.work-orders__subtitle {
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

.work-orders__filters {
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

.badge {
  display: inline-block;
  padding: 3px 8px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 500;
  white-space: nowrap;
}

.badge--status-draft {
  background: #f1f5f9;
  color: #64748b;
}
.badge--status-assigned {
  background: #dbeafe;
  color: #1e40af;
}
.badge--status-in_progress {
  background: #fef3c7;
  color: #92400e;
}
.badge--status-completed {
  background: #e0e7ff;
  color: #3730a3;
}
.badge--status-closed {
  background: #d1fae5;
  color: #065f46;
}
.badge--status-cancelled {
  background: #fee2e2;
  color: #991b1b;
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

.table-link {
  color: #1e293b;
  text-decoration: none;
  transition: color 0.15s ease;
}

.table-link:hover {
  color: #3b82f6;
  text-decoration: underline;
}
</style>
