import { USE_SAMPLE_DATA } from '../config/env.js';
import { request } from './apiClient.js';
import { sampleAdapter } from './sampleAdapter.js';

/** GET /students -> Student[] */
export function getStudents() {
  return USE_SAMPLE_DATA ? sampleAdapter.getStudents() : request('/students');
}

/** POST /students { rollNo, name, department, semester } -> Student */
export function createStudent(student) {
  return USE_SAMPLE_DATA ? sampleAdapter.createStudent(student) : request('/students', { method: 'POST', body: student });
}
