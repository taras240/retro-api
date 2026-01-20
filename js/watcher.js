import { dialogWindow } from "./components/dialogWindow.js";
import { ALERT_TYPES } from "./enums/alerts.js";
import { CHEEVO_TYPES } from "./enums/cheevoTypes.js";
import { GAME_AWARD_TYPES } from "./enums/gameAwards.js";
import { delay } from "./functions/delay.js";
import { sendDiscordAlert } from "./functions/discord.js";
import { readLog } from "./functions/logParser.js";
import { formatTime } from "./functions/time.js";
import { apiWorker, config, configData, ui, watcher } from "./script.js";
export class Watcher {
    RP_DATA = { text: "", lastChange: "" };
    IS_ONLINE = true;
    IS_HARD_MODE = true;
    IS_WATCHING = false;
    RECENT_ACHIVES_RANGE_MINUTES = 10;//Math.max(config.updateDelay * 5 / 60, 5);
    CHECK_FOR_ONLINE_DELAY_MS = 1 * 60 * 1000; // If user offline and wathing is ON, it check for online with delay
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
        ui.gameChangeEvent(isNewGame);
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
    gameChangeEvent() {
        // this.savePlayTime();
        // this.initPlayTime();
    }
    updateSessionData(cheevosIDs = []) {
        cheevosIDs?.forEach(id => {
            const cheevo = this.CHEEVOS[id];
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
    updateUserData({ raProfileInfo, userSummary }) {
        if (raProfileInfo) {
            this.userData = {
                ...this.userData,
                userName: raProfileInfo.User,
                points: raProfileInfo.TotalPoints,
                retropoints: raProfileInfo.TotalTruePoints,
                softpoints: raProfileInfo.TotalSoftcorePoints,
                richPresence: raProfileInfo.RichPresenceMsg
            }
        }
        if (userSummary) {
            this.userData = {
                ...this.userData,
                userName: userSummary.User,
                richPresence: userSummary.RichPresenceMsg,
                points: userSummary.TotalPoints,
                retropoints: userSummary.TotalTruePoints,
                softpoints: userSummary.TotalSoftcorePoints,
                rank: userSummary.Rank,
                percentile: (100 * userSummary.Rank / userSummary.TotalRanked).toFixed(2),
            }
        }
    }
    async checkForOnline() {
        const parseDate = (UTCTime) => {
            const UTCReg = /(\+00\:00$)|(z$)/gi;
            !UTCReg.test(UTCTime) && (UTCTime += "+00:00"); // Mark time as UTC Time   
            const date = new Date(UTCTime);
            return date
        }
        const doOnline = () => {
            this.RP_DATA.lastChange = new Date();
            this.zeroCheckTime = new Date();
            !this.IS_ONLINE && (this.IS_ONLINE = true, this.checkApiUpdates())
            this.IS_ONLINE = true;

        }
        if (!configData.pauseIfOnline) {
            doOnline();
            return;
        }
        console.log("Checking for online...");
        const lastPlayedGame = (await apiWorker.getRecentlyPlayedGames({ count: 1 }))[0];
        const LastPlayedDate = parseDate(lastPlayedGame.LastPlayed);
        if (new Date() - LastPlayedDate < 5 * 60 * 1000) {
            doOnline();
        }
        else {
            this.IS_ONLINE = false;
            if (!this.IS_WATCHING) return;
            setTimeout(() => this.checkForOnline(), this.CHECK_FOR_ONLINE_DELAY_MS)
        }
    }
    apiTrackerInterval;
    async checkApiUpdates(isStart = false) {
        const isPointsChanged = (raProfileInfo) => {
            const isPointsChanged = raProfileInfo.TotalPoints != this.userData.points || raProfileInfo.TotalSoftcorePoints != this.userData.softpoints;

            return isPointsChanged;
        }

        if (!isStart && (!this.IS_ONLINE)) return;

        const raProfileInfo = await apiWorker.getProfileInfo({});
        //PrentGameID for Saved set update
        const isGameChanged = (raProfileInfo.LastGameID != this.GAME_DATA?.ID) && (raProfileInfo.LastGameID != this.GAME_DATA?.ParentGameID);
        if (isGameChanged || isStart) {
            configData.gameID = raProfileInfo.LastGameID;
            isStart && this.updateUserData({ raProfileInfo });

            await this.updateGameData(raProfileInfo.LastGameID);

            ui.showGameChangeAlerts(isStart);
        }
        if (isPointsChanged(raProfileInfo)) {
            this.updateUserData({ raProfileInfo });//!<--------------
            this.updateCheevos();
            this.RP_DATA.lastChange = new Date();
            this.zeroCheckTime = new Date();
        }
        else if (this.GAME_DATA.hasZeroPoints && new Date() - this.zeroCheckTime > 60 * 1000) {
            this.updateCheevos();
            this.zeroCheckTime = new Date();
        }

        const richPresence = raProfileInfo.RichPresenceMsg;
        ui.updateWidgetsRichPresence(richPresence);

        if (richPresence !== this.RP_DATA.text || !configData.pauseIfOnline) {
            this.RP_DATA.lastChange = new Date();
            this.RP_DATA.text = raProfileInfo.RichPresenceMsg;
            this.IS_ONLINE = true;
        }
        else if (!isStart && this.RP_DATA.lastChange && new Date() - this.RP_DATA.lastChange > this.CHECK_FOR_ONLINE_AFTER_SILENCE_MS) {
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
            this.stop;
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
                    const isHard = HardcoreMode == 1;
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
                        lastCheevo.HardcoreMode === 1 && !cheevo?.isEarnedHardcore;
                    const isSoftCoreMismatch = !cheevo.isEarned;
                    if (isSoftCoreMismatch || isHardcoreMismatch) {
                        earnedAchievements.push(lastCheevo);
                    }
                }
            });
            // console.log(earnedAchievements)
            updateAchievements(earnedAchievements);
            const cheevosIDs = earnedAchievements?.map((cheevo) => cheevo.AchievementID);
            return cheevosIDs;

        }
        const checkForNewAwards = () => {
            let awardsArray = [];
            const gameSets = [this.GAME_DATA, ...Object.values(this.GAME_DATA.subsetsData)];
            gameSets.forEach(gameSet => {
                if (gameSet.award !== GAME_AWARD_TYPES.MASTERED
                    && gameSet.unlockData.hardcore.count === gameSet.NumAchievements) {
                    gameSet.award = GAME_AWARD_TYPES.MASTERED;
                    awardsArray.push({
                        type: ALERT_TYPES.AWARD,
                        award: GAME_AWARD_TYPES.MASTERED,
                        value: gameSet
                    });
                }
                else if (!gameSet.award && gameSet.unlockData.softcore.count === gameSet.NumAchievements) {
                    gameSet.award = GAME_AWARD_TYPES.COMPLETED;
                    awardsArray.push({
                        type: ALERT_TYPES.AWARD,
                        award: GAME_AWARD_TYPES.COMPLETED,
                        value: gameSet
                    })
                }
                if (gameSet.progressionSteps > 0 &&
                    gameSet.progressionAward !== GAME_AWARD_TYPES.BEATEN &&
                    gameSet.unlockData.hardcore.progressionCount >= gameSet.progressionSteps) {
                    gameSet.progressionAward = GAME_AWARD_TYPES.BEATEN;
                    awardsArray.push({
                        type: ALERT_TYPES.AWARD,
                        award: GAME_AWARD_TYPES.BEATEN,
                        value: gameSet
                    })
                }
                else if (gameSet.progressionSteps > 0 &&
                    !gameSet.progressionAward &&
                    gameSet.unlockData.softcore.progressionCount >= gameSet.progressionSteps) {
                    gameSet.progressionAward = GAME_AWARD_TYPES.BEATEN_SOFTCORE;
                    awardsArray.push({
                        type: ALERT_TYPES.AWARD,
                        award: GAME_AWARD_TYPES.BEATEN_SOFTCORE,
                        value: gameSet
                    })
                }
            })
            const { TimePlayed } = watcher.GAME_DATA.TimePlayed;

            return awardsArray.map(a => a.value.TimePlayed = TimePlayed);
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

            const cheevosIDs = checkForNewCheevos(cheevos);
            const awardsArray = checkForNewAwards();

            this.GAME_DATA.hasZeroPoints && checkForZeroPoints();
            if (cheevosIDs && cheevosIDs.length > 0) {

                try {
                    this.updateSessionData(cheevosIDs);
                    ui.showCheevoAlerts(cheevosIDs);
                    ui.showAwardsAlerts(awardsArray);
                } catch (e) { }

                ui.updateWidgets({ earnedAchievementsIDs: cheevosIDs, isLog });
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
    start() {
        const increasePlayTime = () => {
            if (!this.IS_ONLINE) return;
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
            this.IS_WATCHING = true;
            if (configData.parseLog) {
                this.logWatcherInterval = setInterval(() => {
                    this.checkLogUpdates();
                }, 1000)
            }
            //Set autoupdate interval
            this.apiTrackerInterval = setInterval(() => {
                widgetsOnTickEvent();
                this.checkApiUpdates();
            }, configData.updateDelaySec * 1000);
        }
        const widgetsOnStartEvent = () => {
            ui.statusPanel.timeWatcher().start();
            ui.status.timeWatcher().start();
        }
        const widgetsOnTickEvent = () => {
            ui.statusPanel.blinkUpdate();
            ui.status.blinkUpdate();
        }
        this.stop()

        startApiWorker();
        startTimer();

        widgetsOnStartEvent();

        this.watcherInterval = setInterval(() => {
            increasePlayTime();
            this.playTime.gameTime % 60 === 0 && this.savePlayTime();
        }, 1000)
    }
    stop() {
        clearInterval(this.apiTrackerInterval);
        clearInterval(this.logWatcherInterval);
        this.IS_WATCHING = false;
        this.isActive = false;
        this.playTime.totalGameTime && this.savePlayTime();
        this.watcherInterval && clearInterval(this.watcherInterval);
        this.playTime.sessionTime = 0;
        ui.statusPanel.timeWatcher().stop();
        ui.status.timeWatcher().stop();

    }
    reset() {
        const updateWidgets = () => {
            const isNewGame = false;
            ui.statusPanel.gameChangeEvent(isNewGame);
            ui.status?.gameChangeEvent(isNewGame);
            ui.gameList?.gameChangeEvent();
            ui.gameCard?.gameChangeEvent(isNewGame);
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

        return formatTime(time, true);
    }
    onlineStatus = () => {
        const parseDate = (UTCTime) => {
            const UTCReg = /(\+00\:00$)|(z$)/gi;
            !UTCReg.test(UTCTime) && (UTCTime += "+00:00"); // Mark time as UTC Time   
            const date = new Date(UTCTime);
            return date
        }
        let lastRPMessage;
        let lastRPMessageDate;
        let status = "offline";
        let lastCheckOnline;
        let lastSeenOnline;
        //  const doOnline = () => {
        //             this.RP_DATA.lastChange = new Date();
        //             this.zeroCheckTime = new Date();
        //             !this.IS_ONLINE && (this.IS_ONLINE = true, this.checkApiUpdates())
        //             this.IS_ONLINE = true;

        //         }
        //         if (!configData.pauseIfOnline) {
        //             doOnline();
        //             return;
        //         }
        const check = async ({ lastPlayedGame, richPresence }) => {
            currentDate = new Date();
            if (richPresence) {
                if (richPresence !== lastRPMessage) {
                    isOnline = true;
                    status = "online";
                    lastRPMessageDate = currentDate;
                }
                else if (currentDate - lastSeenOnline > 5 * 60 * 100) {
                    isOnline = "false";

                }
            }
            lastPlayedGame = (await apiWorker.getRecentlyPlayedGames({ count: 1 }))?.[0] ?? {};
            const lastPlayedDate = parseDate(lastPlayedGame.LastPlayed);
            const currentDate = new Date();
            const isOnline = currentDate - lastPlayedDate < 5 * 60 * 1000;
            status = isOnline ? "online" : "offline";
            lastCheckOnline = currentDate;






            return status;


            // this.IS_ONLINE = false;
            // if (!this.IS_WATCHING) return;

        }
    }
}