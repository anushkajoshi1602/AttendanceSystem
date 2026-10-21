import { Loader2, Inbox, AlertCircle, RefreshCw, X, Database } from 'lucide-react';
import { useEffect } from 'react';
import { USE_SAMPLE_DATA, API_BASE_URL } from '../../config/env.js';

const BTN_VARIANTS = {
  primary:
    'bg-[#D95D24] text-white hover:bg-[#BF4F1C] active:bg-[#A84214] border border-transparent shadow-xs',
  secondary:
    'bg-white text-[#292723] border border-[#E7E2DA] hover:bg-[#F7F5F0] hover:border-[#D3CDC4] active:bg-[#EFECE6] shadow-xs',
  ghost:
    'bg-transparent text-[#59554F] hover:bg-[#F0EDE6] hover:text-[#292723]',
  danger:
    'bg-[#B91C1C] text-white hover:bg-[#991B1B] active:bg-[#7F1D1D] border border-transparent shadow-xs',
};

export function Button({
  variant = 'primary',
  loading,
  icon: Icon,
  children,
  className = '',
  disabled,
  ...props
}) {
  return (
    <button
      {...props}
      disabled={loading || disabled}
      className={`inline-flex items-center justify-center gap-2 rounded-md px-3.5 py-2 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[#D95D24] disabled:cursor-not-allowed disabled:opacity-50 ${BTN_VARIANTS[variant] || BTN_VARIANTS.primary} ${className}`}
    >
      {loading ? (
        <Loader2 size={16} strokeWidth={2} className="animate-spin" />
      ) : (
        Icon && <Icon size={16} strokeWidth={1.8} />
      )}
      {children}
    </button>
  );
}

export function Card({ className = '', children, ...props }) {
  return (
    <div className={`card ${className}`} {...props}>
      {children}
    </div>
  );
}

