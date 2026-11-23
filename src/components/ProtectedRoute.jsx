import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

export default function ProtectedRoute({ children }) {
    const { user, loading } = useAuth();
    const location = useLocation();

    if(loading) {
        return (
            <div className="mx-auto max-w-6xl px-4 py-24 text-center text-sm text-muted">
                Checking your session...
            </div>
        );
    }
    if (!user) {
        return <Navigate to="/login" replace state={{ from: location.pathname }} />
    }
    return children;
}