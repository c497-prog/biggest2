import { useMemo, useState, type ReactNode } from 'react';
import {
  LayoutDashboard,
  ArrowLeftRight,
  Receipt,
  ShieldAlert,
  UserCog,
  LogOut,
  Bell,
  Search,
  Menu,
  X,
  ChevronDown,
  Sun,
  Moon,
} from 'lucide-react';
import { useBank } from '@/context/BankContext';
import { Wordmark } from '@/components/Logo';
import { fmtMoney } from '@/lib/format';
import { CommandPalette } from '@/components/CommandPalette';
import { ToastContainer } from '@/components/ToastContainer';
import type { Transaction } from '@/lib/types';

export type ViewKey = 'overview' | 'transfer' | 'transactions' | 'security' | 'profile';

interface NavItem {
  key: ViewKey;
  label: string;
  icon: typeof LayoutDashboard;
}

const NAV: NavItem[] = [
  { key: 'overview', label: 'Overview', icon: LayoutDashboard },
  { key: 'transfer', label: 'Transfer', icon: ArrowLeftRight },
  { key: 'transactions', label: 'Transactions', icon: Receipt },
  { key: 'security', label: 'Security', icon: ShieldAlert },
  { key: 'profile', label: 'Profile & Settings', icon: UserCog },
];

