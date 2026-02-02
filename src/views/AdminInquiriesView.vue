<script setup lang="ts">
import { onMounted, ref } from 'vue'
import LoadingSpinner from '@/components/LoadingSpinner.vue'
import { supabase } from '@/lib/supabase'
import { RouterLink } from 'vue-router'

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

const inquiries = ref<Inquiry[]>([])
const loading = ref(false)
const error = ref<string | null>(null)

const formatDate = (value: string) => new Date(value).toLocaleString()

const loadInquiries = async () => {
  loading.value = true
  error.value = null

  const { data, error: fetchError } = await supabase
    .from('inquiries')
    .select('id,name,email,phone,company,budget,message,created_at')
    .order('created_at', { ascending: false })

  if (fetchError) {
    error.value = fetchError.message
    inquiries.value = []
  } else {
    inquiries.value = data ?? []
  }

  loading.value = false
}

onMounted(loadInquiries)
</script>

<template>
  <section class="page">
    <header class="page-header">
      <div>
        <h1>문의 관리</h1>
        <p class="subtitle">접수된 문의 목록을 확인하세요.</p>
      </div>
      <button class="ghost-button" type="button" @click="loadInquiries">새로고침</button>
    </header>

    <div class="content-card">
      <LoadingSpinner v-if="loading" size="small" text="Loading inquiries..." />

      <div v-else-if="error" class="error-state">
        <p>Failed to load inquiries: {{ error }}</p>
        <button class="ghost-button" type="button" @click="loadInquiries">Try again</button>
      </div>

      <div v-else-if="inquiries.length === 0" class="empty-state">
        <p>아직 접수된 문의가 없습니다.</p>
      </div>

      <div v-else class="inquiry-list">
        <RouterLink
          v-for="inquiry in inquiries"
          :key="inquiry.id"
          :to="`/admin/inquiries/${inquiry.id}`"
          class="inquiry-card"
        >
          <div class="inquiry-header">
            <div>
              <h2>{{ inquiry.name }}</h2>
              <p class="meta">{{ inquiry.email }}</p>
              <p class="meta" v-if="inquiry.company">{{ inquiry.company }}</p>
            </div>
            <div class="meta-right">
              <p class="meta">{{ formatDate(inquiry.created_at) }}</p>
              <p class="meta" v-if="inquiry.budget">예산: {{ inquiry.budget }}</p>
            </div>
          </div>
          <p class="message">{{ inquiry.message }}</p>
          <div class="contact-info">
            <span v-if="inquiry.phone">📞 {{ inquiry.phone }}</span>
            <span v-else>📞 연락처 없음</span>
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

.inquiry-list {
  display: grid;
  gap: 1rem;
}

.inquiry-card {
  padding: 1.25rem;
  border-radius: 12px;
  background: var(--color-background);
  border: 1px solid var(--color-border);
  text-decoration: none;
  color: inherit;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.inquiry-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.12);
}

.inquiry-header {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  flex-wrap: wrap;
}

.inquiry-header h2 {
  font-size: 1.2rem;
  margin: 0;
}

.meta {
  margin: 0.2rem 0;
  opacity: 0.7;
  font-size: 0.9rem;
}

.meta-right {
  text-align: right;
}

.message {
  margin-top: 0.75rem;
  line-height: 1.6;
  white-space: pre-wrap;
}

.contact-info {
  margin-top: 0.75rem;
  font-size: 0.9rem;
  opacity: 0.8;
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

@media (max-width: 720px) {
  .meta-right {
    text-align: left;
  }
}
</style>
