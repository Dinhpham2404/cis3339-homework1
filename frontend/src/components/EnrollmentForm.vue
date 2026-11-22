<script setup>
import { ref, computed, watch } from 'vue';
import { useStudentsStore } from '@/stores/students';
import { useCoursesStore } from '@/stores/courses';
import { useEnrollmentsStore } from '@/stores/enrollments';
import { useNotificationsStore } from '@/stores/notifications';

const students = useStudentsStore();
const courses = useCoursesStore();
const enrollments = useEnrollmentsStore();
const notify = useNotificationsStore();

const studentId = ref('');
const courseId = ref('');
const saving = ref(false);
const submitted = ref(false);
const formError = ref('');

const errors = computed(() => {
  if (!submitted.value) return {};
  const e = {};
  if (!studentId.value) e.student = 'Please select a student.';
  if (!courseId.value) e.course = 'Please select a course.';
  return e;
});

const canEnroll = computed(() => students.count > 0 && courses.count > 0);

// If the picked student or course gets deleted, clear the selection.
watch(
  () => students.students.map((s) => s.studentId),
  (ids) => {
    if (studentId.value && !ids.includes(studentId.value)) studentId.value = '';
  }
);
watch(
  () => courses.courses.map((c) => c.courseId),
  (ids) => {
    if (courseId.value && !ids.includes(courseId.value)) courseId.value = '';
  }
);
watch([studentId, courseId], () => {
  formError.value = '';
});

async function onSubmit() {
  submitted.value = true;
  formError.value = '';
  if (Object.keys(errors.value).length) return;

  saving.value = true;
  try {
    const message = await enrollments.enroll(studentId.value, courseId.value);
    notify.success(message);
    studentId.value = '';
    submitted.value = false;
  } catch (err) {
    formError.value = err.message;
    // A 404 means the list on screen is out of date, so reload it.
    if (err.status === 404) {
      students.fetchStudents({ force: true });
      courses.fetchCourses({ force: true });
    }
  } finally {
    saving.value = false;
  }
}
</script>

<template>
  <form class="card" novalidate aria-labelledby="enroll-title" @submit.prevent="onSubmit">
    <h2 id="enroll-title">Enroll a Student</h2>

    <p v-if="!canEnroll && !students.loading && !courses.loading" class="alert alert-warning" role="status">
      You need at least one student and one course first.
      <RouterLink v-if="students.count === 0" to="/students">Add a student</RouterLink>
      <template v-if="students.count === 0 && courses.count === 0"> · </template>
      <RouterLink v-if="courses.count === 0" to="/courses">Add a course</RouterLink>
    </p>

    <p v-if="formError" class="alert alert-error" role="alert">{{ formError }}</p>

    <div class="form-field" :class="{ 'has-error': errors.student }">
      <label for="enroll-student">Student <span class="required" aria-hidden="true">*</span></label>
      <select
        id="enroll-student"
        v-model="studentId"
        required
        :disabled="students.loading || students.count === 0"
        :aria-invalid="errors.student ? 'true' : 'false'"
        :aria-describedby="errors.student ? 'enroll-student-error' : undefined"
      >
        <option value="">{{ students.loading ? 'Loading students...' : '-- Select a student --' }}</option>
        <option v-for="s in students.sortedStudents" :key="s.id" :value="s.studentId">
          {{ s.name }} ({{ s.studentId }})
        </option>
      </select>
      <small v-if="errors.student" id="enroll-student-error" class="field-error">{{ errors.student }}</small>
    </div>

    <div class="form-field" :class="{ 'has-error': errors.course }">
      <label for="enroll-course">Course <span class="required" aria-hidden="true">*</span></label>
      <select
        id="enroll-course"
        v-model="courseId"
        required
        :disabled="courses.loading || courses.count === 0"
        :aria-invalid="errors.course ? 'true' : 'false'"
        :aria-describedby="errors.course ? 'enroll-course-error' : undefined"
      >
        <option value="">{{ courses.loading ? 'Loading courses...' : '-- Select a course --' }}</option>
        <option v-for="c in courses.sortedCourses" :key="c.id" :value="c.courseId">
          {{ c.name }} ({{ c.courseId }})
        </option>
      </select>
      <small v-if="errors.course" id="enroll-course-error" class="field-error">{{ errors.course }}</small>
    </div>

    <button type="submit" class="btn btn-primary" :disabled="saving || !canEnroll">
      {{ saving ? 'Enrolling...' : 'Enroll Student' }}
    </button>
  </form>
</template>
