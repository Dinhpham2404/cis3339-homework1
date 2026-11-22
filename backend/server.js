const path = require('path');

// Read settings from the .env file in the project root folder.
require('dotenv').config({ path: path.resolve(__dirname, '..', '.env'), quiet: true });

const { createApp } = require('./src/app');
const { connectDatabase, disconnectDatabase } = require('./src/db');

const DEFAULT_URI = 'mongodb://127.0.0.1:27017/cis3339_homework1';
const MONGODB_URI = process.env.MONGODB_URI || DEFAULT_URI;
const PORT = Number(process.env.PORT) || 3000;

if (!process.env.MONGODB_URI) {
  console.warn(`MONGODB_URI is not set in .env. Using the default: ${DEFAULT_URI}`);
}

async function start() {
  try {
    await connectDatabase(MONGODB_URI);
    console.log(`Connected to MongoDB at ${MONGODB_URI}`);
  } catch (err) {
    console.error(`\nCould not connect to MongoDB at ${MONGODB_URI}`);
    console.error(`Reason: ${err.message}`);
    console.error('Make sure MongoDB Community Edition is installed and running, then start the app again.\n');
    process.exit(1);
  }

  const app = createApp();
  const server = app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });

  server.on('error', async (err) => {
    if (err.code === 'EADDRINUSE') {
      console.error(`Port ${PORT} is already in use. Stop the other program or change PORT in .env.`);
    } else {
      console.error('Server error:', err.message);
    }
    await disconnectDatabase();
    process.exit(1);
  });

  // Close cleanly on Ctrl+C
  const shutdown = () => {
    console.log('\nShutting down...');
    server.close(async () => {
      await disconnectDatabase();
      process.exit(0);
    });
  };
  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

start();
