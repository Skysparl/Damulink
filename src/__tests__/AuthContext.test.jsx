import { describe, expect, it, vi } from 'vitest'
import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AuthProvider, useAuth } from '../context/AuthContext.jsx'
import { seedUser } from '../test/helpers.jsx'
import { signOutLocal } from '../services/localBackend.js'

function Probe() {
  const { user, loading, login, register, logout, loginWithGoogle } = useAuth()
  return (
    <div>
      <p>{loading ? 'loading' : user ? `signed in as ${user.name}` : 'signed out'}</p>
      <button onClick={() => register('Brian Otieno', 'brian@example.com', 'secret123')}>register</button>
      <button onClick={() => login('amina@example.com', 'secret123')}>login</button>
      <button onClick={() => logout()}>logout</button>
      <button onClick={() => loginWithGoogle().catch((e) => window.__googleError(e.message))}>google</button>
    </div>
  )
}

describe('AuthContext', () => {
  it('throws when used outside the provider', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
    const Broken = () => {
      useAuth()
      return null
    }
    expect(() => render(<Broken />)).toThrow('useAuth must be used inside an AuthProvider')
  })

  it('restores an existing session', () => {
    seedUser()
    render(<AuthProvider><Probe /></AuthProvider>)
    expect(screen.getByText('signed in as Amina Wanjiku')).toBeInTheDocument()
  })

  it('registers, logs out and logs back in', async () => {
    seedUser()
    signOutLocal()
    render(<AuthProvider><Probe /></AuthProvider>)
    expect(screen.getByText('signed out')).toBeInTheDocument()

    await userEvent.click(screen.getByText('register'))
    expect(await screen.findByText('signed in as Brian Otieno')).toBeInTheDocument()

    await userEvent.click(screen.getByText('logout'))
    expect(await screen.findByText('signed out')).toBeInTheDocument()

    await userEvent.click(screen.getByText('login'))
    expect(await screen.findByText('signed in as Amina Wanjiku')).toBeInTheDocument()
  })

  it('surfaces the Google sign-in error in demo mode', async () => {
    window.__googleError = vi.fn()
    render(<AuthProvider><Probe /></AuthProvider>)
    await act(() => userEvent.click(screen.getByText('google')))
    expect(window.__googleError).toHaveBeenCalledWith(expect.stringMatching(/needs Firebase/))
  })
})
