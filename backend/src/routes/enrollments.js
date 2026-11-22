const express = require('express');
const mongoose = require('mongoose');
const Student = require('../models/Student');
const Course = require('../models/Course');
const Enrollment = require('../models/Enrollment');
const { HttpError, text } = require('../utils');

const router = express.Router();

function format(enrollment) {
  return {
    id: enrollment._id.toString(),
    student: enrollment.student?.toJSON ? enrollment.student.toJSON() : enrollment.student,
    course: enrollment.course?.toJSON ? enrollment.course.toJSON() : enrollment.course,
    createdAt: enrollment.createdAt,
  };
}

// GET /api/enrollments -> all enrollments with student and course details
router.get('/', async (req, res) => {
  const enrollments = await Enrollment.find().populate('student').populate('course').sort({ createdAt: -1 });
  res.json(enrollments.filter((e) => e.student && e.course).map(format));
});

// POST /api/enrollments  body: { studentId, courseId }
// Uses the public IDs (e.g. "1001" and "CIS 3339").
router.post('/', async (req, res) => {
  const studentId = text(req.body?.studentId);
  const courseId = Course.normalizeCourseId(text(req.body?.courseId));

  if (!studentId || !courseId) {
    throw new HttpError(400, 'Both a student and a course must be selected');
  }

  // An enrollment may only point to a student and course that exist.
  const [student, course] = await Promise.all([Student.findOne({ studentId }), Course.findOne({ courseId })]);
  if (!student) throw new HttpError(404, `Student ${studentId} was not found`);
  if (!course) throw new HttpError(404, `Course ${courseId} was not found`);

  if (await Enrollment.exists({ student: student._id, course: course._id })) {
    throw new HttpError(409, `${student.name} is already enrolled in ${course.courseId}`);
  }

  const enrollment = await Enrollment.create({ student: student._id, course: course._id });

  // If the student or course was deleted while we were saving, undo the
  // enrollment so we never keep a link to a record that no longer exists.
  const [stillStudent, stillCourse] = await Promise.all([
    Student.exists({ _id: student._id }),
    Course.exists({ _id: course._id }),
  ]);
  if (!stillStudent || !stillCourse) {
    await enrollment.deleteOne();
    throw new HttpError(409, 'The student or course was deleted. Please refresh and try again.');
  }

  enrollment.student = student;
  enrollment.course = course;
  res.status(201).json({
    message: `${student.name} enrolled in ${course.courseId}`,
    enrollment: format(enrollment),
  });
});

// DELETE /api/enrollments/:id -> drop one student from one course
router.delete('/:id', async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    throw new HttpError(400, 'Invalid enrollment ID');
  }
  const enrollment = await Enrollment.findByIdAndDelete(req.params.id);
  if (!enrollment) throw new HttpError(404, 'Enrollment was not found');
  res.json({ message: 'Enrollment removed successfully' });
});

module.exports = router;
