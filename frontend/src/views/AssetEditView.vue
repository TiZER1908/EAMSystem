<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { assetService } from '@/services/assetService'
import type { Asset, AssetStatus, DictionaryItem } from '@/services/models'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore

const assetId = computed(() => Number(route.params.id))
const role = computed(() => authStore.user.role)
const canEdit = computed(() => ['ADMIN', 'MASTER'].includes(role.value))

const form = ref({
  name: '',
  inventoryNumber: '',
  assetTypeName: '',
  model: '',
  serialNumber: '',
  locationName: '',
  status: 'ACTIVE' as AssetStatus,
})

const assetTypes = ref<DictionaryItem[]>([])
const locations = ref<DictionaryItem[]>([])

const loading = ref(true)
const saving = ref(false)
const error = ref<string | null>(null)

onMounted(async () => {
  if (!canEdit.value) {
    router.push(`/assets/${assetId.value}`)
    return
  }

  try {
    const [assetData, typesData, locationsData] = await Promise.all([
      assetService.getAssetById(assetId.value),
      assetService.getAssetTypes(),
      assetService.getLocations(),
    ])

    assetTypes.value = typesData
    locations.value = locationsData

    form.value = {
      name: assetData.name,
      inventoryNumber: assetData.inventoryNumber,
      assetTypeName: assetData.assetTypeName,
      model: assetData.model,
      serialNumber: assetData.serialNumber,
      locationName: assetData.locationName,
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
  <div class="asset-edit">
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
          <div class="form__field">
            <label class="form__label">Тип оборудования</label>
            <select v-model="form.assetTypeName" class="form__select">
              <option value="" disabled>Выберите тип</option>
              <option v-for="type in assetTypes" :key="type.id" :value="type.name">
                {{ type.name }}
              </option>
            </select>
          </div>
          <div class="form__field">
            <label class="form__label">Локация</label>
            <select v-model="form.locationName" class="form__select">
              <option value="" disabled>Выберите локацию</option>
              <option v-for="loc in locations" :key="loc.id" :value="loc.name">
                {{ loc.name }}
              </option>
            </select>
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
</style>
