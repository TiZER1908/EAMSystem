<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { workOrderService } from '@/services/workOrderService'
import { userService } from '@/services/userService'
import { sparePartService } from '@/services/sparePartService'
import type {
  WorkOrderDetailView,
  WorkOrderStatus,
  UserShort,
  SparePartView,
} from '@/services/models'
import { formatFIO } from '@/utils/formatters'

import IconBack from '@/assets/icons/logout.svg?component'
import IconCheck from '@/assets/icons/success.svg?component'
import IconPlay from '@/assets/icons/play.svg?component'
import IconX from '@/assets/icons/x.svg?component'
import IconLink from '@/assets/icons/requests.svg?component'
import IconPlus from '@/assets/icons/plus.svg?component'
import IconTrash from '@/assets/icons/archive.svg?component'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore

const woId = computed(() => Number(route.params.id))
const role = computed(() => authStore.user.role)
const currentUserId = computed(() => authStore.user.id)

const workOrder = ref<WorkOrderDetailView | null>(null)
const loading = ref(true)
const error = ref<string | null>(null)
const saving = ref(false)

const isMasterOrAdmin = computed(() => ['ADMIN', 'MASTER'].includes(role.value))
const isAssignedTech = computed(() => workOrder.value?.technicianId === currentUserId.value)
const canView = computed(() => isMasterOrAdmin.value || isAssignedTech.value)

const canEdit = computed(() => isMasterOrAdmin.value && workOrder.value?.status === 'DRAFT')
const canConfirm = computed(() => isMasterOrAdmin.value && workOrder.value?.status === 'DRAFT')
const canCancel = computed(
  () => isMasterOrAdmin.value && !['CLOSED', 'CANCELLED'].includes(workOrder.value?.status || ''),
)
const canReturnToDraft = computed(
  () => isMasterOrAdmin.value && workOrder.value?.status === 'ASSIGNED',
)
const canStart = computed(() => isAssignedTech.value && workOrder.value?.status === 'ASSIGNED')
const canComplete = computed(
  () => isAssignedTech.value && workOrder.value?.status === 'IN_PROGRESS',
)
const canClose = computed(() => isMasterOrAdmin.value && workOrder.value?.status === 'COMPLETED')
//const canReturn = computed(() => isMasterOrAdmin.value && workOrder.value?.status === 'COMPLETED')

const isEditing = ref(false)
const editForm = ref({
  technicianId: null as number | null,
  plannedStartDate: '',
  plannedEndDate: '',
})

const technicians = ref<UserShort[]>([])
const allSpareParts = ref<SparePartView[]>([])

const techSearch = ref('')
const spSearch = ref('')
const isTechOpen = ref(false)
const isSpOpen = ref(false)

const filteredTechs = computed(() => {
  const s = techSearch.value.toLowerCase()
  return s
    ? technicians.value.filter((t) => `${t.lastName} ${t.firstName}`.toLowerCase().includes(s))
    : technicians.value
})

const filteredSpareParts = computed(() => {
  const s = spSearch.value.toLowerCase()
  return s
    ? allSpareParts.value.filter((sp) => sp.name.toLowerCase().includes(s))
    : allSpareParts.value
})

const selectedTechName = computed(() => {
  const t = technicians.value.find((t) => t.id === editForm.value.technicianId)
  return t ? `${t.lastName} ${t.firstName.charAt(0)}.` : ''
})

function selectTech(t: UserShort) {
  editForm.value.technicianId = t.id
  techSearch.value = ''
  isTechOpen.value = false
}

function addSparePart(sp: SparePartView) {
  if (!workOrder.value) return
  const existing = workOrder.value.spareParts.find((p) => p.sparePartId === sp.id)
  if (existing) {
    existing.plannedQuantity = (existing.plannedQuantity || 0) + 1
  } else {
    workOrder.value.spareParts.push({
      id: Date.now(),
      workOrderId: woId.value,
      sparePartId: sp.id,
      plannedQuantity: 1,
      actualQuantity: null,
      isPlanned: true,
      isDeleted: false,
      deletedAt: null,
      deletedBy: null,
      sparePartName: sp.name,
    })
  }
  spSearch.value = ''
  isSpOpen.value = false
}

