<script setup lang="ts">
import { ref, computed } from 'vue'
import StatCard from '@/components/StatCard.vue'
import ChartCard from '@/components/ChartCard.vue'

type Stat = {
  id: number
  title: string
  value: string | number
  change: string
  trend: 'up' | 'down'
}

// 통계 데이터
const stats = ref<Stat[]>([
  { id: 1, title: '총 사용자', value: 1247, change: '+12.5%', trend: 'up' },
  { id: 2, title: '월 매출', value: '₩8,450,000', change: '+8.2%', trend: 'up' },
  { id: 3, title: '신규 주문', value: 324, change: '-2.4%', trend: 'down' },
  { id: 4, title: '활성 세션', value: 892, change: '+18.7%', trend: 'up' }
])

// 차트 데이터
const chartData = ref({
  labels: ['1월', '2월', '3월', '4월', '5월', '6월'],
  datasets: [
    {
      label: '매출',
      data: [65, 78, 90, 81, 86, 95]
    },
    {
      label: '방문자',
      data: [45, 62, 58, 73, 69, 82]
    }
  ]
})

// 최근 활동
const recentActivities = ref([
  { id: 1, user: '홍길동', action: '새로운 주문 생성', time: '5분 전' },
  { id: 2, user: '김철수', action: '프로필 업데이트', time: '15분 전' },
  { id: 3, user: '이영희', action: '결제 완료', time: '23분 전' },
  { id: 4, user: '박민수', action: '리뷰 작성', time: '1시간 전' }
])
</script>

<template>
  <div class="dashboard">
    <div class="dashboard-header">
      <h1>대시보드</h1>
      <p class="subtitle">실시간 비즈니스 현황을 확인하세요</p>
    </div>

    <!-- 통계 카드 -->
    <div class="stats-grid">
      <StatCard
        v-for="stat in stats"
        :key="stat.id"
        :title="stat.title"
        :value="stat.value"
        :change="stat.change"
        :trend="stat.trend"
      />
    </div>

    <!-- 차트 및 활동 -->
    <div class="content-grid">
      <ChartCard :data="chartData" />

      <div class="activity-card">
        <h2>최근 활동</h2>
        <div class="activity-list">
          <div v-for="activity in recentActivities" :key="activity.id" class="activity-item">
            <div class="activity-avatar">{{ activity.user[0] }}</div>
            <div class="activity-details">
              <p class="activity-user">{{ activity.user }}</p>
              <p class="activity-action">{{ activity.action }}</p>
            </div>
            <span class="activity-time">{{ activity.time }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.dashboard {
  padding: 2rem;
  max-width: 1400px;
  margin: 0 auto;
}

.dashboard-header {
  margin-bottom: 2rem;
}

.dashboard-header h1 {
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

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.content-grid {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 1.5rem;
}

.activity-card {
  background: var(--color-background-soft);
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.activity-card h2 {
  font-size: 1.3rem;
  margin-bottom: 1.5rem;
  color: var(--color-heading);
}

.activity-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.activity-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: var(--color-background);
  border-radius: 8px;
  transition: transform 0.2s;
}

.activity-item:hover {
  transform: translateX(4px);
}

.activity-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  flex-shrink: 0;
}

.activity-details {
  flex: 1;
}

.activity-user {
  font-weight: 600;
  margin-bottom: 0.25rem;
  color: var(--color-heading);
}

.activity-action {
  font-size: 0.9rem;
  color: var(--color-text);
  opacity: 0.8;
}

.activity-time {
  font-size: 0.85rem;
  color: var(--color-text);
  opacity: 0.6;
  flex-shrink: 0;
}

@media (max-width: 1024px) {
  .content-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .dashboard {
    padding: 1rem;
  }

  .stats-grid {
    grid-template-columns: 1fr;
  }

  .dashboard-header h1 {
    font-size: 2rem;
  }
}
</style>
