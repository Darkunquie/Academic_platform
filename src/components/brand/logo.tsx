type LogoProps = {
  /** mark size in px */
  size?: number;
  /** show the "preplyfly" wordmark next to the mark */
  withWordmark?: boolean;
  /** wordmark color (defaults to currentColor) */
  className?: string;
};

/** Preplyfly paper-plane mark + wordmark. */
export function Logo({ size = 28, withWordmark = true, className }: LogoProps) {
  return (
    <span
      className={className}
      style={{ display: "inline-flex", alignItems: "center", gap: 10 }}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 32 32"
        role="img"
        aria-label="Preplyfly"
      >
        <rect width="32" height="32" rx="7" fill="#155E45" />
        <path d="M6 16.8 25 6.5 17.4 25.5l-3.2-7.2-8.2-1.5Z" fill="#F6A488" />
        <path d="M14.2 18.3 25 6.5l-10 14.6-.8-2.8Z" fill="#C9462C" />
      </svg>
      {withWordmark && (
        <span
          style={{
            fontWeight: 800,
            letterSpacing: "-0.02em",
            fontSize: size * 0.72,
          }}
        >
          preplyfly
        </span>
      )}
    </span>
  );
}
