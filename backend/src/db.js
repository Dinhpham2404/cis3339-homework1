const mongoose = require('mongoose');
const Student = require('./models/Student');
const Course = require('./models/Course');
const Enrollment = require('./models/Enrollment');

// Fail fast instead of waiting forever when MongoDB is not connected.
mongoose.set('bufferCommands', false);
mongoose.set('strictQuery', true);

// Connects to MongoDB and makes sure every collection and index exists.
// MongoDB creates the database itself the first time we write to it,
// so this works with an empty or brand-new database. No seed or setup
// command is needed.
async function connectDatabase(uri) {
  await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });

  // Model.init() creates the collection (if missing) and builds its indexes,
  // including the unique indexes that block duplicate records.
  await Promise.all([Student.init(), Course.init(), Enrollment.init()]);

  mongoose.connection.on('disconnected', () => console.warn('MongoDB disconnected. Waiting to reconnect...'));
  mongoose.connection.on('reconnected', () => console.log('MongoDB reconnected.'));
  mongoose.connection.on('error', (err) => console.error('MongoDB error:', err.message));

  return mongoose.connection;
}

function isDatabaseReady() {
  return mongoose.connection.readyState === 1;
}

async function disconnectDatabase() {
  await mongoose.disconnect();
}

module.exports = { connectDatabase, isDatabaseReady, disconnectDatabase };
