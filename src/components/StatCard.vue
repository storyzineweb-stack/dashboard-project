<script setup lang="ts">
interface Props {
  title: string
  value: string | number
  change: string
  trend: 'up' | 'down'
}

defineProps<Props>()
</script>

<template>
  <div class="stat-card">
    <div class="stat-header">
      <h3>{{ title }}</h3>
      <span :class="['stat-change', trend]">
        <span class="arrow">{{ trend === 'up' ? '↑' : '↓' }}</span>
        {{ change }}
      </span>
    </div>
    <div class="stat-value">{{ value }}</div>
  </div>
</template>

<style scoped>
.stat-card {
  background: var(--color-background-soft);
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s, box-shadow 0.3s;
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
}

.stat-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.stat-header h3 {
  font-size: 0.9rem;
  font-weight: 500;
  color: var(--color-text);
  opacity: 0.8;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.stat-change {
  font-size: 0.85rem;
  font-weight: 600;
  padding: 0.25rem 0.5rem;
  border-radius: 6px;
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.stat-change.up {
  background: rgba(34, 197, 94, 0.1);
  color: #22c55e;
}

.stat-change.down {
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
}

.arrow {
  font-size: 1rem;
}

.stat-value {
  font-size: 2rem;
  font-weight: 700;
  color: var(--color-heading);
  margin-top: 0.5rem;
}
</style>
