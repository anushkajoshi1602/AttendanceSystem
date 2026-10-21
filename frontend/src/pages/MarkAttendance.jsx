import { useEffect, useMemo, useState } from 'react';
import {
  Search,
  Save,
  CheckCheck,
  XCircle,
  RotateCcw,
  Users,
  CalendarDays,
  Check,
  X,
  Info,
} from 'lucide-react';
import { getStudents } from '../services/studentService.js';
import { getAttendanceByDate, saveAttendance } from '../services/attendanceService.js';
import { useAsync } from '../hooks/useAsync.js';
import { useToast } from '../context/ToastContext.jsx';
import { USE_SAMPLE_DATA } from '../config/env.js';
import { DEPARTMENTS } from '../constants.js';
import {
  Card,
  PageHeader,
  Button,
  Spinner,
  ErrorState,
  EmptyState,
  Avatar,
  SampleDataBanner,
} from '../components/ui/index.jsx';
import { todayISO, formatDate } from '../utils/format.js';

export default function MarkAttendance() {
  const toast = useToast();
  const [date, setDate] = useState(todayISO());
  const [query, setQuery] = useState('');
  const [dept, setDept] = useState('');
  const [marks, setMarks] = useState({}); // studentId -> 'Present' | 'Absent'
  const [saved, setSaved] = useState({});
  const [saving, setSaving] = useState(false);

  const studentsQ = useAsync(getStudents);
  const existingQ = useAsync(() => getAttendanceByDate(date), [date]);

  useEffect(() => {
    if (!existingQ.data) return;
    const m = Object.fromEntries(existingQ.data.map((a) => [a.studentId, a.status]));
    setMarks(m);
    setSaved(m);
  }, [existingQ.data]);

  const students = studentsQ.data || [];
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return students.filter(
      (s) =>
        (!q ||
          s.name.toLowerCase().includes(q) ||
          s.rollNo.toLowerCase().includes(q)) &&
        (!dept || s.department === dept)
    );
  }, [students, query, dept]);

  const present = students.filter((s) => marks[s.studentId] === 'Present').length;
  const absent = students.filter((s) => marks[s.studentId] === 'Absent').length;
  const unmarked = students.length - present - absent;
  const hasExistingRecords = Object.keys(saved).length > 0;
  const dirty = students.some((s) => marks[s.studentId] !== saved[s.studentId]);
  const isFuture = date > todayISO();

  const mark = (id, status) => {
    setMarks((m) => ({ ...m, [id]: status }));
  };

  const markAll = (status) => {
    setMarks((m) => ({
      ...m,
      ...Object.fromEntries(filtered.map((s) => [s.studentId, status])),
    }));
  };

  const save = async () => {
    if (isFuture) {
      return toast.error(
        'Invalid session date',
        'Attendance cannot be recorded for a future calendar date.'
      );
    }
    const records = students
      .filter((s) => marks[s.studentId])
      .map((s) => ({ studentId: s.studentId, status: marks[s.studentId] }));

    if (!records.length) {
      return toast.error(
        'Incomplete session',
        'Please mark at least one student before saving the attendance session.'
      );
    }

    setSaving(true);
    try {
      await saveAttendance(date, records);
      setSaved({ ...marks });
      toast.success(
        'Attendance recorded',
        USE_SAMPLE_DATA
          ? `${records.length} records for ${formatDate(date)} saved in-memory (preview mode).`
          : `${records.length} records saved to database for ${formatDate(date)}.`
      );
    } catch (err) {
      toast.error('Failed to save attendance', err.message);
    } finally {
      setSaving(false);
    }
  };

  const loading = studentsQ.loading || existingQ.loading;
  const error = studentsQ.error || existingQ.error;

  return (
    <div className="animate-fade-in space-y-6 pb-28">
      <PageHeader
        title="Mark Attendance"
        subtitle="Select a date and record student attendance for the session."
      />

      <SampleDataBanner />

      {/* Summary Counters: Uniform, clean white cards */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <Card className="flex items-center justify-between p-3.5 sm:p-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-[#77736D]">
              Present
            </p>
            <p className="mt-1 text-2xl font-bold text-[#166534]">
              {loading ? '–' : present}
            </p>
          </div>
          <span className="flex h-8 w-8 items-center justify-center rounded border border-[#BBF7D0] bg-[#F0FDF4] text-[#166534]">
            <Check size={16} strokeWidth={2.2} />
          </span>
        </Card>

        <Card className="flex items-center justify-between p-3.5 sm:p-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-[#77736D]">
              Absent
            </p>
            <p className="mt-1 text-2xl font-bold text-[#991B1B]">
              {loading ? '–' : absent}
            </p>
          </div>
          <span className="flex h-8 w-8 items-center justify-center rounded border border-[#FECACA] bg-[#FEF2F2] text-[#991B1B]">
            <X size={16} strokeWidth={2.2} />
          </span>
        </Card>

        <Card className="flex items-center justify-between p-3.5 sm:p-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-[#77736D]">
              Unmarked
            </p>
            <p className="mt-1 text-2xl font-bold text-[#59554F]">
              {loading ? '–' : unmarked}
            </p>
          </div>
          <span className="flex h-8 w-8 items-center justify-center rounded border border-[#E7E2DA] bg-[#F7F5F0] text-[#77736D]">
            <Users size={16} strokeWidth={1.8} />
          </span>
        </Card>
      </div>

      {/* Session notice if records already exist for the selected date */}
      {hasExistingRecords && !loading && (
        <div className="flex items-center gap-2 rounded-md border border-[#E7E2DA] bg-[#F7F5F0] px-3.5 py-2 text-xs text-[#59554F]">
          <Info size={14} className="shrink-0 text-[#77736D]" />
          <span>
            Existing attendance records found for <strong>{formatDate(date)}</strong>. Editing
            values and saving will update the existing records for this session.
          </span>
        </div>
      )}

      {/* Main Table and Control Bar */}
      <Card>
        {/* Controls: Date selection, search, department, bulk actions */}
        <div className="flex flex-col gap-2.5 border-b border-[#E7E2DA] p-3.5 lg:flex-row lg:items-center">
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <CalendarDays
                size={14}
                strokeWidth={1.8}
                className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-[#77736D]"
              />
              <input
                id="attendance-date"
                type="date"
                className="input pl-8 text-xs sm:text-sm lg:w-44"
                value={date}
                max={todayISO()}
                onChange={(e) => setDate(e.target.value || todayISO())}
              />
            </div>

            <select
              id="attendance-dept"
              className="input text-xs sm:text-sm lg:w-48"
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
          </div>

          <div className="relative flex-1">
            <Search
              size={14}
              strokeWidth={1.8}
              className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-[#77736D]"
            />
            <input
              id="attendance-search"
              className="input pl-8 text-xs sm:text-sm"
              placeholder="Search by student name or roll number…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              icon={CheckCheck}
              className="!h-9 !px-2.5 !text-xs font-normal"
              onClick={() => markAll('Present')}
              disabled={!filtered.length}
            >
              Mark all present
            </Button>
            <Button
              variant="secondary"
              icon={XCircle}
              className="!h-9 !px-2.5 !text-xs font-normal"
              onClick={() => markAll('Absent')}
              disabled={!filtered.length}
            >
              Mark all absent
            </Button>
          </div>
        </div>

        {/* Attendance List */}
        {loading ? (
          <Spinner label="Loading attendance roster…" />
        ) : error ? (
          <ErrorState
            error={error}
            onRetry={() => {
              studentsQ.reload();
              existingQ.reload();
            }}
          />
        ) : !filtered.length ? (
          <EmptyState
            icon={Users}
            title={students.length ? 'No matching students' : 'No students found'}
            message={
              students.length
                ? 'Try a different search query or select another department.'
                : 'Enrolled students must be added before recording attendance.'
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="border-b border-[#E7E2DA] bg-[#F7F5F0] text-[11px] font-semibold uppercase tracking-wider text-[#77736D]">
                <tr>
                  <th className="px-4 py-2.5">Roll No</th>
                  <th className="px-4 py-2.5">Student Name</th>
                  <th className="hidden px-4 py-2.5 md:table-cell">Department & Semester</th>
                  <th className="px-4 py-2.5 text-right">Attendance Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E7E2DA]">
                {filtered.map((s) => {
                  const st = marks[s.studentId];
                  const isPresent = st === 'Present';
                  const isAbsent = st === 'Absent';

                  return (
                    <tr
                      key={s.studentId}
                      className={`transition-colors ${
                        isPresent
                          ? 'bg-[#F0FDF4]/35'
                          : isAbsent
                            ? 'bg-[#FEF2F2]/35'
                            : 'hover:bg-[#FAF8F5]'
                      }`}
                    >
                      <td className="px-4 py-2.5 font-mono text-xs font-medium text-[#292723]">
                        {s.rollNo}
                      </td>
                      <td className="px-4 py-2.5">
                        <div className="flex items-center gap-2.5">
                          <Avatar name={s.name} size="sm" />
                          <div>
                            <p className="font-medium text-[#292723]">{s.name}</p>
                            <p className="text-[11px] text-[#77736D] md:hidden">
                              {s.department} · Sem {s.semester}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="hidden px-4 py-2.5 text-[#59554F] md:table-cell">
                        {s.department} · <span className="text-[#77736D]">Sem {s.semester}</span>
                      </td>
                      <td className="px-4 py-2.5 text-right">
                        {/* Clear, accessible, multi-signal Present / Absent controls */}
                        <div
                          className="inline-flex items-center gap-1.5"
                          role="radiogroup"
                          aria-label={`Attendance for ${s.name}`}
                        >
                          <button
                            type="button"
                            role="radio"
                            aria-checked={isPresent}
                            id={`present-${s.studentId}`}
                            onClick={() => mark(s.studentId, 'Present')}
                            className={`inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-medium transition-all ${
                              isPresent
                                ? 'border border-[#166534] bg-[#166534] text-white shadow-xs font-semibold'
                                : 'border border-[#E7E2DA] bg-white text-[#59554F] hover:border-[#BBF7D0] hover:bg-[#F0FDF4] hover:text-[#166534]'
                            }`}
                          >
                            <Check size={13} strokeWidth={isPresent ? 2.5 : 2} />
                            <span>Present</span>
                          </button>
                          <button
                            type="button"
                            role="radio"
                            aria-checked={isAbsent}
                            id={`absent-${s.studentId}`}
                            onClick={() => mark(s.studentId, 'Absent')}
                            className={`inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-medium transition-all ${
                              isAbsent
                                ? 'border border-[#991B1B] bg-[#991B1B] text-white shadow-xs font-semibold'
                                : 'border border-[#E7E2DA] bg-white text-[#59554F] hover:border-[#FECACA] hover:bg-[#FEF2F2] hover:text-[#991B1B]'
                            }`}
                          >
                            <X size={13} strokeWidth={isAbsent ? 2.5 : 2} />
                            <span>Absent</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Sticky Bottom Action Bar with Save feedback */}
      {!loading && !error && students.length > 0 && (
        <div className="fixed right-0 bottom-0 left-0 z-20 border-t border-[#E7E2DA] bg-white/95 px-4 py-3 backdrop-blur-xs lg:left-[230px]">
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 sm:px-4">
            <div className="flex items-center gap-2 text-xs">
              {dirty ? (
                <span className="flex items-center gap-1.5 font-semibold text-[#BF4F1C]">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#D95D24]" />
                  Unsaved session changes
                </span>
              ) : (
                <span className="flex items-center gap-1.5 text-[#166534]">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#166534]" />
                  Session synchronized
                </span>
              )}
              <span className="hidden text-[#77736D] sm:inline">·</span>
              <span className="hidden text-[#77736D] sm:inline">{formatDate(date)}</span>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="secondary"
                icon={RotateCcw}
                onClick={() => setMarks(saved)}
                disabled={!dirty || saving}
                className="!text-xs"
              >
                Reset
              </Button>
              <Button
                icon={Save}
                onClick={save}
                loading={saving}
                disabled={!dirty}
                className="!text-xs"
              >
                Save attendance
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
