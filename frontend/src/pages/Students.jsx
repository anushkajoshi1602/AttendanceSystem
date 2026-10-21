import { useMemo, useState } from 'react';
import { Search, Plus, Users, Eye, SlidersHorizontal } from 'lucide-react';
import { getStudents, createStudent } from '../services/studentService.js';
import { getAttendanceRange } from '../services/attendanceService.js';
import { useAsync } from '../hooks/useAsync.js';
import { useToast } from '../context/ToastContext.jsx';
import { DEPARTMENTS, SEMESTERS } from '../constants.js';
import {
  Card,
  PageHeader,
  Button,
  Modal,
  Drawer,
  Field,
  Spinner,
  ErrorState,
  EmptyState,
  Badge,
  Avatar,
  StatusBadge,
  ProgressBar,
  SampleDataBanner,
  Skeleton,
} from '../components/ui/index.jsx';
import { USE_SAMPLE_DATA } from '../config/env.js';
import { formatDate } from '../utils/format.js';

const EMPTY = { rollNo: '', name: '', department: '', semester: '' };

function validate(f, existing) {
  const e = {};
  if (!f.rollNo.trim()) {
    e.rollNo = 'Roll number is required.';
  } else if (!/^[A-Za-z0-9-]{1,20}$/.test(f.rollNo.trim())) {
    e.rollNo = 'Must be 1–20 alphanumeric characters or hyphens.';
  } else if (
    existing.some((s) => s.rollNo.toLowerCase() === f.rollNo.trim().toLowerCase())
  ) {
    e.rollNo = 'This roll number already exists in the system.';
  }

  if (!f.name.trim()) {
    e.name = 'Full name is required.';
  } else if (f.name.trim().length < 2) {
    e.name = 'Name must be at least 2 characters.';
  } else if (!/^[A-Za-z .'-]+$/.test(f.name.trim())) {
    e.name = 'Only alphabetic letters, spaces, and . \' - are permitted.';
  }

  if (!f.department) e.department = 'Department selection is required.';
  if (!f.semester) e.semester = 'Semester selection is required.';
  return e;
}

function AddStudentModal({ open, onClose, onCreated, existing }) {
  const toast = useToast();
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const close = () => {
    setForm(EMPTY);
    setErrors({});
    onClose();
  };

  const set = (k) => (ev) => {
    setForm((f) => ({ ...f, [k]: ev.target.value }));
    if (errors[k]) setErrors((e) => ({ ...e, [k]: undefined }));
  };

  const submit = async (ev) => {
    ev.preventDefault();
    const e = validate(form, existing);
    setErrors(e);
    if (Object.keys(e).length) return;
    setSaving(true);
    try {
      const created = await createStudent({
        rollNo: form.rollNo.trim().toUpperCase(),
        name: form.name.trim(),
        department: form.department,
        semester: Number(form.semester),
      });
      toast.success(
        'Student registered',
        USE_SAMPLE_DATA
          ? `${created.name} added to the in-memory sample list (not saved to database).`
          : `${created.name} was successfully created in MySQL.`
      );
      onCreated(created);
      close();
    } catch (err) {
      toast.error('Could not add student', err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={close}
      title="Add new student"
      subtitle="Register an enrolled student into the attendance roster."
      footer={
        <>
          <Button variant="secondary" onClick={close} type="button">
            Cancel
          </Button>
          <Button
            form="add-student-form"
            type="submit"
            loading={saving}
            icon={Plus}
          >
            Add student
          </Button>
        </>
      }
    >
      <form
        id="add-student-form"
        onSubmit={submit}
        noValidate
        className="grid gap-3.5 sm:grid-cols-2"
      >
        <Field label="Roll number" error={errors.rollNo} htmlFor="rollNo">
          <input
            id="rollNo"
            className={`input ${errors.rollNo ? 'input-error' : ''}`}
            value={form.rollNo}
            onChange={set('rollNo')}
            placeholder="e.g. CS2024-001"
          />
        </Field>
        <Field label="Full name" error={errors.name} htmlFor="name">
          <input
            id="name"
            className={`input ${errors.name ? 'input-error' : ''}`}
            value={form.name}
            onChange={set('name')}
            placeholder="e.g. Aarav Sharma"
          />
        </Field>
        <Field label="Department" error={errors.department} htmlFor="department">
          <select
            id="department"
            className={`input ${errors.department ? 'input-error' : ''}`}
            value={form.department}
            onChange={set('department')}
          >
            <option value="">Select department</option>
            {DEPARTMENTS.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Semester" error={errors.semester} htmlFor="semester">
          <select
            id="semester"
            className={`input ${errors.semester ? 'input-error' : ''}`}
            value={form.semester}
            onChange={set('semester')}
          >
            <option value="">Select semester</option>
            {SEMESTERS.map((s) => (
              <option key={s} value={s}>
                Semester {s}
              </option>
            ))}
          </select>
        </Field>
      </form>
    </Modal>
  );
}

function StudentDetails({ student, onClose }) {
  const { data, loading, error, reload } = useAsync(
    () => (student ? getAttendanceRange() : Promise.resolve([])),
    [student?.studentId]
  );
  const records = useMemo(
    () =>
      (data || [])
        .filter((a) => a.studentId === student?.studentId)
        .sort((a, b) => b.attendanceDate.localeCompare(a.attendanceDate)),
    [data, student]
  );
  const present = records.filter((r) => r.status === 'Present').length;
  const pct = records.length
    ? Math.round((present / records.length) * 1000) / 10
    : 0;

  return (
    <Drawer open={!!student} onClose={onClose} title="Student Record">
      {student && (
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <Avatar name={student.name} size="lg" />
            <div>
              <p className="text-base font-semibold text-[#292723]">{student.name}</p>
              <p className="font-mono text-xs text-[#77736D]">{student.rollNo}</p>
            </div>
          </div>

          <div className="rounded-md border border-[#E7E2DA] bg-[#F7F5F0] p-3 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <span className="text-[#77736D]">Department</span>
                <p className="font-medium text-[#292723] mt-0.5">{student.department}</p>
              </div>
              <div>
                <span className="text-[#77736D]">Semester</span>
                <p className="font-medium text-[#292723] mt-0.5">Semester {student.semester}</p>
              </div>
              <div>
                <span className="text-[#77736D]">Student ID</span>
                <p className="font-mono font-medium text-[#292723] mt-0.5">#{student.studentId}</p>
              </div>
              <div>
                <span className="text-[#77736D]">Status</span>
                <p className="font-medium text-[#166534] mt-0.5">Active</p>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[#77736D] mb-2">
              Attendance Summary
            </h3>
            {loading ? (
              <Skeleton className="h-20 w-full" />
            ) : error ? (
              <ErrorState error={error} onRetry={reload} />
            ) : (
              <div className="rounded-md border border-[#E7E2DA] bg-white p-3.5 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#77736D]">Rate</span>
                  <span className="font-bold text-[#292723]">{pct}%</span>
                </div>
                <ProgressBar value={pct} />
                <div className="flex justify-between border-t border-[#E7E2DA] pt-2 text-xs text-[#77736D]">
                  <span>
                    <strong className="text-[#166534]">{present}</strong> present
                  </span>
                  <span>
                    <strong className="text-[#991B1B]">{records.length - present}</strong> absent
                  </span>
                  <span>
                    <strong className="text-[#292723]">{records.length}</strong> recorded
                  </span>
                </div>
              </div>
            )}
          </div>

          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[#77736D] mb-2">
              Recent Session Records
            </h3>
            {!records.length ? (
              <EmptyState title="No recorded attendance" />
            ) : (
              <ul className="divide-y divide-[#E7E2DA] rounded-md border border-[#E7E2DA] bg-white text-xs">
                {records.slice(0, 10).map((r) => (
                  <li
                    key={r.attendanceId}
                    className="flex items-center justify-between px-3 py-2.5"
                  >
                    <span className="text-[#59554F]">{formatDate(r.attendanceDate)}</span>
                    <StatusBadge status={r.status} />
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </Drawer>
  );
}

export default function Students() {
  const { data, loading, error, reload, setData } = useAsync(getStudents);
  const [query, setQuery] = useState('');
  const [dept, setDept] = useState('');
  const [sem, setSem] = useState('');
  const [adding, setAdding] = useState(false);
  const [selected, setSelected] = useState(null);

  const students = data || [];
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return students.filter(
      (s) =>
        (!q ||
          s.name.toLowerCase().includes(q) ||
          s.rollNo.toLowerCase().includes(q)) &&
        (!dept || s.department === dept) &&
        (!sem || String(s.semester) === sem)
    );
  }, [students, query, dept, sem]);

  const hasFilters = query || dept || sem;
  const clear = () => {
    setQuery('');
    setDept('');
    setSem('');
  };

  return (
    <div className="animate-fade-in space-y-6">
      <PageHeader
        title="Students"
        subtitle="Browse, search and manage enrolled students."
        actions={
          <Button
            icon={Plus}
            onClick={() => setAdding(true)}
            disabled={loading || !!error}
          >
            Add student
          </Button>
        }
      />

      <SampleDataBanner />

      <Card>
        <div className="flex flex-col gap-2.5 border-b border-[#E7E2DA] p-3.5 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search
              size={15}
              strokeWidth={1.8}
              className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-[#77736D]"
            />
            <input
              id="student-search"
              className="input pl-9 text-xs sm:text-sm"
              placeholder="Search by student name or roll number…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <select
              id="filter-dept"
              className="input text-xs sm:text-sm sm:w-48"
              value={dept}
              onChange={(e) => setDept(e.target.value)}
            >
              <option value="">All departments</option>
              {DEPARTMENTS.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
            <select
              id="filter-sem"
              className="input text-xs sm:text-sm sm:w-36"
              value={sem}
              onChange={(e) => setSem(e.target.value)}
            >
              <option value="">All semesters</option>
              {SEMESTERS.map((s) => (
                <option key={s} value={s}>
                  Semester {s}
                </option>
              ))}
            </select>
            {hasFilters && (
              <Button
                variant="ghost"
                className="!h-9 !px-2.5 !text-xs text-[#77736D]"
                onClick={clear}
              >
                Clear
              </Button>
            )}
          </div>
        </div>

        {loading ? (
          <Spinner label="Loading student directory…" />
        ) : error ? (
          <ErrorState error={error} onRetry={reload} />
        ) : !filtered.length ? (
          <EmptyState
            icon={hasFilters ? SlidersHorizontal : Users}
            title={hasFilters ? 'No students match your filter criteria' : 'No students found'}
            message={
              hasFilters
                ? 'Try modifying the search term or clearing the active filters.'
                : 'Add enrolled students to start managing attendance.'
            }
            action={
              hasFilters ? (
                <Button variant="secondary" onClick={clear}>
                  Reset filters
                </Button>
              ) : (
                <Button icon={Plus} onClick={() => setAdding(true)}>
                  Add student
                </Button>
              )
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="border-b border-[#E7E2DA] bg-[#F7F5F0] text-[11px] font-semibold uppercase tracking-wider text-[#77736D]">
                <tr>
                  <th className="px-4 py-2.5">Roll No</th>
                  <th className="px-4 py-2.5">Student Name</th>
                  <th className="hidden px-4 py-2.5 md:table-cell">Department</th>
                  <th className="px-4 py-2.5">Semester</th>
                  <th className="px-4 py-2.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E7E2DA]">
                {filtered.map((s) => (
                  <tr
                    key={s.studentId}
                    className="transition-colors hover:bg-[#FAF8F5]"
                  >
                    <td className="px-4 py-2.5 font-mono text-xs font-medium text-[#292723]">
                      {s.rollNo}
                    </td>
                    <td className="px-4 py-2.5">
                      <div className="flex items-center gap-2.5">
                        <Avatar name={s.name} size="sm" />
                        <div>
                          <p className="font-medium text-[#292723]">{s.name}</p>
                          <p className="text-[11px] text-[#77736D] md:hidden">{s.department}</p>
                        </div>
                      </div>
                    </td>
                    <td className="hidden px-4 py-2.5 text-[#59554F] md:table-cell">
                      {s.department}
                    </td>
                    <td className="px-4 py-2.5">
                      <Badge tone="slate">Sem {s.semester}</Badge>
                    </td>
                    <td className="px-4 py-2.5 text-right">
                      <Button
                        variant="ghost"
                        icon={Eye}
                        className="!h-7 !px-2.5 !text-xs font-normal text-[#59554F] hover:text-[#292723]"
                        onClick={() => setSelected(s)}
                      >
                        View
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="flex items-center justify-between border-t border-[#E7E2DA] bg-[#F7F5F0] px-4 py-2.5 text-xs text-[#77736D]">
              <span>
                Showing {filtered.length} of {students.length} students
              </span>
            </div>
          </div>
        )}
      </Card>

      <AddStudentModal
        open={adding}
        onClose={() => setAdding(false)}
        existing={students}
        onCreated={(s) => setData([...students, s])}
      />
      <StudentDetails student={selected} onClose={() => setSelected(null)} />
    </div>
  );
}
