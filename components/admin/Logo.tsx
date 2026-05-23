export function Logo({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" aria-hidden="true">
      <defs>
        <linearGradient id="logo-grad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#3b82f6" />
          <stop offset="1" stopColor="#22d3ee" />
        </linearGradient>
      </defs>
      <path
        d="M20 4 L34 12 L34 28 L20 36 L6 28 L6 12 Z"
        fill="url(#logo-grad)"
        opacity="0.95"
      />
      <path
        d="M14 16 L20 12 L26 16 L26 24 L20 28 L14 24 Z"
        fill="var(--bg)"
      />
    </svg>
  );
}
