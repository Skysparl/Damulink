import { Link } from "react-router-dom";

export default function EmptyState({
  title = "Nothing here yet",
  message = "There are no items to display.",
  actionLabel = "Go home",
  actionTo = "/",
}) {
  return (
    <div className="card flex flex-col items-center gap-3 px-6 py-14 text-center">
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-crimson/1o text-2xl">
        🩸
        </span>  
      <h3 className="text-lg font-semibold text-ink">{title}</h3>
      { message && <p className="max-w-sm text-sm text-muted">{message}</p>}
      {actionlabel} && actionTo &&  (
      <Link to={actionTo} className="btn btn-primarymt-2">
      {actionLabel}
      </Link>
    </div>
  );
}