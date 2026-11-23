import { Link } from 'react-router-dom'

export default function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-4 py-8 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-bold text-slate-900">
            Damu<span className="text-teal-600">Link</span>
          </p>
          <p className="mt-1 text-sm text-slate-500">
            Linking donors to every emergency across Kenya.
          </p>
        </div>

        <nav aria-label="Footer" className="flex flex-wrap gap-4 text-sm text-slate-600">
          <Link to="/" className="hover:text-teal-700">
            Live appeals
          </Link>
          <Link to="/create-appeal" className="hover:text-teal-700">
            Post an appeal
          </Link>
          <Link to="/dashboard" className="hover:text-teal-700">
            Dashboard
          </Link>
        </nav>
      </div>

      <div className="border-t border-slate-100">
        <p className="mx-auto w-full max-w-6xl px-4 py-4 text-xs text-slate-500">
          &copy; {year} DamuLink · Built with React, Firebase and OpenStreetMap.
        </p>
      </div>
    </footer>
  )
}