import { Link } from 'react-router-dom';
import { BloodTypeBadge, UrgencyBadge } from './Badges.jsx';
import { remainingUnits } from '../utils/appealLogic.js';

// If format.js already exports formatDate, import it and use that instead.
function shortDate(value) {
  return new Date(value).toLocaleDateString('en-KE', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export default function AppealCard({ appeal }) {
  const {
    id,
    patientName,
    hospital,
    county,
    bloodType,
    units,
    unitsPledged = 0,
    urgency,
    status,
    createdAt,
  } = appeal;

  const left = remainingUnits(appeal);
  const percent = Math.min(100, Math.round((unitsPledged / units) * 100));
  const fulfilled = status === 'fulfilled';

  return (
    <article className="card flex flex-col gap-4 p-5 transition-shadow hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <BloodTypeBadge type={bloodType} />
          <div>
            <h3 className="font-semibold text-ink">{patientName}</h3>
            <p className="text-xs text-muted">
              {hospital}, {county}
            </p>
          </div>
        </div>
        <UrgencyBadge urgency={urgency} fulfilled={fulfilled} />
      </div>

      <div>
        <div className="flex items-center justify-between text-xs text-muted">
          <span>
            {unitsPledged} of {units} units pledged
          </span>
          <span>{left === 0 ? 'Goal reached' : `${left} to go`}</span>
        </div>
        <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-ink/10">
          <div
            className={`h-full rounded-full ${fulfilled ? 'bg-teal' : 'bg-crimson'}`}
            style={{ width: `${percent}%` }}
          />
        </div>
      </div>

      <div className="flex items-center justify-between border-t border-ink/10 pt-3">
        <span className="text-xs text-muted">{shortDate(createdAt)}</span>
        <Link to={`/appeal/${id}`} className="text-sm font-semibold text-crimson hover:underline">
          {fulfilled ? 'View appeal' : 'Pledge blood'}
        </Link>
      </div>
    </article>
  );
}