import { CACHE_TYPES } from "./enums/cacheDataTypes.js";
import { GAME_AWARD_TYPES } from "./enums/gameAwards.js";
import { raEdpoints } from "./enums/RAEndpoints.js";
import { cacheWorker } from "./functions/api/cacheWorker.js";
import { getNormalizedAotW } from "./functions/api/cheevosNormalization.js";
import { mergeWithTimesData, normalizeGameData } from "./functions/api/gameDataNormalization.js";
import { getNormalizedTimes } from "./functions/api/gameTimesData.js";
import { delay } from "./functions/delay.js";
import { addReleaseBadges } from "./functions/releaseTypeParser.js";
import { formatDateTime } from "./functions/time.js";
import { config, configData, ui } from "./script.js";

const CACHE_FILE_NAME = "raApiCache";

export class APIWorker {

  cache = cacheWorker(CACHE_FILE_NAME);
  // Базовий URL API
  baseUrl = `https://retroachievements.org/API/`;
  _subsetsList;
  async getSubsets(gameID) {
    if (!this._subsetsList) {
      this._subsetsList = await fetch(`./json/games/all-subsets.json`).then(resp => resp.json());
    }
    const subsets = this._subsetsList[gameID] ?? { Main: gameID };
    return subsets;
  }

  getUrl({ endpoint, targetUser, gameID, minutes, apiKey, userName, achievesCount, count, offset, type, sort }) {
    if (ui.isTest) {
      this.baseUrl = `${window.location.origin}/json/apiTemplates/`;
      return this.getTestUrl(endpoint)
    }
    let url = new URL(endpoint, this.baseUrl);

    let params = {
      y: apiKey || config.API_KEY,
      z: userName || config.USER_NAME,
      u: targetUser || configData.targetUser || config.USER_NAME,
      g: gameID ?? configData.gameID,
      m: minutes || 2000,
      i: gameID || configData.gameID,
      f: 1,
      h: 1,
      a: achievesCount || 5,
      c: count || 20,
      o: offset || 0,
      t: type,
      sort: sort,
    };
    endpoint === raEdpoints.userProfile && delete params.i;
    // Додавання параметрів до URL
    url.search = new URLSearchParams(params);

    return url;
  }
  async completionProgress() {
    let completionProgress = this.cache.getData({ dataType: CACHE_TYPES.COMPLETION_PROGRESS });
    if (!completionProgress?.Total || (configData.targetUser || config.USER_NAME) !== completionProgress.UserName) {
      await this.updateCompletionProgress({ batchSize: 500 });
      completionProgress = await this.cache.getData({ dataType: CACHE_TYPES.COMPLETION_PROGRESS });
      return completionProgress;
    }
    else {
      const date = new Date();
      return (date - completionProgress.Date < 60 * 1000)
        ? completionProgress
        : this.updateCompletionProgress({ batchSize: 10, savedArray: completionProgress.Results })
          .then(async () => await this.cache.getData({ dataType: CACHE_TYPES.COMPLETION_PROGRESS }))
    }
  }
  getAotW() {
    let url = this.getUrl({ endpoint: raEdpoints.achievementOfTheWeek });
    return fetch(url)
      .then((resp) => resp.json())
      .then(AotwData => getNormalizedAotW({ AotwData, userName: configData.targetUser }));
  }
  async aotw() {
    function isActualDate(dateString) {
      const now = new Date();
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(now.getDate() - 7);

      const eventStartDate = new Date(dateString)
      return eventStartDate > oneWeekAgo;
    }
    let aotw = this.cache.getData({ dataType: CACHE_TYPES.AOTW });

    const isActual = aotw && isActualDate(aotw.StartAt);
    if (!isActual) {
      aotw = await this.getAotW();
      this.cache.push({ dataType: CACHE_TYPES.AOTW, data: aotw })
    }
    return aotw;
  }
  getUserGameRank({ targetUser, gameID }) {
    let url = this.getUrl({ endpoint: raEdpoints.userRankAndScore });
    return fetch(url).then((resp) => resp.json());
  }
  //Отримання інформації про профіль користувача
  getProfileInfo({ targetUser }) {
    let url = this.getUrl({
      targetUser: targetUser,
      endpoint: raEdpoints.userProfile,
    });
    return fetch(url).then((resp) => resp.json());
  }
  //Отримати прогрес завершення користувача
  getUserCompelitionProgress({ targetUser, count, offset }) {
    let url = this.getUrl({
      targetUser: targetUser || configData.targetUser,
      count: count || 100,
      offset: offset || 0,
      endpoint: raEdpoints.completionProgress,
    });
    return fetch(url).then((resp) => resp.json()).then(arr => {
      arr.Results = arr.Results.map((game) => {
        game.ID = game.GameID;
        game.NumAchievements = game.MaxPossible;
        delete game.MaxPossible;
        delete game.NumLeaderboards;

        return game;
      })
      return arr;
    }
    )
  }
  //Отримати нагороди користувача
  getUserAwards({ targetUser }) {
    let url = this.getUrl({
      targetUser: targetUser || configData.targetUser,
      endpoint: raEdpoints.userAwards,
    });
    return fetch(url).then((resp) => resp.json()).then(awardsObj => {
      awardsObj.VisibleUserAwards = awardsObj.VisibleUserAwards.map(game => ({
        ...game,
        DateEarnedHardcore: game.AwardedAt,
        timeString: formatDateTime(game.AwardedAt),
        awardedDate: new Date(game.AwardedAt),
        award:
          game.ConsoleName == 'Events' ? "event" :
            game.AwardType == "Game Beaten" ?
              game.AwardDataExtra == "1" ? GAME_AWARD_TYPES.BEATEN : GAME_AWARD_TYPES.BEATEN_SOFTCORE :
              game.AwardDataExtra == "1" ? GAME_AWARD_TYPES.MASTERED : GAME_AWARD_TYPES.COMPLETED,

      }))
      return awardsObj;
    });
  }
  // Отримання прогресу гри користувача
  async getGameInfoAndProgress({ targetUser, gameID, withTimesData = false, isSubset = false }) {

    let url = this.getUrl({
      endpoint: raEdpoints.gameInfoAndProgress,
      targetUser: targetUser || configData.targetUser,
      gameID: gameID,
    });

    const dataResp = await fetch(url);
    let gameData = await dataResp.json();
    this.gameData = JSON.parse(JSON.stringify(gameData));
    if (withTimesData) {
      try {
        await delay(200);
        const timesData = await this.getGameTimesInfo({ gameID: gameID, targetUser });
        gameData = mergeWithTimesData(gameData, timesData);
      }
      catch (e) { console.log(e) }

    }
    normalizeGameData(gameData, config.gamesDB, config.cheevosDB);
    if (!isSubset) {
      gameData.availableSubsets = await this.getSubsets(gameData.ID);
      await this.addSubsetsData(gameData);
    }
    return gameData;
  }
  async addSubsetsData(parentGameData) {
    if (ui.isTest) {

      return
    };
    parentGameData.AllAchievements ??= { ...parentGameData.Achievements };
    parentGameData.subsetsData ??= {};

    if (!parentGameData.visibleSubsets?.length) return parentGameData;

    for (let subsetID of parentGameData.visibleSubsets) {
      await delay(250);
      const subsetData = await this.getGameInfoAndProgress({
        gameID: subsetID,
        isSubset: true,
        withTimesData: false,
      });
      parentGameData.subsetsData[subsetID] = subsetData;
      Object.assign(parentGameData.AllAchievements, subsetData.Achievements);
    }
    // parentGameData.visibleSubsets.push(parentGameData.ID);
  }
  //Повертає час який потрібен для здобуття досягнень та нагород
  async getGameTimesInfo({ gameID, targetUser }) {
    const url = this.getUrl({
      endpoint: raEdpoints.gameTimesInfo,
      targetUser: targetUser || configData.targetUser,
      gameID: gameID || configData.gameID,
    });
    let cachedData = this.cache.getData({ dataType: CACHE_TYPES.GAME_TIMES, ID: gameID });
    if (!cachedData) {
      const gameTimes = await fetch(url).then(resp => resp.json());

      cachedData = getNormalizedTimes(gameTimes);
      this.cache.push({
        dataType: CACHE_TYPES.GAME_TIMES,
        data: cachedData
      });
    }
    return cachedData;
  }
  async getGameInfoWithTimes({ gameID, targetUser }) {
    const gameData = await this.getGameInfoAndProgress({ gameID: gameID });
    //!Uncomment to load times
    await delay(250);
    let gameTimes;
    try {
      gameTimes = await apiWorker.getGameTimesInfo({ gameID: gameID });
    }
    catch (err) {
      console.log(err)
    }
    // debugger;

    this.GAME_DATA = mergeGameData(gameData, gameTimes);
  }
  // Отримання недавно отриманих досягнень користувача
  getRecentAchieves({ targetUser, minutes }) {
    let url = this.getUrl({
      endpoint: raEdpoints.recentAchieves,
      targetUser: targetUser,
      minutes: minutes,
    });
    return fetch(url)
      .then((resp) => resp.json())
      .then(cheevos => cheevos.map(cheevo => {
        cheevo.localDate = formatDateTime(cheevo.Date);
        return cheevo;
      }));
  }

