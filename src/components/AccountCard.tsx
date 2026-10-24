import type { Account } from '@/lib/types';
import { fmtMoney } from '@/lib/format';

const TYPE_LABEL: Record<Account['type'], string> = {
  checking: 'Checking',
  savings: 'Savings',
  sep_ira: 'SEP IRA',
};

export function AccountCard({
  account,
  onQuickTransfer,
}: {
  account: Account;
  onQuickTransfer?: (account: Account) => void;
}) {
  return (
    <div
      className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${account.color} p-5 text-white shadow-card transition hover:shadow-glow`}
    >
      <div className="absolute -right-6 -top-8 h-28 w-28 rounded-full bg-white/10" />
      <div className="absolute -bottom-10 -left-6 h-24 w-24 rounded-full bg-white/10" />
      <div className="relative">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-white/80">
            {TYPE_LABEL[account.type]}
          </span>
          <span className="rounded-full bg-white/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide">
            {account.number}
          </span>
        </div>
        <p className="mt-1 text-sm text-white/85">{account.name}</p>
        <p className="mt-4 font-display text-3xl font-extrabold tracking-tight">
          {fmtMoney(account.balance)}
        </p>
        <div className="mt-5 flex items-center justify-between">
          <span className="text-[11px] text-white/70">Available balance</span>
          {onQuickTransfer && (
            <button
              onClick={() => onQuickTransfer(account)}
              className="rounded-lg bg-white/20 px-2.5 py-1 text-xs font-semibold text-white backdrop-blur-sm transition hover:bg-white/30"
            >
              Transfer
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export function AccountChip({ account }: { account: Account }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-sm">
      <span className={`h-2 w-2 rounded-full bg-gradient-to-br ${account.color}`} />
      <span className="font-medium text-ink-700 dark:text-ink-300">{account.name}</span>
    </span>
  );
}
