import { config } from "./main.js";

export class APIWorker {
  get _savedCompletionProgress() {
    return config._cfg?.apiWorker?.completionProgress ?? {}
  }
  get SAVED_COMPLETION_PROGRESS() {
    let completionProgress = this._savedCompletionProgress;
    if (!completionProgress?.Total || config._cfg.apiWorker.targetUser !== config.targetUser) {
      return this.updateCompletionProgress({ batchSize: 500 }).then(() => this._savedCompletionProgress)
    }
    else {
      return this.updateCompletionProgress({ batchSize: 20, savedArray: completionProgress.Results }).then(() => this._savedCompletionProgress)
    }
  }
  set SAVED_COMPLETION_PROGRESS(value) {
    value.Results = value.Results.map(game => {
      delete game.ConsoleName;
      delete game.NumLeaderboards;
      return game;
    })
    if (!config._cfg.apiWorker) {
      config._cfg.apiWorker = {};
    }
    config._cfg.apiWorker.targetUser = config.targetUser;
    config._cfg.apiWorker.completionProgress = value;
    config.writeConfiguration();
  }
  // Базовий URL API
  baseUrl = `https://retroachievements.org/API/`;

  // Список кінцевих точок API
  endpoints = {
    userProfile: "API_GetUserProfile.php",
    gameProgress: "API_GetGameInfoAndUserProgress.php",
    recentAchieves: "API_GetUserRecentAchievements.php",
    gameInfo: "API_GetGame.php",
    extendedGameInfo: "API_GetGameExtended.php",
    recentlyPlayedGames: "API_GetUserRecentlyPlayedGames.php",
    userAwards: "API_GetUserAwards.php",
    userGameRankAndScore: "API_GetUserGameRankAndScore.php",
    completionProgress: "API_GetUserCompletionProgress.php",
    gameList: "API_GetGameList.php",
    userSummary: "API_GetUserSummary.php",
    wantToPlay: "API_GetUserWantToPlayList.php",
  };

  // Генерує URL для запиту до API
  getUrl({ endpoint, targetUser, gameID, minutes, apiKey, userName, achievesCount, count, offset }) {
    // Створення нового об'єкту URL з вказаною кінцевою точкою та базовим URL
    let url = new URL(endpoint, this.baseUrl);

    // Параметри запиту
    let params = {
      y: apiKey || config.API_KEY,
      z: userName || config.USER_NAME,
      u: targetUser || config.targetUser,
      g: gameID || config.gameID,
      m: minutes || 2000,
      i: gameID || config.gameID,
      f: 1,
      h: 1,
      a: achievesCount || 5,
      c: count || 20,
      o: offset || 0,
    };

    // Додавання параметрів до URL
    url.search = new URLSearchParams(params);

    return url;
  }

  // Конструктор класу
  constructor() { }

