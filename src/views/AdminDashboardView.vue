<script setup lang="ts">
import { onMounted, ref } from 'vue'
import LoadingSpinner from '@/components/LoadingSpinner.vue'
import { supabase } from '@/lib/supabase'

type PostSummary = {
  id: string
  title: string
  category: string
  created_at: string
}

const loading = ref(false)
const error = ref<string | null>(null)

const newInquiryCount = ref(0)
const recentPosts = ref<PostSummary[]>([])
const bannerCount = ref(0)

const formatDate = (value: string) => new Date(value).toLocaleString()

const loadDashboard = async () => {
  loading.value = true
  error.value = null

  const oneWeekAgo = new Date()
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)

  const { count: inquiryCount, error: inquiryError } = await supabase
    .from('inquiries')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', oneWeekAgo.toISOString())

  const { data: postsData, error: postsError } = await supabase
    .from('posts')
    .select('id,title,category,created_at')
    .order('created_at', { ascending: false })
    .limit(5)

  const { count: bannersCount, error: bannersError } = await supabase
    .from('main_banners')
    .select('*', { count: 'exact', head: true })

  if (inquiryError || postsError || bannersError) {
    error.value = inquiryError?.message || postsError?.message || bannersError?.message || '로드 실패'
  } else {
    newInquiryCount.value = inquiryCount ?? 0
    recentPosts.value = postsData ?? []
    bannerCount.value = bannersCount ?? 0
  }

  loading.value = false
}

onMounted(loadDashboard)
</script>

<template>
  <section class="page">
    <header class="page-header">
      <div>
        <h1>관리자 대시보드</h1>
        <p class="subtitle">최근 활동을 빠르게 확인하세요.</p>
      </div>
      <button class="ghost-button" type="button" @click="loadDashboard">새로고침</button>
    </header>

    <div class="stats-grid">
      <RouterLink to="/admin/inquiries" class="stat-card link-card">
        <p class="stat-label">신규 문의 (7일)</p>
        <h2>{{ newInquiryCount }}</h2>
        <span class="stat-link">문의 목록 보기</span>
      </RouterLink>
      <div class="stat-card">
        <p class="stat-label">최근 게시글</p>
        <h2>{{ recentPosts.length }}</h2>
      </div>
      <RouterLink to="/admin/banners" class="stat-card link-card">
        <p class="stat-label">배너 개수</p>
        <h2>{{ bannerCount }}</h2>
        <span class="stat-link">배너 관리</span>
      </RouterLink>
    </div>

    <div class="content-card">
      <LoadingSpinner v-if="loading" size="small" text="Loading dashboard..." />

      <div v-else-if="error" class="error-state">
        <p>Failed to load: {{ error }}</p>
      </div>

      <div v-else class="recent-posts">
        <h3>최근 게시글</h3>
        <ul>
          <li v-for="post in recentPosts" :key="post.id">
            <span class="category">{{ post.category }}</span>
            <RouterLink :to="`/posts/${post.id}`" class="title link">
              {{ post.title }}
            </RouterLink>
            <span class="date">{{ formatDate(post.created_at) }}</span>
          </li>
        </ul>
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

.stats-grid {
  display: grid;
  gap: 1.5rem;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
}

.stat-card {
  background: var(--color-background-soft);
  padding: 1.5rem;
  border-radius: 16px;
  border: 1px solid var(--color-border);
}

.stat-card.link-card {
  text-decoration: none;
  color: inherit;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.stat-card.link-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.12);
}

.stat-label {
  margin: 0 0 0.5rem;
  opacity: 0.7;
}

.stat-card h2 {
  margin: 0;
  font-size: 2rem;
}

.stat-link {
  margin-top: 0.5rem;
  display: inline-block;
  font-size: 0.85rem;
  opacity: 0.7;
}

.content-card {
  background: var(--color-background-soft);
  padding: 1.5rem;
  border-radius: 16px;
  border: 1px solid var(--color-border);
}

.recent-posts ul {
  list-style: none;
  padding: 0;
  margin: 1rem 0 0;
  display: grid;
  gap: 0.75rem;
}

.recent-posts li {
  display: grid;
  grid-template-columns: 120px 1fr 180px;
  gap: 0.75rem;
  align-items: center;
  background: var(--color-background);
  padding: 0.75rem 1rem;
  border-radius: 12px;
  border: 1px solid var(--color-border);
}

.category {
  font-size: 0.8rem;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  opacity: 0.7;
}

.title {
  font-weight: 600;
}

.title.link {
  text-decoration: none;
  color: inherit;
}

.date {
  font-size: 0.85rem;
  opacity: 0.7;
  text-align: right;
}

.ghost-button {
  padding: 0.5rem 1rem;
  border-radius: 999px;
  border: 1px solid var(--color-border);
  background: transparent;
  cursor: pointer;
}

.error-state {
  text-align: center;
  padding: 1.5rem;
}

@media (max-width: 900px) {
  .recent-posts li {
    grid-template-columns: 1fr;
  }

  .date {
    text-align: left;
  }
}
</style>
