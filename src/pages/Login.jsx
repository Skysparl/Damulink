import { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'

import Field from '../components/Field'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const { user, loading, login } = useAuth()
  const navigate = useNavigate()

  const [form, setForm] = useState({ email: '', password: '' })
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

  async function handleSubmit(event) {
    event.preventDefault()

    const nextErrors = {}
    if (!form.email.trim()) {
      nextErrors.email = 'Email is required.'
    } else if (!/^\S+@\S+\.\S+$/.test(form.email.trim())) {
      nextErrors.email = 'Enter a valid email address.'
    }
    if (!form.password) {
      nextErrors.password = 'Password is required.'
    }

    setErrors(nextErrors)
    setFormError('')
    if (Object.keys(nextErrors).length > 0) return

    setBusy(true)
    try {
      await login(form.email.trim(), form.password)
      navigate('/dashboard', { replace: true })
    } catch (error) {
      setFormError(error.message || 'Could not log you in. Please try again.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <section className="mx-auto w-full max-w-5xl px-4 py-12">
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm lg:grid lg:grid-cols-2">
        <div className="hidden flex-col justify-between bg-ink p-10 text-white lg:flex">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-teal-300">
              DamuLink
            </p>
            <h2 className="mt-4 text-3xl font-bold leading-tight">
              One login. A network of donors ready to respond.
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-slate-300">
              Track the appeals you post, pledge units in a few taps, and close an appeal once a
              patient has been covered.
            </p>
          </div>
          <p className="mt-8 rounded-xl bg-white/5 p-4 text-sm text-teal-100 ring-1 ring-inset ring-white/10">
            &ldquo;We found three O-negative donors within an hour of posting.&rdquo; &mdash;
            Nairobi County Referral
          </p>
        </div>

        <div className="p-6 sm:p-10">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Welcome back</h1>
          <p className="mt-1 text-sm text-slate-600">
            Log in to pledge blood and manage your appeals.
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

            <Field label="Password" error={errors.password}>
              <input
                className="input"
                type="password"
                name="password"
                autoComplete="current-password"
                placeholder="Your password"
                value={form.password}
                onChange={handleChange}
              />
            </Field>

            <button type="submit" className="btn btn-primary w-full" disabled={busy}>
              {busy ? 'Logging in…' : 'Log in'}
            </button>
          </form>

          <p className="mt-6 text-sm text-slate-600">
            New to DamuLink?{' '}
            <Link to="/register" className="font-semibold text-teal-700 hover:text-teal-800">
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </section>
  )
}