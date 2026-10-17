<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { assetService, type Asset, type AssetStatus } from '@/services/assetService'

const authStore = useAuthStore
const role = computed(() => authStore.user.role)

const canCreate = computed(() => ['ADMIN', 'MASTER'].includes(role.value))

const assets = ref<Asset[]>([])
const totalElements = ref(0)
const loading = ref(true)

// Фильтры
const search = ref('')
const statusFilter = ref<AssetStatus | 'ALL'>('ALL')
const page = ref(1)
const size = ref(10)

async function loadAssets() {
  loading.value = true
  try {
    const result = await assetService.getAssets({
      search: search.value,
      status: statusFilter.value,
      page: page.value,
      size: size.value,
    })
    assets.value = result.content
    totalElements.value = result.totalElements
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadAssets()
})

let searchTimeout: ReturnType<typeof setTimeout>
watch(search, () => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    page.value = 1
    loadAssets()
  }, 300)
})

watch(statusFilter, () => {
  page.value = 1
  loadAssets()
})

watch(page, () => {
  loadAssets()
})

const totalPages = computed(() => Math.ceil(totalElements.value / size.value))

function nextPage() {
  if (page.value < totalPages.value) page.value++
}

function prevPage() {
  if (page.value > 1) page.value--
}

function statusLabel(status: AssetStatus): string {
  const map: Record<AssetStatus, string> = {
    ACTIVE: 'В работе',
    UNDER_REPAIR: 'На ремонте',
    INACTIVE: 'Неактивен',
    DECOMMISSIONED: 'Списано',
  }
  return map[status]
}

function formatDate(date: string): string {
  if (!date) return '—'
  return new Date(date).toLocaleDateString('ru-RU')
}
</script>

<template>
  <div class="assets">
    <div class="assets__header">
      <div>
        <h1 class="assets__title">Активы</h1>
        <p class="assets__subtitle">Всего единиц: {{ totalElements }}</p>
      </div>

      <button v-if="canCreate" class="btn btn--primary"><span>+</span> Создать актив</button>
    </div>

    <!-- Фильтры -->
    <div class="assets__filters">
      <div class="filter-group">
        <label class="filter-label">Поиск</label>
        <input
          v-model="search"
          type="text"
          class="filter-input"
          placeholder="Поиск по названию, инв. номеру, серийному..."
        />
      </div>

      <div class="filter-group">
        <label class="filter-label">Статус</label>
        <select v-model="statusFilter" class="filter-select">
          <option value="ALL">Все</option>
          <option value="ACTIVE">В работе</option>
          <option value="UNDER_REPAIR">На ремонте</option>
          <option value="INACTIVE">Неактивен</option>
          <option value="DECOMMISSIONED">Списано</option>
        </select>
      </div>
    </div>

    <div class="table-wrapper">
      <div v-if="loading" class="table-loading">Загрузка данных...</div>

      <table v-else class="table">
        <thead>
          <tr>
            <th>Инв. номер</th>
            <th>Наименование</th>
            <th>Тип</th>
            <th>Модель</th>
            <th>Локация</th>
            <th>Ответственный</th>
            <th>Статус</th>
            <th>Дата ввода</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="assets.length === 0">
            <td colspan="8" class="table-empty">Активы не найдены</td>
          </tr>
          <tr v-for="asset in assets" :key="asset.id" class="table-row">
            <td class="table-cell--mono">{{ asset.inventoryNumber }}</td>
            <td class="table-cell--bold">{{ asset.name }}</td>
            <td>{{ asset.assetTypeName }}</td>
            <td class="table-cell--muted">{{ asset.model }}</td>
            <td>{{ asset.locationName }}</td>
            <td>{{ asset.responsibleUserName }}</td>
            <td>
              <span class="badge" :class="`badge--${asset.status.toLowerCase()}`">
                {{ statusLabel(asset.status) }}
              </span>
            </td>
            <td class="table-cell--muted">{{ formatDate(asset.commissionDate) }}</td>
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
.assets {
  display: flex;
  flex-direction: column;
  gap: 20px;
  width: 100%;
}

.assets__header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
}

.assets__title {
  font-size: 24px;
  font-weight: 700;
  color: #1e293b;
  margin: 0 0 4px;
}

.assets__subtitle {
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

.assets__filters {
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

.badge--active {
  background: #d1fae5;
  color: #065f46;
}
.badge--under_repair {
  background: #fef3c7;
  color: #92400e;
}
.badge--inactive {
  background: #f1f5f9;
  color: #64748b;
}
.badge--decommissioned {
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
</style>
