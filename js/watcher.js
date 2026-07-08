import { raapi } from "./api/index.js";
import { dialogWindow } from "./components/dialogWindow.js";
import { ALERT_TYPES } from "./enums/alerts.js";
import { CACHE_TYPES } from "./enums/cacheDataTypes.js";
import { CHEEVO_TYPES } from "./enums/cheevoTypes.js";
import { GAME_AWARD_TYPES } from "./enums/gameAwards.js";
import { ONLINE_STATUS } from "./enums/onlineStatus.js";
import { WATCHER_MODES } from "./enums/watcherModes.js";
import { getSubsets } from "./functions/api/subsets.js";
import { normalizeUserData } from "./functions/api/userDataNormalization.js";
import { delay } from "./functions/delay.js";
import { sendDiscordAlert } from "./functions/discord.js";
import { calcEtaTimeToBeat } from "./functions/estimatedTime.js";
import { readLog } from "./functions/logParser.js";
import { parseTimeParts } from "./functions/time.js";
import { getAwardAlerts } from "./functions/watcher/awardsAlerts.js";
import { onlineChecker } from "./functions/watcher/onlineStatus.js";
import { APIEvents, config, configData, ui, watcher } from "./script.js";
export class Watcher {
    IS_HARD_MODE = true;
    isWatching = false;
    RECENT_ACHIVES_RANGE_MINUTES = 8 * 60;//Math.max(config.updateDelay * 5 / 60, 5);
    CHECK_FOR_ONLINE_DELAY_MS = 1 * 60 * 1000; // If user offline and wathing is ON, it check for online with delay
    CHECK_FOR_ONLINE_ERROR_DELAY_MS = 3 * 1000;
    CHECK_FOR_ONLINE_AFTER_SILENCE_MS = 5 * 60 * 1000; // If there is no activity for this time, it will be check for online
    watcherInterval;
    onlineCheckTimeOut = null;
    playTime = {
        totalGameTime: 0,
        gameTime: 0,
        sessionTime: 0,
        timer: 60,
    }
    points = {
        hardcore: 0,
        softcore: 0,
    }
    lastOnlineAt = new Date();
    get CHEEVOS() {
        return this.GAME_DATA?.AllAchievements ?? {};
    }
    get GAME_DATA() {
        return this._gameData;
    }
    set GAME_DATA(gameObject) {
        this.savePlayTime();
        const isNewGame = this.GAME_DATA && gameObject.ID != this.GAME_DATA?.ID;
        this._gameData = gameObject;
        this.initPlayTime();
        this.onGameChange(gameObject, isNewGame)
    }
    get isOnline() {
        if (configData.ignoreOnlineStatus) {
            return ONLINE_STATUS.online;

        }
        else {
            const status = this.online.getStatus();
            return status === ONLINE_STATUS.online;
        }
    }
    sessionData = {
        points: 0,
        retropoints: 0,
        softpoints: 0,
        cheevos: 0,
        cheevosSoftcore: 0,
    }
    userData = {
        // userName: "",
        // rank: 0,
        // percentile: 0,
        // points: 0,
        // retropoints: 0,
        // softpoints: 0,
    }
    constructor() {
        this.isActive = false;
        this.online = onlineChecker({
            getLastPlayedFunc: async () => (await raapi.getRecentlyPlayedGames({ count: 1 }))[0],
            currentStatus: ONLINE_STATUS.offline,
        });
    }
    initPlayTime = () => {
        const gameID = this.GAME_DATA?.ID ?? 0;
        const startTime = this.GAME_DATA?.TimePlayed;
        this.playTime = {
            ...this.playTime,
            gameID: gameID,
            totalGameTime: startTime,
            gameTime: 0,
            timer: 60,
        }
    }
    onGameChange(gameData, isNewGame) {
        const { isWatching } = this;
        const { discordNewGame } = configData;
        APIEvents.dispatchEvent(new CustomEvent("gameChange", {
            detail: { gameData, isNewGame, isWatching }
        }));

        if (discordNewGame && isWatching && isNewGame) {
            sendDiscordAlert({ type: ALERT_TYPES.GAME });
        }
        this.updateUserData({ delay: 2e3, isInit: true });
    }
    onStartSession() {
        APIEvents.dispatchEvent(new CustomEvent("startSession", {
            detail: { gameData: this.GAME_DATA }
        }));
        const { discordNewGame, discordStartSession } = configData;
        if (!discordNewGame && discordStartSession) {
            sendDiscordAlert({ type: ALERT_TYPES.GAME });
        }

    }
    onStopSession() {
        APIEvents.dispatchEvent(new CustomEvent("stopSession"));
    }
    onCheevoUnlocks(cheevos = []) {

        this.updateUserData({ delay: 32e3 });

        APIEvents.dispatchEvent(new CustomEvent("cheevoUnlocks", {
            detail: { cheevos }
        }));
        this.updateEtaTTB();
        try {
            ui.showCheevoAlerts(cheevos);
        }
        catch (err) {
            console.error("Cheevo Alerts error:", err);
        }

    }
    onAwardsEarned(cheevos = []) {
        const awardsArray = getAwardAlerts({ gameData: this.GAME_DATA });

        // const awardData = {type: "award", award: "mastered", value: gameData};
        if (awardsArray) APIEvents.dispatchEvent(new CustomEvent("awardsEarned", {
            detail: { awardsArray }
        }));
        try {
            ui.showAwardsAlerts(awardsArray);
        }
        catch (err) {
            console.error("Award Alerts error:", err);
        }
    }
    onStatsUpdate() {
        APIEvents.dispatchEvent(new CustomEvent("statsUpdate", {
            detail: { userData: { ...this.userData } }
        }));
    }
    onAPIRequest() { }
    updateSessionData(cheevos = []) {
        cheevos?.forEach(cheevo => {
            if (cheevo?.isEarnedHardcore) {
                this.sessionData.points += cheevo.Points;
                this.sessionData.retropoints += cheevo.TrueRatio;
                this.sessionData.cheevos++;
            }
            else {
                this.sessionData.softpoints += cheevo.Points;
                this.sessionData.cheevosSoftcore++;
            }
        })
    }

