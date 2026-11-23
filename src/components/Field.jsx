export default function Field({ label, error, hint, children, htmlFor }) {
  return (
    <label className="block" htmlFor={htmlFor}>
      <span className="mb-1 block text-sm font-medium text-ink">{label}</span>
      {children}
      {error ? (
        <span className="mt-1 block text-xs text-crimson">{error}</span>
      ) : hint ? (
        <span className="mt-1 block text-xs text-muted">{hint}</span>
      ) : null}
    </label>
  );
}