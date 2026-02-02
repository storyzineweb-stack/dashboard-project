<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import LoadingSpinner from '@/components/LoadingSpinner.vue'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/stores/auth'

const props = defineProps<{ id: string }>()
const router = useRouter()
const authStore = useAuthStore()

type Post = {
  id: string
  title: string
  content: string | null
  image_url: string | null
  category: string
  created_at: string
}

const post = ref<Post | null>(null)
const loading = ref(false)
const error = ref<string | null>(null)

const formatDate = (value: string) => new Date(value).toLocaleString()

const canManage = computed(() => {
  if (!post.value) return false
  return authStore.isAdmin || post.value.category === 'free'
})

const resolveListPath = () => {
  if (!post.value) return '/posts'
  if (post.value.category === 'notice') return '/notice'
  if (post.value.category === 'news') return '/news'
  if (post.value.category === 'photogallery') return '/gallery'
  if (post.value.category === 'free') return '/free'
  return '/posts'
}

const handleDelete = async () => {
  if (!post.value) return
  if (!canManage.value) return

  const confirmed = window.confirm('정말 삭제하시겠어요?')
  if (!confirmed) return

  loading.value = true
  error.value = null

  const { error: deleteError } = await supabase.from('posts').delete().eq('id', post.value.id)

  if (deleteError) {
    error.value = deleteError.message
    loading.value = false
    return
  }

  loading.value = false
  router.push(resolveListPath())
}

const loadPost = async () => {
  if (!props.id) return

  loading.value = true
  error.value = null

  const { data, error: fetchError } = await supabase
    .from('posts')
    .select('id,title,content,image_url,category,created_at')
    .eq('id', props.id)
    .single()

  if (fetchError) {
    error.value = fetchError.message
    post.value = null
  } else {
    post.value = data
  }

  loading.value = false
}

watch(
  () => props.id,
  () => {
    void loadPost()
  },
  { immediate: true }
)
</script>

<template>
  <section class="page">
    <header class="page-header">
      <RouterLink :to="resolveListPath()" class="ghost-button">Back to posts</RouterLink>
      <div v-if="canManage" class="action-row">
        <RouterLink :to="`/posts/${props.id}/edit`" class="ghost-button">수정</RouterLink>
        <button type="button" class="ghost-button danger" @click="handleDelete">삭제</button>
      </div>
    </header>

    <div class="content-card">
      <LoadingSpinner v-if="loading" size="small" text="Loading post..." />

      <div v-else-if="error" class="error-state">
        <p>Failed to load the post: {{ error }}</p>
        <button class="ghost-button" type="button" @click="loadPost">Try again</button>
      </div>

      <article v-else-if="post" class="post-detail">
        <h1>{{ post.title }}</h1>
        <span class="category-badge">{{ post.category }}</span>
        <p class="post-meta">{{ formatDate(post.created_at) }}</p>
        <div v-if="post.image_url" class="post-image">
          <img :src="post.image_url" :alt="post.title" />
        </div>
        <p class="post-content">{{ post.content || 'No content yet.' }}</p>
      </article>

      <div v-else class="empty-state">
        <p>Post not found.</p>
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
  justify-content: flex-start;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.content-card {
  background: var(--color-background-soft);
  padding: 1.5rem;
  border-radius: 16px;
  border: 1px solid var(--color-border);
}

.post-detail h1 {
  font-size: 2rem;
  color: var(--color-heading);
  margin-bottom: 0.5rem;
}

.post-meta {
  opacity: 0.7;
  margin-bottom: 1.5rem;
}

.post-content {
  line-height: 1.7;
  white-space: pre-wrap;
}

.category-badge {
  display: inline-flex;
  align-items: center;
  padding: 0.25rem 0.75rem;
  border-radius: 999px;
  border: 1px solid var(--color-border);
  font-size: 0.8rem;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  opacity: 0.7;
  margin-bottom: 0.75rem;
}

.post-image {
  margin: 1rem 0 1.5rem;
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid var(--color-border);
  background: var(--color-background);
}

.post-image img {
  width: 100%;
  display: block;
  object-fit: cover;
  max-height: 420px;
}

.ghost-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.5rem 1rem;
  border-radius: 999px;
  border: 1px solid var(--color-border);
  text-decoration: none;
  font-size: 0.95rem;
  cursor: pointer;
  background: transparent;
  color: inherit;
}

.ghost-button.danger {
  border-color: rgba(239, 68, 68, 0.5);
  color: #ef4444;
}

.action-row {
  margin-left: auto;
  display: flex;
  gap: 0.5rem;
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
</style>
