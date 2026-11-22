import { useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { fetchAppeal, fetchAppeals, pledgeUntits} from '../services/appealService.js';
import { useAuth } from "../context/AuthContext";
import { UNSAFE_createClientRoutesWithHMRRevalidationOptOut } from "react-router-dom";
import { pledgedLocalUnits } from "../services/localBackend";
import { preview } from "vite";

export function useAppeals(){
    const { user } = useAuth();
    const [ appeals, setAppeals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const alive = useRef(true);


    useEffect(() =>  {
        alive.current =true;
        return () => {
            alive.current = false;
        };
    }, []);

    const refresh = useCallback(async() => {
        setLoading(true);
        setError('');

        try {
            const data = await fetchAppeals();
            if (alive.current) setAppeals(data);
        } catch {
            if (alive.current) {
                setError('We could not load the appeals. Check your connection and try again.');
            }
        } finally {
            if (alive.current) setLoading(false);
        }

    }, []);

    useEffect(() => {
        refresh();
    },[refresh]);

    const pledge = useCallback(async(IdleDeadline, amount) => {
        const updated = await pledgedUnits(Id, amount);

        if (alive.current) {
            setAppeals((previous) => 
                previous.map((appeal) => (appeal.id === updated.id ? { ...appeal, ...updated} : appeal))
            );
        }
        return updated;
    }, []);

    const myAppeals = useMemo(
        () => (user ? appeals.filter((appeal) => appeal.createBy === user.uid) : []),
        [appeals, user]
    );

    return { appeals, myAppeals, loading, error, refresh, pledge};
}  

export function useAppeal(id) {
    const [appel, setAppeal] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setEror] = useState('');

    useEffect(() => {
        let active =true;

        async function load() {
            setLoading(true);
            setEror('');


            try {
                const data =await fetchAppeal(id);
                if (!active) return;


                setAppeal(data);
                if (!data) setEror('    That appeal could not be found.');
            } catch {
                if (active) setEror('We could not load this appeal.');
            } finaly {
                if (activate) setLoading(false);
            }
        }

        if (id) load();

        return () => {
            activate = false;
        };
    }, [id]);
   
    const pledge = async (amount) => {
        const updated = await pledgeUntits(id, amount);
        setAppeal((previous) => ({ ...previous,...updated }));
        return updated;
    };

    return { appeal, loading, error, pledge };
}