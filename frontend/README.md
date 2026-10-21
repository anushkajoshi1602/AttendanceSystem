# AttendEase — Student Attendance Management (Frontend)

React + Vite admin dashboard for the existing Java Swing / MySQL (`attendance_db`) attendance system.
The Java code in `src/main/java/com/attendance/` is untouched; this frontend lives entirely in `frontend/`.

**Stack:** React 18 · Vite 6 · Tailwind CSS v4 · React Router 6 · Recharts · Lucide React

## Getting started

```bash
cd frontend
npm install
cp .env.example .env      # Windows: copy .env.example .env
npm run dev               # http://localhost:5173
```

Production build: `npm run build` (output in `dist/`), preview with `npm run preview`.

> On Windows PowerShell, if `npm` is blocked by the execution policy, use `npm.cmd` instead.

## Environment variables

| Variable | Default | Description |
|---|---|---|
| `VITE_API_BASE_URL` | `http://localhost:8080/api` | Base URL of the Java REST API |
| `VITE_USE_SAMPLE_DATA` | `true` | `true` = in-browser sample data; `false` = call the real API |

## Sample data vs. API data

- **Sample mode (default):** data comes from `src/data/sampleData.js` via `src/services/sampleAdapter.js`.
  Any changes (adding students, saving attendance) are kept **only in browser memory** and are lost on reload.
  **Nothing is written to MySQL.** A yellow banner shows on every page while this mode is on.
- **API mode:** set `VITE_USE_SAMPLE_DATA=false`. All calls go through `src/services/apiClient.js` to `VITE_API_BASE_URL`.
  If the backend is unreachable, pages show an error state with a retry button. They don't fall back to sample data.

The browser never connects to MySQL directly. A Java backend must expose the REST API below.

## Expected REST contract

JSON field names are camelCase versions of the DB columns.

```ts
Student    { studentId, rollNo, name, department, semester }
Attendance { attendanceId, studentId, attendanceDate: "YYYY-MM-DD", status: "Present" | "Absent" }
```

| Method | Path | Body / Query | Response |
|---|---|---|---|
| GET | `/students` | – | `Student[]` |
| POST | `/students` | `{ rollNo, name, department, semester }` | `Student` (409 if roll no exists) |
| GET | `/attendance` | `?date=YYYY-MM-DD` | `Attendance[]` |
| POST | `/attendance` | `{ date, records: [{ studentId, status }] }` | `{ date, saved }` (upsert per student+date) |
| GET | `/attendance/range` | `?from=&to=` | `Attendance[]` |
| GET | `/dashboard/summary` | – | `{ totalStudents, referenceDate, isToday, present, absent, percentage, trend: [{date,present,absent,percentage}], recent: [Attendance & { student }] }` |

Error responses should be JSON like `{ "message": "..." }`. Enable CORS for the Vite dev origin (`http://localhost:5173`).

## Project structure

```
src/
  config/env.js            env variables
  constants.js             departments, semesters
  data/sampleData.js       SAMPLE DATA ONLY
  services/
    apiClient.js           fetch wrapper + ApiError
    sampleAdapter.js       in-memory implementation (sample mode)
    studentService.js      student API functions
    attendanceService.js   attendance / report / dashboard API functions
  hooks/useAsync.js        loading / error / data state
  context/ToastContext.jsx success & error notifications
    layout/AppLayout.jsx   editorial sidebar, top bar, responsive mobile drawer
    ui/index.jsx           Button, Card, Modal, Drawer, StatCard, Badge, states…
  pages/                   Dashboard, Students, MarkAttendance, Reports, NotFound
  utils/format.js          date helpers
```
