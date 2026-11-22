<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import PageHeader from '@/components/PageHeader.vue';
import CourseForm from '@/components/CourseForm.vue';
import CourseTable from '@/components/CourseTable.vue';
import LoadingState from '@/components/LoadingState.vue';
import EmptyState from '@/components/EmptyState.vue';
import AlertMessage from '@/components/AlertMessage.vue';
import { useCoursesStore } from '@/stores/courses';
import { useEnrollmentsStore } from '@/stores/enrollments';
import { useNotificationsStore } from '@/stores/notifications';
import { useConfirmStore } from '@/stores/confirm';

const courses = useCoursesStore();
const enrollments = useEnrollmentsStore();
const notify = useNotificationsStore();
const confirm = useConfirmStore();
const router = useRouter();
const busyId = ref('');

onMounted(() => courses.fetchCourses({ force: true }));

async function onDelete(course) {
  const extra = course.enrollmentCount
    ? ` ${course.enrollmentCount} enrollment(s) in this course will also be removed.`
    : '';
  const ok = await confirm.ask({
    title: 'Delete course?',
    message: `Delete ${course.courseId} – ${course.name}?${extra} This cannot be undone.`,
    confirmLabel: 'Delete',
  });
  if (!ok) return;

  busyId.value = course.courseId;
  try {
    const result = await courses.deleteCourse(course.courseId);
    const removed = result.removedEnrollments ? ` and ${result.removedEnrollments} enrollment(s) removed` : '';
    notify.success(`${result.message}${removed}.`);
  } catch (err) {
    notify.error(err.message);
    if (err.status === 404) courses.fetchCourses({ force: true });
  } finally {
    busyId.value = '';
  }
}

// "Roster" button -> open the Enrollments page with this course selected.
function onViewRoster(course) {
  enrollments.fetchRoster(course.courseId);
  router.push({ name: 'enrollments' });
}
</script>

<template>
  <PageHeader title="Courses" subtitle="Add, list, and delete courses." />

  <div class="layout-two-col">
    <CourseForm />

    <section class="card" aria-labelledby="course-list-title">
      <h2 id="course-list-title">All Courses</h2>
      <div aria-live="polite">
        <LoadingState v-if="courses.loading && !courses.loaded" message="Loading courses..." />
        <AlertMessage
          v-else-if="courses.error"
          type="error"
          :message="courses.error"
          retry-label="Try again"
          @retry="courses.fetchCourses({ force: true })"
        />
        <EmptyState v-else-if="courses.count === 0" title="No courses yet" message="Use the form to add the first course." />
        <template v-else>
          <p class="result-count">{{ courses.count }} {{ courses.count === 1 ? 'course' : 'courses' }}</p>
          <CourseTable
            :courses="courses.sortedCourses"
            :busy-id="busyId"
            @delete="onDelete"
            @view-roster="onViewRoster"
          />
        </template>
      </div>
    </section>
  </div>
</template>
