import { useMemo, useState } from 'react';
import {
  Filter,
  Download,
  BarChart3,
  Search,
  TrendingUp,
  AlertTriangle,
  CalendarRange,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { getStudents } from '../services/studentService.js';
import { getAttendanceRange } from '../services/attendanceService.js';
import { useAsync } from '../hooks/useAsync.js';
import { useToast } from '../context/ToastContext.jsx';
import { DEPARTMENTS, deptCode } from '../constants.js';
import {
  Card,
  PageHeader,
  Button,
  Field,
  Spinner,
  ErrorState,
  EmptyState,
  Badge,
  Avatar,
  ProgressBar,
  SampleDataBanner,
  StatCard,
} from '../components/ui/index.jsx';
import { daysAgoISO, todayISO, formatDate } from '../utils/format.js';

const THRESHOLD = 75;

function BarTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="rounded border border-[#E7E2DA] bg-white px-3 py-2 text-xs shadow-sm">
      <p className="font-semibold text-[#292723]">{d.name || label}</p>
      <p className="mt-0.5 font-medium text-[#D95D24]">Attendance: {d.pct}%</p>
    </div>
  );
}

export default function Reports() {
  const toast = useToast();
  const [draft, setDraft] = useState({
    from: daysAgoISO(30),
    to: todayISO(),
    department: '',
  });
  const [filters, setFilters] = useState(draft);
  const [dateError, setDateError] = useState('');
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState('pct-asc');

  const studentsQ = useAsync(getStudents);
  const attQ = useAsync(
    () => getAttendanceRange(filters.from, filters.to),
    [filters.from, filters.to]
  );

  const apply = (e) => {
    e.preventDefault();
    if (!draft.from || !draft.to) {
      return setDateError('Both start and end dates are required.');
    }
    if (draft.from > draft.to) {
      return setDateError('Start date must be earlier than or equal to end date.');
    }
    setDateError('');
    setFilters(draft);
  };

  const rows = useMemo(() => {
    if (!studentsQ.data || !attQ.data) return [];
    const agg = {};
    attQ.data.forEach((a) => {
      agg[a.studentId] ??= { present: 0, total: 0 };
      agg[a.studentId].total++;
      if (a.status === 'Present') agg[a.studentId].present++;
    });

    return studentsQ.data
      .filter((s) => !filters.department || s.department === filters.department)
      .map((s) => {
        const { present = 0, total = 0 } = agg[s.studentId] || {};
        return {
          ...s,
          present,
          absent: total - present,
          total,
          pct: total ? Math.round((present / total) * 1000) / 10 : 0,
        };
      });
  }, [studentsQ.data, attQ.data, filters.department]);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = rows.filter(
      (r) =>
        !q ||
        r.name.toLowerCase().includes(q) ||
        r.rollNo.toLowerCase().includes(q)
    );
    const [key, dir] = sort.split('-');
    const f = key === 'pct' ? (r) => r.pct : (r) => r.name;
    return [...list].sort(
      (a, b) => (f(a) > f(b) ? 1 : f(a) < f(b) ? -1 : 0) * (dir === 'asc' ? 1 : -1)
    );
  }, [rows, query, sort]);

  const withData = rows.filter((r) => r.total);
  const avg = withData.length
    ? Math.round((withData.reduce((s, r) => s + r.pct, 0) / withData.length) * 10) / 10
    : 0;
  const low = withData.filter((r) => r.pct < THRESHOLD).length;
  const sessions = new Set((attQ.data || []).map((a) => a.attendanceDate)).size;

  const deptChart = useMemo(() => {
    const m = {};
    withData.forEach((r) => {
      m[r.department] ??= { p: 0, t: 0 };
      m[r.department].p += r.present;
      m[r.department].t += r.total;
    });
    return Object.entries(m).map(([d, v]) => ({
      dept: deptCode(d),
      name: d,
      pct: Math.round((v.p / v.t) * 100),
    }));
  }, [withData]);

  const exportCsv = () => {
    const header = [
      'Roll No',
      'Name',
      'Department',
      'Semester',
      'Present',
      'Absent',
      'Total',
      'Percentage',
    ];
    const lines = visible.map((r) =>
      [
        r.rollNo,
        r.name,
        r.department,
        r.semester,
        r.present,
        r.absent,
        r.total,
        r.pct,
      ]
        .map((v) => `"${v}"`)
        .join(',')
    );
    const blob = new Blob([[header.join(','), ...lines].join('\n')], {
      type: 'text/csv;charset=utf-8;',
    });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `attendance-report_${filters.from}_to_${filters.to}.csv`;
    a.click();
    URL.revokeObjectURL(a.href);
    toast.success('Report exported', `${visible.length} records downloaded as CSV.`);
  };

  const loading = studentsQ.loading || attQ.loading;
  const error = studentsQ.error || attQ.error;

  return (
    <div className="animate-fade-in space-y-6">
      <PageHeader
        title="Attendance Reports"
        subtitle={`Session analytics from ${formatDate(filters.from)} to ${formatDate(filters.to)}.`}
        actions={
          <Button
            variant="secondary"
            icon={Download}
            onClick={exportCsv}
            disabled={loading || !visible.length}
          >
            Export CSV
          </Button>
        }
      />

      <SampleDataBanner />

      {/* Date & Department Filter Card */}
      <Card className="p-4">
        <form
          onSubmit={apply}
          className="grid items-end gap-3 sm:grid-cols-2 lg:grid-cols-4"
        >
          <Field label="From" htmlFor="from">
            <input
              id="from"
              type="date"
              className={`input text-xs sm:text-sm ${dateError ? 'input-error' : ''}`}
              value={draft.from}
              max={todayISO()}
              onChange={(e) => setDraft({ ...draft, from: e.target.value })}
            />
          </Field>
          <Field label="To" htmlFor="to">
            <input
              id="to"
              type="date"
              className={`input text-xs sm:text-sm ${dateError ? 'input-error' : ''}`}
              value={draft.to}
              max={todayISO()}
              onChange={(e) => setDraft({ ...draft, to: e.target.value })}
            />
          </Field>
          <Field label="Department" htmlFor="report-dept">
            <select
              id="report-dept"
              className="input text-xs sm:text-sm"
              value={draft.department}
              onChange={(e) => setDraft({ ...draft, department: e.target.value })}
            >
              <option value="">All departments</option>
              {DEPARTMENTS.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </Field>
          <Button type="submit" icon={Filter} className="!h-9">
            Apply filters
          </Button>
        </form>
        {dateError && (
          <p className="mt-2 text-xs font-medium text-[#B91C1C]">{dateError}</p>
        )}
      </Card>

      {error ? (
        <Card>
          <ErrorState
            error={error}
            onRetry={() => {
              studentsQ.reload();
              attQ.reload();
            }}
          />
        </Card>
      ) : loading ? (
        <Card>
          <Spinner label="Compiling attendance reports…" />
        </Card>
      ) : (
        <>
          {/* Summary Metrics */}
          <div className="grid gap-4 sm:grid-cols-3">
            <StatCard
              label="Average Attendance"
              value={`${avg}%`}
              icon={TrendingUp}
              hint="Overall student average in range"
            />
            <StatCard
              label={`Below ${THRESHOLD}% Threshold`}
              value={low}
              icon={AlertTriangle}
              hint="Students requiring academic notice"
            />
            <StatCard
              label="Recorded Sessions"
              value={sessions}
              icon={CalendarRange}
              hint="Distinct teaching dates"
            />
          </div>

          {/* Department-wise Bar Chart: Restrained flat single color, subtle grid */}
          {deptChart.length > 0 && (
            <Card className="p-5">
              <div className="mb-4">
                <h2 className="text-sm font-semibold tracking-tight text-[#292723]">
                  Department-Wise Attendance
                </h2>
                <p className="text-xs text-[#77736D]">
                  Average attendance percentage across academic departments
                </p>
              </div>

              <div className="h-52 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={deptChart}
                    margin={{ top: 8, right: 10, left: -20, bottom: 0 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="#E7E2DA"
                      vertical={false}
                    />
                    <XAxis
                      dataKey="dept"
                      tick={{ fontSize: 11, fill: '#77736D' }}
                      axisLine={{ stroke: '#E7E2DA' }}
                      tickLine={false}
                    />
                    <YAxis
                      domain={[0, 100]}
                      unit="%"
                      tick={{ fontSize: 11, fill: '#77736D' }}
                      axisLine={{ stroke: '#E7E2DA' }}
                      tickLine={false}
                    />
                    <Tooltip content={<BarTooltip />} />
                    <Bar
                      dataKey="pct"
                      fill="#D95D24"
                      radius={[4, 4, 0, 0]}
                      maxBarSize={48}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>
          )}

          {/* Student Roster Report Table */}
          <Card>
            <div className="flex flex-col gap-2.5 border-b border-[#E7E2DA] p-3.5 sm:flex-row sm:items-center">
              <div className="relative flex-1">
                <Search
                  size={14}
                  strokeWidth={1.8}
                  className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-[#77736D]"
                />
                <input
                  id="report-search"
                  className="input pl-8 text-xs sm:text-sm"
                  placeholder="Filter report by student name or roll number…"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
              </div>
              <select
                id="report-sort"
                className="input text-xs sm:text-sm sm:w-56"
                value={sort}
                onChange={(e) => setSort(e.target.value)}
              >
                <option value="pct-asc">Attendance: lowest first</option>
                <option value="pct-desc">Attendance: highest first</option>
                <option value="name-asc">Student Name: A → Z</option>
                <option value="name-desc">Student Name: Z → A</option>
              </select>
            </div>

            {!visible.length ? (
              <EmptyState
                icon={BarChart3}
                title="No report records found"
                message="No students or attendance sessions match the selected query and range."
              />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs sm:text-sm">
                  <thead className="border-b border-[#E7E2DA] bg-[#F7F5F0] text-[11px] font-semibold uppercase tracking-wider text-[#77736D]">
                    <tr>
                      <th className="px-4 py-2.5">Roll No</th>
                      <th className="px-4 py-2.5">Student</th>
                      <th className="hidden px-4 py-2.5 md:table-cell">Department</th>
                      <th className="px-4 py-2.5 text-center">Present</th>
                      <th className="px-4 py-2.5 text-center">Absent</th>
                      <th className="hidden px-4 py-2.5 text-center sm:table-cell">Total</th>
                      <th className="min-w-44 px-4 py-2.5">Attendance Rate</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E7E2DA]">
                    {visible.map((r) => (
                      <tr
                        key={r.studentId}
                        className="transition-colors hover:bg-[#FAF8F5]"
                      >
                        <td className="px-4 py-2.5 font-mono text-xs font-medium text-[#292723]">
                          {r.rollNo}
                        </td>
                        <td className="px-4 py-2.5">
                          <div className="flex items-center gap-2.5">
                            <Avatar name={r.name} size="sm" />
                            <div>
                              <p className="font-medium text-[#292723]">{r.name}</p>
                              <p className="text-[11px] text-[#77736D] md:hidden">
                                {r.department}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="hidden px-4 py-2.5 text-[#59554F] md:table-cell">
                          {r.department}
                        </td>
                        <td className="px-4 py-2.5 text-center font-semibold text-[#166534]">
                          {r.present}
                        </td>
                        <td className="px-4 py-2.5 text-center font-semibold text-[#991B1B]">
                          {r.absent}
                        </td>
                        <td className="hidden px-4 py-2.5 text-center text-[#59554F] sm:table-cell">
                          {r.total}
                        </td>
                        <td className="px-4 py-2.5">
                          {r.total ? (
                            <div className="flex items-center gap-2.5">
                              <div className="w-24 sm:w-28">
                                <ProgressBar value={r.pct} />
                              </div>
                              <Badge
                                tone={
                                  r.pct >= 85
                                    ? 'green'
                                    : r.pct >= THRESHOLD
                                      ? 'amber'
                                      : 'red'
                                }
                              >
                                {r.pct}%
                              </Badge>
                            </div>
                          ) : (
                            <span className="text-[11px] text-[#77736D]">No sessions</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="flex items-center justify-between border-t border-[#E7E2DA] bg-[#F7F5F0] px-4 py-2.5 text-xs text-[#77736D]">
                  <span>Showing {visible.length} students</span>
                  <span>Threshold: {THRESHOLD}% minimum</span>
                </div>
              </div>
            )}
          </Card>
        </>
      )}
    </div>
  );
}
