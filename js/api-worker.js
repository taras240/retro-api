class APIWorker {
  endpoints = {
    userProfile: "API_GetUserProfile.php",
    gameProgress: "API_GetGameInfoAndUserProgress.php",
    recentAchieves: "API_GetUserRecentAchievements.php",
    gameInfo: "API_GetGame.php",
    extendedGameInfo: "API_GetGameExtended.php",
  };
  baseUrl = `https://retroachievements.org/API/`;
  constructor() {
    this.apiKey = userIdent.API_KEY;
    this.userName = userIdent.USER_NAME;
    this.getProfileInfo({}).then((resp) => {
      this.gameID = resp.LastGameID;
    });
  }
  getProfileInfo({ targetUser }) {
    let url = new URL(this.endpoints.userProfile, this.baseUrl);
    let params = {
      y: this.apiKey,
      z: this.userName,
      u: targetUser || this.userName,
    };
    url.search = new URLSearchParams(params);
    return fetch(url).then((resp) => resp.json());
  }
  getGameProgress({ targetUser, gameID }) {
    let url = new URL(this.endpoints.gameProgress, this.baseUrl);
    let params = {
      g: gameID || this.gameID,
      y: this.apiKey,
      z: this.userName,
      u: targetUser || this.userName,
    };
    url.search = new URLSearchParams(params);
    return fetch(url).then((resp) => resp.json());
  }
  getRecentAchieves({ targetUser, minutes }) {
    let url = new URL(this.endpoints.recentAchieves, this.baseUrl);
    let params = {
      m: minutes || 2000,
      y: this.apiKey,
      z: this.userName,
      u: targetUser || this.userName,
    };
    url.search = new URLSearchParams(params);
    return fetch(url).then((resp) => resp.json());
  }
  getGameInfo({ gameID, extended }) {
    let url = new URL(
      this.endpoints[extended ? "extendedGameInfo" : "gameInfo"],
      this.baseUrl
    );
    let params = {
      y: this.apiKey,
      z: this.userName,
      i: gameID || this.gameID,
    };
    url.search = new URLSearchParams(params);
    return fetch(url).then((resp) => resp.json());
  }
}
