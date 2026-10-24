import { useMemo, useState } from 'react';
import { ArrowRight, CheckCircle2, AlertTriangle, Info } from 'lucide-react';
import { useBank } from '@/context/BankContext';
import type { Account } from '@/lib/types';
import { fmtMoney } from '@/lib/format';
import { Modal } from '@/components/Modal';

interface PendingTransfer {
  from: Account;
  to: Account;
  amount: number;
  note: string;
}

export function TransferView({ presetFromId }: { presetFromId?: string | null }) {
  const { state, transfer, validateTransfer } = useBank();
  const [fromId, setFromId] = useState(presetFromId ?? state.accounts[0]?.id ?? '');
  const [toId, setToId] = useState<string>(
    state.accounts.find((a) => a.id !== (presetFromId ?? state.accounts[0]?.id))?.id ?? '',
  );
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState<PendingTransfer | null>(null);
  const [success, setSuccess] = useState<{ from: string; to: string; amount: number } | null>(null);

  const from = state.accounts.find((a) => a.id === fromId);
  const to = state.accounts.find((a) => a.id === toId);

  const numericAmount = useMemo(() => {
    const n = parseFloat(amount.replace(/[$,\s]/g, ''));
    return Number.isFinite(n) ? n : 0;
  }, [amount]);

  const quickAmounts = [100, 500, 1000, 5000];

  const openConfirm = () => {
    setError(null);
    if (!from || !to) return;
    const res = validateTransfer({ fromAccountId: from.id, toAccountId: to.id, amount: numericAmount });
    if (!res.ok) {
      setError(res.error);
      return;
    }
    setPending({ from, to, amount: numericAmount, note: note.trim() });
  };

  const confirm = () => {
    if (!pending) return;
    const res = transfer({
      fromAccountId: pending.from.id,
      toAccountId: pending.to.id,
      amount: pending.amount,
      note: pending.note,
    });
    setPending(null);
    if (!res.ok) {
      setError(res.error);
      return;
    }
    setSuccess({ from: pending.from.name, to: pending.to.name, amount: pending.amount });
    setAmount('');
    setNote('');
  };

  const swap = () => {
    setFromId(toId);
    setToId(fromId);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="font-display text-2xl font-extrabold text-ink-900">Transfer funds</h1>
        <p className="mt-1 text-sm text-ink-500">
          Move money instantly between your Everstream accounts. All transfers are simulated.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        <div className="card p-6 lg:col-span-3">
          <div className="space-y-5">
            {/* From */}
            <div>
              <label className="label">From account</label>
              <select
                className="input cursor-pointer appearance-none bg-[length:1.25rem] bg-[right_0.75rem_center] bg-no-repeat pr-10"
                style={{
                  backgroundImage:
                    "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20' fill='%2394a3b8'%3E%3Cpath fill-rule='evenodd' d='M5.23 7.21a.75.75 0 011.06.02L10 11.17l3.71-3.94a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z' clip-rule='evenodd'/%3E%3C/svg%3E\")",
                }}
                value={fromId}
                onChange={(e) => setFromId(e.target.value)}
              >
                {state.accounts.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name} — {fmtMoney(a.balance)}
                  </option>
                ))}
              </select>
              {from && (
                <p className="mt-1.5 text-xs text-ink-500">
                  Available: <span className="font-semibold text-ink-700">{fmtMoney(from.balance)}</span>
                </p>
              )}
            </div>

            {/* Swap */}
            <div className="flex justify-center">
              <button
                onClick={swap}
                className="rounded-full border border-ink-200 bg-white p-2 text-ink-500 shadow-soft transition hover:bg-brand-50 hover:text-brand-600"
                aria-label="Swap accounts"
              >
                <ArrowRight className="h-4 w-4 rotate-90" />
              </button>
            </div>

            {/* To */}
            <div>
              <label className="label">To account</label>
              <select
                className="input cursor-pointer appearance-none bg-[length:1.25rem] bg-[right_0.75rem_center] bg-no-repeat pr-10"
                style={{
                  backgroundImage:
                    "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20' fill='%2394a3b8'%3E%3Cpath fill-rule='evenodd' d='M5.23 7.21a.75.75 0 011.06.02L10 11.17l3.71-3.94a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z' clip-rule='evenodd'/%3E%3C/svg%3E\")",
                }}
                value={toId}
                onChange={(e) => setToId(e.target.value)}
              >
                {state.accounts.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name} — {fmtMoney(a.balance)}
                  </option>
                ))}
              </select>
            </div>

            {/* Amount */}
            <div>
              <label className="label">Amount</label>
              <div className="relative">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm font-semibold text-ink-400">
                  $
                </span>
                <input
                  type="text"
                  inputMode="decimal"
                  className="input pl-7 font-display text-lg font-bold"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value.replace(/[^0-9.]/g, ''))}
                  placeholder="0.00"
                />
              </div>
              <div className="mt-2 flex flex-wrap gap-2">
                {quickAmounts.map((q) => (
                  <button
                    key={q}
                    onClick={() => setAmount(String(q))}
                    className="rounded-lg border border-ink-200 bg-white px-3 py-1 text-xs font-semibold text-ink-600 transition hover:border-brand-300 hover:text-brand-600"
                  >
                    +{fmtMoney(q)}
                  </button>
                ))}
                {from && (
                  <button
                    onClick={() => setAmount(String(from.balance))}
                    className="rounded-lg border border-ink-200 bg-white px-3 py-1 text-xs font-semibold text-ink-600 transition hover:border-brand-300 hover:text-brand-600"
                  >
                    Max
                  </button>
                )}
              </div>
            </div>

            {/* Note */}
            <div>
              <label className="label">Memo (optional)</label>
              <input
                className="input"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="e.g. Monthly savings"
                maxLength={48}
              />
            </div>

            {error && (
              <div className="flex items-start gap-2 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700 ring-1 ring-rose-200">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <button
              onClick={openConfirm}
              disabled={numericAmount <= 0 || fromId === toId}
              className="btn-primary w-full"
            >
              Review transfer <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Summary */}
        <div className="card h-fit p-6 lg:col-span-2">
          <h3 className="font-display text-base font-bold text-ink-900">Transfer summary</h3>
          <dl className="mt-4 space-y-3 text-sm">
            <div className="flex justify-between">
              <dt className="text-ink-500">From</dt>
              <dd className="font-semibold text-ink-800">{from?.name ?? '—'}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-ink-500">To</dt>
              <dd className="font-semibold text-ink-800">{to?.name ?? '—'}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-ink-500">Amount</dt>
              <dd className="font-display font-bold text-ink-900">{fmtMoney(numericAmount)}</dd>
            </div>
            <div className="h-px bg-ink-100" />
            <div className="flex justify-between">
              <dt className="text-ink-500">Fee</dt>
              <dd className="font-semibold text-emerald-600">$0.00</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-ink-500">Estimated arrival</dt>
              <dd className="font-semibold text-ink-800">Instant</dd>
            </div>
          </dl>
          <div className="mt-5 flex items-start gap-2 rounded-xl bg-ink-50 p-3 text-xs text-ink-500 ring-1 ring-ink-100">
            <Info className="mt-0.3 h-4 w-4 shrink-0 text-ink-400" />
            <span>
              Transfers between Everstream accounts are simulated for demonstration. No real money
              moves.
            </span>
          </div>
        </div>
      </div>

      {/* Confirm modal */}
      <Modal
        open={!!pending}
        onClose={() => setPending(null)}
        title="Confirm transfer"
        icon={
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-50 text-brand-600">
            <ArrowRight className="h-5 w-5" />
          </span>
        }
        footer={
          <>
            <button className="btn-ghost" onClick={() => setPending(null)}>
              Cancel
            </button>
            <button className="btn-primary" onClick={confirm}>
              Confirm & transfer
            </button>
          </>
        }
      >
        {pending && (
          <div className="space-y-3">
            <p className="text-sm text-ink-600">Please confirm the details of your transfer.</p>
            <div className="rounded-xl bg-ink-50 p-4 ring-1 ring-ink-100">
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-xs text-ink-500">From</p>
                  <p className="truncate text-sm font-semibold text-ink-800">{pending.from.name}</p>
                </div>
                <ArrowRight className="h-4 w-4 shrink-0 text-ink-400" />
                <div className="min-w-0">
                  <p className="text-xs text-ink-500">To</p>
                  <p className="truncate text-sm font-semibold text-ink-800">{pending.to.name}</p>
                </div>
              </div>
              <div className="mt-3 flex items-end justify-between">
                <p className="text-xs text-ink-500">Amount</p>
                <p className="font-display text-2xl font-extrabold text-ink-900">
                  {fmtMoney(pending.amount)}
                </p>
              </div>
              {pending.note && (
                <p className="mt-2 text-xs text-ink-500">Memo: “{pending.note}”</p>
              )}
            </div>
          </div>
        )}
      </Modal>

      {/* Success modal */}
      <Modal
        open={!!success}
        onClose={() => setSuccess(null)}
        title="Transfer complete"
        icon={
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
            <CheckCircle2 className="h-5 w-5" />
          </span>
        }
        footer={
          <button className="btn-primary" onClick={() => setSuccess(null)}>
            Done
          </button>
        }
      >
        {success && (
          <p className="text-sm text-ink-600">
            {fmtMoney(success.amount)} moved from {success.from} to {success.to}. Your balances and
            transaction history have been updated.
          </p>
        )}
      </Modal>
    </div>
  );
}
