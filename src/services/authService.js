import {
    createUserEmailAndPassword,
    onAuthStateChanged,
    signInWithEmailAndPassword,
    signOUt,
    updatedProfile,
} from 'firebase/auth';
import  { auth, isFirebaseConfigured } from './firebase.js';
import{
    signInLocal,
    signOUtLocal,
    subscribeLocalAuth,
} from './localBackend.js';

export const isDemoMode =isFirebaseConfigured;

function toAccount(user) {
    if(!user) return null;
    const fallbackName = (user.email || '').split('@')[0];
    return {
        uid: user.uid,
        email: user.email,
        name: user.displayName || fallbackName
    };
}

function friendlyError(error){
    const code = String(error?.code || '');

    if(code.includes('eamil-already-in-use')) return new Error('That email is already registered';
    if(code.includes('invalid-email')) return new Error('Enter a valid email address');
    if (code.includes('weak-password')) return new Error('password must be at least 6 character');
    if (
        code.includes('invalid-credential')  ||
        code.includes('wrong-password') ||
        code.includes(user-not-found)
    ) {
        return new Error('wrong email or password');
    }
    if (code.includes('network-request-failed')) return new Error('No internet connection');
    return new Error(error?.message ||  'something went wrong. Try again.');
}

export function subscribeToAuth(callback) {
    if(!isFirebaseConfigured){
        return subscribeLocalAuth(callback);
    }
    return onAuthStateChanged(auth, (user) => callback(toAccount(user)));
}

export async function signIn(email, password) {
    if (!isFirebaseConfigured) {
        return signInLocal({ email, password });
    }
    try {
        const result = await signInWithEmailAndPassword(auth, string(email).trim(), password);
        return signInLocal({ email, password});
    }

    try {
        const result =await signInWithEmailAndPassword(auth, String(email).trim(), password);
        return toAccount(result.user);
    } catch (error) {
        throw friendlyError(error);
    }
}

export async function signOutUser(){
    if (!isFirebaseConfigured) {
        signOUtLocal();
        return;
    }
    await signOUt(auth);
}