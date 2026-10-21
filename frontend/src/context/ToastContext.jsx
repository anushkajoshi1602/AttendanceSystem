import { createContext, useCallback, useContext, useState } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

const ToastContext = createContext(null);

const STYLES = {
  success: {
    icon: CheckCircle2,
    badgeCls: 'text-[#166534] bg-[#F0FDF4] border-[#BBF7D0]',
  },
  error: {
    icon: AlertCircle,
    badgeCls: 'text-[#991B1B] bg-[#FEF2F2] border-[#FECACA]',
  },
  info: {
    icon: Info,
    badgeCls: 'text-[#D95D24] bg-[#FDF3EE] border-[#F6D5C3]',
  },
};

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const dismiss = useCallback((id) => {
    setToasts((t) => t.filter((x) => x.id !== id));
  }, []);

  const push = useCallback(
    (type, title, message) => {
      const id = Math.random().toString(36).slice(2);
      setToasts((t) => [...t, { id, type, title, message }]);
      setTimeout(() => dismiss(id), 4500);
    },
    [dismiss]
  );

  const api = {
    success: (title, message) => push('success', title, message),
    error: (title, message) => push('error', title, message),
    info: (title, message) => push('info', title, message),
  };

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div
        className="pointer-events-none fixed right-4 bottom-4 z-[100] flex w-full max-w-sm flex-col gap-2.5"
        aria-live="polite"
      >
        {toasts.map((t) => {
          const item = STYLES[t.type] || STYLES.info;
          const Icon = item.icon;
          return (
            <div
              key={t.id}
              className="pointer-events-auto flex items-start gap-3 rounded-md border border-[#E7E2DA] bg-white p-3.5 shadow-md animate-fade-in"
              role="alert"
            >
              <span
                className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded border ${item.badgeCls}`}
              >
                <Icon size={14} strokeWidth={2} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-[#292723]">{t.title}</p>
                {t.message && (
                  <p className="mt-0.5 text-xs text-[#77736D] leading-relaxed">{t.message}</p>
                )}
              </div>
              <button
                onClick={() => dismiss(t.id)}
                className="flex h-5 w-5 items-center justify-center rounded text-[#77736D] hover:bg-[#F7F5F0] hover:text-[#292723]"
                aria-label="Dismiss notification"
              >
                <X size={14} strokeWidth={2} />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export const useToast = () => useContext(ToastContext);
