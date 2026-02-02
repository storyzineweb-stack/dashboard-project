<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import LoadingSpinner from '@/components/LoadingSpinner.vue'
import { supabase } from '@/lib/supabase'
import { useNotificationStore } from '@/stores/notification'

type SeoSettings = {
  page_key: string
  title: string | null
  description: string | null
  og_image_url: string | null
}

const notificationStore = useNotificationStore()
const loading = ref(false)
const saving = ref(false)
const error = ref<string | null>(null)

const settingsMap = ref<Record<string, SeoSettings>>({})
const pageKey = ref('home')

const globalTitle = ref('')
const globalDescription = ref('')
const globalOgImageUrl = ref('')

const pageTitle = ref('')
const pageDescription = ref('')
const pageOgImageUrl = ref('')

const pageOptions = [
  { key: 'home', label: '홈' },
  { key: 'notice', label: '공지사항' },
  { key: 'news', label: '뉴스' },
  { key: 'free', label: '자유게시판' },
  { key: 'gallery', label: '포토갤러리' },
  { key: 'contact', label: '문의' }
]

const currentLabel = computed(() => {
  return pageOptions.find((option) => option.key === pageKey.value)?.label ?? pageKey.value
})

const loadSettings = async () => {
  loading.value = true
  error.value = null

  const { data, error: fetchError } = await supabase
    .from('seo_settings')
    .select('page_key,title,description,og_image_url')

  if (fetchError) {
    error.value = fetchError.message
  } else {
    const map: Record<string, SeoSettings> = {}
    data?.forEach((row) => {
      map[row.page_key] = row
    })
    settingsMap.value = map
    hydrateForm()
  }

  loading.value = false
}

const hydrateForm = () => {
  const global = settingsMap.value.global
  globalTitle.value = global?.title ?? ''
  globalDescription.value = global?.description ?? ''
  globalOgImageUrl.value = global?.og_image_url ?? ''

  const page = settingsMap.value[pageKey.value]
  pageTitle.value = page?.title ?? ''
  pageDescription.value = page?.description ?? ''
  pageOgImageUrl.value = page?.og_image_url ?? ''
}

const uploadOgImage = async (file: File, key: string) => {
  const fileExt = file.name.split('.').pop() || 'png'
  const fileName = `${key}-${Date.now()}.${fileExt}`
  const { error: uploadError } = await supabase
    .storage
    .from('seo-images')
    .upload(fileName, file, { upsert: true })

  if (uploadError) {
    throw uploadError
  }

  const { data } = supabase.storage.from('seo-images').getPublicUrl(fileName)
  return data.publicUrl
}

const handleGlobalUpload = async (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) return
  try {
    saving.value = true
    globalOgImageUrl.value = await uploadOgImage(file, 'global')
  } catch (err: any) {
    notificationStore.error(err?.message ?? '업로드 실패')
  } finally {
    saving.value = false
  }
}

const handlePageUpload = async (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) return
  try {
    saving.value = true
    pageOgImageUrl.value = await uploadOgImage(file, pageKey.value)
  } catch (err: any) {
    notificationStore.error(err?.message ?? '업로드 실패')
  } finally {
    saving.value = false
  }
}

const saveGlobal = async () => {
  saving.value = true
  error.value = null

  const { error: saveError } = await supabase
    .from('seo_settings')
    .upsert({
      page_key: 'global',
      title: globalTitle.value.trim() || null,
      description: globalDescription.value.trim() || null,
      og_image_url: globalOgImageUrl.value.trim() || null,
      updated_at: new Date().toISOString()
    }, { onConflict: 'page_key' })

  if (saveError) {
    error.value = saveError.message
    notificationStore.error('저장에 실패했습니다.')
  } else {
    notificationStore.success('전역 설정이 저장되었습니다.')
    loadSettings()
  }

  saving.value = false
}

