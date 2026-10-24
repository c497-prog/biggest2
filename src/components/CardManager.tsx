import { useState, useEffect } from 'react';
import {
  Eye,
  EyeOff,
  Snowflake,
  Lock,
  Unlock,
  Copy,
  Check,
  Shield,
  Globe,
  ShoppingCart,
  Wifi,
} from 'lucide-react';
import { useBank } from '@/context/BankContext';
import { fmtMoney } from '@/lib/format';

export function CardManager() {
  const { state, toggleFreezeCard, updateCardSettings, addToast } = useBank();
  const card = state.cards[0];

  const [showNumber, setShowNumber] = useState(false);
  const [showCvv, setShowCvv] = useState(false);
  const [copiedNum, setCopiedNum] = useState(false);
  const [copiedRouting, setCopiedRouting] = useState(false);

  // Auto-hide CVV after 4 seconds for privacy
  useEffect(() => {
    if (!showCvv) return;
    const timer = setTimeout(() => setShowCvv(false), 4000);
    return () => clearTimeout(timer);
  }, [showCvv]);

  if (!card) return null;

  const copyNumber = () => {
    navigator.clipboard?.writeText(card.cardNumber.replace(/\s+/g, ''));
    setCopiedNum(true);
    addToast({
      title: 'Card Number Copied',
      message: 'Card number copied to your clipboard.',
      type: 'info',
    });
    setTimeout(() => setCopiedNum(false), 2000);
  };

  const copyRouting = () => {
    navigator.clipboard?.writeText('121000358');
    setCopiedRouting(true);
    addToast({
      title: 'Routing Number Copied',
      message: 'Routing number 121000358 copied to clipboard.',
      type: 'info',
    });
    setTimeout(() => setCopiedRouting(false), 2000);
  };

  const displayCardNumber = showNumber
    ? card.cardNumber
    : `${card.cardNumber.slice(0, 4)} •••• •••• ${card.cardNumber.slice(-4)}`;

  const spendingPct = Math.min(
    100,
    Math.round((card.currentSpending / card.dailySpendingLimit) * 100),
  );

  return (
    <div className="card overflow-hidden p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-6">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="font-display text-lg font-bold text-ink-900 dark:text-ink-100">
              Virtual Debit Card
            </h2>
            {card.isFrozen ? (
              <span className="pill bg-cyan-100 text-cyan-800 dark:bg-cyan-950/80 dark:text-cyan-300 dark:ring-1 dark:ring-cyan-800">
                <Snowflake className="h-3 w-3" /> Frozen
              </span>
            ) : (
              <span className="pill bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 dark:ring-1 dark:ring-emerald-800">
                <Shield className="h-3 w-3" /> Active
              </span>
            )}
          </div>
          <p className="mt-0.5 text-xs text-ink-500 dark:text-ink-400">
            Linked to Everyday Checking (•••• 4471)
          </p>
        </div>

        <button
          onClick={() => toggleFreezeCard(card.id)}
          className={`btn text-xs font-semibold px-3.5 py-2 cursor-pointer transition ${
            card.isFrozen
              ? 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-soft'
              : 'border border-cyan-300 bg-cyan-50 text-cyan-800 hover:bg-cyan-100 dark:border-cyan-800 dark:bg-cyan-950/60 dark:text-cyan-200 dark:hover:bg-cyan-900/60'
          }`}
        >
          {card.isFrozen ? (
            <>
              <Unlock className="h-4 w-4" /> Unfreeze Card
            </>
          ) : (
            <>
              <Snowflake className="h-4 w-4" /> Freeze Card
            </>
          )}
        </button>
      </div>

      <div className="grid gap-6 lg:grid-cols-12 lg:items-center">
        {/* Physical-style Visual Card */}
        <div className="lg:col-span-6 flex justify-center">
          <div
            className={`relative w-full max-w-sm aspect-[1.586/1] rounded-2xl p-5 shadow-2xl transition-all duration-300 select-none overflow-hidden ${
              card.isFrozen
                ? 'bg-gradient-to-tr from-cyan-950 via-slate-900 to-blue-950 text-cyan-100 ring-2 ring-cyan-400/50'
                : 'bg-gradient-to-tr from-ink-950 via-slate-900 to-brand-950 text-white ring-1 ring-white/10'
            }`}
          >
            {/* Frozen Sheen Effect */}
            {card.isFrozen && (
              <div className="absolute inset-0 bg-cyan-500/10 backdrop-blur-[1px] flex flex-col items-center justify-center z-20 pointer-events-none">
                <div className="rounded-full bg-cyan-950/80 p-3 ring-1 ring-cyan-400/60 shadow-glow">
                  <Lock className="h-7 w-7 text-cyan-300" />
                </div>
                <p className="mt-2 text-xs font-bold uppercase tracking-wider text-cyan-200">
                  Card Frozen
                </p>
              </div>
            )}

            {/* Background patterns */}
            <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-brand-500/20 blur-3xl pointer-events-none" />
            <div className="absolute -left-16 -bottom-16 h-48 w-48 rounded-full bg-cyan-500/20 blur-3xl pointer-events-none" />

            <div className="relative z-10 flex h-full flex-col justify-between">
              {/* Header: Chip & Contactless */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {/* EMV Metallic Chip */}
                  <div className="h-8 w-11 rounded-md bg-gradient-to-tr from-amber-200 via-amber-300 to-yellow-500 p-1 shadow-inner ring-1 ring-amber-400/60 flex flex-col justify-between">
                    <div className="h-[1px] w-full bg-amber-600/40" />
                    <div className="h-[1px] w-full bg-amber-600/40" />
                    <div className="h-[1px] w-full bg-amber-600/40" />
                  </div>
                  <Wifi className="h-5 w-5 rotate-90 text-white/70" />
                </div>
                <div className="text-right">
                  <span className="font-display text-sm font-extrabold tracking-wider text-white">
                    EVERSTREAM
                  </span>
                  <span className="block text-[9px] uppercase tracking-widest text-brand-300">
                    Debit
                  </span>
                </div>
              </div>

              {/* Card Number */}
              <div className="my-auto py-1">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-lg sm:text-xl font-bold tracking-widest text-white/95 drop-shadow">
                    {displayCardNumber}
                  </span>
                  <button
                    onClick={() => setShowNumber((prev) => !prev)}
                    className="p-1 text-white/60 hover:text-white transition"
                    title={showNumber ? 'Hide card number' : 'Show full number'}
                    aria-label="Toggle card number visibility"
                  >
                    {showNumber ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Bottom: Cardholder, Expiry, CVV */}
              <div className="flex items-end justify-between text-xs">
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-white/50">Cardholder</p>
                  <p className="font-semibold tracking-wide text-white drop-shadow">
                    {card.cardHolder}
                  </p>
                </div>
                <div className="flex items-end gap-4">
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-white/50">Expires</p>
                    <p className="font-mono font-semibold text-white">{card.expiry}</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-white/50">CVV</p>
                    <div className="flex items-center gap-1">
                      <span className="font-mono font-semibold text-white">
                        {showCvv ? card.cvv : '•••'}
                      </span>
                      <button
                        onClick={() => setShowCvv((prev) => !prev)}
                        className="text-white/60 hover:text-white transition"
                        title={showCvv ? 'Hide CVV' : 'Reveal CVV (auto-hides)'}
                      >
                        {showCvv ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Card Actions & Spending Controls */}
        <div className="lg:col-span-6 space-y-4">
          {/* Quick Copy Buttons */}
          <div className="grid grid-cols-2 gap-2.5">
            <button
              onClick={copyNumber}
              className="btn-outline text-xs py-2 flex items-center justify-center gap-1.5 cursor-pointer"
            >
              {copiedNum ? (
                <Check className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
              ) : (
                <Copy className="h-3.5 w-3.5 text-ink-400" />
              )}
              {copiedNum ? 'Copied Number!' : 'Copy Card #'}
            </button>
            <button
              onClick={copyRouting}
              className="btn-outline text-xs py-2 flex items-center justify-center gap-1.5 cursor-pointer"
            >
              {copiedRouting ? (
                <Check className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
              ) : (
                <Copy className="h-3.5 w-3.5 text-ink-400" />
              )}
              {copiedRouting ? 'Copied Routing!' : 'Copy Routing #'}
            </button>
          </div>

          {/* Daily Limit Tracker */}
          <div className="rounded-xl border border-ink-100 bg-ink-50/60 p-3.5 dark:border-ink-800 dark:bg-ink-900/60">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="font-medium text-ink-600 dark:text-ink-400">
                Daily Spending Limit
              </span>
              <span className="font-bold text-ink-900 dark:text-ink-100">
                {fmtMoney(card.currentSpending)} / {fmtMoney(card.dailySpendingLimit)}
              </span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-ink-200/80 dark:bg-ink-800">
              <div
                className="h-full rounded-full bg-brand-500 transition-all duration-300"
                style={{ width: `${spendingPct}%` }}
              />
            </div>
            <div className="mt-3 flex items-center justify-between">
              <label htmlFor="limit-slider" className="text-[11px] text-ink-500 dark:text-ink-400">
                Adjust limit:
              </label>
              <div className="flex items-center gap-2">
                <input
                  id="limit-slider"
                  type="range"
                  min="500"
                  max="5000"
                  step="250"
                  value={card.dailySpendingLimit}
                  onChange={(e) =>
                    updateCardSettings(card.id, { dailySpendingLimit: Number(e.target.value) })
                  }
                  className="h-1.5 w-28 accent-brand-600 cursor-pointer"
                />
                <span className="text-xs font-semibold text-ink-700 dark:text-ink-300">
                  {fmtMoney(card.dailySpendingLimit)}
                </span>
              </div>
            </div>
          </div>

          {/* Feature Toggles */}
          <div className="grid grid-cols-2 gap-2.5">
            <button
              onClick={() =>
                updateCardSettings(card.id, { onlinePurchases: !card.onlinePurchases })
              }
              className={`flex items-center justify-between rounded-xl border p-2.5 text-left transition cursor-pointer ${
                card.onlinePurchases
                  ? 'border-brand-200 bg-brand-50/50 dark:border-brand-900 dark:bg-brand-950/40 text-brand-950 dark:text-brand-100'
                  : 'border-ink-200 bg-ink-50/40 dark:border-ink-800 dark:bg-ink-900/40 text-ink-500'
              }`}
            >
              <div className="flex items-center gap-2">
                <ShoppingCart className="h-4 w-4" />
                <div>
                  <p className="text-xs font-semibold">Online</p>
                  <p className="text-[10px] opacity-70">
                    {card.onlinePurchases ? 'Enabled' : 'Blocked'}
                  </p>
                </div>
              </div>
              <span
                className={`h-2.5 w-2.5 rounded-full ${
                  card.onlinePurchases ? 'bg-brand-500' : 'bg-ink-300 dark:bg-ink-700'
                }`}
              />
            </button>

            <button
              onClick={() =>
                updateCardSettings(card.id, { internationalTx: !card.internationalTx })
              }
              className={`flex items-center justify-between rounded-xl border p-2.5 text-left transition cursor-pointer ${
                card.internationalTx
                  ? 'border-brand-200 bg-brand-50/50 dark:border-brand-900 dark:bg-brand-950/40 text-brand-950 dark:text-brand-100'
                  : 'border-ink-200 bg-ink-50/40 dark:border-ink-800 dark:bg-ink-900/40 text-ink-500'
              }`}
            >
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4" />
                <div>
                  <p className="text-xs font-semibold">Global</p>
                  <p className="text-[10px] opacity-70">
                    {card.internationalTx ? 'Allowed' : 'Blocked'}
                  </p>
                </div>
              </div>
              <span
                className={`h-2.5 w-2.5 rounded-full ${
                  card.internationalTx ? 'bg-brand-500' : 'bg-ink-300 dark:bg-ink-700'
                }`}
              />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
