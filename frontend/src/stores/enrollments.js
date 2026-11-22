import { ref } from 'vue';
import { defineStore } from 'pinia';
import { api } from '@/api/client';
import { useStudentsStore } from './students';
import { useCoursesStore } from './courses';

// Enrollment actions and the "students in a course" roster.
export const useEnrollmentsStore = defineStore('enrollments', () => {
  const rosterCourseId = ref(''); // course picked in the roster drop-down
  const rosterCourse = ref(null);
  const roster = ref([]);
  const loadingRoster = ref(false);
  const rosterError = ref('');

  async function fetchRoster(courseId) {
    rosterCourseId.value = courseId;
    rosterError.value = '';
    if (!courseId) {
      roster.value = [];
      rosterCourse.value = null;
      return;
    }
    loadingRoster.value = true;
    try {
      const data = await api.getCourseRoster(courseId);
      // Ignore old answers if the user already picked another course.
      if (rosterCourseId.value !== courseId) return;
      rosterCourse.value = data.course;
      roster.value = data.students;
    } catch (err) {
      if (rosterCourseId.value !== courseId) return;
      roster.value = [];
      rosterCourse.value = null;
      rosterError.value = err.message;
    } finally {
      if (rosterCourseId.value === courseId) loadingRoster.value = false;
    }
  }

  async function enroll(studentId, courseId) {
    const { message } = await api.enroll(studentId, courseId);
    useStudentsStore().changeEnrollmentCount(studentId, 1);
    useCoursesStore().changeEnrollmentCount(courseId, 1);
    if (rosterCourseId.value === courseId) await fetchRoster(courseId);
    return message;
  }

  async function drop(student) {
    const result = await api.dropEnrollment(student.enrollmentId);
    roster.value = roster.value.filter((s) => s.enrollmentId !== student.enrollmentId);
    useStudentsStore().changeEnrollmentCount(student.studentId, -1);
    useCoursesStore().changeEnrollmentCount(rosterCourseId.value, -1);
    return result;
  }

  // Called after a student is deleted (their enrollments are gone too).
  function removeStudentFromRoster(studentId) {
    const before = roster.value.length;
    roster.value = roster.value.filter((s) => s.studentId !== studentId);
    if (roster.value.length !== before) useCoursesStore().changeEnrollmentCount(rosterCourseId.value, -1);
  }

  // Called after a course is deleted.
  function handleCourseDeleted(courseId) {
    if (rosterCourseId.value === courseId) {
      rosterCourseId.value = '';
      rosterCourse.value = null;
      roster.value = [];
    }
  }

  return {
    rosterCourseId,
    rosterCourse,
    roster,
    loadingRoster,
    rosterError,
    fetchRoster,
    enroll,
    drop,
    removeStudentFromRoster,
    handleCourseDeleted,
  };
});
