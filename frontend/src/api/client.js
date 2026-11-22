// All HTTP calls to the Express backend go through this file.
// The app is served by Express, so a relative URL ("/api/...") works.
const BASE_URL = '/api';

export class ApiError extends Error {
  constructor(message, status, details) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

async function request(method, path, body) {
  let response;
  try {
    response = await fetch(`${BASE_URL}${path}`, {
      method,
      headers: body ? { 'Content-Type': 'application/json' } : undefined,
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new ApiError('Cannot reach the server. Check that the backend is running.', 0);
  }

  let data = null;
  const isJson = response.headers.get('content-type')?.includes('application/json');
  if (isJson) {
    data = await response.json().catch(() => null);
  }

  if (!response.ok) {
    throw new ApiError(data?.error || `Request failed (${response.status})`, response.status, data?.details);
  }
  return data;
}

export const api = {
  // Students
  getStudents: (search = '') =>
    request('GET', `/students${search ? `?search=${encodeURIComponent(search)}` : ''}`),
  addStudent: (student) => request('POST', '/students', student),
  deleteStudent: (studentId) => request('DELETE', `/students/${encodeURIComponent(studentId)}`),

  // Courses
  getCourses: () => request('GET', '/courses'),
  addCourse: (course) => request('POST', '/courses', course),
  deleteCourse: (courseId) => request('DELETE', `/courses/${encodeURIComponent(courseId)}`),
  getCourseRoster: (courseId) => request('GET', `/courses/${encodeURIComponent(courseId)}/students`),

  // Enrollments
  enroll: (studentId, courseId) => request('POST', '/enrollments', { studentId, courseId }),
  dropEnrollment: (enrollmentId) => request('DELETE', `/enrollments/${encodeURIComponent(enrollmentId)}`),
};
