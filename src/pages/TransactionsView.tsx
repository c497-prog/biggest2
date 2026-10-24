import { useMemo, useState } from 'react';
import { Search, Filter, X, Download, FileSpreadsheet } from 'lucide-react';
import { useBank } from '@/context/BankContext';
import { fmtMoney } from '@/lib/format';
import { TransactionRow } from '@/components/TransactionRow';
import { TransactionModal } from '@/components/TransactionModal';
import type { Transaction, TransactionStatus } from '@/lib/types';

const STATUSES: TransactionStatus[] = ['Completed', 'Pending', 'Failed'];

export function TransactionsView() {
  const { state, privacyMode } = useBank();
  const [query, setQuery] = useState('');
  const [accountFilter, setAccountFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<TransactionStatus | 'all'>('all');
  const [kindFilter, setKindFilter] = useState<'all' | 'credit' | 'debit'>('all');
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);
  const [exported, setExported] = useState(false);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return state.transactions.filter((t) => {
      if (accountFilter !== 'all' && t.accountId !== accountFilter) return false;
      if (statusFilter !== 'all' && t.status !== statusFilter) return false;
      if (kindFilter !== 'all' && t.kind !== kindFilter) return false;
      if (q) {
        const hay = `${t.description} ${t.merchant} ${t.category}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [state.transactions, query, accountFilter, statusFilter, kindFilter]);

  const hasFilters =
    query || accountFilter !== 'all' || statusFilter !== 'all' || kindFilter !== 'all';

  const clearFilters = () => {
    setQuery('');
    setAccountFilter('all');
    setStatusFilter('all');
    setKindFilter('all');
  };

  const exportCsv = () => {
    if (filtered.length === 0) return;
    const headers = [
      'Transaction ID',
      'Date',
      'Description',
      'Merchant',
      'Category',
      'Account',
      'Amount ($)',
      'Type',
      'Status',
    ];
    const rows = filtered.map((t) => {
      const acc = state.accounts.find((a) => a.id === t.accountId);
      const accName = acc ? `${acc.name} (${acc.number})` : t.accountId;
      return [
        `"${t.id}"`,
        `"${t.date}"`,
        `"${t.description.replace(/"/g, '""')}"`,
        `"${t.merchant.replace(/"/g, '""')}"`,
        `"${t.category.replace(/"/g, '""')}"`,
        `"${accName.replace(/"/g, '""')}"`,
        t.amount.toFixed(2),
        t.kind,
        t.status,
      ].join(',');
    });

    const csvContent = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `everstream-transactions-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setExported(true);
    setTimeout(() => setExported(false), 2000);
  };

  const selectedAccount = useMemo(() => {
    if (!selectedTx) return undefined;
    return state.accounts.find((a) => a.id === selectedTx.accountId);
  }, [selectedTx, state.accounts]);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-extrabold text-ink-900 dark:text-ink-100">Transactions</h1>
          <p className="mt-1 text-sm text-ink-500 dark:text-ink-400">
            {filtered.length} of {state.transactions.length} records · Click any row for details
          </p>
        </div>
        <button
          onClick={exportCsv}
          disabled={filtered.length === 0}
          className="btn-outline self-start sm:self-auto cursor-pointer"
          title={`Download ${filtered.length} transactions as CSV`}
        >
          {exported ? (
            <FileSpreadsheet className="h-4 w-4 text-emerald-600" />
          ) : (
            <Download className="h-4 w-4" />
          )}
          {exported ? 'Downloaded!' : `Export CSV (${filtered.length})`}
        </button>
      </div>

      {/* Filters */}
      <div className="card p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
            <input
              className="input pl-9"
              placeholder="Search description, merchant, category…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <FilterSelect label="Account" value={accountFilter} onChange={setAccountFilter}>
              <option value="all">All accounts</option>
              {state.accounts.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))}
            </FilterSelect>
            <FilterSelect
              label="Status"
              value={statusFilter}
              onChange={(v) => setStatusFilter(v as TransactionStatus | 'all')}
            >
              <option value="all">All statuses</option>
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </FilterSelect>
            <FilterSelect
              label="Type"
              value={kindFilter}
              onChange={(v) => setKindFilter(v as 'all' | 'credit' | 'debit')}
            >
              <option value="all">All types</option>
              <option value="credit">Money in</option>
              <option value="debit">Money out</option>
            </FilterSelect>
            {hasFilters && (
              <button
                onClick={clearFilters}
                className="btn-ghost shrink-0"
                aria-label="Clear filters"
              >
                <X className="h-4 w-4" /> Clear
              </button>
            )}
          </div>
        </div>
      </div>

      {/* List */}
      <div className="card overflow-hidden">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-ink-100 text-ink-400 dark:bg-ink-800 dark:text-ink-500">
              <Filter className="h-6 w-6" />
            </span>
            <p className="mt-4 text-sm font-semibold text-ink-700 dark:text-ink-200">No transactions found</p>
            <p className="mt-1 text-sm text-ink-400 dark:text-ink-500">Try adjusting your search or filters.</p>
            <button onClick={clearFilters} className="btn-outline mt-4">
              Reset filters
            </button>
          </div>
        ) : (
          <div className="max-h-[70vh] overflow-y-auto scrollbar-thin divide-y divide-ink-100 dark:divide-ink-800">
            {filtered.map((t) => (
              <TransactionRow key={t.id} tx={t} onSelect={setSelectedTx} />
            ))}
          </div>
        )}
      </div>

      {/* Totals */}
      {filtered.length > 0 && (
        <div className="card grid gap-4 p-5 sm:grid-cols-3">
          <Stat
            label="Money in"
            value={fmtMoney(
              filtered.filter((t) => t.kind === 'credit').reduce((s, t) => s + t.amount, 0),
            )}
            tone="emerald"
            blurred={privacyMode}
          />
          <Stat
            label="Money out"
            value={fmtMoney(
              filtered.filter((t) => t.kind === 'debit').reduce((s, t) => s + t.amount, 0),
            )}
            tone="ink"
            blurred={privacyMode}
          />
          <Stat
            label="Net"
            value={fmtMoney(
              filtered.filter((t) => t.kind === 'credit').reduce((s, t) => s + t.amount, 0) -
                filtered.filter((t) => t.kind === 'debit').reduce((s, t) => s + t.amount, 0),
              { signed: true },
            )}
            tone="brand"
            blurred={privacyMode}
          />
        </div>
      )}

      {/* Interactive Detail Modal */}
      <TransactionModal
        tx={selectedTx}
        account={selectedAccount}
        onClose={() => setSelectedTx(null)}
      />
    </div>
  );
}

function FilterSelect({
  label,
  value,
  onChange,
  children,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  children: React.ReactNode;
}) {
  return (
    <div className="relative">
      <select
        aria-label={label}
        className="input cursor-pointer appearance-none pr-9 text-sm"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20' fill='%2394a3b8'%3E%3Cpath fill-rule='evenodd' d='M5.23 7.21a.75.75 0 011.06.02L10 11.17l3.71-3.94a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z' clip-rule='evenodd'/%3E%3C/svg%3E\")",
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'right 0.6rem center',
          backgroundSize: '1.1rem',
        }}
      >
        {children}
      </select>
    </div>
  );
}

function Stat({
  label,
  value,
  tone,
  blurred = false,
}: {
  label: string;
  value: string;
  tone: 'emerald' | 'ink' | 'brand';
  blurred?: boolean;
}) {
  const toneClass =
    tone === 'emerald'
      ? 'text-emerald-600 dark:text-emerald-400'
      : tone === 'brand'
        ? 'text-brand-600 dark:text-brand-400'
        : 'text-ink-800 dark:text-ink-100';
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-ink-500 dark:text-ink-400">{label}</p>
      <p className={`mt-1 font-display text-xl font-bold ${toneClass} transition duration-200 ${
        blurred ? 'select-none filter blur-[5px]' : ''
      }`}>
        {blurred ? '$••••••' : value}
      </p>
    </div>
  );
}