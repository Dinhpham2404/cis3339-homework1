import { ref } from 'vue';
import { defineStore } from 'pinia';

// Pop-up messages ("toasts") that any view or component can show.
export const useNotificationsStore = defineStore('notifications', () => {
  const toasts = ref([]);
  let nextId = 1;

  function dismiss(id) {
    toasts.value = toasts.value.filter((t) => t.id !== id);
  }

  function show(type, message, timeout = 4500) {
    const id = nextId++;
    // Keep at most 3 messages on screen.
    toasts.value = [...toasts.value, { id, type, message }].slice(-3);
    if (timeout) setTimeout(() => dismiss(id), timeout);
    return id;
  }

  const success = (message) => show('success', message);
  const error = (message) => show('error', message, 7000);
  const info = (message) => show('info', message);

  return { toasts, show, success, error, info, dismiss };
});