export function PageHeader({ title, subtitle, actions }) {
  return (
    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-[#292723]">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-[#77736D]">{subtitle}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2.5">{actions}</div>}
    </div>
  );
}

const TONES = {
  green: 'bg-[#F0FDF4] text-[#166534] border-[#BBF7D0]',
  red: 'bg-[#FEF2F2] text-[#991B1B] border-[#FECACA]',
  orange: 'bg-[#FDF3EE] text-[#BF4F1C] border-[#F6D5C3]',
  amber: 'bg-[#FFFBEB] text-[#92400E] border-[#FDE68A]',
  slate: 'bg-[#F7F5F0] text-[#59554F] border-[#E7E2DA]',
};

export function Badge({ tone = 'slate', children, className = '' }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded border px-2 py-0.5 text-xs font-medium tracking-tight ${TONES[tone] || TONES.slate} ${className}`}
    >
      {children}
    </span>
  );
}

export function StatusBadge({ status }) {
  const isPresent = status === 'Present';
  return (
    <Badge tone={isPresent ? 'green' : 'red'}>
      <span
        className={`h-1.5 w-1.5 rounded-full ${
          isPresent ? 'bg-[#166534]' : 'bg-[#991B1B]'
        }`}
      />
      {status}
    </Badge>
  );
}

export function StatCard({ label, value, icon: Icon, hint }) {
  return (
    <Card className="flex flex-col justify-between p-4 sm:p-5 transition-colors hover:border-[#D3CDC4]">
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-semibold uppercase tracking-wider text-[#77736D]">{label}</p>
        {Icon && (
          <span className="flex h-7 w-7 items-center justify-center rounded text-[#77736D]">
            <Icon size={16} strokeWidth={1.8} />
          </span>
        )}
      </div>
      <div className="mt-3">
        <p className="text-2xl font-bold tracking-tight text-[#292723] sm:text-3xl">{value}</p>
        {hint && <p className="mt-1 text-xs text-[#77736D]">{hint}</p>}
      </div>
    </Card>
  );
}

export function Spinner({ label = 'Loading…' }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2.5 py-14 text-[#77736D]">
      <Loader2 size={24} strokeWidth={2} className="animate-spin text-[#D95D24]" />
      <p className="text-xs font-medium">{label}</p>
    </div>
  );
}

export function Skeleton({ className = '' }) {
  return <div className={`animate-pulse rounded bg-[#EFECE6] ${className}`} />;
}

export function EmptyState({ icon: Icon = Inbox, title, message, action }) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-12 text-center">
      <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-md border border-[#E7E2DA] bg-[#F7F5F0] text-[#77736D]">
        <Icon size={20} strokeWidth={1.8} />
      </div>
      <p className="text-sm font-semibold text-[#292723]">{title}</p>
      {message && <p className="mt-1 max-w-sm text-xs text-[#77736D]">{message}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export function ErrorState({ error, onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-12 text-center">
      <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-md border border-[#FECACA] bg-[#FEF2F2] text-[#991B1B]">
        <AlertCircle size={20} strokeWidth={1.8} />
      </div>
      <p className="text-sm font-semibold text-[#292723]">Unable to load data</p>
      <p className="mt-1 max-w-md text-xs text-[#77736D]">
        {error?.message || 'An unexpected error occurred while communicating with the service.'}
      </p>
      {onRetry && (
        <Button
          variant="secondary"
          icon={RefreshCw}
          className="mt-4 !py-1.5 !text-xs"
          onClick={onRetry}
        >
          Try again
        </Button>
      )}
    </div>
  );
}

export function Field({ label, error, children, htmlFor }) {
  return (
    <div>
      <label htmlFor={htmlFor} className="label">
        {label}
      </label>
      {children}
      {error && <p className="mt-1 text-xs font-medium text-[#B91C1C]">{error}</p>}
    </div>
  );
}

export function Modal({ open, onClose, title, subtitle, children, footer }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true">
      <div
        className="fixed inset-0 bg-[#292723]/40 backdrop-blur-[1px]"
        onClick={onClose}
      />
      <div className="card relative w-full max-w-lg shadow-lg animate-scale-in">
        <div className="flex items-start justify-between border-b border-[#E7E2DA] px-6 py-4">
          <div>
            <h2 className="text-base font-semibold text-[#292723]">{title}</h2>
            {subtitle && <p className="mt-0.5 text-xs text-[#77736D]">{subtitle}</p>}
          </div>
          <button
            onClick={onClose}
            className="flex h-7 w-7 items-center justify-center rounded text-[#77736D] hover:bg-[#F7F5F0] hover:text-[#292723]"
            aria-label="Close dialog"
          >
            <X size={16} strokeWidth={2} />
          </button>
        </div>
        <div className="px-6 py-5">{children}</div>
        {footer && (
          <div className="flex justify-end gap-2.5 border-t border-[#E7E2DA] bg-[#F7F5F0] px-6 py-3 rounded-b-lg">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

export function Drawer({ open, onClose, title, children }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50" role="dialog" aria-modal="true">
      <div
        className="fixed inset-0 bg-[#292723]/40 backdrop-blur-[1px]"
        onClick={onClose}
      />
      <aside className="absolute top-0 right-0 flex h-full w-full max-w-md flex-col border-l border-[#E7E2DA] bg-white shadow-xl animate-fade-in">
        <div className="flex items-center justify-between border-b border-[#E7E2DA] px-6 py-4">
          <h2 className="text-base font-semibold text-[#292723]">{title}</h2>
          <button
            onClick={onClose}
            className="flex h-7 w-7 items-center justify-center rounded text-[#77736D] hover:bg-[#F7F5F0] hover:text-[#292723]"
            aria-label="Close panel"
          >
            <X size={16} strokeWidth={2} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-6">{children}</div>
      </aside>
    </div>
  );
}

export function SampleDataBanner() {
  if (USE_SAMPLE_DATA) {
    return (
      <div className="mb-5 flex flex-wrap items-center justify-between gap-2 rounded-md border border-[#E7E2DA] bg-[#F7F5F0] px-3.5 py-2 text-xs text-[#59554F]">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 rounded bg-[#EFECE6] px-1.5 py-0.5 text-[11px] font-semibold text-[#292723]">
            <Database size={11} strokeWidth={1.8} className="text-[#D95D24]" />
            Preview data
          </span>
          <span>
            Operating in sample mode. Changes are held in browser session memory and{' '}
            <strong className="font-semibold text-[#292723]">not saved to the database</strong>.
          </span>
        </div>
        <span className="hidden font-mono text-[11px] text-[#77736D] sm:inline">
          Backend API: {API_BASE_URL}
        </span>
      </div>
    );
  }

  return (
    <div className="mb-5 flex items-center justify-between rounded-md border border-[#BBF7D0] bg-[#F0FDF4] px-3.5 py-2 text-xs text-[#166534]">
      <div className="flex items-center gap-2">
        <span className="h-1.5 w-1.5 rounded-full bg-[#166534]" />
        <span className="font-medium">Connected to live backend. Records are persisted to MySQL database.</span>
      </div>
      <span className="font-mono text-[11px] text-[#166534] opacity-80">{API_BASE_URL}</span>
    </div>
  );
}

export function Avatar({ name, size = 'md' }) {
  const initials = (name || '?')
    .split(' ')
    .filter(Boolean)
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  const sz =
    size === 'lg'
      ? 'h-11 w-11 text-sm'
      : size === 'sm'
        ? 'h-7 w-7 text-xs'
        : 'h-8 w-8 text-xs';

  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center rounded-md border border-[#E0DBD2] bg-[#EFECE6] font-semibold text-[#292723] ${sz}`}
    >
      {initials}
    </span>
  );
}

export function ProgressBar({ value }) {
  const pct = Math.min(100, Math.max(0, value));
  const color =
    pct >= 85 ? 'bg-[#166534]' : pct >= 75 ? 'bg-[#B45309]' : 'bg-[#991B1B]';

  return (
    <div className="h-1.5 w-full overflow-hidden rounded-full bg-[#E7E2DA]">
      <div
        className={`h-full rounded-full transition-all duration-300 ${color}`}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}
