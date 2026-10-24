import { ShieldAlert, ShieldCheck, Check, X, AlertTriangle } from 'lucide-react';
import { useBank } from '@/context/BankContext';
import { fmtMoney } from '@/lib/format';
import { Modal } from '@/components/Modal';
import { useState } from 'react';

export function SecurityView() {
  const { state, dismissAlert } = useBank();
  const [activeId, setActiveId] = useState<string | null>(null);
  const [dismissing, setDismissing] = useState<string | null>(null);

  const active = state.alerts.find((a) => a.id === activeId);
  const dismissingAlert = state.alerts.find((a) => a.id === dismissing);

  const openAlerts = state.alerts.filter((a) => !a.dismissed);
  const resolvedAlerts = state.alerts.filter((a) => a.acknowledged);

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="font-display text-2xl font-extrabold text-ink-900 dark:text-ink-100">
          Security center
        </h1>
        <p className="mt-1 text-sm text-ink-500 dark:text-ink-400">
          Monitor account holds, card status, and suspicious activity.
        </p>
      </div>

      {/* Info banner */}
      <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-amber-900 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-300">
        <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600 dark:text-amber-400" />
        <p className="text-sm font-semibold">
          Your account has been put on hold. Please contact the bank.
        </p>
      </div>

      {/* Open alerts */}
      <section>
        <h2 className="mb-3 font-display text-lg font-bold text-ink-900 dark:text-ink-100">Active alerts</h2>
        {openAlerts.length === 0 ? (
          <div className="card flex flex-col items-center justify-center px-6 py-12 text-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
              <ShieldCheck className="h-7 w-7" />
            </span>
            <p className="mt-4 text-sm font-semibold text-ink-700 dark:text-ink-200">All clear</p>
            <p className="mt-1 text-sm text-ink-400 dark:text-ink-500">
              No active security alerts. Your virtual cards and accounts are secure.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {openAlerts.map((a) => (
              <button
                key={a.id}
                onClick={() => setActiveId(a.id)}
                className="card group flex w-full items-center gap-4 p-5 text-left transition hover:shadow-glow cursor-pointer"
              >
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-600 dark:bg-amber-950/70 dark:text-amber-400">
                  <ShieldAlert className="h-6 w-6" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-bold text-ink-900 dark:text-ink-100">{a.title}</p>
                    <span className="pill bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300">
                      Hold active
                    </span>
                  </div>
                  <p className="mt-1 line-clamp-2 text-sm text-ink-500 dark:text-ink-400">{a.detail}</p>
                  <p className="mt-1 text-xs text-ink-400 dark:text-ink-500">{a.time}</p>
                </div>
                <span className="hidden text-sm font-semibold text-brand-600 group-hover:underline dark:text-brand-400 sm:block">
                  Review →
                </span>
              </button>
            ))}
          </div>
        )}
      </section>

      {/* Resolved */}
      {resolvedAlerts.length > 0 && (
        <section>
          <h2 className="mb-3 font-display text-lg font-bold text-ink-900 dark:text-ink-100">Resolved</h2>
          <div className="space-y-3">
            {resolvedAlerts.map((a) => (
              <div key={a.id} className="card flex items-center gap-4 p-4 opacity-80">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
                  <Check className="h-5 w-5" />
                </span>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-ink-700 dark:text-ink-200">{a.title}</p>
                  <p className="text-xs text-ink-400 dark:text-ink-500">Acknowledged · {a.time}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Alert detail modal */}
      <Modal
        open={!!active}
        onClose={() => setActiveId(null)}
        title="Suspicious activity review"
        icon={
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-amber-100 text-amber-600 dark:bg-amber-950/70 dark:text-amber-400">
            <ShieldAlert className="h-5 w-5" />
          </span>
        }
        size="lg"
        footer={
          <button
            className="btn-outline cursor-pointer"
            onClick={() => {
              setDismissing(active!.id);
              setActiveId(null);
            }}
          >
            Dismiss
          </button>
        }
      >
        {active && (
          <div className="space-y-4">
            <div className="flex items-start gap-3 rounded-xl bg-amber-50 p-3.5 text-sm text-amber-900 ring-1 ring-amber-200 dark:bg-amber-950/50 dark:text-amber-200 dark:ring-amber-900/60">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
              <p className="font-semibold">
                Your account has been put on hold. Please contact the bank.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Merchant" value={active.merchant} />
              <Field label="Location" value={active.location} />
              <Field label="Amount" value={fmtMoney(active.amount)} />
              <Field label="Detected" value={active.time} />
            </div>

            <div>
              <p className="label">What happened</p>
              <p className="text-sm text-ink-600 dark:text-ink-300">{active.detail}</p>
            </div>
          </div>
        )}
      </Modal>

      {/* Dismiss confirm */}
      <Modal
        open={!!dismissingAlert}
        onClose={() => setDismissing(null)}
        title="Dismiss alert?"
        size="sm"
        icon={
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-ink-100 text-ink-600 dark:bg-ink-800 dark:text-ink-300">
            <X className="h-5 w-5" />
          </span>
        }
        footer={
          <>
            <button className="btn-ghost" onClick={() => setDismissing(null)}>
              Keep
            </button>
            <button
              className="btn-outline cursor-pointer"
              onClick={() => {
                if (dismissingAlert) dismissAlert(dismissingAlert.id);
                setDismissing(null);
              }}
            >
              Dismiss
            </button>
          </>
        }
      >
        {dismissingAlert && (
          <p className="text-sm text-ink-600 dark:text-ink-300">
            The hold will remain in place but the alert will be hidden from your active list.
          </p>
        )}
      </Modal>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-ink-200 bg-white p-3 dark:border-ink-800 dark:bg-ink-800/60">
      <p className="text-xs font-semibold uppercase tracking-wide text-ink-500 dark:text-ink-400">{label}</p>
      <p className="mt-0.5 text-sm font-semibold text-ink-800 dark:text-ink-100">{value}</p>
    </div>
  );
}
