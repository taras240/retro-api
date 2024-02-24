class UI {
  RECENT_DELAY_MILISECS = 20 * 60 * 1000; //mins => secs => milisecs
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
    this.gameID.value = localStorage.getItem("RAGameID");

    this.gamePreview = document.querySelector("#game-preview");
    this.gameTitle = document.querySelector("#game-title");
    this.gamePlatform = document.querySelector("#game-platform");

    this.achivsSection = document.querySelector(".achivs_section");
    this.addEvents();
  }
  addEvents() {
    this.apiKey.addEventListener("change", () => {
      updateUserIdent({ apiKey: this.apiKey.value });
    });
    this.login.addEventListener("change", () => {
      updateUserIdent({ loginName: this.login.value });
    });
    this.columnsCount.addEventListener("change", () => {
      this.achivsSection.style.gridTemplateColumns = `repeat(${this.columnsCount.value}, ${this.columnWidth.value}px)`;
    });
    this.columnWidth.addEventListener("change", () => {
      this.achivsSection.style.gridTemplateColumns = `repeat(${this.columnsCount.value}, ${this.columnWidth.value}px)`;
    });
    this.updateInterval.addEventListener("change", () => {
      updateRateInSecs = this.updateInterval.value;
    });
    this.gameID.addEventListener("change", () => {
      updateGameID(this.gameID.value);
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
        updateGameID(resp.LastGameID);
      });
    });
    document.querySelector(".check-id-button").addEventListener("click", () => {
      updateAchivs();
    });
  }

  parseGameAchievements(achivs) {
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
    achivElement.classList.add(
      "achiv-block",
      isEarned ? "earned" : "o",
      isHardcoreEarned ? "hardcore" : "o"
    );
    if (isHardcoreEarned) {
      let diffMinutes = new Date() - new Date(dateHardEarned);
      // console.log(diffMinutes, this.RECENT_DELAY_MILISECS);
      diffMinutes < this.RECENT_DELAY_MILISECS
        ? achivElement.classList.add("recent-earned-hard")
        : "o";
    } else if (isEarned) {
      let diffMinutes = new Date() - new Date(dateEarned);
      diffMinutes < this.RECENT_DELAY_MILISECS
        ? achivElement.classList.add("recent-earned")
        : "o";
    }

    achivElement.innerHTML = `
    <div class="preview-container">
        <img
            class="achiv-preview"
            src="https://media.retroachievements.org/Badge/${badgeName}.png"
            alt=""
            srcset=""
        />
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
      <h3>${name}</h3>
      <p>${description}</p>
      <p>${dateEarned ? "Earned " + dateEarned : ""}</p>
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
let dragStartPos = {
  X: 0,
  Y: 0,
};
