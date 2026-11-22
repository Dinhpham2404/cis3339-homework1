<script setup>
import { ref, watch, nextTick } from 'vue';
import { useConfirmStore } from '@/stores/confirm';

const confirm = useConfirmStore();
const dialog = ref(null);
const cancelButton = ref(null);

// Open or close the native <dialog> when the store changes.
watch(
  () => confirm.isOpen,
  async (open) => {
    if (!dialog.value) return;
    if (open && !dialog.value.open) {
      dialog.value.showModal();
      await nextTick();
      cancelButton.value?.focus(); // safer default for delete actions
    } else if (!open && dialog.value.open) {
      dialog.value.close();
    }
  }
);

// Esc key closes the dialog -> treat it as "Cancel".
function onClose() {
  if (confirm.isOpen) confirm.answer(false);
}
</script>

<template>
  <dialog
    ref="dialog"
    class="confirm-dialog"
    aria-labelledby="confirm-title"
    aria-describedby="confirm-message"
    @close="onClose"
  >
    <h2 id="confirm-title">{{ confirm.title }}</h2>
    <p id="confirm-message">{{ confirm.message }}</p>
    <div class="dialog-actions">
      <button ref="cancelButton" type="button" class="btn btn-secondary" @click="confirm.answer(false)">Cancel</button>
      <button type="button" class="btn btn-danger" @click="confirm.answer(true)">{{ confirm.confirmLabel }}</button>
    </div>
  </dialog>
</template>
