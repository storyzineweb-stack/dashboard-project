<script setup lang="ts">
import { ref } from 'vue'
import DataTable from '@/components/DataTable.vue'
import Modal from '@/components/Modal.vue'
import LoadingSpinner from '@/components/LoadingSpinner.vue'
import FormExample from '@/components/FormExample.vue'
import ThemeToggle from '@/components/ThemeToggle.vue'
import { useNotificationStore } from '@/stores/notification'

const notificationStore = useNotificationStore()

// 모달 상태
const showModal = ref(false)

// 데이터 테이블 예제 데이터
const tableColumns = [
  { key: 'id', label: 'ID', sortable: true },
  { key: 'name', label: '이름', sortable: true },
  { key: 'email', label: '이메일', sortable: true },
  { key: 'role', label: '역할', sortable: true },
  { key: 'status', label: '상태', sortable: true }
]

const tableData = [
  { id: 1, name: '홍길동', email: 'hong@example.com', role: '관리자', status: '활성' },
  { id: 2, name: '김철수', email: 'kim@example.com', role: '사용자', status: '활성' },
  { id: 3, name: '이영희', email: 'lee@example.com', role: '사용자', status: '비활성' },
  { id: 4, name: '박민수', email: 'park@example.com', role: '편집자', status: '활성' },
  { id: 5, name: '정수진', email: 'jung@example.com', role: '사용자', status: '활성' },
  { id: 6, name: '최동욱', email: 'choi@example.com', role: '관리자', status: '활성' },
  { id: 7, name: '강서연', email: 'kang@example.com', role: '사용자', status: '비활성' },
  { id: 8, name: '윤지호', email: 'yoon@example.com', role: '편집자', status: '활성' },
  { id: 9, name: '임하늘', email: 'lim@example.com', role: '사용자', status: '활성' },
  { id: 10, name: '송민아', email: 'song@example.com', role: '사용자', status: '활성' },
  { id: 11, name: '한지우', email: 'han@example.com', role: '편집자', status: '활성' },
  { id: 12, name: '오승환', email: 'oh@example.com', role: '사용자', status: '비활성' }
]

function showSuccessNotification() {
  notificationStore.success('성공적으로 완료되었습니다!')
}

function showErrorNotification() {
  notificationStore.error('오류가 발생했습니다.')
}

function showWarningNotification() {
  notificationStore.warning('주의가 필요합니다.')
}

function showInfoNotification() {
  notificationStore.info('정보 알림입니다.')
}
</script>

<template>
  <div class="components-view">
    <div class="page-header">
      <div>
        <h1>컴포넌트 예제</h1>
        <p class="subtitle">재사용 가능한 UI 컴포넌트 모음</p>
      </div>
      <ThemeToggle />
    </div>

    <!-- 알림 시스템 -->
    <section class="component-section">
      <h2>📢 알림 시스템</h2>
      <p class="section-description">토스트 알림으로 사용자에게 피드백을 제공합니다</p>
      <div class="button-group">
        <button @click="showSuccessNotification" class="btn btn-success">
          성공 알림
        </button>
        <button @click="showErrorNotification" class="btn btn-error">
          에러 알림
        </button>
        <button @click="showWarningNotification" class="btn btn-warning">
          경고 알림
        </button>
        <button @click="showInfoNotification" class="btn btn-info">
          정보 알림
        </button>
      </div>
    </section>

    <!-- 모달 -->
    <section class="component-section">
      <h2>🪟 모달 다이얼로그</h2>
      <p class="section-description">중요한 정보나 폼을 표시하는 모달입니다</p>
      <button @click="showModal = true" class="btn btn-primary">
        모달 열기
      </button>

      <Modal v-model="showModal" title="모달 제목" size="medium">
        <p>이것은 모달 다이얼로그 예제입니다.</p>
        <p>ESC 키를 누르거나 배경을 클릭하여 닫을 수 있습니다.</p>

        <template #footer>
          <button @click="showModal = false" class="btn btn-secondary">
            취소
          </button>
          <button @click="showModal = false" class="btn btn-primary">
            확인
          </button>
        </template>
      </Modal>
    </section>

    <!-- 로딩 스피너 -->
    <section class="component-section">
      <h2>⏳ 로딩 스피너</h2>
      <p class="section-description">비동기 작업 중 로딩 상태를 표시합니다</p>
      <div class="spinner-examples">
        <div class="spinner-item">
          <LoadingSpinner size="small" />
          <span>Small</span>
        </div>
        <div class="spinner-item">
          <LoadingSpinner size="medium" />
          <span>Medium</span>
        </div>
        <div class="spinner-item">
          <LoadingSpinner size="large" />
          <span>Large</span>
        </div>
      </div>
    </section>

    <!-- 데이터 테이블 -->
    <section class="component-section">
      <h2>📊 데이터 테이블</h2>
      <p class="section-description">정렬, 검색, 페이지네이션 기능이 있는 테이블입니다</p>
      <DataTable :columns="tableColumns" :data="tableData" :items-per-page="5" />
    </section>

    <!-- 폼 검증 -->
    <section class="component-section">
      <h2>📝 폼 검증</h2>
      <p class="section-description">실시간 유효성 검사가 포함된 폼입니다</p>
      <FormExample />
    </section>
  </div>
</template>

<style scoped>
.components-view {
  padding: 2rem;
  max-width: 1400px;
  margin: 0 auto;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 3rem;
  gap: 2rem;
}

.page-header h1 {
  font-size: 2.5rem;
  font-weight: 700;
  color: var(--color-heading);
  margin-bottom: 0.5rem;
}

.subtitle {
  color: var(--color-text);
  opacity: 0.7;
  font-size: 1.1rem;
}

.component-section {
  background: var(--color-background-soft);
  padding: 2rem;
  border-radius: 12px;
  margin-bottom: 2rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.component-section h2 {
  font-size: 1.5rem;
  margin-bottom: 0.5rem;
  color: var(--color-heading);
}

.section-description {
  color: var(--color-text);
  opacity: 0.7;
  margin-bottom: 1.5rem;
}

.button-group {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.btn {
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.95rem;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
}

.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.btn-success {
  background: #22c55e;
  color: white;
}

.btn-error {
  background: #ef4444;
  color: white;
}

.btn-warning {
  background: #f59e0b;
  color: white;
}

.btn-info {
  background: #3b82f6;
  color: white;
}

.btn-secondary {
  background: var(--color-background);
  color: var(--color-text);
  border: 2px solid var(--color-border);
}

.btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.spinner-examples {
  display: flex;
  gap: 3rem;
  align-items: center;
}

.spinner-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.spinner-item span {
  color: var(--color-text);
  font-weight: 500;
}

@media (max-width: 768px) {
  .components-view {
    padding: 1rem;
  }

  .page-header {
    flex-direction: column;
  }

  .page-header h1 {
    font-size: 2rem;
  }

  .button-group {
    flex-direction: column;
  }

  .btn {
    width: 100%;
  }
}
</style>
