<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { assetService } from '@/services/assetService'
import { dictionaryService } from '@/services/dictionaryService'
import type { Asset, AssetStatus, AssetType, Location } from '@/services/models'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore

const assetId = computed(() => Number(route.params.id))
const role = computed(() => authStore.user.role)
const canEdit = computed(() => ['ADMIN', 'MASTER'].includes(role.value))

const form = ref({
  name: '',
  inventoryNumber: '',
  assetTypeId: 0,
  model: '',
  serialNumber: '',
  locationId: 0,
  status: 'ACTIVE' as AssetStatus,
})

const assetTypes = ref<AssetType[]>([])
const locations = ref<Location[]>([])

const loading = ref(true)
const saving = ref(false)
const error = ref<string | null>(null)

const typeSearch = ref('')
const locationSearch = ref('')
const isTypeOpen = ref(false)
const isLocationOpen = ref(false)

const filteredTypes = computed(() => {
  const s = typeSearch.value.toLowerCase()
  if (!s) return assetTypes.value
  return assetTypes.value.filter((t) => t.name.toLowerCase().includes(s))
})

const filteredLocations = computed(() => {
  const s = locationSearch.value.toLowerCase()
  if (!s) return locations.value
  return locations.value.filter((l) => l.name.toLowerCase().includes(s))
})

const selectedTypeName = computed(() => {
  return assetTypes.value.find((t) => t.id === form.value.assetTypeId)?.name || ''
})

const selectedLocationName = computed(() => {
  return locations.value.find((l) => l.id === form.value.locationId)?.name || ''
})

function selectType(type: AssetType) {
  form.value.assetTypeId = type.id
  typeSearch.value = ''
  isTypeOpen.value = false
}

function selectLocation(loc: Location) {
  form.value.locationId = loc.id
  locationSearch.value = ''
  isLocationOpen.value = false
}

onMounted(async () => {
  if (!canEdit.value) {
    router.push(`/assets/${assetId.value}`)
    return
  }

  try {
    const [assetData, typesData, locationsData] = await Promise.all([
      assetService.getAssetById(assetId.value),
      dictionaryService.getAssetTypes(),
      dictionaryService.getLocations(),
    ])

    assetTypes.value = typesData
    locations.value = locationsData

    form.value = {
      name: assetData.name,
      inventoryNumber: assetData.inventoryNumber,
      assetTypeId: assetData.assetTypeId,
      model: assetData.model || '',
      serialNumber: assetData.serialNumber || '',
      locationId: assetData.locationId,
      status: assetData.status,
    }
  } catch {
    error.value = 'Не удалось загрузить данные актива'
  } finally {
    loading.value = false
  }
})

