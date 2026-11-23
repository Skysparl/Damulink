import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Route, Routes } from 'react-router-dom'
import AppealCard from '../components/AppealCard.jsx'
import AppealFilters from '../components/AppealFilters.jsx'
import { BloodTypeBadge, UrgencyBadge } from '../components/Badges.jsx'
import EmptyState from '../components/EmptyState.jsx'
import Field from '../components/Field.jsx'
import Footer from '../components/Footer.jsx'
import GoogleButton from '../components/GoogleButton.jsx'
import Modal from '../components/Modal.jsx'
import Navbar from '../components/Navbar.jsx'
import ProtectedRoute from '../components/ProtectedRoute.jsx'
import Spinner from '../components/Spinner.jsx'
import { AuthProvider } from '../context/AuthContext.jsx'
import { makeAppeal, renderWithRouter, seedUser } from '../test/helpers.jsx'

describe('Badges', () => {
  it('shows blood type and urgency', () => {
    render(
      <>
        <BloodTypeBadge type="AB-" size="lg" />
        <UrgencyBadge urgency="critical" />
        <UrgencyBadge urgency="routine" />
        <UrgencyBadge urgency="unknown" />
        <UrgencyBadge urgency="urgent" fulfilled />
      </>,
    )
    expect(screen.getByTitle('Blood type AB-')).toHaveTextContent('AB-')
    expect(screen.getByText('Critical')).toBeInTheDocument()
    expect(screen.getByText('Routine')).toBeInTheDocument()
    expect(screen.getByText('Normal')).toBeInTheDocument()
    expect(screen.getByText('Fulfilled')).toBeInTheDocument()
  })
})

describe('AppealCard', () => {
  it('shows patient, hospital and pledge progress', () => {
    renderWithRouter(<AppealCard appeal={makeAppeal()} />)
    expect(screen.getByRole('heading', { name: 'Mary W.' })).toBeInTheDocument()
    expect(screen.getByText('Kenyatta National Hospital, Nairobi')).toBeInTheDocument()
    expect(screen.getByText('1 of 2 units pledged')).toBeInTheDocument()
    expect(screen.getByText('1 to go')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Pledge blood' })).toHaveAttribute('href', '/appeal/appeal-1')
  })

  it('shows a reached goal for fulfilled appeals', () => {
    renderWithRouter(<AppealCard appeal={makeAppeal({ status: 'fulfilled', unitsPledged: 2 })} />)
    expect(screen.getByText('Goal reached')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'View appeal' })).toBeInTheDocument()
  })
})

describe('AppealFilters', () => {
  it('reports changes to each filter', () => {
    const onChange = vi.fn()
    const values = { search: '', bloodType: 'all', county: 'all', urgency: 'all' }
    render(<AppealFilters values={values} onChange={onChange} />)
    fireEvent.change(screen.getByPlaceholderText('Patient, hospital or county'), { target: { value: 'knh' } })
    expect(onChange).toHaveBeenLastCalledWith({ ...values, search: 'knh' })
    fireEvent.change(screen.getByLabelText('Blood type'), { target: { value: 'O-' } })
    expect(onChange).toHaveBeenLastCalledWith({ ...values, bloodType: 'O-' })
    fireEvent.change(screen.getByLabelText('County'), { target: { value: 'Kisumu' } })
    expect(onChange).toHaveBeenLastCalledWith({ ...values, county: 'Kisumu' })
    fireEvent.change(screen.getByLabelText('Urgency'), { target: { value: 'critical' } })
    expect(onChange).toHaveBeenLastCalledWith({ ...values, urgency: 'critical' })
  })
})

