<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
//import { useAuthStore } from '@/stores/auth'
import { assetService } from '@/services/assetService'
import type { AssetView, RequestPriority } from '@/services/models'

import IconBack from '@/assets/icons/logout.svg?component'
import IconUpload from '@/assets/icons/upload.svg?component'
import IconFile from '@/assets/icons/file.svg?component'

const route = useRoute()
const router = useRouter()
//const authStore = useAuthStore

const form = ref({
  assetId: 0,
  description: '',
  priority: 'NORMAL' as RequestPriority,
})

const assets = ref<AssetView[]>([])
const loading = ref(true)
const saving = ref(false)
const error = ref<string | null>(null)

const assetSearch = ref('')
const isAssetOpen = ref(false)

const selectedAsset = computed(() => {
  return assets.value.find((a) => a.id === form.value.assetId)
})

const filteredAssets = computed(() => {
  const s = assetSearch.value.toLowerCase()
  if (!s) return assets.value
  return assets.value.filter(
    (a) => a.name.toLowerCase().includes(s) || a.inventoryNumber.toLowerCase().includes(s),
  )
})

function selectAsset(asset: AssetView) {
  form.value.assetId = asset.id
  assetSearch.value = ''
  isAssetOpen.value = false
}

onMounted(async () => {
  try {
    const result = await assetService.getAssets({ search: '', status: 'ALL', page: 1, size: 500 })
    assets.value = result.content

    if (route.query.assetId) {
      form.value.assetId = Number(route.query.assetId)
    }
  } catch {
    error.value = 'Не удалось загрузить список оборудования'
  } finally {
    loading.value = false
  }
})

async function handleSave() {
  error.value = null
  if (!form.value.assetId) {
    error.value = 'Выберите оборудование'
    return
  }
  if (!form.value.description.trim()) {
    error.value = 'Опишите проблему'
    return
  }

  saving.value = true
  try {
    await new Promise((r) => setTimeout(r, 500))
    alert('Заявка успешно создана!')
    router.push('/requests')
  } catch {
    error.value = 'Ошибка при создании заявки'
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <div class="request-create" @click="isAssetOpen = false">
    <div class="page-header">
      <button class="btn-back" @click="router.back()">
        <IconBack class="icon-sm" />
        Назад
      </button>
      <h1 class="page-title">Новая заявка</h1>
    </div>

    <div v-if="loading" class="loading">Загрузка...</div>

    <div v-else class="create-card">
      <form @submit.prevent="handleSave" class="form">
        <div class="form__field" @click.stop>
          <label class="form__label">Оборудование <span class="req">*</span></label>
          <div class="combobox">
            <input
              v-model="assetSearch"
              type="text"
              class="form__input"
              :placeholder="
                selectedAsset
                  ? `${selectedAsset.name} (${selectedAsset.inventoryNumber})`
                  : 'Начните вводить название или инв. номер...'
              "
              @focus="isAssetOpen = true"
            />
            <div v-if="isAssetOpen" class="combobox__dropdown">
              <div
                v-for="asset in filteredAssets"
                :key="asset.id"
                class="combobox__item"
                :class="{ 'combobox__item--selected': form.assetId === asset.id }"
                @click="selectAsset(asset)"
              >
                <div class="combobox__item-title">{{ asset.name }}</div>
                <div class="combobox__item-subtitle">{{ asset.inventoryNumber }}</div>
              </div>
              <div v-if="filteredAssets.length === 0" class="combobox__empty">
                Оборудование не найдено
              </div>
            </div>
          </div>
        </div>

        <div class="form__field">
          <label class="form__label">Приоритет</label>
          <select v-model="form.priority" class="form__select">
            <option value="LOW">Низкий</option>
            <option value="NORMAL">Обычный</option>
            <option value="HIGH">Высокий</option>
            <option value="CRITICAL">Критичный</option>
          </select>
        </div>

        <div class="form__field">
          <label class="form__label">Описание проблемы <span class="req">*</span></label>
          <textarea
            v-model="form.description"
            class="form__textarea"
            rows="4"
            placeholder="Опишите, что случилось с оборудованием..."
            required
          ></textarea>
        </div>

        <div class="form__field">
          <label class="form__label">Фотографии и файлы</label>
          <div class="upload-zone">
            <IconUpload class="upload-zone__icon" />
            <div class="upload-zone__text">Перетащите файлы сюда или нажмите для выбора</div>
            <div class="upload-zone__hint">Максимум 5 файлов, до 10 МБ каждый (JPG, PNG, PDF)</div>
            <input type="file" multiple class="upload-zone__input" disabled />
          </div>
          <div class="upload-files">
            <div class="upload-file">
              <IconFile class="upload-file__icon" />
              <span class="upload-file__name">photo_1.jpg</span>
              <span class="upload-file__size">2.4 МБ</span>
            </div>
          </div>
        </div>

        <div v-if="error" class="form__error">{{ error }}</div>

        <div class="form__actions">
          <button type="button" class="btn btn--outline" @click="router.back()">Отмена</button>
          <button type="submit" class="btn btn--primary" :disabled="saving">
            {{ saving ? 'Отправка...' : 'Отправить заявку' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<style scoped>
.request-create {
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
.form {
  display: flex;
  flex-direction: column;
  gap: 24px;
}
.form__field {
  display: flex;
  flex-direction: column;
  gap: 8px;
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
.form__select,
.form__textarea {
  padding: 12px 14px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 14px;
  color: #1e293b;
  background: #fff;
  font-family: inherit;
  transition: border-color 0.15s ease;
}
.form__textarea {
  resize: vertical;
  min-height: 100px;
}
.form__input:focus,
.form__select:focus,
.form__textarea:focus {
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
.combobox__item--selected {
  background: #eff6ff;
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
}
.combobox__empty {
  padding: 16px;
  text-align: center;
  color: #94a3b8;
  font-size: 14px;
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

.upload-files {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 12px;
}
.upload-file {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 14px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
}
.upload-file__icon {
  width: 18px;
  height: 18px;
  color: #64748b;
}
.upload-file__name {
  font-size: 14px;
  color: #1e293b;
  flex: 1;
}
.upload-file__size {
  font-size: 12px;
  color: #94a3b8;
}

.form__error {
  padding: 12px;
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 8px;
  color: #ef4444;
  font-size: 14px;
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
