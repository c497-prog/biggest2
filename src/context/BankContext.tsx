import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { BankState, CardSettings, Preferences, SavingsGoal, ToastNotification, Transaction } from '@/lib/types';
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
  theme: 'light' | 'dark';
  privacyMode: boolean;
  toasts: ToastNotification[];
  login: (username: string, password: string) => boolean;
  logout: () => void;
  toggleTheme: () => void;
  setTheme: (theme: 'light' | 'dark') => void;
  togglePrivacyMode: () => void;
  setPrivacyMode: (val: boolean) => void;
  addToast: (toast: Omit<ToastNotification, 'id'>) => void;
  removeToast: (id: string) => void;
  validateTransfer: (input: TransferInput) => { ok: true } | { ok: false; error: string };
  transfer: (input: TransferInput) => TransferResult;
  acknowledgeAlert: (id: string) => void;
  dismissAlert: (id: string) => void;
  updatePreferences: (patch: Partial<Preferences>) => void;
  resetData: () => void;
  toggleFreezeCard: (cardId: string) => void;
  updateCardSettings: (cardId: string, patch: Partial<CardSettings>) => void;
  contributeToGoal: (goalId: string, amount: number, fromAccountId: string) => { ok: boolean; error?: string };
  addSavingsGoal: (goal: Omit<SavingsGoal, 'id' | 'currentAmount'>) => void;
  deleteSavingsGoal: (goalId: string) => void;
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

  const [toasts, setToasts] = useState<ToastNotification[]>([]);

  // Dark mode handling
  const [theme, setThemeState] = useState<'light' | 'dark'>(() => {
    if (typeof window === 'undefined') return 'light';
    const saved = window.localStorage.getItem('everstream.theme');
    if (saved === 'dark' || saved === 'light') return saved;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    try {
      window.localStorage.setItem('everstream.theme', theme);
    } catch {
      /* ignore */
    }
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setThemeState((prev) => (prev === 'light' ? 'dark' : 'light'));
  }, []);

  const setTheme = useCallback((t: 'light' | 'dark') => {
    setThemeState(t);
  }, []);

  // Screenshot Privacy Mode handling
  const [privacyMode, setPrivacyModeState] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return window.localStorage.getItem('everstream.privacyMode') === 'true';
  });

  const togglePrivacyMode = useCallback(() => {
    setPrivacyModeState((prev) => {
      const next = !prev;
      try {
        window.localStorage.setItem('everstream.privacyMode', String(next));
      } catch {
        /* ignore */
      }
      return next;
    });
  }, []);

  const setPrivacyMode = useCallback((val: boolean) => {
    setPrivacyModeState(val);
    try {
      window.localStorage.setItem('everstream.privacyMode', String(val));
    } catch {
      /* ignore */
    }
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback((toast: Omit<ToastNotification, 'id'>) => {
    const id = nextId('toast');
    setToasts((prev) => [...prev, { ...toast, id }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4200);
  }, []);

  useEffect(() => {
    saveState(state);
  }, [state]);

  const login = useCallback(
    (username: string, password: string) => {
      const ok = username.trim().toLowerCase() === SEED_STATE.customer.email.split('@')[0] && password.length > 0;
      if (ok) {
        setAuthenticated(true);
        try {
          window.sessionStorage.setItem(SESSION_KEY, 'true');
        } catch {
          /* ignore */
        }
        addToast({
          title: 'Welcome back!',
          message: `Logged in as ${SEED_STATE.customer.preferredName}.`,
          type: 'success',
        });
      }
      return ok;
    },
    [addToast],
  );

  const logout = useCallback(() => {
    setAuthenticated(false);
    try {
      window.sessionStorage.removeItem(SESSION_KEY);
    } catch {
      /* ignore */
    }
    addToast({
      title: 'Signed out',
      message: 'You have been safely signed out of Everstream.',
      type: 'info',
    });
  }, [addToast]);

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

  const transfer = useCallback(
    (input: TransferInput) => {
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

      addToast({
        title: 'Transfer Successful',
        message: `$${amount.toLocaleString('en-US', { minimumFractionDigits: 2 })} transferred from ${from.name} to ${to.name}.`,
        type: 'success',
      });

      return { ok: true as const, txIds };
    },
    [state.accounts, validateTransfer, addToast],
  );

  const acknowledgeAlert = useCallback(
    (id: string) => {
      setState((prev) => ({
        ...prev,
        alerts: prev.alerts.map((a) => (a.id === id ? { ...a, acknowledged: true, dismissed: true } : a)),
      }));
      addToast({
        title: 'Security Alert Acknowledged',
        message: 'The transaction hold has been resolved.',
        type: 'success',
      });
    },
    [addToast],
  );

  const dismissAlert = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      alerts: prev.alerts.map((a) => (a.id === id ? { ...a, dismissed: true } : a)),
    }));
  }, []);

  const updatePreferences = useCallback(
    (patch: Partial<Preferences>) => {
      setState((prev) => ({ ...prev, preferences: { ...prev.preferences, ...patch } }));
      addToast({
        title: 'Preferences Saved',
        message: 'Your account preferences have been updated.',
        type: 'info',
      });
    },
    [addToast],
  );

  const resetData = useCallback(() => {
    resetState();
    setState(structuredClone(SEED_STATE));
    addToast({
      title: 'Demo Data Reset',
      message: 'Everstream has been restored to default initial state.',
      type: 'info',
    });
  }, [addToast]);

  const toggleFreezeCard = useCallback(
    (cardId: string) => {
      setState((prev) => {
        const card = prev.cards.find((c) => c.id === cardId);
        const willFreeze = !card?.isFrozen;
        const updated = prev.cards.map((c) => (c.id === cardId ? { ...c, isFrozen: willFreeze } : c));
        addToast({
          title: willFreeze ? 'Card Frozen' : 'Card Unfrozen',
          message: willFreeze
            ? 'Debit card transactions are now temporarily paused.'
            : 'Debit card is active and ready for purchases.',
          type: willFreeze ? 'warning' : 'success',
        });
        return { ...prev, cards: updated };
      });
    },
    [addToast],
  );

  const updateCardSettings = useCallback(
    (cardId: string, patch: Partial<CardSettings>) => {
      setState((prev) => ({
        ...prev,
        cards: prev.cards.map((c) => (c.id === cardId ? { ...c, ...patch } : c)),
      }));
      addToast({
        title: 'Card Settings Updated',
        message: 'Card controls and spending limits have been applied.',
        type: 'info',
      });
    },
    [addToast],
  );

  const contributeToGoal = useCallback(
    (goalId: string, amount: number, fromAccountId: string) => {
      const rounded = Math.round(amount * 100) / 100;
      if (rounded <= 0) return { ok: false, error: 'Enter a valid amount.' };
      const fromAcc = state.accounts.find((a) => a.id === fromAccountId);
      if (!fromAcc) return { ok: false, error: 'Source account not found.' };
      if (fromAcc.balance < rounded) return { ok: false, error: 'Insufficient funds in source account.' };
      const goal = state.savingsGoals.find((g) => g.id === goalId);
      if (!goal) return { ok: false, error: 'Goal not found.' };

      const txId = nextId('tx');
      const tx: Transaction = {
        id: txId,
        date: today(),
        description: `Deposit to Goal: ${goal.name}`,
        merchant: 'Everstream Vault',
        amount: rounded,
        kind: 'debit',
        status: 'Completed',
        accountId: fromAcc.id,
        category: 'Savings',
      };

      setState((prev) => ({
        ...prev,
        accounts: prev.accounts.map((a) =>
          a.id === fromAcc.id ? { ...a, balance: Math.round((a.balance - rounded) * 100) / 100 } : a,
        ),
        savingsGoals: prev.savingsGoals.map((g) =>
          g.id === goalId ? { ...g, currentAmount: Math.round((g.currentAmount + rounded) * 100) / 100 } : g,
        ),
        transactions: [tx, ...prev.transactions],
      }));

      addToast({
        title: 'Goal Funded!',
        message: `Successfully transferred $${rounded.toLocaleString('en-US', { minimumFractionDigits: 2 })} to ${goal.name}.`,
        type: 'success',
      });

      return { ok: true };
    },
    [state.accounts, state.savingsGoals, addToast],
  );

  const addSavingsGoal = useCallback(
    (newGoal: Omit<SavingsGoal, 'id' | 'currentAmount'>) => {
      const id = nextId('goal');
      const goal: SavingsGoal = {
        ...newGoal,
        id,
        currentAmount: 0,
      };
      setState((prev) => ({
        ...prev,
        savingsGoals: [...prev.savingsGoals, goal],
      }));
      addToast({
        title: 'New Goal Created',
        message: `Target set for "${newGoal.name}" (${newGoal.targetDate}).`,
        type: 'success',
      });
    },
    [addToast],
  );

  const deleteSavingsGoal = useCallback(
    (goalId: string) => {
      setState((prev) => ({
        ...prev,
        savingsGoals: prev.savingsGoals.filter((g) => g.id !== goalId),
      }));
      addToast({
        title: 'Goal Removed',
        message: 'The savings goal has been deleted.',
        type: 'info',
      });
    },
    [addToast],
  );

  const totalBalance = useMemo(
    () => Math.round(state.accounts.reduce((s, a) => s + a.balance, 0) * 100) / 100,
    [state.accounts],
  );

  const value = useMemo<BankContextValue>(
    () => ({
      state,
      totalBalance,
      authenticated,
      theme,
      privacyMode,
      toasts,
      login,
      logout,
      toggleTheme,
      setTheme,
      togglePrivacyMode,
      setPrivacyMode,
      addToast,
      removeToast,
      transfer,
      validateTransfer,
      acknowledgeAlert,
      dismissAlert,
      updatePreferences,
      resetData,
      toggleFreezeCard,
      updateCardSettings,
      contributeToGoal,
      addSavingsGoal,
      deleteSavingsGoal,
    }),
    [
      state,
      totalBalance,
      authenticated,
      theme,
      privacyMode,
      toasts,
      login,
      logout,
      toggleTheme,
      setTheme,
      togglePrivacyMode,
      setPrivacyMode,
      addToast,
      removeToast,
      transfer,
      validateTransfer,
      acknowledgeAlert,
      dismissAlert,
      updatePreferences,
      resetData,
      toggleFreezeCard,
      updateCardSettings,
      contributeToGoal,
      addSavingsGoal,
      deleteSavingsGoal,
    ],
  );

  return <BankContext.Provider value={value}>{children}</BankContext.Provider>;
}

export function useBank() {
  const ctx = useContext(BankContext);
  if (!ctx) throw new Error('useBank must be used within BankProvider');
  return ctx;
}
