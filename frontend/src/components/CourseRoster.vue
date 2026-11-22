<script setup>
import { ref, computed, watch } from 'vue';
import StudentTable from './StudentTable.vue';
import LoadingState from './LoadingState.vue';
import EmptyState from './EmptyState.vue';
import AlertMessage from './AlertMessage.vue';
import { useCoursesStore } from '@/stores/courses';
import { useEnrollmentsStore } from '@/stores/enrollments';
import { useNotificationsStore } from '@/stores/notifications';
import { useConfirmStore } from '@/stores/confirm';

const courses = useCoursesStore();
const enrollments = useEnrollmentsStore();
const notify = useNotificationsStore();
const confirm = useConfirmStore();

const busyId = ref('');

// The drop-down is tied to the store, so the chosen course stays
// selected when you leave and come back to this page.
const selectedCourse = computed({
  get: () => enrollments.rosterCourseId,
  set: (value) => enrollments.fetchRoster(value),
});

// If the selected course is deleted somewhere else, reset the roster.
watch(
  () => courses.courses.map((c) => c.courseId),
  (ids) => {
    if (enrollments.rosterCourseId && !ids.includes(enrollments.rosterCourseId)) {
      enrollments.handleCourseDeleted(enrollments.rosterCourseId);
    }
  }
);

const heading = computed(() =>
  enrollments.rosterCourse
    ? `${enrollments.rosterCourse.courseId} – ${enrollments.rosterCourse.name}`
    : 'Students in Course'
);

async function onDrop(student) {
  const course = enrollments.rosterCourse?.courseId;
  const ok = await confirm.ask({
    title: 'Remove enrollment?',
    message: `Remove ${student.name} (${student.studentId}) from ${course}? The student record is kept.`,
    confirmLabel: 'Remove',
  });
  if (!ok) return;
  busyId.value = student.studentId;
  try {
    await enrollments.drop(student);
    notify.success(`${student.name} was removed from ${course}`);
  } catch (err) {
    notify.error(err.message);
  } finally {
    busyId.value = '';
  }
}
</script>

<template>
  <section class="card" aria-labelledby="roster-title">
    <h2 id="roster-title">Students in Course</h2>

    <div class="form-field">
      <label for="roster-course">Select a course</label>
      <select id="roster-course" v-model="selectedCourse" :disabled="courses.loading || courses.count === 0">
        <option value="">{{ courses.loading ? 'Loading courses...' : '-- Select a course --' }}</option>
        <option v-for="c in courses.sortedCourses" :key="c.id" :value="c.courseId">
          {{ c.name }} ({{ c.courseId }})
        </option>
      </select>
    </div>

    <div aria-live="polite">
      <EmptyState
        v-if="!enrollments.rosterCourseId"
        title="No course selected"
        message="Choose a course above to see its students."
      />
      <LoadingState v-else-if="enrollments.loadingRoster" message="Loading students..." />
      <AlertMessage
        v-else-if="enrollments.rosterError"
        type="error"
        :message="enrollments.rosterError"
        retry-label="Try again"
        @retry="enrollments.fetchRoster(enrollments.rosterCourseId)"
      />
      <EmptyState
        v-else-if="enrollments.roster.length === 0"
        title="No students enrolled yet"
        :message="`Nobody is enrolled in ${enrollments.rosterCourseId}. Use the form to enroll a student.`"
      />
      <template v-else>
        <p class="result-count">
          <strong>{{ heading }}</strong> · {{ enrollments.roster.length }}
          {{ enrollments.roster.length === 1 ? 'student' : 'students' }}
        </p>
        <StudentTable
          :students="enrollments.roster"
          :caption="`Students enrolled in ${enrollments.rosterCourseId}`"
          :show-enrollments="false"
          :busy-id="busyId"
          action-label="Remove"
          @action="onDrop"
        />
      </template>
    </div>
  </section>
</template>
