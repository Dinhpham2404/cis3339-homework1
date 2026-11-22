<script setup>
import { useNotificationsStore } from '@/stores/notifications';

const notifications = useNotificationsStore();
</script>

<template>
  <div class="toast-stack" aria-live="polite" aria-atomic="false">
    <TransitionGroup name="toast">
      <div
        v-for="toast in notifications.toasts"
        :key="toast.id"
        class="toast"
        :class="`toast-${toast.type}`"
        :role="toast.type === 'error' ? 'alert' : 'status'"
      >
        <span>{{ toast.message }}</span>
        <button type="button" class="toast-close" @click="notifications.dismiss(toast.id)">
          <span class="sr-only">Dismiss message</span>
          <span aria-hidden="true">✕</span>
        </button>
      </div>
    </TransitionGroup>
  </div>
</template>
