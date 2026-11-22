<script setup>
import { ref, computed, onMounted } from 'vue';
import PageHeader from '@/components/PageHeader.vue';
import StudentForm from '@/components/StudentForm.vue';
import StudentSearch from '@/components/StudentSearch.vue';
import StudentTable from '@/components/StudentTable.vue';
import LoadingState from '@/components/LoadingState.vue';
import EmptyState from '@/components/EmptyState.vue';
import AlertMessage from '@/components/AlertMessage.vue';
import { useStudentsStore } from '@/stores/students';
import { useNotificationsStore } from '@/stores/notifications';
import { useConfirmStore } from '@/stores/confirm';

const students = useStudentsStore();
const notify = useNotificationsStore();
const confirm = useConfirmStore();
const busyId = ref('');

onMounted(() => students.fetchStudents({ force: true }));

// Show search results when the user searched; otherwise show everyone.
const list = computed(() => (students.hasSearched ? students.searchResults : students.sortedStudents));
const listTitle = computed(() =>
  students.hasSearched ? `Search results for "${students.searchTerm}"` : 'All Students'
);

async function onDelete(student) {
  const extra = student.enrollmentCount
    ? ` Their ${student.enrollmentCount} enrollment(s) will also be removed.`
    : '';
  const ok = await confirm.ask({
    title: 'Delete student?',
    message: `Delete ${student.name} (${student.studentId})?${extra} This cannot be undone.`,
    confirmLabel: 'Delete',
  });
  if (!ok) return;

  busyId.value = student.studentId;
  try {
    const result = await students.deleteStudent(student.studentId);
    const removed = result.removedEnrollments ? ` and ${result.removedEnrollments} enrollment(s) removed` : '';
    notify.success(`${result.message}${removed}.`);
  } catch (err) {
    notify.error(err.message);
    if (err.status === 404) students.fetchStudents({ force: true });
  } finally {
    busyId.value = '';
  }
}
</script>

<template>
  <PageHeader title="Students" subtitle="Add, search, view, and delete student records." />

  <div class="layout-two-col">
    <StudentForm />

    <section class="card" aria-labelledby="student-list-title">
      <h2 id="student-list-title">{{ listTitle }}</h2>
      <StudentSearch />

      <div aria-live="polite">
        <LoadingState v-if="students.loading && !students.loaded" message="Loading students..." />
        <AlertMessage
          v-else-if="students.error"
          type="error"
          :message="students.error"
          retry-label="Try again"
          @retry="students.fetchStudents({ force: true })"
        />
        <EmptyState
          v-else-if="students.hasSearched && list.length === 0"
          title="Cannot find the student"
          :message="`No student matches “${students.searchTerm}”. Check the spelling or try the student ID.`"
        />
        <EmptyState
          v-else-if="list.length === 0"
          title="No students yet"
          message="Use the form to add the first student."
        />
        <template v-else>
          <p class="result-count">
            {{ list.length }} {{ list.length === 1 ? 'student' : 'students' }}
            {{ students.hasSearched ? 'found' : '' }}
          </p>
          <StudentTable :students="list" :caption="listTitle" :busy-id="busyId" @action="onDelete" />
        </template>
      </div>
    </section>
  </div>
</template>
