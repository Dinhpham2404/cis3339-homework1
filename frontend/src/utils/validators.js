// Form checks that match the rules in the backend schemas.
// Each function returns an object like { fieldName: 'error message' }.
// An empty object means the form is valid.

export function validateStudent({ name, studentId, phone, zip }) {
  const errors = {};
  if (!name.trim()) errors.name = 'Name is required.';
  else if (name.trim().length > 100) errors.name = 'Name must be 100 characters or fewer.';

  if (!studentId.trim()) errors.studentId = 'Student ID is required.';
  else if (!/^\d{1,10}$/.test(studentId.trim())) errors.studentId = 'Student ID must be 1 to 10 digits.';

  if (!phone.trim()) errors.phone = 'Phone number is required.';
  else if (!/^[0-9()+\-.\s]{7,20}$/.test(phone.trim()))
    errors.phone = 'Use 7 to 20 digits, spaces, or ( ) + - . characters.';

  if (!zip.trim()) errors.zip = 'ZIP code is required.';
  else if (!/^\d{5}(-\d{4})?$/.test(zip.trim())) errors.zip = 'ZIP code must be 5 digits (e.g. 77001).';

  return errors;
}

export function normalizeCourseId(value) {
  return value.trim().replace(/\s+/g, ' ').toUpperCase();
}

export function validateCourse({ courseId, name }) {
  const errors = {};
  const id = normalizeCourseId(courseId);
  if (!id) errors.courseId = 'Course ID is required.';
  else if (!/^[A-Z0-9][A-Z0-9 -]{1,19}$/.test(id))
    errors.courseId = 'Use 2 to 20 letters, numbers, spaces, or dashes (e.g. CIS 3339).';

  if (!name.trim()) errors.name = 'Course name is required.';
  else if (name.trim().length > 150) errors.name = 'Course name must be 150 characters or fewer.';

  return errors;
}
