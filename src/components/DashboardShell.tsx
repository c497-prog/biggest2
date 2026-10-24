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
} from 'lucide-react';
import { useBank } from '@/context/BankContext';
import { Wordmark } from '@/components/Logo';
import { fmtMoney } from '@/lib/format';

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
  children,
}: {
  active: ViewKey;
  onNavigate: (v: ViewKey) => void;
  alertBadge: number;
  children: ReactNode;
}) {
  const { state, totalBalance, logout } = useBank();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const initials = useMemo(() => state.customer.avatarInitials, [state.customer]);

  const SidebarContent = (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between px-5 py-5">
        <Wordmark />
        <button
          className="rounded-lg p-1.5 text-ink-500 hover:bg-ink-100 lg:hidden"
          onClick={() => setMobileOpen(false)}
          aria-label="Close menu"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-2">
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
              className={`group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition ${
                isActive
                  ? 'bg-brand-50 text-brand-700 ring-1 ring-brand-100'
                  : 'text-ink-600 hover:bg-ink-100 hover:text-ink-900'
              }`}
            >
              <Icon className={`h-5 w-5 ${isActive ? 'text-brand-600' : 'text-ink-400 group-hover:text-ink-600'}`} />
              <span className="flex-1 text-left">{item.label}</span>
              {item.key === 'security' && alertBadge > 0 && (
                <span className="rounded-full bg-rose-500 px-1.5 py-0.5 text-[10px] font-bold text-white">
                  {alertBadge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      <div className="px-3 pb-3">
        <div className="rounded-xl bg-ink-50 p-3 ring-1 ring-ink-100">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-400">
            Total balance
          </p>
          <p className="mt-0.5 font-display text-lg font-extrabold text-ink-900">
            {fmtMoney(totalBalance)}
          </p>
        </div>
      </div>

      <div className="border-t border-ink-100 p-3">
        <button
          onClick={logout}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-ink-600 transition hover:bg-rose-50 hover:text-rose-600"
        >
          <LogOut className="h-5 w-5 text-ink-400" />
          Sign out
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-ink-100">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 hidden w-64 border-r border-ink-200 bg-white lg:block">
        {SidebarContent}
      </aside>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div
            className="absolute inset-0 bg-ink-950/40 backdrop-blur-sm animate-fade-in"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="absolute inset-y-0 left-0 w-72 bg-white shadow-xl animate-fade-in">
            {SidebarContent}
          </aside>
        </div>
      )}

      <div className="lg:pl-64">
        {/* Topbar */}
        <header className="sticky top-0 z-30 border-b border-ink-200 bg-white/80 backdrop-blur">
          <div className="flex h-16 items-center gap-3 px-4 sm:px-6">
            <button
              className="rounded-lg p-2 text-ink-600 hover:bg-ink-100 lg:hidden"
              onClick={() => setMobileOpen(true)}
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" />
            </button>

            <div className="relative hidden flex-1 max-w-md sm:block">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
              <input
                className="input pl-9 py-2"
                placeholder="Search transactions, payees…"
                onFocus={() => onNavigate('transactions')}
                readOnly
              />
            </div>

            <div className="ml-auto flex items-center gap-2">
              <button
                onClick={() => onNavigate('security')}
                className="relative rounded-lg p-2 text-ink-600 transition hover:bg-ink-100"
                aria-label="Security alerts"
              >
                <Bell className="h-5 w-5" />
                {alertBadge > 0 && (
                  <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-rose-500 ring-2 ring-white" />
                )}
              </button>

              <div className="relative">
                <button
                  onClick={() => setMenuOpen((o) => !o)}
                  className="flex items-center gap-2 rounded-xl border border-ink-200 bg-white py-1.5 pl-1.5 pr-3 transition hover:bg-ink-50"
                >
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600 text-xs font-bold text-white">
                    {initials}
                  </span>
                  <span className="hidden text-sm font-semibold text-ink-800 sm:block">
                    {state.customer.preferredName}
                  </span>
                  <ChevronDown className="h-4 w-4 text-ink-400" />
                </button>
                {menuOpen && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
                    <div className="absolute right-0 z-20 mt-2 w-56 origin-top-right animate-scale-in rounded-xl border border-ink-200 bg-white p-1 shadow-xl">
                      <div className="px-3 py-2">
                        <p className="text-sm font-semibold text-ink-800">{state.customer.fullName}</p>
                        <p className="truncate text-xs text-ink-400">{state.customer.email}</p>
                      </div>
                      <div className="my-1 h-px bg-ink-100" />
                      <button
                        onClick={() => {
                          onNavigate('profile');
                          setMenuOpen(false);
                        }}
                        className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-ink-700 hover:bg-ink-100"
                      >
                        <UserCog className="h-4 w-4 text-ink-400" /> Profile & Settings
                      </button>
                      <button
                        onClick={logout}
                        className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-rose-600 hover:bg-rose-50"
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
    </div>
  );
}
