const express = require('express');
const Course = require('../models/Course');
const Enrollment = require('../models/Enrollment');
const { HttpError, text } = require('../utils');

const router = express.Router();

async function findCourseOr404(rawId) {
  const courseId = Course.normalizeCourseId(text(rawId));
  const course = await Course.findOne({ courseId });
  if (!course) throw new HttpError(404, `Course ${courseId} was not found`);
  return course;
}

// GET /api/courses -> all courses, each with "enrollmentCount"
router.get('/', async (req, res) => {
  const courses = await Course.find().sort({ courseId: 1 });
  const counts = await Enrollment.aggregate([{ $group: { _id: '$course', count: { $sum: 1 } } }]);
  const countById = new Map(counts.map((c) => [c._id.toString(), c.count]));
  res.json(courses.map((c) => ({ ...c.toJSON(), enrollmentCount: countById.get(c._id.toString()) || 0 })));
});

// GET /api/courses/:courseId/students -> the course roster
router.get('/:courseId/students', async (req, res) => {
  const course = await findCourseOr404(req.params.courseId);
  const enrollments = await Enrollment.find({ course: course._id }).populate('student');

  const students = enrollments
    .filter((e) => e.student)
    .map((e) => ({ ...e.student.toJSON(), enrollmentId: e._id.toString(), enrolledAt: e.createdAt }))
    .sort((a, b) => a.name.localeCompare(b.name));

  res.json({ course: course.toJSON(), students });
});

// POST /api/courses  body: { courseId, name }
router.post('/', async (req, res) => {
  const data = {
    courseId: Course.normalizeCourseId(text(req.body?.courseId)),
    name: text(req.body?.name),
  };

  const missing = Object.entries(data).filter(([, v]) => !v).map(([k]) => k);
  if (missing.length) {
    throw new HttpError(400, `Missing required field(s): ${missing.join(', ')}`);
  }

  if (await Course.exists({ courseId: data.courseId })) {
    throw new HttpError(409, `A course with ID ${data.courseId} already exists`);
  }

  const course = await Course.create(data);
  res.status(201).json({ message: 'Course added successfully', course: { ...course.toJSON(), enrollmentCount: 0 } });
});

// DELETE /api/courses/:courseId -> also removes the course's enrollments
router.delete('/:courseId', async (req, res) => {
  const course = await findCourseOr404(req.params.courseId);

  const { deletedCount } = await Enrollment.deleteMany({ course: course._id });
  await course.deleteOne();

  res.json({
    message: `Course ${course.courseId} deleted successfully`,
    course: course.toJSON(),
    removedEnrollments: deletedCount,
  });
});

module.exports = router;
