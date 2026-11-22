const mongoose = require('mongoose');

// An enrollment links one student to one course.
// It stores references (ObjectIds) to the Student and Course documents.
const enrollmentSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: [true, 'Student is required'],
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: [true, 'Course is required'],
    },
  },
  { timestamps: true }
);

// The same student cannot be enrolled in the same course twice.
enrollmentSchema.index({ student: 1, course: 1 }, { unique: true });
// Fast lookup of all students in one course.
enrollmentSchema.index({ course: 1 });

enrollmentSchema.set('toJSON', {
  versionKey: false,
  transform: (_doc, ret) => {
    ret.id = ret._id.toString();
    delete ret._id;
    return ret;
  },
});

module.exports = mongoose.model('Enrollment', enrollmentSchema);
