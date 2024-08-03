"use strict";
import { config } from "./script.js";
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
    achievementOfTheWeek: "API_GetAchievementOfTheWeek.php"
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
  getAotW() {
    let url = this.getUrl({ endpoint: this.endpoints.achievementOfTheWeek });
    return fetch(url)
      .then((resp) => resp.json())
      .then(aotwOrig => {
        const userEarned = aotwOrig.Unlocks
          .find(user => user.User.toLowerCase() === config.targetUser?.toLowerCase()?.trim())
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
      awardsObj.VisibleUserAwards = awardsObj.VisibleUserAwards.map(game => ({
        ...game,
        DateEarnedHardcore: game.AwardedAt,
        timeString: this.toLocalTimeString(game.AwardedAt),
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
          ...this.parseBadges(gameProgressObject),
          TotalRealPlayers: 0,
          TotalRetropoints: 0,
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
          }
        }
        const progressionAchivs = { Count: 0, WinCount: 0, WinAwardedCount: 0, WinAwardedSoftCount: 0, WinEarnedCount: 0 };
        const awards = {
          isBeaten: true,
          isBeatenSoftcore: true,
          isWinEarned: false,
          isWinEarnedSoftcore: false,
        }
        for (let achievement of Object.values(gameProgressObject.Achievements)) {
          //get TotalRetropoints
          gameProgressObject.TotalRetropoints += achievement.TrueRatio;

          //get TotalRealplayers
          if (gameProgressObject.TotalRealPlayers < achievement.NumAwarded) {
            gameProgressObject.TotalRealPlayers = achievement.NumAwarded
          }

          // Earned STATS
          if (achievement.DateEarned) {
            gameProgressObject.earnedStats.soft.count += 1;
            gameProgressObject.earnedStats.soft.points += achievement.Points;
            gameProgressObject.earnedStats.soft.retropoints += achievement.TrueRatio;
            if (achievement.type === "progression" || achievement.type === "win_condition") { gameProgressObject.earnedStats.soft.progressionCount++; }
          }
          if (achievement.DateEarnedHardcore) {
            gameProgressObject.earnedStats.hard.count += 1;
            gameProgressObject.earnedStats.hard.points += achievement.Points;
            gameProgressObject.earnedStats.hard.retropoints += achievement.TrueRatio;
            if (achievement.type === "progression" || achievement.type === "win_condition") { gameProgressObject.earnedStats.hard.progressionCount++; }
          }

          //Progression stats
          if (achievement.type === 'progression') {
            progressionAchivs.Count++;

            !achievement.DateEarned && (awards.isBeatenSoftcore = false);
            !achievement.DateEarnedHardcore && (awards.isBeaten = false);

            gameProgressObject.beatenCount = Math.min(achievement.NumAwardedHardcore, gameProgressObject.beatenCount);
            gameProgressObject.beatenSoftCount = Math.min(achievement.NumAwarded, gameProgressObject.beatenSoftCount);

          }
          else if (achievement.type === 'win_condition') {
            progressionAchivs.WinCount++;
            progressionAchivs.WinAwardedCount = Math.max(achievement.NumAwardedHardcore, progressionAchivs.WinAwardedCount);
            progressionAchivs.WinAwardedSoftCount = Math.max(achievement.NumAwarded, progressionAchivs.WinAwardedSoftCount);

            achievement.DateEarnedHardcore && progressionAchivs.WinEarnedCount++;

            awards.isWinEarned = !!achievement.DateEarnedHardcore;
            awards.isWinEarnedSoftcore = !!achievement.DateEarned;
          }
          gameProgressObject.masteredCount = Math.min(achievement.NumAwardedHardcore, gameProgressObject.masteredCount);
          gameProgressObject.completedCount = Math.min(achievement.NumAwarded, gameProgressObject.completedCount);

        }
        gameProgressObject = {
          ...gameProgressObject,
          winVariantCount: progressionAchivs.WinCount,
          winEarnedCount: progressionAchivs.WinEarnedCount,
          progressionSteps: progressionAchivs.WinCount > 0 ? progressionAchivs.Count + 1 : progressionAchivs.Count,
        }

        gameProgressObject.award =
          (gameProgressObject.NumAchievements === gameProgressObject.NumAwardedToUserHardcore) ? 'mastered' :
            (gameProgressObject.NumAchievements === gameProgressObject.NumAwardedToUser) ? 'completed' :
              gameProgressObject.award;


        gameProgressObject.progressionAward =
          (awards.isBeaten && gameProgressObject.earnedStats.hard.progressionCount >= gameProgressObject.progressionSteps) ? 'beaten' :
            (awards.isBeatenSoftcore && gameProgressObject.earnedStats.soft.progressionCount >= gameProgressObject.progressionSteps) ? 'beaten-softcore' :
              gameProgressObject.progressionAward;



        progressionAchivs.WinCount > 0 && (
          gameProgressObject.beatenCount = progressionAchivs.WinAwardedCount,
          gameProgressObject.beatenSoftCount = progressionAchivs.WinAwardedSoftCount
        )

        gameProgressObject.beatenCount != Infinity &&
          (gameProgressObject.beatenRate = ~~(10000 * gameProgressObject.beatenCount / gameProgressObject.TotalRealPlayers) / 100);
        gameProgressObject.beatenSoftCount != Infinity &&
          (gameProgressObject.beatenSoftRate = ~~(10000 * gameProgressObject.beatenSoftCount / gameProgressObject.TotalRealPlayers) / 100);

        gameProgressObject.masteredCount != Infinity &&
          (gameProgressObject.masteryRate = ~~(10000 * gameProgressObject.masteredCount / gameProgressObject.TotalRealPlayers) / 100);
        gameProgressObject.completedCount != Infinity &&
          (gameProgressObject.completedRate = ~~(10000 * gameProgressObject.completedCount / gameProgressObject.TotalRealPlayers) / 100);

        const ratio = ~~(gameProgressObject.TotalRetropoints / gameProgressObject.points_total * 100) / 100;
        gameProgressObject.retroRatio = ratio;

        //set Difficult
        gameProgressObject.gameDifficulty = ratio > 9 ? "insane" :
          ratio > 7 ? "expert" :
            ratio > 5 ? "pro" :
              ratio > 3 ? "standard" :
                "easy";
        //add missed fields for ACHIEVEMENTS
        Object.values(gameProgressObject.Achievements)
          .map(cheevo =>
            this.fixAchievement(cheevo, gameProgressObject));
        this.parseLevels(gameProgressObject);
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
    return fetch(url)
      .then((resp) => resp.json())
      .then(achivs => achivs.map(achiv => {
        achiv.Date = this.toLocalTimeString(achiv.Date);
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

  getRecentlyPlayedGames({ targetUser, count }) {
    let url = this.getUrl({
      endpoint: this.endpoints.recentlyPlayedGames,
      targetUser: targetUser,
      count: count || 50,
    });

    return fetch(url).then((resp) => resp.json()).then(arr => arr.map((game, index) => {
      game = {
        ...game,
        ID: game.GameID,
        Points: game.ScoreAchievedHardcore + "/" + game.PossibleScore,
        NumAchievements: game.NumAchievedHardcore + "/" + game.AchievementsTotal,
        DateEarnedHardcore: game.LastPlayed //for sort methods
      }
      return { ...game, ...this.parseBadges(game) };
    }));
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
        summary.RecentlyPlayed.length && (summary.isInGame = (new Date() - new Date(summary.RecentlyPlayed[0].LastPlayed)) < 5 * 60 * 1000);

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
    const { BadgeName, DateEarned, DateEarnedHardcore, NumAwardedHardcore, NumAwarded, TrueRatio, ID, Points } = achievement;
    const { NumDistinctPlayers, NumAwardedToUserHardcore, TotalRealPlayers } = gameData;

    const trend = 100 * (NumAwardedHardcore - NumAwardedToUserHardcore * 0.5) / ((NumDistinctPlayers + TotalRealPlayers) * 0.5 - NumAwardedToUserHardcore * 0.5);
    const earnedRateHardcore = (100 * NumAwardedHardcore / NumDistinctPlayers);
    gameData.Achievements[ID] = {
      ...achievement,
      totalPlayers: NumDistinctPlayers,
      isEarned: !!DateEarned,
      isHardcoreEarned: !!DateEarnedHardcore,
      DateEarned: DateEarned && this.toLocalTimeString(DateEarned),
      DateEarnedHardcore: DateEarnedHardcore && this.toLocalTimeString(DateEarnedHardcore),
      prevSrc: `https://media.retroachievements.org/Badge/${BadgeName}.png`,
      rateEarned: ~~(100 * NumAwarded / NumDistinctPlayers) + "%",
      rateEarnedHardcore: NumAwardedHardcore < 20 ? NumAwardedHardcore : earnedRateHardcore < 10 ? `${earnedRateHardcore.toFixed(1)}%` : `${earnedRateHardcore.toFixed(0)}%`,
      trend: trend,
      // level: this.getCheevoLevel(achievement),
      // zone: this.getCheevoZone(achievement),
      retroRatio: (TrueRatio / Points).toFixed(2),
      difficulty:
        trend < 1.5 && TrueRatio > 300 || TrueRatio >= 500 ? "hell" :
          trend <= 3 && TrueRatio > 100 || TrueRatio >= 300 ? "insane" :
            trend < 8 && TrueRatio > 24 ? "expert" :
              trend < 13 && TrueRatio > 10 ? "pro" :
                trend < 20 && TrueRatio > 5 || TrueRatio > 10 ? "standard" :
                  "easy",
    }
  }
  parseBadges(game) {
    const ignoredWords = [/\[SUBSET[^\[]*\]/gi, /~[^~]*~/g, ".HACK//",];
    let title = game.Title;

    const badges = ignoredWords.reduce((badges, word) => {
      const reg = new RegExp(word, "gi");
      const matches = game.Title.match(reg);
      if (matches) {
        matches.forEach(match => {
          title = title.replace(match, "");
          let badge = match;
          badges.push(badge.replace(/[~\.\[\]]|subset -|\/\//gi, ""));
        })
      }
      return badges;
    }, []);
    game.badges = badges;
    game.FixedTitle = title.trim();
    return { badges: badges, FixedTitle: title.trim() };
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
    return date.toLocaleDateString("uk-UA", options);

  }
  parseLevels(game) {
    const levels = Object.values(game.Achievements)
      .sort((a, b) => a.ID - b.ID)
      .sort((a, b) => a.DisplayOrder - b.DisplayOrder)
      .reduce((levels, cheevo) => {
        const zone = this.getCheevoZone(cheevo);
        zone && (
          levels.zoneCount++,
          !levels.zoneNames.includes(zone) && levels.zoneNames.push(zone)
        );
        const level = this.getCheevoLevel(cheevo);
        level && (levels.levelCount++);
        levels.data.push({ ID: cheevo.ID, zone: zone, level: level });
        return levels;
      }, { zoneCount: 0, levelCount: 0, data: [], zoneNames: [] });
    if (levels.zoneCount > 3 && levels.zoneCount >= levels.levelCount) {
      game.zones = levels.zoneNames;
      levels.zoneNames.forEach((name, index) => {
        Object.values(game.Achievements).forEach(cheevo => {
          const regex = new RegExp(`\\b${name}\\b`, "g");
          (regex.test(cheevo.Description) || regex.test(cheevo.Title)) && (cheevo.zone = name, cheevo.level = index + 1)
        })
      })
      levels.data.forEach(levelObj => {
        levelObj.zone && (
          game.Achievements[levelObj.ID].zone = levelObj.zone,
          game.Achievements[levelObj.ID].level = +`${levels.zoneNames.indexOf(levelObj.zone) + 1}${levelObj.level ? "." + levelObj.level : ""}`)
      })
    }
    else {
      levels.data.forEach(levelObj => {
        game.Achievements[levelObj.ID].level = levelObj.level;
      })
    }
  }
  getCheevoLevel(cheevo) {
    const levelNames = [
      'level', 'levels', 'stage\\b', 'stages', 'area', 'world', 'mission', 'chapter', 'section', 'part',
      'zone', 'phase', 'realm', 'domain', 'episode', 'act', 'sequence', 'tier', 'floor',
      'dimension', 'region', 'scene', 'screen', 'round\\s',
    ];

    const numberMapping = {
      'one': '1', 'first': '1',
      'two': '2', 'second': '2',
      'three': '3', 'third': '3',
      'four': '4', 'fourth': '4',
      'five': '5', 'fifth': '5',
      'six': '6', 'sixth': '6',
      'seven': '7', 'seventh': '7',
      'eight': '8', 'eighth': '8',
      'nine': '9', 'ninth': '9',
      'ten': '10', 'tenth': '10',
      'eleven': '11', 'eleventh': '11',
      'twelve': '12', 'twelfth': '12',
      'thirteen': '13', 'thirteenth': '13',
      'fourteen': '14', 'fourteenth': '14',
      'fifteen': '15', 'fifteenth': '15',
      'sixteen': '16', 'sixteenth': '16',
      'seventeen': '17', 'seventeenth': '17',
      'eighteen': '18', 'eighteenth': '18',
      'nineteen': '19', 'nineteenth': '19',
      'twenty': '20', 'twentieth': '20'
    };


    function replaceWrittenNumbers(description) {
      description = description.replaceAll(/(\d)(st|nd|rd|th)/gi, (_, p1) => p1);
      const regex = new RegExp(
        Object
          .keys(numberMapping)
          .map(num => `\\b${num}\\b`)
          .join("|"), 'gi');
      description = description.replace(regex, match => numberMapping[match.toLowerCase().trim()]);
      return description;
    }

    function checkLevel(description) {
      const levelNamesString = levelNames.join("|");
      const d = "\\d{1,2}(?!\\d|\\s*%)";
      const regex = new RegExp(`(?:${levelNamesString})\\s*#{0,1}((${d}-${d})|(${d}))|((${d}-${d})|(${d}))\\s*(?:${levelNamesString})`, 'gi');
      const match = regex.exec(description);

      if (match) {
        const levelString = match[1] || match[4];
        return parseFloat(levelString.replace('-', '.'));
      }
      return null;
    }

    const description = replaceWrittenNumbers(cheevo.Description);
    const levelNumber = checkLevel(description);
    return levelNumber;
    return Number.isFinite(levelNumber) ? levelNumber :
      (+cheevo.DisplayOrder > 0 ? cheevo.DisplayOrder * 1000 : cheevo.ID);
  }
  getCheevoZone(cheevo) {
    // console.log(cheevo)
    const levelNames = [
      'Stage', 'Area', 'World', 'Mission', 'Chapter', 'Section', 'Zone',
    ];
    const ignoreWords = [
      "Clear", "Complete", "Beat", "Start", "Enter", "Reach", "Select"
    ]
    function checkLevel(description) {
      const levelNamesString = levelNames.join("|");
      const ignoreWordsString = ignoreWords.join("|");
      const levelTitle = "\\b[A-Z]\\w*";

      let regex = new RegExp(`((?:${levelNamesString})\\s((${levelTitle}\\b\\s*){1,2}))|((?!${ignoreWordsString})((${levelTitle}\\s){1,2})(?:${levelNamesString}\\b(?!\\s*\\d)))`, 'gm');

      const match = regex.exec(description);
      // console.log(match );
      const zone = match && (match[2] || match[5]);
      return zone?.trim();

    }

    const description = cheevo.Description;
    const levelZone = checkLevel(description);

    return levelZone;
  }


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
const RAtoRAWG = {
  "1": 167, // "Genesis/Mega Drive" -> "Genesis"
  "2": 83, // "Nintendo 64" -> "Nintendo 64"
  "3": 79, // "SNES/Super Famicom" -> "SNES"
  "4": 26, // "Game Boy" -> "Game Boy"
  "5": 24, // "GB Advance" -> "Game Boy Advance"
  "6": 43, // "GB Color" -> "Game Boy Color"
  "7": 49, // "NES/Famicom" -> "NES"
  "8": null, // "PC Engine/TurboGrafx-16" -> Not found in RAWG
  "9": 119, // "Sega CD" -> "SEGA CD"
  "10": 117, // "32X" -> "SEGA 32X"
  "11": 74, // "Master System" -> "SEGA Master System"
  "12": 27, // "PlayStation" -> "PlayStation"
  "13": 46, // "Atari Lynx" -> "Atari Lynx"
  "14": null, // "Neo Geo Pocket" -> Not found in RAWG
  "15": 77, // "Game Gear" -> "Game Gear"
  "17": 112, // "Atari Jaguar" -> "Jaguar"
  "18": 9, // "Nintendo DS" -> "Nintendo DS"
  "21": 15, // "PlayStation 2" -> "PlayStation 2"
  "23": null, // "Magnavox Odyssey 2" -> Not found in RAWG
  "24": null, // "Pokemon Mini" -> Not found in RAWG
  "25": 23, // "Atari 2600" -> "Atari 2600"
  "27": 12, //*neogeo "Arcade" -> Not found in RAWG
  "28": null, // "Virtual Boy" -> Not found in RAWG
  "29": null, // "MSX" -> Not found in RAWG
  "33": null, // "SG-1000" -> Not found in RAWG
  "37": null, // "Amstrad CPC" -> Not found in RAWG
  "38": 41, // "Apple II" -> "Apple II"
  "39": 107, // "Saturn" -> "SEGA Saturn"
  "40": 106, // "Dreamcast" -> "Dreamcast"
  "41": 17, // "PlayStation Portable" -> "PSP"
  "43": 111, // "3DO Interactive Multiplayer" -> "3DO"
  "44": null, // "ColecoVision" -> Not found in RAWG
  "45": null, // "Intellivision" -> Not found in RAWG
  "46": null, // "Vectrex" -> Not found in RAWG
  "47": null, // "PC-8000/8800" -> Not found in RAWG
  "49": null, // "PC-FX" -> Not found in RAWG
  "51": 28, // "Atari 7800" -> "Atari 7800"
  "53": null, // "WonderSwan" -> Not found in RAWG
  "56": null, // "Neo Geo CD" -> Not found in RAWG
  "57": null, // "Fairchild Channel F" -> Not found in RAWG
  "63": null, // "Watara Supervision" -> Not found in RAWG
  "69": null, // "Mega Duck" -> Not found in RAWG
  "71": null, // "Arduboy" -> Not found in RAWG
  "72": null, // "WASM-4" -> Not found in RAWG
  "73": null, // "Arcadia 2001" -> Not found in RAWG
  "74": null, // "Interton VC 4000" -> Not found in RAWG
  "75": null, // "Elektor TV Games Computer" -> Not found in RAWG
  "76": null, // "PC Engine CD/TurboGrafx-CD" -> Not found in RAWG
  "77": null, // "Atari Jaguar CD" -> Not found in RAWG
  "78": 13, // "Nintendo DSi" -> "Nintendo DSi"
  "80": null, // "Uzebox" -> Not found in RAWG
  "101": null, // "Events" -> Not applicable
  "102": null, // "Standalone" -> Not applicable
};
