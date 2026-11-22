<script setup>
import { computed } from 'vue';

// One labeled input with its error message. Use with v-model.
const props = defineProps({
  id: { type: String, required: true },
  label: { type: String, required: true },
  type: { type: String, default: 'text' },
  error: { type: String, default: '' },
  hint: { type: String, default: '' },
  placeholder: { type: String, default: '' },
  inputmode: { type: String, default: undefined },
  autocomplete: { type: String, default: 'off' },
  maxlength: { type: [Number, String], default: undefined },
  required: { type: Boolean, default: false },
});

const model = defineModel({ type: String, default: '' });

// Link the input to its hint and error text for screen readers.
const describedBy = computed(
  () => [props.hint && `${props.id}-hint`, props.error && `${props.id}-error`].filter(Boolean).join(' ') || undefined
);
</script>

<template>
  <div class="form-field" :class="{ 'has-error': error }">
    <label :for="id">
      {{ label }}
      <span v-if="required" class="required" aria-hidden="true">*</span>
    </label>
    <input
      :id="id"
      v-model="model"
      :type="type"
      :placeholder="placeholder"
      :inputmode="inputmode"
      :autocomplete="autocomplete"
      :maxlength="maxlength"
      :required="required"
      :aria-invalid="error ? 'true' : 'false'"
      :aria-describedby="describedBy"
    />
    <small v-if="hint" :id="`${id}-hint`" class="hint">{{ hint }}</small>
    <small v-if="error" :id="`${id}-error`" class="field-error">{{ error }}</small>
  </div>
</template>
