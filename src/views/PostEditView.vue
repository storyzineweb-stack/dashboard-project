<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import LoadingSpinner from '@/components/LoadingSpinner.vue'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/stores/auth'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const postId = route.params.id as string

const title = ref('')
const content = ref('')
const imageUrl = ref('')
const category = ref<'photogallery' | 'notice' | 'news' | 'free'>('free')
const loading = ref(false)
const error = ref<string | null>(null)
const loadingPost = ref(false)

const isAdmin = computed(() => authStore.isAdmin)
const canEdit = computed(() => isAdmin.value || category.value === 'free')

const categoryOptions = [
  { value: 'photogallery', label: '포토갤러리' },
  { value: 'notice', label: '공지사항' },
  { value: 'news', label: '뉴스' },
  { value: 'free', label: '자유게시판' }
]

const loadPost = async () => {
  loadingPost.value = true
  error.value = null

  const { data, error: fetchError } = await supabase
    .from('posts')
    .select('title,content,image_url,category')
    .eq('id', postId)
    .single()

  if (fetchError) {
    error.value = fetchError.message
  } else if (data) {
    title.value = data.title ?? ''
    content.value = data.content ?? ''
    imageUrl.value = data.image_url ?? ''
    category.value = (data.category ?? 'free') as typeof category.value
  }

  loadingPost.value = false
}

const submitEdit = async () => {
  if (!title.value.trim()) {
    error.value = 'Title is required.'
    return
  }

  if (!canEdit.value) {
    error.value = '공지/뉴스/포토갤러리는 관리자만 수정할 수 있습니다.'
    return
  }

  loading.value = true
  error.value = null

  const { error: updateError } = await supabase
    .from('posts')
    .update({
      title: title.value.trim(),
      content: content.value.trim(),
      image_url: imageUrl.value.trim() || null,
      category: isAdmin.value ? category.value : 'free'
    })
    .eq('id', postId)

  if (updateError) {
    error.value = updateError.message
    loading.value = false
    return
  }

  loading.value = false
  router.push(`/posts/${postId}`)
}

onMounted(loadPost)
</script>

<template>
  <section class="page">
    <header>
      <h1>글 수정</h1>
      <p class="subtitle">내용을 수정한 뒤 저장하세요.</p>
    </header>

    <div v-if="loadingPost" class="content-card">
      <LoadingSpinner size="small" text="Loading post..." />
    </div>

    <form v-else class="form-card" @submit.prevent="submitEdit">
      <label class="field">
        <span>Title</span>
        <input v-model="title" type="text" placeholder="Write a clear title" />
      </label>

      <label class="field">
        <span>Category</span>
        <select v-model="category" :disabled="!isAdmin">
          <option v-for="option in categoryOptions" :key="option.value" :value="option.value">
            {{ option.label }}
          </option>
        </select>
        <small v-if="!isAdmin" class="helper">
          자유게시판은 로그인 없이 수정 가능합니다. 공지/뉴스/포토갤러리는 관리자만 수정할 수
          있어요.
        </small>
      </label>

      <label class="field">
        <span>대표 이미지 URL</span>
        <input v-model="imageUrl" type="url" placeholder="https://example.com/image.jpg" />
      </label>

      <label class="field">
        <span>Content</span>
        <textarea v-model="content" rows="8" placeholder="Write the post content"></textarea>
      </label>

      <p v-if="error" class="error">{{ error }}</p>

      <div class="actions">
        <button type="button" class="ghost-button" @click="router.back()">Cancel</button>
        <button type="submit" class="primary-button" :disabled="loading || !canEdit">
          <span v-if="!loading">Save</span>
          <LoadingSpinner v-else size="small" />
        </button>
      </div>
    </form>
  </section>
</template>

<style scoped>
.page {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.subtitle {
  opacity: 0.7;
}

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
  background: var(--color-background-soft);
  padding: 1.5rem;
  border-radius: 16px;
  border: 1px solid var(--color-border);
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

.primary-button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.ghost-button {
  border-color: var(--color-border);
}

.error {
  color: #ef4444;
  font-weight: 500;
}

.helper {
  font-size: 0.85rem;
  opacity: 0.7;
  font-weight: 400;
}
</style>
