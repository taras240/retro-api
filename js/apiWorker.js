"use strict";
class APIWorker {
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
    console.log(value)
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
  getUserGameRank({ targetUser, gameID }) {
    let url = this.getUrl({ endpoint: this.endpoints.userRankAndScore });
    return fetch(url).then((resp) => resp.json());
  }
  // // Отримання інформації про профіль користувача
  getProfileInfo({ targetUser }) {
    let url = this.getUrl({
      targetUser: targetUser,
      endpoint: this.endpoints.userProfile,
    });
    return fetch(url).then((resp) => resp.json());
  }
  //Отримати прогрес завершення користувача
  getUserCompelitionProgress({ targetUser, count, offset }) {
    let url = this.getUrl({
      targetUser: targetUser || config.targetUser,
      count: count || 100,
      offset: offset || 0,
      endpoint: this.endpoints.completionProgress,
    });
    return fetch(url).then((resp) => resp.json()).then(arr => {
      arr.Results = arr.Results.map((game, index) => {
        game.ID = game.GameID;
        game.NumAchievements = game.MaxPossible;
        delete game.MaxPossible;
        // game.NumAwardedHardcore = game.NumEarnedHardcore;
        // delete game.NumEarnedHardcore;
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
        game.award = game.AwardType == "Game Beaten" ?
          game.AwardDataExtra == "1" ? "beaten" : "beaten_softcore" :
          game.AwardDataExtra == "1" ? "mastered" : "completed";
        game.DateEarnedHardcore = game.AwardedAt;
        return game;
      })
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

    return fetch(url).then((resp) => resp.json()).then(gameProgressObject => {
      gameProgressObject.TotalRetropoints = 0;
      gameProgressObject.progressionRetroRatio = 0;
      gameProgressObject.masteredCount = Infinity;
      let lowerWinConditionPoints = { ratio: Infinity, Points: 0, TrueRatio: 0 };
      let progressionAchivsPoints = { Points: 0, TrueRatio: 0 };
      Object.values(gameProgressObject.Achievements)
        .forEach(achievement => {
          gameProgressObject.TotalRetropoints += achievement.TrueRatio;
          (!gameProgressObject.TotalRealPlayers ||
            gameProgressObject.TotalRealPlayers < achievement.NumAwarded) && (
              gameProgressObject.TotalRealPlayers = achievement.NumAwarded
            )
          achievement.type == 'progression' || achievement.type == 'win_condition' && (
            progressionAchivsPoints.Points += achievement.Points,
            progressionAchivsPoints.TrueRatio += achievement.TrueRatio
          );
          achievement.NumAwardedHardcore < gameProgressObject.masteredCount && (
            gameProgressObject.masteredCount = achievement.NumAwardedHardcore
          )
          // if (achievement.type == 'win_condition') {
          //   const ratio = achievement.TrueRatio / achievement.Points;
          //   ratio < lowerWinConditionPoints && (
          //     lowerWinConditionPoints = { ratio: ratio, TrueRatio: achievement.TrueRatio, Points: achievement.Points }
          //   )
          // }
        })
      lowerWinConditionPoints.ratio != Infinity && (
        progressionAchivsPoints.Points += lowerWinConditionPoints.Points,
        progressionAchivsPoints.TrueRatio += lowerWinConditionPoints.TrueRatio
      );
      gameProgressObject.masteredCount != Infinity &&
        (gameProgressObject.masteryRate = ~~(10000 * gameProgressObject.masteredCount / gameProgressObject.TotalRealPlayers) / 100);
      gameProgressObject.progressionRetroRatio = ~~(100 * progressionAchivsPoints.TrueRatio / progressionAchivsPoints.Points) / 100;

      const ratio = ~~(gameProgressObject.TotalRetropoints / gameProgressObject.points_total * 100) / 100;
      gameProgressObject.retroRatio = ratio;
      gameProgressObject.gameDifficulty = ratio > 9 ? "insane" :
        ratio > 7 ? "expert" :
          ratio > 5 ? "pro" :
            ratio > 3 ? "standard" :
              "easy"
      Object.getOwnPropertyNames(gameProgressObject.Achievements)
        .forEach(id =>
          this.fixAchievement(gameProgressObject.Achievements[id], gameProgressObject));
      gameProgressObject = this.fixGameTitle(gameProgressObject);
      return gameProgressObject;
    });
  }

  // Отримання недавно отриманих досягнень користувача
  getRecentAchieves({ targetUser, minutes }) {
    let url = this.getUrl({
      endpoint: this.endpoints.recentAchieves,
      targetUser: targetUser,
      minutes: minutes,
    });
    return fetch(url).then((resp) => resp.json());
  }

  // Отримання інформації про гру
  getGameInfo({ gameID, extended }) {
    let url = this.getUrl({
      endpoint: this.endpoints[extended ? "extendedGameInfo" : "gameInfo"],
      gameID: gameID,
    });
    return fetch(url).then((resp) => resp.json());
  }

  getRecentlyPlayedGames({ targetUser, count }) {
    let url = this.getUrl({
      endpoint: this.endpoints.recentlyPlayedGames,
      targetUser: targetUser,
      count: count || 50,
    });

    return fetch(url).then((resp) => resp.json()).then(arr => arr.map((game, index) => {
      game.ID = game.GameID;
      game.Points = game.ScoreAchievedHardcore + "/" + game.PossibleScore;
      game.NumAchievements = game.NumAchievedHardcore + "/" + game.AchievementsTotal;
      game.NumLeaderboards = "";
      game.DateEarnedHardcore = game.LastPlayed;
      return this.fixGameTitle(game);
    }));;
  }
  fixGameTitle(game) {
    const ignoredWords = [/\[SUBSET[^\[]*\]/gi, /~[^~]*~/g, ".HACK//",];
    let title = game.Title;

    const sufixes = ignoredWords.reduce((sufixes, word) => {
      const reg = new RegExp(word, "gi");
      const matches = game.Title.match(reg);
      if (matches) {
        matches.forEach(match => {
          title = title.replace(match, "");
          let sufix = match;
          sufixes.push(sufix.replace(/[~\.\[\]]|subset -|\/\//gi, ""));
        })
      }
      return sufixes;
    }, []);
    game.sufixes = sufixes;
    game.FixedTitle = title.trim();
    return game;
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
          return game;
        });
        summary.RecentAchievements = Object.values(summary.RecentAchievements)
          .flatMap(RecentAchievements => Object.values(RecentAchievements)).map(achiv => {
            achiv.DateAwarded = this.toLocalTimeString(achiv.DateAwarded);
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

  fixAchievement(achievement, achievements) {
    const { BadgeName, DateEarned, DateEarnedHardcore, NumAwardedHardcore, NumAwarded, TrueRatio } = achievement;
    const { NumDistinctPlayers, NumAwardedToUserHardcore, TotalRealPlayers } = achievements;
    //Додаєм кількість гравців
    achievement.totalPlayers = NumDistinctPlayers;

    // Визначаєм, чи отримано досягнення та чи є воно хардкорним
    achievement.isEarned = !!DateEarned;
    achievement.isHardcoreEarned = !!DateEarnedHardcore;

    achievement.isEarned && (achievement.DateEarned = this.toLocalTimeString(DateEarned));
    achievement.isEarned && (achievement.DateEarnedHardcore = this.toLocalTimeString(DateEarnedHardcore));

    // Додаєм адресу зображення для досягнення
    achievement.prevSrc = `https://media.retroachievements.org/Badge/${BadgeName}.png`;

    achievement.rateEarned = ~~(100 * NumAwarded / NumDistinctPlayers) + "%";
    achievement.rateEarnedHardcore = ~~(100 * NumAwardedHardcore / NumDistinctPlayers) + "%";

    const trend = 100 * (NumAwardedHardcore - NumAwardedToUserHardcore * 0.5) / ((NumDistinctPlayers + TotalRealPlayers) * 0.5 - NumAwardedToUserHardcore * 0.5);
    achievement.trend = trend;
    achievement.difficulty =
      trend < 1.5 && TrueRatio > 200 || TrueRatio >= 400 ? "hell" :
        trend <= 3 && TrueRatio > 100 || TrueRatio >= 300 ? "insane" :
          trend < 8 && TrueRatio > 24 ? "expert" :
            trend < 13 && TrueRatio > 5 ? "pro" :
              trend < 20 && TrueRatio < 10 || TrueRatio > 14 ? "standard" :
                "easy";

    return achievement;
  }
  toLocalTimeString(UTCTime) {
    UTCTime += "+00:00"; // Mark time as UTC Time 
    const date = new Date(UTCTime);
    return date.toString();
  }
}
