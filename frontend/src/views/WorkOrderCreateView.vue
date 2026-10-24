<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { requestService } from '@/services/requestService'
import { assetService } from '@/services/assetService'
import { userService } from '@/services/userService'
import type { RequestView, AssetView, UserShort } from '@/services/models'
//import { formatFIO } from '@/utils/formatters'

import IconBack from '@/assets/icons/logout.svg?component'

const route = useRoute()
const router = useRouter()

const creationType = ref<'REQUEST' | 'PPR'>('REQUEST')
const loading = ref(true)
const saving = ref(false)
const error = ref<string | null>(null)

const form = ref({
  requestId: 0,
  assetId: 0,
  technicianId: null as number | null,
  plannedStartDate: '',
  plannedEndDate: '',
})

const requests = ref<RequestView[]>([])
const assets = ref<AssetView[]>([])
const technicians = ref<UserShort[]>([])

const searchReq = ref('')
const searchAsset = ref('')
const searchTech = ref('')

const isReqOpen = ref(false)
const isAssetOpen = ref(false)
const isTechOpen = ref(false)

const filteredRequests = computed(() => {
  const s = searchReq.value.toLowerCase()
  return s ? requests.value.filter((r) => r.asset.name.toLowerCase().includes(s)) : requests.value
})

const filteredAssets = computed(() => {
  const s = searchAsset.value.toLowerCase()
  return s ? assets.value.filter((a) => a.name.toLowerCase().includes(s)) : assets.value
})

const filteredTechs = computed(() => {
  const s = searchTech.value.toLowerCase()
  return s
    ? technicians.value.filter((t) => `${t.lastName} ${t.firstName}`.toLowerCase().includes(s))
    : technicians.value
})

const selectedRequest = computed(() => requests.value.find((r) => r.id === form.value.requestId))
const selectedAsset = computed(() => assets.value.find((a) => a.id === form.value.assetId))
const selectedTech = computed(() => technicians.value.find((t) => t.id === form.value.technicianId))

function selectRequest(req: RequestView) {
  form.value.requestId = req.id
  form.value.assetId = req.asset.id
  searchReq.value = ''
  isReqOpen.value = false
}

function selectAsset(asset: AssetView) {
  form.value.assetId = asset.id
  searchAsset.value = ''
  isAssetOpen.value = false
}

function selectTech(t: UserShort) {
  form.value.technicianId = t.id
  searchTech.value = ''
  isTechOpen.value = false
}

onMounted(async () => {
  try {
    const [reqResult, assetResult, techResult] = await Promise.all([
      requestService.getRequests({ search: '', status: 'ACCEPTED', page: 1, size: 100 }),
      assetService.getAssets({ search: '', status: 'ALL', page: 1, size: 100 }),
      userService.getUsers({ search: '', role: 'TECHNICIAN', page: 1, size: 100 }),
    ])
    requests.value = reqResult.content
    assets.value = assetResult.content
    technicians.value = techResult.content

    if (route.query.requestId) {
      creationType.value = 'REQUEST'
      const reqId = Number(route.query.requestId)
      const req = requests.value.find((r) => r.id === reqId)
      if (req) selectRequest(req)
    }
  } catch {
    error.value = 'Ошибка при загрузке данных'
  } finally {
    loading.value = false
  }
})

