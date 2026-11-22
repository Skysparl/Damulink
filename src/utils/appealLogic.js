import { APPEAL_STATUS } from './constants'

export function remainingUnits(appeal) {
  const needed = Number(appeal?.units) || 0
  const pledged = Number(appeal?.unitsPledged) || 0
  return Math.max(needed - pledged, 0)
}

export function progressPercent(appeal) {
  const needed = Number(appeal?.units) || 0
  const pledged = Number(appeal?.unitsPledged) || 0
  if (needed <= 0) return 0
  return Math.min(100, Math.round((pledged / needed) * 100))
}

export function computePledge(appeal, amount) {
  const needed = Number(appeal?.units) || 0
  const pledged = Number(appeal?.unitsPledged) || 0
  const remaining = Math.max(needed - pledged, 0)
  const requested = Math.max(1, Math.floor(Number(amount) || 1))
  const status = appeal?.status || APPEAL_STATUS.ACTIVE

  if (status === APPEAL_STATUS.FULFILLED || remaining === 0) {
    return {
      applied: 0,
      unitsPledged: pledged,
      status: APPEAL_STATUS.FULFILLED,
      fulfilled: true,
    }
  }

  const applied = Math.min(requested, remaining)
  const unitsPledged = pledged + applied
  const fulfilled = unitsPledged >= needed

  return {
    applied,
    unitsPledged,
    status: fulfilled ? APPEAL_STATUS.FULFILLED : status,
    fulfilled,
  }
}

export function summariseAppeals(appeals = []) {
  return appeals.reduce(
    (totals, appeal) => {
      if (appeal.status === APPEAL_STATUS.FULFILLED) totals.fulfilled += 1
      else totals.active += 1
      totals.unitsPledged += Number(appeal.unitsPledged) || 0
      return totals
    },
    { active: 0, fulfilled: 0, unitsPledged: 0 },
  )
}

export function isOwner(appeal, user) {
  const ownerId = appeal?.createdBy
  const userId = typeof user === 'object' && user ? user.uid : user
  return Boolean(ownerId && userId && ownerId === userId)
}