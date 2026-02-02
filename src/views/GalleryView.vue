<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'
import LoadingSpinner from '@/components/LoadingSpinner.vue'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/stores/auth'

type GalleryItem = {
  id: string
  title: string | null
  content: string | null
  image_url: string
  created_at: string
}

const items = ref<GalleryItem[]>([])
const loading = ref(false)
const error = ref<string | null>(null)
const authStore = useAuthStore()
const isAdmin = computed(() => authStore.isAdmin)

const loadGallery = async () => {
  loading.value = true
  error.value = null

  const { data, error: fetchError } = await supabase
    .from('posts')
    .select('id,title,content,image_url,created_at')
    .eq('category', 'photogallery')
    .not('image_url', 'is', null)
    .order('created_at', { ascending: false })

  if (fetchError) {
    error.value = fetchError.message
    items.value = []
  } else {
    items.value = data ?? []
  }

  loading.value = false
}

onMounted(loadGallery)
</script>

<template>
  <section class="page">
    <header class="page-header">
      <div>
        <h1>포토갤러리</h1>
        <p class="subtitle">회사 활동과 프로젝트 현장을 소개합니다.</p>
      </div>
      <div class="header-actions">
        <RouterLink
          v-if="isAdmin"
          to="/posts/new?category=photogallery"
          class="ghost-button"
        >
          갤러리 글쓰기
        </RouterLink>
        <button class="ghost-button" type="button" @click="loadGallery">새로고침</button>
      </div>
    </header>

    <div class="content-card">
      <LoadingSpinner v-if="loading" size="small" text="Loading gallery..." />

      <div v-else-if="error" class="error-state">
        <p>Failed to load gallery: {{ error }}</p>
        <button class="ghost-button" type="button" @click="loadGallery">Try again</button>
      </div>

      <div v-else-if="items.length === 0" class="empty-state">
        <p>아직 등록된 사진이 없습니다.</p>
        <p class="hint">Supabase 테이블에 이미지를 추가하면 자동 표시됩니다.</p>
      </div>

      <div v-else class="gallery-grid">
        <RouterLink
          v-for="item in items"
          :key="item.id"
          :to="`/posts/${item.id}`"
          class="gallery-card"
        >
          <div class="image-frame">
            <img :src="item.image_url" :alt="item.title || 'gallery image'" loading="lazy" />
          </div>
          <div class="card-body">
            <h2 v-if="item.title">{{ item.title }}</h2>
            <p v-if="item.content">{{ item.content }}</p>
          </div>
        </RouterLink>
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
.header-actions {
  display: flex;
  gap: 0.75rem;
  align-items: center;
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

.gallery-grid {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 1.25rem;
}

.gallery-card {
  background: var(--color-background);
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid var(--color-border);
  display: flex;
  flex-direction: column;
  text-decoration: none;
  color: inherit;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.gallery-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.12);
}

.image-frame {
  background: #e5e7eb;
  aspect-ratio: 4 / 3;
  overflow: hidden;
}

.image-frame img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.card-body {
  padding: 0.9rem 1rem 1.1rem;
  display: grid;
  gap: 0.35rem;
}

.card-body h2 {
  font-size: 1.05rem;
  margin: 0;
}

.card-body p {
  margin: 0;
  opacity: 0.75;
  font-size: 0.9rem;
  line-height: 1.5;
}

.ghost-button {
  padding: 0.5rem 1rem;
  border-radius: 999px;
  border: 1px solid var(--color-border);
  background: transparent;
  cursor: pointer;
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

.hint {
  font-size: 0.9rem;
  opacity: 0.7;
}

@media (max-width: 1200px) {
  .gallery-grid {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }
}

@media (max-width: 992px) {
  .gallery-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

@media (max-width: 768px) {
  .gallery-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 520px) {
  .gallery-grid {
    grid-template-columns: 1fr;
  }
}
</style>
