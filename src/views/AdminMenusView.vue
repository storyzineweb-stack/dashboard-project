<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import LoadingSpinner from '@/components/LoadingSpinner.vue'
import { supabase } from '@/lib/supabase'
import { useNotificationStore } from '@/stores/notification'

type Menu = {
  id: string
  label: string
  link_url: string | null
  parent_id: string | null
  order_index: number
  is_active: boolean
}

type Page = {
  id: string
  title: string
  slug: string
}

const notificationStore = useNotificationStore()
const menus = ref<Menu[]>([])
const pages = ref<Page[]>([])
const loading = ref(false)
const saving = ref(false)
const error = ref<string | null>(null)

const editingId = ref<string | null>(null)
const label = ref('')
const linkUrl = ref('')
const parentId = ref<string | null>(null)
const orderIndex = ref(0)
const isActive = ref(true)
const pageSlug = ref('')
const boardLink = ref('')

const isEditing = computed(() => !!editingId.value)

const parentOptions = computed(() => menus.value.filter((menu) => !menu.parent_id))

const resetForm = () => {
  editingId.value = null
  label.value = ''
  linkUrl.value = ''
  parentId.value = null
  orderIndex.value = 0
  isActive.value = true
  pageSlug.value = ''
  boardLink.value = ''
}

const loadMenus = async () => {
  loading.value = true
  error.value = null

  const { data, error: fetchError } = await supabase
    .from('cms_menus')
    .select('id,label,link_url,parent_id,order_index,is_active')
    .order('order_index', { ascending: true })

  if (fetchError) {
    error.value = fetchError.message
    menus.value = []
  } else {
    menus.value = data ?? []
  }

  loading.value = false
}

const loadPages = async () => {
  const { data } = await supabase
    .from('cms_pages')
    .select('id,title,slug')
    .order('title', { ascending: true })

  pages.value = data ?? []
}

const handlePageSelect = () => {
  if (!pageSlug.value) return
  linkUrl.value = `/page/${pageSlug.value}`
  boardLink.value = ''
}

const handleBoardSelect = () => {
  if (!boardLink.value) return
  linkUrl.value = boardLink.value
  pageSlug.value = ''
}

const saveMenu = async () => {
  if (!label.value.trim()) {
    error.value = '메뉴명은 필수입니다.'
    return
  }

  saving.value = true
  error.value = null

  const payload = {
    label: label.value.trim(),
    link_url: linkUrl.value.trim() || null,
    parent_id: parentId.value,
    order_index: orderIndex.value,
    is_active: isActive.value
  }

  const { error: saveError } = editingId.value
    ? await supabase.from('cms_menus').update(payload).eq('id', editingId.value)
    : await supabase.from('cms_menus').insert(payload)

  if (saveError) {
    error.value = saveError.message
    notificationStore.error('메뉴 저장에 실패했습니다.')
    saving.value = false
    return
  }

  notificationStore.success(isEditing.value ? '메뉴가 수정되었습니다.' : '메뉴가 추가되었습니다.')
  resetForm()
  saving.value = false
  loadMenus()
}

const startEdit = (menu: Menu) => {
  editingId.value = menu.id
  label.value = menu.label
  linkUrl.value = menu.link_url ?? ''
  parentId.value = menu.parent_id
  orderIndex.value = menu.order_index
  isActive.value = menu.is_active
  pageSlug.value = ''
  boardLink.value = ''
}

const deleteMenu = async (menuId: string) => {
  const confirmed = window.confirm('이 메뉴를 삭제할까요?')
  if (!confirmed) return

  const { error: deleteError } = await supabase.from('cms_menus').delete().eq('id', menuId)
  if (deleteError) {
    notificationStore.error('삭제에 실패했습니다.')
    return
  }

  if (editingId.value === menuId) {
    resetForm()
  }
  notificationStore.success('메뉴가 삭제되었습니다.')
  loadMenus()
}

onMounted(async () => {
  await Promise.all([loadMenus(), loadPages()])
})
</script>

