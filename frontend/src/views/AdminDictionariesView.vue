<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { dictionaryService } from '@/services/dictionaryService'
import type { AssetType, Location, Unit, SparePartCategory } from '@/services/models'

import IconPlus from '@/assets/icons/dictionaries.svg?component'
import IconEdit from '@/assets/icons/edit.svg?component'
import IconDelete from '@/assets/icons/archive.svg?component'
import IconSave from '@/assets/icons/success.svg?component'
import IconCancel from '@/assets/icons/x.svg?component'

type AnyDictionaryItem = AssetType | Location | Unit | SparePartCategory

const authStore = useAuthStore
const role = computed(() => authStore.user.role)
const canView = computed(() => role.value === 'ADMIN')

const activeTab = ref<'ASSET_TYPES' | 'LOCATIONS' | 'UNITS' | 'SPARE_PART_CATEGORIES'>(
  'ASSET_TYPES',
)
const items = ref<AnyDictionaryItem[]>([])
const loading = ref(false)
const saving = ref(false)

const editingId = ref<number | null>(null)
const editForm = ref({
  name: '',
  description: '',
  shortName: '',
  parentLocationId: null as number | null,
})

const isCreating = ref(false)
const createForm = ref({
  name: '',
  description: '',
  shortName: '',
  parentLocationId: null as number | null,
})

const tabs = [
  { id: 'ASSET_TYPES', label: 'Типы оборудования' },
  { id: 'LOCATIONS', label: 'Локации' },
  { id: 'UNITS', label: 'Единицы измерения' },
  { id: 'SPARE_PART_CATEGORIES', label: 'Категории запчастей' },
] as const

async function loadItems() {
  if (!canView.value) return
  loading.value = true
  try {
    switch (activeTab.value) {
      case 'ASSET_TYPES':
        items.value = await dictionaryService.getAssetTypes()
        break
      case 'LOCATIONS':
        items.value = await dictionaryService.getLocations()
        break
      case 'UNITS':
        items.value = await dictionaryService.getUnits()
        break
      case 'SPARE_PART_CATEGORIES':
        items.value = await dictionaryService.getSparePartCategories()
        break
    }
  } finally {
    loading.value = false
  }
}

function startCreate() {
  isCreating.value = true
  editingId.value = null
  createForm.value = { name: '', description: '', shortName: '', parentLocationId: null }
}

function cancelCreate() {
  isCreating.value = false
}

async function saveCreate() {
  if (!createForm.value.name.trim()) return
  saving.value = true
  try {
    if (activeTab.value === 'ASSET_TYPES') await dictionaryService.createAssetType(createForm.value)
    else if (activeTab.value === 'LOCATIONS')
      await dictionaryService.createLocation(createForm.value)
    else if (activeTab.value === 'UNITS') await dictionaryService.createUnit(createForm.value)
    else if (activeTab.value === 'SPARE_PART_CATEGORIES')
      await dictionaryService.createSparePartCategory(createForm.value)

    isCreating.value = false
    await loadItems()
  } finally {
    saving.value = false
  }
}

function startEdit(item: AnyDictionaryItem) {
  editingId.value = item.id
  isCreating.value = false
  editForm.value = {
    name: item.name,
    description: 'description' in item ? item.description || '' : '',
    shortName: 'shortName' in item ? item.shortName : '',
    parentLocationId: 'parentLocationId' in item ? item.parentLocationId : null,
  }
}

function cancelEdit() {
  editingId.value = null
}

async function saveEdit(id: number) {
  if (!editForm.value.name.trim()) return
  saving.value = true
  try {
    if (activeTab.value === 'ASSET_TYPES')
      await dictionaryService.updateAssetType(id, editForm.value)
    else if (activeTab.value === 'LOCATIONS')
      await dictionaryService.updateLocation(id, editForm.value)
    else if (activeTab.value === 'UNITS') await dictionaryService.updateUnit(id, editForm.value)
    else if (activeTab.value === 'SPARE_PART_CATEGORIES')
      await dictionaryService.updateSparePartCategory(id, editForm.value)

    editingId.value = null
    await loadItems()
  } finally {
    saving.value = false
  }
}

async function handleDelete(id: number) {
  if (!confirm('Удалить запись?')) return
  try {
    if (activeTab.value === 'ASSET_TYPES') await dictionaryService.deleteAssetType(id)
    else if (activeTab.value === 'LOCATIONS') await dictionaryService.deleteLocation(id)
    else if (activeTab.value === 'UNITS') await dictionaryService.deleteUnit(id)
    else if (activeTab.value === 'SPARE_PART_CATEGORIES')
      await dictionaryService.deleteSparePartCategory(id)

    await loadItems()
  } catch {
    alert('Ошибка при удалении')
  }
}

onMounted(loadItems)
watch(activeTab, () => {
  editingId.value = null
  isCreating.value = false
  loadItems()
})
</script>

