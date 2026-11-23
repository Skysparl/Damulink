import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { remainingUnits } from '../utils/appealLogic.js'
import { useAppeal } from '../hooks/useAppeals.js'
import { APPEAL_STATUS } from '../utils/constants.js'

export default function AppealDetails() {
  const { id } = useParams()
  const { appeal, loading, error: loadError, pledge } = useAppeal(id)
  const [amount, setAmount] = useState('1')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  async function handlePledge(event) {
    event.preventDefault()
    setError('')
    setNotice('')
    setBusy(true)
    try {
      const updated = await pledge(Number(amount))
      setNotice(`Thank you. ${updated.unitsPledged} of ${updated.units} units are now pledged.`)
    } catch (pledgeError) {
      setError(pledgeError.message || 'Could not record your pledge.')
    } finally {
      setBusy(false)
    }
  }

  if (loading) {
    return <p className="mx-auto max-w-4xl px-4 py-12 text-sm text-muted" role="status">Loading appeal...</p>
  }

  if (loadError || !appeal) {
    return (
      <section className="mx-auto max-w-4xl px-4 py-12">
        <p className="text-sm text-red-700" role="alert">{loadError || 'That appeal could not be found.'}</p>
        <Link to="/" className="mt-4 inline-block text-sm font-semibold text-crimson hover:underline">
          Return to appeals
        </Link>
      </section>
    )
  }

  const remaining = remainingUnits(appeal)
  const fulfilled = appeal.status === APPEAL_STATUS.FULFILLED

  return (
    <section className="mx-auto max-w-4xl px-4 py-12">
      <Link to="/" className="text-sm font-semibold text-crimson hover:underline">← All appeals</Link>
      <article className="card mt-5 p-6 sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-crimson">
              {appeal.bloodType} blood · {appeal.county}
            </p>
            <h1 className="mt-2 text-3xl font-bold text-ink">{appeal.patientName}</h1>
            <p className="mt-2 text-muted">{appeal.hospital}</p>
          </div>
          <span className="rounded-full bg-crimson/10 px-3 py-1 text-sm font-semibold text-crimson">
            {fulfilled ? 'Fulfilled' : appeal.urgency}
          </span>
        </div>

        <dl className="mt-8 grid gap-4 border-t border-ink/10 pt-6 sm:grid-cols-2">
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-muted">Units needed</dt>
            <dd className="mt-1 font-semibold text-ink">{appeal.units}</dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-muted">Still needed</dt>
            <dd className="mt-1 font-semibold text-ink">{remaining}</dd>
          </div>
          {appeal.contactPhone && (
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wide text-muted">Contact</dt>
              <dd className="mt-1 font-semibold text-ink">
                <a href={`tel:${appeal.contactPhone}`}>{appeal.contactPhone}</a>
              </dd>
            </div>
          )}
        </dl>

        {notice && <p className="mt-6 text-sm text-teal-700" role="status">{notice}</p>}
        {error && <p className="mt-6 text-sm text-red-700" role="alert">{error}</p>}
        {!fulfilled && (
          <form onSubmit={handlePledge} className="mt-8 flex flex-wrap items-end gap-3 border-t border-ink/10 pt-6">
            <label className="w-32">
              <span className="mb-1 block text-xs font-semibold text-muted">Units to pledge</span>
              <input
                className="input"
                type="number"
                min="1"
                max={remaining}
                value={amount}
                onChange={(event) => setAmount(event.target.value)}
              />
            </label>
            <button type="submit" className="btn btn-primary" disabled={busy || remaining === 0}>
              {busy ? 'Recording...' : 'Pledge blood'}
            </button>
          </form>
        )}
      </article>
    </section>
  )
}
