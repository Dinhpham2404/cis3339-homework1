const mongoose = require('mongoose');

// Course IDs are stored in one standard format, e.g. " cis   3339 " -> "CIS 3339",
// so "cis 3339" and "CIS 3339" are treated as the same course.
function normalizeCourseId(value) {
  return typeof value === 'string' ? value.trim().replace(/\s+/g, ' ').toUpperCase() : value;
}

const courseSchema = new mongoose.Schema(
  {
    courseId: {
      type: String,
      required: [true, 'Course ID is required'],
      set: normalizeCourseId,
      match: [/^[A-Z0-9][A-Z0-9 \-]{1,19}$/, 'Course ID must be 2 to 20 letters, numbers, spaces, or dashes (e.g. CIS 3339)'],
      unique: true,
    },
    name: {
      type: String,
      required: [true, 'Course name is required'],
      trim: true,
      maxlength: [150, 'Course name must be 150 characters or fewer'],
    },
  },
  { timestamps: true }
);

courseSchema.set('toJSON', {
  versionKey: false,
  transform: (_doc, ret) => {
    ret.id = ret._id.toString();
    delete ret._id;
    return ret;
  },
});

const Course = mongoose.model('Course', courseSchema);
Course.normalizeCourseId = normalizeCourseId;

module.exports = Course;
