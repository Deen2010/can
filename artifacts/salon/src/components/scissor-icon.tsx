export function ScissorIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="square"
      strokeLinejoin="miter"
      className={className}
    >
      <circle cx="6" cy="18" r="3" />
      <circle cx="18" cy="18" r="3" />
      <line x1="8" y1="16" x2="21" y2="3" />
      <line x1="16" y1="16" x2="3" y2="3" />
    </svg>
  );
}

export function BarberPoleIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 64"
      className={className}
      aria-hidden="true"
    >
      {/* Top cap */}
      <rect x="2" y="0" width="20" height="6" fill="currentColor" />
      <rect x="4" y="2" width="16" height="2" fill="hsl(38 60% 52%)" />
      {/* Glass cylinder background */}
      <rect x="5" y="6" width="14" height="52" fill="hsl(36 50% 96%)" stroke="currentColor" strokeWidth="1.5" />
      {/* Stripes */}
      <g clipPath="url(#pole-clip)">
        <g>
          <rect x="5" y="6" width="14" height="6" fill="hsl(356 72% 42%)" transform="skewY(-25)" />
          <rect x="5" y="18" width="14" height="6" fill="hsl(218 55% 22%)" transform="skewY(-25)" />
          <rect x="5" y="30" width="14" height="6" fill="hsl(356 72% 42%)" transform="skewY(-25)" />
          <rect x="5" y="42" width="14" height="6" fill="hsl(218 55% 22%)" transform="skewY(-25)" />
          <rect x="5" y="54" width="14" height="6" fill="hsl(356 72% 42%)" transform="skewY(-25)" />
        </g>
      </g>
      <defs>
        <clipPath id="pole-clip">
          <rect x="5" y="6" width="14" height="52" />
        </clipPath>
      </defs>
      {/* Bottom cap */}
      <rect x="2" y="58" width="20" height="6" fill="currentColor" />
      <rect x="4" y="60" width="16" height="2" fill="hsl(38 60% 52%)" />
    </svg>
  );
}

export function RazorIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="square"
      strokeLinejoin="miter"
      className={className}
    >
      <path d="M3 21 L21 3" />
      <path d="M3 21 L7 17 L9 19 L5 23 Z" fill="currentColor" />
      <path d="M9 15 L21 3 L21 7 L13 15 Z" fill="currentColor" fillOpacity="0.15" />
    </svg>
  );
}
