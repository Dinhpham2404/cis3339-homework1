<script setup>
// Inline message box, e.g. for load errors or "not found" results.
defineProps({
  type: { type: String, default: 'info' }, // info | success | error | warning
  message: { type: String, required: true },
  retryLabel: { type: String, default: '' },
});
defineEmits(['retry']);
</script>

<template>
  <div class="alert" :class="`alert-${type}`" :role="type === 'error' ? 'alert' : 'status'">
    <span>{{ message }}</span>
    <button v-if="retryLabel" type="button" class="btn btn-small btn-secondary" @click="$emit('retry')">
      {{ retryLabel }}
    </button>
  </div>
</template>
