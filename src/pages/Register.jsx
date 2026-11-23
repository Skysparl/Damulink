import { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'

import Field from '../components/Field'
import GoogleButton from '../components/GoogleButton'
import { useAuth } from '../context/AuthContext'

const emptyForm = {
  name: '',
  email: '',
  password: '',
  confirmPassword: '',
}

export default function Register() {
  const { user, loading, register, loginWithGoogle } = useAuth()
  const navigate = useNavigate()

  const [form, setForm] = useState(emptyForm)
  const [errors, setErrors] = useState({})
  const [formError, setFormError] = useState('')
  const [busy, setBusy] = useState(false)

  if (!loading && user) {
    return <Navigate to="/dashboard" replace />
  }

  function handleChange(event) {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
  }

  async function handleGoogle() {
    setFormError('')
    setBusy(true)
    try {
      await loginWithGoogle()
      navigate('/dashboard', { replace: true })
    } catch (error) {
      setFormError(error.message || 'Google sign-in failed. Please try again.')
    } finally {
      setBusy(false)
    }
  }

  async function handleSubmit(event) {
    event.preventDefault()

    const nextErrors = {}
    const name = form.name.trim()

    if (!name) nextErrors.name = 'Full name is required.'
    else if (name.length < 3) nextErrors.name = 'Use at least 3 characters.'

    if (!form.email.trim()) nextErrors.email = 'Email is required.'
    else if (!/^\S+@\S+\.\S+$/.test(form.email.trim())) {
      nextErrors.email = 'Enter a valid email address.'
    }

    if (!form.password) nextErrors.password = 'Password is required.'
    else if (form.password.length < 8) nextErrors.password = 'Use at least 8 characters.'

    if (!form.confirmPassword) nextErrors.confirmPassword = 'Confirm your password.'
    else if (form.confirmPassword !== form.password) {
      nextErrors.confirmPassword = 'Passwords do not match.'
    }

    setErrors(nextErrors)
    setFormError('')
    if (Object.keys(nextErrors).length > 0) return

    setBusy(true)
    try {
      await register(name, form.email.trim(), form.password)
      navigate('/dashboard', { replace: true })
    } catch (error) {
      setFormError(error.message || 'Could not create your account. Please try again.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <section className="mx-auto w-full max-w-2xl px-4 py-12">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-10">
        <p className="text-xs font-semibold uppercase tracking-widest text-teal-600">
          Join DamuLink
        </p>
        <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-900">
          Become a blood donor
        </h1>
        <p className="mt-1 text-sm text-slate-600">
          Create an account to post appeals and pledge blood in your county.
        </p>

        {formError ? (
          <p
            role="alert"
            className="mt-5 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
          >
            {formError}
          </p>
        ) : null}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4" noValidate>
          <Field label="Full name" error={errors.name}>
            <input
              className="input"
              type="text"
              name="name"
              autoComplete="name"
              placeholder="e.g. Amina Wanjiku"
              value={form.name}
              onChange={handleChange}
            />
          </Field>

          <Field label="Email address" error={errors.email}>
            <input
              className="input"
              type="email"
              name="email"
              autoComplete="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={handleChange}
            />
          </Field>

          <Field label="Password" error={errors.password} hint="At least 8 characters.">
            <input
              className="input"
              type="password"
              name="password"
              autoComplete="new-password"
              placeholder="Choose a password"
              value={form.password}
              onChange={handleChange}
            />
          </Field>

          <Field label="Confirm password" error={errors.confirmPassword}>
            <input
              className="input"
              type="password"
              name="confirmPassword"
              autoComplete="new-password"
              placeholder="Type it again"
              value={form.confirmPassword}
              onChange={handleChange}
            />
          </Field>

          <button type="submit" className="btn btn-primary w-full" disabled={busy}>
            {busy ? 'Creating account…' : 'Create account'}
          </button>
        </form>
        <div className="my-5 flex items-center gap-3 text-xs text-muted">
          <span className="h-px flex-1 bg-slate-200" />
          or
          <span className="h-px flex-1 bg-slate-200" />
        </div>
        <GoogleButton onClick={handleGoogle} disabled={busy} label="Sign up with Google" />

        <p className="mt-6 text-sm text-slate-600">
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-teal-700 hover:text-teal-800">
            Log in
          </Link>
        </p>
      </div>
    </section>
  )
}