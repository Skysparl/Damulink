const BLOOD_SIZES = {
  sm: 'h-8 w-8 text-xs',
  md: 'h-11 w-11 text-sm',
  lg: 'h-14 w-14 text-base',
};

const URGENCY_STYLES = {
  critical: 'bg-crimson text-white',
  urgent: 'bg-amber-500 text-white',
  routine: 'bg-teal text-white',
  normal: 'bg-teal text-white',
};

const URGENCY_LABELS = {
  critical: 'Critical',
  urgent: 'Urgent',
  routine: 'Routine',
  normal: 'Normal',
};

export function BloodTypeBadge({ type, size = 'md' }) {
  return (
    <span
      className={`flex flex-none items-center justify-center rounded-full bg-crimson/10 font-bold text-crimson ${
        BLOOD_SIZES[size] || BLOOD_SIZES.md
      }`}
      title={`Blood type ${type}`}
    >
      {type}
    </span>
  );
}

export function UrgencyBadge({ urgency, fulfilled = false }) {
  if (fulfilled) {
    return (
      <span className="rounded-full bg-ink/10 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-ink/60">
        Fulfilled
      </span>
    );
  }

  return (
    <span
      className={`rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide ${
        URGENCY_STYLES[urgency] || URGENCY_STYLES.normal
      }`}
    >
      {URGENCY_LABELS[urgency] || 'Normal'}
    </span>
  );
}