<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'
import LoadingSpinner from '@/components/LoadingSpinner.vue'
import { supabase } from '@/lib/supabase'
import { useNotificationStore } from '@/stores/notification'
import suneditor from 'suneditor'
import plugins from 'suneditor/src/plugins'
import 'suneditor/dist/css/suneditor.min.css'

type Page = {
  id: string
  title: string
  slug: string
  content: string | null
  is_published: boolean
  created_at: string
  updated_at: string
}

const notificationStore = useNotificationStore()
const pages = ref<Page[]>([])
const loading = ref(false)
const saving = ref(false)
const error = ref<string | null>(null)

const editingId = ref<string | null>(null)
const title = ref('')
const slug = ref('')
const content = ref('')
const editorRef = ref<HTMLDivElement | null>(null)
const editorInstance = ref<ReturnType<typeof suneditor.create> | null>(null)
const isPublished = ref(true)

type UploadHandlerPayload = {
  result?: { url: string; name: string; size: number }[]
  errorMessage?: string
}

type UploadHandler = (data: UploadHandlerPayload) => void
type ImageUploadBeforeHandler = (
  files: File[] | undefined,
  info: unknown,
  core: unknown,
  uploadHandler: UploadHandler
) => boolean

const isEditing = computed(() => !!editingId.value)

const resetForm = () => {
  editingId.value = null
  title.value = ''
  slug.value = ''
  content.value = ''
  isPublished.value = true
  editorInstance.value?.setContents('')
}

const loadPages = async () => {
  loading.value = true
  error.value = null

  const { data, error: fetchError } = await supabase
    .from('cms_pages')
    .select('id,title,slug,content,is_published,created_at,updated_at')
    .order('updated_at', { ascending: false })

  if (fetchError) {
    error.value = fetchError.message
    pages.value = []
  } else {
    pages.value = data ?? []
  }

  loading.value = false
}

const savePage = async () => {
  if (!title.value.trim() || !slug.value.trim()) {
    error.value = '제목과 슬러그는 필수입니다.'
    return
  }

  saving.value = true
  error.value = null

  const payload = {
    title: title.value.trim(),
    slug: slug.value.trim(),
    content: content.value || null,
    is_published: isPublished.value,
    updated_at: new Date().toISOString()
  }

  const { error: saveError } = editingId.value
    ? await supabase.from('cms_pages').update(payload).eq('id', editingId.value)
    : await supabase.from('cms_pages').insert(payload)

  if (saveError) {
    error.value = saveError.message
    notificationStore.error('페이지 저장에 실패했습니다.')
    saving.value = false
    return
  }

  notificationStore.success(isEditing.value ? '페이지가 수정되었습니다.' : '페이지가 추가되었습니다.')
  resetForm()
  saving.value = false
  loadPages()
}

const uploadPageImage = async (file: File) => {
  const fileExt = file.name.split('.').pop() || 'png'
  const safeName = file.name.replace(/\s+/g, '-').toLowerCase()
  const fileName = `pages/${Date.now()}-${safeName}.${fileExt}`

  const { error: uploadError } = await supabase
    .storage
    .from('page-images')
    .upload(fileName, file, { upsert: true })

  if (uploadError) {
    throw uploadError
  }

  const { data } = supabase.storage.from('page-images').getPublicUrl(fileName)
  return data.publicUrl
}

const startEdit = (page: Page) => {
  editingId.value = page.id
  title.value = page.title
  slug.value = page.slug
  content.value = page.content ?? ''
  isPublished.value = page.is_published
  editorInstance.value?.setContents(content.value || '')
}

const deletePage = async (pageId: string) => {
  const confirmed = window.confirm('이 페이지를 삭제할까요?')
  if (!confirmed) return

  const { error: deleteError } = await supabase.from('cms_pages').delete().eq('id', pageId)
  if (deleteError) {
    notificationStore.error('삭제에 실패했습니다.')
    return
  }

  if (editingId.value === pageId) {
    resetForm()
  }
  notificationStore.success('페이지가 삭제되었습니다.')
  loadPages()
}

