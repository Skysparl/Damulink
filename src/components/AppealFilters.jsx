import { BLOOD_TYPES, COUNTIES, URGENCY_LEVELS } from '../utils/constants.js';

// Tolerates URGENCY_LEVELS as either an object of levels or an array of strings.
const urgencyOptions = Array.isArray(URGENCY_LEVELS)
  ? URGENCY_LEVELS.map((level) => ({ value: level, label: level }))
  : Object.keys(URGENCY_LEVELS).map((level) => ({ value: level, label: level }));

export default function AppealFilters({ values, onChange }) {
  function update(field, value) {
    onChange({ ...values, [field]: value });
  }

  return (
    <div className="card flex flex-col gap-3 p-4 sm:flex-row sm:items-end">
      <label className="flex-1">
        <span className="mb-1 block text-xs font-semibold text-muted">Search</span>
        <input
          className="input"
          type="search"
          placeholder="Patient, hospital or county"
          value={values.search}
          onChange={(event) => update('search', event.target.value)}
        />
      </label>

      <label className="sm:w-32">
        <span className="mb-1 block text-xs font-semibold text-muted">Blood type</span>
        <select
          className="input"
          value={values.bloodType}
          onChange={(event) => update('bloodType', event.target.value)}
        >
          <option value="">Any</option>
          {BLOOD_TYPES.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
      </label>

      <label className="sm:w-44">
        <span className="mb-1 block text-xs font-semibold text-muted">County</span>
        <select
          className="input"
          value={values.county}
          onChange={(event) => update('county', event.target.value)}
        >
          <option value="">All counties</option>
          {COUNTIES.map((county) => {
            const name = typeof county === 'string' ? county : county.name;
            return (
              <option key={name} value={name}>
                {name}
              </option>
            );
          })}
        </select>
      </label>

      <label className="sm:w-32">
        <span className="mb-1 block text-xs font-semibold text-muted">Urgency</span>
        <select
          className="input"
          value={values.urgency}
          onChange={(event) => update('urgency', event.target.value)}
        >
          <option value="">Any</option>
          {urgencyOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}