  // Отримання інформації про гру
  getGameInfo({ gameID, extended }) {
    let url = this.getUrl({
      endpoint: this.endpoints[extended ? "extendedGameInfo" : "gameInfo"],
      gameID: gameID,
    });
    return fetch(url).then((resp) => resp.json());
  }

  getWantToPlayGamesList({ targetUser, count, offset }) {
    let url = this.getUrl({
      endpoint: raEdpoints.wantToPlay,
      targetUser: targetUser,
      count: count || 50,
      offset: offset || 0
    });
    return fetch(url)
      .then((resp) => resp.json())
      .then(resp => (resp.Results || []));
  }
  getWantToPlayGames({ targetUser, count, offset }) {
    let url = this.getUrl({
      endpoint: raEdpoints.wantToPlay,
      targetUser: targetUser,
      count: count || 50,
      offset: offset || 0
    });
    return fetch(url)
      .then((resp) => resp.json())
      .then(resp => (resp.Results || []).map(g => g.ID));
  }
  getRecentlyPlayedGames({ targetUser, count }) {
    let url = this.getUrl({
      endpoint: raEdpoints.recentlyPlayedGames,
      targetUser: targetUser,
      count: count || 50,
    });

    return fetch(url).then((resp) => resp.json()).then(arr => arr.map((game, index) => {
      return {
        ...game,
        ...addReleaseBadges(game),
        ID: game.GameID,
        Points: game.ScoreAchievedHardcore + "/" + game.PossibleScore,
        NumAchievements: game.NumAchievedHardcore + "/" + game.AchievementsTotal,
        DateEarnedHardcore: game.LastPlayed //for sort methods
      }
    }));
  }