  //Отримати прогрес завершення користувача
  getUserCompelitionProgress({ targetUser, count, offset }) {
    let url = this.getUrl({
      targetUser: targetUser || config.targetUser,
      count: count || 100,
      offset: offset || 0,
      endpoint: this.endpoints.completionProgress,
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
      targetUser: targetUser || config.targetUser,
      endpoint: this.endpoints.userAwards,
    });
    return fetch(url).then((resp) => resp.json()).then(awardsObj => {
      awardsObj.VisibleUserAwards = awardsObj.VisibleUserAwards.map(game => {
        if (!["Mastery/Completion", "Game Beaten"].includes(game.AwardType)) return null;
        game.award = game.AwardType == "Game Beaten" ?
          game.AwardDataExtra == "1" ? "beaten" : "beaten_softcore" :
          game.AwardDataExtra == "1" ? "mastered" : "completed";
        game.DateEarned = game.AwardedAt;

        game.ConsoleName == 'Events' && (game.award = "event");
        game.timeString = this.toLocalTimeString(game.AwardedAt);
        game = this.fixGameTitle(game);
        return game;
      }).filter(a => a);
      return awardsObj;
    });
  }
  // Отримання прогресу гри користувача
  getGameProgress({ targetUser, gameID }) {
    let url = this.getUrl({
      endpoint: this.endpoints.gameProgress,
      targetUser: targetUser || config.targetUser,
      gameID: gameID || config.gameID,
    });

    return fetch(url)
      .then((resp) => resp.json())
      .then(gameProgressObject => {
        gameProgressObject = {
          ...gameProgressObject,
          TotalRealPlayers: 0,
          TotalRetropoints: 0,
          points_total: 0,
          progressionRetroRatio: 0,
          beatenCount: Infinity,
          masteredCount: Infinity,
          earnedStats: {
            soft:
              { count: 0, points: 0, retropoints: 0 },
            hard:
              { count: 0, points: 0, retropoints: 0 }
          }
        }
        const progressionAchivs = { Count: 0, WinCount: 0, WinAwardedCount: 0, WinEarnedCount: 0 };
        const awards = {
          isBeaten: true,
          isBeatenSoftcore: true,
          isWinEarned: false,
          isWinEarnedSoftcore: false,
        }
        for (let achievement of Object.values(gameProgressObject.Achievements)) {
          gameProgressObject.TotalRetropoints += achievement.TrueRatio;
          gameProgressObject.points_total += achievement.Points;
          if (gameProgressObject.TotalRealPlayers < achievement.NumAwarded) {
            gameProgressObject.TotalRealPlayers = achievement.NumAwarded
          }

          if (achievement.DateEarned) {
            gameProgressObject.earnedStats.soft.count += 1;
            gameProgressObject.earnedStats.soft.points += achievement.Points;
            gameProgressObject.earnedStats.soft.retropoints += achievement.TrueRatio;
          }
          if (achievement.DateEarnedHardcore) {
            gameProgressObject.earnedStats.hard.count += 1;
            gameProgressObject.earnedStats.hard.points += achievement.Points;
            gameProgressObject.earnedStats.hard.retropoints += achievement.TrueRatio;
          }

          if (achievement.type === 'progression') {
            progressionAchivs.Count++;

            if (!achievement.DateEarned) {
              awards.isBeaten = false;
              awards.isBeatenSoftcore = false;
            }
            else if (!achievement.DateEarnedHardcore) {
              awards.isBeaten = false;
            }

            if (gameProgressObject.beatenCount > achievement.NumAwardedHardcore) {
              gameProgressObject.beatenCount = achievement.NumAwardedHardcore
            }
          }
          if (achievement.type === 'win_condition') {
            if (achievement.DateEarnedHardcore) {
              awards.isWinEarned = true;
              awards.isWinEarnedSoftcore = true;
            }
            else if (achievement.DateEarned) {
              awards.isWinEarnedSoftcore = true;
            }
            progressionAchivs.WinCount++;
            if (achievement.NumAwardedHardcore > progressionAchivs.WinAwardedCount) {
              progressionAchivs.WinAwardedCount = achievement.NumAwardedHardcore;
            }
            if (achievement.DateEarnedHardcore) {
              progressionAchivs.WinEarnedCount++;
            }
          }
          achievement.NumAwardedHardcore < gameProgressObject.masteredCount && (
            gameProgressObject.masteredCount = achievement.NumAwardedHardcore
          )

        }

        if (gameProgressObject.achievements_published == gameProgressObject.NumAwardedToUserHardcore) {
          gameProgressObject.award = 'mastered'
        }
        else if (awards.isBeaten && (awards.isWinEarned || progressionAchivs.WinCount == 0)) {
          gameProgressObject.award = 'beaten';
        }

        gameProgressObject = {
          ...gameProgressObject,
          winVariantCount: progressionAchivs.WinCount,
          winEarnedCount: progressionAchivs.WinEarnedCount,
          progressionSteps: progressionAchivs.WinCount > 0 ? progressionAchivs.Count + 1 : progressionAchivs.Count,
        }

        progressionAchivs.WinCount > 0 && (gameProgressObject.beatenCount = progressionAchivs.WinAwardedCount)

        gameProgressObject.beatenCount != Infinity &&
          (gameProgressObject.beatenRate = ~~(10000 * gameProgressObject.beatenCount / gameProgressObject.TotalRealPlayers) / 100);

        gameProgressObject.masteredCount != Infinity &&
          (gameProgressObject.masteryRate = ~~(10000 * gameProgressObject.masteredCount / gameProgressObject.TotalRealPlayers) / 100);

        const ratio = ~~(gameProgressObject.TotalRetropoints / gameProgressObject.points_total * 100) / 100;
        gameProgressObject.retroRatio = ratio;
        gameProgressObject.gameDifficulty = ratio > 9 ? "insane" :
          ratio > 7 ? "expert" :
            ratio > 5 ? "pro" :
              ratio > 3 ? "standard" :
                "easy";

        Object.values(gameProgressObject.Achievements)
          .map(cheevo =>
            this.fixAchievement(cheevo, gameProgressObject));

        gameProgressObject = this.fixGameTitle(gameProgressObject);
        return gameProgressObject;
      });
  }


  // Отримання інформації про гру
  getGameInfo({ gameID, extended }) {
    let url = this.getUrl({
      endpoint: this.endpoints[extended ? "extendedGameInfo" : "gameInfo"],
      gameID: gameID,
    });
    return fetch(url).then((resp) => resp.json());
  }


  getUserProfile({ userName }) {
    let url = this.getUrl({
      targetUser: userName,
      userName: userName,
      endpoint: this.endpoints.userProfile,
    });
    return fetch(url).then((resp) => resp.json());
  }

