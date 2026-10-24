import { useEffect, useMemo, useState } from 'react';
import {
  Search,
  LayoutDashboard,
  ArrowLeftRight,
  Receipt,
  ShieldAlert,
  UserCog,
  Sun,
  Moon,
  Snowflake,
  Download,
  ArrowRight,
  CreditCard,
  Target,
  X,
  Eye,
  EyeOff,
} from 'lucide-react';
import { useBank } from '@/context/BankContext';
import { fmtMoney } from '@/lib/format';
import type { ViewKey } from '@/components/DashboardShell';
import type { Transaction } from '@/lib/types';

interface CommandPaletteProps {
  open: boolean;
  onClose: () => void;
  onNavigate: (view: ViewKey) => void;
  onSelectTransaction?: (tx: Transaction) => void;
}

export function CommandPalette({
  open,
  onClose,
  onNavigate,
  onSelectTransaction,
}: CommandPaletteProps) {
  const { state, theme, toggleTheme, toggleFreezeCard, privacyMode, togglePrivacyMode } = useBank();
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Global shortcut listener: ⌘K or Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (open) onClose();
        else setQuery('');
      } else if (e.key === 'Escape' && open) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose]);

  // Reset index when query changes
  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  const card = state.cards[0];

  const items = useMemo(() => {
    const q = query.trim().toLowerCase();

    const navItems = [
      {
        id: 'nav-overview',
        category: 'Navigation',
        title: 'Overview Dashboard',
        subtitle: 'Account balances and spending summary',
        icon: LayoutDashboard,
        action: () => onNavigate('overview'),
      },
      {
        id: 'nav-transfer',
        category: 'Navigation',
        title: 'Transfer Money',
        subtitle: 'Move funds between your accounts',
        icon: ArrowLeftRight,
        action: () => onNavigate('transfer'),
      },
      {
        id: 'nav-transactions',
        category: 'Navigation',
        title: 'Transactions & Records',
        subtitle: 'Search and export transaction history',
        icon: Receipt,
        action: () => onNavigate('transactions'),
      },
      {
        id: 'nav-security',
        category: 'Navigation',
        title: 'Security Center',
        subtitle: 'Holds, fraud prevention, and alerts',
        icon: ShieldAlert,
        action: () => onNavigate('security'),
      },
      {
        id: 'nav-profile',
        category: 'Navigation',
        title: 'Profile & Settings',
        subtitle: 'Member details and application preferences',
        icon: UserCog,
        action: () => onNavigate('profile'),
      },
    ];

    const actionItems = [
      {
        id: 'action-theme',
        category: 'Actions',
        title: theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode',
        subtitle: `Currently using ${theme} theme`,
        icon: theme === 'dark' ? Sun : Moon,
        action: () => toggleTheme(),
      },
      {
        id: 'action-privacy',
        category: 'Actions',
        title: privacyMode ? 'Disable Screenshot Privacy Mode' : 'Enable Screenshot Privacy Mode',
        subtitle: privacyMode
          ? 'Transaction details are currently blurred'
          : 'Blur transaction descriptions and amounts for safe screenshots',
        icon: privacyMode ? EyeOff : Eye,
        action: () => {
          togglePrivacyMode();
        },
      },
      {
        id: 'action-card-freeze',
        category: 'Actions',
        title: card?.isFrozen ? 'Unfreeze Virtual Card' : 'Freeze Virtual Card',
        subtitle: card?.isFrozen ? 'Resume card transactions' : 'Temporarily lock debit card',
        icon: Snowflake,
        action: () => {
          if (card) toggleFreezeCard(card.id);
        },
      },
      {
        id: 'action-csv',
        category: 'Actions',
        title: 'View Transactions for CSV Export',
        subtitle: 'Download full transaction ledger',
        icon: Download,
        action: () => onNavigate('transactions'),
      },
      {
        id: 'action-cards-settings',
        category: 'Actions',
        title: 'Manage Virtual Debit Card',
        subtitle: 'View card limits and controls in Settings',
        icon: CreditCard,
        action: () => onNavigate('profile'),
      },
      {
        id: 'action-goals-settings',
        category: 'Actions',
        title: 'View Savings Goals & Vaults',
        subtitle: 'Manage financial targets in Settings',
        icon: Target,
        action: () => onNavigate('profile'),
      },
    ];

    const accountItems = state.accounts.map((acc) => ({
      id: `acc-${acc.id}`,
      category: 'Accounts',
      title: acc.name,
      subtitle: `${acc.number} · Balance ${fmtMoney(acc.balance)}`,
      icon: CreditCard,
      action: () => onNavigate('overview'),
    }));

    const matchedTxs = q
      ? state.transactions
          .filter(
            (t) =>
              t.description.toLowerCase().includes(q) ||
              t.merchant.toLowerCase().includes(q) ||
              t.category.toLowerCase().includes(q),
          )
          .slice(0, 5)
          .map((t) => ({
            id: `tx-${t.id}`,
            category: 'Transactions',
            title: t.description,
            subtitle: `${t.date} · ${t.category} · ${fmtMoney(t.amount)}`,
            icon: Receipt,
            action: () => {
              if (onSelectTransaction) onSelectTransaction(t);
              else onNavigate('transactions');
            },
          }))
      : [];

    const all = [...navItems, ...actionItems, ...accountItems, ...matchedTxs];

    if (!q) return all;

    return all.filter(
      (item) =>
        item.title.toLowerCase().includes(q) ||
        item.subtitle.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q),
    );
  }, [query, onNavigate, onSelectTransaction, theme, toggleTheme, card, toggleFreezeCard, privacyMode, togglePrivacyMode, state.accounts, state.transactions]);

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % Math.max(1, items.length));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + items.length) % Math.max(1, items.length));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (items[selectedIndex]) {
        items[selectedIndex].action();
        onClose();
      }
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-16 sm:pt-24 animate-fade-in">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-ink-950/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Palette Box */}
      <div className="relative w-full max-w-xl overflow-hidden rounded-2xl border border-ink-200 bg-white shadow-2xl dark:border-ink-700/80 dark:bg-ink-900 animate-scale-in">
        {/* Search Input Bar */}
        <div className="flex items-center gap-3 border-b border-ink-100 px-4 py-3.5 dark:border-ink-800">
          <Search className="h-5 w-5 text-ink-400 shrink-0" />
          <input
            type="text"
            className="flex-1 bg-transparent text-sm text-ink-900 placeholder:text-ink-400 outline-none dark:text-ink-100 dark:placeholder:text-ink-500"
            placeholder="Type a command or search accounts, transactions…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            autoFocus
          />
          <div className="flex items-center gap-1.5">
            <kbd className="hidden sm:inline-block rounded-md border border-ink-200 bg-ink-50 px-1.5 py-0.5 text-[10px] font-semibold text-ink-500 dark:border-ink-700 dark:bg-ink-800 dark:text-ink-400">
              ESC
            </kbd>
            <button
              onClick={onClose}
              className="text-ink-400 hover:text-ink-700 dark:hover:text-ink-200 p-1 rounded-lg"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Results List */}
        <div className="max-h-80 overflow-y-auto p-2 scrollbar-thin">
          {items.length === 0 ? (
            <div className="py-12 text-center text-sm text-ink-400">
              No matching commands or transactions found for "{query}".
            </div>
          ) : (
            <div className="space-y-1">
              {items.map((item, idx) => {
                const Icon = item.icon;
                const isSelected = idx === selectedIndex;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      item.action();
                      onClose();
                    }}
                    onMouseEnter={() => setSelectedIndex(idx)}
                    className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-xs transition cursor-pointer ${
                      isSelected
                        ? 'bg-brand-50 text-brand-900 ring-1 ring-brand-200/80 dark:bg-brand-950/70 dark:text-brand-100 dark:ring-brand-800/80'
                        : 'text-ink-700 hover:bg-ink-50 dark:text-ink-300 dark:hover:bg-ink-800/50'
                    }`}
                  >
                    <span
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                        isSelected
                          ? 'bg-brand-600 text-white dark:bg-brand-500'
                          : 'bg-ink-100 text-ink-500 dark:bg-ink-800 dark:text-ink-400'
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">{item.title}</span>
                        <span className="text-[10px] uppercase font-bold tracking-wider text-ink-400 dark:text-ink-500">
                          {item.category}
                        </span>
                      </div>
                      <p className="truncate text-[11px] opacity-75">{item.subtitle}</p>
                    </div>
                    {isSelected && (
                      <span className="flex items-center gap-1 text-[11px] font-semibold text-brand-600 dark:text-brand-400">
                        Select <ArrowRight className="h-3 w-3" />
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="flex items-center justify-between border-t border-ink-100 bg-ink-50/70 px-4 py-2 text-[11px] text-ink-400 dark:border-ink-800 dark:bg-ink-950/70 dark:text-ink-500">
          <div className="flex items-center gap-3">
            <span>
              <kbd className="font-mono font-semibold">↑↓</kbd> to navigate
            </span>
            <span>
              <kbd className="font-mono font-semibold">↵</kbd> to execute
            </span>
          </div>
          <span>Everstream Command Engine</span>
        </div>
      </div>
    </div>
  );
}