  getUserProfile({ userName }) {
    let url = this.getUrl({
      targetUser: userName,
      userName: userName,
      endpoint: raEdpoints.userProfile,
    });
    return fetch(url).then((resp) => resp.json());
  }

  getUserSummary({ targetUser, gamesCount, achievesCount }) {
    let url = this.getUrl({
      targetUser: targetUser,
      gameID: gamesCount ?? 3, //same parameter 'g' as for gameID
      achievesCount: achievesCount,
      endpoint: raEdpoints.userSummary,
    });
    return fetch(url)
      .then(resp => {
        let r = resp.json();
        return r;
      })
      .then(summary => {
        summary.RecentlyPlayed = summary.RecentlyPlayed.map(game => {
          game.LastPlayed = formatDateTime(game.LastPlayed);
          summary.Awarded[game.GameID] && (game = { ...game, ...summary.Awarded[game.GameID] })
          return game;
        });
        summary.RecentAchievements = Object.values(summary.RecentAchievements)
          .flatMap(RecentAchievements => Object.values(RecentAchievements)).map(achiv => {
            achiv.DateAwarded = formatDateTime(achiv.DateAwarded);
            return achiv;
          });
        summary.RecentlyPlayed.length && (summary.isInGame = (new Date() - new Date(summary.RecentlyPlayed[0].LastPlayed)) < 5 * 60 * 1000);

        return summary;
      })
  }
  getComments({ targetUser, id, offset = 0, count = 200, type = 2, sort = "-submitted" }) {
    let url = this.getUrl({
      targetUser: targetUser,
      gameID: id, //same parameter 'i' as for gameID
      type: type,//1 - game, 2 - cheevo, 3 - user
      offset: offset,
      count: count,
      sort: sort,
      endpoint: raEdpoints.comments,
    });
    return fetch(url).then((resp) => resp.json()).then(resp => resp.Results?.filter(c => c.User !== "Server") || []);
  }
  verifyUserIdent({ userName, apiKey }) {
    let url = this.getUrl({
      targetUser: userName,
      userName: userName,
      apiKey: apiKey,
      endpoint: raEdpoints.userProfile,
    });
    return fetch(url).then((resp) => resp.json());
  }
  getGameList({ userName, apiKey, systemID }) {
    let url = this.getUrl({
      userName: userName,
      apiKey: apiKey,
      gameID: systemID,
      endpoint: raEdpoints.gameList,
    });
    return fetch(url).then((resp) => resp.json());
  }
  getTestUrl(endpoint) {

    endpoint = endpoint.replace(".php", ".json");
    return this.baseUrl + endpoint;
  }

  async updateCompletionProgress({ savedArray = [], completionProgress = [], batchSize = 500 }) {
    let completionOffset = await this.getUserCompelitionProgress({ count: batchSize, offset: completionProgress.length });
    completionProgress = [...completionProgress, ...completionOffset.Results];
    let lastGame = completionProgress.at(-1);

    let savedIndex = savedArray.findIndex(game => {
      return game.hasOwnProperty("GameID") && game.GameID === lastGame.GameID &&
        game.MostRecentAwardedDate === lastGame.MostRecentAwardedDate;
    });
    if (savedIndex >= 0 || completionProgress.length === completionOffset.Total) {
      const completionIDs = completionProgress.map(game => game.GameID);
      savedArray = savedArray.filter(game => !completionIDs.includes(game.GameID))
      savedArray = [...completionProgress, ...savedArray];
      this.cache.push({
        dataType: CACHE_TYPES.COMPLETION_PROGRESS,
        data: {
          Date: new Date(),
          Total: savedArray.length,
          Results: savedArray,
          UserName: configData.targetUser || config.USER_NAME
        }
      });
      // this.SAVED_COMPLETION_PROGRESS = { Date: new Date(), Total: savedArray.length, Results: savedArray };
    }
    else {
      setTimeout(() => this.updateCompletionProgress({ savedArray: savedArray, completionProgress: completionProgress, batchSize: batchSize }), 100)
    }
  }
}

