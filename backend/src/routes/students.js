const express = require('express');
const Student = require('../models/Student');
const Enrollment = require('../models/Enrollment');
const { HttpError, escapeRegex, text } = require('../utils');

const router = express.Router();

// Adds "enrollmentCount" to each student.
async function withEnrollmentCounts(students) {
  const counts = await Enrollment.aggregate([
    { $match: { student: { $in: students.map((s) => s._id) } } },
    { $group: { _id: '$student', count: { $sum: 1 } } },
  ]);
  const countById = new Map(counts.map((c) => [c._id.toString(), c.count]));
  return students.map((s) => ({ ...s.toJSON(), enrollmentCount: countById.get(s._id.toString()) || 0 }));
}

// GET /api/students?search=john
// No search text = all students. Search matches part of the name
// (not case-sensitive) or the exact student ID.
router.get('/', async (req, res) => {
  const search = text(req.query.search);
  let filter = {};
  if (search) {
    filter = {
      $or: [{ name: { $regex: escapeRegex(search), $options: 'i' } }, { studentId: search }],
    };
  }
  const students = await Student.find(filter).sort({ name: 1, studentId: 1 });
  res.json(await withEnrollmentCounts(students));
});

// GET /api/students/:studentId -> one student and the courses they are in
router.get('/:studentId', async (req, res) => {
  const student = await Student.findOne({ studentId: text(req.params.studentId) });
  if (!student) throw new HttpError(404, `Student ${req.params.studentId} was not found`);

  const enrollments = await Enrollment.find({ student: student._id }).populate('course');
  res.json({
    ...student.toJSON(),
    courses: enrollments.filter((e) => e.course).map((e) => e.course.toJSON()),
  });
});

// POST /api/students  body: { name, studentId, phone, zip }
router.post('/', async (req, res) => {
  const data = {
    name: text(req.body?.name),
    studentId: text(req.body?.studentId),
    phone: text(req.body?.phone),
    zip: text(req.body?.zip),
  };

  const missing = Object.entries(data).filter(([, v]) => !v).map(([k]) => k);
  if (missing.length) {
    throw new HttpError(400, `Missing required field(s): ${missing.join(', ')}`);
  }

  if (await Student.exists({ studentId: data.studentId })) {
    throw new HttpError(409, `A student with ID ${data.studentId} already exists`);
  }

  // Mongoose runs the schema validation here. The unique index also
  // blocks duplicates if two requests arrive at the same time.
  const student = await Student.create(data);
  res.status(201).json({ message: 'Student added successfully', student: { ...student.toJSON(), enrollmentCount: 0 } });
});

// DELETE /api/students/:studentId -> also removes the student's enrollments
router.delete('/:studentId', async (req, res) => {
  const student = await Student.findOne({ studentId: text(req.params.studentId) });
  if (!student) throw new HttpError(404, `Student ${req.params.studentId} was not found`);

  const { deletedCount } = await Enrollment.deleteMany({ student: student._id });
  await student.deleteOne();

  res.json({
    message: `Student ${student.name} deleted successfully`,
    student: student.toJSON(),
    removedEnrollments: deletedCount,
  });
});

module.exports = router;
