class UI {
  constructor() {
    this.settings = document.querySelector(".prefs_section");
    this.apiKey = document.querySelector("#api-key");
    this.apiKey.value = userIdent.API_KEY;

    this.login = document.querySelector("#login-input");
    this.login.value = userIdent.USER_NAME;

    this.columnsCount = document.querySelector("#columns");
    this.columnWidth = document.querySelector("#columns-width");

    this.updateInterval = document.querySelector("#update-time");
    this.gameID = document.querySelector("#game-id");
    this.gameID.value = localStorage.getItem("gameID");

    this.gamePreview = document.querySelector("#game-preview");
    this.gameTitle = document.querySelector("#game-title");
    this.gamePlatform = document.querySelector("#game-platform");

    this.achivsSection = document.querySelector(".achivs_section");
    this.addEvents();
  }
  addEvents() {
    this.apiKey.addEventListener("change", () => {
      localStorage.setItem("RAApiKey", this.apiKey.value);
      userIdent.API_KEY = this.apiKey.value;
    });
    this.login.addEventListener("change", () => {
      localStorage.setItem("RAUserName", this.login.value);
      userIdent.USER_NAME = this.login.value;
    });
    this.columnsCount.addEventListener("change", () => {
      this.achivsSection.style.gridTemplateColumns = `repeat(${this.columnsCount.value}, ${this.columnWidth.value}px)`;
      // this.fitSizeVertically();
    });
    this.columnWidth.addEventListener("change", () => {
      this.achivsSection.style.gridTemplateColumns = `repeat(${this.columnsCount.value}, ${this.columnWidth.value}px)`;
    });
    this.updateInterval.addEventListener("change", () => {
      updateRateInSecs = this.updateInterval.value;
    });
    this.gameID.addEventListener("change", () => {
      apiWorker.gameID = this.gameID.value;
      localStorage.setItem("gameID", this.gameID.value);
    });
    document
      .querySelector(".fit-width-button")
      .addEventListener("click", () => this.fitSizeVertically());
    document
      .querySelector(".fit-columns-button")
      .addEventListener("click", () => this.fitColumnsVertically());
    document.querySelector(".get-id-button").addEventListener("click", () => {
      apiWorker.getProfileInfo({}).then((resp) => {
        this.gameID.value = resp.LastGameID;
        apiWorker.gameID = resp.LastGameID;
      });
    });
  }
  parseGameAchievements(achivs) {
    // console.log(achivs);
    this.achivsSection.innerHTML = "";
    this.updateGameInfo({
      title: achivs.Title,
      platform: achivs.ConsoleName,
      imageIcon: achivs.ImageIcon,
    });
    Object.values(achivs.Achievements).forEach((achiv) => {
      let achivElement = this.generateAchievement({
        badgeName: achiv["BadgeName"],
        title: achiv["Title"],
        description: achiv["Description"],
        dateEarned: achiv["DateEarned"],
        dateHardEarned: achiv["DateEarnedHardcore"],
      });
      this.achivsSection.appendChild(achivElement);
    });
  }
  updateGameInfo({ title, platform, imageIcon }) {
    this.gamePreview.setAttribute(
      "src",
      `https://media.retroachievements.org${imageIcon}`
    );
    this.gameTitle.innerText = title;
    this.gamePlatform.innerText = platform;
  }
  generateAchievement({
    badgeName,
    title,
    description,
    dateEarned,
    dateHardEarned,
  }) {
    let achivElement = document.createElement("div");
    let isEarned = dateEarned !== undefined;
    let isHardcoreEarned = dateHardEarned !== undefined;
    achivElement.className = `achiv-block ${isEarned ? "earned" : ""} ${
      isHardcoreEarned ? "hardcore" : ""
    }`;
    achivElement.innerHTML = `
    <div class="preview-container">
        <img
            class="achiv-preview"
            src="https://media.retroachievements.org/Badge/${badgeName}.png"
            alt=""
            srcset=""
        />
    </div>
    <div class="achiv-details">
        <h2 class="achiv-title">${title}</h2>
        <p class="achiv-description">${description}</p>
        <p class="collected-date">${dateEarned}</p>
    </div>
    `;
    achivElement.appendChild(
      this.generateAchivDetails({
        name: title,
        description: description,
        dateEarned: dateEarned,
      })
    );
    return achivElement;
  }
  generateAchivDetails({ name, description, dateEarned }) {
    let detailsElement = document.createElement("div");
    detailsElement.className = "achiv-details-block";
    detailsElement.innerHTML = `
      <h2>${name}</h2>
      <p>${description}</p>
    `;
    return detailsElement;
  }
  fitSizeVertically() {
    let windowHeight = window.innerHeight;
    while (this.achivsSection.clientHeight > windowHeight) {
      this.achivsSection.style.gridTemplateColumns = `repeat(${
        this.columnsCount.value
      }, ${--this.columnWidth.value}px)`;
    }

    while (this.achivsSection.clientHeight + 10 < windowHeight) {
      this.achivsSection.style.gridTemplateColumns = `repeat(${
        this.columnsCount.value
      }, ${++this.columnWidth.value}px)`;
    }
  }
  fitColumnsVertically() {
    let windowHeight = window.innerHeight;
    while (this.achivsSection.clientHeight > windowHeight) {
      console.log(this.columnsCount.value);
      this.achivsSection.style.gridTemplateColumns = `repeat(${++this
        .columnsCount.value}, ${this.columnWidth.value}px)`;
    }

    while (
      this.achivsSection.clientHeight + this.columnWidth.value + 5 <
      windowHeight
    ) {
      this.achivsSection.style.gridTemplateColumns = `repeat(${--this
        .columnsCount.value}, ${this.columnWidth.value}px)`;
    }
  }
}
