import { CheckCircle2, Info, AlertTriangle, XCircle, X } from 'lucide-react';
import { useBank } from '@/context/BankContext';

export function ToastContainer() {
  const { toasts, removeToast } = useBank();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none px-4 sm:px-0">
      {toasts.map((toast) => {
        const isSuccess = toast.type === 'success';
        const isWarning = toast.type === 'warning';
        const isError = toast.type === 'error';

        const Icon = isSuccess
          ? CheckCircle2
          : isWarning
            ? AlertTriangle
            : isError
              ? XCircle
              : Info;

        const borderClass = isSuccess
          ? 'border-emerald-500/30 bg-emerald-50/95 text-emerald-950 dark:border-emerald-500/40 dark:bg-emerald-950/90 dark:text-emerald-100'
          : isWarning
            ? 'border-amber-500/30 bg-amber-50/95 text-amber-950 dark:border-amber-500/40 dark:bg-amber-950/90 dark:text-amber-100'
            : isError
              ? 'border-rose-500/30 bg-rose-50/95 text-rose-950 dark:border-rose-500/40 dark:bg-rose-950/90 dark:text-rose-100'
              : 'border-brand-500/30 bg-brand-50/95 text-brand-950 dark:border-brand-500/40 dark:bg-brand-950/90 dark:text-brand-100';

        const iconColor = isSuccess
          ? 'text-emerald-600 dark:text-emerald-400'
          : isWarning
            ? 'text-amber-600 dark:text-amber-400'
            : isError
              ? 'text-rose-600 dark:text-rose-400'
              : 'text-brand-600 dark:text-brand-400';

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 rounded-2xl border p-4 shadow-xl backdrop-blur-md transition-all duration-300 animate-fade-in ${borderClass}`}
          >
            <Icon className={`h-5 w-5 shrink-0 mt-0.5 ${iconColor}`} />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold leading-tight">{toast.title}</p>
              {toast.message && (
                <p className="mt-1 text-xs opacity-85 leading-relaxed">{toast.message}</p>
              )}
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-ink-400 hover:text-ink-700 dark:hover:text-ink-200 transition p-0.5 rounded-lg"
              aria-label="Dismiss notification"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
