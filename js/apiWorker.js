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
  };

  // Генерує URL для запиту до API
  getUrl({ endpoint, targetUser, gameID, minutes, apiKey, userName, count, offset }) {
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
  // Отримання інформації про профіль користувача
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
        game.Points = "";
        game.NumAchievements = game.NumAwardedHardcore + "/" + game.MaxPossible;
        game.NumLeaderboards = "";
        game.DateEarnedHardcore = game.MostRecentAwardedDate;
        let title = game.Title;
        const ignoredWords = ["~UNLICENSED~", "~DEMO~", "~HOMEBREW~", "~HACK~", "~PROTOTYPE~", ".HACK//", "~TEST KIT~"];

        const sufixes = ignoredWords.reduce((sufixes, word) => {
          const reg = new RegExp(word, "gi");
          if (reg.test(game.Title)) {
            title = title.replace(reg, "");
            sufixes.push(word.replaceAll(new RegExp("[^A-Za-z]", "gi"), ""));

          }
          return sufixes;
        }, []);
        if (sufixes.length === 0) {
          sufixes.push("ORIGINAL")
        }
        game.HighestAwardKind ? sufixes.push(game.HighestAwardKind) : "";
        game.sufixes = sufixes;
        game.FixedTitle = title.trim();
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
    return fetch(url).then((resp) => resp.json());
  }
  // Отримання прогресу гри користувача
  getGameProgress({ targetUser, gameID }) {
    let url = this.getUrl({
      endpoint: this.endpoints.gameProgress,
      targetUser: targetUser || config.targetUser,
      gameID: gameID || config.gameID,
    });

    return fetch(url).then((resp) => resp.json()).then(gameProgressObject => {

      Object.getOwnPropertyNames(gameProgressObject.Achievements)
        .forEach(id =>
          this.fixAchievement(gameProgressObject.Achievements[id], gameProgressObject));
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

  getRecentlyPlayedGames({ targetUser }) {
    let url = this.getUrl({
      endpoint: this.endpoints.recentlyPlayedGames,
      targetUser: targetUser,
      count: 50,
    });
    // {
    //   "GameID": 1479,
    //   "ConsoleID": 7,
    //   "ConsoleName": "NES/Famicom",
    //   "Title": "Kirby's Adventure",
    //   "ImageIcon": "/Images/060148.png",
    //   "ImageTitle": "/Images/058502.png",
    //   "ImageIngame": "/Images/058503.png",
    //   "ImageBoxArt": "/Images/012398.png",
    //   "LastPlayed": "2024-04-23 16:55:32",
    //   "AchievementsTotal": 61,
    //   "NumPossibleAchievements": 61,
    //   "PossibleScore": 502,
    //   "NumAchieved": 44,
    //   "ScoreAchieved": 177,
    //   "NumAchievedHardcore": 44,
    //   "ScoreAchievedHardcore": 177
    // }
    return fetch(url).then((resp) => resp.json()).then(arr => arr.map((game, index) => {
      game.ID = game.GameID;
      game.Points = game.ScoreAchievedHardcore + "/" + game.PossibleScore;
      game.NumAchievements = game.NumAchievedHardcore + "/" + game.AchievementsTotal;
      game.NumLeaderboards = "";
      game.DateEarnedHardcore = game.LastPlayed;
      let title = game.Title;
      const ignoredWords = ["~UNLICENSED~", "~DEMO~", "~HOMEBREW~", "~HACK~", "~PROTOTYPE~", ".HACK//", "~TEST KIT~"];

      const sufixes = ignoredWords.reduce((sufixes, word) => {
        const reg = new RegExp(word, "gi");
        if (reg.test(game.Title)) {
          title = title.replace(reg, "");
          sufixes.push(word.replaceAll(new RegExp("[^A-Za-z]", "gi"), ""));

        }
        return sufixes;
      }, [])
      game.sufixes = sufixes;
      game.FixedTitle = title.trim();
      return game;
    }));;
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


  // {
  //   "Count": 100,
  //   "Total": 1287,
  //   "Results": [
  //     {
  //       "GameID": 20246,
  //       "Title": "~Hack~ Knuckles the Echidna in Sonic the Hedgehog",
  //       "ImageIcon": "/Images/074560.png",
  //       "ConsoleID": 1,
  //       "ConsoleName": "Mega Drive / Genesis",
  //       "MaxPossible": 0,
  //       "NumAwarded": 0,
  //       "NumAwardedHardcore": 0,
  //       "MostRecentAwardedDate": "2023-10-27T02:52:34+00:00",
  //       "HighestAwardKind": "beaten-hardcore",
  //       "HighestAwardDate": "2023-10-27T02:52:34+00:00"
  //     }
  // ...
  //   ]
  // }
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
    const { BadgeName, DateEarned, DateEarnedHardcore } = achievement;

    //Додаєм кількість гравців
    achievement.totalPlayers = achievements.NumDistinctPlayers;

    // Визначаєм, чи отримано досягнення та чи є воно хардкорним
    achievement.isEarned = !!DateEarned;
    achievement.isHardcoreEarned = !!DateEarnedHardcore;

    // Додаєм адресу зображення для досягнення
    achievement.prevSrc = `https://media.retroachievements.org/Badge/${BadgeName}.png`;

    //Повертаємо виправлений об'єкт
    return achievement;
  }
}
