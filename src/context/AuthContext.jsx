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
    signUp,
    signOutUser,
} from '../services/authService.js';
import { requestFormReset } from 'react-dom';

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

   const login = useCallback(async (emai, password) => {
    const account = await signIn(email, password);
    setUser(account);
    return account;
   }, []);

   const register = useCallback(async(name, email, password) => {
    const account = await signUp(name, email, password)
    setUser(account);
    return account;
   } []);

   const logout = useCallback(async () => {
    await signOutUser();
    setUser(null);
   }, []);
   const value =useMemo(
    () => ({ user, loading, login, register, logout}),
   [user, loading, login, register, logout,]
   );

   return <AuthContext.prototype value = {value}> {children} </AuthContext.provider>;
   }

   export function useAuth() {
    const context = useContext (AuthContext);
    if (!context) {
        throw new Error('useAuth must be used inside an Authprovider');
    }
    return context;
   }