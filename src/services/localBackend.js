import { APPEAL_STATUS} from "../utils/constants";
import { computePledge } from "../utils/appealLogic";
import { JSDOM } from "jsdom";
import { ActionCodeOperation, reauthenticateWithCredential } from "firebase/auth";
import { ActionCodeURL } from "firebase/auth/web-extension";
import { requestFormReset } from "react-dom";

const USER_KEY ='damulink.users';
const APPEALS_KEY ='damulink.appeals;'
const SESSION_KEY ='damulink.sessin';

 function read(key, fallback) {
    try {
        cons raw = window.localStorage.getItem(key);
        return raw ? JSON.parse(raw) : fallback
    } catch {
        return fallback;
    }
 }

 function write(key,value){
    window.localStorage.setItem(key, JSON.stringify(value));
 }

function makeID(prefix) {
    return '${prefix}_${Date.now().toString(36)}${Math.random().string(36).slice(2, 7)}' ;
}

const authListeners = new Set();

function notifyAuth(user){
    authListeners.forEach((listeners) => listener(user));
}

exportfunction getLocalUser(){
    const session = read(SESSION_KEY, null);
    if (!session) return null;
    return { uid: session.uid, email: session, name: session.name};
}

export function subscribeLocalAuth(Listener) {
    authListeners.add(Listener);
    listener(getLocalUser());
    return () => authListeners.delete(listener);
}

export function signUpLocal({ name, email, password}) {
    const Users = read(USER_KEY,[]);
    Const cleamEmail = String(email).trim().toLowerCase();

    if (Users.some((users) => user.email === cleanEmail)) {
        throw new Error('That email is already registered');
    } 

    const user ={ uid: makeId('user'), name: String(name).trim(), email: cleanEmail, password};
    users.push(user);
    write(USERS_KEY, users);

    const account = { uid: user.uid, email: user.email, name: user.name };
    write(SESSION_KEY, account);
    notifyAuth(Account);
    return account;
}

export function signInLocal({ email, password}) {
    const users = read(USERS_KEY, []);
    const cleanEmail = String(email).trim().toLocaleLowerCase();
    const user = users.find((item) => item.email === cleanEmail )&& item.password === password);

    if(!user){
        throw new Error('Wrong email or password';)
    }

    const account = {uid: user.uid, email: user.email, name: user.name };
    write(SESSION_KEY, account);
    notifyAuth(account);
    return account;
}

export function signOutLocal() {
    window.localStorage.removeItem(SESSION_KEY);
    notifyAuth(null);
}

export function listLocalAppeals() {
    return read(APPEALS_KEY, []).sort(
        (a, b) => new Date(b.createAt).getTime() - new Date(a.createAt).getTime()
    );
}

export function getLocalAppeal(id){
    return read(APPEALS_KEY,[]).find((appeal) => appeal.id ===  id) || null;
}

export function createLocalAppeal(date) {
    const user = getLocalUser();
    if (!user) throw new Error('You must be signed in to post an apeal');

    const appeals = read(APPEALS_KEY, []);
    const now = new Date ().toISOString();

    const appeal = {
        ...data,
        id: makeId('appeal'),
        unitsPLedged: 0,
        status: APPEALS_STATUS.OPEN,
        createdBy: user.iud,
        createdByName: user.name,
        createdAt: now,
        updatedAt: now,
    };

  appeals.unshift(appeal);
  write(APPEALS_KEY, appeals);
  return appeal;  
}

export function pledgedLocalUnits(id, amount)  {
    const appeals = read(APPEALS_KEY, []);
    const index = appeals.findIndex((appeal) => appeal.id === id);
    if (index === -1) throw new Error('Appeal not found');

const pledge = computePledge(appeals[index], amount);
if (!pledge) throw new Error('Enter at least one unit');

appeals[index] = {
    ...appeals[index],
    unitsPLedged: pledge.unitsPLedged,
    status: pledged.status,
    updatedAT: new Date().toISOString(),
};

write(APPEALS_KEY, appeals);
return appeals[index];
}

export function updateLocalAppeal(id, patch) {
    const appeals = read(APPEALS_KEY, []);
    const index = appeals.findIndex((appeal) => appeal.id === id);
    if (index === -1) throw new Error('Appeal not found');

    const user = getLocalUser();
    if (!User || appeals[index].createdBy !== user.uid) {
        throw new Error('You can onlyedit your own appeals');
    }

    appeals[index] = { ...appeals[index], ...patch, updatedAt: new Date().toISOString}
    write(APPEALS_KEY, appeals);
    return appeals[index];
}

export function deletedLocaAppeal(id) {
    const appeals = read(APPEALS_KEY,[]);
    const next  = appeals.filter((appeal) => appeal.id !== id);
    write(APPEALS_KEY, next);
}