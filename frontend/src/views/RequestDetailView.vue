<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { requestService } from '@/services/requestService'
import { workOrderService } from '@/services/workOrderService'
import type { RequestView, WorkOrderView, RequestStatus, RequestPriority } from '@/services/models'
import { formatFIO } from '@/utils/formatters'

import IconBack from '@/assets/icons/logout.svg?component'
import IconCheck from '@/assets/icons/success.svg?component'
import IconX from '@/assets/icons/x.svg?component'
import IconLink from '@/assets/icons/work-orders.svg?component'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore

const requestId = computed(() => Number(route.params.id))
const role = computed(() => authStore.user.role)
const currentUserId = computed(() => authStore.user.id)

const request = ref<RequestView | null>(null)
const linkedWorkOrder = ref<WorkOrderView | null>(null)
const loading = ref(true)
const error = ref<string | null>(null)

const isMasterOrAdmin = computed(() => ['ADMIN', 'MASTER'].includes(role.value))
const isAuthor = computed(() => request.value?.authorId === currentUserId.value)
const canView = computed(() => isMasterOrAdmin.value || isAuthor.value)

const canProcess = computed(() => isMasterOrAdmin.value && request.value?.status === 'NEW')
const canCancel = computed(() => isAuthor.value && request.value?.status === 'NEW')

async function loadData() {
  loading.value = true
  error.value = null
  try {
    const reqData = await requestService.getRequestById(requestId.value)
    request.value = reqData

    if (reqData.status === 'IN_PROGRESS' || reqData.status === 'CLOSED') {
      const woResult = await workOrderService.getWorkOrders({
        search: '',
        status: 'ALL',
        page: 1,
        size: 100,
      })
      linkedWorkOrder.value = woResult.content.find((wo) => wo.requestId === reqData.id) || null
    }
  } catch {
    error.value = 'Заявка не найдена или у вас нет доступа'
  } finally {
    loading.value = false
  }
}

onMounted(loadData)

function statusLabel(status: RequestStatus): string {
  const map: Record<RequestStatus, string> = {
    NEW: 'Новая',
    ACCEPTED: 'Принята',
    IN_PROGRESS: 'В работе',
    CLOSED: 'Закрыта',
    REJECTED: 'Отклонена',
    CANCELLED: 'Отменена',
  }
  return map[status]
}

