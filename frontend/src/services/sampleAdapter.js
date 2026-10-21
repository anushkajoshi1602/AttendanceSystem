/**
 * In-memory implementation of the API, used ONLY when VITE_USE_SAMPLE_DATA=true.
 * Changes live in browser memory for the current session and are lost on reload.
 * Nothing is sent to the Java backend or MySQL.
 */
import { sampleStudents, sampleAttendance, toISODate } from '../data/sampleData.js';
import { ApiError } from './apiClient.js';

let students = sampleStudents.map((s) => ({ ...s }));
let attendance = sampleAttendance.map((a) => ({ ...a }));
let nextStudentId = students.length + 1;
let nextAttendanceId = attendance.length + 1;

const delay = (ms = 450) => new Promise((r) => setTimeout(r, ms + Math.random() * 250));
const clone = (x) => JSON.parse(JSON.stringify(x));

export const sampleAdapter = {
  async getStudents() {
    await delay();
    return clone(students);
  },

  async createStudent(payload) {
    await delay(600);
    if (students.some((s) => s.rollNo.toLowerCase() === payload.rollNo.toLowerCase())) {
      throw new ApiError(`Roll number ${payload.rollNo} already exists.`, 409);
    }
    const student = { studentId: nextStudentId++, ...payload };
    students.push(student);
    return clone(student);
  },

  async getAttendanceByDate(date) {
    await delay();
    return clone(attendance.filter((a) => a.attendanceDate === date));
  },

  async saveAttendance(date, records) {
    await delay(700);
    records.forEach(({ studentId, status }) => {
      const existing = attendance.find((a) => a.attendanceDate === date && a.studentId === studentId);
      if (existing) existing.status = status;
      else attendance.push({ attendanceId: nextAttendanceId++, studentId, attendanceDate: date, status });
    });
    return { date, saved: records.length };
  },

  async getAttendanceRange(from, to) {
    await delay();
    return clone(attendance.filter((a) => (!from || a.attendanceDate >= from) && (!to || a.attendanceDate <= to)));
  },

  async getDashboardSummary() {
    await delay();
    const dates = [...new Set(attendance.map((a) => a.attendanceDate))].sort();
    const today = toISODate(new Date());
    // If today has no records yet, show the latest recorded day.
    const refDate = dates.includes(today) ? today : dates[dates.length - 1];
    const dayRecords = attendance.filter((a) => a.attendanceDate === refDate);
    const present = dayRecords.filter((a) => a.status === 'Present').length;
    const absent = dayRecords.length - present;

    const trend = dates.slice(-14).map((d) => {
      const recs = attendance.filter((a) => a.attendanceDate === d);
      const p = recs.filter((a) => a.status === 'Present').length;
      return { date: d, present: p, absent: recs.length - p, percentage: recs.length ? Math.round((p / recs.length) * 100) : 0 };
    });

    const byId = Object.fromEntries(students.map((s) => [s.studentId, s]));
    const recent = [...attendance]
      .sort((a, b) => b.attendanceDate.localeCompare(a.attendanceDate) || b.attendanceId - a.attendanceId)
      .slice(0, 8)
      .map((a) => ({ ...a, student: byId[a.studentId] }));

    return {
      totalStudents: students.length,
      referenceDate: refDate,
      isToday: refDate === today,
      present,
      absent,
      percentage: dayRecords.length ? Math.round((present / dayRecords.length) * 1000) / 10 : 0,
      trend,
      recent: clone(recent),
    };
  },
};
