import { describe, expect, it } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderApp, seedUser } from '../test/helpers.jsx'

describe('App routes', () => {
  it('renders the home page with the navbar and footer', () => {
    renderApp('/')
    expect(screen.getByRole('navigation', { name: 'Footer' })).toBeInTheDocument()
    expect(screen.getByRole('contentinfo')).toBeInTheDocument()
  })

  it('shows the 404 page for unknown routes', () => {
    renderApp('/nowhere')
    expect(screen.getByRole('heading', { name: 'This page is not on the map' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Back to the live feed' })).toHaveAttribute('href', '/')
  })

  it('protects the create appeal page and returns there after login', async () => {
    seedUser()
    const { signOutLocal } = await import('../services/localBackend.js')
    signOutLocal()
    const user = userEvent.setup()
    renderApp('/create-appeal')

    await user.type(screen.getByLabelText('Email address'), 'amina@example.com')
    await user.type(screen.getByLabelText('Password'), 'secret123')
    await user.click(screen.getByRole('button', { name: 'Log in' }))

    expect(await screen.findByRole('button', { name: 'Post appeal' })).toBeInTheDocument()
  })

  it('lets a signed-in user sign out from the navbar', async () => {
    seedUser()
    const user = userEvent.setup()
    renderApp('/dashboard')

    const [signOut] = screen.getAllByRole('button', { name: /sign out/i })
    await user.click(signOut)
    expect(await screen.findAllByRole('link', { name: 'Sign in' })).not.toHaveLength(0)
  })
})
