<script setup lang="ts">
import { useThemeStore } from '@/stores/theme'

const themeStore = useThemeStore()
</script>

<template>
  <button @click="themeStore.toggleTheme()" class="theme-toggle" :aria-label="themeStore.isDark ? '라이트 모드로 전환' : '다크 모드로 전환'">
    <span class="theme-icon">{{ themeStore.isDark ? '☀️' : '🌙' }}</span>
  </button>
</template>

<style scoped>
.theme-toggle {
  background: var(--color-background-soft);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  padding: 0.5rem 1rem;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.theme-toggle:hover {
  background: var(--color-background);
  transform: scale(1.05);
}

.theme-icon {
  font-size: 1.25rem;
}
</style>
