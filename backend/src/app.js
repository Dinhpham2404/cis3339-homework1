const express = require('express');
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');

const studentRoutes = require('./routes/students');
const courseRoutes = require('./routes/courses');
const enrollmentRoutes = require('./routes/enrollments');
const { isDatabaseReady } = require('./db');

// Folder made by "npm run build" in the frontend.
const DIST_DIR = path.resolve(__dirname, '..', '..', 'frontend', 'dist');

function createApp() {
  const app = express();
  app.disable('x-powered-by');
  app.use(express.json({ limit: '100kb' }));

  // ---------- REST API ----------
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', database: isDatabaseReady() ? 'connected' : 'disconnected' });
  });

  // Every other API call needs the database.
  app.use('/api', (req, res, next) => {
    if (!isDatabaseReady()) {
      return res.status(503).json({ error: 'The database is not available right now. Please try again shortly.' });
    }
    next();
  });

  app.use('/api/students', studentRoutes);
  app.use('/api/courses', courseRoutes);
  app.use('/api/enrollments', enrollmentRoutes);

  // Unknown API URL -> JSON 404 (never the Vue page).
  app.use('/api', (req, res) => {
    res.status(404).json({ error: `API route not found: ${req.method} ${req.originalUrl}` });
  });

  // ---------- Vue production build ----------
  app.use(express.static(DIST_DIR));

  // Vue Router uses normal URLs like /courses. When the user refreshes
  // that page, the browser asks the server for /courses, so we send back
  // index.html and let Vue Router show the right view (no 404).
  app.use((req, res, next) => {
    if (req.method !== 'GET' && req.method !== 'HEAD') return next();
    const indexFile = path.join(DIST_DIR, 'index.html');
    if (!fs.existsSync(indexFile)) {
      return res
        .status(500)
        .type('text')
        .send('The frontend has not been built yet. Run "npm run build" and then restart the server.');
    }
    res.sendFile(indexFile);
  });

  app.use((req, res) => {
    res.status(404).json({ error: 'Not found' });
  });

  // ---------- Error handler ----------
  // eslint-disable-next-line no-unused-vars
  app.use((err, req, res, next) => {
    // Bad JSON in the request body
    if (err.type === 'entity.parse.failed') {
      return res.status(400).json({ error: 'The request body is not valid JSON' });
    }
    // Errors we threw on purpose (HttpError)
    if (err.status && err.status < 500) {
      return res.status(err.status).json({ error: err.message, ...(err.details && { details: err.details }) });
    }
    // Schema validation failed
    if (err instanceof mongoose.Error.ValidationError) {
      const details = Object.fromEntries(Object.entries(err.errors).map(([field, e]) => [field, e.message]));
      return res.status(400).json({ error: Object.values(details).join('. '), details });
    }
    // A value had the wrong type (e.g. bad ObjectId)
    if (err instanceof mongoose.Error.CastError) {
      return res.status(400).json({ error: `Invalid value for ${err.path}` });
    }
    // Unique index blocked a duplicate record
    if (err.code === 11000) {
      const field = Object.keys(err.keyPattern || {}).join(', ');
      return res.status(409).json({ error: `Duplicate record: this ${field || 'value'} already exists` });
    }
    // Lost connection to MongoDB in the middle of a request
    if (err.name === 'MongoServerSelectionError' || err.name === 'MongoNetworkError' || err.name === 'MongooseError') {
      console.error('Database error:', err.message);
      return res.status(503).json({ error: 'The database is not available right now. Please try again shortly.' });
    }

    console.error('Unexpected error:', err);
    res.status(500).json({ error: 'Internal server error' });
  });

  return app;
}

module.exports = { createApp, DIST_DIR };