function priorityLabel(priority: RequestPriority): string {
  const map: Record<RequestPriority, string> = {
    LOW: 'Низкий',
    NORMAL: 'Обычный',
    HIGH: 'Высокий',
    CRITICAL: 'Критичный',
  }
  return map[priority]
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

async function handleAccept() {
  if (!confirm('Принять заявку в работу?')) return
  try {
    alert('Заявка принята. Теперь можно создать наряд.')
    router.push(`/work-orders/new?requestId=${requestId.value}`)
  } catch {
    alert('Ошибка при принятии заявки')
  }
}

async function handleReject() {
  const reason = prompt('Укажите причину отклонения:')
  if (reason === null) return
  if (!reason.trim()) {
    alert('Причина обязательна для заполнения')
    return
  }
  try {
    alert(`Заявка отклонена. Причина: ${reason}`)
    router.push('/requests')
  } catch {
    alert('Ошибка при отклонении заявки')
  }
}

async function handleCancel() {
  if (!confirm('Вы уверены, что хотите отменить свою заявку?')) return
  try {
    alert('Заявка успешно отменена')
    router.push('/requests')
  } catch {
    alert('Ошибка при отмене заявки')
  }
}
</script>

<template>
  <div class="request-detail">
    <div v-if="loading" class="loading">Загрузка...</div>
    <div v-else-if="error || !canView" class="error">
      {{ error || 'У вас нет доступа к этой заявке' }}
    </div>

    <template v-else-if="request">
      <div class="page-header">
        <button class="btn-back" @click="router.back()">
          <IconBack class="icon-sm" />
          Назад
        </button>

        <div class="actions">
          <button v-if="canCancel" class="btn btn--danger-outline" @click="handleCancel">
            <IconX class="icon-sm" />
            Отменить заявку
          </button>

          <template v-if="canProcess">
            <button class="btn btn--danger-outline" @click="handleReject">
              <IconX class="icon-sm" />
              Отклонить
            </button>
            <button class="btn btn--primary" @click="handleAccept">
              <IconCheck class="icon-sm" />
              Принять в работу
            </button>
          </template>
        </div>
      </div>

      <div class="request-card">
        <div class="request-card__header">
          <div>
            <div class="request-card__meta">
              <span class="badge" :class="`badge--priority-${request.priority.toLowerCase()}`">
                {{ priorityLabel(request.priority) }}
              </span>
              <span class="badge" :class="`badge--status-${request.status.toLowerCase()}`">
                {{ statusLabel(request.status) }}
              </span>
            </div>
            <h1 class="request-card__title">Заявка #{{ request.id }}</h1>
            <p class="request-card__date">Создана: {{ formatDate(request.createdAt) }}</p>
          </div>
        </div>

        <div class="request-card__body">
          <div class="info-block">
            <h3 class="info-block__title">Описание проблемы</h3>
            <p class="info-block__text">{{ request.description }}</p>
          </div>

          <div v-if="request.rejectionReason" class="info-block info-block--danger">
            <h3 class="info-block__title">Причина отклонения</h3>
            <p class="info-block__text">{{ request.rejectionReason }}</p>
          </div>

          <div class="info-grid">
            <div class="info-item">
              <span class="info-label">Оборудование</span>
              <router-link :to="`/assets/${request.asset.id}`" class="info-link">
                {{ request.asset.name }} ({{ request.asset.inventoryNumber }})
              </router-link>
            </div>
            <div class="info-item">
              <span class="info-label">Автор заявки</span>
              <router-link :to="`/users/${request.author.id}`" class="info-link">
                {{ formatFIO(request.author) }}
              </router-link>
            </div>
          </div>

          <div v-if="linkedWorkOrder" class="linked-wo">
            <div class="linked-wo__icon">
              <IconLink class="icon-sm" />
            </div>
            <div class="linked-wo__content">
              <span class="linked-wo__label">По этой заявке создан наряд:</span>
              <router-link :to="`/work-orders/${linkedWorkOrder.id}`" class="info-link">
                Наряд #{{ linkedWorkOrder.id }} ({{
                  linkedWorkOrder.technician
                    ? formatFIO(linkedWorkOrder.technician)
                    : 'Не назначен'
                }})
              </router-link>
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<style scoped>
.request-detail {
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
  font-size: 16px;
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
.actions {
  display: flex;
  gap: 12px;
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
.btn--danger-outline {
  background: #fff;
  color: #ef4444;
  border-color: #fecaca;
}
.btn--danger-outline:hover {
  background: #fef2f2;
}
.icon-sm {
  width: 16px;
  height: 16px;
}

.request-card {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  overflow: hidden;
}
.request-card__header {
  padding: 24px;
  border-bottom: 1px solid #e2e8f0;
}
.request-card__meta {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
}
.request-card__title {
  font-size: 24px;
  font-weight: 700;
  color: #1e293b;
  margin: 0 0 4px;
}
.request-card__date {
  font-size: 14px;
  color: #64748b;
  margin: 0;
}
.request-card__body {
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.info-block {
  background: #f8fafc;
  padding: 16px;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
}
.info-block--danger {
  background: #fef2f2;
  border-color: #fecaca;
}
.info-block__title {
  font-size: 14px;
  font-weight: 600;
  color: #1e293b;
  margin: 0 0 8px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}
.info-block--danger .info-block__title {
  color: #991b1b;
}
.info-block__text {
  font-size: 15px;
  color: #334155;
  margin: 0;
  line-height: 1.5;
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

.linked-wo {
  display: flex;
  gap: 16px;
  align-items: center;
  background: #eff6ff;
  padding: 16px;
  border-radius: 8px;
  border: 1px solid #bfdbfe;
}
.linked-wo__icon {
  color: #3b82f6;
  background: #dbeafe;
  padding: 8px;
  border-radius: 50%;
  display: flex;
}
.linked-wo__content {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.linked-wo__label {
  font-size: 13px;
  color: #1e40af;
}

.badge {
  display: inline-block;
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
}
.badge--priority-low {
  background: #f1f5f9;
  color: #64748b;
}
.badge--priority-normal {
  background: #dbeafe;
  color: #1e40af;
}
.badge--priority-high {
  background: #fef3c7;
  color: #92400e;
}
.badge--priority-critical {
  background: #fee2e2;
  color: #991b1b;
}

.badge--status-new {
  background: #dbeafe;
  color: #1e40af;
}
.badge--status-accepted {
  background: #e0e7ff;
  color: #3730a3;
}
.badge--status-in_progress {
  background: #fef3c7;
  color: #92400e;
}
.badge--status-closed {
  background: #d1fae5;
  color: #065f46;
}
.badge--status-rejected {
  background: #fee2e2;
  color: #991b1b;
}
.badge--status-cancelled {
  background: #f1f5f9;
  color: #64748b;
}
</style>
