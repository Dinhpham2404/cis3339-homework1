import { ref, computed } from 'vue';
import { defineStore } from 'pinia';
import { api } from '@/api/client';
import { useEnrollmentsStore } from './enrollments';
import { useCoursesStore } from './courses';

// Student data shared by the Students, Enrollments, and Home views.
export const useStudentsStore = defineStore('students', () => {
  // All students (used for the list and the enrollment drop-down)
  const students = ref([]);
  const loading = ref(false);
  const loaded = ref(false);
  const error = ref('');

  // Search state (kept here so it is still there when you come back to the page)
  const searchTerm = ref('');
  const searchResults = ref([]);
  const searching = ref(false);
  const hasSearched = ref(false);

  const count = computed(() => students.value.length);
  const sortedStudents = computed(() =>
    [...students.value].sort((a, b) => a.name.localeCompare(b.name) || a.studentId.localeCompare(b.studentId))
  );

  async function fetchStudents({ force = false } = {}) {
    if (loaded.value && !force) return;
    loading.value = true;
    error.value = '';
    try {
      students.value = await api.getStudents();
      loaded.value = true;
    } catch (err) {
      error.value = err.message;
    } finally {
      loading.value = false;
    }
  }

  async function search(term) {
    searchTerm.value = term.trim();
    if (!searchTerm.value) {
      clearSearch();
      return;
    }
    searching.value = true;
    try {
      searchResults.value = await api.getStudents(searchTerm.value);
      hasSearched.value = true;
    } finally {
      searching.value = false;
    }
  }

  function clearSearch() {
    searchTerm.value = '';
    searchResults.value = [];
    hasSearched.value = false;
  }

  async function addStudent(data) {
    const { student, message } = await api.addStudent(data);
    students.value.push(student);
    return message;
  }

  async function deleteStudent(studentId) {
    const result = await api.deleteStudent(studentId);
    students.value = students.value.filter((s) => s.studentId !== studentId);
    searchResults.value = searchResults.value.filter((s) => s.studentId !== studentId);

    // The backend also removed this student's enrollments, so update
    // the roster and the course enrollment counts.
    useEnrollmentsStore().removeStudentFromRoster(studentId);
    if (result.removedEnrollments > 0) useCoursesStore().fetchCourses({ force: true });
    return result;
  }

  // Keep the enrollment count on each student in sync.
  function changeEnrollmentCount(studentId, delta) {
    for (const list of [students.value, searchResults.value]) {
      const s = list.find((x) => x.studentId === studentId);
      if (s) s.enrollmentCount = Math.max(0, (s.enrollmentCount || 0) + delta);
    }
  }

  return {
    students,
    sortedStudents,
    loading,
    loaded,
    error,
    count,
    searchTerm,
    searchResults,
    searching,
    hasSearched,
    fetchStudents,
    search,
    clearSearch,
    addStudent,
    deleteStudent,
    changeEnrollmentCount,
  };
});
