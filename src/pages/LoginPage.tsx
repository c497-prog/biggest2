import { useState } from 'react';
import { ShieldCheck, Lock, User, Eye, EyeOff, ArrowRight, AlertTriangle } from 'lucide-react';
import { useBank } from '@/context/BankContext';
import { DEMO_CREDENTIALS } from '@/lib/seed';
import { Wordmark } from '@/components/Logo';

export function LoginPage() {
  const { login } = useBank();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const fillDemo = () => {
    setUsername(DEMO_CREDENTIALS.username);
    setPassword(DEMO_CREDENTIALS.password);
    setError(null);
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    // simulate a short auth round-trip
    setTimeout(() => {
      const ok = login(username, password);
      if (!ok) setError('Invalid credentials. Use the demo login shown on the right.');
      setLoading(false);
    }, 550);
  };

  return (
    <div className="min-h-screen w-full bg-ink-100">
      <div className="grid min-h-screen lg:grid-cols-2">
        {/* Brand panel */}
        <aside className="relative hidden overflow-hidden bg-ink-950 text-white lg:flex lg:flex-col lg:justify-between lg:p-10">
          <div className="absolute inset-0">
            <div className="absolute -left-24 top-10 h-72 w-72 rounded-full bg-brand-500/20 blur-3xl" />
            <div className="absolute bottom-0 right-0 h-96 w-96 rounded-full bg-brand-700/30 blur-3xl" />
            <div
              className="absolute inset-0 opacity-[0.07]"
              style={{
                backgroundImage:
                  'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
                backgroundSize: '28px 28px',
              }}
            />
          </div>

          <div className="relative">
            <Wordmark className="[&_*]:!text-white" />
          </div>

          <div className="relative max-w-md">
            <p className="font-display text-4xl font-extrabold leading-tight">
              Banking that moves at the speed of your life.
            </p>
            <p className="mt-4 text-white/70">
              A modern digital banking experience — checking, savings, retirement, transfers, and
              real-time fraud protection in one calm interface.
            </p>
            <div className="mt-8 grid grid-cols-3 gap-4">
              {[
                ['379K', 'Active members'],
                ['$4.2B', 'Secured assets'],
                ['99.99%', 'Uptime'],
              ].map(([n, l]) => (
                <div key={l}>
                  <p className="font-display text-2xl font-bold text-brand-300">{n}</p>
                  <p className="text-xs text-white/60">{l}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="relative flex items-center gap-2 text-xs text-white/50">
            <ShieldCheck className="h-4 w-4" />
            FDIC-insured simulation · Educational prototype · No real funds
          </div>
        </aside>

        {/* Form panel */}
        <main className="flex items-center justify-center p-6 sm:p-10">
          <div className="w-full max-w-md">
            <div className="mb-6 lg:hidden">
              <Wordmark />
            </div>

            <div className="card p-7">
              <h1 className="font-display text-2xl font-extrabold text-ink-900">Welcome back</h1>
              <p className="mt-1 text-sm text-ink-500">
                Sign in to your Everstream account to continue.
              </p>

              <form onSubmit={submit} className="mt-6 space-y-4">
                <div>
                  <label className="label" htmlFor="username">
                    Username
                  </label>
                  <div className="relative">
                    <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
                    <input
                      id="username"
                      className="input pl-9"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="adrian.mercer"
                      autoComplete="username"
                    />
                  </div>
                </div>

                <div>
                  <label className="label" htmlFor="password">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
                    <input
                      id="password"
                      type={showPw ? 'text' : 'password'}
                      className="input pl-9 pr-10"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      autoComplete="current-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPw((s) => !s)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-ink-400 hover:bg-ink-100 hover:text-ink-700"
                      aria-label={showPw ? 'Hide password' : 'Show password'}
                    >
                      {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {error && (
                  <div className="flex items-start gap-2 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700 ring-1 ring-rose-200">
                    <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                <button type="submit" className="btn-primary w-full" disabled={loading}>
                  {loading ? 'Signing in…' : 'Sign in'}
                  {!loading && <ArrowRight className="h-4 w-4" />}
                </button>
              </form>

              <div className="mt-6 rounded-xl border border-dashed border-ink-200 bg-ink-50/60 p-4">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold uppercase tracking-wide text-ink-500">
                    Demo credentials
                  </p>
                  <button
                    onClick={fillDemo}
                    className="text-xs font-semibold text-brand-600 hover:text-brand-700"
                  >
                    Autofill
                  </button>
                </div>
                <dl className="mt-2 space-y-1 text-sm">
                  <div className="flex justify-between">
                    <dt className="text-ink-500">Username</dt>
                    <dd className="font-mono font-medium text-ink-800">{DEMO_CREDENTIALS.username}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-ink-500">Password</dt>
                    <dd className="font-mono font-medium text-ink-800">{DEMO_CREDENTIALS.password}</dd>
                  </div>
                </dl>
              </div>
            </div>

            <p className="mt-6 text-center text-xs leading-relaxed text-ink-400">
              Everstream Bank is a fictional educational prototype. No real banking, authentication,
              or payment processing occurs. Do not enter real credentials.
            </p>
          </div>
        </main>
      </div>
    </div>
  );
}