const savePage = async () => {
  saving.value = true
  error.value = null

  const { error: saveError } = await supabase
    .from('seo_settings')
    .upsert({
      page_key: pageKey.value,
      title: pageTitle.value.trim() || null,
      description: pageDescription.value.trim() || null,
      og_image_url: pageOgImageUrl.value.trim() || null,
      updated_at: new Date().toISOString()
    }, { onConflict: 'page_key' })

  if (saveError) {
    error.value = saveError.message
    notificationStore.error('저장에 실패했습니다.')
  } else {
    notificationStore.success('페이지 설정이 저장되었습니다.')
    loadSettings()
  }

  saving.value = false
}

const handlePageChange = () => {
  hydrateForm()
}

onMounted(loadSettings)
</script>

<template>
  <section class="page">
    <header class="page-header">
      <div>
        <h1>SEO 설정</h1>
        <p class="subtitle">전역 기본값과 페이지별 메타를 관리합니다.</p>
      </div>
      <button class="ghost-button" type="button" @click="loadSettings">새로고침</button>
    </header>

    <div class="content-card">
      <LoadingSpinner v-if="loading" size="small" text="Loading SEO settings..." />

      <div v-else class="form-grid">
        <section class="form-card">
          <h2>전역 기본값</h2>
          <label class="field">
            <span>사이트 제목</span>
            <input v-model="globalTitle" type="text" placeholder="Acme Solutions" />
          </label>
          <label class="field">
            <span>기본 설명</span>
            <textarea v-model="globalDescription" rows="4" placeholder="사이트 기본 설명"></textarea>
          </label>
          <label class="field">
            <span>OG 이미지 URL</span>
            <input v-model="globalOgImageUrl" type="url" placeholder="https://..." />
          </label>
          <label class="field">
            <span>OG 이미지 업로드</span>
            <input type="file" accept="image/*" @change="handleGlobalUpload" />
          </label>
          <div class="actions">
            <button class="primary-button" type="button" :disabled="saving" @click="saveGlobal">
              저장
            </button>
          </div>
        </section>

        <section class="form-card">
          <h2>페이지별 메타</h2>
          <label class="field">
            <span>페이지 선택</span>
            <select v-model="pageKey" @change="handlePageChange">
              <option v-for="option in pageOptions" :key="option.key" :value="option.key">
                {{ option.label }}
              </option>
            </select>
          </label>
          <label class="field">
            <span>{{ currentLabel }} 제목</span>
            <input v-model="pageTitle" type="text" placeholder="페이지 제목" />
          </label>
          <label class="field">
            <span>{{ currentLabel }} 설명</span>
            <textarea v-model="pageDescription" rows="4" placeholder="페이지 설명"></textarea>
          </label>
          <label class="field">
            <span>{{ currentLabel }} OG 이미지 URL</span>
            <input v-model="pageOgImageUrl" type="url" placeholder="https://..." />
          </label>
          <label class="field">
            <span>{{ currentLabel }} OG 이미지 업로드</span>
            <input type="file" accept="image/*" @change="handlePageUpload" />
          </label>
          <div class="actions">
            <button class="primary-button" type="button" :disabled="saving" @click="savePage">
              저장
            </button>
          </div>
        </section>
      </div>

      <p v-if="error" class="error">{{ error }}</p>
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

.content-card {
  background: var(--color-background-soft);
  padding: 1.5rem;
  border-radius: 16px;
  border: 1px solid var(--color-border);
}

.form-grid {
  display: grid;
  gap: 1.5rem;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
}

.form-card {
  background: var(--color-background);
  padding: 1.5rem;
  border-radius: 12px;
  border: 1px solid var(--color-border);
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form-card h2 {
  margin: 0;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  font-weight: 600;
}

input,
textarea,
select {
  border: 1px solid var(--color-border);
  border-radius: 12px;
  padding: 0.75rem 1rem;
  background: var(--color-background);
  color: var(--color-text);
  font-family: inherit;
  font-size: 1rem;
}

textarea {
  resize: vertical;
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

.error {
  margin-top: 1rem;
  color: #ef4444;
  font-weight: 500;
}

@media (max-width: 720px) {
  .form-card {
    padding: 1.25rem;
  }
}
</style>
