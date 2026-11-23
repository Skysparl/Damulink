import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { fetchAppeal, fetchAppeals, pledgeUnits } from '../services/appealService.js'

export function useAppeals() {
  const { user } = useAuth()
  const [appeals, setAppeals] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const alive = useRef(true)

  useEffect(() => {
    alive.current = true
    return () => {
      alive.current = false
    }
  }, [])

  const refresh = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const data = await fetchAppeals()
      if (alive.current) setAppeals(data)
    } catch (loadError) {
      if (alive.current) {
        setError(loadError.message || 'We could not load the appeals. Check your connection and try again.')
      }
    } finally {
      if (alive.current) setLoading(false)
    }
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  const pledge = useCallback(async (id, amount) => {
    const updated = await pledgeUnits(id, amount)
    if (alive.current) {
      setAppeals((previous) =>
        previous.map((appeal) => (appeal.id === updated.id ? { ...appeal, ...updated } : appeal)),
      )
    }
    return updated
  }, [])

  const myAppeals = useMemo(
    () => (user ? appeals.filter((appeal) => appeal.createdBy === user.uid) : []),
    [appeals, user],
  )

  return { appeals, myAppeals, loading, error, refresh, pledge }
}

export function useAppeal(id) {
  const [appeal, setAppeal] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true

    async function load() {
      setLoading(true)
      setError('')
      try {
        const data = await fetchAppeal(id)
        if (!active) return
        setAppeal(data)
        if (!data) setError('That appeal could not be found.')
      } catch (loadError) {
        if (active) setError(loadError.message || 'We could not load this appeal.')
      } finally {
        if (active) setLoading(false)
      }
    }

    if (id) load()
    else {
      setAppeal(null)
      setError('That appeal could not be found.')
      setLoading(false)
    }

    return () => {
      active = false
    }
  }, [id])

  const pledge = useCallback(async (amount) => {
    const updated = await pledgeUnits(id, amount)
    setAppeal((previous) => (previous ? { ...previous, ...updated } : updated))
    return updated
  }, [id])

  return { appeal, loading, error, pledge }
}
