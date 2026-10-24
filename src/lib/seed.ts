import type { BankState } from './types';

export const SEED_STATE: BankState = {
  customer: {
    fullName: 'Adrian Mercer',
    preferredName: 'Adrian',
    email: 'adrian.mercer@everstream.demo',
    phone: '+1 (415) 555-0182',
    address: '218 Harborview Lane, San Francisco, CA 94109',
    occupation: 'Software Engineer',
    memberSince: '2019-03-14',
    avatarInitials: 'AM',
  },
  accounts: [
    {
      id: 'acc-checking',
      name: 'Everyday Checking',
      type: 'checking',
      balance: 28878,
      number: '•••• 4471',
      color: 'from-brand-500 to-brand-700',
      accent: 'text-brand-600',
    },
    {
      id: 'acc-savings',
      name: 'High-Yield Savings',
      type: 'savings',
      balance: 50023,
      number: '•••• 9023',
      color: 'from-emerald-500 to-emerald-700',
      accent: 'text-emerald-600',
    },
    {
      id: 'acc-sep',
      name: 'SEP IRA Retirement',
      type: 'sep_ira',
      balance: 300182,
      number: '•••• 1180',
      color: 'from-violet-500 to-violet-700',
      accent: 'text-violet-600',
    },
  ],
  transactions: [
    { id: 'tx-1001', date: '2026-10-23', description: 'Payroll Deposit — Lumen Systems', merchant: 'Lumen Systems', amount: 6420.0, kind: 'credit', status: 'Completed', accountId: 'acc-checking', category: 'Income' },
    { id: 'tx-1002', date: '2026-10-22', description: 'Whole Foods Market', merchant: 'Whole Foods', amount: 128.45, kind: 'debit', status: 'Completed', accountId: 'acc-checking', category: 'Groceries' },
    { id: 'tx-1003', date: '2026-10-21', description: 'Pacific Gas & Electric', merchant: 'PG&E', amount: 184.2, kind: 'debit', status: 'Completed', accountId: 'acc-checking', category: 'Utilities' },
    { id: 'tx-1004', date: '2026-10-20', description: 'Interest Payment', merchant: 'Everstream Bank', amount: 38.71, kind: 'credit', status: 'Completed', accountId: 'acc-savings', category: 'Interest' },
    { id: 'tx-1005', date: '2026-10-19', description: 'Transfer to Savings', merchant: 'Internal Transfer', amount: 1500.0, kind: 'debit', status: 'Completed', accountId: 'acc-checking', category: 'Transfer' },
    { id: 'tx-1006', date: '2026-10-19', description: 'Transfer from Checking', merchant: 'Internal Transfer', amount: 1500.0, kind: 'credit', status: 'Completed', accountId: 'acc-savings', category: 'Transfer' },
    { id: 'tx-1007', date: '2026-10-17', description: 'Spotify Premium', merchant: 'Spotify', amount: 11.99, kind: 'debit', status: 'Completed', accountId: 'acc-checking', category: 'Subscriptions' },
    { id: 'tx-1008', date: '2026-10-16', description: 'Dividend Distribution — VTI', merchant: 'Vanguard', amount: 1240.0, kind: 'credit', status: 'Completed', accountId: 'acc-sep', category: 'Dividends' },
    { id: 'tx-1009', date: '2026-10-14', description: 'Shell Gas Station', merchant: 'Shell', amount: 62.1, kind: 'debit', status: 'Completed', accountId: 'acc-checking', category: 'Transport' },
    { id: 'tx-1010', date: '2026-10-12', description: 'Contribution — SEP IRA', merchant: 'Internal Transfer', amount: 2000.0, kind: 'credit', status: 'Completed', accountId: 'acc-sep', category: 'Contribution' },
    { id: 'tx-1011', date: '2026-10-11', description: 'Amazon Purchase', merchant: 'Amazon', amount: 86.34, kind: 'debit', status: 'Pending', accountId: 'acc-checking', category: 'Shopping' },
    { id: 'tx-1012', date: '2026-10-09', description: 'Blue Bottle Coffee', merchant: 'Blue Bottle', amount: 7.5, kind: 'debit', status: 'Completed', accountId: 'acc-checking', category: 'Dining' },
    { id: 'tx-1013', date: '2026-10-08', description: 'ATM Withdrawal — 24th St', merchant: 'Everstream ATM', amount: 200.0, kind: 'debit', status: 'Completed', accountId: 'acc-checking', category: 'Cash' },
    { id: 'tx-1014', date: '2026-10-05', description: 'Rebalance — VTI / VXUS', merchant: 'Vanguard', amount: 0.0, kind: 'debit', status: 'Completed', accountId: 'acc-sep', category: 'Rebalance' },
    { id: 'tx-1015', date: '2026-10-03', description: 'Uber Trip', merchant: 'Uber', amount: 24.6, kind: 'debit', status: 'Failed', accountId: 'acc-checking', category: 'Transport' },
    { id: 'tx-1016', date: '2026-09-30', description: 'Payroll Deposit — Lumen Systems', merchant: 'Lumen Systems', amount: 6420.0, kind: 'credit', status: 'Completed', accountId: 'acc-checking', category: 'Income' },
    { id: 'tx-1017', date: '2026-09-28', description: 'Transfer to Savings', merchant: 'Internal Transfer', amount: 1500.0, kind: 'debit', status: 'Completed', accountId: 'acc-checking', category: 'Transfer' },
    { id: 'tx-1018', date: '2026-09-28', description: 'Transfer from Checking', merchant: 'Internal Transfer', amount: 1500.0, kind: 'credit', status: 'Completed', accountId: 'acc-savings', category: 'Transfer' },
  ],
  preferences: {
    language: 'en',
    emailAlerts: true,
    pushAlerts: true,
    twoStepChallenge: true,
    paperlessStatements: true,
  },
  alerts: [
    {
      id: 'alert-001',
      title: 'Suspicious card transaction detected',
      detail:
        'A $912.50 attempt at "ElectroDepot Lisbon" was flagged by our fraud engine. As a precaution, a temporary hold has been placed on card purchases. This is a simulated alert for demonstration only — no real funds are at risk.',
      amount: 912.5,
      merchant: 'ElectroDepot Lisbon',
      location: 'Lisbon, Portugal',
      time: '2026-10-24 08:14 UTC',
      acknowledged: false,
      dismissed: false,
    },
  ],
};

export const DEMO_CREDENTIALS = {
  username: 'adrian.mercer',
  password: 'everstream2026',
};
