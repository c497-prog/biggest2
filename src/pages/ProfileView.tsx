import { useState } from 'react';
import { Mail, Phone, MapPin, Briefcase, CalendarDays, Globe, Bell, ShieldCheck, FileText, RotateCcw, Check } from 'lucide-react';
import { useBank } from '@/context/BankContext';
import { fmtDate } from '@/lib/format';
import { Modal } from '@/components/Modal';
import type { Preferences } from '@/lib/types';

const LANGUAGES: { code: Preferences['language']; label: string; flag: string }[] = [
  { code: 'en', label: 'English', flag: 'EN' },
  { code: 'es', label: 'Español', flag: 'ES' },
  { code: 'fr', label: 'Français', flag: 'FR' },
];

export function ProfileView() {
  const { state, updatePreferences, resetData } = useBank();
  const c = state.customer;
  const p = state.preferences;
  const [resetOpen, setResetOpen] = useState(false);
  const [saved, setSaved] = useState(false);

  const toggle = (key: keyof Preferences) => () => {
    updatePreferences({ [key]: !p[key] } as Partial<Preferences>);
    setSaved(true);
    setTimeout(() => setSaved(false), 1400);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-extrabold text-ink-900">Profile & Settings</h1>
          <p className="mt-1 text-sm text-ink-500">
            Manage your personal information and account preferences.
          </p>
        </div>
        {saved && (
          <span className="inline-flex items-center gap-1.5 self-start rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-200">
            <Check className="h-3.5 w-3.5" /> Saved
          </span>
        )}
      </div>

      {/* Customer card */}
      <div className="card overflow-hidden">
        <div className="relative h-24 bg-gradient-to-br from-brand-500 to-brand-700">
          <div className="absolute -bottom-10 left-6">
            <div className="flex h-20 w-20 items-center justify-center rounded-2xl border-4 border-white bg-brand-600 font-display text-2xl font-extrabold text-white shadow-card">
              {c.avatarInitials}
            </div>
          </div>
        </div>
        <div className="px-6 pb-6 pt-12">
          <h2 className="font-display text-xl font-bold text-ink-900">{c.fullName}</h2>
          <p className="text-sm text-ink-500">{c.occupation}</p>
          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <InfoRow icon={Mail} label="Email" value={c.email} />
            <InfoRow icon={Phone} label="Phone" value={c.phone} />
            <InfoRow icon={MapPin} label="Address" value={c.address} />
            <InfoRow icon={Briefcase} label="Occupation" value={c.occupation} />
            <InfoRow icon={CalendarDays} label="Member since" value={fmtDate(c.memberSince)} />
          </div>
        </div>
      </div>

      {/* Preferences */}
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="card p-6">
          <div className="flex items-center gap-2">
            <Globe className="h-5 w-5 text-brand-600" />
            <h3 className="font-display text-base font-bold text-ink-900">Language</h3>
          </div>
          <p className="mt-1 text-sm text-ink-500">Choose your preferred display language.</p>
          <div className="mt-4 grid grid-cols-3 gap-2">
            {LANGUAGES.map((l) => {
              const activeLang = p.language === l.code;
              return (
                <button
                  key={l.code}
                  onClick={() => updatePreferences({ language: l.code })}
                  className={`rounded-xl border p-3 text-left transition ${
                    activeLang
                      ? 'border-brand-400 bg-brand-50 ring-1 ring-brand-200'
                      : 'border-ink-200 bg-white hover:bg-ink-50'
                  }`}
                >
                  <span className="block text-xs font-bold tracking-wider text-ink-400">{l.flag}</span>
                  <span className="mt-0.5 block text-sm font-semibold text-ink-800">{l.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-brand-600" />
            <h3 className="font-display text-base font-bold text-ink-900">Notifications</h3>
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

        <div className="card p-6">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-brand-600" />
            <h3 className="font-display text-base font-bold text-ink-900">Security</h3>
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
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center gap-2">
            <RotateCcw className="h-5 w-5 text-rose-500" />
            <h3 className="font-display text-base font-bold text-ink-900">Account data</h3>
          </div>
          <p className="mt-1 text-sm text-ink-500">
            Restore balances, transactions, and alerts to their original values.
          </p>
          <button
            onClick={() => setResetOpen(true)}
            className="btn-outline mt-4 border-rose-200 text-rose-600 hover:bg-rose-50"
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
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-rose-50 text-rose-600">
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
        <p className="text-sm text-ink-600">
          This restores all accounts, transactions, and alerts to their original state. Any transfers
          you've made will be undone.
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
    <div className="flex items-start gap-3 rounded-xl bg-ink-50 p-3 ring-1 ring-ink-100">
      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-ink-400" />
      <div className="min-w-0">
        <p className="text-xs font-semibold uppercase tracking-wide text-ink-500">{label}</p>
        <p className="truncate text-sm font-semibold text-ink-800">{value}</p>
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
    <div className="flex items-center justify-between gap-3 rounded-xl px-2 py-2.5 transition hover:bg-ink-50">
      <div className="flex items-start gap-3">
        <Icon className="mt-0.5 h-4 w-4 shrink-0 text-ink-400" />
        <div>
          <p className="text-sm font-semibold text-ink-800">{label}</p>
          <p className="text-xs text-ink-400">{desc}</p>
        </div>
      </div>
      <button
        onClick={onToggle}
        role="switch"
        aria-checked={on}
        className={`relative h-6 w-11 shrink-0 rounded-full transition ${
          on ? 'bg-brand-600' : 'bg-ink-200'
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
