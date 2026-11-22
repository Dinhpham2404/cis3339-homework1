const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema(
  {
    studentId: {
      type: String,
      required: [true, 'Student ID is required'],
      trim: true,
      match: [/^\d{1,10}$/, 'Student ID must be 1 to 10 digits'],
      unique: true,
    },
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [1, 'Name is required'],
      maxlength: [100, 'Name must be 100 characters or fewer'],
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true,
      match: [/^[0-9()+\-.\s]{7,20}$/, 'Phone number must be 7 to 20 characters (digits, spaces, ( ) + - .)'],
    },
    zip: {
      type: String,
      required: [true, 'ZIP code is required'],
      trim: true,
      match: [/^\d{5}(-\d{4})?$/, 'ZIP code must be 5 digits (or ZIP+4, e.g. 77001-1234)'],
    },
  },
  { timestamps: true }
);

// Lets us search students by name quickly.
studentSchema.index({ name: 1 });

studentSchema.set('toJSON', {
  versionKey: false,
  transform: (_doc, ret) => {
    ret.id = ret._id.toString();
    delete ret._id;
    return ret;
  },
});

module.exports = mongoose.model('Student', studentSchema);
