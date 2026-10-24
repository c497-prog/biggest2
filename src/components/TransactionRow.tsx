import { ArrowDownLeft, ArrowUpRight } from 'lucide-react';
import type { Transaction } from '@/lib/types';
import { fmtDate, fmtMoney } from '@/lib/format';

const STATUS_STYLES: Record<Transaction['status'], string> = {
  Completed: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  Pending: 'bg-amber-50 text-amber-700 ring-amber-200',
  Failed: 'bg-rose-50 text-rose-700 ring-rose-200',
};

export function TransactionRow({ tx, compact = false }: { tx: Transaction; compact?: boolean }) {
  const credit = tx.kind === 'credit';
  return (
    <div className="flex items-center gap-3 px-4 py-3 transition hover:bg-ink-50/70">
      <div
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
          credit ? 'bg-emerald-50 text-emerald-600' : 'bg-ink-100 text-ink-600'
        }`}
      >
        {credit ? <ArrowDownLeft className="h-5 w-5" /> : <ArrowUpRight className="h-5 w-5" />}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-ink-800">{tx.description}</p>
        <p className="truncate text-xs text-ink-400">
          {fmtDate(tx.date)} · {tx.category}
        </p>
      </div>
      {!compact && (
        <span
          className={`pill ring-1 ${STATUS_STYLES[tx.status]}`}
        >
          {tx.status}
        </span>
      )}
      <div className="w-24 text-right">
        <p
          className={`font-display text-sm font-bold ${credit ? 'text-emerald-600' : 'text-ink-800'}`}
        >
          {credit ? '+' : '−'}
          {fmtMoney(tx.amount)}
        </p>
      </div>
    </div>
  );
}
