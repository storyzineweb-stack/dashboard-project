<script setup lang="ts">
import { onMounted, ref } from 'vue'
import LoadingSpinner from '@/components/LoadingSpinner.vue'
import { supabase } from '@/lib/supabase'

const props = defineProps<{ slug: string }>()

type Page = {
  title: string
  content: string | null
}

const page = ref<Page | null>(null)
const loading = ref(false)
const error = ref<string | null>(null)

const loadPage = async () => {
  loading.value = true
  error.value = null

  const { data, error: fetchError } = await supabase
    .from('cms_pages')
    .select('title,content')
    .eq('slug', props.slug)
    .single()

  if (fetchError) {
    error.value = fetchError.message
    page.value = null
  } else {
    page.value = data
  }

  loading.value = false
}

onMounted(loadPage)
</script>

<template>
  <section class="page">
    <LoadingSpinner v-if="loading" size="small" text="Loading page..." />

    <div v-else-if="error" class="error-state">
      <p>Failed to load page: {{ error }}</p>
    </div>

    <article v-else-if="page" class="content-card">
      <h1>{{ page.title }}</h1>
      <div class="content" v-html="page.content || ''"></div>
    </article>

    <div v-else class="empty-state">
      <p>페이지를 찾을 수 없습니다.</p>
    </div>
  </section>
</template>

<style scoped>
.page {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.content-card {
  background: var(--color-background-soft);
  padding: 2rem;
  border-radius: 16px;
  border: 1px solid var(--color-border);
}

.content-card h1 {
  margin-bottom: 1rem;
  font-size: 2rem;
}

.content {
  line-height: 1.7;
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
