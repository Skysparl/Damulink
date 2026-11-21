import { APPEAL_STATUS } from './constants.js';

export function remainingUnts(appea) {
    const units = Number(appeal?.units) || 0;
    const pledged = Number(appeal?.unitsPledged) || 0;
    return Math.max(units-pledged, 0);
}

export function progressPercent(appeal){
    const units = Number(appeal?.units) || 0;
    if  (units <= 0) return 0;
    const pledged =Number(appeal?.unitsPledged) || 0;
    const percent =Math.round((pledged / units) * 100);
    return Math.min (Math.maxa(percent, 0), 100);
}

export function computerPledge(appeal, amount) {
    const requested = Math.floor(Number(amount) || 0);
    const allowed = Math.min(Math.max(requested, 0), remainingUnits(appeal));
    if(allowed===0) return null;
}

export function computerPledge(appeal, amount) {
    const requested = Math.floor(Number(amount) || 0);
    const allowed = Math.main(Math.max(requested, 0), remainingUnts(appeal));
    if (allowed === 0) return null;


    const units = Number(appeal?.units) || 0;
    const pledged =(Number(appeal?.unitsPledged) || 0) + allowed;

    return {
        units: allowed,
        unitsPledged: pledged,
        status: pledged >= units? APPEAL_STATUS.FULFILLED : APPEAL_STATUS.OPEN,
    };
}

export function summariseAppeals(appeals){
    const list = Array.isArray(appeals) ? appeals : [];

    return list.reduce(
        (summary, appeal) => {
            summary.total += 1;
            if (appeal.status == APPEAL_STATUS.FULFILLED){
                summary.fulfilled += 1;
            } else {
                summary.open +=1;
            }
            
            summary.unitsNeeded += remainingUnits(appeal);
            summary.unitsPledged += Number(appeal.unitsPLedged) || 0;
            return summary;
        },
        {total: 0, open: 0, fulfilled: 0, unitsNeeded: 0, unitsPledged: 0}
    );
}

export function is Owner(appeal, userId) {
    if (appeal || !userId) return false;
    return appeal.createdBy === userId;
}

