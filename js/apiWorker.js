import { cacheDataTypes } from "./enums/cacheDataTypes.js";
import { cheevoGenres } from "./enums/cheevoGenres.js";
import { cheevoTypes } from "./enums/cheevoTypes.js";
import { gameAwardTypes } from "./enums/gameAwards.js";
import { raEdpoints } from "./enums/RAEndpoints.js";
import { RAtoRAWG } from "./enums/RAWGPlatforms.js";
import { generateCheevosDisplayOrder } from "./functions/displayOrder.js";
import { parseCheevosGenres } from "./functions/genreParser.js";
import { parseCheevoLevels } from "./functions/levelParser.js";
import { cheevoImageUrl } from "./functions/raLinks.js";
import { parseReleaseVersion } from "./functions/releaseTypeParser.js";
import { formatDateTime } from "./functions/time.js";
import { config, configData, ui } from "./script.js";

const CACHE_FILE_NAME = "raApiCache";
export class APIWorker {
  initializeCache = async () => {
    let cache = await JSON.parse(localStorage.getItem(CACHE_FILE_NAME)) || {
      [cacheDataTypes.GAME_TIMES]: {}
    };
    this._cache = cache;
  }
  clearCache() {
    this._cache = {
      [cacheDataTypes.GAME_TIMES]: {}
    }
    localStorage.setItem(CACHE_FILE_NAME, JSON.stringify(this._cache));
  }
  getCachedData = async ({ dataType, ID }) => {
    if (!this._cache) {
      await this.initializeCache();
    }
    switch (dataType) {
      case cacheDataTypes.GAME_TIMES:
        return this._cache[cacheDataTypes.GAME_TIMES] ?
          this._cache[cacheDataTypes.GAME_TIMES][ID] : undefined;

      case cacheDataTypes.COMPLETION_PROGRESS:
        return this._cache[cacheDataTypes.COMPLETION_PROGRESS] || {};

      case cacheDataTypes.AOTW:
        return this._cache[cacheDataTypes.AOTW]

    }
  }
  pushToCache = async ({ dataType, data }) => {
    if (!this._cache) {
      await this.initializeCache()
    }
    switch (dataType) {
      case cacheDataTypes.GAME_TIMES:
        if (!this._cache[cacheDataTypes.GAME_TIMES]) {
          this._cache[cacheDataTypes.GAME_TIMES] = {};
        }
        this._cache[cacheDataTypes.GAME_TIMES][data.ID] = data;
        break;
      case cacheDataTypes.COMPLETION_PROGRESS:
        this._cache[cacheDataTypes.COMPLETION_PROGRESS] = data;
        break;
      case cacheDataTypes.AOTW:
        this._cache[cacheDataTypes.AOTW] = data;
        break;
    }
    localStorage.setItem(CACHE_FILE_NAME, JSON.stringify(this._cache));
  }


  gamesTimes = {
  };
  // Базовий URL API
  baseUrl = `https://retroachievements.org/API/`;

