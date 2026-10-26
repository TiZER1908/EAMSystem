<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { sparePartService } from '@/services/sparePartService'
import type { SparePartView } from '@/services/models'

import IconBack from '@/assets/icons/logout.svg?component'
import IconEdit from '@/assets/icons/edit.svg?component'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore

const spId = computed(() => Number(route.params.id))
const role = computed(() => authStore.user.role)
const canEdit = computed(() => ['ADMIN', 'MASTER'].includes(role.value))
const canView = computed(() => ['ADMIN', 'MASTER', 'TECHNICIAN'].includes(role.value))

const sparePart = ref<SparePartView | null>(null)
const usageHistory = ref<{ workOrderId: number; date: string; quantity: number }[]>([])
const loading = ref(true)
const error = ref<string | null>(null)
const activeTab = ref<'info' | 'history'>('info')

async function loadData() {
  loading.value = true
  try {
    const [spData, usageData] = await Promise.all([
      sparePartService.getSparePartById(spId.value),
      sparePartService.getSparePartUsage(spId.value),
    ])
    sparePart.value = spData
    usageHistory.value = usageData
  } catch {
    error.value = 'Запчасть не найдена или у вас нет доступа'
  } finally {
    loading.value = false
  }
}

onMounted(loadData)

function statusLabel(status: string): string {
  return status === 'ACTIVE' ? 'Активна' : 'Архивирована'
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('ru-RU')
}

function stockClass(quantity: number) {
  if (quantity === 0) return 'stock--empty'
  if (quantity <= 5) return 'stock--low'
  return ''
}
</script>

