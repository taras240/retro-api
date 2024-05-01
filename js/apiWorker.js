class APIWorker {
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
  getUrl({ endpoint, targetUser, gameID, minutes, apiKey, userName, count }) {
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
  getUserCompelitionProgress({ targetUser }) {
    let url = this.getUrl({
      targetUser: targetUser || config.targetUser,
      endpoint: this.endpoints.completionProgress,
    });
    return fetch(url).then((resp) => resp.json());
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
      gameProgressObject.Achievements = Object.values(gameProgressObject.Achievements)
        .map(achievement =>
          this.fixAchievement(achievement, gameProgressObject));
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
