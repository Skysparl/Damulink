import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState,
} from 'react';
import {
    subscribeToAuth,
    signIn,
    signInWithGoogle,
    signUp,
    signOutUser,
} from '../services/authService.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = subscribeToAuth((nextUser) => {
            setUser(nextUser);
            setLoading(false);
        });
        return unsubscribe;
    }, []);

    const login = useCallback(async (email, password) => {
        const account = await signIn(email, password);
        setUser(account);
        return account;
    }, []);

    const loginWithGoogle = useCallback(async () => {
        const account = await signInWithGoogle();
        setUser(account);
        return account;
    }, []);

    const register = useCallback(async (name, email, password) => {
        const account = await signUp(name, email, password);
        setUser(account);
        return account;
    }, []);

    const logout = useCallback(async () => {
        await signOutUser();
        setUser(null);
    }, []);

    const value = useMemo(
        () => ({ user, loading, login, loginWithGoogle, register, logout }),
        [user, loading, login, loginWithGoogle, register, logout]
    );

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used inside an AuthProvider');
    }
    return context;
}