<script setup lang="ts">
interface Props {
  size?: 'small' | 'medium' | 'large'
  overlay?: boolean
  text?: string
}

withDefaults(defineProps<Props>(), {
  size: 'medium',
  overlay: false
})
</script>

<template>
  <div :class="['loading-container', { overlay }]">
    <div :class="['spinner', size]"></div>
    <p v-if="text" class="loading-text">{{ text }}</p>
  </div>
</template>

<style scoped>
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
}

.loading-container.overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  z-index: 9999;
}

.spinner {
  border-radius: 50%;
  border: 3px solid var(--color-border);
  border-top-color: #667eea;
  animation: spin 0.8s linear infinite;
}

.spinner.small {
  width: 24px;
  height: 24px;
  border-width: 2px;
}

.spinner.medium {
  width: 48px;
  height: 48px;
  border-width: 3px;
}

.spinner.large {
  width: 72px;
  height: 72px;
  border-width: 4px;
}

.loading-text {
  color: var(--color-text);
  font-weight: 500;
  margin: 0;
}

.overlay .loading-text {
  color: white;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
