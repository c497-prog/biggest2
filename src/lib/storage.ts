import type { BankState } from './types';
import { SEED_STATE } from './seed';

const KEY = 'everstream.bank.state.v1';

export function loadState(): BankState {
  if (typeof window === 'undefined') return structuredClone(SEED_STATE);
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return structuredClone(SEED_STATE);
    const parsed = JSON.parse(raw) as Partial<BankState>;
    // shallow-merge with seed so new fields are present
    return {
      ...structuredClone(SEED_STATE),
      ...parsed,
      customer: { ...SEED_STATE.customer, ...parsed.customer },
      preferences: { ...SEED_STATE.preferences, ...parsed.preferences },
      accounts: parsed.accounts ?? SEED_STATE.accounts,
      transactions: parsed.transactions ?? SEED_STATE.transactions,
      alerts: parsed.alerts ?? SEED_STATE.alerts,
    };
  } catch {
    return structuredClone(SEED_STATE);
  }
}

export function saveState(state: BankState) {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    /* ignore quota / private mode */
  }
}

export function resetState() {
  try {
    window.localStorage.removeItem(KEY);
  } catch {
    /* ignore */
  }
}

export const STORAGE_KEY = KEY;
