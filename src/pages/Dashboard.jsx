import { useState } from 'react'
import { Link } from 'react-router-dom'

import AppealCard from '../components/AppealCard'
import EmptyState from '../components/EmptyState'
import Modal from '../components/Modal'
import { useAuth } from '../context/AuthContext'
import { useAppeals } from '../hooks/useAppeals'
import { removeAppeal } from '../services/appealService'
import { APPEAL_STATUS } from '../utils/constants'

export default function Dashboard() {
  const { user } = useAuth()
  const { myAppeals, loading, error } = useAppeals()
  const [selected, setSelected] = useState(null)
  const [busy, setBusy] = useState(false)
  const [notice, setNotice] = useState('')

  const active = myAppeals.filter((appeal) => appeal.status !== APPEAL_STATUS.FULFILLED)
  const pledged = myAppeals.reduce((total, appeal) => total + Number(appeal.unitsPledged || 0), 0)

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
  ...
}