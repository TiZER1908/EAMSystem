<script setup lang="ts">
import { computed, ref } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { reportService } from '@/services/reportService'
import type { ReportType, ReportData } from '@/services/models.ts'

import IconFileText from '@/assets/icons/reports.svg?component'
import IconDownload from '@/assets/icons/archive.svg?component'

const authStore = useAuthStore
const role = computed(() => authStore.user.role)
const canView = computed(() => ['ADMIN', 'MASTER'].includes(role.value))

const selectedReport = ref<ReportType>('OPEN_REQUESTS')
const dateFrom = ref('2026-10-01')
const dateTo = ref('2026-10-31')
const loading = ref(false)
const reportData = ref<ReportData | null>(null)

const reportTypes = [
  { id: 'OPEN_REQUESTS', label: 'Открытые заявки' },
  { id: 'WORK_ORDERS_IN_PROGRESS', label: 'Наряды в работе' },
  { id: 'MECHANICS_WORKLOAD', label: 'Загрузка механиков' },
  { id: 'OVERDUE_WORK_ORDERS', label: 'Просроченные наряды' },
  { id: 'ASSET_HISTORY', label: 'История ремонтов' },
] as const

async function handleGenerate() {
  loading.value = true
  reportData.value = null
  try {
    reportData.value = await reportService.generateReport({
      type: selectedReport.value,
      dateFrom: dateFrom.value,
      dateTo: dateTo.value,
    })
  } finally {
    loading.value = false
  }
}

function selectReport(type: ReportType) {
  selectedReport.value = type
  reportData.value = null
}
</script>

<template>
  <div class="reports">
    <div v-if="!canView" class="no-access">У вас нет доступа к разделу отчётов.</div>

    <template v-else>
      <div class="reports__header">
        <h1 class="reports__title">Отчёты</h1>
      </div>

      <div class="reports__layout">
        <aside class="reports__sidebar">
          <div class="reports__menu">
            <button
              v-for="report in reportTypes"
              :key="report.id"
              class="reports__menu-item"
              :class="{ 'reports__menu-item--active': selectedReport === report.id }"
              @click="selectReport(report.id)"
            >
              <IconFileText class="reports__menu-icon" />
              <span>{{ report.label }}</span>
            </button>
          </div>
        </aside>

        <main class="reports__content">
          <div class="reports__toolbar">
            <div class="reports__filters">
              <div class="filter-group">
                <label class="filter-label">С</label>
                <input v-model="dateFrom" type="date" class="filter-input" />
              </div>
              <div class="filter-group">
                <label class="filter-label">По</label>
                <input v-model="dateTo" type="date" class="filter-input" />
              </div>
            </div>

            <button class="btn btn--primary" :disabled="loading" @click="handleGenerate">
              {{ loading ? 'Формирование...' : 'Сформировать' }}
            </button>
          </div>

          <div v-if="reportData" class="reports__result">
            <div class="reports__result-header">
              <h2 class="reports__result-title">{{ reportData.title }}</h2>
              <div class="reports__export">
                <button class="btn btn--outline" title="Экспорт CSV">
                  <IconDownload class="btn-icon" />
                  CSV
                </button>
                <button class="btn btn--outline" title="Экспорт XLSX">
                  <IconDownload class="btn-icon" />
                  XLSX
                </button>
                <button class="btn btn--outline" title="Экспорт PDF">
                  <IconDownload class="btn-icon" />
                  PDF
                </button>
              </div>
            </div>

            <div class="table-wrapper">
              <table class="table">
                <thead>
                  <tr>
                    <th v-for="header in reportData.headers" :key="header">{{ header }}</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(row, rowIndex) in reportData.rows" :key="rowIndex" class="table-row">
                    <td v-for="(cell, cellIndex) in row" :key="cellIndex">{{ cell }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div v-else-if="!loading" class="reports__empty">
            Выберите параметры и нажмите «Сформировать» для просмотра отчёта.
          </div>
        </main>
      </div>
    </template>
  </div>
</template>

<style scoped>
.reports {
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

.reports__header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.reports__title {
  font-size: 24px;
  font-weight: 700;
  color: #1e293b;
  margin: 0;
}

.reports__layout {
  display: grid;
  grid-template-columns: 280px 1fr;
  gap: 20px;
  align-items: start;
}

.reports__sidebar {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  overflow: hidden;
}

.reports__menu {
  display: flex;
  flex-direction: column;
  padding: 8px;
}

.reports__menu-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 16px;
  border: none;
  background: transparent;
  border-radius: 8px;
  font-size: 14px;
  color: #334155;
  cursor: pointer;
  text-align: left;
  font-family: inherit;
  transition:
    background 0.15s ease,
    color 0.15s ease;
}

.reports__menu-item:hover {
  background: #f8fafc;
}

.reports__menu-item--active {
  background: #eff6ff;
  color: #2563eb;
  font-weight: 500;
}

.reports__menu-icon {
  width: 18px;
  height: 18px;
  flex-shrink: 0;
}

.reports__content {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.reports__toolbar {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  background: #fff;
  padding: 16px 20px;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  gap: 16px;
  flex-wrap: wrap;
}

.reports__filters {
  display: flex;
  gap: 16px;
  flex: 1;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 150px;
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
  transition:
    background 0.15s ease,
    border-color 0.15s ease;
  font-family: inherit;
  white-space: nowrap;
}

.btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.btn--primary {
  background: #3b82f6;
  color: #fff;
}

.btn--primary:hover:not(:disabled) {
  background: #2563eb;
}

.btn--outline {
  background: #fff;
  color: #334155;
  border-color: #e2e8f0;
}

.btn--outline:hover {
  background: #f8fafc;
  border-color: #cbd5e1;
}

.btn-icon {
  width: 16px;
  height: 16px;
}

.reports__result {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  overflow: hidden;
}

.reports__result-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid #e2e8f0;
  flex-wrap: wrap;
  gap: 12px;
}

.reports__result-title {
  font-size: 16px;
  font-weight: 600;
  color: #1e293b;
  margin: 0;
}

.reports__export {
  display: flex;
  gap: 8px;
}

.table-wrapper {
  overflow-x: auto;
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

.reports__empty {
  padding: 60px 20px;
  text-align: center;
  color: #94a3b8;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  font-size: 14px;
}
</style>
