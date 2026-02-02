<script setup lang="ts">
import { useNotificationStore } from '@/stores/notification'

const notificationStore = useNotificationStore()
</script>

<template>
  <Teleport to="body">
    <div class="notification-container">
      <TransitionGroup name="notification">
        <div
          v-for="notification in notificationStore.notifications"
          :key="notification.id"
          :class="['notification', notification.type]"
          @click="notificationStore.removeNotification(notification.id)"
        >
          <div class="notification-icon">
            <span v-if="notification.type === 'success'">✓</span>
            <span v-else-if="notification.type === 'error'">✕</span>
            <span v-else-if="notification.type === 'warning'">!</span>
            <span v-else>ℹ</span>
          </div>
          <p class="notification-message">{{ notification.message }}</p>
          <button
            @click.stop="notificationStore.removeNotification(notification.id)"
            class="notification-close"
            aria-label="닫기"
          >
            ✕
          </button>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<style scoped>
.notification-container {
  position: fixed;
  top: 1rem;
  right: 1rem;
  z-index: 2000;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  max-width: 400px;
}

.notification {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem 1.25rem;
  border-radius: 8px;
  background: var(--color-background);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  cursor: pointer;
  border-left: 4px solid;
  min-width: 300px;
}

.notification.success {
  border-left-color: #22c55e;
  background: rgba(34, 197, 94, 0.1);
}

.notification.error {
  border-left-color: #ef4444;
  background: rgba(239, 68, 68, 0.1);
}

.notification.warning {
  border-left-color: #f59e0b;
  background: rgba(245, 158, 11, 0.1);
}

.notification.info {
  border-left-color: #3b82f6;
  background: rgba(59, 130, 246, 0.1);
}

.notification-icon {
  flex-shrink: 0;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 0.9rem;
}

.notification.success .notification-icon {
  background: #22c55e;
  color: white;
}

.notification.error .notification-icon {
  background: #ef4444;
  color: white;
}

.notification.warning .notification-icon {
  background: #f59e0b;
  color: white;
}

.notification.info .notification-icon {
  background: #3b82f6;
  color: white;
}

.notification-message {
  flex: 1;
  margin: 0;
  color: var(--color-text);
  font-weight: 500;
  line-height: 1.4;
}

.notification-close {
  flex-shrink: 0;
  background: none;
  border: none;
  color: var(--color-text);
  opacity: 0.6;
  cursor: pointer;
  font-size: 1.25rem;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: all 0.2s;
}

.notification-close:hover {
  opacity: 1;
  background: rgba(0, 0, 0, 0.1);
}

/* 애니메이션 */
.notification-enter-active,
.notification-leave-active {
  transition: all 0.3s ease;
}

.notification-enter-from {
  opacity: 0;
  transform: translateX(100%);
}

.notification-leave-to {
  opacity: 0;
  transform: translateX(100%) scale(0.8);
}

.notification-move {
  transition: transform 0.3s ease;
}

@media (max-width: 768px) {
  .notification-container {
    left: 1rem;
    right: 1rem;
    max-width: none;
  }

  .notification {
    min-width: auto;
  }
}
</style>
