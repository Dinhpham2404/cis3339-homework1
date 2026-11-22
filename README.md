# CIS 3339 Homework 1 – Student Management System

A full-stack app to manage **students**, **courses**, and **enrollments**.

- **Frontend:** Vue 3 (Composition API, `<script setup>`), Vue Router, Pinia, built with Vite
- **Backend:** Node.js + Express 5 REST API
- **Database:** MongoDB Community Edition (local) through Mongoose

The original assignment instructions are in [`ASSIGNMENT.md`](ASSIGNMENT.md).

---

## Required software

| Software | Version |
| --- | --- |
| Node.js | 20.19 or newer (22 LTS recommended) |
| npm | 10 or newer (comes with Node.js) |
| MongoDB Community Edition | 6.0 or newer, running locally on port 27017 |
| A modern web browser | Chrome, Edge, Firefox, or Safari |

## Environment variables

The real `.env` file is in the **project root** and is committed to Git. It has no passwords or secrets.

```env
MONGODB_URI=mongodb://127.0.0.1:27017/cis3339_homework1
PORT=3000
```

| Variable | Meaning | Default |
| --- | --- | --- |
| `MONGODB_URI` | Local MongoDB connection string | `mongodb://127.0.0.1:27017/cis3339_homework1` |
| `PORT` | Port for the Express server | `3000` |

## Start MongoDB Community Edition

MongoDB must be running before you start the app.

- **Windows:** MongoDB is usually installed as a service and starts by itself. If not, open
  *Services* → **MongoDB Server** → **Start**, or run `net start MongoDB` in an Administrator terminal.
- **macOS (Homebrew):** `brew services start mongodb-community`
- **Linux:** `sudo systemctl start mongod`

Check that it is running: `mongosh --eval "db.runCommand({ ping: 1 })"`

You do **not** need to create the database, collections, or indexes. The app creates them
automatically the first time it starts. No seed, import, or migration command is needed.

## Install, build, and run (production)

Run these commands in the **project root folder** (the folder with this README):

```bash
npm install
npm run build
npm start
```

| Command | What it does |
| --- | --- |
| `npm install` | Installs the dependencies for both `backend/` and `frontend/` (npm workspaces) |
| `npm run build` | Builds the Vue production files into `frontend/dist/` |
| `npm start` | Starts Express, connects to MongoDB, and serves the built app + API |

Then open: **<http://localhost:3000>**

Stop the server with `Ctrl + C`.

## Development mode (optional)

Use two terminals for hot reload while coding:

```bash
npm run dev:backend    # Express API on http://localhost:3000
npm run dev:frontend   # Vite dev server on http://localhost:5173 (sends /api calls to port 3000)
```

---

## Features

| Page | URL | Features |
| --- | --- | --- |
| Home | `/` | Totals for students, courses, and enrollments |
| Students | `/students` | Add a student (name, student ID, phone, ZIP), search by name or ID, list, delete |
| Courses | `/courses` | Add a course (course ID, name), list with enrollment count, delete |
| Enrollments | `/enrollments` | Enroll a student in a course (drop-downs filled from the database), view a course roster, remove an enrollment |

- Required fields and formats are checked in the browser **and** on the server.
- Duplicate student IDs, course IDs, and enrollments are rejected (unique MongoDB indexes + checks).
- An enrollment can only use a student and course that exist.
- Deleting a student or a course also deletes its enrollments.
- Loading, success, error, and empty states are shown on every page.
- Layout works on desktop and mobile; tables turn into cards on small screens.
- Refreshing any page (for example `/courses`) works – Express returns `index.html` and Vue Router shows the page.

## REST API

All responses are JSON. Errors look like `{ "error": "message" }`.

| Method | URL | Body | Success | Errors |
| --- | --- | --- | --- | --- |
| GET | `/api/health` | – | 200 | – |
| GET | `/api/students?search=text` | – | 200 list (search by part of name or exact ID) | 503 |
| GET | `/api/students/:studentId` | – | 200 student + courses | 404 |
| POST | `/api/students` | `{ name, studentId, phone, zip }` | 201 | 400 invalid, 409 duplicate |
| DELETE | `/api/students/:studentId` | – | 200 (+ enrollments removed) | 404 |
| GET | `/api/courses` | – | 200 list with `enrollmentCount` | 503 |
| POST | `/api/courses` | `{ courseId, name }` | 201 | 400 invalid, 409 duplicate |
| DELETE | `/api/courses/:courseId` | – | 200 (+ enrollments removed) | 404 |
| GET | `/api/courses/:courseId/students` | – | 200 course roster | 404 |
| GET | `/api/enrollments` | – | 200 list | 503 |
| POST | `/api/enrollments` | `{ studentId, courseId }` | 201 | 400, 404 missing student/course, 409 duplicate |
| DELETE | `/api/enrollments/:id` | – | 200 | 400, 404 |

If MongoDB stops while the app is running, API calls return **503** with a clear message.

## MongoDB data model

Database: `cis3339_homework1`

| Collection | Fields | Indexes |
| --- | --- | --- |
| `students` | `studentId`, `name`, `phone`, `zip`, timestamps | unique `studentId`, `name` |
| `courses` | `courseId` (saved in capitals, e.g. `CIS 3339`), `name`, timestamps | unique `courseId` |
| `enrollments` | `student` (ref → students), `course` (ref → courses), timestamps | unique `{ student, course }`, `course` |

## Project structure

```
.
├── .env                     # real local MongoDB config (committed)
├── package.json             # root scripts: build / start (npm workspaces)
├── backend/
│   ├── server.js            # loads .env, connects to MongoDB, starts Express
│   └── src/
│       ├── app.js           # API routes, serves frontend/dist, SPA fallback, error handler
│       ├── db.js            # Mongoose connection + automatic collection/index setup
│       ├── utils.js
│       ├── models/          # Student, Course, Enrollment schemas
│       └── routes/          # students, courses, enrollments
└── frontend/
    ├── index.html
    ├── vite.config.js
    └── src/
        ├── main.js          # creates the app, Pinia, and the router
        ├── App.vue
        ├── api/client.js    # fetch wrapper for the REST API
        ├── router/          # Vue Router routes
        ├── stores/          # Pinia: students, courses, enrollments, notifications, confirm
        ├── components/      # forms, tables, roster, toasts, dialog, states
        ├── views/           # Home, Students, Courses, Enrollments, NotFound
        ├── utils/validators.js
        └── assets/main.css
```

## Troubleshooting

- **"Could not connect to MongoDB"** – start MongoDB (see above) and run `npm start` again.
- **"The frontend has not been built yet"** – run `npm run build`, then `npm start`.
- **"Port 3000 is already in use"** – stop the other program or change `PORT` in `.env`.
