import { useState } from 'react';
import {
  Copy,
  Check,
  Calendar,
  CreditCard,
  Tag,
  ArrowDownLeft,
  ArrowUpRight,
  ShieldCheck,
  Building,
} from 'lucide-react';
import { Modal } from '@/components/Modal';
import { useBank } from '@/context/BankContext';
import type { Transaction, Account } from '@/lib/types';
import { fmtDate, fmtMoney } from '@/lib/format';

interface TransactionModalProps {
  tx: Transaction | null;
  account?: Account;
  onClose: () => void;
}

export function TransactionModal({ tx, account, onClose }: TransactionModalProps) {
  const { privacyMode } = useBank();
  const [copied, setCopied] = useState(false);

  if (!tx) return null;

  const credit = tx.kind === 'credit';

  const copyId = () => {
    navigator.clipboard.writeText(tx.id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const statusBadge = {
    Completed: 'bg-emerald-50 text-emerald-700 ring-emerald-200 dark:bg-emerald-950/70 dark:text-emerald-300 dark:ring-emerald-800',
    Pending: 'bg-amber-50 text-amber-700 ring-amber-200 dark:bg-amber-950/70 dark:text-amber-300 dark:ring-amber-800',
    Failed: 'bg-rose-50 text-rose-700 ring-rose-200 dark:bg-rose-950/70 dark:text-rose-300 dark:ring-rose-800',
  }[tx.status];

  return (
    <Modal
      open={!!tx}
      onClose={onClose}
      title="Transaction Details"
      size="md"
      icon={
        <span
          className={`flex h-10 w-10 items-center justify-center rounded-full ${
            credit
              ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400'
              : 'bg-ink-100 text-ink-600 dark:bg-ink-800 dark:text-ink-300'
          }`}
        >
          {credit ? <ArrowDownLeft className="h-5 w-5" /> : <ArrowUpRight className="h-5 w-5" />}
        </span>
      }
      footer={
        <div className="flex w-full items-center justify-between">
          <button
            onClick={copyId}
            className="btn-outline text-xs cursor-pointer"
            title="Copy Transaction ID"
          >
            {copied ? <Check className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
            {copied ? 'ID Copied' : 'Copy ID'}
          </button>
          <button onClick={onClose} className="btn-primary">
            Done
          </button>
        </div>
      }
    >
      <div className="space-y-4">
        {/* Amount hero */}
        <div className="rounded-2xl bg-ink-50/80 p-5 text-center ring-1 ring-ink-100 dark:bg-ink-800/40 dark:ring-ink-800">
          <p className="text-xs font-semibold uppercase tracking-wider text-ink-500 dark:text-ink-400">
            {credit ? 'Funds Received' : 'Payment / Outflow'}
          </p>
          <p
            className={`mt-1 font-display text-3xl font-extrabold transition duration-200 ${
              credit ? 'text-emerald-600 dark:text-emerald-400' : 'text-ink-900 dark:text-ink-100'
            } ${privacyMode ? 'select-none filter blur-[6px]' : ''}`}
          >
            {privacyMode ? '••••••' : `${credit ? '+' : '−'}${fmtMoney(tx.amount)}`}
          </p>
          <div className="mt-2.5 flex items-center justify-center gap-2">
            <span className={`pill ring-1 ${statusBadge}`}>{tx.status}</span>
            <span className="pill bg-ink-100 text-ink-600 dark:bg-ink-800 dark:text-ink-300">{tx.category}</span>
          </div>
        </div>

        {/* Metadata list */}
        <div className="divide-y divide-ink-100 rounded-xl border border-ink-200/80 bg-white text-sm dark:divide-ink-800 dark:border-ink-800 dark:bg-ink-900">
          <div className="flex items-center justify-between p-3">
            <span className="flex items-center gap-2 text-ink-500 dark:text-ink-400">
              <Building className="h-4 w-4 text-ink-400 dark:text-ink-500" /> Merchant / Description
            </span>
            <span
              className={`font-semibold text-ink-900 dark:text-ink-100 text-right transition duration-200 ${
                privacyMode ? 'select-none filter blur-[5px]' : ''
              }`}
            >
              {privacyMode ? '••••••••••••••••' : tx.description}
            </span>
          </div>

          <div className="flex items-center justify-between p-3">
            <span className="flex items-center gap-2 text-ink-500 dark:text-ink-400">
              <Calendar className="h-4 w-4 text-ink-400 dark:text-ink-500" /> Date Posted
            </span>
            <span className="font-medium text-ink-800 dark:text-ink-200">{fmtDate(tx.date)}</span>
          </div>

          <div className="flex items-center justify-between p-3">
            <span className="flex items-center gap-2 text-ink-500 dark:text-ink-400">
              <CreditCard className="h-4 w-4 text-ink-400 dark:text-ink-500" /> Account
            </span>
            <span className="font-medium text-ink-800 dark:text-ink-200">
              {account ? `${account.name} (${account.number})` : tx.accountId}
            </span>
          </div>

          <div className="flex items-center justify-between p-3">
            <span className="flex items-center gap-2 text-ink-500 dark:text-ink-400">
              <Tag className="h-4 w-4 text-ink-400 dark:text-ink-500" /> Reference ID
            </span>
            <span className="font-mono text-xs text-ink-600 dark:text-ink-400">{tx.id}</span>
          </div>
        </div>

        {/* Verification notice */}
        <div className="flex items-center gap-2 rounded-xl bg-emerald-50/70 p-3 text-xs text-emerald-800 ring-1 ring-emerald-200/50 dark:bg-emerald-950/40 dark:text-emerald-300 dark:ring-emerald-800/50">
          <ShieldCheck className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
          <span>Electronic record verified by Everstream Automated Clearing House.</span>
        </div>
      </div>
    </Modal>
  );
}