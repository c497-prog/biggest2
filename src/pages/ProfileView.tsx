import { useState } from 'react';
import {
  Mail,
  Phone,
  MapPin,
  Briefcase,
  CalendarDays,
  Globe,
  Bell,
  ShieldCheck,
  FileText,
  RotateCcw,
  Check,
  Sun,
  Moon,
  EyeOff,
} from 'lucide-react';
import { useBank } from '@/context/BankContext';
import { fmtDate } from '@/lib/format';
import { Modal } from '@/components/Modal';
import { CardManager } from '@/components/CardManager';
import { SavingsGoals } from '@/components/SavingsGoals';
import type { Preferences } from '@/lib/types';

const LANGUAGES: { code: Preferences['language']; label: string; flag: string }[] = [
  { code: 'en', label: 'English', flag: 'EN' },
  { code: 'es', label: 'Español', flag: 'ES' },
  { code: 'fr', label: 'Français', flag: 'FR' },
];

export function ProfileView() {
  const { state, updatePreferences, resetData, theme, setTheme, privacyMode, togglePrivacyMode } = useBank();
  const c = state.customer;
  const p = state.preferences;
  const [resetOpen, setResetOpen] = useState(false);
  const [saved, setSaved] = useState(false);

  const toggle = (key: keyof Preferences) => () => {
    updatePreferences({ [key]: !p[key] } as Partial<Preferences>);
    setSaved(true);
    setTimeout(() => setSaved(false), 1400);
  };

  const handleTogglePrivacy = () => {
    togglePrivacyMode();
    setSaved(true);
    setTimeout(() => setSaved(false), 1400);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-extrabold text-ink-900 dark:text-ink-100">
            Profile & Settings
          </h1>
          <p className="mt-1 text-sm text-ink-500 dark:text-ink-400">
            Manage your personal information, security preferences, and display theme.
          </p>
        </div>
        {saved && (
          <span className="inline-flex items-center gap-1.5 self-start rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:ring-emerald-800">
            <Check className="h-3.5 w-3.5" /> Saved
          </span>
        )}
      </div>

      {/* Customer card */}
      <div className="card overflow-hidden">
        <div className="relative h-24 bg-gradient-to-br from-brand-500 to-brand-700">
          <div className="absolute -bottom-10 left-6">
            <div className="flex h-20 w-20 items-center justify-center rounded-2xl border-4 border-white bg-brand-600 font-display text-2xl font-extrabold text-white shadow-card dark:border-ink-900">
              {c.avatarInitials}
            </div>
          </div>
        </div>
        <div className="px-6 pb-6 pt-12">
          <h2 className="font-display text-xl font-bold text-ink-900 dark:text-ink-100">{c.fullName}</h2>
          <p className="text-sm text-ink-500 dark:text-ink-400">{c.occupation}</p>
          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <InfoRow icon={Mail} label="Email" value={c.email} />
            <InfoRow icon={Phone} label="Phone" value={c.phone} />
            <InfoRow icon={MapPin} label="Address" value={c.address} />
            <InfoRow icon={Briefcase} label="Occupation" value={c.occupation} />
            <InfoRow icon={CalendarDays} label="Member since" value={fmtDate(c.memberSince)} />
          </div>
        </div>
      </div>

      {/* Virtual Debit Card Controls */}
      <CardManager />

      {/* Savings & Financial Goals Vaults */}
      <SavingsGoals />

      {/* Preferences Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Appearance / Theme */}
        <div className="card p-6">
          <div className="flex items-center gap-2">
            <Sun className="h-5 w-5 text-brand-600 dark:text-brand-400" />
            <h3 className="font-display text-base font-bold text-ink-900 dark:text-ink-100">
              Appearance & Theme
            </h3>
          </div>
          <p className="mt-1 text-sm text-ink-500 dark:text-ink-400">
            Customize the color theme for your banking interface.
          </p>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <button
              onClick={() => setTheme('light')}
              className={`flex items-center gap-3 rounded-xl border p-3.5 text-left transition cursor-pointer ${
                theme === 'light'
                  ? 'border-brand-500 bg-brand-50/70 ring-1 ring-brand-300 dark:bg-brand-950/60 text-brand-900 dark:text-brand-100'
                  : 'border-ink-200 bg-white hover:bg-ink-50 dark:border-ink-800 dark:bg-ink-900/60 dark:hover:bg-ink-800'
              }`}
            >
              <Sun className={`h-5 w-5 ${theme === 'light' ? 'text-brand-600' : 'text-ink-400'}`} />
              <div>
                <span className="block text-sm font-semibold text-ink-900 dark:text-ink-100">
                  Light Mode
                </span>
                <span className="text-[11px] text-ink-500 dark:text-ink-400">Crisp high-contrast</span>
              </div>
            </button>

            <button
              onClick={() => setTheme('dark')}
              className={`flex items-center gap-3 rounded-xl border p-3.5 text-left transition cursor-pointer ${
                theme === 'dark'
                  ? 'border-brand-500 bg-brand-50/70 ring-1 ring-brand-400 dark:bg-brand-950/60 text-brand-900 dark:text-brand-100'
                  : 'border-ink-200 bg-white hover:bg-ink-50 dark:border-ink-800 dark:bg-ink-900/60 dark:hover:bg-ink-800'
              }`}
            >
              <Moon className={`h-5 w-5 ${theme === 'dark' ? 'text-brand-400' : 'text-ink-400'}`} />
              <div>
                <span className="block text-sm font-semibold text-ink-900 dark:text-ink-100">
                  Dark Mode
                </span>
                <span className="text-[11px] text-ink-500 dark:text-ink-400">Sleek OLED dark</span>
              </div>
            </button>
          </div>
        </div>

        {/* Language */}
        <div className="card p-6">
          <div className="flex items-center gap-2">
            <Globe className="h-5 w-5 text-brand-600 dark:text-brand-400" />
            <h3 className="font-display text-base font-bold text-ink-900 dark:text-ink-100">
              Language
            </h3>
          </div>
          <p className="mt-1 text-sm text-ink-500 dark:text-ink-400">
            Choose your preferred display language.
          </p>
          <div className="mt-4 grid grid-cols-3 gap-2">
            {LANGUAGES.map((l) => {
              const activeLang = p.language === l.code;
              return (
                <button
                  key={l.code}
                  onClick={() => updatePreferences({ language: l.code })}
                  className={`rounded-xl border p-3 text-left transition cursor-pointer ${
                    activeLang
                      ? 'border-brand-400 bg-brand-50 ring-1 ring-brand-200 dark:border-brand-500 dark:bg-brand-950/60 dark:ring-brand-800'
                      : 'border-ink-200 bg-white hover:bg-ink-50 dark:border-ink-800 dark:bg-ink-900/60 dark:hover:bg-ink-800'
                  }`}
                >
                  <span className="block text-xs font-bold tracking-wider text-ink-400">{l.flag}</span>
                  <span className="mt-0.5 block text-sm font-semibold text-ink-800 dark:text-ink-200">
                    {l.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Notifications */}
        <div className="card p-6">
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-brand-600 dark:text-brand-400" />
            <h3 className="font-display text-base font-bold text-ink-900 dark:text-ink-100">
              Notifications
            </h3>
          </div>
          <div className="mt-4 space-y-1">
            <Toggle
              icon={Mail}
              label="Email alerts"
              desc="Receive transaction and security alerts by email"
              on={p.emailAlerts}
              onToggle={toggle('emailAlerts')}
            />
            <Toggle
              icon={Bell}
              label="Push notifications"
              desc="Real-time alerts on your devices"
              on={p.pushAlerts}
              onToggle={toggle('pushAlerts')}
            />
          </div>
        </div>

        {/* Security & Statements */}
        <div className="card p-6">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-brand-600 dark:text-brand-400" />
            <h3 className="font-display text-base font-bold text-ink-900 dark:text-ink-100">
              Security & Statements
            </h3>
          </div>
          <div className="mt-4 space-y-1">
            <Toggle
              icon={ShieldCheck}
              label="Two-step challenge"
              desc="Require a second step for new transfers"
              on={p.twoStepChallenge}
              onToggle={toggle('twoStepChallenge')}
            />
            <Toggle
              icon={FileText}
              label="Paperless statements"
              desc="Receive statements electronically"
              on={p.paperlessStatements}
              onToggle={toggle('paperlessStatements')}
            />
            <Toggle
              icon={EyeOff}
              label="Screenshot Privacy Mode"
              desc="Blur transaction descriptions, categories, and amounts for safe screenshots"
              on={privacyMode}
              onToggle={handleTogglePrivacy}
            />
          </div>
        </div>

        {/* Account Data Reset */}
        <div className="card p-6 lg:col-span-2">
          <div className="flex items-center gap-2">
            <RotateCcw className="h-5 w-5 text-rose-500" />
            <h3 className="font-display text-base font-bold text-ink-900 dark:text-ink-100">
              Account Data Management
            </h3>
          </div>
          <p className="mt-1 text-sm text-ink-500 dark:text-ink-400">
            Restore balances, transactions, goals, and alerts to their original demo state.
          </p>
          <button
            onClick={() => setResetOpen(true)}
            className="btn-outline mt-4 border-rose-200 text-rose-600 hover:bg-rose-50 dark:border-rose-900 dark:text-rose-400 dark:hover:bg-rose-950/50 cursor-pointer"
          >
            <RotateCcw className="h-4 w-4" /> Reset account data
          </button>
        </div>
      </div>

      <Modal
        open={resetOpen}
        onClose={() => setResetOpen(false)}
        title="Reset account data?"
        size="sm"
        icon={
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-rose-50 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400">
            <RotateCcw className="h-5 w-5" />
          </span>
        }
        footer={
          <>
            <button className="btn-ghost" onClick={() => setResetOpen(false)}>
              Cancel
            </button>
            <button
              className="btn-primary bg-rose-600 hover:bg-rose-700 focus:ring-rose-500/30"
              onClick={() => {
                resetData();
                setResetOpen(false);
              }}
            >
              Reset
            </button>
          </>
        }
      >
        <p className="text-sm text-ink-600 dark:text-ink-300">
          This restores all accounts, virtual cards, savings goals, transactions, and alerts to their
          original seed values. Any transfers or goals you've created will be reset.
        </p>
      </Modal>
    </div>
  );
}

function InfoRow({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Mail;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3 rounded-xl bg-ink-50 p-3 ring-1 ring-ink-100 dark:bg-ink-800/50 dark:ring-ink-700/50">
      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-ink-400 dark:text-ink-500" />
      <div className="min-w-0">
        <p className="text-xs font-semibold uppercase tracking-wide text-ink-500 dark:text-ink-400">
          {label}
        </p>
        <p className="truncate text-sm font-semibold text-ink-800 dark:text-ink-100">{value}</p>
      </div>
    </div>
  );
}

function Toggle({
  icon: Icon,
  label,
  desc,
  on,
  onToggle,
}: {
  icon: typeof Mail;
  label: string;
  desc: string;
  on: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl px-2 py-2.5 transition hover:bg-ink-50 dark:hover:bg-ink-800/60">
      <div className="flex items-start gap-3">
        <Icon className="mt-0.5 h-4 w-4 shrink-0 text-ink-400 dark:text-ink-500" />
        <div>
          <p className="text-sm font-semibold text-ink-800 dark:text-ink-100">{label}</p>
          <p className="text-xs text-ink-400 dark:text-ink-500">{desc}</p>
        </div>
      </div>
      <button
        onClick={onToggle}
        role="switch"
        aria-checked={on}
        className={`relative h-6 w-11 shrink-0 rounded-full transition cursor-pointer ${
          on ? 'bg-brand-600' : 'bg-ink-200 dark:bg-ink-700'
        }`}
      >
        <span
          className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition ${
            on ? 'left-[1.4rem]' : 'left-0.5'
          }`}
        />
      </button>
    </div>
  );
}