<template>
  <section class="page">
    <header class="page-header">
      <div>
        <h1>메뉴 관리</h1>
        <p class="subtitle">1차/2차 메뉴를 구성합니다.</p>
      </div>
      <button class="ghost-button" type="button" @click="loadMenus">새로고침</button>
    </header>

    <form class="form-card" @submit.prevent="saveMenu">
      <div class="form-row">
        <label class="field">
          <span>메뉴명 *</span>
          <input v-model="label" type="text" placeholder="메뉴명" />
        </label>
        <label class="field">
          <span>상위 메뉴</span>
          <select v-model="parentId">
            <option :value="null">없음 (1차 메뉴)</option>
            <option v-for="menu in parentOptions" :key="menu.id" :value="menu.id">
              {{ menu.label }}
            </option>
          </select>
        </label>
      </div>

      <div class="form-row">
        <label class="field">
          <span>페이지 선택</span>
          <select v-model="pageSlug" @change="handlePageSelect">
            <option value="">선택 안 함</option>
            <option v-for="page in pages" :key="page.id" :value="page.slug">
              {{ page.title }}
            </option>
          </select>
        </label>
        <label class="field">
          <span>게시판 선택</span>
          <select v-model="boardLink" @change="handleBoardSelect">
            <option value="">선택 안 함</option>
            <option value="/notice">공지사항</option>
            <option value="/news">뉴스</option>
            <option value="/free">자유게시판</option>
            <option value="/gallery">포토갤러리</option>
          </select>
        </label>
        <label class="field">
          <span>링크 URL</span>
          <input v-model="linkUrl" type="text" placeholder="/page/about 또는 https://..." />
        </label>
      </div>

      <div class="form-row">
        <label class="field">
          <span>정렬 순서</span>
          <input v-model.number="orderIndex" type="number" />
        </label>
        <label class="field checkbox">
          <input v-model="isActive" type="checkbox" />
          <span>사용</span>
        </label>
      </div>

      <p v-if="error" class="error">{{ error }}</p>

      <div class="actions">
        <button v-if="isEditing" type="button" class="ghost-button" @click="resetForm">
          취소
        </button>
        <button type="submit" class="primary-button" :disabled="saving">
          <span v-if="!saving">{{ isEditing ? '메뉴 수정' : '메뉴 추가' }}</span>
          <LoadingSpinner v-else size="small" />
        </button>
      </div>
    </form>

    <div class="content-card">
      <LoadingSpinner v-if="loading" size="small" text="Loading menus..." />

      <div v-else-if="error" class="error-state">
        <p>Failed to load menus: {{ error }}</p>
      </div>

      <div v-else-if="menus.length === 0" class="empty-state">
        <p>등록된 메뉴가 없습니다.</p>
      </div>

      <div v-else class="menu-list">
        <article v-for="menu in menus" :key="menu.id" class="menu-card">
          <div>
            <h2>{{ menu.label }}</h2>
            <p class="meta">링크: {{ menu.link_url || '없음' }}</p>
            <p class="meta">상위 메뉴: {{ menu.parent_id ? '2차 메뉴' : '1차 메뉴' }}</p>
            <p class="meta">순서: {{ menu.order_index }}</p>
            <p class="meta">상태: {{ menu.is_active ? '사용' : '숨김' }}</p>
          </div>
          <div class="row-actions">
            <button class="ghost-button" type="button" @click="startEdit(menu)">수정</button>
            <button class="ghost-button danger" type="button" @click="deleteMenu(menu.id)">
              삭제
            </button>
          </div>
        </article>
      </div>
    </div>
  </section>
</template>

<style scoped>
.page {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  flex-wrap: wrap;
}

.page-header h1 {
  font-size: 2rem;
  color: var(--color-heading);
  margin-bottom: 0.35rem;
}

.subtitle {
  color: var(--color-text);
  opacity: 0.7;
}

.form-card,
.content-card {
  background: var(--color-background-soft);
  padding: 1.5rem;
  border-radius: 16px;
  border: 1px solid var(--color-border);
}

.form-card {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.form-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 1rem;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  font-weight: 600;
}

.field.checkbox {
  flex-direction: row;
  align-items: center;
  gap: 0.5rem;
  font-weight: 500;
}

input,
select {
  border: 1px solid var(--color-border);
  border-radius: 12px;
  padding: 0.75rem 1rem;
  background: var(--color-background);
  color: var(--color-text);
  font-family: inherit;
  font-size: 1rem;
}

.actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
}

.primary-button,
.ghost-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.5rem 1.25rem;
  border-radius: 999px;
  border: 1px solid transparent;
  text-decoration: none;
  font-size: 0.95rem;
  cursor: pointer;
  background: transparent;
  color: inherit;
}

.primary-button {
  background: #667eea;
  color: white;
}

.ghost-button {
  border-color: var(--color-border);
}

.ghost-button.danger {
  border-color: rgba(239, 68, 68, 0.5);
  color: #ef4444;
}

.error {
  color: #ef4444;
  font-weight: 500;
}

.menu-list {
  display: grid;
  gap: 1rem;
}

.menu-card {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  align-items: center;
  background: var(--color-background);
  border-radius: 12px;
  border: 1px solid var(--color-border);
  padding: 1rem;
}

.meta {
  margin: 0.2rem 0;
  opacity: 0.7;
  font-size: 0.9rem;
}

.row-actions {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.error-state,
.empty-state {
  text-align: center;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  align-items: center;
}

@media (max-width: 900px) {
  .menu-card {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
