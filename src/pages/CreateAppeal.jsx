import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

import Field from '../components/Field'
import { useAuth } from '../context/AuthContext'
import { addAppeal } from '../services/appealService'
import { geocodeAppeal } from '../services/geocode'
import { APPEAL_STATUS, BLOOD_TYPES, COUNTIES, URGENCY_LEVELS } from '../utils/constants'
import { validateAppeal } from '../utils/validation'

const initialValues = {
  patientName: '',
  hospital: '',
  county: '',
  bloodType: '',
  units: '1',
  urgency: 'urgent',
  contactPhone: '',
}

export default function CreateAppeal() {
  const { user } = useAuth()
  const navigate = useNavigate()

  const [values, setValues] = useState(initialValues)
  const [errors, setErrors] = useState({})
  const [formError, setFormError] = useState('')
  const [saving, setSaving] = useState(false)

  function handleChange(event) {
    const { name, value } = event.target
    setValues((current) => ({ ...current, [name]: value }))
  }

  async function handleSubmit(event) {
    event.preventDefault()

    const nextErrors = validateAppeal(values)
    setErrors(nextErrors)
    setFormError('')
    if (Object.keys(nextErrors).length > 0) return

    setSaving(true)
    try {
      const place = await geocodeAppeal({
        hospital: values.hospital.trim(),
        county: values.county,
      })

      await addAppeal(
        {
          patientName: values.patientName.trim(),
          hospital: values.hospital.trim(),
          county: values.county,
          bloodType: values.bloodType,
          units: Number(values.units),
          unitsPledged: 0,
          urgency: values.urgency,
          contactPhone: values.contactPhone.trim(),
          status: APPEAL_STATUS.OPEN,
          lat: place ? place.lat : null,
          lon: place ? place.lon : null,
        },
        user,
      )

      navigate('/dashboard', { state: { message: 'Appeal posted. Donors can now see it.' } })
    } catch (error) {
      setFormError(error.message || 'Could not post the appeal. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <section className="mx-auto w-full max-w-3xl px-4 py-12">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-10">
        <p className="text-xs font-semibold uppercase tracking-widest text-red-600">
          New blood appeal
        </p>
        <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-900">
          Tell donors what the patient needs
        </h1>
        <p className="mt-1 text-sm text-slate-600">
          Only share details you are allowed to share. The hospital name and county keep the
          appeal findable.
        </p>

        {formError ? (
          <p
            role="alert"
            className="mt-5 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
          >
            {formError}
          </p>
        ) : null}

        <form onSubmit={handleSubmit} className="mt-6 grid gap-4 sm:grid-cols-2" noValidate>
          <div className="sm:col-span-2">
            <Field label="Patient name" error={errors.patientName} htmlFor="patientName">
              <input
                id="patientName"
                className="input"
                type="text"
                name="patientName"
                placeholder="e.g. Mary W."
                value={values.patientName}
                onChange={handleChange}
              />
            </Field>
          </div>

          <Field label="Hospital" error={errors.hospital} htmlFor="hospital">
            <input
              id="hospital"
              className="input"
              type="text"
              name="hospital"
              placeholder="e.g. Kenyatta National Hospital"
              value={values.hospital}
              onChange={handleChange}
            />
          </Field>

          <Field label="County" error={errors.county} htmlFor="county">
            <select
              id="county"
              className="input"
              name="county"
              value={values.county}
              onChange={handleChange}
            >
              <option value="">Select a county</option>
              {COUNTIES.map((county) => (
                <option key={county} value={county}>
                  {county}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Blood type" error={errors.bloodType} htmlFor="bloodType">
            <select
              id="bloodType"
              className="input"
              name="bloodType"
              value={values.bloodType}
              onChange={handleChange}
            >
              <option value="">Select a blood type</option>
              {BLOOD_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Units needed" error={errors.units} htmlFor="units">
            <input
              id="units"
              className="input"
              type="number"
              name="units"
              min="1"
              max="20"
              value={values.units}
              onChange={handleChange}
            />
          </Field>

          <Field label="Urgency" error={errors.urgency} htmlFor="urgency">
            <select
              id="urgency"
              className="input"
              name="urgency"
              value={values.urgency}
              onChange={handleChange}
            >
              {URGENCY_LEVELS.map((level) => (
                <option key={level.value} value={level.value}>
                  {level.label}
                </option>
              ))}
            </select>
          </Field>

          <Field
            label="Contact phone"
            error={errors.contactPhone}
            hint="Used by donors to reach the family or ward."
            htmlFor="contactPhone"
          >
            <input
              id="contactPhone"
              className="input"
              type="tel"
              name="contactPhone"
              placeholder="0712 345 678"
              value={values.contactPhone}
              onChange={handleChange}
            />
          </Field>

          <div className="mt-2 flex flex-wrap gap-3 sm:col-span-2">
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Posting appeal…' : 'Post appeal'}
            </button>
            <button
              type="button"
              className="btn btn-outline"
              onClick={() => navigate(-1)}
              disabled={saving}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </section>
  )
}