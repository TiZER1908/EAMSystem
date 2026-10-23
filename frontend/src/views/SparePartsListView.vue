<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { sparePartService } from '@/services/sparePartService'
import type { SparePartView, SparePartStatus } from '@/services/models.ts'

import IconEdit from '@/assets/icons/edit.svg?component'
import IconArchive from '@/assets/icons/archive.svg?component'

const authStore = useAuthStore
const role = computed(() => authStore.user.role)

const canView = computed(() => ['ADMIN', 'MASTER', 'TECHNICIAN'].includes(role.value))
const canEdit = computed(() => ['ADMIN', 'MASTER'].includes(role.value))
const canDelete = computed(() => role.value === 'ADMIN')

const spareParts = ref<SparePartView[]>([])
const totalElements = ref(0)
const loading = ref(true)

const search = ref('')
const page = ref(1)
const size = ref(10)

async function loadSpareParts() {
  if (!canView.value) {
    loading.value = false
    return
  }

  loading.value = true
  try {
    const result = await sparePartService.getSpareParts({
      search: search.value,
      page: page.value,
      size: size.value,
    })
    spareParts.value = result.content
    totalElements.value = result.totalElements
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadSpareParts()
})

let searchTimeout: ReturnType<typeof setTimeout>
watch(search, () => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    page.value = 1
    loadSpareParts()
  }, 300)
})

watch(page, () => {
  loadSpareParts()
})

const totalPages = computed(() => Math.ceil(totalElements.value / size.value))

function nextPage() {
  if (page.value < totalPages.value) page.value++
}

function prevPage() {
  if (page.value > 1) page.value--
}

function statusLabel(status: SparePartStatus): string {
  return status === 'ACTIVE' ? 'Активна' : 'Архивирована'
}

function stockClass(quantity: number) {
  if (quantity === 0) return 'stock--empty'
  if (quantity <= 5) return 'stock--low'
  return ''
}
</script>

<template>
  <div class="spare-parts">
    <!-- Заглушка для тех, кому нельзя -->
    <div v-if="!canView" class="no-access">У вас нет доступа к этому разделу.</div>

    <template v-else>
      <!-- Заголовок -->
      <div class="spare-parts__header">
        <div>
          <h1 class="spare-parts__title">Запчасти</h1>
          <p class="spare-parts__subtitle">Всего в справочнике: {{ totalElements }}</p>
        </div>

        <button v-if="canEdit" class="btn btn--primary"><span>+</span> Добавить запчасть</button>
      </div>

      <!-- Фильтры -->
      <div class="spare-parts__filters">
        <div class="filter-group" style="width: 100%; max-width: 400px">
          <label class="filter-label">Поиск</label>
          <input
            v-model="search"
            type="text"
            class="filter-input"
            placeholder="Поиск по названию, артикулу или категории..."
          />
        </div>
      </div>

      <!-- Таблица -->
      <div class="table-wrapper">
        <div v-if="loading" class="table-loading">Загрузка данных...</div>

        <table v-else class="table">
          <thead>
            <tr>
              <th>Артикул</th>
              <th>Наименование</th>
              <th>Категория</th>
              <th>Ед. изм.</th>
              <th>Остаток</th>
              <th>Статус</th>
              <th v-if="canEdit" class="actions-col">Действия</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="spareParts.length === 0">
              <td :colspan="canEdit ? 7 : 6" class="table-empty">Запчасти не найдены</td>
            </tr>
            <tr v-for="sp in spareParts" :key="sp.id" class="table-row">
              <td class="table-cell--mono">{{ sp.article || '—' }}</td>
              <td class="table-cell--bold">{{ sp.name }}</td>
              <td>{{ sp.category?.name || '—' }}</td>
              <td>{{ sp.unit?.shortName || '—' }}</td>
              <td>
                <span class="stock" :class="stockClass(sp.stockQuantity)">
                  {{ sp.stockQuantity }}
                </span>
              </td>
              <td>
                <span class="badge" :class="`badge--${sp.status.toLowerCase()}`">
                  {{ statusLabel(sp.status) }}
                </span>
              </td>
              <td v-if="canEdit" class="actions-col">
                <button class="action-btn" title="Редактировать">
                  <component :is="IconEdit" class="action-btn__icon" />
                </button>
                <button v-if="canDelete" class="action-btn action-btn--danger" title="Архивировать">
                  <component :is="IconArchive" class="action-btn__icon" />
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Пагинация -->
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
.spare-parts {
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

.spare-parts__header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
}

.spare-parts__title {
  font-size: 24px;
  font-weight: 700;
  color: #1e293b;
  margin: 0 0 4px;
}

.spare-parts__subtitle {
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

.spare-parts__filters {
  display: flex;
  gap: 16px;
  background: #fff;
  padding: 16px 20px;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.filter-label {
  font-size: 12px;
  font-weight: 500;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.filter-input {
  padding: 9px 12px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 14px;
  color: #1e293b;
  background: #fff;
  font-family: inherit;
  transition: border-color 0.15s ease;
}

.filter-input:focus {
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

.stock {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 4px;
  font-weight: 600;
  font-size: 13px;
}

.stock--empty {
  background: #fee2e2;
  color: #991b1b;
}

.stock--low {
  background: #fef3c7;
  color: #92400e;
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
.badge--archived {
  background: #f1f5f9;
  color: #64748b;
}

.actions-col {
  width: 100px;
  text-align: right;
}

.action-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px 4px 0px 4px;
  border-radius: 4px;
  transition: background 0.15s ease;
}

.action-btn:hover {
  background: #f1f5f9;
}

.action-btn--danger {
  color: #ef4444;
}

.action-btn--danger:hover {
  background: #fee2e2;
}

.action-btn__icon {
  width: 25px;
  height: 25px;
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
