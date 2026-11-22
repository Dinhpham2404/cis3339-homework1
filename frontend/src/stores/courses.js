import { ref, computed } from 'vue';
import { defineStore } from 'pinia';
import { api } from '@/api/client';
import { useEnrollmentsStore } from './enrollments';
import { useStudentsStore } from './students';

// Course data shared by the Courses, Enrollments, and Home views.
export const useCoursesStore = defineStore('courses', () => {
  const courses = ref([]);
  const loading = ref(false);
  const loaded = ref(false);
  const error = ref('');

  const count = computed(() => courses.value.length);
  const sortedCourses = computed(() => [...courses.value].sort((a, b) => a.courseId.localeCompare(b.courseId)));
  const totalEnrollments = computed(() => courses.value.reduce((sum, c) => sum + (c.enrollmentCount || 0), 0));

  async function fetchCourses({ force = false } = {}) {
    if (loaded.value && !force) return;
    loading.value = true;
    error.value = '';
    try {
      courses.value = await api.getCourses();
      loaded.value = true;
    } catch (err) {
      error.value = err.message;
    } finally {
      loading.value = false;
    }
  }

  async function addCourse(data) {
    const { course, message } = await api.addCourse(data);
    courses.value.push(course);
    return message;
  }

  async function deleteCourse(courseId) {
    const result = await api.deleteCourse(courseId);
    courses.value = courses.value.filter((c) => c.courseId !== courseId);

    // The backend also removed this course's enrollments.
    useEnrollmentsStore().handleCourseDeleted(courseId);
    if (result.removedEnrollments > 0) useStudentsStore().fetchStudents({ force: true });
    return result;
  }

  function changeEnrollmentCount(courseId, delta) {
    const c = courses.value.find((x) => x.courseId === courseId);
    if (c) c.enrollmentCount = Math.max(0, (c.enrollmentCount || 0) + delta);
  }

  return {
    courses,
    sortedCourses,
    loading,
    loaded,
    error,
    count,
    totalEnrollments,
    fetchCourses,
    addCourse,
    deleteCourse,
    changeEnrollmentCount,
  };
});
