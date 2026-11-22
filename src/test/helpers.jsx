import { render } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'

export function renderWithRouter(ui, { route = '/' } = {}) {
  return render(<MemoryRouter initialEntries={[route]}>{ui}</MemoryRouter>)
}

export function makeAppeal(overrides = {}) {
  return {
    id: 'appeal-1',
    createdBy: 'user-1',
    ownerName: 'Amina Wanjiku',
    patientName: 'Mary W.',
    hospital: 'Kenyatta National Hospital',
    county: 'Nairobi',
    bloodType: 'O+',
    units: 2,
    unitsPledged: 1,
    urgency: 'critical',
    status: 'active',
    contactPhone: '0712345678',
    lat: -1.301,
    lon: 36.807,
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides,
  }
}