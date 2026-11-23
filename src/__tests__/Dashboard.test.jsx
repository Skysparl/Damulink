import { describe, expect, it, vi } from 'vitest'
import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import * as appealService from '../services/appealService.js'
import { getLocalAppeal, listLocalAppeals, signOutLocal, signUpLocal } from '../services/localBackend.js'
import { renderApp, seedAppeal, seedUser } from '../test/helpers.jsx'

describe('Dashboard page', () => {
  it('sends signed-out visitors to the login page', () => {
    renderApp('/dashboard')
    expect(screen.getByText('Please log in to continue.')).toBeInTheDocument()
  })

  it('shows an empty state for a new account', () => {
    seedUser()
    renderApp('/dashboard')
    expect(screen.getByRole('heading', { name: 'Welcome, Amina Wanjiku' })).toBeInTheDocument()
    expect(screen.getByText('You have no appeals yet')).toBeInTheDocument()
    expect(screen.getByText('0 active appeals · 0 units pledged')).toBeInTheDocument()
  })

  it('lists only my appeals with totals', () => {
    signUpLocal({ name: 'Other', email: 'other@example.com', password: 'secret123' })
    seedAppeal({ patientName: 'Someone Else' })
    signOutLocal()
    seedUser()
    seedAppeal({ patientName: 'Mary W.' })
    renderApp('/dashboard')

    expect(screen.getByText('Mary W.')).toBeInTheDocument()
    expect(screen.queryByText('Someone Else')).not.toBeInTheDocument()
    expect(screen.getByText('1 active appeal · 0 units pledged')).toBeInTheDocument()
  })

  it('marks an appeal as fulfilled and re-opens it', async () => {
    seedUser()
    const appeal = seedAppeal()
    const user = userEvent.setup()
    renderApp('/dashboard')

    await user.click(screen.getByRole('button', { name: 'Mark as fulfilled' }))
    expect(await screen.findByText('Appeal marked as fulfilled.')).toBeInTheDocument()
    expect(getLocalAppeal(appeal.id).status).toBe('fulfilled')

    await user.click(await screen.findByRole('button', { name: 'Re-open appeal' }))
    expect(await screen.findByText('Appeal re-opened.')).toBeInTheDocument()
    expect(getLocalAppeal(appeal.id).status).toBe('open')
  })

  it('shows an error when the status change fails', async () => {
    seedUser()
    seedAppeal()
    const user = userEvent.setup()
    vi.spyOn(appealService, 'editAppeal').mockRejectedValue(new Error('No permission'))
    renderApp('/dashboard')

    await user.click(screen.getByRole('button', { name: 'Mark as fulfilled' }))
    expect(await screen.findByText('No permission')).toBeInTheDocument()
  })

  it('deletes an appeal after confirming', async () => {
    seedUser()
    seedAppeal()
    const user = userEvent.setup()
    renderApp('/dashboard')

    await user.click(screen.getByRole('button', { name: 'Delete appeal' }))
    const dialog = screen.getByRole('dialog')
    expect(within(dialog).getByText('Delete this appeal?')).toBeInTheDocument()

    await user.click(within(dialog).getByRole('button', { name: 'Cancel' }))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(listLocalAppeals()).toHaveLength(1)

    await user.click(screen.getByRole('button', { name: 'Delete appeal' }))
    await user.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Delete appeal' }))

    expect(await screen.findByText('Appeal deleted.')).toBeInTheDocument()
    expect(listLocalAppeals()).toHaveLength(0)
    expect(screen.getByText('You have no appeals yet')).toBeInTheDocument()
  })

  it('shows an error when delete fails', async () => {
    seedUser()
    seedAppeal()
    const user = userEvent.setup()
    vi.spyOn(appealService, 'removeAppeal').mockRejectedValue(new Error('Delete failed'))
    renderApp('/dashboard')

    await user.click(screen.getByRole('button', { name: 'Delete appeal' }))
    await user.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Delete appeal' }))
    expect(await screen.findByText('Delete failed')).toBeInTheDocument()
  })
})
