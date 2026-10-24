import { useMemo } from 'react';
import {
  TrendingUp,
  TrendingDown,
  ArrowLeftRight,
  Plus,
  Info,
} from 'lucide-react';
import { useBank } from '@/context/BankContext';
import type { Account } from '@/lib/types';
import type { ViewKey } from '@/components/DashboardShell';
import { fmtMoney, fmtDate } from '@/lib/format';
import { AccountCard } from '@/components/AccountCard';
import { Modal } from '@/components/Modal';

export function OverviewView({
  onNavigate,
  onQuickTransfer,
  quickTransferAccount,
  onClearQuickTransfer,
}: {
  onNavigate: (v: ViewKey) => void;
  onQuickTransfer: (a: Account) => void;
  quickTransferAccount: Account | null;
  onClearQuickTransfer: () => void;
}) {
  const { state, totalBalance, privacyMode } = useBank();

  const monthStats = useMemo(() => {
    const now = new Date('2026-10-24');
    const ym = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const txs = state.transactions.filter((t) => t.date.startsWith(ym) && t.status !== 'Failed');
    const inflow = txs.filter((t) => t.kind === 'credit').reduce((s, t) => s + t.amount, 0);
    const outflow = txs.filter((t) => t.kind === 'debit').reduce((s, t) => s + t.amount, 0);
    return { inflow, outflow };
  }, [state.transactions]);

  const activeAlert = state.alerts.find((a) => !a.dismissed);

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-ink-500 dark:text-ink-400">{fmtDate('2026-10-24')}</p>
          <h1 className="font-display text-2xl font-extrabold text-ink-900 dark:text-ink-100 sm:text-3xl">
            Good day, {state.customer.preferredName}.
          </h1>
        </div>
        <button onClick={() => onNavigate('transfer')} className="btn-primary self-start sm:self-auto cursor-pointer">
          <ArrowLeftRight className="h-4 w-4" /> New transfer
        </button>
      </div>

      {/* Security banner */}
      {activeAlert && (
        <button
          onClick={() => onNavigate('security')}
          className="group flex w-full items-center gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-left transition hover:bg-amber-100 dark:border-amber-900/60 dark:bg-amber-950/40 dark:hover:bg-amber-900/40 cursor-pointer"
        >
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-amber-500 text-white">
            <Info className="h-5 w-5" />
          </span>
          <div className="flex-1">
            <p className="text-sm font-semibold text-amber-900 dark:text-amber-200">
              Security hold: review a flagged transaction
            </p>
            <p className="text-xs text-amber-700 dark:text-amber-400">
              Temporary card hold active. Tap to review the flagged transaction.
            </p>
          </div>
          <span className="text-xs font-semibold text-amber-700 group-hover:underline dark:text-amber-300">
            Review →
          </span>
        </button>
      )}

      {/* Total balance + stats */}
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="card relative overflow-hidden p-6 lg:col-span-1">
          <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-brand-100/60 blur-2xl dark:bg-brand-500/10" />
          <p className="text-xs font-semibold uppercase tracking-wide text-ink-500 dark:text-ink-400">
            Total balance
          </p>
          <p className="mt-1 font-display text-4xl font-extrabold tracking-tight text-ink-900 dark:text-ink-100">
            {fmtMoney(totalBalance)}
          </p>
          <p className="mt-2 text-xs text-ink-400 dark:text-ink-500">
            Across {state.accounts.length} accounts
          </p>
        </div>

        <div className="card p-5">
          <div className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
              <TrendingUp className="h-5 w-5" />
            </span>
            <p className="text-xs font-semibold uppercase tracking-wide text-ink-500 dark:text-ink-400">
              Money in (Oct)
            </p>
          </div>
          <p className={`mt-3 font-display text-2xl font-bold text-emerald-600 dark:text-emerald-400 transition duration-200 ${
            privacyMode ? 'select-none filter blur-[5px]' : ''
          }`}>
            {privacyMode ? '+$••••••' : `+${fmtMoney(monthStats.inflow)}`}
          </p>
        </div>

        <div className="card p-5">
          <div className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-rose-50 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400">
              <TrendingDown className="h-5 w-5" />
            </span>
            <p className="text-xs font-semibold uppercase tracking-wide text-ink-500 dark:text-ink-400">
              Money out (Oct)
            </p>
          </div>
          <p className={`mt-3 font-display text-2xl font-bold text-ink-800 dark:text-ink-100 transition duration-200 ${
            privacyMode ? 'select-none filter blur-[5px]' : ''
          }`}>
            {privacyMode ? '−$••••••' : `−${fmtMoney(monthStats.outflow)}`}
          </p>
        </div>
      </div>

      {/* Account cards */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-display text-xl font-bold text-ink-900 dark:text-ink-100">
              Your accounts
            </h2>
            <p className="text-xs text-ink-500 dark:text-ink-400 mt-0.5">
              Select any account to perform quick transfers or review balances
            </p>
          </div>
          <button
            onClick={() => onNavigate('transactions')}
            className="text-xs font-semibold text-brand-600 hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300 cursor-pointer sm:text-sm"
          >
            Go to Transactions →
          </button>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {state.accounts.map((a) => (
            <AccountCard key={a.id} account={a} onQuickTransfer={onQuickTransfer} />
          ))}
        </div>
      </div>

      {/* Quick transfer modal (driven from account card) */}
      <Modal
        open={!!quickTransferAccount}
        onClose={onClearQuickTransfer}
        title="Quick transfer"
        size="sm"
        icon={
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-50 text-brand-600 dark:bg-brand-950/60 dark:text-brand-400">
            <Plus className="h-5 w-5" />
          </span>
        }
        footer={
          <>
            <button className="btn-ghost" onClick={onClearQuickTransfer}>
              Cancel
            </button>
            <button
              className="btn-primary"
              onClick={() => {
                onClearQuickTransfer();
                onNavigate('transfer');
              }}
            >
              Go to transfers
            </button>
          </>
        }
      >
        {quickTransferAccount && (
          <p className="text-sm text-ink-600 dark:text-ink-300">
            Move funds from <span className="font-semibold text-ink-900 dark:text-ink-100">{quickTransferAccount.name}</span>. Open the
            transfer panel to pick a destination and amount.
          </p>
        )}
      </Modal>
    </div>
  );
}