# DamuLink

DamuLink is an emergency blood appeal and donor network for Kenya. Families and hospitals post an appeal with the patient's blood type, the units needed and the hospital. Donors browse a live feed, filter by blood type, county and urgency, and pledge units.

- **Live demo:** _add your Vercel or Netlify URL here_
- **Figma wireframes:** _add your Figma link here_
- **Kanban board:** _add your GitHub Projects link here_

## Features

| Area | What it does |
| --- | --- |
| Auth | Register and log in with email and password, or with Google. Friendly error messages. |
| Protected routes | `/create-appeal` and `/dashboard` send guests to `/login`, then back to the page they wanted. |
| External API | OpenStreetMap Nominatim geocodes the hospital and stores its latitude and longitude. |
| Create | Post an appeal: patient, hospital, county, blood type, units, urgency and contact phone. |
| Read | The home feed updates live with Firestore `onSnapshot` and filters by blood type, county and urgency. |
| Update | Donors pledge units in a Firestore transaction, so an appeal is never over-pledged. Owners can mark an appeal fulfilled or re-open it. |
| Delete | Owners delete their appeals after a confirmation dialog. |
| Security | `firestore.rules` lets only the owner edit or delete an appeal. Other signed-in users can only raise `unitsPledged`. |

## Tech stack

React 19, Vite 8, Tailwind CSS 4, React Router 7, Firebase (Auth and Cloud Firestore), Nominatim, Vitest with React Testing Library, GitHub Actions, and Vercel.

Colours: crimson `#DC2626` for urgent actions and alerts, teal `#0D9488` for trust and confirmations. Both are defined in the `@theme` block in `src/index.css`.

## Routes

| Path | Page | Access |
| --- | --- | --- |
| `/` | Live appeal feed | Public |
| `/login` | Log in | Public |
| `/register` | Create an account | Public |
| `/appeal/:id` | Appeal details and pledging | Public |
| `/create-appeal` | Post an appeal | Signed in |
| `/dashboard` | My appeals | Signed in |
| `*` | Not found | Public |

## Project structure

```
src/
  components/  Reusable UI: Navbar, AppealCard, AppealFilters, Field, Modal, ProtectedRoute...
  context/     AuthContext (current user, login, Google login, register, logout)
  hooks/       useAppeals (live feed) and useAppeal (one appeal)
  pages/       Home, Login, Register, CreateAppeal, AppealDetails, Dashboard, NotFound
  services/    firebase.js, authService.js, appealService.js, geocode.js, localBackend.js
  utils/       constants, validation, appeal logic, formatting
  __tests__/   Vitest and React Testing Library suites
```

## Getting started

```bash
npm install
cp .env.example .env   # optional, see below
npm run dev
```

Open http://localhost:5173.

### Demo mode

If `.env` is empty, the app runs in demo mode. Accounts and appeals are saved in your browser's localStorage, so you can try every feature without Firebase. Google sign-in needs Firebase.

### Firebase setup

1. Create a project at https://console.firebase.google.com and add a **Web app**.
2. Copy its config values into `.env` (the names are in `.env.example`).
3. In **Authentication > Sign-in method**, enable **Email/Password** and **Google**.
4. Create a **Cloud Firestore** database.
5. Publish the security rules, either by pasting `firestore.rules` into **Firestore > Rules**, or with `npx firebase-tools deploy --only firestore:rules`.
6. After deploying, add your live domain under **Authentication > Settings > Authorized domains** so Google sign-in works there.

## Testing

```bash
npm test             # run all tests once
npm run coverage     # run with a coverage report (fails under 70%)
```

There are 101 tests across 14 files, covering 95% of lines. Tests run in demo mode, and Firebase calls are mocked in `firebaseServices.test.js`.

## CI/CD

`.github/workflows/ci.yml` runs on every push and pull request to `main`. It installs dependencies, runs the tests with coverage and builds the app. Add the six `VITE_FIREBASE_*` values under **Settings > Secrets and variables > Actions** so the build uses your Firebase project.

## Deployment (Vercel)

1. Import the GitHub repository at https://vercel.com/new. Vercel detects Vite.
2. Add the six `VITE_FIREBASE_*` environment variables.
3. Deploy. `vercel.json` rewrites all paths to `index.html` so refreshing `/dashboard` or `/appeal/:id` works.
4. Add the Vercel domain to Firebase's authorized domains.

## Git workflow

Work happens on feature branches (`feature/auth`, `feature/appeals`, `chore/finish-capstone`...) and is merged into `main` through pull requests once CI passes.
