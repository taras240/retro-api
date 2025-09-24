import { dialogWindow } from "./components/dialogWindow.js";
import { alertTypes } from "./enums/alerts.js";
import { cheevoTypes } from "./enums/cheevoTypes.js";
import { delay } from "./functions/delay.js";
import { sendDiscordAlert } from "./functions/discord.js";
import { readLog } from "./functions/logParser.js";
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
        hard: 0,
        soft: 0,
    }
    zeroCheckTime = new Date();
    get CHEEVOS() {
        return this.GAME_DATA?.Achievements ?? {};
    }
    get GAME_DATA() {
        return this._gameData;
    }
    set GAME_DATA(gameObject) {
        const widgets = [
            "statusPanel",
            "status",
            "target",
            "notifications",
            "gameList"
        ]
        const updateWidgets = (isNewGame) => {
            // ui.statusPanel.gameChangeEvent(isNewGame);
            // ui.status?.gameChangeEvent(isNewGame);
            // ui.gameList?.gameChangeEvent();
            ui.achievementsBlock.forEach((widget) =>
                widget?.parseGameAchievements(this.GAME_DATA)
            );

            ui.gameCard?.updateGameCardInfo(this.GAME_DATA);

            // ui.target.gameChangeEvent();
            // ui.notifications?.gameChangeEvent(isNewGame);
            widgets.forEach(widgetName => ui[widgetName].gameChangeEvent(isNewGame))
            ui.note?.updateGame();



            ui.progression?.generateProgression();
        }
        this.savePlayTime();
        const isNewGame = this.GAME_DATA && gameObject.ID != this.GAME_DATA?.ID;
        this._gameData = gameObject;
        this.initPlayTime();
        ui.gameChangeEvent(isNewGame);
        // updateWidgets(isNewGame);
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
            const isPointsChanged = raProfileInfo.TotalPoints != this.points.hard || raProfileInfo.TotalSoftcorePoints != this.points.soft;

            return isPointsChanged;
        }

        const updatePoints = (raProfileInfo) => {
            this.points.hard = raProfileInfo.TotalPoints;
            this.points.soft = raProfileInfo.TotalSoftcorePoints;
        }


        if (!isStart && (!this.IS_ONLINE)) return;

        const raProfileInfo = await apiWorker.getProfileInfo({});

        if (raProfileInfo.LastGameID != this.GAME_DATA?.ID || isStart) {
            configData.gameID = raProfileInfo.LastGameID;
            isStart && updatePoints(raProfileInfo);

            await this.updateGameData(raProfileInfo.LastGameID);

            if (configData.discordNewGame ||
                (isStart && configData.discordStartSession)) {
                sendDiscordAlert({ type: alertTypes.GAME });
            }
        }
        if (isPointsChanged(raProfileInfo)) {
            updatePoints(raProfileInfo);
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
        const mergeCheevoData = (gameData, cheevoData, cheevoTimes) => {
            gameData.Achievements[cheevoData.ID] = ({
                ...cheevoData,
                timeToUnlock: cheevoTimes.MedianTimeToUnlockHardcore,
                timeToUnlockSoftcore: cheevoTimes.MedianTimeToUnlock,
            })
        }
        const mergeGameData = (gameData, gameTimes) => {
            if (!gameTimes || !gameTimes.ID) {
                return gameData;
            }
            gameData = {
                ...gameData,
                timeToBeat: gameTimes.MedianTimeToBeatHardcore,
                timeToMaster: gameTimes.MedianTimeToMaster,
            }
            Object.values(gameData.Achievements)
                .map(cheevo =>
                    mergeCheevoData(gameData, cheevo, gameTimes?.Achievements[cheevo.ID]));
            return gameData;
        }
        const getLastGameID = async () => {
            const gameID = Object.values(await apiWorker.getRecentlyPlayedGames({ count: 1 }))[0]?.ID;
            configData.gameID = gameID;
            return gameID;
        }

        if (!gameID) {
            gameID = await getLastGameID()
        };

        try {
            const gameData = await apiWorker.getGameInfoAndProgress({ gameID: gameID });
            //!Uncomment to load times
            await delay(150);
            let gameTimes;
            try {
                gameTimes = await apiWorker.getGameTimesInfo({ gameID: gameID });
            }
            catch (err) {
                console.log(err)
            }
            // debugger;

            this.GAME_DATA = mergeGameData(gameData, gameTimes);

        } catch (error) {
            //this.statusPanel.frontSide.watchButton.classList.add("error");
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
                    if (isHard) {
                        cheevo.isHardcoreEarned = true;
                        cheevo.DateEarnedHardcore = Date;
                        this.GAME_DATA.earnedStats.hard.count++;
                        this.GAME_DATA.earnedStats.hard.points += cheevo.Points;
                        this.GAME_DATA.earnedStats.hard.retropoints += cheevo.TrueRatio;
                        if (cheevo.Type == cheevoTypes.PROGRESSION || cheevo.Type == cheevoTypes.WIN) {
                            this.GAME_DATA.earnedStats.hard.progressionCount++;
                        }
                    }

                    this.GAME_DATA.earnedStats.soft.count++;
                    this.GAME_DATA.earnedStats.soft.points += cheevo.Points;
                    if (cheevo.Type == cheevoTypes.PROGRESSION || cheevo.Type == cheevoTypes.WIN) {
                        this.GAME_DATA.earnedStats.soft.progressionCount++;
                    }

                    cheevo.isEarned = true;
                    cheevo.DateEarned = cheevo.DateEarned ?? Date;
                    this.CHEEVOS[lastCheevo.AchievementID] = cheevo;
                });


            }
            let earnedAchievements = [];
            lastEarnedAchieves?.forEach((lastCheevo) => {
                const cheevo = this.CHEEVOS[lastCheevo.AchievementID];
                if (cheevo) {
                    const isHardcoreMismatch =
                        lastCheevo.HardcoreMode === 1 && !cheevo?.isHardcoreEarned;
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
            if (this.GAME_DATA.award !== 'mastered'
                && this.GAME_DATA.earnedStats.hard.count === this.GAME_DATA.NumAchievements) {
                this.GAME_DATA.award = 'mastered';
                awardsArray.push({
                    type: alertTypes.AWARD,
                    award: "mastered",
                    value: this.GAME_DATA
                });
            }
            else if (!this.GAME_DATA.award && this.GAME_DATA.earnedStats.soft.count === this.GAME_DATA.NumAchievements) {
                this.GAME_DATA.award = 'completed';
                awardsArray.push({
                    type: alertTypes.AWARD,
                    award: "completed",
                    value: this.GAME_DATA
                })
            }
            if (this.GAME_DATA.progressionSteps > 0 &&
                this.GAME_DATA.progressionAward !== 'beaten' &&
                this.GAME_DATA.earnedStats.hard.progressionCount >= this.GAME_DATA.progressionSteps) {
                this.GAME_DATA.progressionAward = 'beaten';
                awardsArray.push({
                    type: alertTypes.AWARD,
                    award: "beaten",
                    value: this.GAME_DATA
                })
            }
            else if (this.GAME_DATA.progressionSteps > 0 &&
                !this.GAME_DATA.progressionAward &&
                this.GAME_DATA.earnedStats.soft.progressionCount >= this.GAME_DATA.progressionSteps) {
                this.GAME_DATA.progressionAward = 'beaten-softcore';
                awardsArray.push({
                    type: alertTypes.AWARD,
                    award: "beaten-softcore",
                    value: this.GAME_DATA
                })
            }

            return awardsArray;
        }
        const checkForZeroPoints = () => {
            this.GAME_DATA.hasZeroPoints = Object.values(this.CHEEVOS).filter(
                ({ Points, isHardcoreEarned }) => Points === 0 && !isHardcoreEarned)?.length > 0
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
                    ui.showCheevoAlerts(cheevosIDs);
                    ui.showAwardsAlerts(awardsArray);
                } catch (e) { }

                ui.updateWidgets({ earnedAchievementsIDs: cheevosIDs, isLog });
            }

        } catch (error) {
            console.error(error);
        }
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
            ui.gameCard?.updateGameCardInfo(this.GAME_DATA);
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
}