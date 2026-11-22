const SIZES = {
  sm: 'h-4 w-4 border-2',
  md: 'h-8 w-8 border-2',
  lg: 'h-12 w-12 border-[3px]',
};

export default function Spinner({ size = 'md', label = 'Loading' }) {
  return (
    <span className="inline-flex items-center justify-center" role="status" aria-live="polite">
      <span
        className={`animate-spin rounded-full border-ink/20 border-t-crimson ${
          SIZES[size] || SIZES.md
        }`}
      />
      <span className="sr-only">{label}</span>
    </span>
  );
}