describe('small components', () => {
  it('renders EmptyState with a default link or a custom action', () => {
    const { unmount } = renderWithRouter(<EmptyState />)
    expect(screen.getByText('Nothing here yet')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Go home' })).toHaveAttribute('href', '/')
    unmount()
    render(<EmptyState title="Empty" message="" action={<button>Do it</button>} />)
    expect(screen.getByRole('button', { name: 'Do it' })).toBeInTheDocument()
  })

  it('renders Field with error or hint', () => {
    const { rerender } = render(
      <Field label="Email" hint="We never share it" htmlFor="e">
        <input id="e" />
      </Field>,
    )
    expect(screen.getByText('We never share it')).toBeInTheDocument()
    rerender(
      <Field label="Email" hint="We never share it" error="Email is required" htmlFor="e">
        <input id="e" />
      </Field>,
    )
    expect(screen.getByText('Email is required')).toBeInTheDocument()
    expect(screen.queryByText('We never share it')).not.toBeInTheDocument()
  })

  it('renders Spinner, Footer and GoogleButton', async () => {
    const onClick = vi.fn()
    renderWithRouter(
      <>
        <Spinner size="lg" label="Loading appeals" />
        <Footer />
        <GoogleButton onClick={onClick} />
      </>,
    )
    expect(screen.getByRole('status')).toHaveTextContent('Loading appeals')
    expect(screen.getByRole('navigation', { name: 'Footer' })).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Continue with Google' }))
    expect(onClick).toHaveBeenCalled()
  })
})

describe('Modal', () => {
  it('renders nothing when closed', () => {
    render(<Modal open={false} title="Hidden" onClose={() => {}} />)
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('closes with Escape, the close button and the backdrop', async () => {
    const onClose = vi.fn()
    render(
      <Modal open title="Delete this appeal?" onClose={onClose}>
        <p>Body</p>
      </Modal>,
    )
    expect(screen.getByRole('dialog', { name: 'Delete this appeal?' })).toHaveTextContent('Body')
    expect(document.body.style.overflow).toBe('hidden')
    fireEvent.keyDown(document, { key: 'Escape' })
    fireEvent.keyDown(document, { key: 'Enter' })
    await userEvent.click(screen.getByRole('button', { name: 'Close' }))
    await userEvent.click(screen.getByRole('button', { name: 'Close dialog' }))
    expect(onClose).toHaveBeenCalledTimes(3)
  })
})

describe('Navbar', () => {
  const renderNav = () =>
    renderWithRouter(
      <AuthProvider>
        <Navbar />
      </AuthProvider>,
    )

  it('shows sign in and join for guests, and toggles the mobile menu', async () => {
    renderNav()
    expect(screen.getAllByRole('link', { name: 'Sign in' })[0]).toHaveAttribute('href', '/login')
    expect(screen.queryByText('Dashboard')).not.toBeInTheDocument()
    const toggle = screen.getByRole('button', { name: 'Toggle menu' })
    await userEvent.click(toggle)
    expect(toggle).toHaveAttribute('aria-expanded', 'true')
    expect(screen.getAllByRole('link', { name: 'Join' })).toHaveLength(2)
    await userEvent.click(screen.getAllByRole('link', { name: 'Join' })[1])
    expect(toggle).toHaveAttribute('aria-expanded', 'false')
  })

  it('greets the signed-in user and signs out', async () => {
    seedUser()
    renderNav()
    expect(screen.getByText('Hi, Amina')).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Toggle menu' }))
    expect(screen.getByRole('button', { name: 'Sign out (Amina)' })).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Sign out' }))
    expect(await screen.findAllByRole('link', { name: 'Sign in' })).not.toHaveLength(0)
  })
})

describe('ProtectedRoute', () => {
  const tree = (
    <AuthProvider>
      <Routes>
        <Route path="/dashboard" element={<ProtectedRoute><p>Secret dashboard</p></ProtectedRoute>} />
        <Route path="/login" element={<p>Login page</p>} />
      </Routes>
    </AuthProvider>
  )

  it('redirects guests to login', () => {
    renderWithRouter(tree, { route: '/dashboard' })
    expect(screen.getByText('Login page')).toBeInTheDocument()
  })

  it('shows the page to signed-in users', () => {
    seedUser()
    renderWithRouter(tree, { route: '/dashboard' })
    expect(screen.getByText('Secret dashboard')).toBeInTheDocument()
  })
})
