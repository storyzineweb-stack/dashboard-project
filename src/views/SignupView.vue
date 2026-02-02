<script setup lang="ts">
import { ref } from 'vue'
import { useRouter, RouterLink } from 'vue-router'
import LoadingSpinner from '@/components/LoadingSpinner.vue'
import { useAuthStore } from '@/stores/auth'
import { useNotificationStore } from '@/stores/notification'

const router = useRouter()
const authStore = useAuthStore()
const notificationStore = useNotificationStore()

const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const loading = ref(false)
const error = ref<string | null>(null)

const handleSignup = async () => {
  error.value = null

  if (password.value !== confirmPassword.value) {
    error.value = '비밀번호가 일치하지 않습니다.'
    return
  }

  loading.value = true
  const { error: signUpError } = await authStore.signUp(email.value.trim(), password.value)

  if (signUpError) {
    error.value = signUpError.message
    notificationStore.error('회원가입에 실패했습니다.')
    loading.value = false
    return
  }

  notificationStore.success('회원가입이 완료되었습니다. 로그인해주세요.')
  loading.value = false
  router.push('/login')
}
</script>

<template>
  <section class="auth-page">
    <div class="auth-card">
      <header>
        <h1>회원가입</h1>
        <p class="subtitle">회사 서비스 이용을 위해 계정을 생성하세요.</p>
      </header>

      <form class="auth-form" @submit.prevent="handleSignup">
        <label class="field">
          <span>이메일</span>
          <input v-model="email" type="email" placeholder="name@company.com" />
        </label>

        <label class="field">
          <span>비밀번호</span>
          <input v-model="password" type="password" placeholder="8자 이상" />
        </label>

        <label class="field">
          <span>비밀번호 확인</span>
          <input v-model="confirmPassword" type="password" placeholder="비밀번호 재입력" />
        </label>

        <p v-if="error" class="error">{{ error }}</p>

        <button type="submit" class="primary-button" :disabled="loading">
          <span v-if="!loading">회원가입</span>
          <LoadingSpinner v-else size="small" />
        </button>
      </form>

      <p class="helper">
        이미 계정이 있나요?
        <RouterLink to="/login">로그인</RouterLink>
      </p>
    </div>
  </section>
</template>

<style scoped>
.auth-page {
  display: flex;
  justify-content: center;
  padding: 2rem;
}

.auth-card {
  width: 100%;
  max-width: 420px;
  background: var(--color-background-soft);
  padding: 2rem;
  border-radius: 16px;
  border: 1px solid var(--color-border);
}

.subtitle {
  opacity: 0.7;
  margin-top: 0.5rem;
}

.auth-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-top: 1.5rem;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  font-weight: 600;
}

input {
  border: 1px solid var(--color-border);
  border-radius: 12px;
  padding: 0.75rem 1rem;
  background: var(--color-background);
  color: var(--color-text);
  font-family: inherit;
  font-size: 1rem;
}

.primary-button {
  padding: 0.65rem 1.25rem;
  border-radius: 999px;
  border: none;
  background: #667eea;
  color: white;
  font-size: 0.95rem;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.primary-button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.error {
  color: #ef4444;
  font-weight: 500;
}

.helper {
  margin-top: 1.25rem;
  font-size: 0.95rem;
  opacity: 0.8;
}
</style>