function removeSparePart(id: number) {
  if (!workOrder.value) return
  workOrder.value.spareParts = workOrder.value.spareParts.filter((p) => p.id !== id)
}

function addTask() {
  if (!workOrder.value) return
  workOrder.value.tasks.push({
    id: Date.now(),
    workOrderId: woId.value,
    name: '',
    volume: null,
    isCompleted: false,
    completedAt: null,
    sortOrder: workOrder.value.tasks.length,
    isDeleted: false,
    deletedAt: null,
    deletedBy: null,
  })
}

function removeTask(id: number) {
  if (!workOrder.value) return
  workOrder.value.tasks = workOrder.value.tasks.filter((t) => t.id !== id)
}

async function loadData() {
  loading.value = true
  try {
    const data = await workOrderService.getWorkOrderById(woId.value)
    workOrder.value = data

    if (isMasterOrAdmin.value) {
      const [usersData, spData] = await Promise.all([
        userService.getUsers({ search: '', role: 'TECHNICIAN', page: 1, size: 100 }),
        sparePartService.getSpareParts({ search: '', page: 1, size: 100 }),
      ])
      technicians.value = usersData.content
      allSpareParts.value = spData.content
    }
  } catch {
    error.value = 'Наряд не найден или у вас нет доступа'
  } finally {
    loading.value = false
  }
}

onMounted(loadData)

function startEditing() {
  if (!workOrder.value) return
  editForm.value = {
    technicianId: workOrder.value.technicianId,
    plannedStartDate: workOrder.value.plannedStartDate || '',
    plannedEndDate: workOrder.value.plannedEndDate || '',
  }
  isEditing.value = true
}

async function saveEditing() {
  saving.value = true
  try {
    await new Promise((r) => setTimeout(r, 500))
    if (workOrder.value) {
      workOrder.value.technicianId = editForm.value.technicianId
      workOrder.value.plannedStartDate = editForm.value.plannedStartDate
      workOrder.value.plannedEndDate = editForm.value.plannedEndDate
    }
    isEditing.value = false
    alert('Изменения сохранены')
  } finally {
    saving.value = false
  }
}

function statusLabel(status: WorkOrderStatus): string {
  const map: Record<WorkOrderStatus, string> = {
    DRAFT: 'Черновик',
    ASSIGNED: 'Назначен',
    IN_PROGRESS: 'В работе',
    COMPLETED: 'Выполнен',
    CLOSED: 'Закрыт',
    CANCELLED: 'Отменён',
  }
  return map[status]
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('ru-RU')
}

async function handleAction(action: string) {
  if (!confirm(`Вы уверены, что хотите выполнить действие: ${action}?`)) return
  alert(`Действие "${action}" успешно выполнено`)
  router.push('/work-orders')
}

function toggleTask(taskId: number) {
  if (!workOrder.value) return
  const task = workOrder.value.tasks.find((t) => t.id === taskId)
  if (task) {
    task.isCompleted = !task.isCompleted
    task.completedAt = task.isCompleted ? new Date().toISOString() : null
  }
}
</script>

