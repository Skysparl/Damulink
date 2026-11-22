import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <section className="mx-auto w-full max-w-xl px-4 py-20 text-center">
      <p className="text-sm font-semibold uppercase tracking-widest text-crimson-600">404</p>
      <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-900">
        This page is not on the map
      </h1>
      <p className="mt-2 text-sm text-slate-600">
        The link may be broken, or the appeal it pointed to has been removed.
      </p>
      <Link to="/" className="btn btn-primary mt-6">
        Back to the live feed
      </Link>
    </section>
  )
}
