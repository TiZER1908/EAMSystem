<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { dictionaryService } from '@/services/dictionaryService'
import type { SparePartStatus, SparePartCategory, Unit } from '@/services/models'

import IconBack from '@/assets/icons/logout.svg?component'

const router = useRouter()
const authStore = useAuthStore

const role = computed(() => authStore.user.role)
const canEdit = computed(() => ['ADMIN', 'MASTER'].includes(role.value))

const form = ref({
  name: '',
  article: '',
  categoryId: 0,
  unitId: 0,
  stockQuantity: 0,
  status: 'ACTIVE' as SparePartStatus,
})

const categories = ref<SparePartCategory[]>([])
const units = ref<Unit[]>([])

const loading = ref(true)
const saving = ref(false)
const error = ref<string | null>(null)

const categorySearch = ref('')
const unitSearch = ref('')
const isCategoryOpen = ref(false)
const isUnitOpen = ref(false)

const filteredCategories = computed(() => {
  const s = categorySearch.value.toLowerCase()
  return s ? categories.value.filter((c) => c.name.toLowerCase().includes(s)) : categories.value
})

const filteredUnits = computed(() => {
  const s = unitSearch.value.toLowerCase()
  return units.value.filter((u) => u.name.toLowerCase().includes(s))
})

const selectedCategoryName = computed(() => {
  return categories.value.find((c) => c.id === form.value.categoryId)?.name || ''
})

const selectedUnitName = computed(() => {
  return units.value.find((u) => u.id === form.value.unitId)?.name || ''
})

function selectCategory(cat: SparePartCategory) {
  form.value.categoryId = cat.id
  categorySearch.value = ''
  isCategoryOpen.value = false
}

function selectUnit(unit: Unit) {
  form.value.unitId = unit.id
  unitSearch.value = ''
  isUnitOpen.value = false
}

onMounted(async () => {
  if (!canEdit.value) {
    router.push('/spare-parts')
    return
  }

  try {
    const [catsData, unitsData] = await Promise.all([
      dictionaryService.getSparePartCategories(),
      dictionaryService.getUnits(),
    ])
    categories.value = catsData
    units.value = unitsData
  } catch {
    error.value = 'Не удалось загрузить справочники'
  } finally {
    loading.value = false
  }
})

async function handleSave() {
  error.value = null
  if (!form.value.name.trim()) {
    error.value = 'Заполните наименование'
    return
  }
  if (!form.value.categoryId || !form.value.unitId) {
    error.value = 'Выберите категорию и единицу измерения'
    return
  }

  saving.value = true
  try {
    // await api.post('/spare-parts', form.value)
    await new Promise((r) => setTimeout(r, 500))
    alert('Запчасть успешно создана')
    router.push('/spare-parts')
  } catch {
    error.value = 'Ошибка при создании'
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <div class="sp-create" @click="((isCategoryOpen = false), (isUnitOpen = false))">
    <div class="page-header">
      <button class="btn-back" @click="router.back()">
        <IconBack class="icon-sm" />
        Назад
      </button>
      <h1 class="page-title">Новая запчасть</h1>
    </div>

    <div v-if="loading" class="loading">Загрузка...</div>
    <div v-else-if="error && !form.name" class="error">{{ error }}</div>

    <div v-else class="create-card">
      <form @submit.prevent="handleSave" class="form">
        <div class="form__row">
          <div class="form__field">
            <label class="form__label">Наименование <span class="req">*</span></label>
            <input
              v-model="form.name"
              type="text"
              class="form__input"
              placeholder="Например: Подшипник 6204"
              required
            />
          </div>
          <div class="form__field">
            <label class="form__label">Артикул</label>
            <input v-model="form.article" type="text" class="form__input" placeholder="BRG-6204" />
          </div>
        </div>

        <div class="form__row">
          <div class="form__field" @click.stop>
            <label class="form__label">Категория <span class="req">*</span></label>
            <div class="combobox">
              <input
                v-model="categorySearch"
                type="text"
                class="form__input"
                :placeholder="selectedCategoryName || 'Выберите категорию'"
                @focus="isCategoryOpen = true"
              />
              <div v-if="isCategoryOpen" class="combobox__dropdown">
                <div
                  v-for="cat in filteredCategories"
                  :key="cat.id"
                  class="combobox__item"
                  :class="{ 'combobox__item--selected': form.categoryId === cat.id }"
                  @click="selectCategory(cat)"
                >
                  {{ cat.name }}
                </div>
                <div v-if="filteredCategories.length === 0" class="combobox__empty">Не найдено</div>
              </div>
            </div>
          </div>

          <div class="form__field" @click.stop>
            <label class="form__label">Единица измерения <span class="req">*</span></label>
            <div class="combobox">
              <input
                v-model="unitSearch"
                type="text"
                class="form__input"
                :placeholder="selectedUnitName || 'Выберите единицу'"
                @focus="isUnitOpen = true"
              />
              <div v-if="isUnitOpen" class="combobox__dropdown">
                <div
                  v-for="unit in filteredUnits"
                  :key="unit.id"
                  class="combobox__item"
                  :class="{ 'combobox__item--selected': form.unitId === unit.id }"
                  @click="selectUnit(unit)"
                >
                  {{ unit.name }}
                </div>
                <div v-if="filteredUnits.length === 0" class="combobox__empty">Не найдено</div>
              </div>
            </div>
          </div>
        </div>

        <div class="form__row">
          <div class="form__field">
            <label class="form__label">Начальный остаток</label>
            <input v-model.number="form.stockQuantity" type="number" min="0" class="form__input" />
          </div>
          <div class="form__field">
            <label class="form__label">Статус</label>
            <select v-model="form.status" class="form__select">
              <option value="ACTIVE">Активна</option>
              <option value="ARCHIVED">Архивирована</option>
            </select>
          </div>
        </div>

        <div v-if="error" class="form__error">{{ error }}</div>

        <div class="form__actions">
          <button type="button" class="btn btn--outline" @click="router.back()">Отмена</button>
          <button type="submit" class="btn btn--primary" :disabled="saving">
            {{ saving ? 'Создание...' : 'Создать запчасть' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<style scoped>
.sp-create {
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
