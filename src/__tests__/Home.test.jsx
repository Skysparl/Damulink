import { describe, expect, it, vi } from 'vitest'
import { fireEvent, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import * as appealService from '../services/appealService.js'
import { renderApp, seedAppeal, seedUser } from '../test/helpers.jsx'
import { signOutLocal, updateLocalAppeal } from '../services/localBackend.js'

function seedFeed() {
  seedUser()
  seedAppeal({ patientName: 'Mary W.', bloodType: 'O-', county: 'Nairobi', urgency: 'critical' })
  seedAppeal({ patientName: 'John K.', hospital: 'Coast General', bloodType: 'A+', county: 'Mombasa', urgency: 'urgent' })
  const done = seedAppeal({ patientName: 'Grace A.', bloodType: 'B+', county: 'Kisumu', urgency: 'routine' })
  updateLocalAppeal(done.id, { status: 'fulfilled', unitsPledged: 4 })
}

const feed = () => within(document.getElementById('feed'))

describe('Home page', () => {
  it('shows an empty state with a sign-up link when there are no appeals', () => {
    renderApp('/')
    expect(screen.getByText('No active appeals yet')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Create an account' })).toHaveAttribute('href', '/register')
  })

  it('lists only active appeals and shows the stats', () => {
    seedFeed()
    renderApp('/')
    expect(feed().getByText('Mary W.')).toBeInTheDocument()
    expect(feed().getByText('John K.')).toBeInTheDocument()
    expect(feed().queryByText('Grace A.')).not.toBeInTheDocument()
    expect(screen.getByText('Active appeals').nextSibling).toHaveTextContent('2')
    expect(screen.getByText('Units pledged').nextSibling).toHaveTextContent('4')
    expect(screen.getByText('Counties covered').nextSibling).toHaveTextContent('2')
  })

  it('filters by blood type, county, urgency and search, then clears', async () => {
    seedFeed()
    renderApp('/')
    fireEvent.change(screen.getByLabelText('Blood type'), { target: { value: 'A+' } })
    expect(feed().queryByText('Mary W.')).not.toBeInTheDocument()
    expect(feed().getByText('John K.')).toBeInTheDocument()

    fireEvent.change(screen.getByLabelText('County'), { target: { value: 'Nairobi' } })
    expect(screen.getByText('No appeals match those filters')).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Clear filters' }))
    expect(feed().getByText('Mary W.')).toBeInTheDocument()

    fireEvent.change(screen.getByLabelText('Urgency'), { target: { value: 'critical' } })
    expect(feed().queryByText('John K.')).not.toBeInTheDocument()
    fireEvent.change(screen.getByLabelText('Urgency'), { target: { value: 'all' } })

    await userEvent.type(screen.getByPlaceholderText('Patient, hospital or county'), 'coast')
    expect(feed().getByText('John K.')).toBeInTheDocument()
    expect(feed().queryByText('Mary W.')).not.toBeInTheDocument()
  })

  it('links signed-in users to create an appeal', () => {
    seedUser()
    renderApp('/')
    expect(screen.getByRole('link', { name: '+ New appeal' })).toHaveAttribute('href', '/create-appeal')
    expect(screen.getByRole('link', { name: 'Post the first appeal' })).toBeInTheDocument()
  })

  it('updates live when a new appeal is posted', async () => {
    seedUser()
    renderApp('/')
    expect(screen.getByText('No active appeals yet')).toBeInTheDocument()
    seedAppeal({ patientName: 'Live Patient' })
    expect(await feed().findByText('Live Patient')).toBeInTheDocument()
  })

  it('shows an error when the live feed fails', () => {
    signOutLocal()
    vi.spyOn(appealService, 'subscribeToAppeals').mockImplementation((_onData, onError) => {
      onError(new Error('Missing or insufficient permissions.'))
      return () => {}
    })
    renderApp('/')
    expect(screen.getByRole('alert')).toHaveTextContent('Missing or insufficient permissions.')
  })
})
