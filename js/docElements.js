class UI {
  RECENT_DELAY_MILISECS = 20 * 60 * 1000; //mins => secs => milisecs
  constructor() {
    this.gameCard = document.querySelector(".game-card_section");

    this.settings = document.querySelector(".prefs_section");
    this.apiKey = document.querySelector("#api-key");
    this.apiKey.value = userIdent.API_KEY;

    this.login = document.querySelector("#login-input");
    this.login.value = userIdent.USER_NAME;

    this.updateInterval = document.querySelector("#update-time");
    this.gameID = document.querySelector("#game-id");
    this.gameID.value = localStorage.getItem("RAGameID");

    this.watchButton = document.querySelector("#watching-button");

    this.gamePreview = document.querySelector("#game-preview");
    this.gameTitle = document.querySelector("#game-title");
    this.gamePlatform = document.querySelector("#game-platform");
    this.gameAchivsCount = document.querySelector("#game-achivs-count");

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

    this.updateInterval.addEventListener("change", () => {
      UPDATE_RATE_IN_SECS = this.updateInterval.value;
    });
    this.gameID.addEventListener("change", () => {
      updateGameID(this.gameID.value);
    });
    this.watchButton.addEventListener("click", (e) => {
      e.stopPropagation();
      if (this.watchButton.classList.contains("active")) {
        stopWatching();
      } else {
        startWatching();
      }
    });
    this.achivsSection.addEventListener("mousedown", (e) => {
      e.stopPropagation();
    });
    let element = document.querySelector("#achivs-resizer");
    let achivsBlock = document.querySelector("section.achivs");
    element.addEventListener("mousedown", (event) => {
      this.resizeValues = {
        // Зберігаємо початкові розміри елемента
        startWidth: achivsBlock.clientWidth,
        startHeight: achivsBlock.clientHeight,

        // Зберігаємо координати миші
        startX: event.clientX,
        startY: event.clientY,
      };

      // Додаємо подію mousemove до документа
      document.addEventListener("mousemove", resizeAchivsBlock);

      // Видаляємо подію mousemove з документа, коли користувач відпускає кнопку миші
      document.addEventListener("mouseup", () => {
        document.removeEventListener("mousemove", resizeAchivsBlock);
      });
    });

    document.querySelector(".get-id-button").addEventListener("click", () => {
      apiWorker.getProfileInfo({}).then((resp) => {
        this.gameID.value = resp.LastGameID;
        updateGameID(resp.LastGameID);
      });
    });
    document.querySelector(".check-id-button").addEventListener("click", () => {
      getAchivs();
    });
  }

  parseGameAchievements(achivs) {
    this.achivsSection.innerHTML = "";
    this.updateGameInfo({
      title: achivs.Title,
      platform: achivs.ConsoleName,
      imageIcon: achivs.ImageIcon,
      achivsCount: achivs.NumAchievements,
    });
    Object.values(achivs.Achievements).forEach((achiv) => {
      let achivElement = this.generateAchievement({
        badgeName: achiv["BadgeName"],
        title: achiv["Title"],
        description: achiv["Description"],
        dateEarned: achiv["DateEarned"],
        dateHardEarned: achiv["DateEarnedHardcore"],
        achivID: achiv["ID"],
      });
      this.achivsSection.appendChild(achivElement);
    });
  }
  updateGameInfo({ title, platform, imageIcon, achivsCount }) {
    this.gamePreview.setAttribute(
      "src",
      `https://media.retroachievements.org${imageIcon}`
    );
    this.gameTitle.innerText = title;
    this.gameAchivsCount.innerText = achivsCount;
    this.gamePlatform.innerText = platform;
  }
  updateGameCardInfo(gameInfo) {
    document.querySelector("#game-card-header").innerText = gameInfo.Title;
    document
      .querySelector("#game-card-image")
      .setAttribute(
        "src",
        `https://media.retroachievements.org${gameInfo.ImageBoxArt}`
      );
    document.querySelector("#game-card-platform").innerText =
      gameInfo.ConsoleName;
    document.querySelector("#game-card-developer").innerText =
      gameInfo.Developer || "-";
    document.querySelector("#game-card-publisher").innerText =
      gameInfo.Publisher || "-";
    document.querySelector("#game-card-genre").innerText =
      gameInfo.Genre || "-";
    document.querySelector("#game-card-released").innerText =
      gameInfo.Released || "-";
    document.querySelector(
      "#game-card-completion"
    ).innerText = `${gameInfo.UserCompletion} [${gameInfo.UserCompletionHardcore}]`;
  }

  generateAchievement({
    badgeName,
    title,
    description,
    dateEarned,
    dateHardEarned,
    achivID,
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
    achivElement.dataset.achivId = achivID;
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
    let rowsCount, colsCount, n;
    let windowHeight = this.achivsSection.clientHeight;
    let windowWidth = this.achivsSection.clientWidth;
    let achivsCount = this.achivsSection.childNodes.length;

    let achivWidth = ~~(((windowWidth * windowHeight) / achivsCount) ** 0.5);
    do {
      achivWidth--;
      rowsCount = ~~(windowHeight / achivWidth);
      colsCount = ~~(windowWidth / achivWidth);
      n = rowsCount * colsCount;
    } while (n < achivsCount);
    this.achivsSection.childNodes.forEach(
      (achiv) => (achiv.style.width = achivWidth + "px")
    );
  }
}
function resizeAchivsBlock(event) {
  let element = document.querySelector("section.achivs");
  // Розраховуємо нову ширину та висоту елемента
  let newWidth =
    ui.resizeValues.startWidth + (event.clientX - ui.resizeValues.startX);
  let newHeight =
    ui.resizeValues.startHeight + (event.clientY - ui.resizeValues.startY);

  // Задаємо нові розміри елементу
  element.style.width = `${newWidth}px`;
  element.style.height = `${newHeight}px`;
  ui.fitSizeVertically();
}
