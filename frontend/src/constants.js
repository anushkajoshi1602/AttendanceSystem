// App-wide constants (used by both sample and API modes).
export const DEPARTMENTS = ['Computer Science', 'Information Technology', 'Electronics', 'Mechanical', 'Civil'];
export const SEMESTERS = [1, 2, 3, 4, 5, 6, 7, 8];

const DEPT_CODES = {
  'Computer Science': 'CS',
  'Information Technology': 'IT',
  Electronics: 'EC',
  Mechanical: 'ME',
  Civil: 'CE',
};
export const deptCode = (d) => DEPT_CODES[d] || d?.slice(0, 2).toUpperCase();
