import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  UserCheck,
  UserX,
  Percent,
  ArrowRight,
  ClipboardCheck,
  TrendingUp,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { getDashboardSummary } from '../services/attendanceService.js';
import { useAsync } from '../hooks/useAsync.js';
import {
  Card,
  PageHeader,
  StatCard,
  Skeleton,
  ErrorState,
  EmptyState,
  StatusBadge,
  Avatar,
  Button,
  SampleDataBanner,
} from '../components/ui/index.jsx';
import { formatDate, shortDate } from '../utils/format.js';

function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="rounded border border-[#E7E2DA] bg-white px-3 py-2 text-xs shadow-sm">
      <p className="font-semibold text-[#292723]">{formatDate(label)}</p>
      <p className="mt-0.5 font-medium text-[#D95D24]">Rate: {d.percentage}%</p>
      <p className="text-[#77736D]">
        {d.present} present · {d.absent} absent
      </p>
    </div>
  );
}

export default function Dashboard() {
  const { data, loading, error, reload } = useAsync(getDashboardSummary);

  // Chronologically sort trend entries by date to guarantee proper progression
  const trendData = useMemo(() => {
    if (!data?.trend || !Array.isArray(data.trend)) return [];
    return [...data.trend].sort((a, b) => a.date.localeCompare(b.date));
  }, [data?.trend]);

  return (
    <div className="animate-fade-in space-y-6">
      {/* Editorial Dashboard Header */}
      <PageHeader
        title="Dashboard"
        subtitle="Attendance overview"
        actions={
          <Link to="/attendance">
            <Button icon={ClipboardCheck}>Mark attendance</Button>
          </Link>
        }
      />

      <SampleDataBanner />

      {error ? (
        <Card>
          <ErrorState error={error} onRetry={reload} />
        </Card>
      ) : (
        <>
          {/* Summary Metrics: Compact, equal-height, uniform white cards */}
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {loading ? (
              [0, 1, 2, 3].map((i) => (
                <Card key={i} className="p-4 sm:p-5">
                  <Skeleton className="h-3.5 w-24" />
                  <Skeleton className="mt-3 h-8 w-16" />
                  <Skeleton className="mt-2 h-3 w-32" />
                </Card>
              ))
            ) : (
              <>
                <StatCard
                  label="Total Students"
                  value={data.totalStudents}
                  icon={Users}
                  hint="Enrolled across departments"
                />
                <StatCard
                  label={data.isToday ? 'Present Today' : 'Present (last recorded)'}
                  value={data.present}
                  icon={UserCheck}
                  hint={data.isToday ? 'Recorded today' : formatDate(data.referenceDate)}
                />
                <StatCard
                  label={data.isToday ? 'Absent Today' : 'Absent (last recorded)'}
                  value={data.absent}
                  icon={UserX}
                  hint={data.isToday ? 'Recorded today' : formatDate(data.referenceDate)}
                />
                <StatCard
                  label="Attendance Rate"
                  value={`${Number(data.percentage).toFixed(1).replace(/\.0$/, '')}%`}
                  icon={Percent}
                  hint={data.isToday ? 'Overall daily rate' : 'Last recorded session'}
                />
              </>
            )}
          </div>

          {/* Main Content: Attendance Trend and Recent Activity cleanly aligned */}
          <div className="grid gap-6 xl:grid-cols-3">
            {/* Chart Panel: Handles empty, single-point, and multi-point historical data gracefully */}
            <Card className="p-5 xl:col-span-2">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-semibold tracking-tight text-[#292723]">
                    Attendance Trend
                  </h2>
                  <p className="text-xs text-[#77736D]">
                    Daily attendance percentage over recent sessions
                  </p>
                </div>
                {trendData.length >= 2 && (
                  <span className="text-xs text-[#77736D]">
                    {trendData.length} sessions tracked
                  </span>
                )}
              </div>

              {loading ? (
                <Skeleton className="h-64 w-full" />
              ) : !trendData.length ? (
                /* State 1: 0 recorded sessions */
                <EmptyState
                  icon={TrendingUp}
                  title="No attendance recorded yet"
                  message="Trend data will appear once attendance is recorded and saved."
                  action={
                    <Link to="/attendance">
                      <Button icon={ClipboardCheck} className="!py-1.5 !text-xs">
                        Mark attendance
                      </Button>
                    </Link>
                  }
                />
              ) : trendData.length === 1 ? (
                /* State 2: Exactly 1 session recorded — cannot draw a trend line across a single point */
                <div className="flex h-64 flex-col items-center justify-center rounded-md border border-dashed border-[#E7E2DA] bg-[#F7F5F0]/60 p-6 text-center">
                  <div className="mb-2.5 flex h-9 w-9 items-center justify-center rounded-md border border-[#E7E2DA] bg-white text-[#D95D24]">
                    <TrendingUp size={18} strokeWidth={1.8} />
                  </div>
                  <p className="text-sm font-semibold text-[#292723]">
                    More attendance history needed
                  </p>
                  <p className="mt-1 max-w-sm text-xs text-[#77736D]">
                    Only 1 session is recorded so far. At least 2 distinct session dates are required to calculate a daily trend.
                  </p>

                  <div className="mt-4 flex flex-wrap items-center justify-center gap-2 rounded-md border border-[#E7E2DA] bg-white px-3.5 py-2 text-xs shadow-2xs">
                    <span className="font-semibold text-[#292723]">{formatDate(trendData[0].date)}</span>
                    <span className="text-[#77736D]">·</span>
                    <span className="font-medium text-[#166534]">{trendData[0].percentage}% attendance</span>
                    <span className="text-[#77736D]">·</span>
                    <span className="text-[#77736D]">{trendData[0].present} present, {trendData[0].absent} absent</span>
                  </div>

                  <Link to="/attendance" className="mt-4">
                    <Button variant="secondary" icon={ClipboardCheck} className="!h-8 !px-3 !text-xs">
                      Mark another session
                    </Button>
                  </Link>
                </div>
              ) : (
                /* State 3: 2 or more sessions — full trend area chart with clear points */
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={trendData}
                      margin={{ top: 8, right: 10, left: -20, bottom: 0 }}
                    >
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="#E7E2DA"
                        vertical={false}
                      />
                      <XAxis
                        dataKey="date"
                        tickFormatter={shortDate}
                        tick={{ fontSize: 11, fill: '#77736D' }}
                        axisLine={{ stroke: '#E7E2DA' }}
                        tickLine={false}
                      />
                      <YAxis
                        domain={[0, 100]}
                        ticks={[0, 25, 50, 75, 100]}
                        tick={{ fontSize: 11, fill: '#77736D' }}
                        axisLine={{ stroke: '#E7E2DA' }}
                        tickLine={false}
                        unit="%"
                      />
                      <Tooltip content={<ChartTooltip />} />
                      <Area
                        type="monotone"
                        dataKey="percentage"
                        stroke="#D95D24"
                        strokeWidth={2}
                        fill="rgba(217, 93, 36, 0.05)"
                        dot={{ r: 3.5, fill: '#D95D24', stroke: '#FFFFFF', strokeWidth: 1.5 }}
                        activeDot={{ r: 5, fill: '#D95D24', stroke: '#FFFFFF', strokeWidth: 2 }}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              )}
            </Card>

            {/* Recent Activity: Compact, clean list */}
            <Card className="flex flex-col p-5">
              <div className="mb-3 flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-semibold tracking-tight text-[#292723]">
                    Recent Activity
                  </h2>
                  <p className="text-xs text-[#77736D]">Latest attendance entries</p>
                </div>
                <Link
                  to="/reports"
                  className="flex items-center gap-1 text-xs font-medium text-[#D95D24] hover:text-[#BF4F1C]"
                >
                  Reports <ArrowRight size={13} strokeWidth={2} />
                </Link>
              </div>

              {loading ? (
                <div className="space-y-3 pt-2">
                  {[0, 1, 2, 3, 4].map((i) => (
                    <Skeleton key={i} className="h-10 w-full" />
                  ))}
                </div>
              ) : !data.recent.length ? (
                <EmptyState title="No recent activity" />
              ) : (
                <ul className="divide-y divide-[#E7E2DA]">
                  {data.recent.map((r) => (
                    <li
                      key={r.attendanceId}
                      className="flex items-center justify-between gap-3 py-2.5 transition-colors hover:bg-[#F7F5F0]"
                    >
                      <div className="flex min-w-0 items-center gap-2.5">
                        <Avatar name={r.student?.name || '?'} size="sm" />
                        <div className="min-w-0">
                          <p className="truncate text-xs font-semibold text-[#292723]">
                            {r.student?.name || `Student #${r.studentId}`}
                          </p>
                          <p className="truncate font-mono text-[11px] text-[#77736D]">
                            {r.student?.rollNo} · {formatDate(r.attendanceDate)}
                          </p>
                        </div>
                      </div>
                      <StatusBadge status={r.status} />
                    </li>
                  ))}
                </ul>
              )}
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