export function DashboardShell({
  active,
  onNavigate,
  alertBadge,
  onSelectTransaction,
  children,
}: {
  active: ViewKey;
  onNavigate: (v: ViewKey) => void;
  alertBadge: number;
  onSelectTransaction?: (tx: Transaction) => void;
  children: ReactNode;
}) {
  const { state, totalBalance, logout, theme, toggleTheme } = useBank();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [cmdOpen, setCmdOpen] = useState(false);

  const initials = useMemo(() => state.customer.avatarInitials, [state.customer]);

  const SidebarContent = (
    <div className="flex h-full flex-col bg-white dark:bg-ink-900 text-ink-900 dark:text-ink-100">
      <div className="flex items-center justify-between px-5 py-5 border-b border-ink-100 dark:border-ink-800/80">
        <Wordmark />
        <button
          className="rounded-lg p-1.5 text-ink-500 hover:bg-ink-100 dark:text-ink-400 dark:hover:bg-ink-800 lg:hidden"
          onClick={() => setMobileOpen(false)}
          aria-label="Close menu"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-3">
        {NAV.map((item) => {
          const Icon = item.icon;
          const isActive = active === item.key;
          return (
            <button
              key={item.key}
              onClick={() => {
                onNavigate(item.key);
                setMobileOpen(false);
              }}
              className={`group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition cursor-pointer ${
                isActive
                  ? 'bg-brand-50 text-brand-700 ring-1 ring-brand-100 dark:bg-brand-950/60 dark:text-brand-300 dark:ring-brand-800/80'
                  : 'text-ink-600 hover:bg-ink-100 hover:text-ink-900 dark:text-ink-400 dark:hover:bg-ink-800/60 dark:hover:text-ink-200'
              }`}
            >
              <Icon
                className={`h-5 w-5 ${
                  isActive
                    ? 'text-brand-600 dark:text-brand-400'
                    : 'text-ink-400 group-hover:text-ink-600 dark:text-ink-500 dark:group-hover:text-ink-300'
                }`}
              />
              <span className="flex-1 text-left">{item.label}</span>
              {item.key === 'security' && alertBadge > 0 && (
                <span className="rounded-full bg-rose-500 px-1.5 py-0.5 text-[10px] font-bold text-white shadow-sm">
                  {alertBadge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      <div className="px-3 pb-3">
        <div className="rounded-xl bg-ink-50 p-3 ring-1 ring-ink-100 dark:bg-ink-800/50 dark:ring-ink-700/50">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-400 dark:text-ink-400">
            Total balance
          </p>
          <p className="mt-0.5 font-display text-lg font-extrabold text-ink-900 dark:text-ink-100">
            {fmtMoney(totalBalance)}
          </p>
        </div>
      </div>

      <div className="border-t border-ink-100 p-3 dark:border-ink-800">
        <button
          onClick={logout}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-ink-600 transition hover:bg-rose-50 hover:text-rose-600 dark:text-ink-400 dark:hover:bg-rose-950/50 dark:hover:text-rose-400 cursor-pointer"
        >
          <LogOut className="h-5 w-5 text-ink-400 dark:text-ink-500" />
          Sign out
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-ink-100 dark:bg-ink-950 transition-colors duration-200">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 hidden w-64 border-r border-ink-200 bg-white lg:block dark:border-ink-800 dark:bg-ink-900">
        {SidebarContent}
      </aside>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div
            className="absolute inset-0 bg-ink-950/50 backdrop-blur-sm animate-fade-in"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="absolute inset-y-0 left-0 w-72 bg-white shadow-2xl animate-fade-in dark:bg-ink-900">
            {SidebarContent}
          </aside>
        </div>
      )}

      <div className="lg:pl-64">
        {/* Topbar */}
        <header className="sticky top-0 z-30 border-b border-ink-200 bg-white/80 backdrop-blur-md dark:border-ink-800 dark:bg-ink-900/80">
          <div className="flex h-16 items-center gap-3 px-4 sm:px-6">
            <button
              className="rounded-lg p-2 text-ink-600 hover:bg-ink-100 dark:text-ink-300 dark:hover:bg-ink-800 lg:hidden cursor-pointer"
              onClick={() => setMobileOpen(true)}
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" />
            </button>

            {/* Global Search trigger for Command Palette */}
            <button
              type="button"
              onClick={() => setCmdOpen(true)}
              className="relative hidden flex-1 max-w-md sm:flex items-center justify-between rounded-xl border border-ink-200 bg-ink-50/70 px-3.5 py-2 text-sm text-ink-400 hover:border-brand-400 hover:bg-white dark:border-ink-700/80 dark:bg-ink-900/60 dark:text-ink-500 dark:hover:border-brand-500 dark:hover:bg-ink-900 transition cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <Search className="h-4 w-4 text-ink-400 dark:text-ink-500" />
                <span className="truncate">Search transactions, payees, commands…</span>
              </div>
              <kbd className="inline-flex items-center gap-0.5 rounded-md border border-ink-200 bg-white px-2 py-0.5 text-[11px] font-semibold text-ink-500 shadow-sm dark:border-ink-700 dark:bg-ink-800 dark:text-ink-300">
                <span className="text-xs">⌘</span>K
              </kbd>
            </button>

            {/* Mobile search trigger */}
            <button
              onClick={() => setCmdOpen(true)}
              className="rounded-lg p-2 text-ink-600 hover:bg-ink-100 sm:hidden dark:text-ink-300 dark:hover:bg-ink-800 cursor-pointer"
              aria-label="Open command palette"
            >
              <Search className="h-5 w-5" />
            </button>

            <div className="ml-auto flex items-center gap-2">
              {/* Theme Toggle (Sun/Moon) */}
              <button
                onClick={toggleTheme}
                className="rounded-lg p-2 text-ink-600 transition hover:bg-ink-100 dark:text-ink-300 dark:hover:bg-ink-800 cursor-pointer"
                aria-label="Toggle theme"
                title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              >
                {theme === 'dark' ? (
                  <Sun className="h-5 w-5 text-amber-400" />
                ) : (
                  <Moon className="h-5 w-5 text-ink-600" />
                )}
              </button>

              {/* Security alerts bell */}
              <button
                onClick={() => onNavigate('security')}
                className="relative rounded-lg p-2 text-ink-600 transition hover:bg-ink-100 dark:text-ink-300 dark:hover:bg-ink-800 cursor-pointer"
                aria-label="Security alerts"
              >
                <Bell className="h-5 w-5" />
                {alertBadge > 0 && (
                  <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-rose-500 ring-2 ring-white dark:ring-ink-900" />
                )}
              </button>

              {/* User Menu */}
              <div className="relative">
                <button
                  onClick={() => setMenuOpen((o) => !o)}
                  className="flex items-center gap-2 rounded-xl border border-ink-200 bg-white py-1.5 pl-1.5 pr-3 transition hover:bg-ink-50 dark:border-ink-700 dark:bg-ink-900 dark:hover:bg-ink-800 cursor-pointer"
                >
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600 text-xs font-bold text-white shadow-sm">
                    {initials}
                  </span>
                  <span className="hidden text-sm font-semibold text-ink-800 dark:text-ink-100 sm:block">
                    {state.customer.preferredName}
                  </span>
                  <ChevronDown className="h-4 w-4 text-ink-400 dark:text-ink-500" />
                </button>
                {menuOpen && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
                    <div className="absolute right-0 z-20 mt-2 w-56 origin-top-right animate-scale-in rounded-xl border border-ink-200 bg-white p-1 shadow-xl dark:border-ink-700 dark:bg-ink-900">
                      <div className="px-3 py-2">
                        <p className="text-sm font-semibold text-ink-800 dark:text-ink-100">
                          {state.customer.fullName}
                        </p>
                        <p className="truncate text-xs text-ink-400 dark:text-ink-500">
                          {state.customer.email}
                        </p>
                      </div>
                      <div className="my-1 h-px bg-ink-100 dark:bg-ink-800" />
                      <button
                        onClick={() => {
                          onNavigate('profile');
                          setMenuOpen(false);
                        }}
                        className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-ink-700 hover:bg-ink-100 dark:text-ink-300 dark:hover:bg-ink-800 cursor-pointer"
                      >
                        <UserCog className="h-4 w-4 text-ink-400" /> Profile & Settings
                      </button>
                      <button
                        onClick={() => {
                          toggleTheme();
                          setMenuOpen(false);
                        }}
                        className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-ink-700 hover:bg-ink-100 dark:text-ink-300 dark:hover:bg-ink-800 cursor-pointer"
                      >
                        {theme === 'dark' ? (
                          <Sun className="h-4 w-4 text-amber-400" />
                        ) : (
                          <Moon className="h-4 w-4 text-ink-400" />
                        )}
                        {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
                      </button>
                      <div className="my-1 h-px bg-ink-100 dark:bg-ink-800" />
                      <button
                        onClick={logout}
                        className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 cursor-pointer"
                      >
                        <LogOut className="h-4 w-4" /> Sign out
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:py-8">{children}</main>
      </div>

      {/* Global Command Palette */}
      <CommandPalette
        open={cmdOpen}
        onClose={() => setCmdOpen(false)}
        onNavigate={onNavigate}
        onSelectTransaction={onSelectTransaction}
      />

      {/* Toast Notification Container */}
      <ToastContainer />
    </div>
  );
}
