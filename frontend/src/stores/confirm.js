import { ref } from 'vue';
import { defineStore } from 'pinia';

// Shared "Are you sure?" dialog. Any component can call ask() and wait
// for the answer: const ok = await confirm.ask({ title, message })
export const useConfirmStore = defineStore('confirm', () => {
  const isOpen = ref(false);
  const title = ref('');
  const message = ref('');
  const confirmLabel = ref('Confirm');
  let resolver = null;

  function ask(options) {
    title.value = options.title || 'Are you sure?';
    message.value = options.message || '';
    confirmLabel.value = options.confirmLabel || 'Confirm';
    isOpen.value = true;
    return new Promise((resolve) => {
      resolver = resolve;
    });
  }

  function answer(value) {
    isOpen.value = false;
    resolver?.(value);
    resolver = null;
  }

  return { isOpen, title, message, confirmLabel, ask, answer };
});
