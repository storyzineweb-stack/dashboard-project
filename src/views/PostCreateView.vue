<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import LoadingSpinner from '@/components/LoadingSpinner.vue'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const title = ref('')
const content = ref('')
const imageUrl = ref('')
const category = ref<'photogallery' | 'notice' | 'news' | 'free'>('free')
const loading = ref(false)
const error = ref<string | null>(null)

const isAdmin = computed(() => authStore.isAdmin)
const canSelectCategory = computed(() => isAdmin.value)

const categoryOptions = [
  { value: 'photogallery', label: '포토갤러리' },
  { value: 'notice', label: '공지사항' },
  { value: 'news', label: '뉴스' },
  { value: 'free', label: '자유게시판' }
]

const normalizeCategory = (value: unknown) => {
  if (value === 'photogallery' || value === 'notice' || value === 'news' || value === 'free') {
    return value
  }
  return 'free'
}

onMounted(() => {
  if (!isAdmin.value) return
  const preselect = normalizeCategory(route.query.category)
  category.value = preselect
})

const submitPost = async () => {
  if (!title.value.trim()) {
    error.value = 'Title is required.'
    return
  }

  if (!isAdmin.value && category.value !== 'free') {
    error.value = '공지/뉴스/포토갤러리는 관리자만 등록할 수 있습니다.'
    return
  }

  loading.value = true
  error.value = null

  const { data, error: insertError } = await supabase
    .from('posts')
    .insert({
      title: title.value.trim(),
      content: content.value.trim(),
      image_url: imageUrl.value.trim() || null,
      category: category.value
    })
    .select('id')
    .single()

  if (insertError) {
    error.value = insertError.message
    loading.value = false
    return
  }

  loading.value = false
  router.push(`/posts/${data.id}`)
}
</script>

<template>
  <section class="page">
    <header>
      <h1>New Post</h1>
      <p class="subtitle">Share an update with the community.</p>
    </header>

    <form class="form-card" @submit.prevent="submitPost">
      <label class="field">
        <span>Title</span>
        <input v-model="title" type="text" placeholder="Write a clear title" />
      </label>

      <label class="field">
        <span>Category</span>
        <select v-model="category" :disabled="!canSelectCategory">
          <option v-for="option in categoryOptions" :key="option.value" :value="option.value">
            {{ option.label }}
          </option>
        </select>
        <small v-if="!canSelectCategory" class="helper">
          자유게시판은 로그인 없이 작성 가능합니다. 공지/뉴스/포토갤러리는 관리자만 작성할 수
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
        <button type="button" class="ghost-button" @click="router.push('/posts')">Cancel</button>
        <button type="submit" class="primary-button" :disabled="loading">
          <span v-if="!loading">Publish</span>
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
