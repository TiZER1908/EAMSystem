<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { assetService } from '@/services/assetService'
import type {
  AssetView,
  AssetHistoryView,
  AssetAttachment,
  AssetHistoryType,
} from '@/services/models'
import { formatFIO } from '@/utils/formatters'

import IconBack from '@/assets/icons/logout.svg?component'
import IconEdit from '@/assets/icons/edit.svg?component'
import IconPlus from '@/assets/icons/requests.svg?component'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore

const role = computed(() => authStore.user.role)
const canEdit = computed(() => ['ADMIN', 'MASTER'].includes(role.value))
const canCreateRequest = computed(() => true)

const assetId = computed(() => Number(route.params.id))
const activeTab = ref<'info' | 'history' | 'files'>('info')

const asset = ref<AssetView | null>(null)
const history = ref<AssetHistoryView[]>([])
const attachments = ref<AssetAttachment[]>([])
const loading = ref(true)
const error = ref<string | null>(null)

async function loadData() {
  loading.value = true
  error.value = null
  try {
    const [assetData, historyData, attachmentsData] = await Promise.all([
      assetService.getAssetById(assetId.value),
      assetService.getAssetHistory(assetId.value),
      assetService.getAssetAttachments(assetId.value),
    ])
    asset.value = assetData
    history.value = historyData
    attachments.value = attachmentsData
  } catch {
    error.value = 'Актив не найден'
  } finally {
    loading.value = false
  }
}

onMounted(loadData)
watch(assetId, loadData)

function statusLabel(status: string): string {
  const map: Record<string, string> = {
    ACTIVE: 'В работе',
    UNDER_REPAIR: 'На ремонте',
    INACTIVE: 'Неактивен',
    DECOMMISSIONED: 'Списано',
  }
  return map[status] ?? status
}

function historyTypeLabel(type: AssetHistoryType): string {
  const map: Record<AssetHistoryType, string> = {
    CREATED: 'Создание',
    STATUS_CHANGED: 'Смена статуса',
    REPAIR: 'Ремонт',
    MOVED: 'Перемещение',
    COMMENT: 'Комментарий',
  }
  return map[type]
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' Б'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' КБ'
  return (bytes / (1024 * 1024)).toFixed(1) + ' МБ'
}

function goToRequestCreate() {
  router.push({ path: '/requests/new', query: { assetId: assetId.value } })
}
</script>

