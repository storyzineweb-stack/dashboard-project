<script setup lang="ts">
import { onMounted, ref } from 'vue'
import LoadingSpinner from '@/components/LoadingSpinner.vue'
import { supabase } from '@/lib/supabase'
import { useNotificationStore } from '@/stores/notification'

type Banner = {
  id: string
  image_url: string
  title: string | null
  subtitle: string | null
  link_url: string | null
  order_index: number | null
  created_at: string
}

const notificationStore = useNotificationStore()
const banners = ref<Banner[]>([])
const loading = ref(false)
const error = ref<string | null>(null)

const imageUrl = ref('')
const title = ref('')
const subtitle = ref('')
const linkUrl = ref('')
const orderIndex = ref<number | null>(null)
const saving = ref(false)
const editingId = ref<string | null>(null)

const resetForm = () => {
  imageUrl.value = ''
  title.value = ''
  subtitle.value = ''
  linkUrl.value = ''
  orderIndex.value = null
  editingId.value = null
}

const loadBanners = async () => {
  loading.value = true
  error.value = null

  const { data, error: fetchError } = await supabase
    .from('main_banners')
    .select('id,image_url,title,subtitle,link_url,order_index,created_at')
    .order('order_index', { ascending: true })
    .order('created_at', { ascending: false })

  if (fetchError) {
    error.value = fetchError.message
    banners.value = []
  } else {
    banners.value = data ?? []
  }

  loading.value = false
}

const submitBanner = async () => {
  if (!imageUrl.value.trim()) {
    error.value = '이미지 URL은 필수입니다.'
    return
  }

  saving.value = true
  error.value = null

  const payload = {
    image_url: imageUrl.value.trim(),
    title: title.value.trim() || null,
    subtitle: subtitle.value.trim() || null,
    link_url: linkUrl.value.trim() || null,
    order_index: orderIndex.value
  }

  const { error: saveError } = editingId.value
    ? await supabase.from('main_banners').update(payload).eq('id', editingId.value)
    : await supabase.from('main_banners').insert(payload)

  if (saveError) {
    error.value = saveError.message
    notificationStore.error('배너 저장에 실패했습니다.')
    saving.value = false
    return
  }

  notificationStore.success(editingId.value ? '배너가 수정되었습니다.' : '배너가 추가되었습니다.')
  resetForm()
  saving.value = false
  loadBanners()
}

const startEdit = (banner: Banner) => {
  editingId.value = banner.id
  imageUrl.value = banner.image_url
  title.value = banner.title ?? ''
  subtitle.value = banner.subtitle ?? ''
  linkUrl.value = banner.link_url ?? ''
  orderIndex.value = banner.order_index ?? null
}

const cancelEdit = () => {
  resetForm()
}

const removeBanner = async (bannerId: string) => {
  const confirmed = window.confirm('이 배너를 삭제할까요?')
  if (!confirmed) return

  const { error: deleteError } = await supabase.from('main_banners').delete().eq('id', bannerId)
  if (deleteError) {
    notificationStore.error('배너 삭제에 실패했습니다.')
    return
  }

  if (editingId.value === bannerId) {
    resetForm()
  }
  notificationStore.success('배너가 삭제되었습니다.')
  loadBanners()
}

onMounted(loadBanners)
</script>

<template>
  <section class="page">
    <header class="page-header">
      <div>
        <h1>메인 배너 관리</h1>
        <p class="subtitle">메인 슬라이드에 표시될 배너를 추가/삭제합니다.</p>
      </div>
      <button class="ghost-button" type="button" @click="loadBanners">새로고침</button>
    </header>

    <form class="form-card" @submit.prevent="submitBanner">
      <div class="form-row">
        <label class="field">
          <span>이미지 URL *</span>
          <input v-model="imageUrl" type="url" placeholder="https://example.com/banner.jpg" />
        </label>
        <label class="field">
          <span>링크 URL</span>
          <input v-model="linkUrl" type="url" placeholder="/news/1" />
        </label>
      </div>

      <div class="form-row">
        <label class="field">
          <span>제목</span>
          <input v-model="title" type="text" placeholder="배너 제목" />
        </label>
        <label class="field">
          <span>부제목</span>
          <input v-model="subtitle" type="text" placeholder="배너 서브 텍스트" />
        </label>
      </div>

      <label class="field">
        <span>정렬 순서 (작을수록 먼저)</span>
        <input v-model.number="orderIndex" type="number" placeholder="예: 1" />
      </label>

      <p v-if="error" class="error">{{ error }}</p>

      <div class="actions">
        <button type="button" class="ghost-button" @click="cancelEdit" v-if="editingId">
          취소
        </button>
        <button type="submit" class="primary-button" :disabled="saving">
          <span v-if="!saving">{{ editingId ? '배너 수정' : '배너 추가' }}</span>
          <LoadingSpinner v-else size="small" />
        </button>
      </div>
    </form>

    <div class="content-card">
      <LoadingSpinner v-if="loading" size="small" text="Loading banners..." />

      <div v-else-if="error" class="error-state">
        <p>Failed to load banners: {{ error }}</p>
      </div>

      <div v-else-if="banners.length === 0" class="empty-state">
        <p>등록된 배너가 없습니다.</p>
      </div>

      <div v-else class="banner-list">
        <article v-for="banner in banners" :key="banner.id" class="banner-card">
          <div class="banner-image">
            <img :src="banner.image_url" :alt="banner.title || 'banner'" />
          </div>
          <div class="banner-info">
            <h2>{{ banner.title || '제목 없음' }}</h2>
            <p class="meta" v-if="banner.subtitle">{{ banner.subtitle }}</p>
            <p class="meta" v-if="banner.link_url">{{ banner.link_url }}</p>
            <p class="meta" v-if="banner.order_index !== null">순서: {{ banner.order_index }}</p>
          </div>
          <div class="row-actions">
            <button class="ghost-button" type="button" @click="startEdit(banner)">수정</button>
            <button class="ghost-button danger" type="button" @click="removeBanner(banner.id)">
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
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 1rem;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  font-weight: 600;
}

input {
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

.banner-list {
  display: grid;
  gap: 1rem;
}

.banner-card {
  display: grid;
  grid-template-columns: 240px 1fr auto;
  gap: 1rem;
  align-items: center;
  background: var(--color-background);
  border-radius: 12px;
  border: 1px solid var(--color-border);
  padding: 1rem;
}

.row-actions {
  display: flex;
  gap: 0.5rem;
  align-items: center;
  justify-content: flex-end;
}

.banner-image img {
  width: 100%;
  border-radius: 12px;
  object-fit: cover;
  aspect-ratio: 16 / 9;
}

.banner-info h2 {
  margin: 0 0 0.5rem;
}

.meta {
  margin: 0.2rem 0;
  opacity: 0.7;
  font-size: 0.9rem;
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
  .banner-card {
    grid-template-columns: 1fr;
  }
}
</style>
