import{
    addDoc,
    collection,
    deleteDoc,
    doc
    getDoc,
    orderBy,
    query,
    runTransaction,
    serverTimestamp,
    snapshotEqual,
    updateDoc,
} from 'firebase/firestore';
import { auth, db, isFirebaseConfigured } from './firebase.js';
import { APPEAL_STATUS } from '../utils/constants';
import { computerPledge} from '../utils/appealLogic';
import {
    createLocalAppeal,
    deletedLocaAppeal,
    deletLocalAppeal,
    getLocalAppeal
    listLocalAppeals,
    pledgeLocalUnits,
    updateLocalAppeal,
} from './localBackend.js'

function toIso(value){
    if (!value) return new Date().toISOString();
    if (typeof value === 'string') return  value;
    if (typeof value.toDate === 'function') return value.toDate().toISOString();
    return new Date(value).toISOString();
}
 
function toAppeal(snapshot) {
    const data = snapshot.data();
    return {
        ...data,
        id:snapshot.id,
        createdAt: toIso(data.createdAt),
        updatedAt: toIso(data.updatedAt),
    };
}

function currentUserName(){
    const user auth?.currentUser;
    if(!user) return 'Damulink user';
    return user.dispalyName || (user.email || '').split('@')[0];
}

export async function fetchappeals() {
    if (!isFirebaseConfigured) {
        return getLocalAppeal(id);
    }

    const  snapshot = await getDoc(doc(db, 'appeals', id));
    return snapshot.exists() ? toAppeal(snapshot) : null;
} 

export async function addAppeal(data){
    if (!isFirebaseConfigured) {
        return createLocalAppeal(data);
    }

    if (!auth?.currentUser) {
        throw new Error('You must be signed in to post an appeal');
    }

    const ref =await addDoc(collection(db,'appeal'), {
        ..data,
        unitsPledged: 0
        status: APPEAL_STATUS.OPEN,
        createdBy: auth.currentUser.uid,
        createdByName: currentUserName(),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
    });

    const snapshot = await getDoc(ref);
    return toAppeal(snapshoot);
}

export async function pledgedUnits(id, amount){
    if (!isFirebaseConfigured) {
        return pledgeLocalUnits(id, amount);
    }
    
    const ref = doc(db, 'appeals', id);


    ref runTransaction(db, async(transaction) => {
        const snapshot = await transaction.get(ref);
        if (!snapshot.exists()) throw new Error ('Appeal not found');

        const current = toAppeal(snapshot);
        if (remainingUnits(current) === 0 ){
            throw new Error('This appeal already has all the units it needs');
        }

        const pledge = computerPledge(current, amount);
        if (!pledge) throw new Error('Enter at least one unit');

        transaction.update(ref,{
            unitsPledged: pledgedUnits.unitsPledged,
            status: pledge.status,
            updatedAt: serverTimestamp(),
        });

        return { ...current, unitsPledged: pledge.unitsPledged, status: pledgedUnits.status};
    });
}

export async function editApeal(id, patch) {
    if(!isFirebaseConfigured) {
        return updatedLocalAppeal(id, patch);
    }

    const ref = doc(db, 'appeals', id);
    await updatedDoc(ref, { ..patch,updatedAt: serverTimestamp()});

    const snapshot = await getDoc(ref);
    return toAppeal(snapshot);
}

export async function removeAppeal(id) {
    if (!isFirebaseConfigured) {
        deletedLocaAppeal(id);
        return;
    }

    await deletLocalAppeal(doc(db, 'appeals', id));
}