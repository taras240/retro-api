import { ONLINE_STATUS } from "../../enums/onlineStatus.js";

export function onlineChecker({ getLastPlayedFunc, currentStatus, options = {} } = {}) {
    const rpTimeout = typeof options.rpTimeout === 'number' ? options.rpTimeout : 3 * 60 * 1000; // default 5 minutes
    const lastPlayedTimeout = typeof options.lastPlayedTimeout === 'number' ? options.lastPlayedTimeout : 5 * 60 * 1000; // default 5 minutes

    const parseDate = (value) => {
        if (!value) return null;
        if (value instanceof Date) return value;
        let s = String(value).trim();
        // ensure UTC marker if missing
        if (!/(\+\d{2}:?\d{2}|Z)$/i.test(s)) s += "+00:00";
        const d = new Date(s);
        return isNaN(d) ? null : d;
    };

    let lastRPMessage = null;
    let lastRPMessageDate = null;
    let status = ONLINE_STATUS.offline;
    let lastCheckOnline = null;
    let lastSeenOnline = null;

    if (currentStatus === ONLINE_STATUS.online) {
        status = ONLINE_STATUS.online;
        lastCheckOnline = lastSeenOnline = new Date();
    }

    const check = async ({ lastPlayedGame, richPresence } = {}) => {
        status = ONLINE_STATUS.offline;
        const now = new Date();
        lastCheckOnline = now;

        // Rich presence takes priority: if a new RP message arrives, mark online
        if (richPresence) {
            updateWithRPMessage({ richPresence })
        }

        // If no RP or we still need confirmation, check last played timestamp
        if (lastPlayedGame || status === ONLINE_STATUS.offline) {
            if (!lastPlayedGame && typeof getLastPlayedFunc === 'function') {
                try {
                    lastPlayedGame = await getLastPlayedFunc();
                } catch (err) {
                    lastPlayedGame = null;
                }
            }

            const lastPlayedDate = lastPlayedGame && lastPlayedGame.LastPlayed ? parseDate(lastPlayedGame.LastPlayed) : null;
            if (lastPlayedDate && (now - lastPlayedDate) < lastPlayedTimeout) {
                status = ONLINE_STATUS.online;
                lastSeenOnline = now;
            }
        }

        return status;
    };
    const updateWithRPMessage = ({ richPresence }) => {
        const now = new Date();
        if (richPresence !== lastRPMessage) {
            setOnline({ richPresence });

        } else {
            // same RP message: consider stale if no recent "seen" update
            if (lastSeenOnline && (now - lastSeenOnline) > rpTimeout) {
                status = ONLINE_STATUS.offline;
            }
        }
        return status;
    }
    const setOnline = ({ richPresence } = {}) => {
        const now = new Date();
        lastRPMessage = richPresence || now.toString();
        lastRPMessageDate = now;
        status = ONLINE_STATUS.online;
        lastSeenOnline = now;
        lastCheckOnline = now;

    }
    const getStatus = () => status;
    const getLastCheck = () => lastCheckOnline;
    const getLastSeen = () => lastSeenOnline;
    const getLastRPMessage = () => ({ message: lastRPMessage, date: lastRPMessageDate });
    const reset = () => {
        lastRPMessage = null;
        lastRPMessageDate = null;
        status = ONLINE_STATUS.offline;
        lastCheckOnline = null;
        lastSeenOnline = null;
    };

    return { check, updateWithRPMessage, setOnline, getStatus, getLastCheck, getLastSeen, getLastRPMessage, reset };
}