<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { dictionaryService } from '@/services/dictionaryService'
import { userService } from '@/services/userService'
import type { AssetStatus, AssetType, Location, UserShort } from '@/services/models'

import IconBack from '@/assets/icons/logout.svg?component'
import IconUpload from '@/assets/icons/upload.svg?component'

const router = useRouter()

const form = ref({
  name: '',
  inventoryNumber: '',
  assetTypeId: 0,
  model: '',
  serialNumber: '',
  commissionDate: '',
  locationId: 0,
  responsibleUserId: null as number | null,
  status: 'ACTIVE' as AssetStatus,
})

const assetTypes = ref<AssetType[]>([])
const locations = ref<Location[]>([])
const users = ref<UserShort[]>([])

const loading = ref(true)
const saving = ref(false)
const error = ref<string | null>(null)

const typeSearch = ref('')
const locationSearch = ref('')
const userSearch = ref('')
const isTypeOpen = ref(false)
const isLocationOpen = ref(false)
const isUserOpen = ref(false)

const filteredTypes = computed(() => {
  const s = typeSearch.value.toLowerCase()
  return s ? assetTypes.value.filter((t) => t.name.toLowerCase().includes(s)) : assetTypes.value
})

const filteredLocations = computed(() => {
  const s = locationSearch.value.toLowerCase()
  return s ? locations.value.filter((l) => l.name.toLowerCase().includes(s)) : locations.value
})

const filteredUsers = computed(() => {
  const s = userSearch.value.toLowerCase()
  return s
    ? users.value.filter((u) => `${u.lastName} ${u.firstName}`.toLowerCase().includes(s))
    : users.value
})

