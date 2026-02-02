<script setup lang="ts">
import { useForm, validators } from '@/composables/useForm'
import { useNotificationStore } from '@/stores/notification'
import LoadingSpinner from './LoadingSpinner.vue'

const notificationStore = useNotificationStore()

const { formData, errors, touched, isSubmitting, validateAll, handleBlur, handleInput, reset } =
  useForm(
    {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      age: '',
      phone: ''
    },
    {
      name: [validators.required(), validators.minLength(2), validators.maxLength(50)],
      email: [validators.required(), validators.email()],
      password: [validators.required(), validators.minLength(8)],
      confirmPassword: [
        validators.required(),
        {
          validate: (value) => value === formData.password,
          message: '비밀번호가 일치하지 않습니다'
        }
      ],
      age: [
        validators.required(),
        validators.min(1, '1 이상의 나이를 입력하세요'),
        validators.max(150, '150 이하의 나이를 입력하세요')
      ],
      phone: [
        validators.required(),
        validators.pattern(/^010-\d{4}-\d{4}$/, '010-0000-0000 형식으로 입력하세요')
      ]
    }
  )

async function handleSubmit() {
  if (!validateAll()) {
    notificationStore.error('입력 정보를 확인해주세요')
    return
  }

  isSubmitting.value = true

  // 실제 API 호출 시뮬레이션
  await new Promise((resolve) => setTimeout(resolve, 1500))

  notificationStore.success('회원가입이 완료되었습니다!')
  console.log('제출된 데이터:', formData)

  isSubmitting.value = false
  reset()
}
</script>

<template>
  <div class="form-example">
    <h2>회원가입 폼 예제</h2>
    <p class="form-description">폼 검증 및 에러 처리 예제입니다</p>

    <form @submit.prevent="handleSubmit" class="form">
      <div class="form-group">
        <label for="name">이름 *</label>
        <input
          id="name"
          v-model="formData.name"
          type="text"
          @blur="handleBlur('name')"
          @input="handleInput('name')"
          :class="{ error: touched.name && errors.name }"
          placeholder="홍길동"
        />
        <span v-if="touched.name && errors.name" class="error-message">
          {{ errors.name }}
        </span>
      </div>

      <div class="form-group">
        <label for="email">이메일 *</label>
        <input
          id="email"
          v-model="formData.email"
          type="email"
          @blur="handleBlur('email')"
          @input="handleInput('email')"
          :class="{ error: touched.email && errors.email }"
          placeholder="example@email.com"
        />
        <span v-if="touched.email && errors.email" class="error-message">
          {{ errors.email }}
        </span>
      </div>

      <div class="form-row">
        <div class="form-group">
          <label for="password">비밀번호 *</label>
          <input
            id="password"
            v-model="formData.password"
            type="password"
            @blur="handleBlur('password')"
            @input="handleInput('password')"
            :class="{ error: touched.password && errors.password }"
            placeholder="8자 이상"
          />
          <span v-if="touched.password && errors.password" class="error-message">
            {{ errors.password }}
          </span>
        </div>

        <div class="form-group">
          <label for="confirmPassword">비밀번호 확인 *</label>
          <input
            id="confirmPassword"
            v-model="formData.confirmPassword"
            type="password"
            @blur="handleBlur('confirmPassword')"
            @input="handleInput('confirmPassword')"
            :class="{ error: touched.confirmPassword && errors.confirmPassword }"
            placeholder="비밀번호 재입력"
          />
          <span v-if="touched.confirmPassword && errors.confirmPassword" class="error-message">
            {{ errors.confirmPassword }}
          </span>
        </div>
      </div>

      <div class="form-row">
        <div class="form-group">
          <label for="age">나이 *</label>
          <input
            id="age"
            v-model="formData.age"
            type="number"
            @blur="handleBlur('age')"
            @input="handleInput('age')"
            :class="{ error: touched.age && errors.age }"
            placeholder="25"
          />
          <span v-if="touched.age && errors.age" class="error-message">
            {{ errors.age }}
          </span>
        </div>

        <div class="form-group">
          <label for="phone">전화번호 *</label>
          <input
            id="phone"
            v-model="formData.phone"
            type="tel"
            @blur="handleBlur('phone')"
            @input="handleInput('phone')"
            :class="{ error: touched.phone && errors.phone }"
            placeholder="010-0000-0000"
          />
          <span v-if="touched.phone && errors.phone" class="error-message">
            {{ errors.phone }}
          </span>
        </div>
      </div>

      <div class="form-actions">
        <button type="button" @click="reset" class="btn btn-secondary" :disabled="isSubmitting">
          초기화
        </button>
        <button type="submit" class="btn btn-primary" :disabled="isSubmitting">
          <LoadingSpinner v-if="isSubmitting" size="small" />
          <span v-else>회원가입</span>
        </button>
      </div>
    </form>
  </div>
</template>

<style scoped>
.form-example {
  background: var(--color-background-soft);
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  max-width: 800px;
  margin: 0 auto;
}

.form-example h2 {
  font-size: 1.5rem;
  margin-bottom: 0.5rem;
  color: var(--color-heading);
}

.form-description {
  color: var(--color-text);
  opacity: 0.7;
  margin-bottom: 2rem;
}

.form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

label {
  font-weight: 600;
  color: var(--color-heading);
  font-size: 0.95rem;
}

input {
  padding: 0.75rem 1rem;
  border: 2px solid var(--color-border);
  border-radius: 8px;
  background: var(--color-background);
  color: var(--color-text);
  font-size: 0.95rem;
  transition: all 0.2s;
}

input:focus {
  outline: none;
  border-color: #667eea;
}

input.error {
  border-color: #ef4444;
}

.error-message {
  color: #ef4444;
  font-size: 0.85rem;
  font-weight: 500;
}

.form-actions {
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
}

.btn {
  padding: 0.875rem 2rem;
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.95rem;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  flex: 1;
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.btn-secondary {
  background: var(--color-background);
  color: var(--color-text);
  border: 2px solid var(--color-border);
}

.btn-secondary:hover:not(:disabled) {
  background: var(--color-background-soft);
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

@media (max-width: 768px) {
  .form-row {
    grid-template-columns: 1fr;
  }

  .form-actions {
    flex-direction: column;
  }
}
</style>
