<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import LoadingSpinner from '@/components/LoadingSpinner.vue'
import { supabase } from '@/lib/supabase'

const props = defineProps<{ id: string }>()
const router = useRouter()

type Inquiry = {
  id: string
  name: string
  email: string
  phone: string | null
  company: string | null
  budget: string | null
  message: string
  created_at: string
}

const inquiry = ref<Inquiry | null>(null)
const loading = ref(false)
const error = ref<string | null>(null)

const formatDate = (value: string) => new Date(value).toLocaleString()

const loadInquiry = async () => {
  loading.value = true
  error.value = null

  const { data, error: fetchError } = await supabase
    .from('inquiries')
    .select('id,name,email,phone,company,budget,message,created_at')
    .eq('id', props.id)
    .single()

  if (fetchError) {
    error.value = fetchError.message
    inquiry.value = null
  } else {
    inquiry.value = data
  }

  loading.value = false
}

onMounted(loadInquiry)
</script>

<template>
  <section class="page">
    <header class="page-header">
      <button class="ghost-button" type="button" @click="router.back()">목록으로</button>
      <div>
        <h1>문의 상세</h1>
        <p class="subtitle">상세 내용을 확인하세요.</p>
      </div>
    </header>

    <div class="content-card">
      <LoadingSpinner v-if="loading" size="small" text="Loading inquiry..." />

      <div v-else-if="error" class="error-state">
        <p>Failed to load inquiry: {{ error }}</p>
      </div>

      <div v-else-if="inquiry" class="detail-grid">
        <div class="detail-block">
          <p class="label">이름</p>
          <p class="value">{{ inquiry.name }}</p>
        </div>
        <div class="detail-block">
          <p class="label">이메일</p>
          <p class="value">{{ inquiry.email }}</p>
        </div>
        <div class="detail-block">
          <p class="label">연락처</p>
          <p class="value">{{ inquiry.phone || '없음' }}</p>
        </div>
        <div class="detail-block">
          <p class="label">회사</p>
          <p class="value">{{ inquiry.company || '없음' }}</p>
        </div>
        <div class="detail-block">
          <p class="label">예산</p>
          <p class="value">{{ inquiry.budget || '없음' }}</p>
        </div>
        <div class="detail-block">
          <p class="label">접수일</p>
          <p class="value">{{ formatDate(inquiry.created_at) }}</p>
        </div>
        <div class="detail-block full">
          <p class="label">문의 내용</p>
          <p class="value message">{{ inquiry.message }}</p>
        </div>
      </div>

      <div v-else class="empty-state">
        <p>문의 정보를 찾을 수 없습니다.</p>
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

.detail-grid {
  display: grid;
  gap: 1rem;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
}

.detail-block {
  background: var(--color-background);
  border-radius: 12px;
  border: 1px solid var(--color-border);
  padding: 1rem;
}

.detail-block.full {
  grid-column: 1 / -1;
}

.label {
  margin: 0 0 0.4rem;
  font-size: 0.85rem;
  opacity: 0.7;
}

.value {
  margin: 0;
  font-weight: 600;
}

.message {
  white-space: pre-wrap;
  line-height: 1.6;
  font-weight: 400;
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
</style>
