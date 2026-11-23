import { describe, expect, it, vi } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import * as appealService from '../services/appealService.js'
import { getLocalAppeal, updateLocalAppeal } from '../services/localBackend.js'
import { renderApp, seedAppeal, seedUser } from '../test/helpers.jsx'

describe('Appeal details page', () => {
  it('shows the appeal details and contact number', async () => {
    seedUser()
    const appeal = seedAppeal()
    renderApp(`/appeal/${appeal.id}`)

    expect(screen.getByText('Loading appeal...')).toBeInTheDocument()
    expect(await screen.findByRole('heading', { name: 'Mary W.' })).toBeInTheDocument()
    expect(screen.getByText('Kenyatta National Hospital')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: '0712345678' })).toHaveAttribute('href', 'tel:0712345678')
  })

  it('records a pledge and updates the units', async () => {
    seedUser()
    const appeal = seedAppeal({ units: 4 })
    const user = userEvent.setup()
    renderApp(`/appeal/${appeal.id}`)

    const input = await screen.findByLabelText('Units to pledge')
    await user.clear(input)
    await user.type(input, '2')
    await user.click(screen.getByRole('button', { name: 'Pledge blood' }))

    expect(await screen.findByText('Thank you. 2 of 4 units are now pledged.')).toBeInTheDocument()
    expect(getLocalAppeal(appeal.id).unitsPledged).toBe(2)
  })

  it('hides the pledge form once the appeal is fulfilled', async () => {
    seedUser()
    const appeal = seedAppeal()
    updateLocalAppeal(appeal.id, { status: 'fulfilled', unitsPledged: 4 })
    renderApp(`/appeal/${appeal.id}`)

    expect(await screen.findByText('Fulfilled')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Pledge blood' })).not.toBeInTheDocument()
  })

  it('shows an error when the pledge fails', async () => {
    seedUser()
    const appeal = seedAppeal()
    const user = userEvent.setup()
    vi.spyOn(appealService, 'pledgeUnits').mockRejectedValue(new Error('Try again later'))
    renderApp(`/appeal/${appeal.id}`)

    await user.click(await screen.findByRole('button', { name: 'Pledge blood' }))
    expect(await screen.findByRole('alert')).toHaveTextContent('Try again later')
  })

  it('says when an appeal does not exist', async () => {
    renderApp('/appeal/missing')
    expect(await screen.findByRole('alert')).toHaveTextContent('That appeal could not be found.')
    expect(screen.getByRole('link', { name: 'Return to appeals' })).toHaveAttribute('href', '/')
  })

  it('shows a load error', async () => {
    vi.spyOn(appealService, 'fetchAppeal').mockRejectedValue(new Error('Offline'))
    renderApp('/appeal/abc')
    expect(await screen.findByRole('alert')).toHaveTextContent('Offline')
  })
})
