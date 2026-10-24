import { ShieldAlert, ShieldCheck, Check, X, Lock, Info, AlertTriangle } from 'lucide-react';
import { useBank } from '@/context/BankContext';
import { fmtMoney } from '@/lib/format';
import { Modal } from '@/components/Modal';
import { useState } from 'react';

export function SecurityView() {
  const { state, acknowledgeAlert, dismissAlert } = useBank();
  const [activeId, setActiveId] = useState<string | null>(null);
  const [dismissing, setDismissing] = useState<string | null>(null);

  const active = state.alerts.find((a) => a.id === activeId);
  const dismissingAlert = state.alerts.find((a) => a.id === dismissing);

  const openAlerts = state.alerts.filter((a) => !a.dismissed);
  const resolvedAlerts = state.alerts.filter((a) => a.acknowledged);

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="font-display text-2xl font-extrabold text-ink-900">Security center</h1>
        <p className="mt-1 text-sm text-ink-500">
          Monitor account holds and suspicious activity across your accounts.
        </p>
      </div>

      {/* Info banner */}
      <div className="flex items-start gap-3 rounded-2xl border border-brand-200 bg-brand-50 px-4 py-3 text-brand-800">
        <Info className="mt-0.5 h-5 w-5 shrink-0" />
        <p className="text-sm">
          <span className="font-semibold">Protected environment.</span> No real fraud is occurring and no
          card numbers, passwords, or payments are ever requested to clear holds.
        </p>
      </div>

      {/* Open alerts */}
      <section>
        <h2 className="mb-3 font-display text-lg font-bold text-ink-900">Active alerts</h2>
        {openAlerts.length === 0 ? (
          <div className="card flex flex-col items-center justify-center px-6 py-12 text-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
              <ShieldCheck className="h-7 w-7" />
            </span>
            <p className="mt-4 text-sm font-semibold text-ink-700">All clear</p>
            <p className="mt-1 text-sm text-ink-400">No active security alerts. Your accounts look safe.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {openAlerts.map((a) => (
              <button
                key={a.id}
                onClick={() => setActiveId(a.id)}
                className="card group flex w-full items-center gap-4 p-5 text-left transition hover:shadow-glow"
              >
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-600">
                  <ShieldAlert className="h-6 w-6" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-bold text-ink-900">{a.title}</p>
                    <span className="pill bg-amber-100 text-amber-800">Hold active</span>
                  </div>
                  <p className="mt-1 line-clamp-2 text-sm text-ink-500">{a.detail}</p>
                  <p className="mt-1 text-xs text-ink-400">{a.time}</p>
                </div>
                <span className="hidden text-sm font-semibold text-brand-600 group-hover:underline sm:block">
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
          <h2 className="mb-3 font-display text-lg font-bold text-ink-900">Resolved</h2>
          <div className="space-y-3">
            {resolvedAlerts.map((a) => (
              <div key={a.id} className="card flex items-center gap-4 p-4 opacity-80">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                  <Check className="h-5 w-5" />
                </span>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-ink-700">{a.title}</p>
                  <p className="text-xs text-ink-400">Acknowledged · {a.time}</p>
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
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-amber-100 text-amber-600">
            <ShieldAlert className="h-5 w-5" />
          </span>
        }
        size="lg"
        footer={
          <>
            <button
              className="btn-ghost"
              onClick={() => {
                setDismissing(active!.id);
                setActiveId(null);
              }}
            >
              Dismiss
            </button>
            <button
              className="btn-primary"
              onClick={() => {
                acknowledgeAlert(active!.id);
                setActiveId(null);
              }}
            >
              <Check className="h-4 w-4" /> Acknowledge & release hold
            </button>
          </>
        }
      >
        {active && (
          <div className="space-y-4">
            <div className="flex items-start gap-3 rounded-xl bg-amber-50 p-3 text-sm text-amber-800 ring-1 ring-amber-200">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
              <p>
                A temporary hold has been placed on card purchases. No real funds are restricted and no
                payment is required to release it.
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
              <p className="text-sm text-ink-600">{active.detail}</p>
            </div>

            <div className="flex items-start gap-3 rounded-xl border border-ink-200 bg-ink-50 p-3">
              <Lock className="mt-0.5 h-4 w-4 shrink-0 text-ink-400" />
              <p className="text-xs text-ink-500">
                Everstream will never ask for your card number, password, or a payment to remove a hold.
                To release this hold, simply acknowledge this alert.
              </p>
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
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-ink-100 text-ink-600">
            <X className="h-5 w-5" />
          </span>
        }
        footer={
          <>
            <button className="btn-ghost" onClick={() => setDismissing(null)}>
              Keep
            </button>
            <button
              className="btn-outline"
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
          <p className="text-sm text-ink-600">
            The hold will remain in place but the alert will be hidden from your active list. You can
            still acknowledge it later from the resolved list is not available — dismissing here just
            removes it from view.
          </p>
        )}
      </Modal>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-ink-200 bg-white p-3">
      <p className="text-xs font-semibold uppercase tracking-wide text-ink-500">{label}</p>
      <p className="mt-0.5 text-sm font-semibold text-ink-800">{value}</p>
    </div>
  );
}
