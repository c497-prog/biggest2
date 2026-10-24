export function Logo({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} fill="none" aria-hidden="true">
      <rect x="2" y="2" width="28" height="28" rx="9" fill="url(#ev-g)" />
      <path
        d="M9 20.5c2.2 1.6 4.4 2 6.3 2 3 0 4.7-1.3 4.7-3.2 0-1.9-1.6-2.6-4.3-3.4l-1.4-.4c-2.9-.9-4.6-2-4.6-4.4 0-2.6 2.4-4.6 6.1-4.6 2.1 0 4 .6 5.6 1.7l-1.2 2.1c-1.3-.9-2.8-1.4-4.4-1.4-2 0-3.2.9-3.2 2.1 0 1.2 1 1.8 3.3 2.5l1.4.4c3.3 1 5.7 2.2 5.7 5.2 0 3-2.6 5-6.8 5-2.6 0-5-.8-6.6-2.2L9 20.5Z"
        fill="white"
      />
      <defs>
        <linearGradient id="ev-g" x1="2" y1="2" x2="30" y2="30" gradientUnits="userSpaceOnUse">
          <stop stopColor="#22d3ee" />
          <stop offset="1" stopColor="#0891b2" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export function Wordmark({ className = '' }: { className?: string }) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Logo className="h-7 w-7" />
      <span className="font-display text-lg font-extrabold tracking-tight text-ink-900">
        Everstream
      </span>
    </div>
  );
}
