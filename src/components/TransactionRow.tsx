import { ArrowDownLeft, ArrowUpRight } from 'lucide-react';
import type { Transaction } from '@/lib/types';
import { fmtDate, fmtMoney } from '@/lib/format';
import { useBank } from '@/context/BankContext';

const STATUS_STYLES: Record<Transaction['status'], string> = {
  Completed: 'bg-emerald-50 text-emerald-700 ring-emerald-200 dark:bg-emerald-950/70 dark:text-emerald-300 dark:ring-emerald-800',
  Pending: 'bg-amber-50 text-amber-700 ring-amber-200 dark:bg-amber-950/70 dark:text-amber-300 dark:ring-amber-800',
  Failed: 'bg-rose-50 text-rose-700 ring-rose-200 dark:bg-rose-950/70 dark:text-rose-300 dark:ring-rose-800',
};

export function TransactionRow({
  tx,
  compact = false,
  onSelect,
}: {
  tx: Transaction;
  compact?: boolean;
  onSelect?: (tx: Transaction) => void;
}) {
  const { privacyMode } = useBank();
  const credit = tx.kind === 'credit';

  const handleClick = () => {
    if (onSelect) {
      onSelect(tx);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.key === 'Enter' || e.key === ' ') && onSelect) {
      e.preventDefault();
      onSelect(tx);
    }
  };

  return (
    <div
      role={onSelect ? 'button' : undefined}
      tabIndex={onSelect ? 0 : undefined}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      className={`flex items-center gap-3 px-4 py-3 transition select-none ${
        onSelect
          ? 'cursor-pointer hover:bg-ink-50/90 active:bg-ink-100 dark:hover:bg-ink-800/60 dark:active:bg-ink-800 focus:outline-none focus:bg-ink-50/90 dark:focus:bg-ink-800/60 focus:ring-1 focus:ring-brand-400'
          : 'hover:bg-ink-50/70 dark:hover:bg-ink-800/40'
      }`}
    >
      <div
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
          credit
            ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400'
            : 'bg-ink-100 text-ink-600 dark:bg-ink-800 dark:text-ink-300'
        }`}
      >
        {credit ? <ArrowDownLeft className="h-5 w-5" /> : <ArrowUpRight className="h-5 w-5" />}
      </div>
      <div className="min-w-0 flex-1">
        <p
          className={`truncate text-sm font-semibold text-ink-800 dark:text-ink-100 transition-all duration-200 ${
            privacyMode ? 'select-none filter blur-[5px]' : ''
          }`}
        >
          {privacyMode ? '••••••••••••••••' : tx.description}
        </p>
        <p
          className={`truncate text-xs text-ink-400 dark:text-ink-500 transition-all duration-200 ${
            privacyMode ? 'select-none filter blur-[3px]' : ''
          }`}
        >
          {fmtDate(tx.date)} · {privacyMode ? '••••••' : tx.category}
        </p>
      </div>
      {!compact && (
        <span
          className={`pill ring-1 transition-all duration-200 ${STATUS_STYLES[tx.status]} ${
            privacyMode ? 'select-none filter blur-[3px]' : ''
          }`}
        >
          {tx.status}
        </span>
      )}
      <div className="w-24 text-right">
        <p
          className={`font-display text-sm font-bold transition-all duration-200 ${
            credit ? 'text-emerald-600 dark:text-emerald-400' : 'text-ink-800 dark:text-ink-100'
          } ${privacyMode ? 'select-none filter blur-[5px]' : ''}`}
        >
          {privacyMode ? '••••••' : `${credit ? '+' : '−'}${fmtMoney(tx.amount)}`}
        </p>
      </div>
    </div>
  );
}