const selectedTypeName = computed(
  () => assetTypes.value.find((t) => t.id === form.value.assetTypeId)?.name || '',
)
const selectedLocationName = computed(
  () => locations.value.find((l) => l.id === form.value.locationId)?.name || '',
)
const selectedUserName = computed(() => {
  const u = users.value.find((u) => u.id === form.value.responsibleUserId)
  return u ? `${u.lastName} ${u.firstName.charAt(0)}.` : ''
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

function selectUser(user: UserShort) {
  form.value.responsibleUserId = user.id
  userSearch.value = ''
  isUserOpen.value = false
}

onMounted(async () => {
  try {
    const [typesData, locationsData, usersData] = await Promise.all([
      dictionaryService.getAssetTypes(),
      dictionaryService.getLocations(),
      userService.getUsers({ search: '', role: 'ALL', page: 1, size: 100 }),
    ])
    assetTypes.value = typesData
    locations.value = locationsData
    users.value = usersData.content
  } catch {
    error.value = 'Ошибка загрузки справочников'
  } finally {
    loading.value = false
  }
})

async function handleSave() {
  error.value = null
  if (
    !form.value.name.trim() ||
    !form.value.inventoryNumber.trim() ||
    !form.value.assetTypeId ||
    !form.value.locationId
  ) {
    error.value = 'Заполните обязательные поля (Наименование, Инв. номер, Тип, Локация)'
    return
  }

  saving.value = true
  try {
    await new Promise((r) => setTimeout(r, 500))
    alert('Актив успешно создан!')
    router.push('/assets')
  } catch {
    error.value = 'Ошибка при создании актива'
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <div
    class="asset-create"
    @click="((isTypeOpen = false), (isLocationOpen = false), (isUserOpen = false))"
  >
    <div class="page-header">
      <button class="btn-back" @click="router.back()">
        <IconBack class="icon-sm" />
        Назад
      </button>
      <h1 class="page-title">Новый актив</h1>
    </div>

    <div v-if="loading" class="loading">Загрузка...</div>

    <div v-else class="create-card">
      <form @submit.prevent="handleSave" class="form">
        <div class="form__row">
          <div class="form__field">
            <label class="form__label">Наименование <span class="req">*</span></label>
            <input
              v-model="form.name"
              type="text"
              class="form__input"
              placeholder="Например: Станок ЧПУ"
              required
            />
          </div>
          <div class="form__field">
            <label class="form__label">Инвентарный номер <span class="req">*</span></label>
            <input
              v-model="form.inventoryNumber"
              type="text"
              class="form__input"
              placeholder="INV-XXX"
              required
            />
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
                :placeholder="selectedTypeName || 'Выберите тип'"
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
                :placeholder="selectedLocationName || 'Выберите локацию'"
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

        <div class="form__row">
          <div class="form__field">
            <label class="form__label">Дата ввода в эксплуатацию</label>
            <input v-model="form.commissionDate" type="date" class="form__input" />
          </div>
          <div class="form__field" @click.stop>
            <label class="form__label">Ответственный сотрудник</label>
            <div class="combobox">
              <input
                v-model="userSearch"
                type="text"
                class="form__input"
                :placeholder="selectedUserName || 'Выберите сотрудника'"
                @focus="isUserOpen = true"
              />
              <div v-if="isUserOpen" class="combobox__dropdown">
                <div
                  v-for="user in filteredUsers"
                  :key="user.id"
                  class="combobox__item"
                  :class="{ 'combobox__item--selected': form.responsibleUserId === user.id }"
                  @click="selectUser(user)"
                >
                  {{ user.lastName }} {{ user.firstName }}
                </div>
                <div v-if="filteredUsers.length === 0" class="combobox__empty">Не найдено</div>
              </div>
            </div>
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

        <div class="form__field">
          <label class="form__label">Документы и фотографии</label>
          <div class="upload-zone">
            <IconUpload class="upload-zone__icon" />
            <div class="upload-zone__text">Перетащите файлы сюда или нажмите для выбора</div>
            <div class="upload-zone__hint">
              Паспорт оборудования, инструкции, фото (JPG, PNG, PDF)
            </div>
            <input type="file" multiple class="upload-zone__input" disabled />
          </div>
        </div>

        <div v-if="error" class="form__error">{{ error }}</div>

        <div class="form__actions">
          <button type="button" class="btn btn--outline" @click="router.back()">Отмена</button>
          <button type="submit" class="btn btn--primary" :disabled="saving">
            {{ saving ? 'Сохранение...' : 'Создать актив' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<style scoped>
.asset-create {
  display: flex;
  flex-direction: column;
  gap: 20px;
  width: 100%;
  max-width: 800px;
  margin: 0 auto;
}
.page-header {
  display: flex;
  align-items: center;
  gap: 16px;
}
.page-title {
  font-size: 24px;
  font-weight: 700;
  color: #1e293b;
  margin: 0;
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
  font-family: inherit;
  padding: 4px 0;
}
.btn-back:hover {
  color: #1e293b;
}
.loading {
  padding: 40px;
  text-align: center;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.create-card {
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

.upload-zone {
  position: relative;
  border: 2px dashed #cbd5e1;
  border-radius: 12px;
  padding: 32px;
  text-align: center;
  background: #f8fafc;
  transition:
    border-color 0.15s ease,
    background 0.15s ease;
}
.upload-zone:hover {
  background: #f1f5f9;
  border-color: #94a3b8;
}
.upload-zone__input {
  position: absolute;
  inset: 0;
  opacity: 0;
  cursor: pointer;
}
.upload-zone__icon {
  width: 32px;
  height: 32px;
  color: #94a3b8;
  margin: 0 auto 12px;
  display: block;
}
.upload-zone__text {
  font-size: 14px;
  font-weight: 500;
  color: #334155;
  margin-bottom: 4px;
}
.upload-zone__hint {
  font-size: 12px;
  color: #64748b;
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
  border-top: 1px solid #e2e8f0;
  padding-top: 24px;
}

.btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 24px;
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
.icon-sm {
  width: 16px;
  height: 16px;
}
</style>