const handleImageUploadBefore: ImageUploadBeforeHandler = (files, _info, _core, uploadHandler) => {
  const safeFiles = files ?? []

  void Promise.all(safeFiles.map(uploadPageImage))
    .then((urls) => {
      const result = safeFiles
        .map((file, index) => {
          const url = urls[index]
          if (!url) return null
          return { url, name: file.name, size: file.size }
        })
        .filter((item): item is { url: string; name: string; size: number } => !!item)

      uploadHandler({ result })
    })
    .catch((err: unknown) => {
      notificationStore.error('이미지 업로드에 실패했습니다.')
      const message = err instanceof Error ? err.message : '업로드 실패'
      uploadHandler({ errorMessage: message })
    })

  return false
}

const bindImageUploadHandler = () => {
  const instance = editorInstance.value as unknown as {
    onImageUploadBefore?: ImageUploadBeforeHandler
  }
  instance.onImageUploadBefore = handleImageUploadBefore
}

onMounted(() => {
  editorInstance.value = suneditor.create(editorRef.value as HTMLElement, {
    height: '500px',
    plugins,
    imageFileInput: true,
    buttonList: [
      ['bold', 'italic', 'underline', 'strike'],
      ['formatBlock'],
      ['list', 'align'],
      ['link', 'image'],
      ['undo', 'redo']
    ]
  })

  editorInstance.value.onChange = (contents: string) => {
    content.value = contents
  }

  bindImageUploadHandler()

  loadPages()
})

onBeforeUnmount(() => {
  editorInstance.value?.destroy()
})
</script>

<template>
  <section class="page">
    <header class="page-header">
      <div>
        <h1>페이지 관리</h1>
        <p class="subtitle">내용 관리용 페이지를 생성/수정합니다.</p>
      </div>
      <button class="ghost-button" type="button" @click="loadPages">새로고침</button>
    </header>

    <form class="form-card" @submit.prevent="savePage">
      <div class="form-row">
        <label class="field">
          <span>제목 *</span>
          <input v-model="title" type="text" placeholder="회사소개" />
        </label>
        <label class="field">
          <span>슬러그 *</span>
          <input v-model="slug" type="text" placeholder="about" />
        </label>
      </div>

      <label class="field">
        <span>내용</span>
        <div class="editor-wrapper">
          <div ref="editorRef"></div>
        </div>
      </label>

      <label class="field checkbox">
        <input v-model="isPublished" type="checkbox" />
        <span>공개</span>
      </label>

      <p v-if="error" class="error">{{ error }}</p>

      <div class="actions">
        <button v-if="isEditing" type="button" class="ghost-button" @click="resetForm">
          취소
        </button>
        <button type="submit" class="primary-button" :disabled="saving">
          <span v-if="!saving">{{ isEditing ? '페이지 수정' : '페이지 추가' }}</span>
          <LoadingSpinner v-else size="small" />
        </button>
      </div>
    </form>

    <div class="content-card">
      <LoadingSpinner v-if="loading" size="small" text="Loading pages..." />

      <div v-else-if="error" class="error-state">
        <p>Failed to load pages: {{ error }}</p>
      </div>

      <div v-else-if="pages.length === 0" class="empty-state">
        <p>등록된 페이지가 없습니다.</p>
      </div>

      <div v-else class="page-list">
        <article v-for="page in pages" :key="page.id" class="page-card">
          <div>
            <h2>{{ page.title }}</h2>
            <p class="meta">/{{ page.slug }}</p>
            <p class="meta">상태: {{ page.is_published ? '공개' : '비공개' }}</p>
          </div>
          <div class="row-actions">
            <RouterLink :to="`/page/${page.slug}`" class="ghost-button" target="_blank">
              보기
            </RouterLink>
            <button class="ghost-button" type="button" @click="startEdit(page)">수정</button>
            <button class="ghost-button danger" type="button" @click="deletePage(page.id)">
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
textarea {
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


.editor-wrapper {
  border: 1px solid var(--color-border);
  border-radius: 12px;
  background: var(--color-background);
  overflow: hidden;
}

.editor-wrapper :deep(.sun-editor) {
  border: none;
}

.editor-wrapper :deep(.se-wrapper) {
  min-height: 500px;
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

.page-list {
  display: grid;
  gap: 1rem;
}

.page-card {
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
  .page-card {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
