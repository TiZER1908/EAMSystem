<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { dictionaryService } from '@/services/dictionaryService'
import type { DictionaryType, DictionaryItem } from '@/services/models.ts'

import IconPlus from '@/assets/icons/dictionaries.svg?component'
import IconEdit from '@/assets/icons/edit.svg?component'
import IconDelete from '@/assets/icons/archive.svg?component'

const authStore = useAuthStore
const role = computed(() => authStore.user.role)
const canView = computed(() => role.value === 'ADMIN')

const activeTab = ref<DictionaryType>('ASSET_TYPES')
const items = ref<DictionaryItem[]>([])
const loading = ref(false)

const tabs = [
  { id: 'ASSET_TYPES', label: 'Типы оборудования' },
  { id: 'DEPARTMENTS', label: 'Подразделения' },
  { id: 'LOCATIONS', label: 'Локации' },
  { id: 'UNITS', label: 'Единицы измерения' },
  { id: 'SPARE_PART_CATEGORIES', label: 'Категории запчастей' },
] as const

async function loadItems() {
  if (!canView.value) return
  loading.value = true
  try {
    items.value = await dictionaryService.getDictionaryItems(activeTab.value)
  } finally {
    loading.value = false
  }
}

onMounted(loadItems)
watch(activeTab, loadItems)
</script>

<template>
  <div class="dictionaries">
    <div v-if="!canView" class="no-access">У вас нет доступа к управлению справочниками.</div>

    <template v-else>
      <div class="dictionaries__header">
        <h1 class="dictionaries__title">Справочники</h1>
        <button class="btn btn--primary">
          <IconPlus class="btn-icon" />
          Добавить запись
        </button>
      </div>

      <div class="tabs">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          class="tab"
          :class="{ 'tab--active': activeTab === tab.id }"
          @click="activeTab = tab.id"
        >
          {{ tab.label }}
        </button>
      </div>

      <div class="table-wrapper">
        <div v-if="loading" class="table-loading">Загрузка данных...</div>

        <table v-else class="table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Наименование</th>
              <th v-if="activeTab !== 'UNITS'">Описание / Родитель</th>
              <th v-if="activeTab === 'UNITS'">Сокр. обозначение</th>
              <th class="actions-col">Действия</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="items.length === 0">
              <td :colspan="activeTab === 'UNITS' ? 4 : 4" class="table-empty">
                Записи не найдены
              </td>
            </tr>
            <tr v-for="item in items" :key="item.id" class="table-row">
              <td class="table-cell--mono">{{ item.id }}</td>
              <td class="table-cell--bold">{{ item.name }}</td>

              <td v-if="activeTab === 'UNITS'">{{ item.shortName }}</td>
              <td v-else>
                <span v-if="item.description">{{ item.description }}</span>
                <span v-else-if="item.parentName" class="table-cell--muted"
                  >Родитель: {{ item.parentName }}</span
                >
                <span v-else class="table-cell--muted">—</span>
              </td>

              <td class="actions-col">
                <button class="action-btn">
                  <component :is="IconEdit" class="action-btn__icon" />
                </button>
                <button class="action-btn action-btn--danger">
                  <component :is="IconDelete" class="action-btn__icon" />
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </template>
  </div>
</template>

<style scoped>
/* Стили аналогичны предыдущим страницам, добавим только стили для табов */
.dictionaries {
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

.dictionaries__header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
}

.dictionaries__title {
  font-size: 24px;
  font-weight: 700;
  color: #1e293b;
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
  border: 1px solid transparent;
  transition: background 0.15s ease;
  font-family: inherit;
}

.btn--primary {
  background: #3b82f6;
  color: #fff;
}

.btn--primary:hover {
  background: #2563eb;
}

.btn-icon {
  width: 16px;
  height: 16px;
}

.tabs {
  display: flex;
  gap: 4px;
  background: #fff;
  padding: 6px;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  width: fit-content;
  flex-wrap: wrap;
}

.tab {
  padding: 8px 16px;
  border: none;
  background: transparent;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  color: #64748b;
  cursor: pointer;
  transition:
    background 0.15s ease,
    color 0.15s ease;
  font-family: inherit;
}

.tab:hover {
  color: #1e293b;
}

.tab--active {
  background: #eff6ff;
  color: #2563eb;
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

.actions-col {
  text-align: right;
}

.action-btn {
  padding: 6px 10px;
  border: 1px solid #e2e8f0;
  background: #fff;
  border-radius: 6px;
  font-size: 12px;
  color: #334155;
  cursor: pointer;
  transition: background 0.15s ease;
  font-family: inherit;
  margin-left: 4px;
}

.action-btn__icon {
  width: 20px;
  height: 20px;
}

.action-btn:hover {
  background: #f8fafc;
}

.action-btn--danger {
  color: #ef4444;
}

.action-btn--danger:hover {
  background: #fef2f2;
}
</style>
