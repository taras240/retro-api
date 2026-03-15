import { dialogWindow } from "./components/dialogWindow.js";
import { ALERT_TYPES } from "./enums/alerts.js";
import { CHEEVO_TYPES } from "./enums/cheevoTypes.js";
import { GAME_AWARD_TYPES } from "./enums/gameAwards.js";
import { ONLINE_STATUS } from "./enums/onlineStatus.js";
import { WATCHER_MODES } from "./enums/watcherModes.js";
import { normalizeUserData } from "./functions/api/userDataNormalization.js";
import { sendDiscordAlert } from "./functions/discord.js";
import { readLog } from "./functions/logParser.js";
import { parseTimeParts } from "./functions/time.js";
import { getAwardAlerts } from "./functions/watcher/awardsAlerts.js";
import { onlineChecker } from "./functions/watcher/onlineStatus.js";
import { APIEvents, apiWorker, config, configData, ui, watcher } from "./script.js";
export class Watcher {
    IS_HARD_MODE = true;
    isWatching = false;
    RECENT_ACHIVES_RANGE_MINUTES = 10;//Math.max(config.updateDelay * 5 / 60, 5);
    CHECK_FOR_ONLINE_DELAY_MS = 2 * 60 * 1000; // If user offline and wathing is ON, it check for online with delay
    CHECK_FOR_ONLINE_AFTER_SILENCE_MS = 3 * 60 * 1000; // If there is no activity for this time, it will be check for online
    watcherInterval;
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
    zeroCheckTime = new Date();
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
        const status = this.online.getStatus();
        return status === ONLINE_STATUS.online;
    }
    sessionData = {
        points: 0,
        retropoints: 0,
        softpoints: 0,
        cheevos: 0,
        cheevosSoftcore: 0,
    }
    userData = {
        userName: "",
        rank: 0,
        percentile: 0,
        points: 0,
        retropoints: 0,
        softpoints: 0,
    }
    constructor() {
        this.isActive = false;
        this.online = onlineChecker({
            getLastPlayedFunc: async () => (await apiWorker.getRecentlyPlayedGames({ count: 1 }))[0],
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
        this.updateUserData({ delay: 2e3 });
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
        const awardsArray = getAwardAlerts({ gameData: this.GAME_DATA });
        this.updateUserData({ delay: 32e3 });

        APIEvents.dispatchEvent(new CustomEvent("cheevoUnlocks", {
            detail: { cheevos }
        }));


        ui.showCheevoAlerts(cheevos);
        ui.showAwardsAlerts(awardsArray);
    }
    onStatsUpdate() {
        APIEvents.dispatchEvent(new CustomEvent("statsUpdate", {
            detail: { userData: this.userData }
        }));
    }
    onAPIRequest() {
        APIEvents.dispatchEvent(new CustomEvent("APIRequest"));
    }
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

    updateUserData({ raProfileInfo, userSummary, isLog, delay = 0 }) {
        if (!userSummary && !raProfileInfo) {
            this.userInfoTimeout && clearTimeout(this.userInfoTimeout);

            this.userInfoTimeout = setTimeout(async () => {
                const userSummary = await apiWorker.getUserSummary({ gamesCount: 0, achievesCount: 0 });
                this.updateUserData({ userSummary });
            }, delay);
            return;
        }
        const userData = normalizeUserData({ userSummary, raProfileInfo });
        this.userData = { ...this.userData, ...userData }

        this.onStatsUpdate();
    }
    async checkForOnline() {
        const now = new Date();
        const doOnline = () => {
            this.zeroCheckTime = now;
            this.checkApiUpdates();
            this.onlineCheckTimeOut && clearTimeout(this.onlineCheckTimeOut);
            this.onlineCheckTimeOut = null;

        }
        if (!configData.pauseIfOffline && !this.isOnline) {
            this.online.setOnline();
            doOnline();
            return;
        }

        const status = await this.online.check();
        console.log(`Online status: ${status}, Last seen online: ${this.online.getLastSeen()}`);
        if (status === ONLINE_STATUS.online) {
            doOnline();
        }
        else {
            if (!this.isWatching) return;
            this.onlineCheckTimeOut = setTimeout(() => this.checkForOnline(), this.CHECK_FOR_ONLINE_DELAY_MS);
        }
    }
    apiTrackerInterval;
    async checkApiUpdates(isStart = false) {
        const now = new Date();
        const isPointsChanged = (raProfileInfo) => {
            const isPointsChanged = raProfileInfo.TotalPoints != this.userData.points || raProfileInfo.TotalSoftcorePoints != this.userData.softpoints;

            return isPointsChanged;
        }
        const onPointsChanged = (raProfileInfo) => {
            this.updateUserData({ raProfileInfo });
            this.updateCheevos();
            this.online.setOnline();
            this.zeroCheckTime = now;
        }
        const isGameChanged = (raProfileInfo, isStart = false) => {
            let gameChanged = (raProfileInfo.LastGameID !== this.GAME_DATA?.ID);
            if (!isStart && gameChanged && configData.preventSubsetBug) {
                const subsets = this.GAME_DATA?.availableSubsets ?? {};
                const isSubset = Object.values(subsets).includes(raProfileInfo.LastGameID);
                gameChanged = !isSubset;
            }
            return gameChanged || isStart;
        }
        const onGameChanged = async (raProfileInfo) => {
            configData.gameID = raProfileInfo.LastGameID;
            if (isStart) {
                this.updateUserData({ raProfileInfo });
            }
            this.online.setOnline();
            await this.updateGameData(raProfileInfo.LastGameID);
            isStart && this.onStartSession()
        }
        if (!isStart && (configData.pauseIfOffline && this.onlineCheckTimeOut)) return;

        const raProfileInfo = await apiWorker.getProfileInfo({});

        if (isGameChanged(raProfileInfo, isStart)) {
            await onGameChanged(raProfileInfo);
        }
        if (isPointsChanged(raProfileInfo)) {
            onPointsChanged(raProfileInfo);
        }
        else if (this.GAME_DATA.hasZeroPoints && now - this.zeroCheckTime > 60 * 1000) {
            this.updateCheevos();
            this.zeroCheckTime = now;
        }

        const richPresence = raProfileInfo.RichPresenceMsg;
        this.online.updateWithRPMessage({ richPresence })

        if (!this.isOnline && configData.pauseIfOffline) {
            await this.checkForOnline();
        }
        else if (!configData.pauseIfOffline) {
            this.online.setOnline();
        }
        this.onAPIRequest();
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
        const fileHandle = await config.getFileHandle("rarch");
        // console.log(fileHandle);
        if (!fileHandle) {
            onErr("Select log file");
            return;
        };
        let parsedData = {};
        try {
            parsedData = await readLog(fileHandle);
            this.isLogOK = true;
            // console.log(parsedData);
        }
        catch {
            console.warn("log file error");
            this.isLogOK = false;
            // onErr("Something wrong with log file");
        }
        const { unlockedCheevos, currentGame } = parsedData;
        unlockedCheevos?.length > 0 && this.updateCheevos(true, unlockedCheevos);
        // console.log("parsed:", parsedData)
    }
    async updateGameData(gameID) {
        const getLastGameID = async () => {
            const gameID = Object.values(await apiWorker.getRecentlyPlayedGames({ count: 1 }))[0]?.ID;
            configData.gameID = gameID;
            return gameID;
        }

        if (!gameID) {
            gameID = await getLastGameID()
        };

        try {
            const gameData = await apiWorker.getGameInfoAndProgress({ gameID: gameID, withTimesData: true });
            this.GAME_DATA = gameData;
        } catch (error) {
            this.stop();
            console.error(error);
        }
    }

    async updateCheevos(isLog = false, cheevos) {
        // console.log(cheevos)
        const checkForNewCheevos = (lastEarnedAchieves) => {
            const updateAchievements = (earnedAchievements) => {
                earnedAchievements?.forEach((lastCheevo) => {
                    const { HardcoreMode, Date } = lastCheevo;
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
                        cheevo.DateEarnedHardcore = Date;

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
                    cheevo.DateEarned = cheevo.DateEarned ?? Date;
                    gameData.Achievements[lastCheevo.AchievementID] = cheevo;
                    this.CHEEVOS[lastCheevo.AchievementID] = cheevo;
                });


            }
            let earnedAchievements = [];
            lastEarnedAchieves?.forEach((lastCheevo) => {
                const cheevo = this.CHEEVOS[lastCheevo.AchievementID];
                if (cheevo) {
                    const isHardcoreMismatch =
                        lastCheevo.HardcoreMode === 1 && !cheevo.isEarnedHardcore;
                    const isSoftCoreMismatch = !cheevo.isEarned;
                    if (isSoftCoreMismatch || isHardcoreMismatch) {
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
                cheevos = await apiWorker.getRecentAchieves({
                    minutes: this.RECENT_ACHIVES_RANGE_MINUTES,
                });
            }

            const cheevosArray = checkForNewCheevos(cheevos);
            this.GAME_DATA.hasZeroPoints && checkForZeroPoints();
            if (cheevosArray && cheevosArray.length > 0) {
                this.onCheevoUnlocks(cheevosArray);
                this.updateSessionData(cheevosArray);
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
            if (!this.isOnline) return;
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
            increasePlayTime();
            this.playTime.gameTime % 60 === 0 && this.savePlayTime();
        }, 1000)
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
    resetCheevo(id) {
        ui.target?.refreshCheevo(id);
    }
    savePlayTime() {
        const playTime = this.playTime.totalGameTime;
        if (playTime > 5) {
            this.GAME_DATA.TimePlayed = playTime;
            config.gamesDB[this.GAME_DATA.ID] || (config.gamesDB[this.GAME_DATA.ID] = {});
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
        }

        return time;
    }

}