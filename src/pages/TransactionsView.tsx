import { useMemo, useState } from 'react';
import { Search, Filter, X, Download } from 'lucide-react';
import { useBank } from '@/context/BankContext';
import { fmtMoney } from '@/lib/format';
import { TransactionRow } from '@/components/TransactionRow';
import type { TransactionStatus } from '@/lib/types';

const STATUSES: TransactionStatus[] = ['Completed', 'Pending', 'Failed'];

export function TransactionsView() {
  const { state } = useBank();
  const [query, setQuery] = useState('');
  const [accountFilter, setAccountFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<TransactionStatus | 'all'>('all');
  const [kindFilter, setKindFilter] = useState<'all' | 'credit' | 'debit'>('all');

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

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-extrabold text-ink-900">Transactions</h1>
          <p className="mt-1 text-sm text-ink-500">
            {filtered.length} of {state.transactions.length} records
          </p>
        </div>
        <button className="btn-outline self-start sm:self-auto" disabled title="Export is not enabled">
          <Download className="h-4 w-4" /> Export
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
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-ink-100 text-ink-400">
              <Filter className="h-6 w-6" />
            </span>
            <p className="mt-4 text-sm font-semibold text-ink-700">No transactions found</p>
            <p className="mt-1 text-sm text-ink-400">Try adjusting your search or filters.</p>
            <button onClick={clearFilters} className="btn-outline mt-4">
              Reset filters
            </button>
          </div>
        ) : (
          <div className="max-h-[70vh] overflow-y-auto scrollbar-thin divide-y divide-ink-100">
            {filtered.map((t) => (
              <TransactionRow key={t.id} tx={t} />
            ))}
          </div>
        )}
      </div>

      {/* Totals */}
      {filtered.length > 0 && (
        <div className="card grid gap-4 p-5 sm:grid-cols-3">
          <Stat label="Money in" value={fmtMoney(filtered.filter((t) => t.kind === 'credit').reduce((s, t) => s + t.amount, 0))} tone="emerald" />
          <Stat label="Money out" value={fmtMoney(filtered.filter((t) => t.kind === 'debit').reduce((s, t) => s + t.amount, 0))} tone="ink" />
          <Stat
            label="Net"
            value={fmtMoney(
              filtered.filter((t) => t.kind === 'credit').reduce((s, t) => s + t.amount, 0) -
                filtered.filter((t) => t.kind === 'debit').reduce((s, t) => s + t.amount, 0),
              { signed: true },
            )}
            tone="brand"
          />
        </div>
      )}
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
}: {
  label: string;
  value: string;
  tone: 'emerald' | 'ink' | 'brand';
}) {
  const toneClass =
    tone === 'emerald' ? 'text-emerald-600' : tone === 'brand' ? 'text-brand-600' : 'text-ink-800';
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-ink-500">{label}</p>
      <p className={`mt-1 font-display text-xl font-bold ${toneClass}`}>{value}</p>
    </div>
  );
}
