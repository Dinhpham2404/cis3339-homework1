<script setup>
import { computed, onMounted } from 'vue';
import PageHeader from '@/components/PageHeader.vue';
import AlertMessage from '@/components/AlertMessage.vue';
import { useStudentsStore } from '@/stores/students';
import { useCoursesStore } from '@/stores/courses';

const students = useStudentsStore();
const courses = useCoursesStore();

onMounted(() => {
  students.fetchStudents({ force: true });
  courses.fetchCourses({ force: true });
});

const loading = computed(() => (students.loading && !students.loaded) || (courses.loading && !courses.loaded));

const stats = computed(() => [
  { label: 'Students', value: students.count, to: '/students', action: 'Manage students' },
  { label: 'Courses', value: courses.count, to: '/courses', action: 'Manage courses' },
  { label: 'Enrollments', value: courses.totalEnrollments, to: '/enrollments', action: 'Manage enrollments' },
]);
</script>

<template>
  <PageHeader title="Student Management System" subtitle="Keep track of students, courses, and enrollments." />

  <AlertMessage v-if="students.error || courses.error" type="error" :message="students.error || courses.error" />

  <div class="stats-grid">
    <RouterLink v-for="stat in stats" :key="stat.label" :to="stat.to" class="card stat-card">
      <span class="stat-value" :aria-busy="loading">{{ loading ? '–' : stat.value }}</span>
      <span class="stat-label">{{ stat.label }}</span>
      <span class="stat-action">{{ stat.action }} →</span>
    </RouterLink>
  </div>

  <section class="card" aria-labelledby="how-title">
    <h2 id="how-title">How to use this app</h2>
    <ol class="steps">
      <li><RouterLink to="/students">Add students</RouterLink> with a name, student ID, phone, and ZIP code.</li>
      <li><RouterLink to="/courses">Add courses</RouterLink> with a course ID and name.</li>
      <li><RouterLink to="/enrollments">Enroll students</RouterLink> in courses and view each course roster.</li>
    </ol>
  </section>
</template>
