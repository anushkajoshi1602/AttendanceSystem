/**
 * SAMPLE DATA — for UI preview only.
 * Nothing here comes from or is written to the MySQL `attendance_db` database.
 * Field names mirror the DB columns (camelCased):
 *   students:   student_id, roll_no, name, department, semester
 *   attendance: attendance_id, student_id, attendance_date, status
 */

import { deptCode } from '../constants.js';

const RAW = [
  ['Aarav Sharma', 'Computer Science', 5],
  ['Ananya Iyer', 'Computer Science', 5],
  ['Rohan Mehta', 'Computer Science', 3],
  ['Priya Nair', 'Computer Science', 3],
  ['Vikram Singh', 'Information Technology', 5],
  ['Sneha Kulkarni', 'Information Technology', 5],
  ['Arjun Reddy', 'Information Technology', 3],
  ['Kavya Menon', 'Information Technology', 7],
  ['Ishaan Gupta', 'Electronics', 5],
  ['Diya Patel', 'Electronics', 5],
  ['Karthik Rao', 'Electronics', 3],
  ['Meera Joshi', 'Electronics', 7],
  ['Aditya Verma', 'Mechanical', 5],
  ['Riya Desai', 'Mechanical', 3],
  ['Siddharth Jain', 'Mechanical', 7],
  ['Neha Chauhan', 'Mechanical', 1],
  ['Rahul Das', 'Civil', 5],
  ['Pooja Banerjee', 'Civil', 3],
  ['Varun Pillai', 'Civil', 7],
  ['Tanvi Saxena', 'Civil', 1],
  ['Nikhil Bhat', 'Computer Science', 7],
  ['Shreya Ghosh', 'Computer Science', 1],
  ['Aman Khanna', 'Information Technology', 1],
  ['Lakshmi Krishnan', 'Electronics', 1],
];

const counters = {};
export const sampleStudents = RAW.map(([name, department, semester], i) => {
  const code = deptCode(department);
  counters[code] = (counters[code] || 0) + 1;
  return {
    studentId: i + 1,
    rollNo: `${code}${String(semester).padStart(2, '0')}${String(counters[code]).padStart(3, '0')}`,
    name,
    department,
    semester,
  };
});

// Deterministic pseudo-random so the preview looks the same on every load.
function seeded(seed) {
  let s = seed;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

export const toISODate = (d) => {
  const z = new Date(d.getTime() - d.getTimezoneOffset() * 60000);
  return z.toISOString().slice(0, 10);
};

function buildAttendance() {
  const rand = seeded(42);
  const records = [];
  let id = 1;
  const today = new Date();
  // Past 30 days, weekdays only, excluding today (today is left for "Mark Attendance").
  for (let back = 30; back >= 1; back--) {
    const d = new Date(today);
    d.setDate(today.getDate() - back);
    const day = d.getDay();
    if (day === 0 || day === 6) continue;
    const date = toISODate(d);
    sampleStudents.forEach((s) => {
      const reliability = 0.7 + ((s.studentId * 37) % 25) / 100; // 0.70–0.94
      records.push({
        attendanceId: id++,
        studentId: s.studentId,
        attendanceDate: date,
        status: rand() < reliability ? 'Present' : 'Absent',
      });
    });
  }
  return records;
}

export const sampleAttendance = buildAttendance();
