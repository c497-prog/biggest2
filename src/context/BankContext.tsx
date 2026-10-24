import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { BankState, Preferences, Transaction } from '@/lib/types';
import { loadState, resetState, saveState } from '@/lib/storage';
import { SEED_STATE } from '@/lib/seed';

interface TransferInput {
  fromAccountId: string;
  toAccountId: string;
  amount: number;
  note?: string;
}

type TransferResult = { ok: true; txIds: [string, string] } | { ok: false; error: string };

interface BankContextValue {
  state: BankState;
  totalBalance: number;
  authenticated: boolean;
  login: (username: string, password: string) => boolean;
  logout: () => void;
  validateTransfer: (input: TransferInput) => { ok: true } | { ok: false; error: string };
  transfer: (input: TransferInput) => TransferResult;
  acknowledgeAlert: (id: string) => void;
  dismissAlert: (id: string) => void;
  updatePreferences: (patch: Partial<Preferences>) => void;
  resetData: () => void;
}

const BankContext = createContext<BankContextValue | null>(null);

const SESSION_KEY = 'everstream.bank.session';

function nextId(prefix: string): string {
  return `${prefix}-${Math.random().toString(36).slice(2, 9)}${Date.now().toString(36).slice(-3)}`;
}

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

export function BankProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<BankState>(() => loadState());
  const [authenticated, setAuthenticated] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return window.sessionStorage.getItem(SESSION_KEY) === 'true';
  });

  useEffect(() => {
    saveState(state);
  }, [state]);

  const login = useCallback((username: string, password: string) => {
    const ok = username.trim().toLowerCase() === SEED_STATE.customer.email.split('@')[0] && password.length > 0;
    if (ok) {
      setAuthenticated(true);
      try {
        window.sessionStorage.setItem(SESSION_KEY, 'true');
      } catch {
        /* ignore */
      }
    }
    return ok;
  }, []);

  const logout = useCallback(() => {
    setAuthenticated(false);
    try {
      window.sessionStorage.removeItem(SESSION_KEY);
    } catch {
      /* ignore */
    }
  }, []);

  const validateTransfer = useCallback(
    (input: TransferInput): { ok: true } | { ok: false; error: string } => {
      if (input.fromAccountId === input.toAccountId) {
        return { ok: false as const, error: 'Select two different accounts.' };
      }
      if (!Number.isFinite(input.amount) || input.amount <= 0) {
        return { ok: false as const, error: 'Enter a valid amount greater than $0.' };
      }
      const from = state.accounts.find((a) => a.id === input.fromAccountId);
      const to = state.accounts.find((a) => a.id === input.toAccountId);
      if (!from || !to) return { ok: false as const, error: 'Account not found.' };
      const amount = Math.round(input.amount * 100) / 100;
      if (amount > from.balance) {
        return { ok: false as const, error: 'Insufficient balance in the source account.' };
      }
      return { ok: true as const };
    },
    [state.accounts],
  );

  const transfer = useCallback((input: TransferInput) => {
    const v = validateTransfer(input);
    if (!v.ok) return v;
    const from = state.accounts.find((a) => a.id === input.fromAccountId)!;
    const to = state.accounts.find((a) => a.id === input.toAccountId)!;
    const amount = Math.round(input.amount * 100) / 100;

    const baseNote = input.note?.trim() || 'Internal Transfer';
    const txIds: [string, string] = [nextId('tx'), nextId('tx')];
    const d = today();

    const debit: Transaction = {
      id: txIds[0],
      date: d,
      description: `Transfer to ${to.name}`,
      merchant: baseNote,
      amount,
      kind: 'debit',
      status: 'Completed',
      accountId: from.id,
      category: 'Transfer',
    };
    const credit: Transaction = {
      id: txIds[1],
      date: d,
      description: `Transfer from ${from.name}`,
      merchant: baseNote,
      amount,
      kind: 'credit',
      status: 'Completed',
      accountId: to.id,
      category: 'Transfer',
    };

    setState((prev) => ({
      ...prev,
      accounts: prev.accounts.map((a) => {
        if (a.id === from.id) return { ...a, balance: Math.round((a.balance - amount) * 100) / 100 };
        if (a.id === to.id) return { ...a, balance: Math.round((a.balance + amount) * 100) / 100 };
        return a;
      }),
      transactions: [debit, credit, ...prev.transactions],
    }));

    return { ok: true as const, txIds };
  }, [state.accounts, validateTransfer]);

  const acknowledgeAlert = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      alerts: prev.alerts.map((a) => (a.id === id ? { ...a, acknowledged: true, dismissed: true } : a)),
    }));
  }, []);

  const dismissAlert = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      alerts: prev.alerts.map((a) => (a.id === id ? { ...a, dismissed: true } : a)),
    }));
  }, []);

  const updatePreferences = useCallback((patch: Partial<Preferences>) => {
    setState((prev) => ({ ...prev, preferences: { ...prev.preferences, ...patch } }));
  }, []);

  const resetData = useCallback(() => {
    resetState();
    setState(structuredClone(SEED_STATE));
  }, []);

  const totalBalance = useMemo(
    () => Math.round(state.accounts.reduce((s, a) => s + a.balance, 0) * 100) / 100,
    [state.accounts],
  );

  const value = useMemo<BankContextValue>(
    () => ({
      state,
      totalBalance,
      authenticated,
      login,
      logout,
      transfer,
      validateTransfer,
      acknowledgeAlert,
      dismissAlert,
      updatePreferences,
      resetData,
    }),
    [state, totalBalance, authenticated, login, logout, transfer, validateTransfer, acknowledgeAlert, dismissAlert, updatePreferences, resetData],
  );

  return <BankContext.Provider value={value}>{children}</BankContext.Provider>;
}

export function useBank() {
  const ctx = useContext(BankContext);
  if (!ctx) throw new Error('useBank must be used within BankProvider');
  return ctx;
}