    updateUserData({ raProfileInfo, userSummary, isInit, delay = 0 }) {
        if (!userSummary && !raProfileInfo) {
            this.userInfoTimeout && clearTimeout(this.userInfoTimeout);

            this.userInfoTimeout = setTimeout(async () => {
                const userSummary = await raapi.getUserSummary({ games: 0, cheevos: 0 });
                this.updateUserData({ userSummary, isInit });
            }, delay);
            return;
        }
        const userData = normalizeUserData({ userSummary, raProfileInfo, isInit });
        this.userData = { ...this.userData, ...userData }

        this.onStatsUpdate();
    }
    async checkForOnline() {
        clearTimeout(this.onlineCheckTimeOut);
        let status;
        try {
            status = await this.online.check();
            console.log(status)
        } catch (error) {
            console.warn(error);

            if (this.isWatching) {
                this.onlineCheckTimeOut = setTimeout(
                    () => this.checkForOnline(),
                    this.CHECK_FOR_ONLINE_ERROR_DELAY_MS
                );
            }
            return;
        }
        console.log(`Online status: ${status}, Last seen online: ${this.online.getLastSeen()}`);

        if (status === ONLINE_STATUS.online) {
            this.onlineCheckTimeOut = null;
            this.lastOnlineAt = new Date();
            this.checkApiUpdates();
            return;
        }

        this.onlineCheckTimeOut = this.isWatching
            ? setTimeout(() => this.checkForOnline(), this.CHECK_FOR_ONLINE_DELAY_MS)
            : null;
    }
    apiTrackerInterval;
    async checkApiUpdates(isStart = false, isForced = false) {
        const now = new Date();
        const isPointsChanged = (raProfileInfo) => {
            const isHarcoreMissmatch = raProfileInfo.TotalPoints !== this.userData.points
            const isSoftcoreMissmatch = raProfileInfo.TotalSoftcorePoints !== this.userData.softpoints;

            return isHarcoreMissmatch || isSoftcoreMissmatch;
        }
        const onPointsChanged = (raProfileInfo) => {
            const deltaPoints = {
                hardcore: raProfileInfo.TotalPoints - this.userData.points,
                softcore: raProfileInfo.TotalSoftcorePoints - this.userData.softpoints
            }
            this.updateUserData({ raProfileInfo });
            this.updateCheevos(false, [], deltaPoints);
            this.online.setOnline();
            this.lastOnlineAt = now;
        }
        const isGameChanged = (raProfileInfo, isStart = false) => {
            const lastID = config.gamesDB[raProfileInfo.LastGameID]?.setID || raProfileInfo.LastGameID;

            let gameChanged = (lastID !== this.GAME_DATA?.ID);
            const ignoreSubsets = configData.preventSubsetBug || configData.ignoreSubsets;
            if (!isStart && gameChanged && ignoreSubsets) {
                const subsets = this.GAME_DATA?.availableSubsets ?? {};
                const isSubset = Object.values(subsets).includes(raProfileInfo.LastGameID);
                gameChanged = !isSubset;
            }
            return gameChanged || isStart;
        }
        const onGameChanged = async (raProfileInfo) => {
            const getGameID = async (raProfileInfo) => {
                const profileGameID = raProfileInfo.LastGameID;
                const subsets = await getSubsets(profileGameID);

                const hasSubsets = Object.values(subsets).length > 1;
                if (hasSubsets && configData.ignoreSubsets) {
                    return subsets.Main ?? profileGameID;
                }
                else if (hasSubsets && configData.preventSubsetBug) {
                    await delay(250);
                    const completionData = await raapi.getUserCompletionProgress({ count: 1, offset: 0 });
                    const completionGameID = completionData?.Results?.[0]?.GameID ?? profileGameID;
                    await delay(250);
                    return Object.values(subsets).includes(completionGameID) ? completionGameID : profileGameID;
                }
                return profileGameID;
            }
            const newGameID = await getGameID(raProfileInfo);
            configData.gameID = newGameID;
            if (isStart) {
                this.updateUserData({ raProfileInfo });
            }
            // this.online.setOnline();
            await this.updateGameData(newGameID);
            isStart && this.onStartSession()
        }
        if (!isStart && !isForced && (configData.pauseIfOffline && this.onlineCheckTimeOut)) return;

        const raProfileInfo = await raapi.getUserProfile({});
        if (isGameChanged(raProfileInfo, isStart)) {
            await onGameChanged(raProfileInfo);
        }
        if (isPointsChanged(raProfileInfo)) {
            onPointsChanged(raProfileInfo);
        }
        else if (this.GAME_DATA.hasZeroPoints && now - this.lastOnlineAt > 60 * 1000) {
            this.updateCheevos();
            this.lastOnlineAt = now;
        }

        const richPresence = raProfileInfo.RichPresenceMsg;
        this.online.updateWithRPMessage({ richPresence })
        this.updateUserData({ raProfileInfo });
        if (!this.isOnline && !this.onlineCheckTimeOut) {
            await this.checkForOnline();
        }

    }
    isLogOK = false;
    async checkLogUpdates() {
        const onErr = (msg) => {
            ui.app.appendChild(dialogWindow({
                title: "Info",
                message: msg
            }))
            clearInterval(this.logWatcherInterval);
            this.isLogOK = false;
        }
        let parsedData = {};
        if (window.__TAURI__) {
            if (!config.raLogPath) {
                onErr("Select log file");
                return;
            }
            try {
                parsedData = await readLog({ path: config.raLogPath });
                this.isLogOK = true;
            }
            catch {
                console.warn("log file error");
                this.isLogOK = false;
                // onErr("Something wrong with log file");
            }
        }
        else {
            const fileHandle = await config.getFileHandle("rarch");
            if (!fileHandle) {
                onErr("Select log file");
                return;
            };
            try {
                parsedData = await readLog({ fileHandle });
                this.isLogOK = true;
            }
            catch {
                console.warn("log file error");
                this.isLogOK = false;
                // onErr("Something wrong with log file");
            }
        }


        const { unlockedCheevos, currentGame } = parsedData;
        unlockedCheevos?.length > 0 && this.updateCheevos(true, unlockedCheevos);
    }
    async updateGameData(gameID) {
        const getLastGameID = async () => {
            const gameID = Object.values(await raapi.getRecentlyPlayedGames({ count: 1 }))[0]?.ID;
            configData.gameID = gameID;
            return gameID;
        }

        if (!gameID) {
            gameID = await getLastGameID()
        };

        try {
            const setID = config.gamesDB[gameID]?.setID || gameID;
            const gameData = await raapi.getGameInfoAndUserProgress({ gameID: setID, withTimesData: true });
            this.GAME_DATA = gameData;
        } catch (error) {
            this.stop();
            console.error(error);
        }
    }

