<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { RouterLink } from 'vue-router'
import LoadingSpinner from '@/components/LoadingSpinner.vue'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/stores/auth'

type PostSummary = {
  id: string
  title: string
  created_at: string
  category: string
}

const props = defineProps<{
  category?: 'notice' | 'news' | 'free' | 'photogallery' | 'all'
}>()

const posts = ref<PostSummary[]>([])
const loading = ref(false)
const error = ref<string | null>(null)
const activeCategory = ref<'all' | 'photogallery' | 'notice' | 'news' | 'free'>('all')
const authStore = useAuthStore()

const categoryTabs = [
  { value: 'all', label: '전체' },
  { value: 'notice', label: '공지사항' },
  { value: 'news', label: '뉴스' },
  { value: 'photogallery', label: '포토갤러리' },
  { value: 'free', label: '자유게시판' }
] as const

const formatDate = (value: string) => new Date(value).toLocaleString()

const pageTitle = computed(() => {
  const category = activeCategory.value
  if (category === 'notice') return '공지사항'
  if (category === 'news') return '뉴스'
  if (category === 'free') return '자유게시판'
  if (category === 'photogallery') return '포토갤러리'
  return 'Posts'
})

const canCreatePost = computed(() => {
  if (authStore.isAdmin) return true
  return activeCategory.value === 'free' || activeCategory.value === 'all'
})

const normalizeCategory = (value: string) => {
  if (value === 'all' || value === 'notice' || value === 'news' || value === 'photogallery' || value === 'free') {
    return value
  }
  return 'all'
}

const selectCategory = (value: string) => {
  activeCategory.value = normalizeCategory(value)
  loadPosts()
}

const loadPosts = async () => {
  loading.value = true
  error.value = null

  let query = supabase
    .from('posts')
    .select('id,title,created_at,category')
    .order('created_at', { ascending: false })

  if (activeCategory.value !== 'all') {
    query = query.eq('category', activeCategory.value)
  }

  const { data, error: fetchError } = await query

  if (fetchError) {
    error.value = fetchError.message
    posts.value = []
  } else {
    posts.value = data ?? []
  }

  loading.value = false
}

onMounted(() => {
  if (props.category && props.category !== 'all') {
    activeCategory.value = props.category
  }
  loadPosts()
})

watch(
  () => props.category,
  (nextCategory) => {
    if (nextCategory && nextCategory !== activeCategory.value) {
      activeCategory.value = nextCategory
      loadPosts()
    }
  }
)
</script>

<template>
  <section class="page">
    <header class="page-header">
      <div>
        <h1>{{ pageTitle }}</h1>
        <p class="subtitle">Latest updates from the community board.</p>
      </div>
      <RouterLink v-if="canCreatePost" to="/posts/new" class="primary-button">
        New Post
      </RouterLink>
    </header>

    <div v-if="!props.category || props.category === 'all'" class="tab-row">
      <button
        v-for="tab in categoryTabs"
        :key="tab.value"
        class="tab-button"
        :class="{ active: activeCategory === tab.value }"
        type="button"
        @click="selectCategory(tab.value)"
      >
        {{ tab.label }}
      </button>
    </div>

    <div class="content-card">
      <LoadingSpinner v-if="loading" size="small" text="Loading posts..." />

      <div v-else-if="error" class="error-state">
        <p>Failed to load posts: {{ error }}</p>
        <button class="ghost-button" type="button" @click="loadPosts">Try again</button>
      </div>

      <div v-else-if="posts.length === 0" class="empty-state">
        <p>No posts yet. Be the first to write one.</p>
      </div>

      <ul v-else class="post-list">
        <li v-for="post in posts" :key="post.id" class="post-item">
          <div>
            <RouterLink :to="`/posts/${post.id}`" class="post-title">
              {{ post.title }}
            </RouterLink>
            <div class="post-tags">
              <span class="category-pill">{{ post.category }}</span>
            </div>
            <p class="post-meta">{{ formatDate(post.created_at) }}</p>
          </div>
          <RouterLink :to="`/posts/${post.id}`" class="ghost-button">View</RouterLink>
        </li>
      </ul>
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

.tab-row {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.tab-button {
  padding: 0.4rem 0.9rem;
  border-radius: 999px;
  border: 1px solid var(--color-border);
  background: var(--color-background);
  cursor: pointer;
  font-size: 0.9rem;
}

.tab-button.active {
  background: #667eea;
  color: white;
  border-color: transparent;
}

.post-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.post-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 1rem;
  background: var(--color-background);
  border-radius: 12px;
  border: 1px solid transparent;
}

.post-item:hover {
  border-color: var(--color-border);
}

.post-title {
  font-weight: 600;
  color: var(--color-heading);
  text-decoration: none;
}

.post-meta {
  font-size: 0.9rem;
  opacity: 0.7;
}

.post-tags {
  margin-top: 0.35rem;
}

.category-pill {
  display: inline-flex;
  align-items: center;
  padding: 0.2rem 0.6rem;
  border-radius: 999px;
  border: 1px solid var(--color-border);
  font-size: 0.75rem;
  opacity: 0.7;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.primary-button,
.ghost-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.5rem 1rem;
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

.error-state,
.empty-state {
  text-align: center;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  align-items: center;
}

@media (max-width: 720px) {
  .post-item {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