<template>
  <div class="wo-detail" @click="((isTechOpen = false), (isSpOpen = false))">
    <div v-if="loading" class="loading">Загрузка...</div>
    <div v-else-if="error || !canView" class="error">{{ error || 'У вас нет доступа' }}</div>

    <template v-else-if="workOrder">
      <div class="page-header">
        <button class="btn-back" @click="router.back()"><IconBack class="icon-sm" /> Назад</button>

        <div class="actions">
          <template v-if="!isEditing">
            <button v-if="canEdit" class="btn btn--outline" @click="startEditing">
              Редактировать
            </button>
            <button
              v-if="canReturnToDraft"
              class="btn btn--outline"
              @click="handleAction('Вернуть в черновик')"
            >
              Вернуть в черновик
            </button>
            <button
              v-if="canConfirm"
              class="btn btn--primary"
              @click="handleAction('Подтвердить наряд')"
            >
              <IconCheck class="icon-sm" /> Подтвердить
            </button>
            <button v-if="canStart" class="btn btn--primary" @click="handleAction('Начать работу')">
              <IconPlay class="icon-sm" /> Начать работу
            </button>
            <button v-if="canComplete" class="btn btn--primary" @click="handleAction('Завершить')">
              <IconCheck class="icon-sm" /> Завершить
            </button>
            <template v-if="canClose">
              <button class="btn btn--danger-outline" @click="handleAction('Вернуть на доработку')">
                <IconX class="icon-sm" /> Вернуть
              </button>
              <button class="btn btn--primary" @click="handleAction('Закрыть наряд')">
                <IconCheck class="icon-sm" /> Закрыть
              </button>
            </template>
            <button
              v-if="canCancel"
              class="btn btn--danger-outline"
              @click="handleAction('Отменить')"
            >
              <IconX class="icon-sm" /> Отменить
            </button>
          </template>

          <template v-else>
            <button class="btn btn--outline" @click="isEditing = false">Отмена</button>
            <button class="btn btn--primary" :disabled="saving" @click="saveEditing">
              {{ saving ? 'Сохранение...' : 'Сохранить' }}
            </button>
          </template>
        </div>
      </div>

      <div class="wo-card">
        <div class="wo-card__header">
          <div>
            <div class="wo-card__meta">
              <span class="badge" :class="`badge--status-${workOrder.status.toLowerCase()}`">
                {{ statusLabel(workOrder.status) }}
              </span>
            </div>
            <h1 class="wo-card__title">Наряд #{{ workOrder.id }}</h1>
          </div>
        </div>

        <div class="wo-card__body">
          <div class="info-grid">
            <div class="info-item">
              <span class="info-label">Оборудование</span>
              <router-link :to="`/assets/${workOrder.asset.id}`" class="info-link">
                {{ workOrder.asset.name }} ({{ workOrder.asset.inventoryNumber }})
              </router-link>
            </div>

            <div class="info-item" @click.stop>
              <span class="info-label">Исполнитель</span>
              <div v-if="isEditing" class="combobox">
                <input
                  v-model="techSearch"
                  type="text"
                  class="form__input"
                  :placeholder="selectedTechName || 'Выберите механика'"
                  @focus="isTechOpen = true"
                />
                <div v-if="isTechOpen" class="combobox__dropdown">
                  <div
                    v-for="t in filteredTechs"
                    :key="t.id"
                    class="combobox__item"
                    @click="selectTech(t)"
                  >
                    {{ t.lastName }} {{ t.firstName }}
                  </div>
                </div>
              </div>
              <span v-else-if="workOrder.technician" class="info-text">{{
                formatFIO(workOrder.technician)
              }}</span>
              <span v-else class="info-text text-muted">Не назначен</span>
            </div>

            <div class="info-item">
              <span class="info-label">Плановые сроки</span>
              <div v-if="isEditing" class="dates-edit">
                <input v-model="editForm.plannedStartDate" type="date" class="form__input" />
                <span>—</span>
                <input v-model="editForm.plannedEndDate" type="date" class="form__input" />
              </div>
              <span v-else class="info-text"
                >{{ formatDate(workOrder.plannedStartDate) }} —
                {{ formatDate(workOrder.plannedEndDate) }}</span
              >
            </div>

            <div class="info-item">
              <span class="info-label">Фактические сроки</span>
              <span class="info-text"
                >{{ formatDate(workOrder.actualStartDate) }} —
                {{ formatDate(workOrder.actualEndDate) }}</span
              >
            </div>
          </div>

          <div v-if="workOrder.requestId" class="linked-block">
            <div class="linked-block__icon"><IconLink class="icon-sm" /></div>
            <div class="linked-block__content">
              <span class="linked-block__label">Создан на основе заявки:</span>
              <router-link :to="`/requests/${workOrder.requestId}`" class="info-link">
                Заявка #{{ workOrder.requestId }}
              </router-link>
            </div>
          </div>

          <div class="section">
            <div class="section__header">
              <h3 class="section__title">Перечень работ</h3>
              <button
                v-if="isEditing"
                type="button"
                class="btn btn--outline btn--sm"
                @click="addTask"
              >
                <IconPlus class="icon-sm" /> Добавить работу
              </button>
            </div>
            <div class="tasks-list">
              <div v-for="task in workOrder.tasks" :key="task.id" class="task-item">
                <input
                  type="checkbox"
                  :disabled="!canComplete && workOrder.status !== 'IN_PROGRESS'"
                  :checked="task.isCompleted"
                  @change="toggleTask(task.id)"
                  class="task-checkbox"
                />
                <input
                  v-if="isEditing"
                  v-model="task.name"
                  type="text"
                  class="form__input"
                  style="flex: 1; padding: 6px 10px"
                />
                <span v-else class="task-name" :class="{ 'task-name--done': task.isCompleted }">{{
                  task.name
                }}</span>
                <button v-if="isEditing" class="btn-trash" @click="removeTask(task.id)">
                  <IconTrash class="icon-sm" />
                </button>
              </div>
              <div v-if="workOrder.tasks.length === 0" class="text-muted" style="font-size: 14px">
                Нет работ
              </div>
            </div>
          </div>

          <div class="section">
            <div class="section__header">
              <h3 class="section__title">Запчасти</h3>
              <div v-if="isEditing" class="combobox" @click.stop>
                <button
                  type="button"
                  class="btn btn--outline btn--sm"
                  @click="isSpOpen = !isSpOpen"
                >
                  <IconPlus class="icon-sm" /> Добавить
                </button>
                <div
                  v-if="isSpOpen"
                  class="combobox__dropdown"
                  style="width: 300px; left: auto; right: 0"
                >
                  <div class="combobox__search">
                    <input
                      v-model="spSearch"
                      type="text"
                      class="form__input"
                      placeholder="Поиск запчасти..."
                    />
                  </div>
                  <div
                    v-for="sp in filteredSpareParts"
                    :key="sp.id"
                    class="combobox__item"
                    @click="addSparePart(sp)"
                  >
                    {{ sp.name }}
                  </div>
                </div>
              </div>
            </div>

            <table class="mini-table">
              <thead>
                <tr>
                  <th>Запчасть</th>
                  <th>Кол-во (План)</th>
                  <th v-if="canComplete || workOrder.status === 'IN_PROGRESS'">Кол-во (Факт)</th>
                  <th v-if="isEditing"></th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(part, index) in workOrder.spareParts" :key="part.id">
                  <td>{{ part.sparePartName }}</td>
                  <td>
                    <span v-if="!isEditing">{{ part.plannedQuantity }} шт</span>
                    <input
                      v-else
                      v-model.number="workOrder.spareParts[index]!.plannedQuantity"
                      type="number"
                      min="1"
                      class="form__input"
                      style="width: 70px; padding: 4px 8px"
                    />
                  </td>
                  <td v-if="canComplete || workOrder.status === 'IN_PROGRESS'">
                    <input
                      v-model.number="part.actualQuantity"
                      type="number"
                      min="0"
                      class="form__input"
                      style="width: 70px; padding: 4px 8px"
                      placeholder="0"
                    />
                  </td>
                  <td v-if="isEditing">
                    <button class="btn-trash" @click="removeSparePart(part.id)">
                      <IconTrash class="icon-sm" />
                    </button>
                  </td>
                </tr>
                <tr v-if="workOrder.spareParts.length === 0">
                  <td colspan="4" class="text-muted" style="text-align: center; padding: 20px">
                    Нет запчастей
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<style scoped>
.wo-detail {
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
  flex-wrap: wrap;
  gap: 12px;
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
.actions {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
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
.btn--primary {
  background: #3b82f6;
  color: #fff;
}
.btn--primary:hover {
  background: #2563eb;
}
.btn--outline {
  background: #fff;
  color: #334155;
  border-color: #e2e8f0;
}
.btn--outline:hover {
  background: #f8fafc;
}
.btn--danger-outline {
  background: #fff;
  color: #ef4444;
  border-color: #fecaca;
}
.btn--danger-outline:hover {
  background: #fef2f2;
}
.btn--sm {
  padding: 6px 12px;
  font-size: 13px;
}
.icon-sm {
  width: 16px;
  height: 16px;
}

.wo-card {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  overflow: hidden;
}
.wo-card__header {
  padding: 24px;
  border-bottom: 1px solid #e2e8f0;
}
.wo-card__meta {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
}
.wo-card__title {
  font-size: 24px;
  font-weight: 700;
  color: #1e293b;
  margin: 0;
}
.wo-card__body {
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 24px;
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
.info-link {
  color: #3b82f6;
  font-weight: 500;
  text-decoration: none;
  font-size: 15px;
}
.info-link:hover {
  text-decoration: underline;
}
.info-text {
  font-size: 15px;
  color: #1e293b;
  font-weight: 500;
}
.text-muted {
  color: #94a3b8;
  font-weight: 400;
}

.dates-edit {
  display: flex;
  align-items: center;
  gap: 8px;
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
  max-height: 200px;
  overflow-y: auto;
  z-index: 10;
}
.combobox__search {
  padding: 8px;
  border-bottom: 1px solid #e2e8f0;
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

.linked-block {
  display: flex;
  gap: 16px;
  align-items: center;
  background: #eff6ff;
  padding: 16px;
  border-radius: 8px;
  border: 1px solid #bfdbfe;
}
.linked-block__icon {
  color: #3b82f6;
  background: #dbeafe;
  padding: 8px;
  border-radius: 50%;
  display: flex;
}
.linked-block__content {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.linked-block__label {
  font-size: 13px;
  color: #1e40af;
}

.section {
  border-top: 1px solid #e2e8f0;
  padding-top: 20px;
}
.section__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}
.section__title {
  font-size: 16px;
  font-weight: 600;
  color: #1e293b;
  margin: 0;
}

.tasks-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.task-item {
  display: flex;
  align-items: center;
  gap: 12px;
}
.task-checkbox {
  width: 16px;
  height: 16px;
  accent-color: #3b82f6;
  cursor: pointer;
}
.task-checkbox:disabled {
  cursor: not-allowed;
}
.task-name {
  font-size: 14px;
  color: #334155;
}
.task-name--done {
  text-decoration: line-through;
  color: #94a3b8;
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
  vertical-align: middle;
}
.mini-table tbody tr:last-child td {
  border-bottom: none;
}

.btn-trash {
  background: none;
  border: none;
  color: #ef4444;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.15s;
}
.btn-trash:hover {
  background: #fef2f2;
}

.badge {
  display: inline-block;
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
}
.badge--status-draft {
  background: #f1f5f9;
  color: #64748b;
}
.badge--status-assigned {
  background: #dbeafe;
  color: #1e40af;
}
.badge--status-in_progress {
  background: #fef3c7;
  color: #92400e;
}
.badge--status-completed {
  background: #e0e7ff;
  color: #3730a3;
}
.badge--status-closed {
  background: #d1fae5;
  color: #065f46;
}
.badge--status-cancelled {
  background: #fee2e2;
  color: #991b1b;
}
</style>
