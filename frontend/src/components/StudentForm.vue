<script setup>
import { reactive, ref, computed } from 'vue';
import FormField from './FormField.vue';
import { useStudentsStore } from '@/stores/students';
import { useNotificationsStore } from '@/stores/notifications';
import { validateStudent } from '@/utils/validators';

const students = useStudentsStore();
const notify = useNotificationsStore();

const emptyForm = () => ({ name: '', studentId: '', phone: '', zip: '' });
const form = reactive(emptyForm());
const serverErrors = reactive({});
const submitted = ref(false);
const saving = ref(false);
const formError = ref('');

// Show field errors only after the first submit, then update as the user types.
const errors = computed(() => {
  if (!submitted.value) return {};
  return { ...validateStudent(form), ...serverErrors };
});

function clearServerError(field) {
  delete serverErrors[field];
  formError.value = '';
}

async function onSubmit() {
  submitted.value = true;
  formError.value = '';
  Object.keys(serverErrors).forEach((k) => delete serverErrors[k]);
  if (Object.keys(validateStudent(form)).length) return;

  saving.value = true;
  try {
    const payload = Object.fromEntries(Object.entries(form).map(([k, v]) => [k, v.trim()]));
    const message = await students.addStudent(payload);
    notify.success(`${message}: ${payload.name} (${payload.studentId})`);
    Object.assign(form, emptyForm());
    submitted.value = false;
  } catch (err) {
    if (err.status === 409) serverErrors.studentId = err.message;
    else if (err.details) Object.assign(serverErrors, err.details);
    else formError.value = err.message;
  } finally {
    saving.value = false;
  }
}
</script>

<template>
  <form class="card" novalidate aria-labelledby="add-student-title" @submit.prevent="onSubmit">
    <h2 id="add-student-title">Add a Student</h2>
    <p v-if="formError" class="alert alert-error" role="alert">{{ formError }}</p>

    <FormField
      id="student-name"
      v-model="form.name"
      label="Name"
      required
      autocomplete="name"
      maxlength="100"
      :error="errors.name"
      @update:model-value="clearServerError('name')"
    />
    <FormField
      id="student-id"
      v-model="form.studentId"
      label="Student ID"
      required
      inputmode="numeric"
      maxlength="10"
      placeholder="e.g. 1001"
      :error="errors.studentId"
      @update:model-value="clearServerError('studentId')"
    />
    <div class="field-row">
      <FormField
        id="student-phone"
        v-model="form.phone"
        label="Phone"
        type="tel"
        required
        autocomplete="tel"
        placeholder="e.g. 555-1234"
        :error="errors.phone"
        @update:model-value="clearServerError('phone')"
      />
      <FormField
        id="student-zip"
        v-model="form.zip"
        label="ZIP code"
        required
        inputmode="numeric"
        autocomplete="postal-code"
        maxlength="10"
        placeholder="e.g. 77001"
        :error="errors.zip"
        @update:model-value="clearServerError('zip')"
      />
    </div>

    <button type="submit" class="btn btn-primary" :disabled="saving">
      {{ saving ? 'Adding...' : 'Add Student' }}
    </button>
  </form>
</template>
