<script setup lang="ts">
import { ref } from 'vue'
import LoadingSpinner from '@/components/LoadingSpinner.vue'
import { supabase } from '@/lib/supabase'
import { useNotificationStore } from '@/stores/notification'

const notificationStore = useNotificationStore()

const name = ref('')
const email = ref('')
const phone = ref('')
const company = ref('')
const budget = ref('')
const message = ref('')
const loading = ref(false)
const error = ref<string | null>(null)

const submitInquiry = async () => {
  error.value = null

  if (!name.value.trim() || !email.value.trim() || !message.value.trim()) {
    error.value = '이름, 이메일, 문의 내용은 필수입니다.'
    return
  }

  loading.value = true

  const { error: insertError } = await supabase.from('inquiries').insert({
    name: name.value.trim(),
    email: email.value.trim(),
    phone: phone.value.trim() || null,
    company: company.value.trim() || null,
    budget: budget.value || null,
    message: message.value.trim()
  })

  if (insertError) {
    error.value = insertError.message
    notificationStore.error('문의 등록에 실패했습니다.')
    loading.value = false
    return
  }

  notificationStore.success('문의가 접수되었습니다. 곧 연락드릴게요.')
  name.value = ''
  email.value = ''
  phone.value = ''
  company.value = ''
  budget.value = ''
  message.value = ''
  loading.value = false
}
</script>

<template>
  <section class="page">
    <header class="page-header">
      <h1>고객 문의 / 견적 요청</h1>
      <p class="subtitle">프로젝트 개요를 알려주시면 담당자가 빠르게 답변드립니다.</p>
    </header>

    <form class="form-card" @submit.prevent="submitInquiry">
      <div class="form-row">
        <label class="field">
          <span>이름 *</span>
          <input v-model="name" type="text" placeholder="홍길동" />
        </label>
        <label class="field">
          <span>이메일 *</span>
          <input v-model="email" type="email" placeholder="name@company.com" />
        </label>
      </div>

      <div class="form-row">
        <label class="field">
          <span>연락처</span>
          <input v-model="phone" type="tel" placeholder="010-0000-0000" />
        </label>
        <label class="field">
          <span>회사명</span>
          <input v-model="company" type="text" placeholder="Acme" />
        </label>
      </div>

      <label class="field">
        <span>예산 범위</span>
        <select v-model="budget">
          <option value="">선택 안 함</option>
          <option value="~500만">~500만</option>
          <option value="500만~1000만">500만~1000만</option>
          <option value="1000만~3000만">1000만~3000만</option>
          <option value="3000만+">3000만+</option>
        </select>
      </label>

      <label class="field">
        <span>문의 내용 *</span>
        <textarea v-model="message" rows="7" placeholder="프로젝트 내용을 입력해 주세요"></textarea>
      </label>

      <p v-if="error" class="error">{{ error }}</p>

      <div class="actions">
        <button type="submit" class="primary-button" :disabled="loading">
          <span v-if="!loading">문의 보내기</span>
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

.page-header h1 {
  font-size: 2rem;
  color: var(--color-heading);
  margin-bottom: 0.35rem;
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

input,
select,
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

.actions {
  display: flex;
  justify-content: flex-end;
}

.primary-button {
  padding: 0.65rem 1.5rem;
  border-radius: 999px;
  border: none;
  background: #667eea;
  color: white;
  font-size: 0.95rem;
  cursor: pointer;
}

.primary-button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.error {
  color: #ef4444;
  font-weight: 500;
}
</style>
