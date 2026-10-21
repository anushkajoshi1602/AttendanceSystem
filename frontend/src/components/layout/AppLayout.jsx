import { useState } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  ClipboardCheck,
  BarChart3,
  GraduationCap,
  Menu,
  X,
  Database,
  CalendarDays,
} from 'lucide-react';
import { USE_SAMPLE_DATA } from '../../config/env.js';

const NAV = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/students', label: 'Students', icon: Users },
  { to: '/attendance', label: 'Mark Attendance', icon: ClipboardCheck },
  { to: '/reports', label: 'Reports', icon: BarChart3 },
];

function Sidebar({ onNavigate }) {
  return (
    <div className="flex h-full flex-col border-r border-[#E7E2DA] bg-[#FFFFFF] text-[#292723]">
      <div className="flex items-center gap-2.5 border-b border-[#E7E2DA] px-5 py-4">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-[#922B24] text-white">
          <GraduationCap size={18} strokeWidth={2} />
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-bold tracking-tight text-[#292723]">AttendEase</p>
          <p className="truncate text-[11px] font-medium text-[#77736D]">College Administration</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-3">
        <p className="px-2 pb-1.5 text-[11px] font-semibold uppercase tracking-wider text-[#77736D]">
          Navigation
        </p>
        {NAV.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            onClick={onNavigate}
            className={({ isActive }) =>
              `relative flex items-center gap-2.5 rounded-md px-2.5 py-2 text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-[#FAF5F0] text-[#922B24] font-semibold'
                  : 'text-[#59554F] hover:bg-[#F7F5F0] hover:text-[#292723]'
              }`
            }
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <span
                    className="absolute inset-y-1 left-0 w-[3px] rounded-r bg-[#922B24]"
                    aria-hidden="true"
                  />
                )}
                <Icon
                  size={18}
                  strokeWidth={1.8}
                  className={`shrink-0 ${isActive ? 'text-[#922B24]' : 'text-[#77736D]'}`}
                />
                <span className="truncate">{label}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-[#E7E2DA] p-3">
        <div className="rounded-md border border-[#E7E2DA] bg-[#F7F5F0] p-2.5">
          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-[#59554F]">
            <Database size={13} strokeWidth={1.8} className="text-[#77736D]" />
            <span>Data Environment</span>
          </div>
          <div className="mt-1 flex items-center gap-1.5 text-[11px] text-[#77736D]">
            <span
              className={`h-1.5 w-1.5 rounded-full ${
                USE_SAMPLE_DATA ? 'bg-[#E8B949]' : 'bg-[#166534]'
              }`}
            />
            <span className="truncate">
              {USE_SAMPLE_DATA ? 'Preview data (in-memory)' : 'Live MySQL API connected'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

const TITLES = {
  '/': 'Dashboard',
  '/students': 'Students',
  '/attendance': 'Mark Attendance',
  '/reports': 'Reports',
};

export default function AppLayout() {
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();
  const today = new Date().toLocaleDateString('en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  return (
    <div className="min-h-screen bg-[#F7F5F0]">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-[230px] lg:block">
        <Sidebar />
      </aside>

      {open && (
        <div className="fixed inset-0 z-40 lg:hidden" role="dialog" aria-modal="true">
          <div
            className="fixed inset-0 bg-[#292723]/40 backdrop-blur-[1px]"
            onClick={() => setOpen(false)}
          />
          <aside className="relative h-full w-[230px] shadow-lg">
            <Sidebar onNavigate={() => setOpen(false)} />
            <button
              onClick={() => setOpen(false)}
              className="absolute top-3.5 -right-10 flex h-8 w-8 items-center justify-center rounded-md border border-[#E7E2DA] bg-white text-[#77736D] hover:text-[#292723]"
              aria-label="Close menu"
            >
              <X size={16} strokeWidth={2} />
            </button>
          </aside>
        </div>
      )}

      <div className="lg:pl-[230px]">
        <header className="sticky top-0 z-20 flex h-14 items-center justify-between border-b border-[#E7E2DA] bg-white px-4 sm:px-8">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setOpen(true)}
              className="flex h-8 w-8 items-center justify-center rounded-md border border-[#E7E2DA] text-[#59554F] hover:bg-[#F7F5F0] lg:hidden"
              aria-label="Open navigation menu"
            >
              <Menu size={18} strokeWidth={1.8} />
            </button>
            <h2 className="text-sm font-semibold tracking-tight text-[#292723]">
              {TITLES[pathname] || 'AttendEase'}
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 rounded-md border border-[#E7E2DA] bg-[#F7F5F0] px-2.5 py-1 text-xs font-medium text-[#59554F]">
              <CalendarDays size={13} strokeWidth={1.8} className="text-[#77736D]" />
              <span>{today}</span>
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-7xl px-4 py-6 sm:px-8 sm:py-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
