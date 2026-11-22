<script setup>
import { onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import PageHeader from '@/components/PageHeader.vue';
import EnrollmentForm from '@/components/EnrollmentForm.vue';
import CourseRoster from '@/components/CourseRoster.vue';
import AlertMessage from '@/components/AlertMessage.vue';
import { useStudentsStore } from '@/stores/students';
import { useCoursesStore } from '@/stores/courses';
import { useEnrollmentsStore } from '@/stores/enrollments';

const students = useStudentsStore();
const courses = useCoursesStore();
const enrollments = useEnrollmentsStore();
const route = useRoute();
const router = useRouter();

// The drop-downs are filled from the backend, not hard-coded.
onMounted(() => {
  students.fetchStudents({ force: true });
  courses.fetchCourses({ force: true });

  // The selected roster course is kept in the URL (?course=CIS 3339),
  // so it is still selected after a page refresh or when sharing the link.
  const fromUrl = typeof route.query.course === 'string' ? route.query.course : '';
  const courseId = fromUrl || enrollments.rosterCourseId;
  if (courseId) enrollments.fetchRoster(courseId);
});

watch(
  () => enrollments.rosterCourseId,
  (courseId) => {
    if ((route.query.course || '') === courseId) return;
    router.replace({ query: courseId ? { course: courseId } : {} });
  }
);

function reload() {
  students.fetchStudents({ force: true });
  courses.fetchCourses({ force: true });
}
</script>

<template>
  <PageHeader title="Enrollments" subtitle="Enroll students in courses and see who is in each course." />

  <AlertMessage
    v-if="students.error || courses.error"
    type="error"
    :message="students.error || courses.error"
    retry-label="Try again"
    @retry="reload"
  />

  <div class="layout-two-col">
    <EnrollmentForm />
    <CourseRoster />
  </div>
</template>
