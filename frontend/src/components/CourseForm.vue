<script setup>
import { reactive, ref, computed } from 'vue';
import FormField from './FormField.vue';
import { useCoursesStore } from '@/stores/courses';
import { useNotificationsStore } from '@/stores/notifications';
import { validateCourse, normalizeCourseId } from '@/utils/validators';

const courses = useCoursesStore();
const notify = useNotificationsStore();

const emptyForm = () => ({ courseId: '', name: '' });
const form = reactive(emptyForm());
const serverErrors = reactive({});
const submitted = ref(false);
const saving = ref(false);
const formError = ref('');

const errors = computed(() => {
  if (!submitted.value) return {};
  return { ...validateCourse(form), ...serverErrors };
});

function clearServerError(field) {
  delete serverErrors[field];
  formError.value = '';
}

async function onSubmit() {
  submitted.value = true;
  formError.value = '';
  Object.keys(serverErrors).forEach((k) => delete serverErrors[k]);
  if (Object.keys(validateCourse(form)).length) return;

  saving.value = true;
  try {
    const payload = { courseId: normalizeCourseId(form.courseId), name: form.name.trim() };
    const message = await courses.addCourse(payload);
    notify.success(`${message}: ${payload.courseId}`);
    Object.assign(form, emptyForm());
    submitted.value = false;
  } catch (err) {
    if (err.status === 409) serverErrors.courseId = err.message;
    else if (err.details) Object.assign(serverErrors, err.details);
    else formError.value = err.message;
  } finally {
    saving.value = false;
  }
}
</script>

<template>
  <form class="card" novalidate aria-labelledby="add-course-title" @submit.prevent="onSubmit">
    <h2 id="add-course-title">Add a Course</h2>
    <p v-if="formError" class="alert alert-error" role="alert">{{ formError }}</p>

    <FormField
      id="course-id"
      v-model="form.courseId"
      label="Course ID"
      required
      maxlength="20"
      placeholder="e.g. CIS 3339"
      hint="Saved in capital letters, e.g. cis 3339 → CIS 3339"
      :error="errors.courseId"
      @update:model-value="clearServerError('courseId')"
    />
    <FormField
      id="course-name"
      v-model="form.name"
      label="Course name"
      required
      maxlength="150"
      placeholder="e.g. Enterprise Applications Development"
      :error="errors.name"
      @update:model-value="clearServerError('name')"
    />

    <button type="submit" class="btn btn-primary" :disabled="saving">
      {{ saving ? 'Adding...' : 'Add Course' }}
    </button>
  </form>
</template>