<template>
  <div class="asset-detail">
    <div v-if="loading" class="loading">Загрузка...</div>
    <div v-else-if="error" class="error">{{ error }}</div>

    <template v-else-if="asset">
      <div class="page-header">
        <button class="btn-back" @click="router.back()">
          <IconBack class="icon-sm" />
          Назад
        </button>
        <div class="actions">
          <button v-if="canCreateRequest" class="btn btn--primary" @click="goToRequestCreate">
            <IconPlus class="icon-sm" />
            Подать заявку
          </button>
          <router-link v-if="canEdit" :to="`/assets/${asset.id}/edit`" class="btn btn--outline">
            <IconEdit class="icon-sm" />
            Редактировать
          </router-link>
        </div>
      </div>

      <div class="asset-card">
        <div class="asset-card__header">
          <div>
            <h1 class="asset-card__title">{{ asset.name }}</h1>
            <div class="asset-card__meta">
              <span class="badge badge--status" :class="`badge--${asset.status.toLowerCase()}`">
                {{ statusLabel(asset.status) }}
              </span>
              <span class="asset-card__inv">{{ asset.inventoryNumber }}</span>
            </div>
          </div>
        </div>

        <div class="tabs">
          <button
            class="tab"
            :class="{ 'tab--active': activeTab === 'info' }"
            @click="activeTab = 'info'"
          >
            Паспорт
          </button>
          <button
            class="tab"
            :class="{ 'tab--active': activeTab === 'history' }"
            @click="activeTab = 'history'"
          >
            История
          </button>
          <button
            class="tab"
            :class="{ 'tab--active': activeTab === 'files' }"
            @click="activeTab = 'files'"
          >
            Документы
          </button>
        </div>

        <div v-if="activeTab === 'info'" class="tab-content">
          <div class="info-grid">
            <div class="info-item">
              <span class="info-label">Тип оборудования</span>
              <span class="info-value">{{ asset.assetType.name }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Модель</span>
              <span class="info-value">{{ asset.model || '—' }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Серийный номер</span>
              <span class="info-value">{{ asset.serialNumber || '—' }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Локация</span>
              <span class="info-value">{{ asset.location.name }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Ответственный</span>
              <span class="info-value">{{
                asset.responsibleUser ? formatFIO(asset.responsibleUser) : '—'
              }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Дата ввода в эксплуатацию</span>
              <span class="info-value">{{
                asset.commissionDate
                  ? new Date(asset.commissionDate).toLocaleDateString('ru-RU')
                  : '—'
              }}</span>
            </div>
          </div>
        </div>

        <div v-else-if="activeTab === 'history'" class="tab-content">
          <div v-if="history.length === 0" class="empty-state">История пуста</div>
          <div v-else class="timeline">
            <div v-for="item in history" :key="item.id" class="timeline-item">
              <div class="timeline-date">{{ formatDate(item.createdAt) }}</div>
              <div class="timeline-content">
                <div class="timeline-header">
                  <span class="timeline-type">{{ historyTypeLabel(item.eventType) }}</span>
                  <span class="timeline-user">{{ item.user?.lastName }}</span>
                </div>
                <div class="timeline-desc">{{ item.description }}</div>
                <div v-if="item.oldValue || item.newValue" class="timeline-change">
                  <span class="old-val">{{ item.oldValue || '—' }}</span>
                  <span class="arrow">→</span>
                  <span class="new-val">{{ item.newValue || '—' }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div v-else-if="activeTab === 'files'" class="tab-content">
          <div v-if="attachments.length === 0" class="empty-state">Нет прикрепленных файлов</div>
          <div v-else class="files-list">
            <div v-for="file in attachments" :key="file.id" class="file-item">
              <div class="file-icon">📄</div>
              <div class="file-info">
                <a href="#" class="file-name" @click.prevent>{{ file.fileName }}</a>
                <span class="file-meta"
                  >{{ formatFileSize(file.fileSize) }} · {{ formatDate(file.createdAt) }}</span
                >
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<style scoped>
.asset-detail {
  display: flex;
  flex-direction: column;
  gap: 20px;
  width: 100%;
  max-width: 1000px;
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

.asset-card {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  overflow: hidden;
}

.asset-card__header {
  padding: 24px;
  border-bottom: 1px solid #e2e8f0;
}

.asset-card__title {
  font-size: 24px;
  font-weight: 700;
  color: #1e293b;
  margin: 0 0 8px;
}

.asset-card__meta {
  display: flex;
  align-items: center;
  gap: 12px;
}

.asset-card__inv {
  font-family: 'Courier New', monospace;
  color: #64748b;
  font-size: 14px;
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
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
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

.timeline {
  display: flex;
  flex-direction: column;
  gap: 20px;
}
.timeline-item {
  display: flex;
  gap: 20px;
}
.timeline-date {
  width: 140px;
  font-size: 13px;
  color: #64748b;
  flex-shrink: 0;
  padding-top: 2px;
}
.timeline-content {
  flex: 1;
  border-left: 2px solid #e2e8f0;
  padding-left: 20px;
  padding-bottom: 20px;
  position: relative;
}
.timeline-item:last-child .timeline-content {
  border-left-color: transparent;
  padding-bottom: 0;
}
.timeline-content::before {
  content: '';
  position: absolute;
  left: -6px;
  top: 4px;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #3b82f6;
  border: 2px solid #fff;
}
.timeline-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 4px;
}
.timeline-type {
  font-size: 14px;
  font-weight: 600;
  color: #1e293b;
}
.timeline-user {
  font-size: 13px;
  color: #64748b;
}
.timeline-desc {
  font-size: 14px;
  color: #334155;
  margin-bottom: 6px;
}
.timeline-change {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  background: #f8fafc;
  padding: 4px 8px;
  border-radius: 4px;
}
.old-val {
  color: #ef4444;
  text-decoration: line-through;
}
.arrow {
  color: #94a3b8;
}
.new-val {
  color: #059669;
  font-weight: 500;
}

.files-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.file-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 12px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
}
.file-icon {
  font-size: 24px;
}
.file-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.file-name {
  font-size: 14px;
  color: #3b82f6;
  font-weight: 500;
  text-decoration: none;
}
.file-name:hover {
  text-decoration: underline;
}
.file-meta {
  font-size: 12px;
  color: #94a3b8;
}

.empty-state {
  text-align: center;
  color: #94a3b8;
  font-size: 14px;
  padding: 40px 0;
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
.badge--under_repair {
  background: #fef3c7;
  color: #92400e;
}
.badge--inactive {
  background: #f1f5f9;
  color: #64748b;
}
.badge--decommissioned {
  background: #fee2e2;
  color: #991b1b;
}
</style>