async function handleSave() {
  error.value = null
  if (!form.value.name.trim() || !form.value.inventoryNumber.trim()) {
    error.value = 'Заполните обязательные поля (Наименование, Инв. номер)'
    return
  }
  if (!form.value.assetTypeId || !form.value.locationId) {
    error.value = 'Выберите тип оборудования и локацию'
    return
  }

  saving.value = true
  try {
    await assetService.updateAsset(assetId.value, form.value as Partial<Asset>)
    router.push(`/assets/${assetId.value}`)
  } catch {
    error.value = 'Ошибка при сохранении'
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <div class="asset-edit" @click="((isTypeOpen = false), (isLocationOpen = false))">
    <div class="asset-edit__header">
      <h1 class="asset-edit__title">Редактирование актива</h1>
    </div>

    <div v-if="loading" class="asset-edit__loading">Загрузка...</div>
    <div v-else-if="error && !form.name" class="asset-edit__error">{{ error }}</div>

    <div v-else class="asset-edit__card">
      <form @submit.prevent="handleSave" class="form">
        <div class="form__row">
          <div class="form__field">
            <label class="form__label">Наименование <span class="req">*</span></label>
            <input v-model="form.name" type="text" class="form__input" required />
          </div>
          <div class="form__field">
            <label class="form__label">Инвентарный номер <span class="req">*</span></label>
            <input v-model="form.inventoryNumber" type="text" class="form__input" required />
          </div>
        </div>

        <div class="form__row">
          <div class="form__field" @click.stop>
            <label class="form__label">Тип оборудования <span class="req">*</span></label>
            <div class="combobox">
              <input
                v-model="typeSearch"
                type="text"
                class="form__input"
                :placeholder="selectedTypeName || 'Начните вводить...'"
                @focus="isTypeOpen = true"
              />
              <div v-if="isTypeOpen" class="combobox__dropdown">
                <div
                  v-for="type in filteredTypes"
                  :key="type.id"
                  class="combobox__item"
                  :class="{ 'combobox__item--selected': form.assetTypeId === type.id }"
                  @click="selectType(type)"
                >
                  {{ type.name }}
                </div>
                <div v-if="filteredTypes.length === 0" class="combobox__empty">Не найдено</div>
              </div>
            </div>
          </div>

          <div class="form__field" @click.stop>
            <label class="form__label">Локация <span class="req">*</span></label>
            <div class="combobox">
              <input
                v-model="locationSearch"
                type="text"
                class="form__input"
                :placeholder="selectedLocationName || 'Начните вводить...'"
                @focus="isLocationOpen = true"
              />
              <div v-if="isLocationOpen" class="combobox__dropdown">
                <div
                  v-for="loc in filteredLocations"
                  :key="loc.id"
                  class="combobox__item"
                  :class="{ 'combobox__item--selected': form.locationId === loc.id }"
                  @click="selectLocation(loc)"
                >
                  {{ loc.name }}
                </div>
                <div v-if="filteredLocations.length === 0" class="combobox__empty">Не найдено</div>
              </div>
            </div>
          </div>
        </div>

        <div class="form__row">
          <div class="form__field">
            <label class="form__label">Модель</label>
            <input v-model="form.model" type="text" class="form__input" />
          </div>
          <div class="form__field">
            <label class="form__label">Серийный номер</label>
            <input v-model="form.serialNumber" type="text" class="form__input" />
          </div>
        </div>

        <div class="form__field">
          <label class="form__label">Статус</label>
          <select v-model="form.status" class="form__select">
            <option value="ACTIVE">В работе</option>
            <option value="UNDER_REPAIR">На ремонте</option>
            <option value="INACTIVE">Неактивен</option>
            <option value="DECOMMISSIONED">Списано</option>
          </select>
        </div>

        <div v-if="error" class="form__error">{{ error }}</div>

        <div class="form__actions">
          <button type="button" class="btn btn--outline" @click="router.back()">Отмена</button>
          <button type="submit" class="btn btn--primary" :disabled="saving">
            {{ saving ? 'Сохранение...' : 'Сохранить' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<style scoped>
.asset-edit {
  display: flex;
  flex-direction: column;
  gap: 20px;
  width: 100%;
  max-width: 800px;
  margin: 0 auto;
}

.asset-edit__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.asset-edit__title {
  font-size: 24px;
  font-weight: 700;
  color: #1e293b;
  margin: 0;
}

.asset-edit__loading,
.asset-edit__error {
  padding: 40px;
  text-align: center;
  font-size: 16px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}
.asset-edit__error {
  color: #ef4444;
  background: #fef2f2;
}

.asset-edit__card {
  background: #fff;
  border-radius: 12px;
  padding: 32px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}
.form__row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}
@media (max-width: 600px) {
  .form__row {
    grid-template-columns: 1fr;
  }
}

.form__field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.form__label {
  font-size: 14px;
  font-weight: 500;
  color: #334155;
}
.req {
  color: #ef4444;
}

.form__input,
.form__select {
  padding: 10px 14px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 14px;
  color: #1e293b;
  background: #fff;
  font-family: inherit;
  transition: border-color 0.15s ease;
}

.form__input:focus,
.form__select:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15);
}

.form__error {
  padding: 10px 12px;
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 8px;
  color: #ef4444;
  font-size: 13px;
}

.form__actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 8px;
}

.btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
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
.btn--primary:hover:not(:disabled) {
  background: #2563eb;
}
.btn--primary:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}
.btn--outline {
  background: #fff;
  color: #334155;
  border-color: #e2e8f0;
}
.btn--outline:hover {
  background: #f8fafc;
}

.asset-edit {
  display: flex;
  flex-direction: column;
  gap: 20px;
  width: 100%;
  max-width: 800px;
  margin: 0 auto;
}
.asset-edit__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.asset-edit__title {
  font-size: 24px;
  font-weight: 700;
  color: #1e293b;
  margin: 0;
}
.asset-edit__loading,
.asset-edit__error {
  padding: 40px;
  text-align: center;
  font-size: 16px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}
.asset-edit__error {
  color: #ef4444;
  background: #fef2f2;
}
.asset-edit__card {
  background: #fff;
  border-radius: 12px;
  padding: 32px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}
.form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}
.form__row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}
@media (max-width: 600px) {
  .form__row {
    grid-template-columns: 1fr;
  }
}
.form__field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.form__label {
  font-size: 14px;
  font-weight: 500;
  color: #334155;
}
.req {
  color: #ef4444;
}
.form__input,
.form__select {
  padding: 10px 14px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 14px;
  color: #1e293b;
  background: #fff;
  font-family: inherit;
  transition: border-color 0.15s ease;
}
.form__input:focus,
.form__select:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15);
}
.form__error {
  padding: 10px 12px;
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 8px;
  color: #ef4444;
  font-size: 13px;
}
.form__actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 8px;
}
.btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
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
.btn--primary:hover:not(:disabled) {
  background: #2563eb;
}
.btn--primary:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}
.btn--outline {
  background: #fff;
  color: #334155;
  border-color: #e2e8f0;
}
.btn--outline:hover {
  background: #f8fafc;
}

.combobox {
  position: relative;
}
.combobox__dropdown {
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  right: 0;
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  max-height: 200px;
  overflow-y: auto;
  z-index: 10;
}
.combobox__item {
  padding: 10px 14px;
  font-size: 14px;
  color: #1e293b;
  cursor: pointer;
  transition: background 0.15s;
}
.combobox__item:hover {
  background: #f1f5f9;
}
.combobox__item--selected {
  background: #eff6ff;
  color: #2563eb;
  font-weight: 500;
}
.combobox__empty {
  padding: 10px 14px;
  font-size: 14px;
  color: #94a3b8;
  text-align: center;
}
</style>