<template>
  <div class="spare-part-detail">
    <div v-if="loading" class="loading">Загрузка...</div>
    <div v-else-if="error || !canView" class="error">{{ error || 'У вас нет доступа' }}</div>

    <template v-else-if="sparePart">
      <div class="page-header">
        <button class="btn-back" @click="router.back()">
          <IconBack class="icon-sm" />
          Назад
        </button>
        <router-link
          v-if="canEdit"
          :to="`/spare-parts/${sparePart.id}/edit`"
          class="btn btn--outline"
        >
          <IconEdit class="icon-sm" />
          Редактировать
        </router-link>
      </div>

      <div class="sp-card">
        <div class="sp-card__header">
          <div>
            <div class="sp-card__meta">
              <span class="badge" :class="`badge--${sparePart.status.toLowerCase()}`">
                {{ statusLabel(sparePart.status) }}
              </span>
            </div>
            <h1 class="sp-card__title">{{ sparePart.name }}</h1>
            <div class="sp-card__article">
              Артикул: <span class="table-cell--mono">{{ sparePart.article || '—' }}</span>
            </div>
          </div>
          <div class="sp-card__stock">
            <div class="stock-label">Остаток на складе</div>
            <div class="stock-value" :class="stockClass(sparePart.stockQuantity)">
              {{ sparePart.stockQuantity }}
              <span class="stock-unit">{{ sparePart.unit?.shortName || 'шт' }}</span>
            </div>
          </div>
        </div>

        <div class="tabs">
          <button
            class="tab"
            :class="{ 'tab--active': activeTab === 'info' }"
            @click="activeTab = 'info'"
          >
            Информация
          </button>
          <button
            class="tab"
            :class="{ 'tab--active': activeTab === 'history' }"
            @click="activeTab = 'history'"
          >
            История использования
          </button>
        </div>

        <div v-if="activeTab === 'info'" class="tab-content">
          <div class="info-grid">
            <div class="info-item">
              <span class="info-label">Категория</span>
              <span class="info-value">{{ sparePart.category?.name || '—' }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Единица измерения</span>
              <span class="info-value">{{ sparePart.unit?.name || '—' }}</span>
            </div>
          </div>
        </div>

        <div v-else-if="activeTab === 'history'" class="tab-content">
          <div v-if="usageHistory.length === 0" class="empty-state">
            Запчасть еще не использовалась в нарядах
          </div>
          <table v-else class="mini-table">
            <thead>
              <tr>
                <th>Наряд</th>
                <th>Дата</th>
                <th>Количество</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(usage, index) in usageHistory" :key="index">
                <td>
                  <router-link :to="`/work-orders/${usage.workOrderId}`" class="info-link">
                    Наряд #{{ usage.workOrderId }}
                  </router-link>
                </td>
                <td class="table-cell--muted">{{ formatDate(usage.date) }}</td>
                <td>{{ usage.quantity }} {{ sparePart.unit?.shortName || 'шт' }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </template>
  </div>
</template>

<style scoped>
.spare-part-detail {
  display: flex;
  flex-direction: column;
  gap: 20px;
  width: 100%;
  max-width: 900px;
  margin: 0 auto;
}
.loading,
.error {
  padding: 40px;
  text-align: center;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}
.error {
  color: #ef4444;
  background: #fef2f2;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.btn-back {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: none;
  border: none;
  color: #64748b;
  font-size: 14px;
  cursor: pointer;
  padding: 8px 0;
  font-family: inherit;
}
.btn-back:hover {
  color: #1e293b;
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
  border: 1px solid transparent;
  transition: background 0.15s ease;
  font-family: inherit;
  text-decoration: none;
}
.btn--outline {
  background: #fff;
  color: #334155;
  border-color: #e2e8f0;
}
.btn--outline:hover {
  background: #f8fafc;
}
.icon-sm {
  width: 16px;
  height: 16px;
}

.sp-card {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  overflow: hidden;
}
.sp-card__header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 24px;
  border-bottom: 1px solid #e2e8f0;
}
.sp-card__meta {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
}
.sp-card__title {
  font-size: 24px;
  font-weight: 700;
  color: #1e293b;
  margin: 0 0 8px;
}
.sp-card__article {
  font-size: 14px;
  color: #64748b;
}

.sp-card__stock {
  text-align: right;
  background: #f8fafc;
  padding: 16px 24px;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
}
.stock-label {
  font-size: 12px;
  text-transform: uppercase;
  color: #64748b;
  font-weight: 500;
  margin-bottom: 4px;
}
.stock-value {
  font-size: 28px;
  font-weight: 700;
  color: #1e293b;
}
.stock-unit {
  font-size: 16px;
  font-weight: 500;
  color: #64748b;
}

.stock--empty {
  color: #ef4444;
}
.stock--low {
  color: #f59e0b;
}

.tabs {
  display: flex;
  border-bottom: 1px solid #e2e8f0;
  padding: 0 24px;
}
.tab {
  padding: 16px 20px;
  background: none;
  border: none;
  border-bottom: 2px solid transparent;
  font-size: 14px;
  font-weight: 500;
  color: #64748b;
  cursor: pointer;
  font-family: inherit;
}
.tab:hover {
  color: #1e293b;
}
.tab--active {
  border-bottom-color: #3b82f6;
  color: #3b82f6;
}

.tab-content {
  padding: 24px;
}
.info-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
}
.info-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.info-label {
  font-size: 12px;
  text-transform: uppercase;
  color: #64748b;
  font-weight: 500;
  letter-spacing: 0.5px;
}
.info-value {
  font-size: 15px;
  color: #1e293b;
  font-weight: 500;
}

.mini-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
}
.mini-table th {
  text-align: left;
  padding: 8px 12px;
  background: #f8fafc;
  color: #64748b;
  font-weight: 500;
  font-size: 12px;
  text-transform: uppercase;
}
.mini-table td {
  padding: 10px 12px;
  border-bottom: 1px solid #f1f5f9;
  color: #1e293b;
}
.mini-table tbody tr:last-child td {
  border-bottom: none;
}

.info-link {
  color: #3b82f6;
  font-weight: 500;
  text-decoration: none;
}
.info-link:hover {
  text-decoration: underline;
}
.table-cell--muted {
  color: #94a3b8;
}
.table-cell--mono {
  font-family: 'Courier New', monospace;
}
.empty-state {
  text-align: center;
  color: #94a3b8;
  padding: 40px 0;
  font-size: 14px;
}

.badge {
  display: inline-block;
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
}
.badge--active {
  background: #d1fae5;
  color: #065f46;
}
.badge--archived {
  background: #f1f5f9;
  color: #64748b;
}
</style>