  getUserSummary({ targetUser, gamesCount = 3, achievesCount }) {
    let url = this.getUrl({
      targetUser: targetUser,
      gameID: gamesCount, //same parameter 'g' as for gameID
      achievesCount: achievesCount,
      endpoint: this.endpoints.userSummary,
    });
    return fetch(url)
      .then(resp => {
        let r = resp.json();
        return r;
      })
      .then(summary => {
        summary.RecentlyPlayed = summary.RecentlyPlayed.map(game => {
          game.LastPlayed = this.toLocalTimeString(game.LastPlayed);
          summary.Awarded[game.GameID] && (game = { ...game, ...summary.Awarded[game.GameID] })
          game = this.fixGameTitle(game);
          return game;
        });
        summary.RecentAchievements = Object.values(summary.RecentAchievements)
          .flatMap(RecentAchievements => Object.values(RecentAchievements)).map(achiv => {
            achiv.DateEarned = this.toLocalTimeString(achiv.DateAwarded);
            return achiv;
          });
        summary.isInGame = (new Date() - new Date(summary.RecentlyPlayed[0].LastPlayed)) < 5 * 60 * 1000;

        return summary;
      })
  }
  verifyUserIdent({ userName, apiKey }) {
    let url = this.getUrl({
      targetUser: userName,
      userName: userName,
      apiKey: apiKey,
      endpoint: this.endpoints.userProfile,
    });
    return fetch(url).then((resp) => resp.json());
  }
  getGameList({ userName, apiKey, systemID }) {
    let url = this.getUrl({
      userName: userName,
      apiKey: apiKey,
      gameID: systemID,
      endpoint: this.endpoints.gameList,
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
      this.SAVED_COMPLETION_PROGRESS = { Total: savedArray.length, Results: savedArray };
    }
    else {
      setTimeout(() => this.updateCompletionProgress({ savedArray: savedArray, completionProgress: completionProgress, batchSize: batchSize }), 100)
    }
  }

  fixAchievement(achievement, gameData) {
    const { BadgeName, DateEarned, DateEarnedHardcore, NumAwardedHardcore, NumAwarded, TrueRatio, ID } = achievement;
    const { NumDistinctPlayers, NumAwardedToUserHardcore, TotalRealPlayers } = gameData;

    const trend = 100 * (NumAwardedHardcore - NumAwardedToUserHardcore * 0.5) / ((NumDistinctPlayers + TotalRealPlayers) * 0.5 - NumAwardedToUserHardcore * 0.5);

    gameData.Achievements[ID] = {
      ...achievement,
      totalPlayers: NumDistinctPlayers,
      isEarned: !!DateEarned,
      isHardcoreEarned: !!DateEarnedHardcore,
      DateEarned: DateEarned && this.toLocalTimeString(DateEarned),
      DateEarnedHardcore: DateEarnedHardcore && this.toLocalTimeString(DateEarnedHardcore),
      prevSrc: `https://media.retroachievements.org/Badge/${BadgeName}.png`,
      rateEarned: ~~(100 * NumAwarded / NumDistinctPlayers) + "%",
      rateEarnedHardcore: ~~(100 * NumAwardedHardcore / NumDistinctPlayers) + "%",
      trend: trend,
      difficulty:
        trend < 1.5 && TrueRatio > 300 || TrueRatio >= 500 ? "hell" :
          trend <= 3 && TrueRatio > 100 || TrueRatio >= 300 ? "insane" :
            trend < 8 && TrueRatio > 24 ? "expert" :
              trend < 13 && TrueRatio > 10 ? "pro" :
                trend < 20 && TrueRatio > 5 || TrueRatio > 10 ? "standard" :
                  "easy",
    }
  }
  fixGameTitle(game) {
    const ignoredWords = [/\[SUBSET[^\[]*\]/gi, /~[^~]*~/g, ".HACK//",];
    let title = game.Title;

    const badges = ignoredWords.reduce((badges, word) => {
      const reg = new RegExp(word, "gi");
      const matches = game.Title?.match(reg);
      if (matches) {
        matches.forEach(match => {
          title = title.replace(match, "");
          let sufix = match;
          badges.push(sufix.replace(/[~\.\[\]]|subset -|\/\//gi, ""));
        })
      }
      return badges;
    }, []);
    game.badges = badges;
    game.FixedTitle = title?.trim();
    return game;
  }
  toLocalTimeString(UTCTime) {
    const UTCReg = /(\+00\:00$)|(z$)/gi;
    !UTCReg.test(UTCTime) && (UTCTime += "+00:00"); // Mark time as UTC Time 

    const date = new Date(UTCTime);
    const options = {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    };
    return date;
    return date.toLocaleDateString("uk-UA", options);
  }
  async getWantToPlayGamesList({ apiKey, targetUser, count, offset }) {
    let url = new URL(this.endpoints.wantToPlay, this.baseUrl);

    // Параметри запиту
    let params = {
      y: apiKey || config.API_KEY,
      u: targetUser || config.targetUser,
      o: offset || 0,
    };
    // Додавання параметрів до URL
    url.search = new URLSearchParams(params);

    const data = await fetch(url).then(resp => resp.json());

    return data.Results || [];
  }
}
