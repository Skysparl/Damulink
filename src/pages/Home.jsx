import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'

import AppealCard from '../components/AppealCard'
import AppealFilters from '../components/AppealFilters'
import EmptyState from '../components/EmptyState'
import { useAuth } from '../context/AuthContext'
import { useAppeals } from '../hooks/useAppeals'
import { APPEAL_STATUS } from '../utils/constants'

const emptyFilters = {
  search: '',
  bloodType: 'all',
  county: 'all',
  urgency: 'all',
}

export default function Home() {
  const { user } = useAuth()
  const { appeals, loading, error } = useAppeals()
  const [filters, setFilters] = useState(emptyFilters)

  const activeAppeals = useMemo(
    () => appeals.filter((appeal) => appeal.status !== APPEAL_STATUS.FULFILLED),
    [appeals],
  )

  const visibleAppeals = useMemo(() => {
    const search = filters.search.trim().toLowerCase()

    return activeAppeals.filter((appeal) => {
      if (filters.bloodType !== 'all' && appeal.bloodType !== filters.bloodType) return false
      if (filters.county !== 'all' && appeal.county !== filters.county) return false
      if (filters.urgency !== 'all' && appeal.urgency !== filters.urgency) return false
      if (!search) return true

      return [appeal.hospital, appeal.county, appeal.patientName]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
        .includes(search)
    })
  }, [activeAppeals, filters])

  const unitsPledged = appeals.reduce(
    (total, appeal) => total + Number(appeal.unitsPledged || 0),
    0,
  )
  const counties = new Set(activeAppeals.map((appeal) => appeal.county)).size
  const filtered = Boolean(
    filters.search.trim() ||
      filters.bloodType !== 'all' ||
      filters.county !== 'all' ||
      filters.urgency !== 'all',
  )

  return (
    <div>
      <section className="bg-ink text-white">
        <div className="mx-auto w-full max-w-6xl px-4 py-16 sm:py-20">
          <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-teal-200 ring-1 ring-inset ring-white/15">
            Kenya&rsquo;s blood donor network
          </span>

          <h1 className="mt-5 max-w-2xl text-4xl font-bold leading-tight tracking-tight sm:text-5xl">
            Every drop <span className="text-teal-300">links</span> a life.
          </h1>
          <p className="mt-4 max-w-xl text-base leading-relaxed text-slate-300">
            DamuLink connects hospitals with verified blood donors. Browse live appeals by blood
            group and county, then pledge the units a patient is waiting for.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link to={user ? '/create-appeal' : '/register'} className="btn btn-primary">
              Post an appeal
            </Link>
            <a
              href="#feed"
              className="btn btn-outline border-white/30 text-white hover:border-teal-300 hover:text-teal-200"
            >
              Browse live appeals
            </a>
          </div>

          <dl className="mt-10 grid max-w-2xl grid-cols-3 gap-4 border-t border-white/10 pt-6">
            <div>
              <dt className="text-xs uppercase tracking-wide text-slate-400">Active appeals</dt>
              <dd className="mt-1 text-2xl font-bold">{activeAppeals.length}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wide text-slate-400">Units pledged</dt>
              <dd className="mt-1 text-2xl font-bold text-teal-300">{unitsPledged}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wide text-slate-400">Counties covered</dt>
              <dd className="mt-1 text-2xl font-bold">{counties}</dd>
            </div>
          </dl>
        </div>
      </section>

      <section id="feed" className="mx-auto w-full max-w-6xl scroll-mt-20 px-4 py-12">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-slate-900">Live appeals</h2>
            <p className="mt-1 text-sm text-slate-600">
              Only active appeals appear here. Updates arrive in real time.
            </p>
          </div>
          {user ? (
            <Link to="/create-appeal" className="btn btn-outline px-3 py-2 text-sm">
              + New appeal
            </Link>
          ) : null}
        </div>

        <div className="mt-6">
          <AppealFilters values={filters} onChange={setFilters} />
        </div>

        {error ? (
          <p
            role="alert"
            className="mt-6 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
          >
            {error}
          </p>
        ) : null}

        <div className="mt-8">
          {loading ? (
            <p className="py-10 text-center text-sm text-slate-500">Loading appeals…</p>
          ) : visibleAppeals.length > 0 ? (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {visibleAppeals.map((appeal) => (
                <AppealCard key={appeal.id} appeal={appeal} />
              ))}
            </div>
          ) : (
            <EmptyState
              title={filtered ? 'No appeals match those filters' : 'No active appeals yet'}
              message={
                filtered
                  ? 'Try a different blood group, county or search term.'
                  : 'When a hospital needs blood, its appeal will show up here first.'
              }
              action={
                filtered ? (
                  <button
                    type="button"
                    className="btn btn-outline mt-2"
                    onClick={() => setFilters(emptyFilters)}
                  >
                    Clear filters
                  </button>
                ) : (
                  <Link to={user ? '/create-appeal' : '/register'} className="btn btn-primary mt-2">
                    {user ? 'Post the first appeal' : 'Create an account'}
                  </Link>
                )
              }
            />
          )}
        </div>
      </section>
    </div>
  )
}