<template>
  <div class="dictionaries">
    <div v-if="!canView" class="no-access">У вас нет доступа к управлению справочниками.</div>

    <template v-else>
      <div class="dictionaries__header">
        <h1 class="dictionaries__title">Справочники</h1>
        <button v-if="!isCreating" class="btn btn--primary" @click="startCreate">
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
              <th v-if="activeTab !== 'UNITS' && activeTab !== 'LOCATIONS'">Описание</th>
              <th v-if="activeTab === 'UNITS'">Сокр. обозначение</th>
              <th v-if="activeTab === 'LOCATIONS'">Родительская локация</th>
              <th class="actions-col">Действия</th>
            </tr>
          </thead>
          <tbody>
            <!-- Строка создания -->
            <tr v-if="isCreating" class="table-row table-row--editing">
              <td class="table-cell--mono">new</td>
              <td>
                <input
                  v-model="createForm.name"
                  type="text"
                  class="form__input"
                  placeholder="Наименование"
                />
              </td>
              <td v-if="activeTab === 'UNITS'">
                <input
                  v-model="createForm.shortName"
                  type="text"
                  class="form__input"
                  placeholder="шт"
                />
              </td>
              <td v-else-if="activeTab === 'LOCATIONS'">
                <select v-model="createForm.parentLocationId" class="form__select">
                  <option :value="null">Нет (верхний уровень)</option>
                  <option
                    v-for="loc in items.filter((i) => 'parentLocationId' in i)"
                    :key="loc.id"
                    :value="loc.id"
                  >
                    {{ loc.name }}
                  </option>
                </select>
              </td>
              <td v-else>
                <input
                  v-model="createForm.description"
                  type="text"
                  class="form__input"
                  placeholder="Описание"
                />
              </td>
              <td class="actions-col">
                <button
                  class="action-btn action-btn--success"
                  :disabled="saving"
                  @click="saveCreate"
                >
                  <component :is="IconSave" class="action-btn__icon" />
                </button>
                <button class="action-btn" @click="cancelCreate">
                  <component :is="IconCancel" class="action-btn__icon" />
                </button>
              </td>
            </tr>

            <tr v-if="items.length === 0 && !isCreating">
              <td colspan="5" class="table-empty">Записи не найдены</td>
            </tr>

            <!-- Строки таблицы -->
            <tr v-for="item in items" :key="item.id" class="table-row">
              <template v-if="editingId === item.id">
                <td class="table-cell--mono">{{ item.id }}</td>
                <td>
                  <input v-model="editForm.name" type="text" class="form__input" />
                </td>
                <td v-if="activeTab === 'UNITS'">
                  <input v-model="editForm.shortName" type="text" class="form__input" />
                </td>
                <td v-else-if="activeTab === 'LOCATIONS'">
                  <select v-model="editForm.parentLocationId" class="form__select">
                    <option :value="null">Нет (верхний уровень)</option>
                    <option
                      v-for="loc in items.filter(
                        (i) => 'parentLocationId' in i && i.id !== item.id,
                      )"
                      :key="loc.id"
                      :value="loc.id"
                    >
                      {{ loc.name }}
                    </option>
                  </select>
                </td>
                <td v-else>
                  <input v-model="editForm.description" type="text" class="form__input" />
                </td>
                <td class="actions-col">
                  <button
                    class="action-btn action-btn--success"
                    :disabled="saving"
                    @click="saveEdit(item.id)"
                  >
                    <component :is="IconSave" class="action-btn__icon" />
                  </button>
                  <button class="action-btn" @click="cancelEdit">
                    <component :is="IconCancel" class="action-btn__icon" />
                  </button>
                </td>
              </template>

              <template v-else>
                <td class="table-cell--mono">{{ item.id }}</td>
                <td class="table-cell--bold">{{ item.name }}</td>

                <td v-if="activeTab === 'UNITS' && 'shortName' in item">
                  {{ item.shortName }}
                </td>
                <td v-else-if="activeTab === 'LOCATIONS' && 'parentLocationId' in item">
                  <span v-if="item.parentLocationId" class="table-cell--muted">
                    {{
                      items.find((i) => i.id === item.parentLocationId)?.name ||
                      'ID ' + item.parentLocationId
                    }}
                  </span>
                  <span v-else class="table-cell--muted">—</span>
                </td>
                <td v-else-if="'description' in item">
                  <span v-if="item.description">{{ item.description }}</span>
                  <span v-else class="table-cell--muted">—</span>
                </td>
                <td v-else class="table-cell--muted">—</td>

                <td class="actions-col">
                  <button class="action-btn" @click="startEdit(item)">
                    <component :is="IconEdit" class="action-btn__icon" />
                  </button>
                  <button class="action-btn action-btn--danger" @click="handleDelete(item.id)">
                    <component :is="IconDelete" class="action-btn__icon" />
                  </button>
                </td>
              </template>
            </tr>
          </tbody>
        </table>
      </div>
    </template>
  </div>
</template>

<style scoped>
/* Твои старые стили оставляем, добавляем стили для инпутов и новых кнопок */
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
    background 0.15s,
    color 0.15s;
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
  vertical-align: middle;
}
.table tbody tr:last-child td {
  border-bottom: none;
}
.table-row:hover {
  background: #f8fafc;
}
.table-row--editing {
  background: #eff6ff !important;
}

.form__input,
.form__select {
  padding: 8px 12px;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-size: 14px;
  color: #1e293b;
  background: #fff;
  font-family: inherit;
  width: 100%;
  min-width: 120px;
}
.form__input:focus,
.form__select:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.15);
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
  white-space: nowrap;
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
  display: inline-flex;
  align-items: center;
  justify-content: center;
}
.action-btn__icon {
  width: 18px;
  height: 18px;
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
.action-btn--success {
  color: #059669;
}
.action-btn--success:hover {
  background: #ecfdf5;
}
</style>
