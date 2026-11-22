<script setup>
defineProps({
  title: { type: String, required: true },
  message: { type: String, default: '' },
});
</script>

<template>
  <div class="empty-state" role="status">
    <p class="empty-title">{{ title }}</p>
    <p v-if="message" class="muted">{{ message }}</p>
    <slot />
  </div>
</template>