  getUrl({ endpoint, targetUser, gameID, minutes, apiKey, userName, achievesCount, count, offset, type, sort }) {
    if (ui.isTest) {
      this.baseUrl = `${window.location.origin}/json/apiTemplates/`;
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
    let completionProgress = await this.getCachedData({ dataType: cacheDataTypes.COMPLETION_PROGRESS });
    if (!completionProgress?.Total || (configData.targetUser || config.USER_NAME) !== completionProgress.UserName) {
      await this.updateCompletionProgress({ batchSize: 500 });
      completionProgress = await this.getCachedData({ dataType: cacheDataTypes.COMPLETION_PROGRESS });
      return completionProgress;
    }
    else {
      const date = new Date();
      return (date - completionProgress.Date < 60 * 1000)
        ? completionProgress
        : this.updateCompletionProgress({ batchSize: 10, savedArray: completionProgress.Results })
          .then(async () => await this.getCachedData({ dataType: cacheDataTypes.COMPLETION_PROGRESS }))
    }
  }
  getAotW() {
    let url = this.getUrl({ endpoint: raEdpoints.achievementOfTheWeek });
    return fetch(url)
      .then((resp) => resp.json())
      .then(aotwOrig => {
        const userEarned = aotwOrig.Unlocks
          .find(user => user.User.toLowerCase() === configData.targetUser?.toLowerCase()?.trim())
        return {
          ...aotwOrig.Achievement,
          ConsoleName: aotwOrig.Console.Title,
          ForumTopic: aotwOrig.ForumTopic.ID,
          GameID: aotwOrig.Game.ID,
          GameTitle: aotwOrig.Game.Title,
          StartAt: aotwOrig.StartAt,
          TotalPlayers: aotwOrig.TotalPlayers,
          UnlocksHardcoreCount: aotwOrig.UnlocksHardcoreCount,
          isEarned: !!userEarned,
          isEarnedHardcore: !!userEarned && !!userEarned.HardcoreMode
        }
      });
  }
  async aotw() {
    function isActualDate(dateString) {
      const now = new Date();
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(now.getDate() - 7);

      const eventStartDate = new Date(dateString)
      return eventStartDate > oneWeekAgo;
    }
    let aotw = await this.getCachedData({ dataType: cacheDataTypes.AOTW });

    const isActual = aotw && isActualDate(aotw.StartAt);
    console.log(isActual)
    if (!isActual) {
      aotw = await this.getAotW();
      this.pushToCache({ dataType: cacheDataTypes.AOTW, data: aotw })
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
        award:
          game.ConsoleName == 'Events' ? "event" :
            game.AwardType == "Game Beaten" ?
              game.AwardDataExtra == "1" ? "beaten" : "beaten_softcore" :
              game.AwardDataExtra == "1" ? "mastered" : "completed",

      }))
      return awardsObj;
    });
  }
  // Отримання прогресу гри користувача
  getGameInfoAndProgress({ targetUser, gameID }) {
    let url = this.getUrl({
      endpoint: raEdpoints.gameInfoAndProgress,
      targetUser: targetUser || configData.targetUser,
      gameID: gameID || configData.gameID,
    });
    const defGameProps = {
      TotalRealPlayers: 0,
      TotalRetropoints: 0,
      totalPoints: 0,
      progressionRetroRatio: 0,
      beatenCount: Infinity,
      masteredCount: Infinity,
      beatenSoftCount: Infinity,
      completedCount: Infinity,
      earnedStats: {
        soft:
          { count: 0, points: 0, retropoints: 0, progressionCount: 0 },
        hard:
          { count: 0, points: 0, retropoints: 0, progressionCount: 0 }
      },
      hasZeroPoints: false,
    }
    return fetch(url)
      .then((resp) => resp.json())
      .then(gameObject => {
        gameObject = {
          ...gameObject,
          ...parseReleaseVersion(gameObject),
          ...defGameProps,
        }
        const progressionAchivs = { Count: 0, WinCount: 0, WinAwardedCount: 0, WinAwardedSoftCount: 0, WinEarnedCount: 0 };
        const awards = {
          isBeaten: true,
          isBeatenSoftcore: true,
          isWinEarned: false,
          isWinEarnedSoftcore: false,
        }
        for (let cheevo of Object.values(gameObject.Achievements)) {
          // cheevo.type = cheevo.Type; //* FIX API Update
          //get TotalRetropoints
          gameObject.TotalRetropoints += cheevo.TrueRatio;
          gameObject.totalPoints += cheevo.Points;
          //get TotalRealplayers
          if (gameObject.TotalRealPlayers < cheevo.NumAwarded) {
            gameObject.TotalRealPlayers = cheevo.NumAwarded
          }
          if (cheevo.Points === 0 && !cheevo.DateEarnedHardcore) {
            gameObject.hasZeroPoints = true;
          }
          // Earned STATS
          if (cheevo.DateEarned) {
            gameObject.earnedStats.soft.count += 1;
            gameObject.earnedStats.soft.points += cheevo.Points;
            gameObject.earnedStats.soft.retropoints += cheevo.TrueRatio;
            if (cheevo.Type === cheevoTypes.PROGRESSION || cheevo.Type === cheevoTypes.WIN) { gameObject.earnedStats.soft.progressionCount++; }
          }
          if (cheevo.DateEarnedHardcore) {
            gameObject.earnedStats.hard.count += 1;
            gameObject.earnedStats.hard.points += cheevo.Points;
            gameObject.earnedStats.hard.retropoints += cheevo.TrueRatio;
            if (cheevo.Type === cheevoTypes.PROGRESSION || cheevo.Type === cheevoTypes.WIN) { gameObject.earnedStats.hard.progressionCount++; }
          }

          //Progression stats
          if (cheevo.Type === cheevoTypes.PROGRESSION) {
            progressionAchivs.Count++;

            !cheevo.DateEarned && (awards.isBeatenSoftcore = false);
            !cheevo.DateEarnedHardcore && (awards.isBeaten = false);

            gameObject.beatenCount = Math.min(cheevo.NumAwardedHardcore, gameObject.beatenCount);
            gameObject.beatenSoftCount = Math.min(cheevo.NumAwarded, gameObject.beatenSoftCount);

          }
          else if (cheevo.Type === cheevoTypes.WIN) {
            progressionAchivs.WinCount++;
            progressionAchivs.WinAwardedCount = Math.max(cheevo.NumAwardedHardcore, progressionAchivs.WinAwardedCount);
            progressionAchivs.WinAwardedSoftCount = Math.max(cheevo.NumAwarded, progressionAchivs.WinAwardedSoftCount);

            cheevo.DateEarnedHardcore && progressionAchivs.WinEarnedCount++;

            awards.isWinEarned = !!cheevo.DateEarnedHardcore;
            awards.isWinEarnedSoftcore = !!cheevo.DateEarned;
          }
          gameObject.masteredCount = Math.min(cheevo.NumAwardedHardcore, gameObject.masteredCount);
          gameObject.completedCount = Math.min(cheevo.NumAwarded, gameObject.completedCount);

        }
        gameObject = {
          ...gameObject,
          winVariantCount: progressionAchivs.WinCount,
          winEarnedCount: progressionAchivs.WinEarnedCount,
          progressionSteps: progressionAchivs.WinCount > 0 ? progressionAchivs.Count + 1 : progressionAchivs.Count,
        }

        gameObject.award =
          (gameObject.NumAchievements === gameObject.NumAwardedToUserHardcore) ? gameAwardTypes.MASTERED :
            (gameObject.NumAchievements === gameObject.NumAwardedToUser) ? gameAwardTypes.COMPLETED :
              gameObject.award;


        gameObject.progressionSteps && (gameObject.progressionAward =
          (awards.isBeaten && gameObject.earnedStats.hard.progressionCount >= gameObject.progressionSteps) ? gameAwardTypes.BEATEN :
            (awards.isBeatenSoftcore && gameObject.earnedStats.soft.progressionCount >= gameObject.progressionSteps) ? gameAwardTypes.BEATEN_SOFTCORE :
              gameObject.progressionAward);



        progressionAchivs.WinCount > 0 && (
          gameObject.beatenCount = progressionAchivs.WinAwardedCount,
          gameObject.beatenSoftCount = progressionAchivs.WinAwardedSoftCount
        )

        gameObject.beatenCount != Infinity &&
          (gameObject.beatenRate = ~~(10000 * gameObject.beatenCount / gameObject.TotalRealPlayers) / 100);
        gameObject.beatenSoftCount != Infinity &&
          (gameObject.beatenSoftRate = ~~(10000 * gameObject.beatenSoftCount / gameObject.TotalRealPlayers) / 100);

        gameObject.masteredCount != Infinity &&
          (gameObject.masteryRate = ~~(10000 * gameObject.masteredCount / gameObject.TotalRealPlayers) / 100);
        gameObject.completedCount != Infinity &&
          (gameObject.completedRate = ~~(10000 * gameObject.completedCount / gameObject.TotalRealPlayers) / 100);

        const ratio = ~~(gameObject.TotalRetropoints / gameObject.totalPoints * 100) / 100;
        gameObject.retroRatio = ratio;

        this.gameData = JSON.parse(JSON.stringify(gameObject));

        parseCheevoLevels(gameObject);
        parseCheevosGenres(gameObject);
        generateCheevosDisplayOrder(gameObject);
        //add missed fields for ACHIEVEMENTS
        Object.values(gameObject.Achievements)
          .map(cheevo =>
            this.fixAchievement(cheevo, gameObject));
        gameObject = { ...gameObject, TimePlayed: 0, ...config.gamesDB[gameObject?.ID] };

        const cheevos = Object.values(gameObject.Achievements);
        gameObject.masteryDifficulty = Math.max(...cheevos.map(c => c.difficulty));
        if (gameObject.progressionSteps > 0) {
          gameObject.gameDifficulty = gameObject.winVariantCount === 0 ?
            Math.max(...cheevos.filter(c => c.Type === cheevoTypes.PROGRESSION).map(c => c.difficulty)) :
            Math.min(...cheevos.filter(c => c.Type === cheevoTypes.WIN).map(c => c.difficulty))
        };
        return gameObject;
      });
  }
  //Повертає час який потрібен для здобуття досягнень та нагород
  async getGameTimesInfo({ gameID, targetUser }) {
    const url = this.getUrl({
      endpoint: raEdpoints.gameTimesInfo,
      targetUser: targetUser || configData.targetUser,
      gameID: gameID || configData.gameID,
    });
    let cachedData = await this.getCachedData({ dataType: cacheDataTypes.GAME_TIMES, ID: gameID });
    if (!cachedData) {
      const gameTimes = await fetch(url).then(resp => resp.json());
      const Achievements = gameTimes.Achievements
        .reduce((obj, { ID, MedianTimeToUnlock, MedianTimeToUnlockHardcore }) => {
          obj[ID] = { ID, MedianTimeToUnlock, MedianTimeToUnlockHardcore };
          return obj
        }, {});
      const { ID, MedianTimeToBeat, MedianTimeToBeatHardcore, MedianTimeToMaster, MedianTimeToComplete } = gameTimes;
      cachedData = {
        ID,
        MedianTimeToBeat,
        MedianTimeToBeatHardcore,
        MedianTimeToMaster,
        MedianTimeToComplete,
        Achievements
      }
      this.pushToCache({
        dataType: cacheDataTypes.GAME_TIMES,
        data: cachedData
      });
    }
    return cachedData;
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
      .then(achivs => achivs.map(achiv => {
        achiv.localDate = formatDateTime(achiv.Date);
        return achiv;
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
        ...parseReleaseVersion(game),
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
  doTestEndpoint({ endpoint }) {
    let url = this.getUrl({
      endpoint: endpoint,
    });
    return fetch(url).then((resp) => resp.json()).then(obj => console.log(obj));
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
      this.pushToCache({
        dataType: cacheDataTypes.COMPLETION_PROGRESS,
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

  fixAchievement(achievement, gameData) {
    const { BadgeName, DateEarned, DateEarnedHardcore, NumAwardedHardcore, NumAwarded, TrueRatio, ID, Points } = achievement;
    const { NumDistinctPlayers, NumAwardedToUserHardcore, TotalRealPlayers } = gameData;

    const trend = 100 * (NumAwardedHardcore - NumAwardedToUserHardcore * 0.5) / ((NumDistinctPlayers + TotalRealPlayers) * 0.5 - NumAwardedToUserHardcore * 0.5);
    const earnedRateHardcore = (100 * NumAwardedHardcore / NumDistinctPlayers);
    gameData.Achievements[ID] = {
      ...achievement,
      totalPlayers: NumDistinctPlayers,
      isEarned: !!DateEarned,
      isHardcoreEarned: !!DateEarnedHardcore,
      prevSrc: cheevoImageUrl(BadgeName),
      rateEarned: ~~(100 * NumAwarded / NumDistinctPlayers) + "%",
      rateEarnedHardcore: earnedRateHardcore < 10 ? `${earnedRateHardcore.toFixed(1)}%` : `${earnedRateHardcore.toFixed(0)}%`,
      trend: trend,
      retroRatio: (TrueRatio / Math.max(1, Points)).toFixed(2),
      difficulty:
        trend <= 0.2 && TrueRatio > 1000 && NumAwardedHardcore < 100 ? 11 :
          trend <= 1 && TrueRatio > 300 || TrueRatio >= 500 ? 10 :
            trend <= 1.5 && TrueRatio > 300 || TrueRatio >= 500 ? 9 :
              trend <= 3 && TrueRatio > 100 || TrueRatio >= 300 ? 8 :
                trend < 8 && TrueRatio > 24 ? 7 :
                  trend < 13 && TrueRatio > 10 ? 6 :
                    trend < 20 && TrueRatio > 5 || TrueRatio > 10 ? 5 :
                      4,
      ...config.cheevosDB[ID], // Load edited props
    }
  }
  // parseBadges(game) {
  //   const ignoredWords = [/\[SUBSET[^\[]*\]/gi, /~[^~]*~/g, ".HACK//",];
  //   let title = game.Title;

  //   const badges = ignoredWords.reduce((badges, word) => {
  //     const reg = new RegExp(word, "gi");
  //     const matches = game.Title.match(reg);
  //     if (matches) {
  //       matches.forEach(match => {
  //         title = title.replace(match, "");
  //         let badge = match;
  //         badges.push(badge.replace(/[~\.\[\]]|subset -|\/\//gi, ""));
  //       })
  //     }
  //     return badges;
  //   }, []);
  //   game.badges = badges;
  //   game.FixedTitle = title.trim();
  //   return { badges: badges, FixedTitle: title.trim() };
  // }





  async rawgSearchGame({ gameTitle, platformID }) {
    gameTitle = gameTitle.split("|")[0];
    const RAWGPlatform = RAtoRAWG[platformID];
    if (!RAWGPlatform) {
      return false;
    }

    const baseUrl = `https://api.rawg.io/api/`;
    const endpoint = "games";
    let url = new URL(endpoint, baseUrl);

    let params = {
      search: gameTitle,
      platforms: RAWGPlatform,
      key: "179353905bcb491d975b1fc03b3c8bd6",
    };
    url.search = new URLSearchParams(params);

    try {
      const response = await fetch(url);
      if (!response.ok) {
        console.log(`HTTP error! status: ${response.status}`);
        return false;
      }
      const data = await response.json();
      const res = data.results ? data.results[0] : null;

      const testTitle = gameTitle.replace(/[^a-z0-9]/gi, " ").trim();
      const testRes = res?.name.replace(/[^a-z0-9]/gi, " ").trim() ?? "";
      if (!res || testTitle !== testRes) {
        console.log(`Game not found for title: ${gameTitle} on platform: ${platformID}`);
        return false;
      }

      const keys = [
        "name", "playtime", "released", "background_image", "rating",
        "ratings", "added", "metacritic", "score", "community_rating", "genres"
      ];

      return Object.fromEntries(
        Object.entries(res).filter(([key]) => keys.includes(key))
      );
    } catch (err) {
      console.log(`Fetch error: ${err.message}`);
      return false;
    }
  }

}