async function handleSave() {
  error.value = null
  if (creationType.value === 'REQUEST' && !form.value.requestId) {
    error.value = 'Выберите заявку'
    return
  }
  if (creationType.value === 'PPR' && !form.value.assetId) {
    error.value = 'Выберите оборудование'
    return
  }
  if (!form.value.technicianId) {
    error.value = 'Назначьте исполнителя'
    return
  }

  saving.value = true
  try {
    await new Promise((r) => setTimeout(r, 500))
    alert('Наряд успешно создан!')
    router.push('/work-orders')
  } catch {
    error.value = 'Ошибка при создании наряда'
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <div
    class="wo-create"
    @click="((isReqOpen = false), (isAssetOpen = false), (isTechOpen = false))"
  >
    <div class="page-header">
      <button class="btn-back" @click="router.back()">
        <IconBack class="icon-sm" />
        Назад
      </button>
      <h1 class="page-title">Создание наряда</h1>
    </div>

    <div v-if="loading" class="loading">Загрузка...</div>

    <div v-else class="create-card">
      <div class="type-tabs">
        <button
          class="type-tab"
          :class="{ 'type-tab--active': creationType === 'REQUEST' }"
          @click="((creationType = 'REQUEST'), (form.assetId = 0))"
        >
          На основе заявки
        </button>
        <button
          class="type-tab"
          :class="{ 'type-tab--active': creationType === 'PPR' }"
          @click="((creationType = 'PPR'), (form.requestId = 0))"
        >
          ППР (Плановый ремонт)
        </button>
      </div>

      <form @submit.prevent="handleSave" class="form">
        <div v-if="creationType === 'REQUEST'" class="form__field" @click.stop>
          <label class="form__label">Выберите заявку <span class="req">*</span></label>
          <div class="combobox">
            <input
              v-model="searchReq"
              type="text"
              class="form__input"
              :placeholder="
                selectedRequest
                  ? `Заявка #${selectedRequest.id} — ${selectedRequest.asset.name}`
                  : 'Поиск по оборудованию...'
              "
              @focus="isReqOpen = true"
            />
            <div v-if="isReqOpen" class="combobox__dropdown">
              <div
                v-for="req in filteredRequests"
                :key="req.id"
                class="combobox__item"
                @click="selectRequest(req)"
              >
                <div class="combobox__item-title">Заявка #{{ req.id }} — {{ req.asset.name }}</div>
                <div class="combobox__item-subtitle">{{ req.description }}</div>
              </div>
              <div v-if="filteredRequests.length === 0" class="combobox__empty">
                Принятых заявок не найдено
              </div>
            </div>
          </div>
        </div>

        <div v-if="creationType === 'PPR'" class="form__field" @click.stop>
          <label class="form__label">Выберите оборудование <span class="req">*</span></label>
          <div class="combobox">
            <input
              v-model="searchAsset"
              type="text"
              class="form__input"
              :placeholder="
                selectedAsset
                  ? `${selectedAsset.name} (${selectedAsset.inventoryNumber})`
                  : 'Поиск по названию или инв. номеру...'
              "
              @focus="isAssetOpen = true"
            />
            <div v-if="isAssetOpen" class="combobox__dropdown">
              <div
                v-for="asset in filteredAssets"
                :key="asset.id"
                class="combobox__item"
                @click="selectAsset(asset)"
              >
                <div class="combobox__item-title">{{ asset.name }}</div>
                <div class="combobox__item-subtitle">{{ asset.inventoryNumber }}</div>
              </div>
            </div>
          </div>
        </div>

        <div class="form__field" @click.stop>
          <label class="form__label">Исполнитель (Механик) <span class="req">*</span></label>
          <div class="combobox">
            <input
              v-model="searchTech"
              type="text"
              class="form__input"
              :placeholder="
                selectedTech
                  ? `${selectedTech.lastName} ${selectedTech.firstName}`
                  : 'Выберите механика'
              "
              @focus="isTechOpen = true"
            />
            <div v-if="isTechOpen" class="combobox__dropdown">
              <div
                v-for="tech in filteredTechs"
                :key="tech.id"
                class="combobox__item"
                @click="selectTech(tech)"
              >
                {{ tech.lastName }} {{ tech.firstName }} {{ tech.middleName }}
              </div>
            </div>
          </div>
        </div>

        <div class="form__row">
          <div class="form__field">
            <label class="form__label">Плановая дата начала</label>
            <input v-model="form.plannedStartDate" type="date" class="form__input" />
          </div>
          <div class="form__field">
            <label class="form__label">Плановая дата окончания</label>
            <input v-model="form.plannedEndDate" type="date" class="form__input" />
          </div>
        </div>

        <div v-if="error" class="form__error">{{ error }}</div>

        <div class="form__actions">
          <button type="button" class="btn btn--outline" @click="router.back()">Отмена</button>
          <button type="submit" class="btn btn--primary" :disabled="saving">
            {{ saving ? 'Создание...' : 'Создать наряд' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<style scoped>
.wo-create {
  display: flex;
  flex-direction: column;
  gap: 20px;
  width: 100%;
  max-width: 700px;
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

.type-tabs {
  display: flex;
  background: #f1f5f9;
  padding: 4px;
  border-radius: 8px;
  margin-bottom: 24px;
}
.type-tab {
  flex: 1;
  padding: 10px;
  border: none;
  background: transparent;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  color: #64748b;
  cursor: pointer;
  font-family: inherit;
  transition:
    background 0.15s,
    color 0.15s;
}
.type-tab--active {
  background: #fff;
  color: #1e293b;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
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

.form__input {
  padding: 10px 14px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 14px;
  color: #1e293b;
  background: #fff;
  font-family: inherit;
  transition: border-color 0.15s ease;
}
.form__input:focus {
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
  max-height: 250px;
  overflow-y: auto;
  z-index: 10;
}
.combobox__item {
  padding: 10px 14px;
  cursor: pointer;
  border-bottom: 1px solid #f1f5f9;
}
.combobox__item:last-child {
  border-bottom: none;
}
.combobox__item:hover {
  background: #f8fafc;
}
.combobox__item-title {
  font-size: 14px;
  font-weight: 500;
  color: #1e293b;
}
.combobox__item-subtitle {
  font-size: 12px;
  color: #64748b;
  margin-top: 2px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.combobox__empty {
  padding: 16px;
  text-align: center;
  color: #94a3b8;
  font-size: 14px;
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
