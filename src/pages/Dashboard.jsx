import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'

import AppealCard from '../components/AppealCard'
import EmptyState from '../components/EmptyState'
import Modal from '../components/Modal'
import { useAuth } from '../context/AuthContext'
import { useAppeals } from '../hooks/useAppeals'
import { editAppeal, removeAppeal } from '../services/appealService'
import { APPEAL_STATUS } from '../utils/constants'

export default function Dashboard() {
  const { user } = useAuth()
  const { myAppeals, loading, error } = useAppeals()
  const [selected, setSelected] = useState(null)
  const [busy, setBusy] = useState(false)
  const location = useLocation()
  const [notice, setNotice] = useState(location.state?.message || '')

  const active = myAppeals.filter((appeal) => appeal.status !== APPEAL_STATUS.FULFILLED)
  const pledged = myAppeals.reduce((total, appeal) => total + Number(appeal.unitsPledged || 0), 0)

  async function toggleStatus(appeal) {
    const nextStatus =
      appeal.status === APPEAL_STATUS.FULFILLED ? APPEAL_STATUS.OPEN : APPEAL_STATUS.FULFILLED
    try {
      await editAppeal(appeal.id, { status: nextStatus })
      setNotice(nextStatus === APPEAL_STATUS.FULFILLED ? 'Appeal marked as fulfilled.' : 'Appeal re-opened.')
    } catch (err) {
      setNotice(err.message || 'Could not update that appeal.')
    }
  }

  async function handleDelete() {
    if (!selected) return
    setBusy(true)
    try {
      await removeAppeal(selected.id)
      setNotice('Appeal deleted.')
      setSelected(null)
    } catch (err) {
      setNotice(err.message || 'Could not delete that appeal.')
    } finally {
      setBusy(false)
    }
  }

  if (loading) {
    return (
      <section className="mx-auto max-w-6xl px-4 py-12">
        <p className="text-sm text-muted" role="status">Loading your appeals...</p>
      </section>
    )
  }

  return (
    <section className="mx-auto max-w-6xl px-4 py-10">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-crimson">Your account</p>
          <h1 className="mt-1 text-3xl font-bold text-ink">Welcome, {user?.name || 'donor'}</h1>
          <p className="mt-2 text-sm text-muted">
            {active.length} active {active.length === 1 ? 'appeal' : 'appeals'} · {pledged} units pledged
          </p>
        </div>
        <Link to="/create-appeal" className="btn btn-primary">Create an appeal</Link>
      </div>

      {error && <p className="mb-6 text-sm text-red-700" role="alert">{error}</p>}
      {notice && <p className="mb-6 text-sm text-teal-700" role="status">{notice}</p>}
      {myAppeals.length === 0 ? (
        <EmptyState
          title="You have no appeals yet"
          message="Create an appeal when someone needs blood, or browse the open appeals."
          actionLabel="Create an appeal"
          actionTo="/create-appeal"
        />
      ) : (
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {myAppeals.map((appeal) => (
            <div key={appeal.id} className="flex flex-col gap-3">
              <AppealCard appeal={appeal} />
              <div className="flex items-center justify-end gap-4">
                <button
                  type="button"
                  onClick={() => toggleStatus(appeal)}
                  className="text-sm font-medium text-teal-700 hover:underline"
                >
                  {appeal.status === APPEAL_STATUS.FULFILLED ? 'Re-open appeal' : 'Mark as fulfilled'}
                </button>
                <button
                  type="button"
                  onClick={() => setSelected(appeal)}
                  className="text-sm font-medium text-red-700 hover:underline"
                >
                  Delete appeal
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal
        open={Boolean(selected)}
        title="Delete this appeal?"
        onClose={() => !busy && setSelected(null)}
      >
        <p className="text-sm text-muted">This action cannot be undone.</p>
        <div className="mt-6 flex justify-end gap-3">
          <button type="button" className="btn btn-outline" onClick={() => setSelected(null)} disabled={busy}>
            Cancel
          </button>
          <button type="button" className="btn btn-primary" onClick={handleDelete} disabled={busy}>
            {busy ? 'Deleting...' : 'Delete appeal'}
          </button>
        </div>
      </Modal>
    </section>
  )
}