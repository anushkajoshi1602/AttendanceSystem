import { USE_SAMPLE_DATA } from '../config/env.js';
import { request } from './apiClient.js';
import { sampleAdapter } from './sampleAdapter.js';

/** GET /attendance?date=YYYY-MM-DD -> Attendance[] */
export function getAttendanceByDate(date) {
  return USE_SAMPLE_DATA ? sampleAdapter.getAttendanceByDate(date) : request('/attendance', { params: { date } });
}

/** POST /attendance { date, records: [{ studentId, status }] } */
export function saveAttendance(date, records) {
  return USE_SAMPLE_DATA
    ? sampleAdapter.saveAttendance(date, records)
    : request('/attendance', { method: 'POST', body: { date, records } });
}

/** GET /attendance/range?from=&to= -> Attendance[] */
export function getAttendanceRange(from, to) {
  return USE_SAMPLE_DATA
    ? sampleAdapter.getAttendanceRange(from, to)
    : request('/attendance/range', { params: { from, to } });
}

/** GET /dashboard/summary */
export function getDashboardSummary() {
  return USE_SAMPLE_DATA ? sampleAdapter.getDashboardSummary() : request('/dashboard/summary');
}
