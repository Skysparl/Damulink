import { describe, expect, it } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderApp, seedUser } from '../test/helpers.jsx'
import { signOutLocal } from '../services/localBackend.js'

async function fill(label, value) {
  await userEvent.type(screen.getByLabelText(label), value)
}

describe('Login page', () => {
  it('validates required fields and email format', async () => {
    renderApp('/login')
    await userEvent.click(screen.getByRole('button', { name: 'Log in' }))
    expect(screen.getByText('Email is required.')).toBeInTheDocument()
    expect(screen.getByText('Password is required.')).toBeInTheDocument()
    await fill('Email address', 'not-an-email')
    await userEvent.click(screen.getByRole('button', { name: 'Log in' }))
    expect(screen.getByText('Enter a valid email address.')).toBeInTheDocument()
  })

  it('shows an error for a wrong password', async () => {
    seedUser()
    signOutLocal()
    renderApp('/login')
    await fill('Email address', 'amina@example.com')
    await fill('Password', 'wrongpass')
    await userEvent.click(screen.getByRole('button', { name: 'Log in' }))
    expect(await screen.findByRole('alert')).toHaveTextContent('Wrong email or password')
  })

  it('logs in and goes to the dashboard', async () => {
    seedUser()
    signOutLocal()
    renderApp('/login')
    await fill('Email address', 'amina@example.com')
    await fill('Password', 'secret123')
    await userEvent.click(screen.getByRole('button', { name: 'Log in' }))
    expect(await screen.findByRole('heading', { name: 'Welcome, Amina Wanjiku' })).toBeInTheDocument()
  })

  it('sends guests from a protected page to login, then back after signing in', async () => {
    seedUser()
    signOutLocal()
    renderApp('/create-appeal')
    expect(await screen.findByText('Please log in to continue.')).toBeInTheDocument()
    await fill('Email address', 'amina@example.com')
    await fill('Password', 'secret123')
    await userEvent.click(screen.getByRole('button', { name: 'Log in' }))
    expect(await screen.findByRole('heading', { name: 'Tell donors what the patient needs' })).toBeInTheDocument()
  })

  it('shows the Google sign-in error when Firebase is not configured', async () => {
    renderApp('/login')
    await userEvent.click(screen.getByRole('button', { name: 'Continue with Google' }))
    expect(await screen.findByRole('alert')).toHaveTextContent(/needs Firebase/)
  })

  it('redirects signed-in users away from login', async () => {
    seedUser()
    renderApp('/login')
    expect(await screen.findByRole('heading', { name: 'Welcome, Amina Wanjiku' })).toBeInTheDocument()
  })
})

describe('Register page', () => {
  it('validates every field', async () => {
    renderApp('/register')
    await userEvent.click(screen.getByRole('button', { name: 'Create account' }))
    expect(screen.getByText('Full name is required.')).toBeInTheDocument()
    expect(screen.getByText('Email is required.')).toBeInTheDocument()
    expect(screen.getByText('Password is required.')).toBeInTheDocument()
    expect(screen.getByText('Confirm your password.')).toBeInTheDocument()

    await fill('Full name', 'Al')
    await fill('Email address', 'bad')
    await fill('Password', 'short')
    await fill('Confirm password', 'different')
    await userEvent.click(screen.getByRole('button', { name: 'Create account' }))
    expect(screen.getByText('Use at least 3 characters.')).toBeInTheDocument()
    expect(screen.getByText('Enter a valid email address.')).toBeInTheDocument()
    expect(screen.getByText('Use at least 8 characters.')).toBeInTheDocument()
    expect(screen.getByText('Passwords do not match.')).toBeInTheDocument()
  })

  it('creates an account and opens the dashboard', async () => {
    renderApp('/register')
    await fill('Full name', 'Brian Otieno')
    await fill('Email address', 'brian@example.com')
    await fill('Password', 'secret123')
    await fill('Confirm password', 'secret123')
    await userEvent.click(screen.getByRole('button', { name: 'Create account' }))
    expect(await screen.findByRole('heading', { name: 'Welcome, Brian Otieno' })).toBeInTheDocument()
  })

  it('shows an error when the email is taken, and handles Google sign-up', async () => {
    seedUser()
    signOutLocal()
    renderApp('/register')
    await fill('Full name', 'Amina Again')
    await fill('Email address', 'amina@example.com')
    await fill('Password', 'secret123')
    await fill('Confirm password', 'secret123')
    await userEvent.click(screen.getByRole('button', { name: 'Create account' }))
    expect(await screen.findByRole('alert')).toHaveTextContent('That email is already registered')
    await userEvent.click(screen.getByRole('button', { name: 'Sign up with Google' }))
    expect(await screen.findByRole('alert')).toHaveTextContent(/needs Firebase/)
  })

  it('redirects signed-in users away from register', async () => {
    seedUser()
    renderApp('/register')
    expect(await screen.findByRole('heading', { name: 'Welcome, Amina Wanjiku' })).toBeInTheDocument()
  })
})
