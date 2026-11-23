import { describe, expect, it, vi } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import * as geocode from '../services/geocode.js'
import * as appealService from '../services/appealService.js'
import { listLocalAppeals } from '../services/localBackend.js'
import { renderApp, seedUser } from '../test/helpers.jsx'

async function fillForm(user) {
  await user.type(screen.getByLabelText('Patient name'), 'Mary W.')
  await user.type(screen.getByLabelText('Hospital'), 'Kenyatta National Hospital')
  await user.selectOptions(screen.getByLabelText('County'), 'Nairobi')
  await user.selectOptions(screen.getByLabelText('Blood type'), 'O+')
  await user.clear(screen.getByLabelText('Units needed'))
  await user.type(screen.getByLabelText('Units needed'), '3')
  await user.selectOptions(screen.getByLabelText('Urgency'), 'critical')
  await user.type(screen.getByLabelText('Contact phone'), '0712345678')
}

describe('Create appeal page', () => {
  it('sends signed-out visitors to the login page', () => {
    renderApp('/create-appeal')
    expect(screen.getByRole('heading', { name: 'Welcome back' })).toBeInTheDocument()
  })

  it('shows validation errors and does not save an empty form', async () => {
    seedUser()
    const user = userEvent.setup()
    const spy = vi.spyOn(geocode, 'geocodeAppeal')
    renderApp('/create-appeal')

    await user.click(screen.getByRole('button', { name: 'Post appeal' }))

    expect(screen.getByLabelText('Patient name')).toHaveAttribute('aria-invalid', 'true')
    expect(spy).not.toHaveBeenCalled()
    expect(listLocalAppeals()).toHaveLength(0)
  })

  it('geocodes the hospital, saves the appeal and opens the dashboard', async () => {
    seedUser()
    const user = userEvent.setup()
    const spy = vi.spyOn(geocode, 'geocodeAppeal').mockResolvedValue({ lat: -1.3, lon: 36.8 })
    renderApp('/create-appeal')

    await fillForm(user)
    await user.click(screen.getByRole('button', { name: 'Post appeal' }))

    expect(await screen.findByText('Appeal posted. Donors can now see it.')).toBeInTheDocument()
    expect(spy).toHaveBeenCalledWith({ hospital: 'Kenyatta National Hospital', county: 'Nairobi' })
    const [saved] = listLocalAppeals()
    expect(saved).toMatchObject({
      patientName: 'Mary W.',
      bloodType: 'O+',
      units: 3,
      urgency: 'critical',
      status: 'open',
      lat: -1.3,
      lon: 36.8,
    })
  })

  it('still saves when the location cannot be found', async () => {
    seedUser()
    const user = userEvent.setup()
    vi.spyOn(geocode, 'geocodeAppeal').mockResolvedValue(null)
    renderApp('/create-appeal')

    await fillForm(user)
    await user.click(screen.getByRole('button', { name: 'Post appeal' }))

    expect(await screen.findByText('Appeal posted. Donors can now see it.')).toBeInTheDocument()
    expect(listLocalAppeals()[0]).toMatchObject({ lat: null, lon: null })
  })

  it('shows an error when saving fails', async () => {
    seedUser()
    const user = userEvent.setup()
    vi.spyOn(geocode, 'geocodeAppeal').mockResolvedValue(null)
    vi.spyOn(appealService, 'addAppeal').mockRejectedValue(new Error('Network down'))
    renderApp('/create-appeal')

    await fillForm(user)
    await user.click(screen.getByRole('button', { name: 'Post appeal' }))

    expect(await screen.findByRole('alert')).toHaveTextContent('Network down')
  })
})