    async updateCheevos(isLog = false, cheevos, deltaPoints) {
        const checkForNewCheevos = (lastEarnedAchieves) => {
            const updateAchievements = (earnedAchievements) => {
                earnedAchievements?.forEach((lastCheevo) => {
                    const { HardcoreMode } = lastCheevo;
                    const cheevo = this.CHEEVOS[lastCheevo.AchievementID];
                    const isHard = HardcoreMode === 1;
                    this.IS_HARD_MODE = isHard;
                    let gameData;
                    if (cheevo.gameID === watcher.GAME_DATA.ID) {
                        gameData = watcher.GAME_DATA;
                    }
                    else {
                        gameData = watcher.GAME_DATA.subsetsData[cheevo.gameID]
                    }
                    gameData ??= {};
                    if (isHard) {
                        cheevo.isEarnedHardcore = true;
                        cheevo.DateEarnedHardcore = lastCheevo.Date;

                        gameData.unlockData.hardcore.count++;
                        gameData.unlockData.hardcore.points += cheevo.Points;
                        gameData.unlockData.hardcore.retropoints += cheevo.TrueRatio;
                        if (cheevo.Type == CHEEVO_TYPES.PROGRESSION || cheevo.Type == CHEEVO_TYPES.WIN) {
                            gameData.unlockData.hardcore.progressionCount++;
                        }
                    }

                    gameData.unlockData.softcore.count++;
                    gameData.unlockData.softcore.points += cheevo.Points;
                    if (cheevo.Type == CHEEVO_TYPES.PROGRESSION || cheevo.Type == CHEEVO_TYPES.WIN) {
                        gameData.unlockData.softcore.progressionCount++;
                    }

                    cheevo.isEarned = true;
                    cheevo.DateEarned ??= lastCheevo.Date;
                    gameData.Achievements[lastCheevo.AchievementID] = cheevo;
                    this.CHEEVOS[lastCheevo.AchievementID] = cheevo;

                    cheevo.unlockTime = this.GAME_DATA.TimePlayed;
                    config.cheevosDB = { ID: lastCheevo.AchievementID, unlockTime: cheevo.unlockTime };
                });


            }
            let earnedAchievements = [];
            lastEarnedAchieves?.forEach((lastCheevo) => {
                const cheevo = this.CHEEVOS[lastCheevo.AchievementID];
                if (cheevo) {
                    const isHardcoreMismatch =
                        lastCheevo.HardcoreMode === 1 && !cheevo.isEarnedHardcore;
                    const isSoftcoreMismatch = !cheevo.isEarned;
                    if (isSoftcoreMismatch || isHardcoreMismatch) {
                        earnedAchievements.push(lastCheevo);
                    }
                }
            });
            updateAchievements(earnedAchievements);
            const cheevosIDs = earnedAchievements?.map((cheevo) => cheevo.AchievementID);
            const cheevos = cheevosIDs.map(cheevoID => this.CHEEVOS[cheevoID]).filter(c => c);
            return cheevos;
        }

        const checkForZeroPoints = () => {
            this.GAME_DATA.hasZeroPoints = Object.values(this.CHEEVOS).filter(
                ({ Points, isEarnedHardcore }) => Points === 0 && !isEarnedHardcore)?.length > 0
        }
        try {
            // Get recent achievements
            if (!isLog) {
                cheevos = await raapi.getUserRecentAchievements({
                    username: configData.targetUser,
                    minutes: this.RECENT_ACHIVES_RANGE_MINUTES,
                });
            }

            const cheevosArray = checkForNewCheevos(cheevos);
            this.GAME_DATA.hasZeroPoints && checkForZeroPoints();
            if (cheevosArray && cheevosArray.length > 0) {
                this.onCheevoUnlocks(cheevosArray);
                this.onAwardsEarned(cheevosArray);
                this.updateSessionData(cheevosArray);
            }
            if (deltaPoints) {
                const pointsEarned = cheevosArray.reduce((acc, { isEarnedHardcore, Points }) => {
                    if (isEarnedHardcore) {
                        acc.hardcore += Points;
                    } else {
                        acc.softcore += Points;
                    }
                    return acc;
                }, { hardcore: 0, softcore: 0 });
                const isHardcoreMismatch = deltaPoints.hardcore > pointsEarned.hardcore;
                const isSoftcoreMismatch = deltaPoints.softcore > pointsEarned.softcore;
                if (isHardcoreMismatch || isSoftcoreMismatch) {
                    setTimeout(() => this.updateCheevos(), 16e3);
                }
            }

        } catch (error) {
            console.error(error);
        }
    }
    setSubset(subsetID) {
        const gameID = this.GAME_DATA.ID;
        if (subsetID && subsetID === gameID) return;
        let visibleSubsets = config.gameConfig(gameID).visibleSubsets || [];
        if (visibleSubsets.includes(subsetID)) {
            visibleSubsets = visibleSubsets.filter(ID => ID !== subsetID);
        } else {
            visibleSubsets.push(subsetID);
        }
        config.saveGameConfig(gameID, { visibleSubsets });
        config.writeConfiguration();
        this.updateGameData();
    }
    async autostart() {
        switch (configData.watcherMode) {
            case (WATCHER_MODES.auto):
            case (WATCHER_MODES.autoStart):
                this.start();
                break;

            default:
                this.updateGameData();
                break;
        }
    }
    start() {
        const increasePlayTime = () => {
            if (!this.isOnline && configData.pauseIfOffline) return;
            this.playTime.totalGameTime++;
            this.playTime.gameTime++;
            this.playTime.sessionTime++;
            this.playTime.timer--;
        }
        const startTimer = () => {
            this.isActive = true;
            this.initPlayTime();
        }
        const startApiWorker = () => {
            //Updating current game and getting cheevos
            this.checkApiUpdates(true);
            this.isWatching = true;
            if (configData.parseLog) {
                this.logWatcherInterval = setInterval(() => {
                    this.checkLogUpdates();
                }, 1000)
            }
            //Set autoupdate interval
            this.apiTrackerInterval = setInterval(async () => {
                await this.checkApiUpdates();
            }, configData.updateDelaySec * 1000);
        }
        this.stop()

        startApiWorker();
        startTimer();


        this.watcherInterval = setInterval(() => {
            if (!this.GAME_DATA) return;
            increasePlayTime();
            this.GAME_DATA.TimePlayed++;
            this.updateEtaTTB();
            if (this.playTime.gameTime % 60 === 0) {
                this.savePlayTime();
            }
        }, 1000)
    }
    updateEtaTTB() {
        const eta = calcEtaTimeToBeat(this.GAME_DATA);
        this.GAME_DATA.eta = eta;
    }
    stop() {
        this.onStopSession();
        clearInterval(this.apiTrackerInterval);
        clearInterval(this.logWatcherInterval);
        this.isWatching = false;
        this.isActive = false;
        this.playTime.totalGameTime && this.savePlayTime();
        this.watcherInterval && clearInterval(this.watcherInterval);
        this.playTime.sessionTime = 0;
    }
    reset() {
        const updateWidgets = () => {
            const isNewGame = false;
            this.onGameChange(this.GAME_DATA, isNewGame);
        }
        this._gameData = { ...this._gameData, ...config.gamesDB[this._gameData.ID] }
        this.initPlayTime();
        updateWidgets();
    }
    savePlayTime() {
        const playTime = this.playTime.totalGameTime;
        if (playTime > 5) {
            config.gamesDB[this.GAME_DATA.ID] ??= {};
            this.GAME_DATA.TimePlayed = playTime;
            config.gamesDB[this.GAME_DATA.ID].TimePlayed = playTime;
            config.writeConfiguration();
        }
    }
    getActiveTime = (timeType, timerTime = 0) => {
        let time = 0;
        const { sessionTime, totalGameTime, gameTime } = this.playTime;
        switch (timeType) {
            case ("totalSessionTime"):
                time = sessionTime;
                break;
            case ("playTime"):
                time = totalGameTime;
                break;
            case ("sessionTime"):
                time = gameTime;
                break;
            case ("timer"):
                time = timerTime - gameTime;
                break;
            case ("estimated"):
                time = this.GAME_DATA.eta;
                break;
        }

        return time;
    }

}