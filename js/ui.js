import { loadSections } from "./htmlBuilder.js";

import { config, ui, apiWorker, userAuthData } from "./script.js";

export class UI {
  VERSION = "0.45";
  static RECENT_ACHIVES_RANGE_MINUTES = 5;
  static AUTOCLOSE_CONTEXTMENU = false;
  static STICK_MARGIN = 10;

  get ACHIEVEMENTS() {
    return this.GAME_DATA.Achievements;
  }
  get GAME_DATA() {
    return this._gameData;
  }
  set GAME_DATA(gameObject) {
    if (this.GAME_DATA && gameObject.ID != this.GAME_DATA?.ID) {

      this.notifications.pushNotification({ type: this.notifications.types.newGame, elements: gameObject });
    }
    this._gameData = gameObject;
    this.achievementsBlock.forEach((widget) =>
      widget.parseGameAchievements(this.GAME_DATA)
    );
    this.statusPanel.gameChangeEvent();
    this.gameCard.updateGameCardInfo(this.GAME_DATA);
    if (this.target.AUTOFILL) {
      this.target.clearAllAchivements();
      this.target.fillItems();
    }
    this.progression.fillCards();
  }

  constructor() {
    loadSections()
      .then(() => {
        // Ініціалізація елементів
        this.initializeElements();

        //Встановлення розмірів і розміщення елементів
        this.setPositions();

        this.addEvents();
        //Оновлення кольорів
        UI.updateColors();

        //Оновлення ачівментсів
        if (config.identConfirmed) {
          if (config.version != this.VERSION) {
            setTimeout(() => {
              // UI.switchSectionVisibility({
              //   section: document
              //     .querySelector("#help_section")
              // })
              config.version = this.VERSION;
            }, 1500);
          }
          //!-----------------------------------
          config.startOnLoad
            ? this.statusPanel.watchButton.click()
            : this.getAchievements();

          setTimeout(() => {
            apiWorker.getUserSummary({}).then(resp => {
              this.userInfo.update({ userSummary: resp });
              this.stats.initialSetStats({ userSummary: resp });
            })
          }, 3000);
        }
        else {
          const section = this.loginCard.section;
          section.classList.remove("disposed");
          setTimeout(() => section.classList.remove("hidden"), 100);
          config.setNewPosition({
            id: section.id,
            hidden: false,
          })
          // UI.switchSectionVisibility({ section: this.loginCard.section })
        }
        // Вимкнення вікна завантаження
        setTimeout(
          () =>
            document.querySelector(".loading-section").classList.add("hidden"),
          1000
        );
      })
      .catch((err) => {
        setTimeout(
          () =>
            document.querySelector(".loading-section").classList.add("hidden"),
          1000
        );
        console.log(err);
      });
  }

  initializeElements() {
    this.app = document.querySelector(".wrapper");
    // this.about = {
    //   section: document.querySelector("#help_section"),
    // };
    this.loginCard = new LoginCard();
    this.target = new Target();
    this.achievementsBlock = [new AchievementsBlock()];
    this.createAchievementsTemplate();
    this.settings = new Settings();
    this.awards = new Awards();
    this.gameCard = new GameCard();
    this.statusPanel = new StatusPanel();
    this.games = new Games();
    this.progression = new Progression();
    this.userInfo = new UserInfo();
    this.note = new Note();
    this.notifications = new Notifications();
    this.stats = new Stats();
    //*  Must be last initialized to set correct values
    this.buttons = new ButtonPanel();


  }

  setPositions() {
    // Проходження по кожному ідентифікатору контейнера в об'єкті config.uierw
    [...document.querySelectorAll(".section")].forEach(section => {
      const id = section.id;
      if (config.ui[id]) {
        // Getting positions and dimensions from config.ui
        const { x, y, width, height, hidden } = config.ui[id];

        // Set positions and dimensions for widget if they are saved in config.ui
        x && (section.style.left = x);
        y && (section.style.top = y);
        width && (section.style.width = width);
        height && (section.style.height = height);

        const isHidden = hidden ?? true;
        isHidden && section.classList.add("hidden", "disposed");
      }
      else {
        section.classList.add("hidden", "disposed");
      }
    })

    document.querySelector("#background-animation").style.display =
      config.bgVisibility ? "block" : "none";
  }
  addEvents() {
    document.addEventListener("click", () => {
      document.querySelectorAll(".context-menu").forEach((el) => el.remove());
    });
    document.body.addEventListener("contextmenu", (e) => {
      this.showContextmenu({ event: e, menuItems: this.settings.contextMenuItems })
    });
  }
  updateWidgets({ earnedAchievementsIDs }) {
    //Update Achievements widgets
    this.achievementsBlock.forEach(template =>
      template.updateEarnedAchieves({ earnedAchievementIDs: earnedAchievementsIDs })
    )

    // Update Target widget
    this.target.updateEarnedAchieves({ earnedAchievementIDs: earnedAchievementsIDs })
    this.target.delayedRemove();

    //Update Awards widget
    this.awards.VISIBLE && this.awards.updateAwards();

    //Update Progression widget
    this.progression.updateEarnedCards({ gameIDArray: earnedAchievementsIDs });

    //Update status widget
    this.statusPanel.updateProgress({ earnedAchievementIDs: earnedAchievementsIDs });

    //Update 
    // ui.userInfo.VISIBLE && setTimeout(() => ui.userInfo.update(), 2000);


    // ui.stats.updateStats();
    //Update Stats widget & UserInfo widget
    if (this.userInfo.VISIBLE || this.stats.VISIBLE) {
      setTimeout(async () => {
        const userSummary = await apiWorker.getUserSummary({ gamesCount: 3, achievesCount: 5 });
        ui.stats.updateStats({ currentUserSummary: userSummary });
        ui.userInfo.update({ userSummary: userSummary });

      }, 12000)
    }


    if (this.settings.DISCORD_NEW_CHEEVO) {
      earnedAchievementsIDs.forEach(id => this.sendDiscordMessage({ type: "earned-cheevo", id: id }));
    }
  }
  showContextmenu({ event, menuItems, sectionCode = "" }) {
    const setContextPosition = () => {
      this.contextMenu.style.left = event.x + "px";
      this.contextMenu.style.top = event.y + "px";

      (window.innerWidth - event.x < this.contextMenu.offsetWidth * 3) &&
        (this.contextMenu.classList.add("to-left"));
      (window.innerHeight - event.y < this.contextMenu.offsetHeight * 2)
        && (this.contextMenu.classList.add("to-top"));
    }

    event.preventDefault();
    event.stopPropagation();
    document.querySelector(".context-menu")?.remove();
    // this.contextMenu ? this.contextMenu.remove() : "";
    this.contextMenu = UI.generateContextMenu({
      menuItems: menuItems,
      sectionCode: sectionCode,
    });
    this.app.appendChild(this.contextMenu);

    setContextPosition();

    this.contextMenu.classList.remove("hidden");
  }
  createAchievementsTemplate() {
    if (this.achievementsBlock.length === 2) {
      UI.switchSectionVisibility(this.achievementsBlock[1]);
    } else {
      this.achievementsBlock.push(new AchievementsBlock(true));
      this.GAME_DATA && this.achievementsBlock.at(-1).parseGameAchievements(this.GAME_DATA);
    }
  }
  checkForNewAchieves(lastEarnedAchieves) {
    const updateAchievements = (earnedAchievements) => {
      earnedAchievements.forEach((lastAchievement) => {
        const { HardcoreMode, Date } = lastAchievement;
        const achievement = this.ACHIEVEMENTS[lastAchievement.AchievementID];
        if (HardcoreMode == 1) {
          achievement.isHardcoreEarned = true;
          achievement.DateEarnedHardcore = Date;
          this.GAME_DATA.earnedStats.hard.count++;
          this.GAME_DATA.earnedStats.hard.points += achievement.Points;
          this.GAME_DATA.earnedStats.hard.retropoints += achievement.TrueRatio;
          if (achievement.type == 'progression' || achievement.type == 'win_condition') {
            this.GAME_DATA.earnedStats.hard.progressionCount++;
          }
        }

        this.GAME_DATA.earnedStats.soft.count++;
        this.GAME_DATA.earnedStats.soft.points += achievement.Points;
        if (achievement.type == 'progression' || achievement.type == 'win_condition') {
          this.GAME_DATA.earnedStats.soft.progressionCount++;

          if (this.GAME_DATA.earnedStats.hard.progressionCount >= this.GAME_DATA.progressionSteps) {
            this.GAME_DATA.progressionAward = 'beaten';
          }
          else if (this.GAME_DATA.earnedStats.soft.progressionCount >= this.GAME_DATA.progressionSteps) {
            this.GAME_DATA.progressionAward = 'beaten-softcore';
          }
        }

        achievement.isEarned = true;
        achievement.DateEarned = achievement.DateEarned ?? Date;
        this.ACHIEVEMENTS[lastAchievement.AchievementID] = achievement;
      });
      this.userInfo.pushAchievements({ achievements: earnedAchievements });
      this.notifications.pushNotification({ type: this.notifications.types.earnedAchivs, elements: earnedAchievements });
    }
    let earnedAchievements = [];
    lastEarnedAchieves.forEach((lastAchievement) => {
      const achievement = this.ACHIEVEMENTS[lastAchievement.AchievementID];
      if (achievement) {
        const isHardcoreMismatch =
          lastAchievement.HardcoreMode === 1 && !achievement?.isHardcoreEarned;
        const isSoftCoreMismatch = !achievement.isEarned;
        if (isSoftCoreMismatch || isHardcoreMismatch) {
          earnedAchievements.push(lastAchievement);
        }
      }
    });
    updateAchievements(earnedAchievements);
    const achievementsIDs = earnedAchievements?.map((achievement) => achievement.AchievementID);

    this.updateWidgets({ earnedAchievementsIDs: achievementsIDs });
  }

  // Функція для отримання досягнень гри
  async getAchievements(gameID) {
    try {
      // Отримання інформації про прогрес гри від API
      const response = await apiWorker.getGameProgress({ gameID: gameID });

      this.GAME_DATA = response;
      this.statusPanel.watchButton.classList.remove("error");

    } catch (error) {
      // Додання помилки до кнопки перегляду та зупинка перегляду
      this.statusPanel.watchButton.classList.add("error");
      this.stopWatching();
      console.error(error);
    }
  }
  apiTrackerInterval;
  // Функція для оновлення досягнень
  async updateAchievements() {
    try {
      // Отримання недавніх досягнень від API
      const achievements = await apiWorker.getRecentAchieves({
        minutes: UI.RECENT_ACHIVES_RANGE_MINUTES,
      });

      this.checkForNewAchieves(achievements);

    } catch (error) {
      console.error(error); // Обробка помилок
    }
  }

  // Функція для початку слідкування за досягненнями
  startWatching() {
    // Оновлення стану та тексту кнопки слідкування
    this.statusPanel.watchButton.classList.add("active");

    // Отримання початкових досягнень
    ui.getAchievements();
    this.checkUpdates();
    if (this.target.AUTOCLEAR) {
      this.target.clearEarned();
    }
    (this.settings.DISCORD_START_SESSION || this.settings.DISCORD_NEW_GAME) && this.sendDiscordMessage({ type: "new-game" });
    // Встановлення інтервалу для оновлення досягнень та зміни стану кнопки
    this.apiTrackerInterval = setInterval(() => {
      this.checkUpdates();
    }, config.updateDelayInMiliSecs);
  }
  totalPoints = 0;
  softcorePoints = 0;
  async checkUpdates() {
    const responce = await apiWorker.getProfileInfo({});
    if (responce.LastGameID != config.gameID) {
      config.gameID = responce.LastGameID;
      ui.getAchievements().then(() =>
        this.userInfo.pushNewGame({ game: ui.GAME_DATA })
      );
    }
    if (
      responce.TotalPoints != this.totalPoints ||
      responce.TotalSoftcorePoints != this.softcorePoints
    ) {
      this.updateAchievements();
      this.totalPoints = responce.TotalPoints;
      this.softcorePoints = responce.TotalSoftcorePoints;
      this.userInfo.updatePoints({ points: responce });
    }

    this.statusPanel.richPresence.innerText = responce.RichPresenceMsg;

    const currentLevel = parseCurrentGameLevel(responce.RichPresenceMsg);

    if (currentLevel) {
      this.target.highlightCurrentLevel(currentLevel);
      this.achievementsBlock.forEach(widget =>
        widget.highlightCurrentLevel(currentLevel)
      )
    }

  }

  sendDiscordMessage = ({ message = "", type, id }) => {
    const webhook = config.DISCORD_WEBHOOK;
    if (!webhook) {
      return;
    }
    switch (type) {
      case "new-game":
        message = `[${config.targetUser} just started new game](https://retroachievements.org/game/${config.gameID})`;
        break;
      case "earned-cheevo":
        message = `[${config.targetUser} just earned new cheevo](https://retroachievements.org/achievement/${id})`;
        break;
    }
    fetch(webhook, {
      body: JSON.stringify({
        content: message,
      }),
      headers: {
        "Content-Type": "application/json",
      },
      method: "POST",
    })
      .then(function (res) {

      })
      .catch(function (res) {
        console.log(res);
      });
  }
  // Функція для зупинки слідкування за досягненнями
  stopWatching() {
    this.statusPanel.watchButton.classList.remove("active");
    clearInterval(ui.apiTrackerInterval);
  }

  static applySort({ container, itemClassName, sortMethod, reverse }) {
    const elements = [...container.querySelectorAll(itemClassName)];

    container.innerHTML = "";
    elements
      .sort((a, b) => sortMethod(a.dataset, b.dataset) * reverse)
      .forEach((element) => {
        container.appendChild(element);
      });
  }
  static applyFilter({
    container,
    itemClassName,
    filterMethod,
    reverse,
    isHide,
  }) {
    const elements = [...container.querySelectorAll(itemClassName)];
    elements.forEach((a) => {
      a.classList.remove("removed", "hidden");
      a.classList.toggle(
        isHide ? "removed" : "hidden",
        !filterMethod(a.dataset) ^ reverse
      );
    });
  }
  static generateContextMenu({
    menuItems,
    sectionCode = "",
    isSubmenu = false,
  }) {
    const contextElement = document.createElement("ul");
    isSubmenu
      ? contextElement.classList.add(
        "context-menu_item-menu",
        "context-submenu"
      )
      : contextElement.classList.add(
        "achievement_context-menu",
        "context-menu",
        "hidden"
      );
    // Проходимося по кожному елементу меню та генеруємо HTML
    menuItems.forEach((menuItem) => {
      const isExpandable = menuItem.hasOwnProperty("elements");
      let menuElement = document.createElement("li");
      menuElement.classList.add(
        "context-menu_item",
        isExpandable ? "expandable" : "f"
      );

      if (isExpandable) {
        menuElement.innerHTML += menuItem.label;
        menuElement.appendChild(
          UI.generateContextMenu({
            menuItems: menuItem.elements,
            isSubmenu: true,
            sectionCode: sectionCode,
          })
        );
      } else {
        switch (menuItem.type) {
          case "checkbox":
          case "radio":
            menuElement.innerHTML += `
            <input type="${menuItem.type}" name="${menuItem.name
              }${sectionCode}" id="${menuItem.id}${sectionCode}" 
             ${menuItem.checked == true ? "checked" : ""} ${menuItem.event ?? ""
              }></input>
            <label class="context-menu_${menuItem.type}" for="${menuItem.id
              }${sectionCode}">${menuItem.label}</label>
            `;
            break;
          case "input-number":
            menuElement.innerHTML += `
            ${menuItem.prefix}
            <input class="context-menu_${menuItem.type}" id="${menuItem.id
              }-${sectionCode}" type="number" title="${menuItem.title}" value="${menuItem.value ?? ""}" ${menuItem.event ?? ""
              } onclick="event.stopPropagation()">${menuItem.postfix ?? ""
              } </input>
            `;
            break;
          case "text-input":
            menuElement.innerHTML += `
              ${menuItem.prefix}
              <input class="context-menu_${menuItem.type}" id="${menuItem.id
              }-${sectionCode}"  ${menuItem.event ?? ""} title="${menuItem.title}" type="text" placeholder="${menuItem.placeholder ?? ""}"  onclick="event.stopPropagation()">${menuItem.postfix ?? ""
              }</input>
              `;
            break;
          case "range": menuElement.innerHTML += `
              ${menuItem.prefix}
              <input type="range"  ${menuItem.event ?? ""} min="${menuItem.minRange}" max="${menuItem.maxRange}" value="${menuItem.value}" class="slider" id="${menuItem.id
            }-${sectionCode}">
            `;
            break;
          case "button":
            menuElement.innerHTML += `
              <button class="context-menu_${menuItem.type}" id="${menuItem.id
              }-${sectionCode}" ${menuItem.event ?? ""} type="button">${menuItem.label ?? ""
              }</button>
              `;
            break;
          default:
            break;
        }
      }
      contextElement.appendChild(menuElement);
    });
    contextElement.addEventListener("contextmenu", (e) => e.stopPropagation());
    contextElement.addEventListener("mousedown", (e) => e.stopPropagation());

    //* for disable autoclose contextmenu
    if (!UI.AUTOCLOSE_CONTEXTMENU) {
      contextElement.addEventListener("click", (e) => e.stopPropagation());
    }

    return contextElement;
  }
  static updateColors(preset) {
    const { style } = document.body;
    const {
      mainColor,
      secondaryColor,
      accentColor,
      fontColor,
      selectionColor,
    } = config.getColors(preset || config.colorsPreset);
    style.setProperty("--main-color", mainColor);
    style.setProperty("--secondary-color", secondaryColor);
    style.setProperty("--accent-color", accentColor);
    style.setProperty("--font-color", fontColor);
    style.setProperty("--selection-color", selectionColor);
  }
  // Resizing func for widgets
  static resizeEvent({ event, section, callback }) {
    let resizeValues = {
      // Save start sizes
      startWidth: section.clientWidth,
      startHeight: section.clientHeight,

      // Save pointer position
      startX: event.clientX,
      startY: event.clientY,
    };
    const resizeHandler = (event) => {
      // Set new sizes for widget
      UI.setSize(event, resizeValues, section);
      // Call callback func if exist
      callback && callback();
    };
    // Add event for mouse move
    document.addEventListener("mousemove", resizeHandler);

    // Remove event 'mousemove' if stop resizing and save new sizes
    document.addEventListener("mouseup", () => {
      document.removeEventListener("mousemove", resizeHandler);
      section.classList.remove("resized");
      // Save new sizes to config file
      config.setNewPosition({
        id: section.id,
        width: section.clientWidth,
        height: section.clientHeight,
      });
    });
  }
  static setSize(event, resizeValues, section) {
    // Getting start sizes for widget
    const { startWidth, startHeight, startX, startY } = resizeValues;

    // Calculate delta sizes
    const widthChange = event.clientX - startX;
    const heightChange = event.clientY - startY;

    let width = startWidth + widthChange;
    let height = startHeight + heightChange;

    //Check for stick to another widgets
    let { newHeight, newWidth } = UI.stickResizingSection({
      width: width,
      height: height,
      stickySection: section,
    });

    // Set new sizes for widget
    section.style.width = `${newWidth}px`;
    section.style.height = `${newHeight}px`;
  }

  static stickResizingSection({ width, height, stickySection }) {
    const { offsetTop, offsetLeft } = stickySection;
    let newWidth = width;
    let newHeight = height;
    const TOLERANCE = 10;
    const MARGIN = 5;
    const conditions = [
      // bottom-bottom
      {
        check: (section) =>
          Math.abs(
            offsetTop + height - section.offsetTop - section.clientHeight
          ) < TOLERANCE,
        action: (section) =>
          (newHeight = section.offsetTop + section.clientHeight - offsetTop),
      },
      // bottom - top
      {
        check: (section) =>
          Math.abs(offsetTop + height - section.offsetTop) < TOLERANCE,
        action: (section) =>
          (newHeight = section.offsetTop - offsetTop - MARGIN),
      },
      // right - right
      {
        check: (section) =>
          Math.abs(
            offsetLeft + width - section.offsetLeft - section.clientWidth
          ) < TOLERANCE,
        action: (section) =>
          (newWidth = section.offsetLeft + section.clientWidth - offsetLeft),
      },
      // right - left
      {
        check: (section) =>
          Math.abs(offsetLeft + width - section.offsetLeft) < TOLERANCE,
        action: (section) =>
          (newWidth = section.offsetLeft - offsetLeft - MARGIN),
      },
    ];

    document.querySelectorAll(".section").forEach((section) => {
      if (stickySection != section) {
        conditions.forEach(({ check, action }) => check(section) && action(section));
      }
    });

    //Check for stick to window borders
    //Check for stick to right border
    newWidth =
      Math.abs(window.innerWidth - offsetLeft - newWidth) < TOLERANCE
        ? window.innerWidth - offsetLeft
        : newWidth;

    //Check for stick to bottom border
    newHeight =
      Math.abs(window.innerHeight - newHeight - offsetTop) < TOLERANCE
        ? window.innerHeight - offsetTop
        : newHeight;

    return { newWidth, newHeight };
  }
  static moveEvent(section, e) {
    document.querySelector("#background-animation").style.display = "none";
    section.classList.add("dragable");

    const rect = section.getBoundingClientRect(); // Отримуємо розміри та позицію вікна
    const offsetX = e.clientX - rect.left;
    const offsetY = e.clientY - rect.top;

    const handleMouseMove = (e) => UI.setPosition(e, offsetX, offsetY, section);

    const handleMouseUp = (e) => {
      section.classList.remove("dragable");
      ui.app.removeEventListener("mousemove", handleMouseMove);
      ui.app.removeEventListener("mouseup", handleMouseUp);
      section.removeEventListener("mouseleave", handleMouseUp);
      document.querySelector("#background-animation").style.display =
        config.bgVisibility ? "block" : "none";
      // Здійснюємо збереження позиції після закінчення перетягування
      config.setNewPosition({
        id: section.id,
        xPos: section.style.left,
        yPos: section.style.top,
      });

      e.preventDefault();
    };

    // Додаємо обробники подій
    ui.app.addEventListener("mousemove", handleMouseMove);
    ui.app.addEventListener("mouseup", handleMouseUp);
    // section.addEventListener("mouseleave", handleMouseUp);
  }
  static stickMovingSection({ x, y, stickySection }) {
    const { clientHeight, clientWidth } = stickySection;
    let newYPos = y;
    let newXPos = x;
    const TOLERANCE = 10;
    const MARGIN = 5;
    const conditions = [
      // bottom-bottom
      {
        check: (section) =>
          Math.abs(
            y + clientHeight - section.offsetTop - section.clientHeight
          ) < TOLERANCE,
        action: (section) =>
          (newYPos = section.offsetTop + section.clientHeight - clientHeight),
      },
      // top-top
      {
        check: (section) => Math.abs(y - section.offsetTop) < TOLERANCE,
        action: (section) => (newYPos = section.offsetTop),
      },
      // top - bottom
      {
        check: (section) =>
          Math.abs(y - section.offsetTop - section.clientHeight) < TOLERANCE,
        action: (section) =>
          (newYPos = section.offsetTop + section.clientHeight + MARGIN),
      },
      // bottom - top
      {
        check: (section) =>
          Math.abs(y + clientHeight - section.offsetTop) < TOLERANCE,
        action: (section) =>
          (newYPos = section.offsetTop - clientHeight - MARGIN),
      },
      // right - right
      {
        check: (section) =>
          Math.abs(x + clientWidth - section.offsetLeft - section.clientWidth) <
          TOLERANCE,
        action: (section) =>
          (newXPos = section.offsetLeft + section.clientWidth - clientWidth),
      },
      // left - left
      {
        check: (section) => Math.abs(x - section.offsetLeft) < TOLERANCE,
        action: (section) => (newXPos = section.offsetLeft),
      },
      // right - left
      {
        check: (section) =>
          Math.abs(x + clientWidth - section.offsetLeft) < TOLERANCE,
        action: (section) =>
          (newXPos = section.offsetLeft - clientWidth - MARGIN),
      },
      // left - right
      {
        check: (section) =>
          Math.abs(x - section.offsetLeft - section.clientWidth) < TOLERANCE,
        action: (section) =>
          (newXPos = section.offsetLeft + section.clientWidth + MARGIN),
      },
    ];

    document.querySelectorAll(".section").forEach((section) => {
      if (stickySection != section) {
        conditions.forEach(({ check, action }) => check(section) && action(section));
      }
    });
    newXPos =
      Math.abs(window.innerWidth - newXPos - clientWidth) < TOLERANCE
        ? window.innerWidth - clientWidth
        : newXPos;

    //Перевірка залипання до лівого краю
    newXPos = Math.abs(newXPos) < TOLERANCE ? 0 : newXPos;

    //Перевірка залипання до нижнього краю
    newYPos =
      Math.abs(window.innerHeight - newYPos - clientHeight) < TOLERANCE
        ? window.innerHeight - clientHeight
        : newYPos;

    //Перевірка залипання до верхнього краю
    newYPos = Math.abs(newYPos) < TOLERANCE ? 0 : newYPos;
    return { newXPos, newYPos };
  }
  static setPosition(e, offsetX, offsetY, section) {
    e.preventDefault();
    let XPos = e.clientX - offsetX;
    let YPos = e.clientY - offsetY;

    //Перевірка залипань до інших віджетів
    let { newXPos, newYPos } = UI.stickMovingSection({
      x: XPos,
      y: YPos,
      stickySection: section,
    });

    //Встановлення нових позицій
    section.style.left = newXPos + "px";
    section.style.top = newYPos + "px";
  }

  static addDraggingEventForElements(container, onDragEnd) {

  }
  static generateAchievementPopup(achievement) {
    let popup = document.createElement("div");
    popup.classList.add("achiv-details-block", "popup");
    const trueRatio = achievement.TrueRatio / achievement.Points;
    popup.innerHTML = `
      <h3 class="achievement__header">${achievement.Title} <p class="difficult-badge difficult-badge__${achievement.difficulty}">${achievement.difficulty}</p>
      </h3>
      <p>${achievement.Description}</p>
      <div class="points">
        <p><i class="target_description-icon  points-icon"></i>${achievement.Points}</p>
        <p><i class="target_description-icon  retropoints-icon"></i>${achievement.TrueRatio} </p> 
         <p class="target-description-text" title="true ratio">
          <i class="target_description-icon  ${trueRatio > 13 ? "difficult-badge__hell" : ""}  rarity-icon"></i>
          ${trueRatio.toFixed(2)}
        </p>
        <i class="target_description-icon ${achievement.type ?? "none"}"></i>            
      </div>
      ${achievement.DateEarnedHardcore
        ? "<p>Earned hardcore: " + achievement.DateEarnedHardcore + "</p>"
        : achievement.DateEarned
          ? "<p>Earned softcore: " + achievement.DateEarned + "</p>"
          : ""
      }
      <p>Earned by ${achievement.NumAwardedHardcore} (${achievement.NumAwarded}) of ${achievement.totalPlayers} players</p>
      <p>Earned rate: ${achievement.rateEarnedHardcore} (${achievement.rateEarned})</p>
      <p>Created : ${new Date(achievement.DateCreated).toLocaleDateString()} (${new Date(achievement.DateModified).toLocaleDateString()})</p>
      <p>Created by: ${achievement.Author}</p>
    `;
    return popup;
  }
  static switchSectionVisibility({ section }) {
    if (section.classList.contains("hidden")) {
      section.classList.remove("disposed");
      setTimeout(() => section.classList.remove("hidden"), 100);
      config.setNewPosition({
        id: section.id,
        hidden: false,
      })
    }
    else {
      section.classList.add("hidden")
      setTimeout(() => section.classList.add("disposed"), 300);
      config.setNewPosition({
        id: section.id,
        hidden: true,
      })
    }

  }
  static sortBy = {
    latest: (a, b) => {
      const toDate = (s) => {
        const [datePart, timePart] = s.split(', ');

        const [day, month, year] = datePart.split('.').map(Number);

        const [hours, minutes] = timePart.split(':').map(Number);

        return new Date(year, month - 1, day, hours, minutes);
      }

      const dateA = a.DateEarnedHardcore
        ? toDate(a.DateEarnedHardcore)
        : -Infinity;
      const dateB = b.DateEarnedHardcore
        ? toDate(b.DateEarnedHardcore)
        : -Infinity;
      return dateB - dateA; // Повертає різницю дат
    },
    date: (a, b) => {
      const dateA = a.Date
        ? new Date(a.Date)
        : -Infinity;
      const dateB = b.Date
        ? new Date(b.Date)
        : -Infinity;
      return dateA - dateB; // Повертає різницю дат
    },
    earnedCount: (a, b) => b.NumAwardedHardcore - a.NumAwardedHardcore,

    points: (a, b) => parseInt(a.Points) - parseInt(b.Points),

    truepoints: (a, b) => a.TrueRatio - b.TrueRatio,

    default: (a, b) => a.DisplayOrder != 0 ?
      a.DisplayOrder - b.DisplayOrder :
      a.achivId - b.achivId
    ,

    id: (a, b) => a.ID - b.ID,

    disable: (a, b) => 0,
    rating: (a, b) => b.Rating - a.Rating,
    achievementsCount: (a, b) => parseInt(a.NumAchievements) - parseInt(b.NumAchievements),

    title: (a, b) => {
      // const ignoredWords = ["~UNLICENSED~", "~DEMO~", "~HOMEBREW~", "~HACK~", "~PROTOTYPE~", ".HACK//", "~TEST", "KIT~"];

      // function removeIgnoredWords(title) {
      //   const regex = new RegExp(`(${ignoredWords.join('|')})`, 'gi');
      //   let fixedTitle = title.replace(regex, '').trim();
      //   return fixedTitle;
      // }

      let nameA = a.FixedTitle.toUpperCase();
      let nameB = b.FixedTitle.toUpperCase();

      if (nameA < nameB) {
        return -1;
      }
      if (nameA > nameB) {
        return 1;
      }
      return 0;

    },
    award: (b, a) => {
      const awardTypes = {
        'mastered': 5,
        'completed': 4,
        'beaten-hardcore': 3,
        'beaten-softcore': 2,
        'started': 1,
      }
      const awardA = awardTypes[a.Award] ?? 0;
      const awardB = awardTypes[b.Award] ?? 0;

      const awardADate = new Date(a.MostRecentAwardedDate);
      const awardBDate = new Date(b.MostRecentAwardedDate);

      return awardA - awardB != 0 ? awardA - awardB : awardADate - awardBDate;
    },
    level: (a, b) => {
      return a.level - b.level
    },
  }

  static filterBy = {
    earned: (achievement) => achievement.DateEarnedHardcore,
    notEarned: (achievement) => !achievement.DateEarnedHardcore,
    missable: (achievement) => achievement.type === "missable",
    progression: (achievement) => achievement.type === "progression" || achievement.type === "win_condition",
    all: () => true,
  };
  static filterMethods = {
    all: "all",
    earned: "earned",
    notEarned: "notEarned",
    missable: "missable",
    progression: "progression",
  };
  static sortMethods = {
    latest: "latest",
    earnedCount: "earnedCount",
    points: "points",
    truepoints: "truepoints",
    disable: "disable",
    id: "id",
    default: "default",
    achievementsCount: "achievementsCount",
    title: "title",
    award: "award",
    rating: "rating",
    date: "date",
    level: 'level',
  };
}

class AchievementsBlock {
  get VISIBLE() {
    return !this.section.classList.contains("hidden");
  }
  get contextMenuItems() {
    return [
      {
        label: "Style",
        elements: [

          {
            type: "checkbox",
            name: "context-show-mario",
            id: "context-show-mario",
            label: "Show Mario",
            checked: this.SHOW_MARIO,
            event: `onchange="ui.achievementsBlock[${this.CLONE_NUMBER}].SHOW_MARIO = this.checked"`,
          },
          {
            type: "checkbox",
            name: "context_autoscroll-achieves",
            id: "context_autoscroll-achieves",
            label: "Autoscroll",
            checked: this.AUTOSCROLL,
            event: `onchange="ui.achievementsBlock[${this.CLONE_NUMBER}].AUTOSCROLL = this.checked;"`,
          },
          {
            type: "checkbox",
            name: "context_autoscroll-achieves",
            id: "context_smart-autoscroll-achieves",
            label: "Smart autoscroll",
            checked: this.SMART_AUTOSCROLL,
            event: `onchange="ui.achievementsBlock[${this.CLONE_NUMBER}].SMART_AUTOSCROLL = this.checked;"`,
          },
          {
            type: "checkbox",
            name: "context_stretch-achieves",
            id: "context_stretch-achieves",
            label: "Stretch",
            checked: this.ACHIV_STRETCH,
            event: `onchange="ui.achievementsBlock[${this.CLONE_NUMBER}].ACHIV_STRETCH = this.checked;"`,
          },
          {
            prefix: "Min size",
            postfix: "px",
            type: "input-number",
            id: "context-menu_min-size",
            label: "Min size",
            value: this.ACHIV_MIN_SIZE,
            event: `onchange="ui.achievementsBlock[${this.CLONE_NUMBER}].ACHIV_MIN_SIZE = this.value;"`,
          },
          {
            prefix: "Max size",
            postfix: "px",
            type: "input-number",
            id: "context-menu_max-size",
            label: "Max size",
            value: this.ACHIV_MAX_SIZE,
            event: `onchange="ui.achievementsBlock[${this.CLONE_NUMBER}].ACHIV_MAX_SIZE = this.value;"`,
          },

        ]
      },
      {
        label: "Overlay set",
        elements: [
          {
            type: "checkbox",
            name: "context-hide-unearned",
            id: "context-hide-unearned",
            label: "Show overlay",
            checked: this.SHOW_PREV_OVERLAY,
            event: `onchange="ui.achievementsBlock[${this.CLONE_NUMBER}].SHOW_PREV_OVERLAY = this.checked"`,
          },
          ...Object.keys(this.overlayTypes).reduce((items, overlayType) => {
            const item = {
              type: "radio",
              name: "context-achieves-overlay",
              id: `context-achieves-overlay-${overlayType}`,
              label: `${this.overlayTypes[overlayType].name}`,
              checked: this.OVERLAY_TYPE == overlayType,
              event: `onchange="ui.achievementsBlock[${this.CLONE_NUMBER}].OVERLAY_TYPE = '${overlayType}'"`,
            }
            items.push(item);
            return items;
          }, []),
        ]
      },
      {
        label: "Sort",
        elements: [
          {
            type: "radio",
            name: "context-sort",
            id: "context-sort_latest",
            label: "Latest",
            checked: this.SORT_NAME === UI.sortMethods.latest,
            event: `onchange="ui.achievementsBlock[${this.CLONE_NUMBER}].SORT_NAME = 'latest';"`,
          },
          {
            type: "radio",
            name: "context-sort",
            id: "context-sort_rarest",
            label: "Rarest",
            checked: this.SORT_NAME === UI.sortMethods.earnedCount,
            event: `onchange="ui.achievementsBlock[${this.CLONE_NUMBER}].SORT_NAME = 'earnedCount';"`,
          },
          {
            type: "radio",
            name: "context-sort",
            id: "context-sort_points",
            label: "Points",
            checked: this.SORT_NAME === UI.sortMethods.points,
            event: `onchange="ui.achievementsBlock[${this.CLONE_NUMBER}].SORT_NAME = 'points';"`,
          },
          {
            type: "radio",
            name: "context-sort",
            id: "context-sort_retropoints",
            label: "Retropoints",
            checked: this.SORT_NAME === UI.sortMethods.truepoints,
            event: `onchange="ui.achievementsBlock[${this.CLONE_NUMBER}].SORT_NAME = 'truepoints';"`,
          },
          {
            type: "radio",
            name: "context-sort",
            id: "context-sort_default",
            label: "Default",
            checked: this.SORT_NAME === UI.sortMethods.default,
            event: `onchange="ui.achievementsBlock[${this.CLONE_NUMBER}].SORT_NAME = 'default';"`,
          },
          {
            type: "radio",
            name: "context-sort",
            id: "context-sort_level",
            label: "Level(if possible)",
            checked: this.SORT_NAME === UI.sortMethods.level,
            event: `onchange="ui.achievementsBlock[${this.CLONE_NUMBER}].SORT_NAME = 'level';"`,
          },
          {
            type: "radio",
            name: "context-sort",
            id: "context-sort_disable",
            label: "Disable",
            checked: this.SORT_NAME === UI.sortMethods.disable,
            event: `onchange="ui.achievementsBlock[${this.CLONE_NUMBER}].SORT_NAME = 'disable';"`,
          },
          {
            type: "checkbox",
            name: "context-reverse-sort",
            id: "context-reverse-sort",
            label: "Reverse",
            checked: this.REVERSE_SORT == -1,
            event: `onchange="ui.achievementsBlock[${this.CLONE_NUMBER}].REVERSE_SORT = this.checked"`,
          },
        ],
      },
      {
        label: "Filter",
        elements: [
          {
            type: "radio",
            name: "context-filter",
            id: "context_filter-progression",
            label: "Progression",
            checked: this.FILTER_NAME === UI.filterMethods.progression,
            event: `onchange="ui.achievementsBlock[${this.CLONE_NUMBER}].FILTER_NAME = 'progression';"`,
          },
          {
            type: "radio",
            name: "context-filter",
            id: "context_filter-missable",
            label: "Missable",
            checked: this.FILTER_NAME === UI.filterMethods.missable,
            event: `onchange="ui.achievementsBlock[${this.CLONE_NUMBER}].FILTER_NAME = 'missable';"`,
          },
          {
            type: "radio",
            name: "context-filter",
            id: "context_filter-earned",
            label: "Earned",
            checked: this.FILTER_NAME === UI.filterMethods.earned,
            event: `onchange="ui.achievementsBlock[${this.CLONE_NUMBER}].FILTER_NAME = 'earned';"`,
          },
          {
            type: "radio",
            name: "context-filter",
            id: "context_filter-all",
            label: "All",
            checked: this.FILTER_NAME === UI.filterMethods.all,
            event: `onchange="ui.achievementsBlock[${this.CLONE_NUMBER}].FILTER_NAME = 'all';"`,
          },
          {
            type: "checkbox",
            name: "context-reverse-filter",
            id: "context-reverse-filter",
            label: "Reverse",
            checked: this.REVERSE_FILTER,
            event: `onchange="ui.achievementsBlock[${this.CLONE_NUMBER}].REVERSE_FILTER = this.checked;"`,
          },
          {
            type: "checkbox",
            name: "context-hide-filtered",
            id: "context-hide-filtered",
            label: "Hide filtered",
            checked: this.HIDE_FILTERED,
            event: `onchange="ui.achievementsBlock[${this.CLONE_NUMBER}].HIDE_FILTERED = this.checked;"`,
          },
        ],
      },
      {
        label: "Elements",
        elements: [
          {
            label: "Show header",
            type: "checkbox",
            name: "context_hide-achivs-header",
            id: "context_hide-achivs-header",
            checked: this.SHOW_HEADER,
            event: `onchange="ui.achievementsBlock[${this.CLONE_NUMBER}].SHOW_HEADER = this.checked;"`,
          },
          {
            label: "Show background",
            type: "checkbox",
            name: "context_show-bg",
            id: "context_show-bg",
            checked: this.BG_VISIBILITY,
            event: `onchange="ui.achievementsBlock[${this.CLONE_NUMBER}].BG_VISIBILITY = this.checked;"`,
          },]
      }

    ];
  }
  get OVERLAY_TYPE() {
    return config?.ui[this.SECTION_NAME]?.overlayType ?? 'border';
  }
  set OVERLAY_TYPE(value) {
    config.ui[this.SECTION_NAME].overlayType = value;
    config.writeConfiguration();
    this.updateOverlay();
  }
  overlayTypes = {
    border: {
      name: "Border",
      link: "../assets/img/border/overlay_sets/",
      closedLink: "../assets/img/overlay_sets/border/closed-1.png",
      earnedSoftcoreLink: "../assets/img/overlay_sets/border/earned_soft.png",
      earnedHardcoreLink: "../assets/img/overlay_sets/border/earned.png",
    },
    digger: {
      name: "Digger",
    },
    mario_q: {
      name: "Mario '?'",
      link: "../assets/img/mario_q/overlay_sets/",
      closedLink: "../assets/img/overlay_sets/mario_q/closed.webp",
      earnedSoftcoreLink: "../assets/img/overlay_sets/mario_q/earned_soft.webp",
      earnedHardcoreLink: "../assets/img/overlay_sets/mario_q/earned.webp",
    },
    cd_box: {
      name: "C&D Box",
      link: "../assets/img/cd_box/",
      closedLink: "../assets/img/overlay_sets/cd_box/closed.png",
      earnedSoftcoreLink: "../assets/img/overlay_sets/cd_box/earned_soft.png",
      earnedHardcoreLink: "../assets/img/overlay_sets/cd_box/earned.png",
    },
    kirby: {
      name: "Kirby",
      link: "../assets/img/kirby/",
      closedLink: "../assets/img/overlay_sets/kirby/closed.png",
      earnedSoftcoreLink: "../assets/img/overlay_sets/kirby/earned_soft.png",
      earnedHardcoreLink: "../assets/img/overlay_sets/kirby/earned.png",
    },
    megaman: {
      name: "Megaman",
      link: "../assets/img/megaman/",
      closedLink: "../assets/img/overlay_sets/megaman/closed.png",
      earnedSoftcoreLink: "../assets/img/overlay_sets/megaman/earned_soft.png",
      earnedHardcoreLink: "../assets/img/overlay_sets/megaman/earned.png",
    },
    sonic: {
      name: "Sonic",
      link: "../assets/img/sonic/",
      closedLink: "../assets/img/overlay_sets/sonic/closed.png",
      earnedSoftcoreLink: "../assets/img/overlay_sets/sonic/earned_soft.png",
      earnedHardcoreLink: "../assets/img/overlay_sets/sonic/earned.png",
    }
  }
  set SORT_NAME(value) {
    config._cfg.ui[this.SECTION_NAME].sortAchievementsBy = value;
    config.writeConfiguration();
    this.applySorting();
  }
  get SORT_NAME() {
    return (
      config?.ui[this.SECTION_NAME]?.sortAchievementsBy ||
      UI.sortMethods.default
    );
  }
  get SORT_METHOD() {
    return UI.sortBy[this.SORT_NAME];
  }
  set FILTER_NAME(value) {
    config.ui[this.SECTION_NAME].filterBy = value;
    config.writeConfiguration();
    this.applyFilter();
  }
  get FILTER_NAME() {
    return config?.ui[this.SECTION_NAME]?.filterBy || UI.filterMethods.all;
  }
  get FILTER_METHOD() {
    return UI.filterBy[this.FILTER_NAME];
  }
  get HIDE_FILTERED() {
    return config?.ui[this.SECTION_NAME]?.hideFiltered ?? false;
  }
  set HIDE_FILTERED(value) {
    config.ui[this.SECTION_NAME].hideFiltered = value;
    config.writeConfiguration();
    this.applyFilter();
  }
  get REVERSE_SORT() {
    return config?.ui[this.SECTION_NAME]?.reverseSort || 1;
  }
  set REVERSE_SORT(value) {
    config.ui[this.SECTION_NAME].reverseSort = value ? -1 : 1;
    config.writeConfiguration();
    this.applySorting();
  }
  get REVERSE_FILTER() {
    return config?.ui[this.SECTION_NAME]?.reverseFilter ?? false;
  }
  set REVERSE_FILTER(value) {
    config.ui[this.SECTION_NAME].reverseFilter = value;
    config.writeConfiguration();
    this.applyFilter();
  }
  get ACHIV_MIN_SIZE() {
    return config?.ui[this.SECTION_NAME]?.ACHIV_MIN_SIZE ?? 30;
  }
  set ACHIV_MIN_SIZE(value) {
    if (+value > 10) {
      config.ui[this.SECTION_NAME].ACHIV_MIN_SIZE = value;
      config.writeConfiguration();
      this.fitSizeVertically();
    }
  }
  get ACHIV_MAX_SIZE() {
    return config?.ui[this.SECTION_NAME]?.ACHIV_MAX_SIZE ?? 150;
  }
  set ACHIV_MAX_SIZE(value) {
    if (+value > +this.ACHIV_MIN_SIZE) {
      config.ui[this.SECTION_NAME].ACHIV_MAX_SIZE = value;
      config.writeConfiguration();
      this.fitSizeVertically();
    }
  }
  get ACHIV_STRETCH() {
    return config?.ui[this.SECTION_NAME]?.stretchAchievements ?? false;
  }
  set ACHIV_STRETCH(value) {
    config.ui[this.SECTION_NAME].stretchAchievements = value;
    config.writeConfiguration();
    this.container.style.height = this.ACHIV_STRETCH ? "100%" : "auto";
  }
  get BG_VISIBILITY() {
    return config?.ui[this.SECTION_NAME]?.bgVisibility ?? true;
  }
  set BG_VISIBILITY(value) {
    config.ui[this.SECTION_NAME].bgVisibility = value;
    config.writeConfiguration();
    this.section.classList.toggle("hide-bg", !this.BG_VISIBILITY);
  }
  get SHOW_HEADER() {
    return config?.ui[this.SECTION_NAME]?.showHeader ?? true;
  }
  set SHOW_HEADER(value) {
    config.ui[this.SECTION_NAME].showHeader = value;
    config.writeConfiguration();
    this.section.classList.toggle("compact", !this.SHOW_HEADER);
  }
  get AUTOSCROLL() {
    return config?.ui[this.SECTION_NAME]?.autoscroll ?? true;
  }
  set AUTOSCROLL(value) {
    config.ui[this.SECTION_NAME].autoscroll = value;
    value ? this.startAutoScroll() : this.stopAutoScroll();
  }
  get SMART_AUTOSCROLL() {
    return config?.ui[this.SECTION_NAME]?.smartAutoscroll ?? false;
  }
  set SMART_AUTOSCROLL(value) {
    config.ui[this.SECTION_NAME].smartAutoscroll = value;
    this.stopAutoScroll();
    this.startAutoScroll();
  }
  get SHOW_PREV_OVERLAY() {
    return config.ui[this.SECTION_NAME]?.showPrevOverlay ?? true;
  }
  set SHOW_PREV_OVERLAY(value) {
    config.ui[this.SECTION_NAME].showPrevOverlay = value;
    config.writeConfiguration();
    this.container.querySelectorAll(".achiv-block").forEach(el => el.classList.toggle("overlay", value));
  }
  get SHOW_MARIO() {
    return config.ui[this.SECTION_NAME]?.showMario ?? true;
  }
  set SHOW_MARIO(value) {
    config.ui[this.SECTION_NAME].showMario = value;
    config.writeConfiguration();
  }
  get SECTION_NAME() {
    if (this.CLONE_NUMBER === 0) {
      return `achievements_section`;
    } else {
      return `achievements_section-${this.CLONE_NUMBER}`;
    }
  }
  get CLONE_NUMBER() {
    return this._cloneNumber;
  }
  set CLONE_NUMBER(widget) {
    if (widget?.length) {
      this._cloneNumber = widget.length;
    } else return (this._cloneNumber = 0);
  }

  constructor(isClone = false) {
    this.CLONE_NUMBER = ui.achievementsBlock;
    this.isClone = isClone;
    this.initializeElements();
    this.addEvents();
    this.setValues();
  }

  initializeElements() {
    this.section = this.generateNewWidget({}); // Секція блока досягнень
    document.querySelector(".wrapper").appendChild(this.section);

    this.container = this.section.querySelector(`.achievements-container`); //Контейнер  з досягненнями
    this.resizer = this.section.querySelector(
      `#achivs-resizer${this.CLONE_NUMBER}`
    ); // Ресайзер блока досягнень
  }
  addEvents() {
    // Додавання подій для пересування вікна ачівментсів
    this.section.querySelector(".header-container").addEventListener("mousedown", (event) => {
      UI.moveEvent(this.section, event);
    });
    this.section.addEventListener("contextmenu", (event) => {
      ui.showContextmenu({
        event: event,
        menuItems: this.contextMenuItems,
        sectionCode: this.CLONE_NUMBER,
      });
    });

    this.resizer.addEventListener("mousedown", (event) => {
      event.stopPropagation();
      this.section.classList.add("resized");
      this.stopAutoScroll();
      UI.resizeEvent({
        event: event,
        section: this.section,
        callback: () => {
          this.fitSizeVertically(true);
        },
      });
    });
    this.resizer.addEventListener("mouseup", () => {
      this.startAutoScroll();
    });
    new Sortable(this.container, {
      group: {
        name: "cheevos", pull: "clone", push: "false",
      },
      animation: 100,
      chosenClass: "dragged",
    });
  }
  setValues() {
    this.section.classList.toggle("hide-bg", !this.BG_VISIBILITY);
    this.section.classList.toggle("compact", !this.SHOW_HEADER);
    if (config.ui[this.SECTION_NAME]) {
      this.section.style.top = config.ui[this.SECTION_NAME].y ?? "0px";
      this.section.style.left = config.ui[this.SECTION_NAME].x ?? "0px";
      this.section.style.height =
        config.ui[this.SECTION_NAME].height ?? "600px";
      this.section.style.width = config.ui[this.SECTION_NAME].width ?? "350px";
    }
    this.container.style.height = this.ACHIV_STRETCH ? "100%" : "auto";
    if (this.AUTOSCROLL) {
      this.startAutoScroll();
    }
    this.updateOverlay();
  }
  updateOverlay() {
    this.section.dataset.overlay = this.OVERLAY_TYPE;
    // this.section.style.setProperty('--overlay-closed', `url(${this.overlayTypes[this.OVERLAY_TYPE].closedLink})`);
    // this.section.style.setProperty('--overlay-earned', `url(${this.overlayTypes[this.OVERLAY_TYPE].earnedHardcoreLink})`);
    // this.section.style.setProperty('--overlay-earned-soft', `url(${this.overlayTypes[this.OVERLAY_TYPE].earnedSoftcoreLink})`);
  }

  // Розбирає отримані досягнення гри та відображає їх на сторінці
  parseGameAchievements(achivs) {
    const clearAchievementsSection = () => {
      this.container.innerHTML = "";
    }
    const addAchievementsToContainer = (achievementsObject) => {
      Object.values(achievementsObject.Achievements).forEach((achievement) => {
        const achivElement = this.generateAchievement(achievement);
        this.container.appendChild(achivElement);
      });
    }
    // Очистити вміст розділу досягнень
    clearAchievementsSection();

    // Відсортувати досягнення та відобразити їх
    addAchievementsToContainer(achivs);

    // Підгонка розміру досягнень
    this.fitSizeVertically();

    this.applyFilter();
    this.applySorting();
    this.startAutoScroll();
  }

  generateAchievement(achievement) {
    //------- Achievement-----------
    function setClasses(widget) {
      achivElement.classList.add("achiv-block");
      achivElement.classList.toggle("overlay", widget.SHOW_PREV_OVERLAY);
      achivElement.classList.toggle("earned", achievement.isEarned);
      achivElement.classList.toggle("hardcore", achievement.isHardcoreEarned);
    }
    function setData() {
      achivElement.dataset.achivId = achievement.ID;
      achivElement.dataset.Points = achievement.Points;
      achivElement.dataset.TrueRatio = achievement.TrueRatio;
      achievement.TrueRatio > 50 && (achivElement.dataset.rarity = "normal");
      achievement.TrueRatio > 150 && (achivElement.dataset.rarity = "rare");
      achievement.TrueRatio > 300 && (achivElement.dataset.rarity = "mythycal");
      achivElement.dataset.DisplayOrder = achievement.DisplayOrder;
      achivElement.dataset.type = achievement.type;
      achivElement.dataset.level = achievement.level;

      achivElement.dataset.NumAwardedHardcore = achievement.NumAwardedHardcore;
      achievement.DateEarnedHardcore && (achivElement.dataset.DateEarnedHardcore = achievement.DateEarnedHardcore);

    }
    function setHtmlCode() {
      achivElement.innerHTML = `
      <div class="preview-container">
        <img class="achiv-preview" src="${achievement.prevSrc}"/>
      </div>
      <button class="add-to-target" onclick="ui.target.addAchieveToTarget(${achievement.ID})">
        <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 -960 960 960" width="24">
          <path d="M440-280h80v-160h160v-80H520v-160h-80v160H280v80h160v160Zm40 200q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-80q134 0 227-93t93-227q0-134-93-227t-227-93q-134 0-227 93t-93 227q0 134 93 227t227 93Zm0-320Z"/>
        </svg>
      </button>
      `;
    }
    function setEvents() {
      achivElement.addEventListener("mouseover", mouseOverEvent);
      achivElement.addEventListener("mouseleave", removePopups);
      achivElement.addEventListener("mousedown", (e) => {
        e.stopPropagation();
      });

    }
    //------- Popup-----------
    function setPopupPosition(popup, achivElement) {
      //Start position relative achievement element
      const rect = achivElement.getBoundingClientRect();
      const leftPos = rect.left + achivElement.offsetWidth + 8;
      const topPos = rect.top + 2;

      popup.style.left = leftPos + "px";
      popup.style.top = topPos + "px";

      //Check for collisions and fix position
      let { left, right, top, bottom } = popup.getBoundingClientRect();
      if (left < 0) {
        popup.classList.remove("left-side");
      }
      if (right > window.innerWidth) {
        popup.classList.add("left-side");
      }
      if (top < 0) {
        popup.classList.remove("top-side");
      } else if (bottom > window.innerHeight) {
        popup.classList.add("top-side");
      }
    }
    function mouseOverEvent() {
      removePopups();

      const popup = UI.generateAchievementPopup(achievement);
      ui.app.appendChild(popup);

      setPopupPosition(popup, achivElement);
      setTimeout(() => popup.classList.add("visible"), 333);
    }
    function removePopups() {
      document.querySelectorAll(".popup").forEach((popup) => popup.remove());
    }

    const achivElement = document.createElement("li");
    setClasses(this);
    setData();
    setHtmlCode();
    setEvents();

    return achivElement;
  }

  moveToTop(element) {
    if (this.REVERSE_SORT == 1) {
      this.container.prepend(element);
    } else {
      this.container.append(element);
    }
    this.applyFilter();
  }
  // Автопідбір розміру значків ачівментсів
  fitSizeVertically(isLoadDynamic = false) {
    // Отримання посилання на блок досягнень та його дочірні елементи
    const { section, container } = this;
    // Отримання розмірів вікна блоку досягнень
    let windowHeight, windowWidth;
    container.style.flex = "1";
    if (isLoadDynamic || !config.ui[this.SECTION_NAME]?.height) {
      windowHeight = container.clientHeight;
      windowWidth = container.clientWidth;
    } else {
      windowHeight = parseInt(config.ui[this.SECTION_NAME].height) - section.querySelector(".header-container").clientHeight;
      windowWidth = parseInt(config.ui[this.SECTION_NAME].width);
    }
    container.style.flex = "";
    const achivs = Array.from(container.children);
    const achivsCount = achivs.length;
    // Перевірка, чи є елементи в блоці досягнень
    if (achivsCount === 0) return;
    // Початкова ширина досягнення для розрахунку
    let achivWidth = Math.floor(
      Math.sqrt((windowWidth * windowHeight) / achivsCount)
    );

    let rowsCount, colsCount;
    // Цикл для знаходження оптимального розміру досягнень
    do {
      achivWidth--;
      rowsCount = Math.floor(windowHeight / (achivWidth + 1));
      colsCount = Math.floor(windowWidth / (achivWidth + 1));
    } while (
      rowsCount * colsCount < achivsCount &&
      achivWidth > this.ACHIV_MIN_SIZE
    );
    achivWidth =
      achivWidth < this.ACHIV_MIN_SIZE
        ? this.ACHIV_MIN_SIZE
        : achivWidth > this.ACHIV_MAX_SIZE
          ? this.ACHIV_MAX_SIZE
          : achivWidth;
    this.section.style.setProperty("--achiv-height", achivWidth + "px");
  }
  autoscrollInterval = {};
  async updateEarnedAchieves({ earnedAchievementIDs }) {
    await delay(500);
    this.stopAutoScroll();
    for (let id of earnedAchievementIDs) {
      const earnedAchivElement = this.container.querySelector(`.achiv-block[data-achiv-id="${id}"]`);
      if (!this.SHOW_MARIO || !this.isAchieveVisible(earnedAchivElement) || !ui.ACHIEVEMENTS[id].isHardcoreEarned) {
        earnedAchivElement.classList.add("earned", ui.ACHIEVEMENTS[id].isHardcoreEarned ? "hardcore" : "f");
      }
      else {
        await this.marioAction(earnedAchivElement);
      }
      ui.ACHIEVEMENTS[id].DateEarnedHardcore && (earnedAchivElement.dataset.DateEarnedHardcore = ui.ACHIEVEMENTS[id].DateEarnedHardcore);
    };
    this.applyFilter();
    this.SORT_NAME == UI.sortMethods.latest && this.applySorting();
    this.startAutoScroll();
  }
  async marioAction(targetElement) {
    const mario = document.createElement("div");
    mario.classList.add("mario__container", "stand");
    this.container.appendChild(mario);

    const marioSize = mario.getBoundingClientRect().width;
    const targetElementDimensions = targetElement?.getBoundingClientRect();
    const targetPos = {
      xPos: targetElementDimensions.left,
      yPos: targetElementDimensions.top + marioSize,
    }
    const jumpHeight = marioSize * 2;
    const toLeft = targetElementDimensions.left > window.innerWidth / 2;
    const startPos = {
      xPos: toLeft ? window.innerWidth + marioSize : - marioSize,
      yPos: targetPos.yPos + jumpHeight,
    }
    const frameDuration = 70;
    const g = 10;
    let dx = 20;
    let dy = Math.sqrt(2 * g * jumpHeight);

    mario.style.top = startPos.yPos + 'px';
    mario.style.left = startPos.xPos + 'px';


    const walkToTarget = async () => {
      let XPos = startPos.xPos;

      mario.classList.remove("stand");
      mario.classList.add("walk");
      mario.classList.toggle("to-left", toLeft)
      mario.style.setProperty('--frame-duration', `${frameDuration}ms`);

      while (XPos !== targetPos.xPos) {
        if (toLeft) {
          XPos -= dx;
          XPos < targetPos.xPos && (XPos = targetPos.xPos);
        }
        else {
          XPos += dx;
          XPos > targetPos.xPos && (XPos = targetPos.xPos);
        }
        mario.style.left = XPos + 'px';
        await delay(frameDuration);
      }
      mario.classList.remove("walk");
      mario.classList.add("stand");
      await delay(500);
    }
    const jump = async () => {
      mario.classList.remove("stand");
      mario.classList.add("jump");
      let YPos = startPos.yPos;
      while (~~dy > 0) {
        YPos -= dy;
        dy -= g;
        if (YPos < targetPos.yPos) {
          YPos = targetPos.yPos - 2;
          mario.style.top = YPos + 'px';
        }
        else {
          mario.style.top = YPos + 'px';
          await delay(frameDuration);
        }
      }
      collisionWithTarget();
      dy = 0;
      while (YPos < startPos.yPos) {
        YPos += dy;
        dy += g;
        YPos > startPos.yPos && (YPos = startPos.yPos);
        mario.style.top = YPos + 'px';
        await delay(frameDuration);
      }
      mario.classList.remove("jump");
      mario.classList.add("stand");
      await delay(500);
      mario.classList.toggle("to-left", !toLeft);
      await delay(500);
    }
    const collisionWithTarget = () => {
      const coin = document.createElement("div");
      coin.classList.add("coin__container");
      coin.innerHTML = `
      <div class='coins__points'>+${targetElement.dataset.TrueRatio}RP</div>
      <div class='coins__coin'></div>
      `;
      this.container.appendChild(coin);
      coin.style.top = targetElementDimensions.top - targetElementDimensions.height / 2 + "px";
      coin.style.left = targetPos.xPos + "px";
      targetElement?.classList.add("earned", "hardcore", "mario-dumb");
      setTimeout(() => targetElement?.classList.remove("mario-dumb"), 500);
      setTimeout(() => coin.remove(), 5000);
    }
    const walkAway = async () => {
      let XPos = mario.getBoundingClientRect().left;
      mario.style.setProperty('--frame-duration', `${frameDuration * 0.75}ms`);
      mario.className = `mario__container walk ${!toLeft ? 'to-left' : ''} `;
      while (XPos !== startPos.xPos) {
        if (toLeft) {
          XPos += dx;
          XPos > startPos.xPos && (XPos = startPos.xPos)
        }
        else {
          XPos -= dx;
          XPos < startPos.xPos && (XPos = startPos.xPos)
        }
        mario.style.left = XPos + 'px';
        await delay(frameDuration * 0.75);
      }
    }

    await walkToTarget();
    await jump();
    await walkAway();

    mario.remove();
    await delay(100);
    return;
  }

  startAutoScroll(toBottom = true) {
    clearTimeout(this.autoscrollInterval.timeout);
    clearInterval(this.autoscrollInterval.interval);
    if (this.SMART_AUTOSCROLL && this.isAllEarnedAchievesVisible()) {
      this.autoscrollInterval.timeout = setTimeout(() => this.startAutoScroll(toBottom), 30 * 1000);
      return;
    }
    let refreshRateMiliSecs = 50;

    let scrollContainer = this.container;
    let speedInPixels = 1;
    const pauseOnEndMilisecs = 5000;
    // Часовий інтервал для прокручування вниз
    if (this.AUTOSCROLL) {
      this.autoscrollInterval.interval = setInterval(() => {
        if (scrollContainer.scrollHeight - scrollContainer.clientHeight <= 10) {
          this.stopAutoScroll();
        }
        if (toBottom) {
          scrollContainer.scrollTop += speedInPixels;
          if (
            scrollContainer.scrollTop + scrollContainer.clientHeight >=
            scrollContainer.scrollHeight
          ) {
            clearInterval(this.autoscrollInterval.interval);
            this.autoscrollInterval.timeout = setTimeout(() => this.startAutoScroll(false), pauseOnEndMilisecs);
          }
        } else {
          scrollContainer.scrollTop -= speedInPixels;
          if (scrollContainer.scrollTop === 0) {
            clearInterval(this.autoscrollInterval.interval);
            this.autoscrollInterval.timeout = setTimeout(() => this.startAutoScroll(true), pauseOnEndMilisecs);
          }
        }
      }, refreshRateMiliSecs);
      // Припиняємо прокручування при наведенні миші на контейнер
      scrollContainer.addEventListener("mouseenter", () => {
        speedInPixels = 0; // Зупиняємо інтервал прокрутки
      });

      // Відновлюємо прокрутку при відведенні миші від контейнера
      scrollContainer.addEventListener("mouseleave", () => {
        speedInPixels = 1;
      });
    }
  }
  stopAutoScroll() {
    clearInterval(this.autoscrollInterval.interval);
    clearTimeout(this.autoscrollInterval.timeout);
  }
  isAllEarnedAchievesVisible() {
    let isVisible = true;

    this.container.querySelectorAll(".earned").forEach(achiv => {
      !this.isAchieveVisible(achiv) && (isVisible = false);
    })
    return isVisible;
  }
  isAchieveVisible(achiv) {
    let isVisible = true;

    const top = this.container.getBoundingClientRect().top;
    const height = this.container.getBoundingClientRect().height;

    const achivTopPos = achiv.getBoundingClientRect().top - top;
    const achivBottomPos = achiv.getBoundingClientRect().top - top + achiv.getBoundingClientRect().height;
    if (achivTopPos < 0 || achivBottomPos > height) {
      isVisible = false;
    }
    return isVisible;
  }
  highlightCurrentLevel(currentLevel) {
    [...this.container.querySelectorAll(".achiv-block")].forEach(cheevo => {
      cheevo.classList.remove("highlight");

      cheevo.dataset.level == currentLevel && cheevo.classList.add("highlight");

      if (!Number.isInteger(currentLevel)) {
        const mainLevel = parseInt(currentLevel);
        cheevo.dataset.level == mainLevel && cheevo.classList.add("highlight");
      }


    })
  }
  applySorting() {
    UI.applySort({
      container: this.container,
      itemClassName: ".achiv-block",
      sortMethod: this.SORT_METHOD,
      reverse: this.REVERSE_SORT,
    });
  }
  applyFilter() {
    UI.applyFilter({
      container: this.container,
      itemClassName: ".achiv-block",
      filterMethod: this.FILTER_METHOD,
      reverse: this.REVERSE_FILTER,
      isHide: this.HIDE_FILTERED,
    });
  }
  close() {
    this.CLONE_NUMBER === 0
      ? ui.buttons.achievements.click()
      : UI.switchSectionVisibility(ui.achievementsBlock[this.CLONE_NUMBER]);
  }

  generateNewWidget({ }) {
    const newWidget = document.createElement("section");
    newWidget.id = `${this.SECTION_NAME}`;
    newWidget.classList.add("achivs", "section");
    newWidget.style.width = config.ui.achievements_section?.width ?? 350 + "px";
    newWidget.style.height =
      config.ui.achievements_section?.height ?? 650 + "px";
    newWidget.innerHTML = `
      <div class="header-container achievements-header_container">
        <div class="header-icon"><svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 -960 960 960" width="24">
            <path
              d="m668-380 152-130 120 10-176 153 52 227-102-62-46-198Zm-94-292-42-98 46-110 92 217-96-9ZM294-287l126-76 126 77-33-144 111-96-146-13-58-136-58 135-146 13 111 97-33 143ZM173-120l65-281L20-590l288-25 112-265 112 265 288 25-218 189 65 281-247-149-247 149Zm247-340Z" />
          </svg>
        </div>
        <h2 class="widget-header-text achivs-header-text">Cheevos${this.CLONE_NUMBER === 0 ? "" : " ~"
      }</h2>
      <button class="header-button header-icon tweak-button" onclick="ui.settings.openSettings(ui.achievementsBlock[${this.CLONE_NUMBER}].contextMenuItems)">
        <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px" fill="#e8eaed"><path d="M0 0h24v24H0V0z" fill="none"/><path d="M3 17v2h6v-2H3zM3 5v2h10V5H3zm10 16v-2h8v-2h-8v-2h-2v6h2zM7 9v2H3v2h4v2h2V9H7zm14 4v-2H11v2h10zm-6-4h2V7h4V5h-4V3h-2v6z"/>
        </svg>        
      </button>
        <button class="header-button header-icon" onclick="ui.achievementsBlock[${this.CLONE_NUMBER
      }].close();">
          <svg height="24" viewBox="0 -960 960 960" width="24">
            <path d="m256-200-56-56 224-224-224-224 56-56 224 224 224-224 56 56-224 224 224 224-56 56-224-224-224 224Z" />
          </svg>
        </button>
      </div>
      <ul class="achievements-container content-container"></ul>
      <div class="resizer" id="achivs-resizer${this.CLONE_NUMBER}"></div>
    `;
    return newWidget;
  }

}

class ButtonPanel {
  get VISIBLE() {
    return !this.section.classList.contains("hidden");
  }
  constructor() {
    this.initializeElements();
    this.addEvents();
    this.setValues();
  }
  initializeElements() {
    this.section = document.querySelector("#side_panel");
    this.header = this.section.querySelector("#buttons-header_container");
    this.settings = this.section.querySelector("#open-settings-button");
    this.achievements = this.section.querySelector("#open-achivs-button");
    this.login = this.section.querySelector("#open-login-button");
    // this.about = this.section.querySelector("#open-about-button");
    this.gameCard = this.section.querySelector("#open-game-card-button");
    this.target = this.section.querySelector("#open-target-button");
    this.status = this.section.querySelector("#open-status-button");
    this.awards = this.section.querySelector("#open-awards-button");
    this.games = this.section.querySelector("#open-games-button");
    this.progression = this.section.querySelector("#open-progression-button");
    this.userImage = this.section.querySelector("#side-panel-user-image");
    this.note = this.section.querySelector("#open-note-button");
    this.notifications = this.section.querySelector("#open-notifications-button");
    this.user = this.section.querySelector("#open-user-button");
    this.stats = this.section.querySelector("#open-stats-button");


  }
  addEvents() {
    // Отримуємо посилання на панель
    this.sidePanel = document.querySelector("#side_panel");
    setTimeout(() => ui.buttons.section.classList.remove("expanded"), 2000);
    // Додаємо подію для відслідковування руху миші touchmove 
    document.addEventListener("touchstart", (e) => this.touchVisibilityHandler(e));
    document.addEventListener("mousemove", (e) => this.positionVisibilityHandler(e));
    // this.header.addEventListener("mousedown", (e) => {
    //   UI.moveEvent(this.section, e);
    // });

    this.login.addEventListener("change", (e) => {
      UI.switchSectionVisibility(ui.loginCard);
    });
    this.achievements.addEventListener("change", (e) => {
      UI.switchSectionVisibility(ui.achievementsBlock[0]);
    });
    this.status.addEventListener("change", (e) => {
      UI.switchSectionVisibility(ui.statusPanel);
    });
    this.settings.addEventListener("click", (e) => {
      // UI.switchSectionVisibility(ui.settings);
      const settingsWidget = document.querySelector("#settings_section");
      settingsWidget ? settingsWidget.remove() : ui.settings.openSettings();
    });
    this.awards.addEventListener("change", (e) => {
      UI.switchSectionVisibility(ui.awards);
    });
    this.target.addEventListener("change", (e) => {
      UI.switchSectionVisibility(ui.target);
    });
    this.gameCard.addEventListener("change", (e) => {
      UI.switchSectionVisibility(ui.gameCard);
    });
    this.games.addEventListener("change", (e) => {
      UI.switchSectionVisibility(ui.games);
    });
    // this.about.addEventListener("change", (e) => {
    //   UI.switchSectionVisibility(ui.about);
    // });
    this.progression.addEventListener("change", (e) => {

      UI.switchSectionVisibility(ui.progression);
    });
    this.note.addEventListener("change", (e) => {
      UI.switchSectionVisibility(ui.note);
    });
    this.user.addEventListener("change", (e) => {
      UI.switchSectionVisibility(ui.userInfo);
    });
    this.notifications.addEventListener("change", (e) => {
      UI.switchSectionVisibility(ui.notifications);
    });
    this.stats.addEventListener("change", (e) => {
      UI.switchSectionVisibility(ui.stats);
    });
  }

  setValues() {
    // Встановлення початкових індикаторів віджетів
    this.achievements.checked =
      config.ui?.achievements_section?.hidden === false ?? ui.achievementsBlock[0].VISIBLE;

    // this.settings.checked = config.ui?.settings_section?.hidden === false ?? ui.settings.VISIBLE;

    this.login.checked = config.ui?.login_section?.hidden === false ?? ui.loginCard.VISIBLE;

    this.target.checked = config.ui?.target_section?.hidden === false ?? ui.target.VISIBLE;

    this.gameCard.checked = config.ui?.game_section?.hidden === false ?? ui.gameCard.VISIBLE;

    this.status.checked = config.ui?.["update-section"]?.hidden === false ?? ui.statusPanel.VISIBLE;

    this.awards.checked = config.ui?.awards_section?.hidden === false ?? ui.awards.VISIBLE;

    this.note.checked = config.ui?.note_section?.hidden === false ?? ui.note.VISIBLE;
    this.games.checked = config.ui?.games_section?.hidden === false ?? ui.note.VISIBLE;
    this.progression.checked = config.ui?.progression_section?.hidden === false ?? ui.progression.VISIBLE;
    this.user.checked = config.ui?.user_section?.hidden === false ?? ui.user.VISIBLE;
    this.notifications.checked = config.ui?.notification_section?.hidden === false ?? ui.notifications.VISIBLE;
    this.stats.checked = config.ui?.stats_section?.hidden === false ?? ui.stats.VISIBLE;

    this.userImage.src = config.userImageSrc;
  }
  touchVisibilityHandler(e) {
    const xPos = e.touches[0].clientX;
    if (xPos < 50) {
      // Якщо так, показуємо панель
      this.section.classList.add("expanded");
      this.section.addEventListener("blur", (e) => {
        setTimeout(
          () => ui.buttons.section.classList.remove("expanded"),
          0
        );
      });
    }
  }
  positionVisibilityHandler(e) {
    const xPos = e.clientX;
    if (xPos < 10) {
      // Якщо так, показуємо панель
      this.section.classList.add("expanded");
      this.section.addEventListener("mouseleave", (e) => {
        setTimeout(
          () => ui.buttons.section.classList.remove("expanded"),
          200
        );
      });
    }
  }

}

class StatusPanel {
  get contextMenuItems() {
    return [
      {
        label: "Show stats",
        elements: [
          {
            prefix: "Duration ",
            postfix: "sec",
            type: "input-number",
            id: "context-menu_stats-duration",
            label: "Duration",
            value: this.STATS_DURATION,
            event: `onchange="ui.statusPanel.STATS_DURATION = this.value;"`,
          },
          {
            type: "checkbox",
            name: "context_show-points",
            id: "context_show-points",
            label: "Hard points",
            checked: this.SHOW_HP,
            event: `onchange="ui.statusPanel.SHOW_HP = this.checked;"`,
          },

          {
            type: "checkbox",
            name: "context_show-retropoints",
            id: "context_show-retropoints",
            label: "Retropoints",
            checked: this.SHOW_RP,
            event: `onchange="ui.statusPanel.SHOW_RP = this.checked;"`,
          },
          {
            type: "checkbox",
            name: "context_show-progression",
            id: "context_show-progression",
            label: "Progression Steps",
            checked: this.SHOW_PROGRESSION,
            event: `onchange="ui.statusPanel.SHOW_PROGRESSION = this.checked;"`,
          },
          {
            type: "checkbox",
            name: "context_show-cheevos",
            id: "context_show-cheevos",
            label: "Cheevos",
            checked: this.SHOW_CHEEVOS,
            event: `onchange="ui.statusPanel.SHOW_CHEEVOS = this.checked;"`,
          },

          {
            type: "checkbox",
            name: "context_show-softpoints",
            id: "context_show-softpoints",
            label: "Soft points",
            checked: this.SHOW_SP,
            event: `onchange="ui.statusPanel.SHOW_SP = this.checked;"`,
          },
          {
            type: "radio",
            name: "context_game-time",
            id: "context_show-playTime",
            label: "Game time",
            checked: this.SHOW_TIME == "playTime",
            event: `onclick="ui.statusPanel.SHOW_TIME = 'playTime';"`,
          },
          {
            type: "radio",
            name: "context_game-time",
            id: "context_show-sessionTime",
            label: "Session Game Time",
            checked: this.SHOW_TIME == "sessionTime",
            event: `onclick="ui.statusPanel.SHOW_TIME = 'sessionTime';"`,
          },
          {
            type: "radio",
            name: "context_game-time",
            id: "context_show-timer",
            label: "Timer",
            checked: this.SHOW_TIME == "timer",
            event: `onclick="ui.statusPanel.SHOW_TIME = 'timer';"`,
          },
          {
            prefix: "Timer",
            postfix: "min",
            type: "input-number",
            id: "context-menu_stats-timer-duration",
            label: "Timer",
            value: ~~(this.TIMER_TIME / 60 * 100) / 100,
            event: `onchange="ui.statusPanel.TIMER_TIME = this.value;"`,
          },


        ],
      },
      {
        label: "Progressbar",
        elements: [
          {
            type: "radio",
            name: "context_show-progressbar",
            id: "context_progressbar-auto",
            label: "Auto",
            checked: this.PROGRESSBAR_PROPERTY_NAME == "auto",
            event: `onchange = 'ui.statusPanel.PROGRESSBAR_PROPERTY_NAME = "auto"'`,
          },
          {
            type: "radio",
            name: "context_show-progressbar",
            id: "context_progressbar-achives",
            label: "Cheevos",
            checked: this.PROGRESSBAR_PROPERTY_NAME == "achives",
            event: `onchange = 'ui.statusPanel.PROGRESSBAR_PROPERTY_NAME = "achives"'`,
          },
          {
            type: "radio",
            name: "context_show-progressbar",
            id: "context_progressbar-progression",
            label: "Progression steps",
            checked: this.PROGRESSBAR_PROPERTY_NAME == "progression",
            event: `onchange = 'ui.statusPanel.PROGRESSBAR_PROPERTY_NAME = "progression"'`,
          },
          {
            type: "radio",
            name: "context_show-progressbar",
            id: "context_progressbar-points",
            label: "Hard points",
            checked: this.PROGRESSBAR_PROPERTY_NAME == "points",
            event: `onchange = 'ui.statusPanel.PROGRESSBAR_PROPERTY_NAME = "points"'`,
          },
          {
            type: "radio",
            name: "context_show-progressbar",
            id: "context_progressbar-retropoints",
            label: "Retropoints",
            checked: this.PROGRESSBAR_PROPERTY_NAME == "retropoints",
            event: `onchange = 'ui.statusPanel.PROGRESSBAR_PROPERTY_NAME = "retropoints"'`,
          },
          {
            type: "radio",
            name: "context_show-progressbar",
            id: "context_progressbar-softpoins",
            label: "Soft points",
            checked: this.PROGRESSBAR_PROPERTY_NAME == "softpoints",
            event: `onchange = 'ui.statusPanel.PROGRESSBAR_PROPERTY_NAME = "softpoints"'`,
          },


        ],
      },

      {
        label: "Elements",
        elements: [
          {
            type: "checkbox",
            name: "context_show-platform",
            id: "context_show-platform",
            label: "Platform",
            checked: this.SHOW_PLATFORM,
            event: `onchange="ui.statusPanel.SHOW_PLATFORM = this.checked;"`,
          }, {
            type: "checkbox",
            name: "context_show-rich-presence",
            id: "context_show-rich-presence",
            label: "Rich presence",
            checked: this.SHOW_RICH_PRESENCE,
            event: `onchange="ui.statusPanel.SHOW_RICH_PRESENCE = this.checked;"`,
          },
          {
            type: "radio",
            name: "context_show-game-ratio",
            id: "context_show-game-ratio",
            label: "Show Retro Ratio",
            checked: this.SHOW_GAME_RATIO,
            event: `onclick="ui.statusPanel.SHOW_GAME_RATIO = this.checked;"`,
          },
          {
            type: "radio",
            name: "context_show-game-ratio",
            id: "context_show-mastery-rate",
            label: "Show Mastery Rate",
            checked: this.SHOW_MASTERY_RATE,
            event: `onclick="ui.statusPanel.SHOW_MASTERY_RATE = this.checked;"`,
          },
        ],
      },
      {
        label: "Alerts",
        elements: [
          {
            type: "checkbox",
            name: "context_show-new-cheevos",
            id: "context_show-new-cheevos",
            label: "Show alerts",
            checked: this.SHOW_NEW_ACHIV,
            event: `onchange="ui.statusPanel.SHOW_NEW_ACHIV = this.checked;"`,
          },
          {
            prefix: "Alerts duration",
            postfix: "sec",
            type: "input-number",
            id: "context-menu_stats-earned-duration",
            label: "Duration",
            value: this.NEW_ACHIV_DURATION,
            event: `onchange="ui.statusPanel.NEW_ACHIV_DURATION = this.value;"`,
          },
        ],
      }
    ];
  }

  get SHOW_RP() {
    return config.ui.update_section?.showRP ?? true;
  }
  set SHOW_RP(value) {
    config.ui.update_section.showRP = value;
    config.writeConfiguration();
    this.startStatsAnimation();
  }
  get SHOW_HP() {
    return config.ui.update_section?.showHP ?? true;
  }
  set SHOW_HP(value) {
    config.ui.update_section.showHP = value;
    config.writeConfiguration();
    this.startStatsAnimation();

  }
  get SHOW_SP() {
    return config.ui.update_section?.showSP ?? true;
  }
  set SHOW_SP(value) {
    config.ui.update_section.showSP = value;
    config.writeConfiguration();
    this.startStatsAnimation();

  }
  get SHOW_CHEEVOS() {
    return config.ui.update_section?.showCheevos ?? true;
  }
  set SHOW_CHEEVOS(value) {
    config.ui.update_section.showCheevos = value;
    config.writeConfiguration();
    this.startStatsAnimation();

  }
  get SHOW_PROGRESSION() {
    return config.ui.update_section?.showProgression ?? false;
  }
  set SHOW_PROGRESSION(value) {
    config.ui.update_section.showProgression = value;
    config.writeConfiguration();
    this.startStatsAnimation();

  }
  get SHOW_PLATFORM() {
    return config.ui.update_section?.showPlatform ?? true;
  }
  set SHOW_PLATFORM(value) {
    config.ui.update_section.showPlatform = value;
    config.writeConfiguration();
    this.setValues();
  }
  get SHOW_RICH_PRESENCE() {
    return config.ui.update_section?.showRichPresence ?? true;
  }
  set SHOW_RICH_PRESENCE(value) {
    config.ui.update_section.showRichPresence = value;
    config.writeConfiguration();
    this.setValues();
  }
  get STATS_DURATION() {
    const duration = config.ui.update_section?.statsDuration ?? 30;
    return duration < 5 ? 5 : duration;
  }
  set STATS_DURATION(value) {
    config.ui.update_section.statsDuration = value;
    config.writeConfiguration();
    this.startStatsAnimation();
  }

  get SHOW_NEW_ACHIV() {
    return config.ui.update_section?.showNewAchiv ?? true;
  }
  set SHOW_NEW_ACHIV(value) {
    config.ui.update_section.showNewAchiv = value;
    config.writeConfiguration();
  }
  get CHANGE_PROGRESS_AUTO() {
    return config.ui.update_section?.progressBarPropertyName == "auto";
  }

  get PROGRESSBAR_PROPERTY_NAME() {
    return config.ui.update_section?.progressBarPropertyName ?? "auto";
  }
  set PROGRESSBAR_PROPERTY_NAME(value) {
    config.ui.update_section.progressBarPropertyName = value;
    config.writeConfiguration();
    this.setProgressBarValue();
  }
  get NEW_ACHIV_DURATION() {
    const duration = config.ui.update_section?.newAchivDuration ?? 15;
    return duration < 5 ? 5 : duration;
  }
  set NEW_ACHIV_DURATION(value) {
    config.ui.update_section.newAchivDuration = value;
    config.writeConfiguration();
  }

  get AUTOSCROLL_RICHPRESENCE() {
    return true;
  }
  get SHOW_GAME_PREV_BORDER() {
    return false;
    return config?.ui?.update_section?.showGamePrevBorder ?? true;
  }
  set SHOW_GAME_PREV_BORDER(value) {
    config.ui.update_section.showGamePrevBorder = value;
    config.writeConfiguration();
    this.container.classList.toggle("game-border", value);
  }
  get SHOW_GAME_RATIO() {
    return config?.ui?.update_section?.showGameRatio ?? true;
  }
  set SHOW_GAME_RATIO(value) {
    if (this.SHOW_GAME_RATIO && value) {
      value = false;
      document.getElementById("context_show-game-ratio").checked = false;
    }
    else {
      config.ui.update_section.showMasteryRate = !value;
    }
    config.ui.update_section.showGameRatio = value;
    config.writeConfiguration();
    this.setValues();
  }
  get SHOW_MASTERY_RATE() {
    return config?.ui?.update_section?.showMasteryRate ?? false;
  }
  set SHOW_MASTERY_RATE(value) {
    if (this.SHOW_MASTERY_RATE && value) {
      value = false;
      document.getElementById("context_show-mastery-rate").checked = false;
    }
    else {
      config.ui.update_section.showGameRatio = !value;
    }
    config.ui.update_section.showMasteryRate = value;
    config.writeConfiguration();
    this.setValues();
  }
  get SHOW_TIME() {
    return config.ui.update_section?.time ?? "playTime";
  }
  set SHOW_TIME(value) {
    if (value === config.ui.update_section.time) {
      document.querySelector(`#context_show-${value}`).checked = false;
      value = false;
    }
    config.ui.update_section.time = value;
    config.writeConfiguration();
    this.startStatsAnimation();
  }
  get TIMER_TIME() {
    return config.ui.update_section?.timerTime ?? 2;
  }
  set TIMER_TIME(value) {

    value < 1 && (value = 1);
    value > 24 * 60 && (value = 24 * 60);
    config.ui.update_section.timerTime = (value * 60);
    config.writeConfiguration();
    this.timerTime = this.TIMER_TIME;
    this.startStatsAnimation();
  }
  get VISIBLE() {
    return !this.section.classList.contains("hidden");
  }

  stats = {
    gameTitle: ui?.GAME_DATA?.Title ?? "Title",
    gamePlatform: ui?.GAME_DATA?.ConsoleName ?? "Platform",
    richPresence: "Waiting...",
    imageSrc: `https://media.retroachievements.org${ui?.GAME_DATA?.ImageIcon}`,
    totalPoints: ui?.GAME_DATA?.points_total ?? 0,
    totalAchievesCount: ui?.GAME_DATA?.achievements_published ?? 0,
    totalSoftpoints: 0,
    earnedPoints: 0,
    earnedAchievesCount: 0,
    totalRetropoints: ui?.GAME_DATA?.TotalRetropoints,
    earnedRetropoints: 0,
    earnedSoftpoints: 0,
  }
  awards = {
    award: "",
    progressionAward: "",
  }
  gameTime = 0;
  sessionGameTime = 0;
  timerTime = this.TIMER_TIME;
  gameTimeInterval;

  getActiveTime = () => {
    let time = 0;

    switch (this.SHOW_TIME) {
      case ("playTime"):
        time = this.gameTime;
        break;
      case ("sessionTime"):
        time = this.sessionGameTime;
        break;
      case ("timer"):
        time = this.timerTime;
        break;
    }

    return this.formatTime(time);
  }
  get statusTextValues() {
    const statusObj = {}
    this.SHOW_HP && (statusObj.progressionInPointsStats = `${this.stats.earnedPoints}/${this.stats.totalPoints} HP`);
    this.SHOW_CHEEVOS && (statusObj.cheevosStats = `${this.stats.earnedAchievesCount}/${this.stats.totalAchievesCount} CHEEVOS`);
    this.SHOW_PROGRESSION && (statusObj.cheevosStats = `${this.stats.earnedProgressionCount}/${this.stats.totalProgressionCount} STEPS`);
    this.SHOW_RP && (statusObj.retroPointsStats = `${this.stats.earnedRetropoints}/${this.stats.totalRetropoints} RP`);
    this.SHOW_SP && (statusObj.softPointsStats = `${this.stats.earnedSoftpoints}/${this.stats.totalPoints - this.stats.earnedPoints} SP`);
    this.SHOW_TIME && (statusObj.gameTime = this.getActiveTime())
    return statusObj;
  }
  constructor() {
    !config.ui.update_section && (config.ui.update_section = {});
    !config.ui.update_section.playTime && (config.ui.update_section.playTime = {});

    this.initializeElements();
    this.addEvents();
    this.startAutoScrollRP();
    setTimeout(() => this.fitFontSize(), 500);
  }
  initializeElements() {
    this.section = document.querySelector("#update-section");
    this.container = this.section.querySelector(".update_container");
    this.gamePreview = this.section.querySelector("#game-preview"); // Іконка гри
    this.retroRatioElement = this.section.querySelector(".update__retro-ratio")
    this.textBlock = this.section.querySelector("#update-text-block");
    this.gameTitle = this.section.querySelector("#game-title"); // Заголовок гри
    this.gamePlatform = this.section.querySelector("#game-platform"); // Платформа гри
    this.richPresence = this.section.querySelector("#rich-presence");
    this.watchButton = this.section.querySelector("#watching-button"); // Кнопка спостереження за грою
    this.progresBar = this.section.querySelector("#status-progress-bar");
    this.progresBarDelta = this.section.querySelector("#status_progress-bar-delta");
    this.progressStatusText = this.section.querySelector("#status-progress-text");
    this.resizer = this.section.querySelector("#status-resizer");
    this.backSide = {
      container: this.section.querySelector(".update_back-side"),
      imgElement: this.section.querySelector("#update_achiv-preview"),
      achivTitleElement: this.section.querySelector("#update_achiv-title"),
      earnedPoints: this.section.querySelector("#update_achiv-earned-points"),
    }
  }
  addEvents() {
    this.watchButton.addEventListener("mousedown", (e) => {
      e.stopPropagation();
    });
    // Додаємо обробник події 'click' для кнопки автооновлення
    this.watchButton.addEventListener("click", (e) => {
      e.stopPropagation();
      const savePlayTime = () => {
        config.ui.update_section.playTime[config.gameID] = this.gameTime;
        config.writeConfiguration();
      }
      // Перевіряємо стан кнопки та відповідно запускаємо або припиняємо автооновлення
      if (this.watchButton.classList.contains("active")) {
        ui.stopWatching();
        savePlayTime();
        clearInterval(this.gameTimeInterval);
      }
      else {
        ui.startWatching();
        this.gameTimeInterval = setInterval(() => {
          this.gameTime++;
          this.sessionGameTime++;
          this.timerTime--;
          if (this.SHOW_TIME === "timer" && this.timerTime < 0) {
            this.section.classList.add("timer-timeout");
          }
          this.gameTime % 60 == 0 && (savePlayTime());
          const time = this.getActiveTime();
          this.section.querySelector(`.gameTime`) && (this.section.querySelector(`.gameTime`).innerText = time);
        }, 1000)
      }

    });
    this.textBlock.addEventListener("mousedown", (e) => {
      UI.moveEvent(this.section, e);
      //fsdf;
    });
    this.section.addEventListener("contextmenu", (event) => {
      ui.showContextmenu({
        event: event,
        menuItems: this.contextMenuItems,
      });
    });
    this.resizer.addEventListener("mousedown", (event) => {
      event.stopPropagation();
      this.section.classList.add("resized");
      UI.resizeEvent({
        event: event,
        section: this.section,
        callback: () => this.fitFontSize(),
      });
    });
  }
  setValues() {
    this.gamePlatform.classList.toggle("hidden", !this.SHOW_PLATFORM);
    this.richPresence.classList.toggle("hidden", !this.SHOW_RICH_PRESENCE);

    // const ratio = ui.GAME_DATA.progressionRetroRatio;
    const ratio = ui.GAME_DATA.retroRatio;
    const masteryRate = ui.GAME_DATA.masteryRate;
    this.retroRatioElement.innerText = this.SHOW_MASTERY_RATE ? masteryRate : ratio;
    this.retroRatioElement.className = `update__retro-ratio difficult-badge__${ui.GAME_DATA.gameDifficulty}`;


    //* Обчислення прогресу за балами та за кількістю досягнень
    const completionByPoints = this.stats.earnedPoints / ui.GAME_DATA.points_total || 0;
    const completionByPointsPercents = ~~(completionByPoints * 100) + "%";
    const completionByCount = this.stats.earnedAchievesCount / ui?.GAME_DATA?.achievements_published;

    const completionByCountPercents = ~~(completionByCount * 100) + "%";

    this.setProgressBarValue();

    this.progressStatusText.innerText = "";
    this.startStatsAnimation();
    ui.gameCard.updateGameInfoElement({
      name: "Completion",
      value: `${completionByPointsPercents} of points [${completionByCountPercents}]`,
    });
    ui.gameCard.section.classList.toggle("mastered", this.stats.earnedPoints != 0 && this.stats.totalPoints === this.stats.earnedPoints);
    this.container.classList.toggle("game-border", this.SHOW_GAME_PREV_BORDER);
    this.container.classList.toggle("show-game-ratio", this.SHOW_GAME_RATIO || this.SHOW_MASTERY_RATE);

  }
  setProgressBarValue() {
    let value = 0;
    switch (this.PROGRESSBAR_PROPERTY_NAME) {
      case "points":
        value = this.stats.earnedPoints / ui.GAME_DATA.points_total;
        break;
      case "retropoints":
        value = (this.stats.earnedRetropoints / ui.GAME_DATA.TotalRetropoints);
        break;
      case "achives":
        value = (this.stats.earnedAchievesCount / ui?.GAME_DATA?.achievements_published);
        break;
      case "progression":
        value = (this.stats.earnedProgressionCount / ui?.GAME_DATA?.progressionSteps);
        break;
      case "softpoints":
        value = (this.stats.earnedSoftpoints / this.stats.totalSoftPoints);
        break;
    }
    //* Встановлення стилів прогресу
    this.section.style.setProperty(
      "--progress-points",
      (value || 0) * 100 + "%"
    );
  }
  updateData(isNewGame = false) {
    this.stats = {
      gameTitle: ui?.GAME_DATA?.FixedTitle ?? "Title",
      gamePlatform: ui?.GAME_DATA?.ConsoleName ?? "Platform",
      richPresence: "Waiting...",
      imageSrc: `https://media.retroachievements.org${ui?.GAME_DATA?.ImageIcon}`,
      totalPoints: ui?.GAME_DATA?.points_total ?? 0,
      totalSoftPoints: ui.GAME_DATA.points_total - ui.GAME_DATA.earnedStats.soft.points,
      totalAchievesCount: ui?.GAME_DATA?.achievements_published ?? 0,
      totalProgressionCount: ui?.GAME_DATA?.progressionSteps,
      earnedPoints: ui.GAME_DATA.earnedStats.hard.points,
      earnedAchievesCount: ui.GAME_DATA.earnedStats.hard.count,
      earnedProgressionCount: ui.GAME_DATA.earnedStats.soft.progressionCount,
      totalRetropoints: ui?.GAME_DATA?.TotalRetropoints,
      earnedRetropoints: ui.GAME_DATA.earnedStats.hard.retropoints,
      earnedSoftpoints: ui.GAME_DATA.earnedStats.soft.points - ui.GAME_DATA.earnedStats.hard.points,

    }
    isNewGame && (
      this.awards.award = ui.GAME_DATA.award,
      this.awards.progressionAward = ui.GAME_DATA.progressionAward
    )
    this.setValues();
  }
  gameChangeEvent() {
    if (ui.GAME_DATA.FixedTitle != this.stats.gameTitle && ui.apiTrackerInterval) {
      this.addAlertsToQuery([{ type: "new-game", value: ui.GAME_DATA }]);
      ui.settings.DISCORD_NEW_GAME && ui.sendDiscordMessage({ type: "new-game" });
    }

    const { ImageIcon, FixedTitle, ConsoleName, badges } = ui.GAME_DATA;
    const { gamePreview, gameTitle, gamePlatform } = this;
    gamePreview.setAttribute(
      "src",
      `https://media.retroachievements.org${ImageIcon}`
    );
    gameTitle.innerHTML = `${FixedTitle || "Some game name"} ${generateBadges(badges)}`;
    gameTitle.setAttribute(
      "href",
      "https://retroachievements.org/game/" + config.gameID
    );
    gamePlatform.innerText = ConsoleName || "";
    this.updateData(true);
    this.gameTime = config.ui.update_section.playTime[config.gameID] ? config.ui.update_section.playTime[config.gameID] : 0;
    this.sessionGameTime = 0;
    this.timerTime = this.TIMER_TIME;
  }
  updateProgress({ earnedAchievementIDs }) {
    this.updateData();

    //show new achivs in statusPanel
    if (this.SHOW_NEW_ACHIV && earnedAchievementIDs.length) {
      const checkForGameAward = () => {
        let award;
        if (this.awards.award !== 'mastered'
          && ui.GAME_DATA.earnedStats.hard.count === this.stats.totalAchievesCount) {
          this.awards.award = 'mastered';
          award = {
            type: "new-award",
            award: "mastered",
            value: ui.GAME_DATA
          }
        }
        else if (this.awards.award !== ''
          && ui.GAME_DATA.earnedStats.soft.count === this.stats.totalAchievesCount) {
          this.awards.award = 'completed';
          award = {
            type: "new-award",
            award: "completed",
            value: ui.GAME_DATA
          }
        }
        if (this.stats.totalProgressionCount > 0 &&
          this.awards.progressionAward !== 'beaten' &&
          ui.GAME_DATA.earnedStats.hard.progressionCount >= this.stats.totalProgressionCount) {
          this.awards.progressionAward = 'beaten';
          award = {
            type: "new-award",
            award: "beaten",
            value: ui.GAME_DATA
          }
        }
        else if (this.stats.totalProgressionCount > 0 &&
          this.awards.progressionAward == '' &&
          ui.GAME_DATA.earnedStats.soft.progressionCount >= this.stats.totalProgressionCount) {
          this.awards.progressionAward = 'beaten-softcore';
          award = {
            type: "new-award",
            award: "beaten-softcore",
            value: ui.GAME_DATA
          }
        }
        return award;
      }
      const alerts = earnedAchievementIDs
        .map(id => {
          return {
            type: 'new-achiv',
            value: ui.ACHIEVEMENTS[id]
          }
        });
      const award = checkForGameAward();
      award && alerts.push(award);
      this.addAlertsToQuery([...alerts]);
    }

    //push points toggle animation
    this.progresBarDelta.classList.remove("hidden");

    setTimeout(() => this.progresBarDelta.classList.add("hidden"), 50)
  }
  alertsQuery = [];
  addAlertsToQuery(elements) {
    if (!this.SHOW_NEW_ACHIV) return;
    if (this.alertsQuery.length > 0) {
      this.alertsQuery = [...this.alertsQuery, ...elements];
    }
    else {
      this.alertsQuery = [...elements];
      this.startAlerts();
    }
  }
  async startAlerts() {
    const clearContainer = () => {
      this.container.classList.remove("new-game-info", "new-achiv", "new-award", "beaten");
      this.backSide.container.classList.remove("hardcore", "beaten", "mastered");
    }
    const glassAnimation = () => {
      const glassElement = this.section.querySelector(".status_glass-effect");
      glassElement.classList.remove("update");
      setTimeout(() => glassElement.classList.add("update"), 20);
    }
    const deltaTime = (time) => {
      const hours = ~~(time / 3600);
      const mins = ~~((time - hours * 3600) / 60);
      const timeStr = `
        ${hours > 0 ? hours == 1 ? "1 hour " : hours + " hours " : ""}
        ${hours > 0 && mins > 0 ? "and " : ""}
        ${mins > 0 ? mins == 1 ? "1 minute" : mins + " minutes" : ""}
      `;
      return timeStr;
    }
    const updateGameData = (game) => {
      const { FixedTitle,
        badges,
        ImageIcon,
        points_total,
        ConsoleName,
        TotalRetropoints,
        achievements_published,
        masteryRate,
        beatenRate,
      } = game;
      this.backSide.imgElement.src = `https://media.retroachievements.org${ImageIcon}`;
      this.backSide.achivTitleElement.innerHTML = `${FixedTitle} ${generateBadges(badges)}
      <i class="game-card_suffix">${ConsoleName}</i>
      `;
      let gameInfo = `
      <p class="status__difficult-badge difficult-badge__pro">${points_total} HP</p>
      <p class="status__difficult-badge difficult-badge__pro">${TotalRetropoints} RP</p>
      <p class="status__difficult-badge difficult-badge__pro">${achievements_published} CHEEVOS</p> 
      <p class="status__difficult-badge difficult-badge__pro">${masteryRate}% MASTERED RATE</p>
      ${beatenRate ? `<p class="status__difficult-badge difficult-badge__pro">${beatenRate}% BEATEN RATE</p>` : ''}
      `;
      this.backSide.earnedPoints.innerHTML = gameInfo;
      this.container.classList.add("new-game-info");
    }
    const updateAchivData = (achiv) => {
      const { isHardcoreEarned, Title, prevSrc, Points, TrueRatio, rateEarned, rateEarnedHardcore, difficulty } = achiv;
      this.backSide.imgElement.src = prevSrc;
      this.backSide.achivTitleElement.innerHTML = Title + `
        <p class="status__difficult-badge difficult-badge__${difficulty}">${difficulty}</p>
      `;
      let earnedPoints = isHardcoreEarned ?
        `<p class="status__difficult-badge difficult-badge__pro">+${Points}HP </p>
        <p class="status__difficult-badge difficult-badge__pro">+${TrueRatio}RP </p>
        <p class="status__difficult-badge difficult-badge__pro">TOP${rateEarnedHardcore}</p>`
        : `
        <p class="status__difficult-badge difficult-badge__pro">+${Points}SP</p> 
        <p class="status__difficult-badge difficult-badge__pro">TOP${rateEarned}</p>`;
      this.backSide.earnedPoints.innerHTML = earnedPoints;
      this.backSide.container.classList.toggle("hardcore", achiv.isHardcoreEarned);
      setTimeout(() => this.container.classList.add("new-achiv"), 2000)
    }
    const updateAwardData = (game, award) => {
      const { FixedTitle,
        badges,
        ImageIcon,
        points_total,
        earnedStats,
        TotalRetropoints,
        masteryRate,
        beatenRate,
        completedRate,
        beatenSoftRate,
        ID
      } = game;
      // let award = 'mastered';
      const awardRate = award == 'mastered' ? masteryRate :
        award == 'beaten' ? beatenRate :
          award == 'completed' ? completedRate : beatenSoftRate;

      console.log(award, awardRate, completedRate, game);
      const playTimeInMinutes = deltaTime(config.ui.update_section.playTime[ID]);
      this.backSide.imgElement.src = `https://media.retroachievements.org${ImageIcon}`;
      this.backSide.achivTitleElement.innerHTML = `${FixedTitle} ${generateBadges(badges)}
      <i class="game-card_suffix bg_gold">GAINED AWARD</i>
      `;
      let gameInfo = `
        <p class="status__difficult-badge difficult-badge__pro">${award} IN ${playTimeInMinutes}</p>
        <p class="status__difficult-badge difficult-badge__pro">TOP${awardRate}%</p>
        <p class="status__difficult-badge difficult-badge__pro">${earnedStats.hard.points}/${points_total} HP</p>
        <p class="status__difficult-badge difficult-badge__pro">${earnedStats.hard.retropoints}/${TotalRetropoints} RP</p>
      `;
      this.backSide.earnedPoints.innerHTML = gameInfo;
      this.backSide.container.classList.add(award);
      setTimeout(() => this.container.classList.add("new-award"), 1000)
    }
    const updateAlertData = (alert) => {
      clearContainer();
      switch (alert.type) {
        case "new-game":
          updateGameData(alert.value);
          break;
        case "new-achiv":
          updateAchivData(alert.value);
          break;
        case "new-award":
          updateAwardData(alert.value, alert.award);
          break;
        default:
          break;
      }
    }
    while (this.alertsQuery.length > 0) {
      //waiting for animation end
      await delay(1000);
      updateAlertData(this.alertsQuery[0])
      this.container.classList.add("show-back");
      glassAnimation();
      setTimeout(() => this.startAutoScrollElement(this.backSide.achivTitleElement), 2000);
      setTimeout(() => this.startAutoScrollElement(this.backSide.earnedPoints), 2000);
      //back to main information in status panel
      await delay(this.NEW_ACHIV_DURATION * 1000);
      this.container.classList.remove("show-back");
      this.alertsQuery.shift();
      this.stopAutoScrollElement(this.backSide.earnedPoints, true);
      this.stopAutoScrollElement(this.backSide.achivTitleElement, true);

    }
  }

  statsAnimationInterval;
  startStatsAnimation() {
    this.stopStatsAnimation();
    this.section.classList.remove("timer-timeout");
    this.progressStatusText.innerText = '';
    this.progressStatusText.className = `progress_points-percent progress-percent`;

    let currentStatusTextIndex = 0;
    let statusTextObjectLength = Object.values(this.statusTextValues).length;
    this.PROGRESSBAR_PROPERTY_NAME ==
      "auto" && Object.getOwnPropertyNames(this.statusTextValues)[currentStatusTextIndex] == "gameTime" && (
        this.PROGRESSBAR_PROPERTY_NAME = "achives"
      );


    statusTextObjectLength > 0 && (
      this.changeStatsElementValues({
        className: Object.getOwnPropertyNames(this.statusTextValues)[currentStatusTextIndex],
        text: Object.values(this.statusTextValues)[currentStatusTextIndex]
      })
    );


    statusTextObjectLength > 1 && (
      this.statsAnimationInterval = setInterval(() => {
        currentStatusTextIndex = currentStatusTextIndex < statusTextObjectLength - 1 ?
          currentStatusTextIndex + 1 : 0;

        this.progressStatusText.classList.add("hide");

        setTimeout(() => {
          this.changeStatsElementValues({
            className: Object.getOwnPropertyNames(this.statusTextValues)[currentStatusTextIndex],
            text: Object.values(this.statusTextValues)[currentStatusTextIndex]
          })

        }, 1000)
      }, this.STATS_DURATION * 1000))
  }
  stopStatsAnimation() {
    clearInterval(this.statsAnimationInterval);
    this.currentStatusTextIndex = 0;
  }
  changeStatsElementValues({ className, text }) {
    this.progressStatusText.innerText = text;
    this.progressStatusText.className = `progress_points-percent progress-percent ${className}`;
    this.CHANGE_PROGRESS_AUTO && className != "gameTime" && (
      this.section.style.setProperty(
        "--progress-points",
        this.convertToPercentage(text) || "0%"
      )
    );
  }

  autoscrollRPInterval;
  startAutoScrollRP(toLeft = true) {
    this.autoscrollRPInterval ? this.stopAutoScrollRP() : "";
    let refreshRateMiliSecs = 50;
    let scrollContainer = this.richPresence;
    let speedInPixels = 1;
    const pauseOnEndMilisecs = 1000;
    // Часовий інтервал для прокручування вниз
    if (this.AUTOSCROLL_RICHPRESENCE) {
      this.autoscrollRPInterval = setInterval(() => {
        if (scrollContainer.clientWidth == scrollContainer.scrollWidth) {
          this.stopAutoScrollRP();
          setTimeout(() => this.startAutoScrollRP(), 10 * 1000);
        }
        else if (toLeft) {
          scrollContainer.scrollLeft += speedInPixels;
          if (
            scrollContainer.scrollLeft + scrollContainer.clientWidth >=
            scrollContainer.scrollWidth
          ) {
            this.stopAutoScrollRP();
            setTimeout(() => this.startAutoScrollRP(false), pauseOnEndMilisecs);
          }
        } else {
          scrollContainer.scrollLeft -= speedInPixels;
          if (scrollContainer.scrollLeft == 0) {
            this.stopAutoScrollRP();
            setTimeout(() => this.startAutoScrollRP(true), pauseOnEndMilisecs);
          }
        }
      }, refreshRateMiliSecs);
      // Припиняємо прокручування при наведенні миші на контейнер
      scrollContainer.addEventListener("mouseenter", () => {
        speedInPixels = 0; // Зупиняємо інтервал прокрутки
      });

      // Відновлюємо прокрутку при відведенні миші від контейнера
      scrollContainer.addEventListener("mouseleave", () => {
        speedInPixels = 1;
      });
    }
  }
  stopAutoScrollRP() {
    clearInterval(this.autoscrollRPInterval);
  }
  autoscrollAlertInterval = {};
  startAutoScrollElement(element, toLeft = true) {
    this.autoscrollAlertInterval[element.className] ?
      this.stopAutoScrollElement(element) : (
        this.autoscrollAlertInterval[element.className] = {}
      );
    let refreshRateMiliSecs = 50;
    let scrollContainer = element;
    let speedInPixels = 1;
    const pauseOnEndMilisecs = 1000;
    // Часовий інтервал для прокручування вниз
    if (true) {
      this.autoscrollAlertInterval[element.className].interval = setInterval(() => {
        if (scrollContainer.clientWidth == scrollContainer.scrollWidth) {
          this.stopAutoScrollElement(element);
          this.autoscrollAlertInterval[element.className].timeout = setTimeout(() => this.startAutoScrollElement(element), 10 * 1000);
        }
        else if (toLeft) {
          scrollContainer.scrollLeft += speedInPixels;
          if (
            scrollContainer.scrollLeft + scrollContainer.clientWidth >=
            scrollContainer.scrollWidth
          ) {
            this.stopAutoScrollElement(element);
            this.autoscrollAlertInterval[element.className].timeout = setTimeout(() => this.startAutoScrollElement(element, false), pauseOnEndMilisecs);
          }
        } else {
          scrollContainer.scrollLeft -= speedInPixels;
          if (scrollContainer.scrollLeft == 0) {
            this.stopAutoScrollElement(element);
            this.autoscrollAlertInterval[element.className].timeout = setTimeout(() => this.startAutoScrollElement(element, true), pauseOnEndMilisecs);
          }
        }
      }, refreshRateMiliSecs);
      // // Припиняємо прокручування при наведенні миші на контейнер
      // scrollContainer.addEventListener("mouseenter", () => {
      //   speedInPixels = 0; // Зупиняємо інтервал прокрутки
      // });

      // // Відновлюємо прокрутку при відведенні миші від контейнера
      // scrollContainer.addEventListener("mouseleave", () => {
      //   speedInPixels = 1;
      // });
    }
  }
  stopAutoScrollElement(element, reset = false) {
    reset && (element.scrollLeft = 0);
    clearInterval(this.autoscrollAlertInterval[element.className].interval);
    clearTimeout(this.autoscrollAlertInterval[element.className].timeout)
  }
  convertToPercentage(inputString) {
    // Розбиваємо рядок за допомогою розділювача '/'
    const parts = inputString.split('/');

    // Перетворюємо перші дві частини у числа та рахуємо відсотки
    const result = (parseInt(parts[0], 10) / parseInt(parts[1], 10)) * 100;

    // Повертаємо результат у вигляді рядка з відсотками
    return result.toFixed(2) + '%';
  }
  formatTime(seconds) {
    const isNegative = seconds < 0;
    isNegative && (seconds *= -1);

    let hours = Math.floor(seconds / 3600);
    let minutes = Math.floor((seconds % 3600) / 60);
    let remainingSeconds = seconds % 60;

    // Додавання ведучих нулів, якщо необхідно
    hours = (hours < 10) ? "0" + hours : hours;
    minutes = (minutes < 10) ? "0" + minutes : minutes;
    remainingSeconds = (remainingSeconds < 10) ? "0" + remainingSeconds : remainingSeconds;

    return `${isNegative ? "-" : ""}${hours != "00" ? hours + ":" : ""}${minutes}:${remainingSeconds}`;
  }
  fitFontSize() {
    const container = document.querySelector(".update_container");
    const containerHeight = config?.ui?.update_section?.height ?? this.section.getBoundingClientRect().height;
    container.style.fontSize = `${(containerHeight - 10) / 5.5}px`;
  }

}

class Settings {
  get settingsItems() {
    return [
      {
        label: "Style",
        elements: [
          {
            type: "select",
            label: "Select colors",
            id: "settings_colors-selector",
            selectValues: [
              {
                type: "radio",
                name: "context_color-scheme",
                id: "context_color-scheme-default",
                label: "default",
                checked: ui.settings.COLOR_SCHEME === "default",
                event: "onchange=\"ui.settings.COLOR_SCHEME = 'default'\"",
              },
              {
                type: "radio",
                name: "context_color-scheme",
                id: "context_color-scheme-pink",
                label: "pink",
                checked: ui.settings.COLOR_SCHEME === "pink",
                event: "onchange=\"ui.settings.COLOR_SCHEME = 'pink'\"",
              },
              {
                type: "radio",
                name: "context_color-scheme",
                id: "context_color-scheme-lightgreen",
                label: "lightgreen",
                checked: ui.settings.COLOR_SCHEME === "lightgreen",
                event: "onchange=\"ui.settings.COLOR_SCHEME = 'lightgreen'\"",
              },
              {
                type: "radio",
                name: "context_color-scheme",
                id: "context_color-scheme-lightblue",
                label: "lightblue",
                checked: ui.settings.COLOR_SCHEME === "lightblue",
                event: "onchange=\"ui.settings.COLOR_SCHEME = 'lightblue'\"",
              },
              {
                type: "radio",
                name: "context_color-scheme",
                id: "context_color-scheme-blue",
                label: "blue",
                checked: ui.settings.COLOR_SCHEME === "blue",
                event: "onchange=\"ui.settings.COLOR_SCHEME = 'blue'\"",
              },
              {
                type: "radio",
                name: "context_color-scheme",
                id: "context_color-scheme-synthwave",
                label: "synthwave",
                checked: ui.settings.COLOR_SCHEME === "synthwave",
                event: "onchange=\"ui.settings.COLOR_SCHEME = 'synthwave'\"",
              },
              {
                type: "radio",
                name: "context_color-scheme",
                id: "context_color-scheme-darkblue",
                label: "darkblue",
                checked: ui.settings.COLOR_SCHEME === "darkblue",
                event: "onchange=\"ui.settings.COLOR_SCHEME = 'darkblue'\"",
              },
              {
                type: "radio",
                name: "context_color-scheme",
                id: "context_color-scheme-brown",
                label: "brown",
                checked: ui.settings.COLOR_SCHEME === "brown",
                event: "onchange=\"ui.settings.COLOR_SCHEME = 'brown'\"",
              },
              {
                type: "radio",
                name: "context_color-scheme",
                id: "context_color-scheme-pastel",
                label: "pastel",
                checked: ui.settings.COLOR_SCHEME === "pastel",
                event: "onchange=\"ui.settings.COLOR_SCHEME = 'pastel'\"",
              },
              {
                type: "radio",
                name: "context_color-scheme",
                id: "context_color-scheme-retro",
                label: "retro",
                checked: ui.settings.COLOR_SCHEME === "retro",
                event: "onchange=\"ui.settings.COLOR_SCHEME = 'retro'\"",
              },
              {
                type: "radio",
                name: "context_color-scheme",
                id: "context_color-scheme-vintage",
                label: "vintage",
                checked: ui.settings.COLOR_SCHEME === "vintage",
                event: "onchange=\"ui.settings.COLOR_SCHEME = 'vintage'\"",
              },
              {
                type: "radio",
                name: "context_color-scheme",
                id: "context_color-scheme-neon",
                label: "neon",
                checked: ui.settings.COLOR_SCHEME === "neon",
                event: "onchange=\"ui.settings.COLOR_SCHEME = 'neon'\"",
              },
              {
                type: "radio",
                name: "context_color-scheme",
                id: "context_color-scheme-gray",
                label: "gray",
                checked: ui.settings.COLOR_SCHEME === "gray",
                event: "onchange=\"ui.settings.COLOR_SCHEME = 'gray'\"",
              },
              {
                type: "radio",
                name: "context_color-scheme",
                id: "context_color-scheme-custom",
                label: "custom",
                checked: ui.settings.COLOR_SCHEME === "custom",
                event: "onchange=\"ui.settings.COLOR_SCHEME = 'custom'\"",
              },
            ]
          },
          {
            type: "checkbox",
            label: "Show bg",
            id: "settings_show-bg",
            onChange: "ui.settings.BG_ANIMATION = this.checked;",
            checked: this.BG_ANIMATION,
          }
        ]
      },
      {
        label: "Custom colors",
        elements: [
          {
            type: "color",
            id: "main-color-input",
            label: "main color",
            value: config.mainColor,
            onChange: "console.log(this); config.mainColor = this.value; ui.settings.COLOR_SCHEME = ui.settings.COLOR_SCHEME",
          },
          {
            type: "color",
            id: "secondary-color-input",
            label: "secondary color",
            value: config.secondaryColor,
            onChange: "config.secondaryColor = this.value; ui.settings.COLOR_SCHEME = ui.settings.COLOR_SCHEME",
          },
          {
            type: "color",
            id: "accent-color-input",
            label: "accent color",
            value: config.accentColor,
            onChange: "config.accentColor = this.value; ui.settings.COLOR_SCHEME = ui.settings.COLOR_SCHEME",
          },
          {
            type: "color",
            id: "selection-color-input",
            label: "selection color",
            value: config.selectionColor,
            onChange: "config.selectionColor = this.value; ui.settings.COLOR_SCHEME = ui.settings.COLOR_SCHEME",
          },
          {
            type: "color",
            id: "font-color-input",
            label: "font color",
            value: config.fontColor,
            onChange: "config.fontColor = this.value; ui.settings.COLOR_SCHEME = ui.settings.COLOR_SCHEME",
          },
        ]
      },
      {
        label: "Font family",
        elements: [
          {
            type: "select",
            label: "Select font",
            id: "settings_font-family",
            selectValues: [
              {
                type: "radio",
                name: "settings_font-family",
                id: "settings_font-family-default",
                label: "default",
                checked: ui.settings.FONT_NAME === "default",
                event: "onchange=\"ui.settings.selectFont('default');\"",
              },
              {
                type: "radio",
                name: "settings_font-family",
                id: "settings_font-family-Oxygen",
                label: "Oxygen",
                checked: ui.settings.FONT_NAME === "Oxygen",
                event: "onchange=\"ui.settings.selectFont('oxygen');\"",
              },
              {
                type: "radio",
                name: "settings_font-family",
                id: "settings_font-family-Shadows",
                label: "Shadows",
                checked: ui.settings.FONT_NAME === "Shadows",
                event: "onchange=\"ui.settings.selectFont('shadows');\"",
              },
              {
                type: "radio",
                name: "settings_font-family",
                id: "settings_font-family-Pixelify",
                label: "Pixelify",
                checked: ui.settings.FONT_NAME === "Pixelify Sans",
                event: "onchange=\"ui.settings.selectFont('pixelifySans');\"",
              },
              {
                type: "radio",
                name: "settings_font-family",
                id: "settings_font-family-Jaro",
                label: "Jaro",
                checked: ui.settings.FONT_NAME === "Jaro",
                event: "onchange=\"ui.settings.selectFont('jaro');\"",
              },
              {
                type: "radio",
                name: "settings_font-family",
                id: "settings_font-family-Jacquard",
                label: "Jacquard",
                checked: ui.settings.FONT_NAME === "Jacquard",
                event: "onchange=\"ui.settings.selectFont('jacquard');\"",
              },
              {
                type: "radio",
                name: "settings_font-family",
                id: "settings_font-family-Custom",
                label: "Custom",
                checked: ui.settings.FONT_NAME === "custom",
                event: "onchange=\"ui.settings.selectFont('custom');\"",
              },
            ]
          },
          {
            type: "search",
            label: "paste url here",
            id: "settings_font-input",
            value: "",
            onChange: "ui.settings.FONT_FAMILY = this.value; this.value = '';",
          }
        ]
      },
      {
        label: "Font size (base in px)",
        elements: [
          {
            type: "number",
            label: "font size",
            id: "settings_font-size-input",
            value: this.FONT_SIZE,
            onChange: "ui.settings.FONT_SIZE = this.value;",
          }
        ]
      },
      {
        label: "Update delay (in secs)",
        elements: [
          {
            type: "number",
            label: "sec",
            id: "settings_update-delay-input",
            value: config.updateDelay,
            onChange: "config.updateDelay = this.value",
          }
        ]
      },
      {
        label: "Target user",
        elements: [
          {
            type: "search",
            label: config.targetUser,
            id: "settings_target-user-input",
            value: config.targetUser,
            onChange: "config.targetUser = this.value",
          }
        ]
      },
      {
        label: "Game ID",
        elements: [
          {
            type: "button",
            label: "Check ID",
            id: "settings_check-game-id",
            onClick: "ui.getAchievements()",
          },
          {
            type: "button",
            label: "Get last ID",
            id: "settings_get-last-id",
            onClick: "ui.settings.getLastGameID()",
          },
          {
            type: "number",
            label: "game id",
            id: "settings_game-id-input",
            value: config.gameID,
            onChange: "config.gameID = this.value;",
          }
        ]
      },
      {
        label: "Autoupdate",
        elements: [
          {
            type: "checkbox",
            label: "Start on load",
            id: "settings_start-on-load",
            onChange: "ui.settings.START_ON_LOAD = this.checked;",
            checked: this.START_ON_LOAD,
          }
        ]
      },
      {
        label: "Discord",
        elements: [
          {
            type: "text-input",
            label: "paste discord webhook",
            id: "settings_discord-hook-input",
            value: this.DISCORD_WEBHOOK ?? "",
            onChange: "ui.settings.DISCORD_WEBHOOK = value;",
          },
          {
            type: "checkbox",
            label: "Start game alert",
            id: "settings_discord-start-game",
            onChange: "ui.settings.DISCORD_NEW_GAME = this.checked;",
            checked: this.DISCORD_NEW_GAME,
          },
          {
            type: "checkbox",
            label: "Start session alert",
            id: "settings_discord-start-session",
            onChange: "ui.settings.DISCORD_START_SESSION = this.checked;",
            checked: this.DISCORD_START_SESSION,
          },
          {
            type: "checkbox",
            label: "Earn cheevo alert",
            id: "settings_discord-new-cheevo",
            onChange: "ui.settings.DISCORD_NEW_CHEEVO = this.checked;",
            checked: this.DISCORD_NEW_CHEEVO,
          },

        ]
      },
    ]
  }
  get DISCORD_WEBHOOK() {
    return config.DISCORD_WEBHOOK ?? "";
  }
  set DISCORD_WEBHOOK(value) {
    config.DISCORD_WEBHOOK = value;
    config.writeConfiguration();
  }
  get DISCORD_NEW_GAME() {
    return config._cfg?.discordNewGame ?? true;
  }
  set DISCORD_NEW_GAME(value) {
    config._cfg.discordNewGame = value;
    config.writeConfiguration();
  }
  get DISCORD_NEW_CHEEVO() {
    return config._cfg?.discordNewCheevo ?? true;
  }
  set DISCORD_NEW_CHEEVO(value) {
    config._cfg.discordNewCheevo = value;
    config.writeConfiguration();
  }
  get DISCORD_START_SESSION() {
    return config._cfg?.discordStartSession ?? true;
  }
  set DISCORD_START_SESSION(value) {
    config._cfg.discordStartSession = value;
    config.writeConfiguration();
  }
  get VISIBLE() {
    return !this.section.classList.contains("hidden");
  }
  get contextMenuItems() {
    return [
      {
        label: "Colors",
        elements: [
          {
            type: "radio",
            name: "context_color-scheme",
            id: "context_color-scheme-default",
            label: "default",
            checked: ui.settings.COLOR_SCHEME === "default",
            event: "onchange=\"ui.settings.COLOR_SCHEME = 'default'\"",
          },
          {
            type: "radio",
            name: "context_color-scheme",
            id: "context_color-scheme-pink",
            label: "pink",
            checked: ui.settings.COLOR_SCHEME === "pink",
            event: "onchange=\"ui.settings.COLOR_SCHEME = 'pink'\"",
          },
          {
            type: "radio",
            name: "context_color-scheme",
            id: "context_color-scheme-lightgreen",
            label: "lightgreen",
            checked: ui.settings.COLOR_SCHEME === "lightgreen",
            event: "onchange=\"ui.settings.COLOR_SCHEME = 'lightgreen'\"",
          },
          {
            type: "radio",
            name: "context_color-scheme",
            id: "context_color-scheme-lightblue",
            label: "lightblue",
            checked: ui.settings.COLOR_SCHEME === "lightblue",
            event: "onchange=\"ui.settings.COLOR_SCHEME = 'lightblue'\"",
          },
          {
            type: "radio",
            name: "context_color-scheme",
            id: "context_color-scheme-blue",
            label: "blue",
            checked: ui.settings.COLOR_SCHEME === "blue",
            event: "onchange=\"ui.settings.COLOR_SCHEME = 'blue'\"",
          },
          {
            type: "radio",
            name: "context_color-scheme",
            id: "context_color-scheme-synthwave",
            label: "synthwave",
            checked: ui.settings.COLOR_SCHEME === "synthwave",
            event: "onchange=\"ui.settings.COLOR_SCHEME = 'synthwave'\"",
          },
          {
            type: "radio",
            name: "context_color-scheme",
            id: "context_color-scheme-darkblue",
            label: "darkblue",
            checked: ui.settings.COLOR_SCHEME === "darkblue",
            event: "onchange=\"ui.settings.COLOR_SCHEME = 'darkblue'\"",
          },
          {
            type: "radio",
            name: "context_color-scheme",
            id: "context_color-scheme-brown",
            label: "brown",
            checked: ui.settings.COLOR_SCHEME === "brown",
            event: "onchange=\"ui.settings.COLOR_SCHEME = 'brown'\"",
          },
          {
            type: "radio",
            name: "context_color-scheme",
            id: "context_color-scheme-pastel",
            label: "pastel",
            checked: ui.settings.COLOR_SCHEME === "pastel",
            event: "onchange=\"ui.settings.COLOR_SCHEME = 'pastel'\"",
          },
          {
            type: "radio",
            name: "context_color-scheme",
            id: "context_color-scheme-retro",
            label: "retro",
            checked: ui.settings.COLOR_SCHEME === "retro",
            event: "onchange=\"ui.settings.COLOR_SCHEME = 'retro'\"",
          },
          {
            type: "radio",
            name: "context_color-scheme",
            id: "context_color-scheme-vintage",
            label: "vintage",
            checked: ui.settings.COLOR_SCHEME === "vintage",
            event: "onchange=\"ui.settings.COLOR_SCHEME = 'vintage'\"",
          },
          {
            type: "radio",
            name: "context_color-scheme",
            id: "context_color-scheme-neon",
            label: "neon",
            checked: ui.settings.COLOR_SCHEME === "neon",
            event: "onchange=\"ui.settings.COLOR_SCHEME = 'neon'\"",
          },
          {
            type: "radio",
            name: "context_color-scheme",
            id: "context_color-scheme-gray",
            label: "gray",
            checked: ui.settings.COLOR_SCHEME === "gray",
            event: "onchange=\"ui.settings.COLOR_SCHEME = 'gray'\"",
          },
          {
            type: "radio",
            name: "context_color-scheme",
            id: "context_color-scheme-custom",
            label: "custom",
            checked: ui.settings.COLOR_SCHEME === "custom",
            event: "onchange=\"ui.settings.COLOR_SCHEME = 'custom'\"",
          },
        ],
        //  () => {
        //   return Object.getOwnPropertyNames(colorPresets).reduce((colorsMenuItems, name) => {
        //     let menuItem = {
        //       type: "radio",
        //       name: "context_color-scheme",
        //       id: `context_color-scheme-${name}`,
        //       label: `${name}`,
        //       checked: this.COLOR_SCHEME === name,
        //       event: `onchange="ui.settings.COLOR_SCHEME = '${name}'"`,
        //     }
        //     colorsMenuItems.push(menuItem);
        //     return colorsMenuItems;
        //   }, [])
        // }
      },
      // {
      //   label: "Font",
      //   elements: [{
      //     type: "range",
      //     id: "context_font-size",
      //     label: "Font size",
      //     event: "oninput =\"ui.settings.FONT_SIZE = this.value;\"",
      //     prefix: "Font size",
      //     minRange: 12,
      //     maxRange: 20,
      //     value: ui.settings.FONT_SIZE,
      //   },
      //   {
      //     prefix: "<a href='https://fonts.google.com/' title='go to google fonts' target='_blanc'>Font family</a>",
      //     postfix: "",
      //     type: "text-input",
      //     id: "context-menu_font-family",
      //     label: "Font family",
      //     title: "paste embed code of custom font(@import... or url...) or write 'def' to reset it",
      //     placeholder: this.FONT_NAME,
      //     event: `onchange="ui.settings.loadCustomFont(this.value);"`,
      //   }]
      // },

      {
        label: "Show bg-animation",
        type: "checkbox",
        name: "context_show-bg-animation",
        id: "context_show-bg-animation",
        checked: ui.settings.BG_ANIMATION,
        event: `onchange="ui.settings.BG_ANIMATION = this.checked;"`,
      },
      {
        label: "Start on load",
        type: "checkbox",
        name: "context_show-start-on-load",
        id: "context_show-start-on-load",
        checked: ui.settings.START_ON_LOAD,
        event: `onchange="ui.settings.START_ON_LOAD = this.checked;"`,
      }

    ]
  }
  get FONT_SIZE() {
    return config?._cfg.settings?.fontSize ?? 14;
  }
  set FONT_SIZE(value) {
    config._cfg.settings.fontSize = value;
    config.writeConfiguration();
    document.documentElement.style.setProperty('font-size', `${this.FONT_SIZE}px`);
  }
  get FONT_FAMILY() {
    return this.fonts[config._cfg?.fontSelectorName ?? "default"]
  }
  get FONT_NAME() {
    let regFontName = new RegExp(/(?<=family=)([A-Za-z0-9+);])*/gmi);
    let fontName = "default";
    if (regFontName.test(this.FONT_FAMILY)) {
      fontName = this.FONT_FAMILY.match(regFontName)[0].replaceAll("+", " ")
    }
    return fontName;
  }
  set FONT_FAMILY(value) {
    let regFontFamily = new RegExp(/https:\/\/[^'");]*/gmi);
    let regFontName = new RegExp(/(?<=family=)([A-Za-z0-9+);])*/gmi);
    if (regFontFamily.test(value)) {
      let fontFamily = value.match(regFontFamily)[0];
      let fontName = value.match(regFontName)[0].replaceAll("+", " ");
      const fontLink = document.createElement('link');
      fontLink.rel = 'stylesheet';
      fontLink.href = fontFamily;
      document.head.appendChild(fontLink);
      document.documentElement.style.setProperty("--font-family", `"${fontName}", system-ui, sans-serif`);
    }
    if (value == "def") {
      // config._cfg.settings.fontFamily = "";
      // config.writeConfiguration();
      document.documentElement.style.setProperty("--font-family", ` system-ui, sans-serif`);
    }

  }
  loadCustomFont(value) {
    const font = this.parseFontUrl(value);
    if (font) {
      config._cfg.settings.customFontFamily = font.fontFamily;
      this.fontColorInput.value = font.fontName;
      this.FONT_FAMILY = font.fontFamily;
      this.fontSelector.value = "custom";
      config._cfg.fontSelectorName = "custom";
      config.writeConfiguration();
    }
    if (value == "def") {
      config._cfg.settings.fontFamily = "";
      config.writeConfiguration();
      document.documentElement.style.setProperty("--font-family", ` system-ui, sans-serif`);
    }
  }
  parseFontUrl(value) {
    let regFontFamily = new RegExp(/https:\/\/[^'");]*/gmi);
    let regFontName = new RegExp(/(?<=family=)([A-Za-z0-9+);])*/gmi);
    if (regFontFamily.test(value)) {
      let fontFamily = value.match(regFontFamily)[0];
      let fontName = value.match(regFontName)[0].replaceAll("+", " ");
      return { fontFamily: fontFamily, fontName: fontName };
    }

  }
  get COLOR_SCHEME() {
    return config._cfg.settings.preset || "default";
  }
  set COLOR_SCHEME(value) {
    config._cfg.settings.preset = value;
    config.writeConfiguration();
    UI.updateColors(value);
  }
  get BG_ANIMATION() {
    return config._cfg.settings.bgVisibility ?? true;
  }
  set BG_ANIMATION(value) {
    config._cfg.settings.bgVisibility = value;
    config.writeConfiguration();
    document.querySelector("#background-animation").style.display =
      config.bgVisibility ? "block" : "none";
  }
  get START_ON_LOAD() {
    return config._cfg.settings.startOnLoad ?? false;
  }
  set START_ON_LOAD(value) {
    config._cfg.settings.startOnLoad = value;
    config.writeConfiguration();
  }
  fonts = {
    default: "def",
    pixelifySans: 'https://fonts.googleapis.com/css2?family=Pixelify+Sans',
    jaro: 'https://fonts.googleapis.com/css2?family=Jaro',
    oxygen: 'https://fonts.googleapis.com/css2?family=Oxygen:wght@300;400;700',
    jacquard: 'https://fonts.googleapis.com/css2?family=Jacquard+24',
    shadows: 'https://fonts.googleapis.com/css2?family=Shadows+Into+Light&display=swap',
    custom: config._cfg?.settings?.customFontFamily ?? "def",
  }
  constructor() {
    this.setValues();
  }
  setValues() {
    this.FONT_SIZE = this.FONT_SIZE;
    this.FONT_FAMILY = this.fonts[config._cfg?.fontSelectorName ?? "default"];
  }
  getLastGameID() {
    apiWorker.getProfileInfo({}).then((resp) => {
      document.getElementById("settings_game-id-input").value = resp.LastGameID;
      config.gameID = resp.LastGameID;
      ui.getAchievements();
    });
  }
  selectFont(fontName) {
    const font = fontName;
    // this.fontColorInput.value = "this.FONT_NAME";
    this.FONT_FAMILY = this.fonts[font];
    config._cfg.fontSelectorName = font;
    config.writeConfiguration();
    // this.fontUrlInput.value = this.FONT_NAME;
  }

  close() {
    ui.buttons.settings.checked = false;
    this.section && this.section.remove();
  }
  openSettings(settingsItems = this.settingsItems) {
    this.close();

    this.section = this.generateSettingsContainer(settingsItems)

    config.ui.settings_section && (
      config.ui.settings_section.x && (this.section.style.left = config.ui.settings_section.x),
      config.ui.settings_section.y && (this.section.style.top = config.ui.settings_section.y)
    )

    this.section.querySelector(".header-container").addEventListener("mousedown", (e) => {
      UI.moveEvent(this.section, e);
    });

    this.section.addEventListener("click", (e) => {
      this.section.querySelectorAll(".extended").forEach(el => el.classList.remove("extended"));
    });

    ui.app.appendChild(this.section);
    ui.buttons.settings.checked = true;
  }
  generateSettingsContainer(settingsItems) {
    const settingsElement = document.createElement('section');
    settingsElement.classList.add("prefs_section", "section");
    settingsElement.id = "settings_section";
    settingsElement.innerHTML = `
      <div class="header-container prefs-header-container">
        <div class="header-icon settings-icon"><svg xmlns="http://www.w3.org/2000/svg" height="24" fill="white" viewBox="0 -960 960 960" width="24">
            <path d="m370-80-16-128q-13-5-24.5-12T307-235l-119 50L78-375l103-78q-1-7-1-13.5v-27q0-6.5 1-13.5L78-585l110-190 119 50q11-8 23-15t24-12l16-128h220l16 128q13 5 24.5 12t22.5 15l119-50 110 190-103 78q1 7 1 13.5v27q0 6.5-2 13.5l103 78-110 190-118-50q-11 8-23 15t-24 12L590-80H370Zm70-80h79l14-106q31-8 57.5-23.5T639-327l99 41 39-68-86-65q5-14 7-29.5t2-31.5q0-16-2-31.5t-7-29.5l86-65-39-68-99 42q-22-23-48.5-38.5T533-694l-13-106h-79l-14 106q-31 8-57.5 23.5T321-633l-99-41-39 68 86 64q-5 15-7 30t-2 32q0 16 2 31t7 30l-86 65 39 68 99-42q22 23 48.5 38.5T427-266l13 106Zm42-180q58 0 99-41t41-99q0-58-41-99t-99-41q-59 0-99.5 41T342-480q0 58 40.5 99t99.5 41Zm-2-140Z"></path>
          </svg></div>
        <h2 class="widget-header-text prefs-header">Settings</h2>
        <button class="header-button header-icon" onclick="ui.settings.close()">
          <svg height="24" viewBox="0 -960 960 960" width="24">
            <path d="m256-200-56-56 224-224-224-224 56-56 224 224 224-224 56 56-224 224 224 224-56 56-224-224-224 224Z"></path>
          </svg>
        </button>
      </div>
      <div class="settings_container "></div>
    `;

    const settingsContainerElement = document.createElement("ul");
    settingsContainerElement.classList.add("settings_container", "content-container");
    const generateSettingInput = (settingItem) => {
      switch (settingItem.type) {
        case "button":
          return `
            <button class="button-input" ${settingItem.event ?? ""} onclick="${settingItem.onClick ?? ""}">${settingItem.label}</button>
          `;
        case "checkbox":
          return `
            <div class="checkbox-input_container">
              <input ${settingItem.event ?? "--"}  onchange="${settingItem.onChange ?? ""}" type="checkbox" id="${settingItem.id}" ${settingItem.checked && "checked"}>
              <label class="checkbox-input" for="${settingItem.id}">${settingItem.label}</label>
            </div>
          `;
        case "radio":
          return `
            <div class="radio-input_container">
              <input ${settingItem.event ?? "--"} name="${settingItem.name}"  onchange="${settingItem.onChange ?? ""}" type="radio" id="${settingItem.id}" ${settingItem.checked && "checked"}>
              <label class="checkbox-input" for="${settingItem.id}">${settingItem.label}</label>
            </div>
          `;
        case "select":
          return `
            <button class="select-button" id="${settingItem.id}" onclick="this.classList.toggle('extended'); event.stopPropagation();">
              <div class="select-label"> ${settingItem.label}</div>
              <div class="select-menu">
             ${UI.generateContextMenu({ menuItems: settingItem.selectValues }).innerHTML}
           
              </div>
            </button>
          `;
        case "number":
        case "input-number":
          return `
          <input type="number" title="${settingItem.title ? settingItem.title : settingItem.prefix ?? ""}" class="text-input" id="${settingItem.id}" value="${settingItem.value}"
               placeholder="${settingItem.label}" onchange="${settingItem.onChange}"/>
            `;
        case "text-input":
          return `
              <input type="text" class="text-input" id="${settingItem.id}" value="${settingItem.value}"
               placeholder="${settingItem.label}" onchange="${settingItem.onChange}"/>
            `;
        case "search":
          return `
              <input type="search" class="text-input" id="${settingItem.id}" value="${settingItem.value}"
               placeholder="${settingItem.label}" onchange="${settingItem.onChange}"/>
            `;
        case "color":
          return `
          <input type="color" class="color-input" onchange="${settingItem.onChange}" value="${settingItem.value}" id="${settingItem.id}" title="${settingItem.label}" />
          `;
        default:
          return "default";
      }
    }
    settingsItems.forEach(setting => {
      const settingItemsLine = document.createElement("li");
      settingItemsLine.classList.add("settings_setting-line");
      settingItemsLine.innerHTML = `
        <h3 class="settings_setting-header">${setting?.label}</h3>
      `;
      if (setting.elements) {
        setting.elements.forEach(settingItem => {
          settingItemsLine.innerHTML += (generateSettingInput(settingItem));
        })
      }
      else {
        settingItemsLine.innerHTML += (generateSettingInput(setting));
      }

      settingsContainerElement.appendChild(settingItemsLine);

    })
    settingsElement.appendChild(settingsContainerElement);
    return settingsElement;
  }
}

class GameCard {
  get VISIBLE() {
    return !this.section.classList.contains("hidden");
  }
  get SHOW_BADGES() {
    return config.ui?.game_section?.showBadges ?? true;
  }
  set SHOW_BADGES(value) {
    config.ui.game_section.showBadges = value;
    config.writeConfiguration();
    this.updateGameCardInfo(ui.GAME_DATA);
  }
  get contextMenuItems() {
    return [...this.contexMenuSettingsItems, ...this.contextMenuPropertiesItems];
  }
  get contextMenuPropertiesItems() {
    return this._contextMenuPropertiesItems;
  }
  set contextMenuPropertiesItems(value) {
    this._contextMenuPropertiesItems = value;
  }
  get contexMenuSettingsItems() {
    return [
      {
        label: "Show title badges",
        type: "checkbox",
        name: "game-card_show-badges",
        id: "game-card_show-badges",
        event: `onchange="ui.gameCard.SHOW_BADGES = this.parentNode.querySelector('input').checked"`,
        checked: this.SHOW_BADGES,
      }
    ]
  }

  _contextMenuPropertiesItems = [
    {
      label: "Platform",
      type: "checkbox",
      name: "context_show-platform",
      id: "context_show-platform",
      event: `onchange="ui.gameCard.updateGameInfoElement({name:'Platform', checkbox: this.parentNode.querySelector('input')})"`,
      checked: true,
    },
    {
      label: "Developer",
      type: "checkbox",
      name: "context_show-developer",
      id: "context_show-developer",
      event: `onchange="ui.gameCard.updateGameInfoElement({name:'Developer', checkbox: this.parentNode.querySelector('input')})"`,
      checked: true,
    },
    {
      label: "Publisher",
      type: "checkbox",
      name: "context_show-publisher",
      id: "context_show-publisher",
      event: `onchange="ui.gameCard.updateGameInfoElement({name:'Publisher', checkbox: this.parentNode.querySelector('input')})"`,
      checked: true,
    },
    {
      label: "Genre",
      type: "checkbox",
      name: "context_show-genre",
      id: "context_show-genre",
      event: `onchange="ui.gameCard.updateGameInfoElement({name:'Genre', checkbox: this.parentNode.querySelector('input')})"`,
      checked: true,
    },
    {
      label: "Released",
      type: "checkbox",
      name: "context_show-released",
      id: "context_show-released",
      event: `onchange="ui.gameCard.updateGameInfoElement({name:'Released', checkbox: this.parentNode.querySelector('input')})"`,
      checked: true,
    },
    {
      label: "Points",
      type: "checkbox",
      name: "context_show-points",
      id: "context_show-points",
      event: `onchange="ui.gameCard.updateGameInfoElement({name:'Points', checkbox: this.parentNode.querySelector('input')})"`,
      checked: true,
    },
    {
      label: "Players",
      type: "checkbox",
      name: "context_show-players",
      id: "context_show-players",
      event: `onchange="ui.gameCard.updateGameInfoElement({name:'Players', checkbox: this.parentNode.querySelector('input')})"`,
      checked: true,
    },
    {
      label: "Completion",
      type: "checkbox",
      name: "context_show-completion",
      id: "context_show-completion",
      event: `onchange="ui.gameCard.updateGameInfoElement({name:'Completion', checkbox: this.parentNode.querySelector('input')})"`,
      checked: true,
    },
    {
      label: "Achievements",
      type: "checkbox",
      name: "context_show-achievements",
      id: "context_show-achievements",
      event: `onchange="ui.gameCard.updateGameInfoElement({name:'Achievements', checkbox: this.parentNode.querySelector('input')})"`,
      checked: true,
    },
  ];
  gameInfoElements = {
    Platform: { title: "Platform", id: "game-card-platform" },
    Developer: { title: "Developer", id: "game-card-developer" },
    Publisher: { title: "Publisher", id: "game-card-publisher" },
    Genre: { title: "Genre", id: "game-card-genre" },
    Released: { title: "Released", id: "game-card-released" },
    Completion: { title: "Completion", id: "game-card-completion", value: "" },
    Points: { title: "Points", id: "game-card-points-total" },
    Players: { title: "Players", id: "#game-card-players-total" },
    Achievements: { title: "Achievements", id: "game-card-achivs-count" },
  };
  updateGameInfoElement({ name, value, visibility, checkbox }) {
    if (this.gameInfoElements.hasOwnProperty(name)) {
      if (checkbox) {
        visibility = checkbox.checked ? "visible" : "hidden";
        this.gameInfoElements[name].visibility = visibility;
        this.contextMenuPropertiesItems.map((menuItem) => {
          menuItem.label == name ? (menuItem.checked = checkbox.checked) : "";
        });
        if (!config.ui.hasOwnProperty("game_section")) {
          config.ui.game_section = [];
        }
        config.ui.game_section.gameInfoElements = this.gameInfoElements;
        config.ui.game_section.contextMenuPropertiesItems = this.contextMenuPropertiesItems;
        config.writeConfiguration();
      }
      value ? (this.gameInfoElements[name].value = value) : "";
      visibility ? (this.gameInfoElements[name].visibility = visibility) : "";
    }

    this.generateInfo();
  }
  constructor() {
    this.loadSavedData();
    this.initializeElements();
    this.addEvents();
  }
  loadSavedData() {
    config.ui?.game_section?.gameInfoElements
      ? (this.gameInfoElements = config.ui.game_section.gameInfoElements)
      : "";
    config.ui?.game_section?.contextMenuItems
      ? (this.contextMenuPropertiesItems = config.ui.game_section.contextMenuItems)
      : "";
  }
  initializeElements() {
    // Знаходимо контейнер для інформації про гру
    this.section = document.querySelector(".game-card_section");

    // Знаходимо заголовок гри
    this.header = document.querySelector("#game-card-header");

    // Знаходимо блок з описом гри
    this.descriptions = document.querySelector(".game-card-description");

    // Знаходимо зображення гри
    this.preview = document.querySelector("#game-card-image");

    // Знаходимо елементи інформації про гру: платформа, розробник, видавець, жанр, дата випуску, статус завершення
    this.platform = document.querySelector("#game-card-platform");
    this.developer = document.querySelector("#game-card-developer");
    this.publisher = document.querySelector("#game-card-publisher");
    this.genre = document.querySelector("#game-card-genre");
    this.released = document.querySelector("#game-card-released");
    this.completion = document.querySelector("#game-card-completion");
    this.achivsCount = document.querySelector("#game-card-achivs-count");
    this.playersCount = document.querySelector("#game-card-players-total");
    this.pointsCount = document.querySelector("#game-card-points-total");

    // Знаходимо елемент, який відповідає за ресайз блоку
    this.resizer = document.querySelector("#game-card-resizer");
  }
  addEvents() {
    this.section.addEventListener("mousedown", (e) => {
      UI.moveEvent(this.section, e);
    });
    this.section.addEventListener("contextmenu", (e) => {
      e.preventDefault();
      e.stopPropagation();
      document.querySelector(".context-menu")?.remove();
      // this.contextMenu ? this.contextMenu.remove() : "";
      this.contextMenu = UI.generateContextMenu({
        menuItems: this.contextMenuItems,
        sectionCode: "",
      });
      this.section.appendChild(this.contextMenu);

      e.x + this.contextMenu.offsetWidth > window.innerWidth
        ? (this.contextMenu.style.left =
          e.x - this.contextMenu.offsetWidth + "px")
        : (this.contextMenu.style.left = e.x + "px");
      e.y + this.contextMenu.offsetHeight > window.innerHeight
        ? (this.contextMenu.style.top =
          e.y - this.contextMenu.offsetHeight + "px")
        : (this.contextMenu.style.top = e.y + "px");

      this.contextMenu.classList.remove("hidden");
    });
    this.resizer.addEventListener("mousedown", (event) => {
      event.stopPropagation();
      this.section.classList.add("resized");
      UI.resizeEvent({
        event: event,
        section: this.section,
      });
    });
  }
  updateGameCardInfo({
    Title,
    FixedTitle,
    ID,
    ImageBoxArt,
    ConsoleName,
    Developer,
    Publisher,
    Genre,
    Released,
    achievements_published,
    players_total,
    points_total,
    badges,
  }) {
    this.header.innerHTML = `${FixedTitle} ${this.SHOW_BADGES ? generateBadges(badges) : ""} `;
    this.header.setAttribute(
      "href",
      `https://retroachievements.org/game/${ID}`
    );
    this.preview.setAttribute(
      "src",
      `https://media.retroachievements.org${ImageBoxArt}`
    );

    this.gameInfoElements.Platform.value = ConsoleName;
    this.gameInfoElements.Developer.value = Developer;
    this.gameInfoElements.Publisher.value = Publisher;
    this.gameInfoElements.Genre.value = Genre;
    this.gameInfoElements.Released.value = Released;
    this.gameInfoElements.Points.value = points_total;
    this.gameInfoElements.Players.value = players_total;
    this.gameInfoElements.Achievements.value = achievements_published;

    this.generateInfo();
  }

  generateInfo() {
    this.descriptions.innerHTML = "";
    Object.getOwnPropertyNames(this.gameInfoElements).forEach((prop) => {
      let gameInfo = document.createElement("div");
      gameInfo.classList.add("game-card-info");
      gameInfo.classList.toggle(
        "hidden",
        this.gameInfoElements[prop].visibility == "hidden"
      );

      gameInfo.innerHTML = `
      <h3 class="game-info-header">${this.gameInfoElements[prop].title}</h3>
      <p class="game-card-text" id="${this.gameInfoElements[prop].id}">${this.gameInfoElements[prop].value}</p>
      `;
      this.descriptions.appendChild(gameInfo);
    });
  }
  close() {
    //gkfdsgkgfsd
    ui.buttons.gameCard.click();
  }
}

class Awards {
  get VISIBLE() {
    return !this.section.classList.contains("hidden");
  }
  awardTypes = {
    mastery: "mastery",
    completion: "completion",
    beatenSoftcore: "beatenSoftcore",
    beatenHardcore: "beatenHardcore",
  };
  constructor() {
    this.initializeElements();
    this.addEvents();

  }
  initializeElements() {
    this.section = document.querySelector(".awards_section"); // Контейнер інформації про гру
    this.header = document.querySelector(".awards-header_container");
    this.container = document.querySelector(".awards-content_container");
    this.resizer = document.querySelector("#awards-resizer");
  }
  addEvents() {
    // Додавання подій для пересування вікна досягнень
    this.header.addEventListener("mousedown", (e) => {
      UI.moveEvent(this.section, e);
    });
    // this.section.querySelector("#awards-button").click();
    this.resizer.addEventListener("mousedown", (event) => {
      event.stopPropagation();
      this.section.classList.add("resized");
      UI.resizeEvent({
        event: event,
        section: this.section,
      });
    });
  }
  async updateAwards() {
    const response = await apiWorker.getUserAwards({});
    if (
      response.TotalAwardsCount != this.container.dataset.total ||
      response.MasteryAwardsCount != this.container.dataset.mastery ||
      response.BeatenHardcoreAwardsCount != this.container.dataset.beatenHard
    ) {
      this.parseAwards(response);
    }
  }
  parseAwards(userAwards) {
    if (!userAwards?.TotalAwardsCount) return;
    this.container.innerHTML = "";

    // Отримуємо доступ до об'єкту dataset з контейнера
    const { dataset } = this.container;
    // Присвоюємо значення полям об'єкту dataset на основі даних з userAwards
    dataset.total = userAwards.TotalAwardsCount;
    dataset.beatenSoftcore = userAwards.BeatenSoftcoreAwardsCount;
    dataset.beatenHard = userAwards.BeatenHardcoreAwardsCount;
    dataset.completion = userAwards.CompletionAwardsCount;
    dataset.mastery = userAwards.MasteryAwardsCount;

    // Створюємо копію масиву нагород користувача
    let gamesArray = [...userAwards.VisibleUserAwards];

    // Викликаємо метод fixGamesProperties для виправлення властивостей ігор
    gamesArray = this.fixGamesProperties(gamesArray);

    // Генеруємо відсортований масив груп нагород з відсортованих ігор
    const sortedGames = this.generateAwardsGroupsArray(gamesArray);

    // Генеруємо нагороди для консолей
    this.generateConsolesAwards(sortedGames);
  }

  fixGamesProperties(gamesArray) {
    return (
      gamesArray
        .map((game) => {
          // Перетворюємо строку дати на об'єкт Date
          game.awardedDate = new Date(game.AwardedAt);

          // Встановлюємо правильний тип нагороди для гри на основі додаткових даних
          game.awardeTypeFixed =
            game.AwardType === "Game Beaten"
              ? game.AwardDataExtra === 1
                ? this.awardTypes.beatenHardcore
                : this.awardTypes.beatenSoftcore
              : game.AwardDataExtra === 1
                ? this.awardTypes.mastery
                : this.awardTypes.completion;
          return game;
        })
        // Сортуємо ігри за датою нагородження в спадаючому порядку
        .sort((a, b) => {
          return b.awardedDate - a.awardedDate;
        })
    );
  }
  //Групуємо нагороди по консолям
  generateAwardsGroupsArray(gamesArray) {
    return gamesArray.reduce(
      (sortedGames, game) => {
        if (!sortedGames.hasOwnProperty(game.ConsoleName)) {
          sortedGames[game.ConsoleName] = [];
        }
        sortedGames[game.ConsoleName].push(game);
        sortedGames["Total"].push(game);
        return sortedGames;
      },
      { Total: [] }
    );
  }
  generateConsolesAwards(sortedGames) {
    Object.getOwnPropertyNames(sortedGames).forEach((consoleName) => {
      let consoleListItem = document.createElement("li");
      consoleListItem.classList.add("console-awards");
      consoleName !== "Total" ? consoleListItem.classList.add("collapsed") : "";
      consoleListItem.dataset.consoleName = consoleName;
      let total = sortedGames[consoleName].length;
      const awardsCount = ({ awardType, gamesArray }) =>
        gamesArray.filter((game) => game.awardeTypeFixed === awardType).length;
      let beatenSoftcore = awardsCount({
        awardType: this.awardTypes.beatenSoftcore,
        gamesArray: sortedGames[consoleName],
      });
      let beaten = awardsCount({
        awardType: this.awardTypes.beatenHardcore,
        gamesArray: sortedGames[consoleName],
      });
      let compleated = awardsCount({
        awardType: this.awardTypes.completion,
        gamesArray: sortedGames[consoleName],
      });
      let mastered = awardsCount({
        awardType: this.awardTypes.mastery,
        gamesArray: sortedGames[consoleName],
      });
      consoleListItem.innerHTML = `
        <h3 class="awards-console_header" onclick="ui.awards.expandAwards(this)">${consoleName}</h3>
        <ul class="console-awards-values">      
          <li class="awarded-games total" title="total awards" onclick="ui.awards.filterAwards('all')">${total}</li>
          <li class="awarded-games beaten-softcore" title="beaten softcore" onclick="ui.awards.filterAwards('${this.awardTypes.beatenSoftcore
        }')">${beatenSoftcore}</li>
          <li class="awarded-games beaten"  title="beaten"  onclick="ui.awards.filterAwards('${this.awardTypes.beatenHardcore
        }')">${beaten}</li>
          <li class="awarded-games completed"  title="completed" onclick="ui.awards.filterAwards('${this.awardTypes.completion
        }')">${compleated}</li>
          <li class="awarded-games mastered"  title="mastered" onclick="ui.awards.filterAwards('${this.awardTypes.mastery
        }')">${mastered}</li>
        </ul>
        <button class="expand-awards_button" onclick="ui.awards.expandAwards(this)"> </button>
        <ul class="awarded-games_list  ${consoleName == "Total" ? "" : "hidden"
        } total">
        </ul>
        `;
      this.container.appendChild(consoleListItem);
      let gamesList = consoleListItem.querySelector(".awarded-games_list");
      sortedGames[consoleName].forEach((game) => {
        gamesList.appendChild(this.makeGameAwardsElement(game));
      });
    });
  }

  makeGameAwardsElement(game) {
    let gameElement = document.createElement("li");
    gameElement.classList.add("awarded-game", game.awardeTypeFixed);
    gameElement.innerHTML = `
          <img class="awarded-game-preview" src="https://media.retroachievements.org${game.ImageIcon}" alt=" ">
          <h3 class="game-title">${game.Title}</h3>
          <p class="console-name">${game.ConsoleName}</p>
          <p class="awarded-date">${game.timeString}</p>
      `;
    return gameElement;
  }

  expandAwards(element) {
    const consoleElement = element.parentNode;
    const expandContent = consoleElement.querySelector(".awarded-games_list");
    if (expandContent.classList.contains("hidden")) {
      consoleElement.classList.remove("collapsed");
      expandContent.classList.remove("hidden");
    } else {
      consoleElement.classList.add("collapsed");
      expandContent.classList.add("hidden");
    }
  }
  filterAwards(awardType) {
    let awards = this.container.querySelectorAll(".awarded-game");
    awards.forEach((award) => {
      award.classList.remove("hidden");
      if (!award.classList.contains(awardType) && awardType !== "all") {
        award.classList.add("hidden");
      }
    });
  }
  close() {
    ui.buttons.awards.click();
  }
}

class Target {
  sectionCode = "-target";
  get VISIBLE() {
    return !this.section.classList.contains("hidden");
  }
  get contextMenuItems() {
    return [
      {
        label: "Style",
        elements: [
          {
            label: "Show header",
            type: "checkbox",
            name: "context_hide-target-header",
            id: "context_hide-target-header",
            checked: this.SHOW_HEADER,
            event: `onchange="ui.target.SHOW_HEADER = this.checked;"`,
          },
          {
            label: "Show background",
            type: "checkbox",
            name: "context_hide-target-bg",
            id: "context_hide-target-bg",
            checked: !this.HIDE_BG,
            event: `onchange="ui.target.HIDE_BG = !this.checked;"`,
          },
          {
            type: "checkbox",
            name: "context_autoscroll-target",
            id: "context_autoscroll-target",
            label: "Autoscroll",
            checked: this.AUTOSCROLL,
            event: `onchange="ui.target.AUTOSCROLL = this.checked;"`,
          },
          {
            type: "checkbox",
            name: "context-hide-unearned",
            id: "context-hide-unearned",
            label: "Show overlay",
            checked: this.SHOW_PREV_OVERLAY,
            event: `onchange="ui.target.SHOW_PREV_OVERLAY = this.checked"`,
          },
          {
            type: "checkbox",
            name: "context-show-border",
            id: "context-show-border",
            label: "Show img border",
            checked: this.SHOW_PREV_BORDER,
            event: `onchange="ui.target.SHOW_PREV_BORDER = this.checked"`,
          },
          {
            type: "checkbox",
            name: "context-show-difficult",
            id: "context-show-difficult",
            label: "Show difficult",
            checked: this.SHOW_DIFFICULT,
            event: `onchange="ui.target.SHOW_DIFFICULT = this.checked"`,
          },
        ]
      },
      {
        label: "Sort",
        elements: [
          {
            type: "radio",
            name: "context-sort",
            id: "context-sort_latest",
            label: "Latest",
            checked: this.SORT_NAME === UI.sortMethods.latest,
            event: `onchange="ui.target.SORT_NAME = 'latest';"`,
          },
          {
            type: "radio",
            name: "context-sort",
            id: "context-sort_rarest",
            label: "Rarest",
            checked: this.SORT_NAME === UI.sortMethods.earnedCount,
            event: `onchange="ui.target.SORT_NAME = 'earnedCount';"`,
          },
          {
            type: "radio",
            name: "context-sort",
            id: "context-sort_points",
            label: "Points",
            checked: this.SORT_NAME === UI.sortMethods.points,
            event: `onchange="ui.target.SORT_NAME = 'points';"`,
          },
          {
            type: "radio",
            name: "context-sort",
            id: "context-sort_retropoints",
            label: "Retropoints",
            checked: this.SORT_NAME === UI.sortMethods.truepoints,
            event: `onchange="ui.target.SORT_NAME = 'truepoints';"`,
          },
          {
            type: "radio",
            name: "context-sort",
            id: "context-sort_default",
            label: "Default",
            checked: this.SORT_NAME === UI.sortMethods.default,
            event: `onchange="ui.target.SORT_NAME = 'default';"`,
          }, {
            type: "radio",
            name: "context-sort",
            id: "context-sort_level",
            label: "Level (if possible)",
            checked: this.SORT_NAME === UI.sortMethods.level,
            event: `onchange="ui.target.SORT_NAME = 'level';"`,
          },
          {
            type: "radio",
            name: "context-sort",
            id: "context-sort_dont-sort",
            label: "Disable",
            checked: this.SORT_NAME === UI.sortMethods.disable,
            event: `onchange="ui.target.SORT_NAME = 'disable';"`,
          },
          {
            type: "checkbox",
            name: "context-reverse-sort",
            id: "context-reverse-sort",
            label: "Reverse",
            checked: this.REVERSE_SORT == -1,
            event: `onchange="ui.target.REVERSE_SORT = this.checked"`,
          },
        ],
      },
      {
        label: "Filter",
        elements: [
          {
            type: "radio",
            name: "context-filter",
            id: "context_filter-progression",
            label: "Progression",
            checked: this.FILTER_NAME === UI.filterMethods.progression,
            event: `onchange="ui.target.FILTER_NAME = 'progression';"`,
          },
          {
            type: "radio",
            name: "context-filter",
            id: "context_filter-missable",
            label: "Missable",
            checked: this.FILTER_NAME === UI.filterMethods.missable,
            event: `onchange="ui.target.FILTER_NAME = 'missable';"`,
          },
          {
            type: "radio",
            name: "context-filter",
            id: "context_filter-earned",
            label: "Earned",
            checked: this.FILTER_NAME === UI.filterMethods.earned,
            event: `onchange="ui.target.FILTER_NAME = 'earned';"`,
          },
          {
            type: "radio",
            name: "context-filter",
            id: "context_filter-all",
            label: "All",
            checked: this.FILTER_NAME === UI.filterMethods.all,
            event: `onchange="ui.target.FILTER_NAME = 'all';"`,
          },
          {
            type: "checkbox",
            name: "context-reverse-filter",
            id: "context-reverse-filter",
            label: "Reverse",
            checked: this.REVERSE_FILTER,
            event: `onchange="ui.target.REVERSE_FILTER = this.checked;"`,
          },
          {
            type: "checkbox",
            name: "context-hide-filtered",
            id: "context-hide-filtered",
            label: "Hide filtered",
            checked: this.HIDE_FILTERED,
            event: `onchange="ui.target.HIDE_FILTERED = this.checked;"`,
          },
        ],
      },
      {
        label: "Clear",
        elements: [
          {
            type: "button",
            name: "context-clear-all",
            id: "context-clear-all",
            label: "Clear All",
            event: `onclick="ui.target.clearAllAchivements();"`,
          },
          {
            type: "checkbox",
            name: "context-autoclear",
            id: "context-autoclear",
            label: "Autoclear earned",
            checked: this.AUTOCLEAR,
            event: `onchange="ui.target.AUTOCLEAR = this.checked;"`,
          },
          {
            prefix: "Delay",
            postfix: "sec",
            type: "input-number",
            name: "context-autoclear-delay",
            id: "context-autoclear-delay",
            label: "Delay",
            value: this.AUTOCLEAR_DELAY,
            event: `onchange="ui.target.AUTOCLEAR_DELAY = this.value;"`,
          },
        ],
      },
      {
        label: "Fill",
        elements: [
          {
            type: "button",
            name: "context-fill",
            id: "context-fill",
            label: "Fill",
            event: `onclick="ui.target.fillItems()"`,
          },
          {
            type: "checkbox",
            name: "context-autofill",
            id: "context-autofill",
            label: "Autofill",
            checked: this.AUTOFILL,
            event: `onchange="ui.target.AUTOFILL = this.checked;"`,
          },
        ],
      },

    ];
  }
  get SHOW_HEADER() {
    return config?.ui.target_section?.showHeader ?? true;
  }
  set SHOW_HEADER(value) {
    config.ui.target_section.showHeader = value;
    config.writeConfiguration();
    this.section.classList.toggle("compact", !this.SHOW_HEADER);
  }
  get HIDE_BG() {
    return config?.ui.target_section?.hideBg ?? false;
  }
  set HIDE_BG(value) {
    config.ui.target_section.hideBg = value;
    config.writeConfiguration();
    this.section.classList.toggle("hide-bg", this.HIDE_BG);
  }

  set SORT_NAME(value) {
    config._cfg.settings.sortTargetBy = value;
    config.writeConfiguration();
    this.applySort();
  }
  get SORT_NAME() {
    return config._cfg.settings.sortTargetBy || UI.sortMethods.default;
  }
  get SORT_METHOD() {
    return UI.sortBy[this.SORT_NAME];
  }
  get REVERSE_SORT() {
    return config._cfg.settings.reverseSortTarget || 1;
  }
  set REVERSE_SORT(value) {
    config._cfg.settings.reverseSortTarget = value ? -1 : 1;
    config.writeConfiguration();
    this.applySort();
  }
  get FILTER_NAME() {
    return config._cfg.settings.filterTargetBy || UI.filterMethods.all;
  }
  set FILTER_NAME(value) {
    config._cfg.settings.filterTargetBy = value;
    config.writeConfiguration();
    this.applyFilter();
  }
  get FILTER_METHOD() {
    return UI.filterBy[this.FILTER_NAME];
  }
  get REVERSE_FILTER() {
    return config._cfg.settings.reverseFilterTarget ?? false;
  }
  set REVERSE_FILTER(value) {
    config._cfg.settings.reverseFilterTarget = value;
    config.writeConfiguration();
    this.applyFilter();
  }
  get HIDE_FILTERED() {
    return config._cfg.settings.hideFilteredTarget ?? false;
  }
  set HIDE_FILTERED(value) {
    config._cfg.settings.hideFilteredTarget = value;
    config.writeConfiguration();
    this.applyFilter();
  }
  get AUTOCLEAR() {
    return config._cfg.settings.autoClearTarget ?? false;
  }
  set AUTOCLEAR(value) {
    config._cfg.settings.autoClearTarget = value;
    config.writeConfiguration();
  }
  get AUTOFILL() {
    return config._cfg.settings.autoFillTarget ?? true;
  }
  set AUTOFILL(value) {
    config._cfg.settings.autoFillTarget = value;
    config.writeConfiguration();
  }
  get AUTOCLEAR_DELAY() {
    return Number(config._cfg.settings.autoClearTargetTime ?? 5);
  }
  set AUTOCLEAR_DELAY(value) {
    config._cfg.settings.autoClearTargetTime = value >= 0 ? value : 0;
    config.writeConfiguration();
  }
  get AUTOSCROLL() {
    return config?.ui?.target_section?.autoscroll ?? true;
  }
  set AUTOSCROLL(value) {
    config.ui.target_section.autoscroll = value;
    config.writeConfiguration();
    value ? this.startAutoScroll() : this.stopAutoScroll();
  }
  get SHOW_PREV_BORDER() {
    return config?.ui?.target_section?.showPrevBorder ?? true;
  }
  set SHOW_PREV_BORDER(value) {
    config.ui.target_section.showPrevBorder = value;
    config.writeConfiguration();
    this.container.querySelectorAll(".target-achiv").forEach(el => el.classList.toggle("border", value))
  }
  get SHOW_PREV_OVERLAY() {
    return config?.ui?.target_section?.showPrevOverlay ?? true;
  }
  set SHOW_PREV_OVERLAY(value) {
    config.ui.target_section.showPrevOverlay = value;
    config.writeConfiguration();
    this.container.querySelectorAll(".target-achiv").forEach(el => el.classList.toggle("overlay", value))
  }
  get SHOW_DIFFICULT() {
    return config?.ui?.target_section?.showDifficult ?? true;
  }
  set SHOW_DIFFICULT(value) {
    config.ui.target_section.showDifficult = value;
    config.writeConfiguration();
    this.container.querySelectorAll(".target-achiv").forEach(el => el.classList.toggle("show-difficult", value))
  }
  constructor() {
    this.initializeElements();
    this.addEvents();
    this.setValues();
  }
  initializeElements() {
    this.section = document.querySelector("#target_section");

    this.header = document.querySelector(".target-header_container");
    this.container = document.querySelector(".target-container");

    this.searchInput = this.section.querySelector("#target__searchbar");

    // this.moveToTopCheckbox = document.querySelector("#target-move-to-top");

    this.resizer = document.querySelector("#target-resizer");
  }

  addEvents() {
    // this.section.addEventListener("drop", (event) => {
    //   console.log(event);
    // })
    // Додавання подій для пересування вікна досягнень
    this.resizer.addEventListener("mousedown", (event) => {
      event.stopPropagation();
      this.section.classList.add("resized");
      UI.resizeEvent({
        event: event,
        section: this.section,
      });
    });
    // Додавання подій для пересування вікна target
    this.section.addEventListener("mousedown", (e) => {
      UI.moveEvent(this.section, e);
    });
    this.container.addEventListener("mousedown", (e) => e.stopPropagation())
    this.section.addEventListener("contextmenu", (event) => {
      ui.showContextmenu({
        event: event,
        menuItems: this.contextMenuItems,
        sectionCode: "",
      });
    });
    const dragElements = (container, onDragEnd) => {
      new Sortable(container, {
        group: {
          name: "cheevos", pull: false
        },
        animation: 100,
        chosenClass: "dragged",
        onAdd: function (evt) {
          const itemEl = evt.item;
          const id = itemEl.dataset.achivId;
          onDragEnd && onDragEnd(id);
        }
      });
    }
    dragElements(this.container, (id) => {
      ui.target.addAchieveToTarget(id);
      this.section.querySelector(".achiv-block")?.remove();
    })
    this.searchInput?.addEventListener("input", this.searchHandler)
  }
  searchHandler(event) {
    event.stopPropagation();
    const clearPrevQuery = () => {
      [...ui.target.container.querySelectorAll('.target-achiv')].forEach(target => {
        const id = target.dataset.achivId;
        const description = target.querySelector(".achiv-description");
        description && (description.innerText = ui.ACHIEVEMENTS[id].Description);
      })
    }
    const markQuery = (query) => {
      const regex = new RegExp(`(${query})`, 'gi');
      [...ui.target.container.querySelectorAll('.achiv-description')].forEach(description => {
        description.innerHTML = description.innerHTML.replace(regex, (g1) => `<span class="highlight-text">${g1}</span>`)
      })
    }
    clearPrevQuery();
    const query = event.target.value;
    query && markQuery(query);
    const firstHighlight = document.querySelector('.highlight-text');
    if (firstHighlight) {
      firstHighlight.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

  }
  setValues() {
    this.section.classList.toggle("compact", !this.SHOW_HEADER);
    this.section.classList.toggle("hide-bg", this.HIDE_BG);
    this.startAutoScroll();
  }
  updateEarnedAchieves({ earnedAchievementIDs: earnedAchievementsIDs }) {
    earnedAchievementsIDs.forEach(id => {
      const achivElement = this.container.querySelector(`.target-achiv[data-achiv-id='${id}']`);
      if (ui.ACHIEVEMENTS[id].isHardcoreEarned && achivElement) {
        achivElement.classList.add("earned", "hardcore", "show-hard-anim");
        achivElement.dataset.DateEarnedHardcore = ui.ACHIEVEMENTS[id].DateEarnedHardcore;
      }
      else {
        achivElement?.classList.add("earned", "show-hard-anim");
      }
      setTimeout(() => achivElement?.classList.remove("show-hard-anim"), 5000);
    });
    this.applyFilter();
    this.applySort();
  }
  autoscrollInterval;
  startAutoScroll(toBottom = true) {
    this.stopAutoScroll();
    let refreshRateMiliSecs = 50;

    let scrollContainer = this.container;
    let speedInPixels = 1;
    const pauseOnEndMilisecs = 2000;
    // Часовий інтервал для прокручування вниз
    if (this.AUTOSCROLL) {
      this.autoscrollInterval = setInterval(() => {
        if (scrollContainer.scrollHeight - scrollContainer.clientHeight <= 10) {
          this.stopAutoScroll();
        }
        if (toBottom) {
          scrollContainer.scrollTop += speedInPixels;
          if (
            scrollContainer.scrollTop + scrollContainer.clientHeight >=
            scrollContainer.scrollHeight
          ) {
            this.stopAutoScroll();
            setTimeout(() => this.startAutoScroll(false), pauseOnEndMilisecs);
          }
        } else {
          scrollContainer.scrollTop -= speedInPixels;
          if (scrollContainer.scrollTop === 0) {
            this.stopAutoScroll();
            setTimeout(() => this.startAutoScroll(true), pauseOnEndMilisecs);
          }
        }
      }, refreshRateMiliSecs);
      // Припиняємо прокручування при наведенні миші на контейнер
      scrollContainer.addEventListener("mouseenter", () => {
        speedInPixels = 0; // Зупиняємо інтервал прокрутки
      });

      // Відновлюємо прокрутку при відведенні миші від контейнера
      scrollContainer.addEventListener("mouseleave", () => {
        speedInPixels = 1;
      });
    }
  }
  stopAutoScroll() {
    clearInterval(this.autoscrollInterval);
  }
  isAchievementInTargetSection({ ID, targetContainer = this.container }) {
    const targetAchievements = [
      ...targetContainer.querySelectorAll(".target-achiv"),
    ].filter((el) => el.dataset.achivId == ID);

    return targetAchievements.length > 0;
  }
  addAchieveToTarget(id) {
    // if achiv already exist in target - return
    if (this.isAchievementInTargetSection({ ID: id })) {
      return;
    }
    const achievement = ui.ACHIEVEMENTS[id];
    const targetElement = document.createElement("li");

    const setClassesToElement = () => {
      targetElement.classList.add("target-achiv");
      targetElement.classList.toggle("border", this.SHOW_PREV_BORDER);
      targetElement.classList.toggle("overlay", this.SHOW_PREV_OVERLAY);
      targetElement.classList.toggle("show-difficult", this.SHOW_DIFFICULT);
      targetElement.classList.toggle("earned", achievement.isEarned);
      targetElement.classList.toggle("hardcore", achievement.isHardcoreEarned)
    }
    const setDataToElement = () => {
      targetElement.dataset.type = achievement.type;
      targetElement.dataset.Points = achievement.Points;
      targetElement.dataset.TrueRatio = achievement.TrueRatio;
      targetElement.dataset.DisplayOrder = achievement.DisplayOrder;
      achievement.DateEarnedHardcore && (targetElement.dataset.DateEarnedHardcore = achievement.DateEarnedHardcore);
      targetElement.dataset.NumAwardedHardcore = achievement.NumAwardedHardcore;
      targetElement.dataset.achivId = id;
      targetElement.dataset.level = achievement.level;
    }
    const setElementHtml = () => {
      const trueRatio = achievement.TrueRatio / achievement.Points;
      targetElement.innerHTML = `
      <button class="delete-from-target" title="remove from target" onclick="ui.target.deleteFromTarget(this)">
        <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 -960 960 960" width="24">
          <path d="M280-440h400v-80H280v80ZM480-80q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-80q134 0 227-93t93-227q0-134-93-227t-227-93q-134 0-227 93t-93 227q0 134 93 227t227 93Zm0-320Z"/>
        </svg>
      </button>
      <div class="prev">
          <img
            class="prev-img"
            src="${achievement.prevSrc}"
            alt=" "
          />
        </div>
        <div class="target-achiv-details">
          <h3 class="achiv-name">
            <a target="_blanc" href="https://retroachievements.org/achievement/${id}">
            ${achievement.level < 1000 ? `<p class="game-card_suffix suffix-bold bg_gold"> LVL ${achievement.level?.toString()?.replace(".", "-")} </p>` : ""}
              ${achievement.Title}
            </a>
          </h3>
          <p class="achiv-description">${achievement.Description}</p>
          <div class="target-other-descriptions">       
          <i class=" target_description-icon ${achievement.type ?? "none"}" title="achievement type"></i> 
          
            <p class="target-description-text" title="points"><i class="target_description-icon  points-icon"></i>${achievement.Points}
            </p>
            
            <p class="target-description-text" title="retropoints"><i class="target_description-icon  retropoints-icon"></i>${achievement.TrueRatio}
            </p>
            
            <p class="target-description-text" title="earned by"><i class="target_description-icon  trending-icon"></i>${~~(
          (100 * achievement.NumAwardedHardcore) / achievement.totalPlayers)}%
            </p>
             <p class="target-description-text" title="true ratio">
              <i class="target_description-icon  ${trueRatio > 13 ? "difficult-badge__hell" : ""}  rarity-icon"></i>
              ${trueRatio.toFixed(2)}
            </p>
            <p class="difficult-badge difficult-badge__${achievement.difficulty}">${achievement.difficulty}</p>
          </div>             
        </div>
      `;
    }

    function setEvents() {
      targetElement.addEventListener("mouseover", mouseOverEvent);
      targetElement.addEventListener("mouseleave", removePopups);
      targetElement.addEventListener("mousedown", (e) => {
        e.stopPropagation();
      });
    }
    //------- Popup-----------
    function setPopupPosition(popup, event) {
      //Start position relative achievement element

      const leftPos = event.x;
      const topPos = event.y;

      popup.style.left = leftPos + 50 + "px";
      popup.style.top = topPos + "px";

      //Check for collisions and fix position
      let { left, right, top, bottom } = popup.getBoundingClientRect();
      if (left < 0) {
        popup.classList.remove("left-side");
      }
      if (right > window.innerWidth) {
        popup.classList.add("left-side");
      }
      if (top < 0) {
        popup.classList.remove("top-side");
      } else if (bottom > window.innerHeight) {
        popup.classList.add("top-side");
      }
    }

    async function mouseOverEvent(event) {
      removePopups();

      const popup = UI.generateAchievementPopup(achievement);
      ui.app.appendChild(popup);

      setPopupPosition(popup, event);
      setTimeout(() => popup.classList.add("visible"), 333);
    }
    async function removePopups() {

      document.querySelectorAll(".popup").forEach((popup) => popup.remove());
    }


    setClassesToElement();
    setDataToElement();
    setElementHtml();
    this.container.appendChild(targetElement);
    setEvents();
    // for one element adding only
    if (!this.isDynamicAdding) {
      this.applyFilter();
      this.applySort();
    }
    // if adding earned element
    this.delayedRemove();
  }
  moveToTop(element) {
    if (this.REVERSE_SORT == 1) {
      this.container.prepend(element);
    } else {
      this.container.append(element);
    }
    this.applyFilter();
  }
  applyFilter() {
    UI.applyFilter({
      container: this.container,
      itemClassName: ".target-achiv",
      filterMethod: this.FILTER_METHOD,
      reverse: this.REVERSE_FILTER,
      isHide: this.HIDE_FILTERED,
    });
  }
  applySort() {
    UI.applySort({
      container: this.container,
      itemClassName: ".target-achiv",
      sortMethod: this.SORT_METHOD,
      reverse: this.REVERSE_SORT,
    });
  }
  highlightCurrentLevel(currentLevel) {
    [...this.container.querySelectorAll('.target-achiv')].forEach(cheevo => {
      cheevo.classList.remove("highlight");
      cheevo.dataset.level == currentLevel && cheevo.classList.add("highlight");
      if (!Number.isInteger(currentLevel)) {
        const mainLevel = parseInt(currentLevel);
        cheevo.dataset.level == mainLevel && cheevo.classList.add("highlight");
      }
    });

  }
  deleteFromTarget(button) {
    const element = button.closest(".target-achiv");
    element.classList.add('removing');

    setTimeout(() => element.remove(), 0);
  }
  clearEarned() {
    this.container.querySelectorAll(".target-achiv").forEach((achievement) => {
      if (achievement.classList.contains("hardcore")) {
        achievement.remove();
      }
    });
  }
  clearAllAchivements() {
    this.container.innerHTML = "";
  }
  delayedRemove() {
    if (this.AUTOCLEAR) {
      this.container.querySelectorAll(".earned").forEach((element) => {
        setTimeout(() => element.remove(), this.AUTOCLEAR_DELAY * 1000);
      });
    }
  }
  fillItems() {
    this.isDynamicAdding = true;
    this.clearAllAchivements();
    Object.keys(ui.ACHIEVEMENTS).forEach(id => {
      this.addAchieveToTarget(id)
    });

    this.applyFilter();
    this.applySort();
    this.isDynamicAdding = false;
  }

  close() {
    ui.buttons.target.click();
  }
}

class LoginCard {
  get VISIBLE() {
    return !this.section.classList.contains("hidden");
  }
  constructor() {
    this.initializeElements();
    this.addEvents();
    this.setValues();
  }
  initializeElements() {
    this.section = document.querySelector("#login_section");
    this.header = document.querySelector(".login-header_container");
    this.userName = document.querySelector("#login-user-name");
    this.apiKey = document.querySelector("#login-api-key");
    this.userImage = document.querySelector(".login-user-image");
    this.submitLoginButton = this.section.querySelector(".submit-login");
    this.linkGoogleButton = this.section.querySelector(".submit-login-google");
  }

  addEvents() {
    this.section.addEventListener("mousedown", (e) => {
      UI.moveEvent(this.section, e);
    });
  }
  setValues() {
    // Встановити ключ API з об'єкта ідентифікації користувача
    this.apiKey.value = config.API_KEY;

    // Встановити значення логіну та API з об'єкта ідентифікації користувача
    this.userName.value = config.USER_NAME;
    this.userImage.src = config.userImageSrc;

    if (config.identConfirmed) {
      this.submitLoginButton.classList.add("verified");
    }
    userAuthData?.isSignedIn && this.linkGoogleButton.classList.add("linked");
    this.linkGoogleButton.addEventListener("click", () => this.linkGoogleEvent());
  }

  async linkGoogleEvent() {
    if (userAuthData?.isSignedIn) {
      await logoutGoogle();
      this.linkGoogleButton.classList.remove("linked");
    }
    else {
      await loginWithGoogle();
      this.linkGoogleButton.classList.add("linked");

    }
  }

  pasteApiKeyFromClipboard() {
    navigator.clipboard
      .readText()
      .then((clipboardText) => {
        // Вставити значення з буферу обміну в поле вводу або куди-небудь інде
        this.apiKey.value = clipboardText;
        config.API_KEY = this.apiKey.value;
      })
      .catch((err) => {
        console.error("Не вдалося отримати доступ до буферу обміну:", err);
      });
  }

  submitLogin() {
    let userName = this.userName.value;
    let apiKey = this.apiKey.value;
    apiWorker
      .verifyUserIdent({ userName: userName, apiKey: apiKey })
      .then((userObj) => {
        if (!userObj.ID) this.errorLogin();
        else {
          this.updateLogin({
            userName: userName,
            apiKey: apiKey,
            userObj: userObj,
          });
          setTimeout(() => location.reload(), 1000);
        }
      });
  }
  updateLogin({ userName, apiKey, userObj }) {
    config.USER_NAME = userName;
    config.API_KEY = apiKey;
    config.identConfirmed = true;
    config.userImageSrc = `https://media.retroachievements.org${userObj?.UserPic}`;
    this.userImage.src = config.userImageSrc;
    document.querySelector("#submit-login").classList.remove("error");
    document.querySelector("#submit-login").classList.add("verified");
  }

  errorLogin() {
    config.identConfirmed = false;
    document.querySelector("#submit-login").classList.remove("verified");
    document.querySelector("#submit-login").classList.add("error");
  }
  close() {
    ui.buttons.login.click();
  }
}

class Games {
  get platformFilterItems() {
    const filters = Object.keys(platformsByManufacturer).reduce((items, brend) => {
      const groupItem = {
        label: brend,
        type: "group",
      }
      const platformItems = Object.keys(platformsByManufacturer[brend]).reduce((items, platformName) => {
        const filterItem = {
          label: platformName,
          type: "checkbox",
          name: 'filter-by-platform',
          checked: this.PLATFORMS_FILTER.includes(platformsByManufacturer[brend][platformName]),
          onChange: `ui.games.platformCheckboxChangeEvent(this,${platformsByManufacturer[brend][platformName]})`,
          id: `filter-by-platform-${platformsByManufacturer[brend][platformName]}`,
        }
        items.push(filterItem);
        return items;
      }, []);
      items = [...items, groupItem, ...platformItems];
      return items;
    }, [])

    return filters;
  }
  get awardsFilterItems() {
    const filters = Object.keys(this.awardTypes).reduce((items, awardType) => {
      const filterItem = {
        label: this.awardTypes[awardType],
        name: 'filter-by-award',
        checked: this.AWARD_FILTER.includes(awardType),
        onChange: `ui.games.awardCheckboxChangeEvent(this,"${awardType}")`,
        id: `filter-by-platform-${awardType}`,
      }
      items.push(filterItem);
      return items;
    }, [])
    return filters;
  }
  get genresFilterItems() {
    const filters = Object.keys(Genres).reduce((items, genreID) => {
      const filterItem = {
        label: Genres[genreID],
        name: 'filter-by-genre',
        checked: this.GENRE_FILTER.includes(genreID),
        onChange: `ui.games.genreCheckboxChangeEvent(this,"${genreID}")`,
        id: `filter-by-genre-${genreID}`,
      }
      items.push(filterItem);
      return items;
    }, [])
    return filters;
  }
  get VISIBLE() {
    return !this.section.classList.contains("hidden");
  }
  set FAVOURITES(value) {
    this._favs = value;
    config.ui.favouritesGames = value;
    config.writeConfiguration();
  }
  get FAVOURITES() {
    return this._favs ?? [];
  }
  set COOP_FILTER(value) {
    config.ui.games_section.coopOnly = value;
    config.writeConfiguration();
    this.updateGamesList();
  }
  get COOP_FILTER() {
    return config.ui.games_section?.coopOnly ?? false;
  }
  awardCheckboxChangeEvent(checkbox, awardType) {
    let awards = this.AWARD_FILTER;
    checkbox.checked ?
      awards.push(awardType) :
      (awards = awards.filter(code => code != awardType));
    this.AWARD_FILTER = awards;
  }
  platformCheckboxChangeEvent(checkbox, platformCode) {
    let platforms = this.PLATFORMS_FILTER;
    checkbox.checked ?
      platforms.push(platformCode + '') :
      (platforms = platforms.filter(code => code != platformCode));
    this.PLATFORMS_FILTER = platforms;
  }
  genreCheckboxChangeEvent(checkbox, genreCode) {
    let genres = this.GENRE_FILTER;
    checkbox.checked ?
      genres.push(genreCode) :
      (genres = genres.filter(code => code != genreCode));
    this.GENRE_FILTER = genres;
  }
  set PLATFORMS_FILTER(value) {

    let platformCodes = value.filter(code => Object.keys(RAPlatforms).includes(code));

    config.ui.games_section.platformsFilter = platformCodes;
    config.writeConfiguration();
    this.updateGamesList();
    // this.platformFiltersList.querySelector("#game-filters_all").checked = this.PLATFORMS_FILTER.length === Object.keys(this.gameFilters).length;

  }
  get PLATFORMS_FILTER() {
    return config.ui?.games_section?.platformsFilter ?? ["7"];
  }
  set GENRE_FILTER(value) {

    let genreCodes = value.filter(code => Object.keys(Genres).includes(code));

    config.ui.games_section.genreFilter = genreCodes;
    config.writeConfiguration();
    this.updateGamesList();
    // this.platformFiltersList.querySelector("#game-filters_all").checked = this.PLATFORMS_FILTER.length === Object.keys(this.gameFilters).length;

  }
  get GENRE_FILTER() {
    return config.ui?.games_section?.genreFilter ?? [];
  }
  set AWARD_FILTER(value) {
    config.ui.games_section.awardFilter = value;
    config.writeConfiguration();
    this.updateGamesList();
    // this.platformFiltersList.querySelector("#game-filters_all").checked = this.PLATFORMS_FILTER.length === Object.keys(this.gameFilters).length;

  }
  get AWARD_FILTER() {
    return config.ui?.games_section?.awardFilter ?? [];
  }
  set FAVOURITES_FILTER(value) {
    config.ui.games_section.favouritesFilter = value;
    config.writeConfiguration();
    this.updateGamesList();
    // this.platformFiltersList.querySelector("#game-filters_all").checked = this.PLATFORMS_FILTER.length === Object.keys(this.gameFilters).length;

  }
  get FAVOURITES_FILTER() {
    return config.ui?.games_section?.favouritesFilter ?? false;
  }
  get TYPES_FILTER() {
    return config.ui?.games_section?.typesFilter ?? ["original"];
  }
  set TYPES_FILTER(checkbox) {
    const type = checkbox.dataset.type ?? "";
    const typesFilters = this.TYPES_FILTER;
    const checked = checkbox.checked;
    if (checked) {
      typesFilters.push(type);
    }
    else {
      const index = typesFilters.indexOf(type);
      if (index !== -1) {
        typesFilters.splice(index, 1);
      }
    }
    config.ui.games_section.typesFilter = typesFilters;
    config.writeConfiguration();
    this.applyFilter();
  }
  set REVERSE_SORT(value) {
    config._cfg.ui.games_section.reverse_sort = value ? -1 : 1;
    config.writeConfiguration();
    this.updateGamesList();
  }
  get REVERSE_SORT() {
    return config._cfg.ui?.games_section?.reverse_sort ?? -1;
  }
  get SORT_METHOD() {
    return UI.sortBy[this.SORT_NAME];
  }
  get SORT_NAME() {
    // return sortMethods.title;
    return config._cfg.ui?.games_section?.sort_name ?? UI.sortMethods.title;
  }
  set SORT_NAME(value) {
    value == this.SORT_NAME &&
      (config._cfg.ui.games_section.reverse_sort = -1 * this.REVERSE_SORT)
    config._cfg.ui.games_section.sort_name = value;
    config.writeConfiguration();
    this.updateGamesList();
  }
  titleFilter = '';
  applyFilter() {

    //Filter by Search request   
    const searchRequest = this.titleFilter
      .split(/\s/)
      .map(word => `(?=.*${word})`)
      .join('');
    const titleRegex = new RegExp(searchRequest, 'gi');
    this.games = this.titleFilter ?
      this.GAMES.filter(game =>
        `${game.FixedTitle} ${game.badges?.join(' ')} ${RAPlatforms[game.ConsoleID]}`.match(titleRegex)) :
      this.GAMES;
    this.COOP_FILTER && (this.games = this.games?.filter(game => game.Coop == "true"));
    // Filter by Platform
    this.PLATFORMS_FILTER.length > 0 && (this.games = this.games?.filter(game => {
      let isPlatformMatch = false;
      for (let platformCode of this.PLATFORMS_FILTER) {
        platformCode == game.ConsoleID && (isPlatformMatch = true);
      }
      return isPlatformMatch;
    }))
    this.GENRE_FILTER.length > 0 && (this.games = this.games?.filter(game => {
      let isGenreMatch = false;
      for (let genreCode of this.GENRE_FILTER) {
        game?.Genres?.includes(+genreCode) && (isGenreMatch = true);
      }
      return isGenreMatch;
    }))
    //Filter by Favourites
    this.FAVOURITES_FILTER && (this.games = this.games.filter(game => this.FAVOURITES.includes(game.ID)))

    //Filter by Awards
    this.AWARD_FILTER.length > 0 && (this.games = this.games.filter(game => {
      let isAwarded = false;
      for (let award of this.AWARD_FILTER) {
        award == game.Award && (isAwarded = true);
      }
      return isAwarded;
    }))
  }
  applySort() {
    this.games = this.games.sort((a, b) => this.REVERSE_SORT * this.SORT_METHOD(a, b));
  }
  platformCodes = {

  }
  awardTypes = {
    'mastered': 'mastered',
    'beaten-hardcore': 'beaten',
    'completed': 'completed',
    'beaten-softcore': 'beaten softcore',
    'started': 'started',
  }
  games = {}
  gamesInfo = {};
  constructor() {
    this._favs = config.ui.favouritesGames ?? [];
    this.initializeElements();
    this.setValues();
    this.addEvents();
    this.gamesList.innerHTML = `
    <button class="games__load-button" onclick="ui.games.loadGames()"></button>
    `;
    // this.setValues();

  }
  initializeElements() {
    this.section = document.querySelector("#games_section");
    this.header = this.section.querySelector(".header-container");
    this.container = this.section.querySelector(".games_container");
    // this.platformsContainer = this.section.querySelector(".platforms-list_container");
    this.searchbar = this.section.querySelector("#games__searchbar");
    this.platformFiltersList = this.section.querySelector("#games_filter-platform-list");
    this.gamesList = this.section.querySelector("#games-list");
    // this.platformList = this.section.querySelector(".platform-list");
    this.resizer = this.section.querySelector(".resizer");
  }
  setValues() {
    this.section.querySelector('#games__favourites-filter').checked = this.FAVOURITES_FILTER;
    this.section.querySelector('#games__coop-filter').checked = this.COOP_FILTER;

  }
  addEvents() {
    this.searchbar.addEventListener("input", e => {
      const searchbarValue = this.searchbar.value;
      this.titleFilter = searchbarValue;
      this.searchbar.classList.toggle("empty", searchbarValue == "");
      this.updateGamesList();


    })
    this.resizer.addEventListener("mousedown", (event) => {
      event.stopPropagation();
      this.section.classList.add("resized");
      UI.resizeEvent({
        event: event,
        section: this.section,
      });
    });
    // Додавання подій для пересування вікна target
    this.header.addEventListener("mousedown", (e) => {
      UI.moveEvent(this.section, e);
    });
  }

  updateGamesList() {
    this.applyFilter();
    this.applySort();
    this.gamesList.innerHTML = this.gamesListHeaderHtml();
    lazyLoad({ list: this.gamesList, items: this.games, callback: this.GameElement })
  }
  loadGames() {
    this.getAllGames()
      .then(() => {
        this.updateGamesList();
      })
    this.loadGameInfo();
  }
  async loadGameInfo() {
    const infoResponce = await fetch(`./json/games/all_info.json`);
    this.gamesInfo = await infoResponce.json();
  }
  async getAllGames() {
    this.GAMES = {};

    try {
      const gamesResponse = await fetch(`./json/games/all_ext.json`);
      const gamesJson = await gamesResponse.json();
      const lastPlayedGames = await apiWorker.SAVED_COMPLETION_PROGRESS;
      for (let lastGame of lastPlayedGames.Results) {
        let gameToModify = gamesJson.find(game => lastGame.ID === game.ID);
        if (gameToModify) {
          lastGame.NumAwardedHardcore && (gameToModify.NumAwardedHardcore = lastGame.NumAwardedHardcore);
          lastGame.HighestAwardKind ? (gameToModify.Award = lastGame.HighestAwardKind) : (gameToModify.Award = 'started');
          lastGame.MostRecentAwardedDate && (gameToModify.MostRecentAwardedDate = lastGame.MostRecentAwardedDate);
        }
        else {
          gameToModify = lastGame;
          gameToModify.ImageIcon = gameToModify.ImageIcon.match(/\d+/gi)[0];
          lastGame.NumAwardedHardcore && (gameToModify.NumAwardedHardcore = lastGame.NumAwardedHardcore);
          lastGame.HighestAwardKind ? (gameToModify.Award = lastGame.HighestAwardKind) : (gameToModify.Award = 'started');
          gameToModify.Points = '';
          gamesJson.push(gameToModify);
        }
      }
      this.GAMES = gamesJson;
    } catch (error) {
      return [];
    }
  }
  GameElement(game) {
    function setPopupPosition(popup, e) {
      //Start position relative achievement element
      const leftPos = e.x + 100;
      const topPos = e.y + 20;

      popup.style.left = leftPos + "px";
      popup.style.top = topPos + "px";

      //Check for collisions and fix position
      let { left, right, top, bottom } = popup.getBoundingClientRect();
      if (left < 0) {
        popup.classList.remove("left-side");
      }
      if (right > window.innerWidth) {
        popup.classList.add("left-side");
      }
      if (top < 0) {
        popup.classList.remove("top-side");
      } else if (bottom > window.innerHeight) {
        popup.classList.add("top-side");
      }
    }
    function gameItemOnHover(e) {
      function generatePopup() {
        const gameElement = e.target.closest(".platform_game-item");
        const gameID = gameElement.dataset.id;

        if (!ui.games?.gamesInfo[gameID]?.Title) return;

        let popup = document.createElement("div");
        popup.classList.add("popup", "game-info__popup");
        popup.innerHTML = `
        <h3 class="achievement__header">${ui.games?.gamesInfo[gameID]?.Title}</h3>
          <p>${ui.games?.gamesInfo[gameID]?.Info}</p>
        `;
        return popup;
      }
      // removePopups();
      document.querySelectorAll(".popup").forEach((popup) => popup.remove());
      const popup = generatePopup();

      if (popup) {
        ui.app.appendChild(popup);
        setPopupPosition(popup, e);
        setTimeout(() => popup.classList.add("visible"), 200);
      }
    }

    const gameElement = document.createElement("li");
    gameElement.classList.add("platform_game-item");
    gameElement.dataset.id = game.ID;
    const iconCode = game.ImageIcon.match(/\d+/g);
    gameElement.innerHTML = `    
      <!--<div class="game-preview_container">
        <img src="./assets/imgCache/${iconCode}.webp"
            onerror="this.src='https://media.retroachievements.org/Images/${game.ImageIcon}.png';" alt=""
            class="game-preview_image">
      </div>-->
      <h3 class="game-description_title">
        <button title="open game" class="game-description_button"
              onclick="ui.games.showGameInfoPopup(${game.ID})">
              ${game.FixedTitle} 
              ${generateBadges(game.badges)} 
              ${game.Coop === "true" ? generateBadges(['coop']) : ""} 
              ${game.Genres ? generateGenres(game.Genres) : ""}            
        
        </button>           
      </h3>      
      <p title="${game.Award ?? ""}" class="game-description  award-type">
        ${game.Award ? `<i class="icon award-type__icon ${game.Award}_icon"></i>` : ""}
      </p>
      <button class="favourites-button game-description icon-button games__icon-button ${ui.games.FAVOURITES.includes(game.ID) ? 'checked' : ''}" onclick="ui.games.addToFavourite(event,${game.ID})">
        <i class="icon favourite_icon"></i>
      </button>
      <p title="Rating" class="game-description  game-rating">
        ${game.Rating ? game.Rating : "n/a"}
      </p>
            <p title="Date" class="game-description  game-date">
        ${game.Date ? game.Date : "n/a"}
      </p>
      <p title="achievements count" class="game-description  achievements-count">
        ${RAPlatforms[game.ConsoleID].match(/[^\/]*/gi)[0]}
      </p>
      <p title="achievements count" class="game-description  achievements-count">
      ${game.NumAwardedHardcore ? game.NumAwardedHardcore + '\/' : ""}${game.NumAchievements}
      </p>
      <p title="points count" class="game-description  points-count">
      ${game.Points}
      </p>

      <p class="game-description game-description__links">
        <button class=" game-description_link" onclick="ui.getAchievements(${game.ID})"> 
              <i class="game-description_icon link_icon apply-icon"></i>
        </button>
          <a title="google search" target="_blanc" 
            href="https://google.com/search?q='${game?.FixedTitle}' '${RAPlatforms[game?.ConsoleID]}' ${googleQuerySite}"
            class="game-description game-description_link">
            <i class="game-description_icon link_icon search-icon google_link"></i>
          </a> 
          <a title="go to RA" target="_blanc" href="https://retroachievements.org/game/${game.ID}"
              class="game-description game-description_link">
              <i class="game-description_icon link_icon ra-link_icon"></i>
          </a>
      </p>   
    `;
    gameElement.addEventListener("mouseover", gameItemOnHover);
    gameElement.addEventListener("mouseleave", () => document.querySelectorAll(".popup").forEach((popup) => popup.remove()))
    return gameElement;
  }
  gamesListHeaderHtml = () => `
    <div class="platform_game-item header">
      <!--<div class="game-preview_container">
      </div>-->
      <h3 class="header__game-description game-description_title ${this.SORT_NAME == 'title' ?
      this.REVERSE_SORT == -1 ? 'active reverse' : 'active' : ''}"
        onclick="ui.games.SORT_NAME = 'title'">Title
      </h3>
      <p title="award type" class="header__game-description ${this.SORT_NAME == 'award' ?
      this.REVERSE_SORT == -1 ? 'active reverse' : 'active' : ''}" onclick="ui.games.SORT_NAME = \'award\'">
        <i class="icon award_icon"></i>
      </p>
      <div class="header__game-description"><i class="icon favourite_icon checked"></i></div>
      <p title="Rating" class="game-description header__game-description  game-rating ${this.SORT_NAME == 'rating' ?
      this.REVERSE_SORT == -1 ? 'active reverse' : 'active' : ''}"
        onclick="ui.games.SORT_NAME = 'rating'">
          Rating
      </p>
      <p title="Date" class="game-description header__game-description  game-date ${this.SORT_NAME == 'date' ?
      this.REVERSE_SORT == -1 ? 'active reverse' : 'active' : ''}"
        onclick="ui.games.SORT_NAME = 'date'">
          Date
      </p>
      <p title="achievements count" class=" game-description  achievements-count"
        >
          Platform
      </p>
      <p title="achievements count" class="header__game-description game-description  achievements-count ${this.SORT_NAME == 'achievementsCount' ?
      this.REVERSE_SORT == -1 ? 'active reverse' : 'active' : ''}"
          onclick="ui.games.SORT_NAME ='achievementsCount'">
            Cheevos
        </p>
      <p title="points count" class="header__game-description game-description  points-count ${this.SORT_NAME == 'points' ?
      this.REVERSE_SORT == -1 ? 'active reverse' : 'active' : ''}"
          onclick="ui.games.SORT_NAME = 'points'">
            Points
        </p>

        <p title="" class=" game-description game-description_link">Links</p>
      </div>
  `;
  addToFavourite(event, gameID) {
    const isFavourite = this.FAVOURITES.includes(gameID);
    if (isFavourite) {
      this.FAVOURITES = this.FAVOURITES.filter(id => id != gameID);
    }
    else {
      this.FAVOURITES = [gameID, ...this.FAVOURITES];
    }
    event.target.closest('button').classList.toggle('checked', !isFavourite);
  }
  toggleFilterList(event, filterType) {
    const hideFilters = () => {
      this.section.querySelector('.games__filters-list')?.remove();
      this.section.querySelectorAll('.games__filter-header .extended')
        .forEach(el => el.classList.remove('extended'))
    }
    const filterButton = event.target.closest('button');

    if (filterButton.classList.contains('extended')) {
      hideFilters();
    }
    else {
      hideFilters();
      filterButton.classList.add('extended');
      let list;
      switch (filterType) {
        case 'platform':
          list = this.generateFiltersList(this.platformFilterItems);
          break;
        case 'award':
          list = this.generateFiltersList(this.awardsFilterItems);
          break;
        case 'genre':
          list = this.generateFiltersList(this.genresFilterItems);
          break;
      }
      this.section.append(list);
      this.section.querySelector('.games__filter-container').appendChild(list);
    }

  }
  generateFiltersList(itemsObj) {
    const list = Object.values(itemsObj).reduce((list, item) => {
      if (item.type == 'group') {
        const groupHeader = document.createElement('li');
        groupHeader.classList.add('filter-list__platform-header');
        groupHeader.innerText = item.label + ': ';
        list.appendChild(groupHeader);
      }
      else {
        const isChecked = item.checked;
        const filterItem = document.createElement("li");
        filterItem.classList.add("checkbox-input_container");
        filterItem.innerHTML = `
          <input ${isChecked ? "checked" : ""} onchange='${item.onChange}' type="checkbox"   name="${item.name}" id="${item.id}" ></input>
          <label class=" checkbox-input" for="${item.id}">${item.label}</label>
        `;
        list.appendChild(filterItem);
      }
      return list;
    }, document.createElement('ul'));
    list.classList.add("games__filters-list");
    return list;
  }
  async showGameInfoPopup(gameID = 1) {
    document.querySelectorAll(".game-popup__section").forEach(popup => popup.remove());
    const gamePopupElement = document.createElement("section");

    const game = await apiWorker.getGameProgress({ gameID: gameID });
    // const rawgData = await apiWorker.rawgSearchGame({ gameTitle: game.FixedTitle, platformID: game.ConsoleID });

    const rawgGameInfo = false ? `
    <div class="game-info__descriptions-container rawg-data-list">
      <div class="game-description__property">Score : <span>${~~rawgData?.score}</span></div>
      <div class="game-description__property">Comunity rating : <span>${~~(rawgData?.rating * 20)}</span></div>
      <div class="game-description__property">Metacritic : <span>${rawgData?.metacritic ?? "-"}</span></div>
      <p class="description-link__header"><a href="https://rawg.io" target="_blanc"/>rawg.io data</a></p>
    </div>
                `: "";
    gamePopupElement.innerHTML = `
    <section class="section game-popup__section">
        <div class="game-popup__header-container header-container">
            <h2 class="widget-header-text"><a href="https://retroachievements.org/game/${game.ID}" target="_blank">${game.FixedTitle} ${generateBadges(game.badges)}</a></h2>
            <button class="header-button header-icon" onclick="this.closest('section').remove();">
                <svg height="24" viewBox="0 -960 960 960" width="24">
                    <path
                        d="m256-200-56-56 224-224-224-224 56-56 224 224 224-224 56 56-224 224 224 224-56 56-224-224-224 224Z" />
                </svg>
            </button>
        </div>
        <div class="game-info__container">
            <div class="game-info__images-container">
                <img src="https://media.retroachievements.org${game.ImageBoxArt}" alt="" class="game__image">
                <img src="https://media.retroachievements.org${game.ImageIngame}" alt="" class="game__image">
                <img src="https://media.retroachievements.org${game.ImageTitle}" alt="" class="game__image">

            </div>
            <div class="game-info__descriptions-container">
                <div class="game-description__property">Platform: <span>${game?.ConsoleName}</span></div>
                <div class="game-description__property">Developer: <span>${game?.Developer} Soft</span></div>
                <div class="game-description__property">Genre: <span>${game?.Genre}</span></div>
                <div class="game-description__property">Publisher: <span>${game?.Publisher} Soft</span></div>
                <div class="game-description__property">Released: <span>${game?.Released}</span></div>
                <div class="game-description__property">Achievements total : <span>${game?.NumAwardedToUserHardcore} / ${game?.NumAwardedToUser} / ${game?.achievements_published}</span>
                </div>
                <div class="game-description__property">Total retropoints : <span>
                ${game?.earnedStats.hard.retropoints} / ${game?.TotalRetropoints}</span></div>
                <div class="game-description__property">Total points : <span>
                  ${game?.earnedStats.hard.points} / ${game?.earnedStats.soft.points} / ${game?.points_total}</span></div>
                <div class="game-description__property">Total players : <span>${game?.masteredCount} / ${game?.beatenCount} / ${game?.players_total}</span></div>
                <div class="game-description__property">Completion : <span>${game?.masteryRate}% / ${game?.beatenRate}%</span></div>
                <div class="game-description__property">RetroRatio : <span>${game?.retroRatio}</span></div>
                ${rawgGameInfo}
            </div>
            <div class="game-info__cheevos-container">

            </div>
        </div>
    </section>
    `;
    ui.app.appendChild(gamePopupElement);
  }
  toggleFullscreen() {
    this.section.classList.toggle("fullscreen")
  }
}
class Progression {
  get VISIBLE() {
    return !this.section.classList.contains("hidden");
  }
  constructor() {
    this.initializeElements();
    this.addEvents();

  }
  initializeElements() {
    this.section = document.querySelector("#progression_section");
    this.header = this.section.querySelector(".header-container");
    this.notEarnedList = this.section.querySelector("#not-earned_progression-list");
    this.earnedList = this.section.querySelector("#earned_progression-list");
    this.resizer = this.section.querySelector("#progression-resizer")
  }
  addEvents() {
    this.resizer.addEventListener("mousedown", event => {
      event.stopPropagation();
      this.section.classList.add("resized");
      UI.resizeEvent({
        event: event,
        section: this.section,
      });
    });
    this.header.addEventListener("mousedown", (e) => {
      UI.moveEvent(this.section, e);
    });
  }
  fillCards() {
    this.notEarnedList.innerHTML = '';
    this.earnedList.innerHTML = '';
    Object.values(ui.ACHIEVEMENTS)
      .filter(achiv => UI.filterBy.progression(achiv))
      .sort((a, b) => -1 * UI.sortBy.id(a, b))
      .sort((a, b) => -1 * UI.sortBy.default(a, b))
      .forEach(achiv => {
        if (achiv.type === "progression" || achiv.type === "win_condition") {
          const achivElement = this.generateCard(achiv);
          this.addGlowEffectToCard(achivElement);
          achiv.isHardcoreEarned ? this.earnedList.prepend(achivElement) :
            this.notEarnedList.appendChild(achivElement);
        }
      })
    // const lastCard = this.earnedList.lastChild;
    // lastCard ? this.addGlowEffectToCard(lastCard) : "";
  }
  addGlowEffectToCard(card) {
    var marker = card.querySelector('.marker');
    let bounds;
    function addLines(e) {
      var xPos = e.offsetX;
      var yPos = e.offsetY;

      var height = card.offsetHeight;
      var width = card.offsetWidth;

      var lp = Math.abs(Math.floor(100 / width * xPos) - 100);
      var tp = Math.abs(Math.floor(100 / height * yPos) - 100);

      marker.style.backgroundPosition = `${lp}% ${tp}%`;

      // cards.forEach(function (card) {
      //   card.addEventListener("mousemove", function (e) {
      //     var l = e.offsetX;
      //     var t = e.offsetY;
      //     var h = card.offsetHeight;
      //     var w = card.offsetWidth;
      //     var lp = Math.abs(Math.floor(100 / w * l) - 100);
      //     var tp = Math.abs(Math.floor(100 / h * t) - 100);
      //     var bg = `background-position: ${lp}% ${tp}%;`;
      //     var newStyle = `.card.active:before { ${bg} }`;

      //     cards.forEach(function (card) {
      //       card.classList.remove("active");
      //     });

      //     card.classList.add("active");
      //     style.innerHTML = newStyle;
      //   });

      //   card.addEventListener("mouseout", function () {
      //     cards.forEach(function (card) {
      //       card.classList.remove("active");
      //     });
      //   });
      // });
    }
    function rotateToMouse(e) {
      const mouseX = e.clientX;
      const mouseY = e.clientY;
      const leftX = mouseX - bounds.x;
      const topY = mouseY - bounds.y;
      const center = {
        x: leftX - bounds.width / 2,
        y: topY - bounds.height / 2
      }
      const distance = Math.sqrt(center.x ** 2 + center.y ** 2);
      // scale3d(1.07, 1.07, 1.07)
      // card.style.transform = `

      //   rotate3d(
      //     ${center.y / 100},
      //     ${-center.x / 100},
      //     0,
      //     ${Math.log(distance) * 2}deg
      //   )
      // `;
      marker.style.backgroundImage = `
      radial-gradient(
      circle at
      ${center.x * 2 + bounds.width / 2}px
      ${center.y * 2 + bounds.height / 2}px,
      rgba(255, 255, 255, 0.15) ,
      #0000000f
      )`;
    }

    card.addEventListener("mouseenter", event => {
      bounds = card.getBoundingClientRect();
      marker.classList.remove("hidden");
      card.addEventListener("mousemove", event => {
        addLines(event);
      });

    });
    card.addEventListener("mouseleave", event => {
      card.style.transform = '';
      card.style.background = '';
      marker.classList.add("hidden")
      card.removeEventListener("mousemove", event => addLines(event))
    });
  }
  generateCard({ Title, ID, prevSrc, Points, TrueRatio, NumAwardedHardcore, totalPlayers, type, Description }) {
    const achivElement = document.createElement("li");
    achivElement.classList.add("horizon-list_item", "progression-achiv", type == "win_condition" ? "trophy" : "f");

    achivElement.dataset.id = ID;

    achivElement.innerHTML = `
    <div class="progression-achiv_container">
        <div class="progression_descriptions">
            <p class="progression-description-text" title="points"><i
                    class="progression_description-icon game-description_icon points-icon"></i>${Points}

            </p>
            <p class="progression-description-text" title="points"><i
                    class="progression_description-icon game-description_icon retropoints-icon"></i>${TrueRatio}

            </p>
            <p class="progression-description-text" title="earned by"><i
                    class="progression_description-icon game-description_icon trending-icon"></i>${~~(NumAwardedHardcore / totalPlayers * 100)}%</p>
            <div class="progression_description-icon condition ${type}" title="achievement type">
        </div>
        </div> 
        <div class="progression-achiv_prev-container">
            <img class="progression-achiv_prev-img" src="${prevSrc}"  alt=" ">
        </div>
        <h3 class="progression_achiv-name">
            <a class="progression_achiv-link" progression="_blanc" href="https://retroachievements.org/achievement/56855">${Title}</a>
        </h3>
        <div class="progression-details">
            ${Description}
        </div>
           
        <div class="marker hidden" style="position: absolute;"></div>
      </div>       
      `;// <div class="progression_achiv-number">4 / 6</div>
    return achivElement;
  }
  updateEarnedCards({ gameIDArray }) {
    gameIDArray?.forEach(gameID => {
      this.notEarnedList.querySelectorAll(".progression-achiv").forEach(element => {
        if (element.dataset.id == gameID) {
          element.classList.add("removed");
          setTimeout(() => {
            element.classList.remove("removed");
            this.earnedList.appendChild(element);
            element.classList.add("added");
          }, 500);
        }
      })
    })
  }
  close() {
    ui.buttons.progression.click();
  }

}

class Note {
  get VISIBLE() {
    return !this.section.classList.contains("hidden");
  }
  AUTOSAVE_INTERVAL_MILISECS = 3000;
  get NOTES_VALUE() {
    return config._cfg.ui?.note_section?.notes ?? "";
  }
  set NOTES_VALUE(value) {
    config._cfg.ui.note_section.notes = value;
    config.writeConfiguration();
  }
  constructor() {
    this.initializeElements();
    this.addEvents();
    this.setValues();
  }
  initializeElements() {
    this.section = document.querySelector("#note_section");
    this.header = this.section.querySelector(".header-container");
    this.resizer = this.section.querySelector("#note-resizer");
    this.textaria = this.section.querySelector(".note-textaria");
  }

  addEvents() {
    this.delayedSave;
    this.textaria.addEventListener("input", e => {
      clearTimeout(this.delayedSave);
      this.delayedSave = setTimeout(() => {
        this.NOTES_VALUE = this.textaria.value;
      },
        this.AUTOSAVE_INTERVAL_MILISECS);

    })
    this.resizer.addEventListener("mousedown", event => {
      event.stopPropagation();
      this.section.classList.add("resized");
      UI.resizeEvent({
        event: event,
        section: this.section,
      });
    });
    this.header.addEventListener("mousedown", (e) => {
      UI.moveEvent(this.section, e);
    });
  }
  setValues() {
    this.textaria.value = this.NOTES_VALUE;
  }
}

class UserInfo {
  get VISIBLE() {
    return !this.section.classList.contains("hidden");
  }
  USER_INFO = config._cfg.ui?.userInfoData ?? {
    userName: config.USER_NAME ?? "userName",
    status: "Offline",
    userImageSrc: config.userImageSrc ?? "",
    userRank: "???",
    softpoints: "",
    retropoints: "",
    hardpoints: "",
    lastGames: [],
    lastAchivs: [],

  }

  constructor() {
    this.initializeElements();
    this.addEvents();
    this.setValues();
    if (config.identConfirmed) {
      // setTimeout(() => this.update({}), 5000);
    }

  }
  initializeElements() {
    this.section = document.querySelector("#user_section");
    this.userNameElement = this.section.querySelector(".user_user-name");
    this.userImg = this.section.querySelector(".user-preview");
    this.connectionStatus = this.section.querySelector(".user_online-indicator")
    this.userRankElement = this.section.querySelector(".user_rank");
    this.userSoftpointsElement = this.section.querySelector(".user_softcore-points");
    this.userHardpointsElement = this.section.querySelector(".user_hardcore-points")
    this.userRetropointsElement = this.section.querySelector(".user_retropoints")
    this.lastGamesList = this.section.querySelector(".user_last-games-list");
    this.lastAchivsList = this.section.querySelector(".user_last-achivs-list");
    this.resizer = this.section.querySelector("#user-info-resizer");

  }
  addEvents() {
    this.section.addEventListener("mousedown", (e) => {
      UI.moveEvent(this.section, e);
    });
    this.resizer.addEventListener("mousedown", event => {
      event.stopPropagation();
      this.section.classList.add("resized");
      UI.resizeEvent({
        event: event,
        section: this.section,
      });
    });
  }
  setValues() {
    this.userNameElement.innerText = this.USER_INFO.userName;
    this.connectionStatus.classList.toggle("online", this.USER_INFO.status == "online");
    this.userImg.src = this.USER_INFO.userImageSrc;
    this.userRankElement.innerText = this.USER_INFO.userRank;
    this.userHardpointsElement.innerText = this.USER_INFO.hardpoints;
    this.userSoftpointsElement.innerText = this.USER_INFO.softpoints;
    this.userRetropointsElement.innerText = this.USER_INFO.retropoints;
    this.lastGamesList.innerHTML = "";
    this.lastAchivsList.innerHTML = "";
    this.USER_INFO?.lastGames?.forEach(game => {
      this.lastGamesList.appendChild(this.generateGameElement(game));
    })
    this.USER_INFO?.lastAchivs?.forEach(achiv => {
      this.lastAchivsList.appendChild(this.generateAchivElement(achiv));
    })

  }
  async update({ userSummary }) {
    if (!userSummary) {
      userSummary = await apiWorker.getUserSummary({});
    }
    const { User, Status, UserPic, Rank, TotalRanked, TotalPoints,
      TotalSoftcorePoints, TotalTruePoints, RecentlyPlayed, RecentAchievements } = userSummary;
    this.USER_INFO.userName = User;
    this.USER_INFO.status = Status.toLowerCase();
    this.USER_INFO.userImageSrc = `https://media.retroachievements.org${UserPic}`;
    this.USER_INFO.userRank = `${Rank} (Top ${~~(10000 * Rank / TotalRanked) / 100}%)`;
    this.USER_INFO.softpoints = TotalSoftcorePoints;
    this.USER_INFO.retropoints = TotalTruePoints;
    this.USER_INFO.hardpoints = TotalPoints;
    this.USER_INFO.lastGames = RecentlyPlayed;
    this.USER_INFO.lastAchivs = RecentAchievements
      .sort((a, b) => new Date(b.DateAwarded) - new Date(a.DateAwarded));
    ui.notifications.parseUserSummary(this.USER_INFO)

    this.setValues();

    // this.updateMainInformation()
    //   .then(() => this.updateRecentAchives()
    //     .then(() => this.updateRecentGames())).then(() => {
    //       this.setValues();
    //       config._cfg.ui.userInfoData = this.USER_INFO;
    //       config.writeConfiguration();
    //     })
  }
  async updateMainInformation() {
    const resp = await apiWorker.getUserProfile({});
    const { User, UserPic, TotalPoints, TotalSoftcorePoints, TotalTruePoints } = resp;
    this.USER_INFO.userName = User;
    this.USER_INFO.userImageSrc = `https://media.retroachievements.org${UserPic}`;
    this.USER_INFO.softpoints = TotalSoftcorePoints;
    this.USER_INFO.retropoints = TotalTruePoints;
    this.USER_INFO.hardpoints = TotalPoints;
  }
  async updateRecentGames() {
    const games = await apiWorker.getRecentlyPlayedGames({ count: 3 });
    this.USER_INFO.lastGames = games;

  }
  async updateRecentAchives() {
    const achives = await apiWorker.getRecentAchieves({});
    this.USER_INFO.lastAchivs = achives
      .slice(0, 5)
      .reverse();
  }

  updatePoints({ points }) {
    this.USER_INFO.softpoints = points.TotalSoftcorePoints;
    this.USER_INFO.retropoints = points.TotalTruePoints;
    this.USER_INFO.hardpoints = points.TotalPoints;
    this.setValues();
  }

  pushNewGame({ game }) {
    this.USER_INFO.lastGames.unshift(game);
    this.USER_INFO.lastGames.pop();
    this.setValues();
  }
  pushAchievements({ achievements }) {
    achievements.forEach(achiv => {
      if (achiv.DateEarnedHardcore) {
        this.USER_INFO.hardpoints += achiv.Points;
        this.USER_INFO.retropoints += achiv.TrueRatio;
      }
      else {
        this.USER_INFO.softpoints += achiv.Points;
      }
      this.USER_INFO.lastAchivs.unshift(achiv);
      this.USER_INFO.lastAchivs.pop();
    })
    this.setValues();
  }
  generateGameElement(game) {
    const gameElement = document.createElement("li");
    gameElement.classList.add("user_last-game");
    gameElement.innerHTML = `
    <div class="user_game-preview">
        <img class="user_game-img" src="https://media.retroachievements.org${game.ImageIcon}" alt="">
    </div>
    <div class="user_game-title">${game.Title}</div>
    <p class="user_game-description">${game.ConsoleName}</p>
    `;
    return gameElement;
  }
  generateAchivElement(achiv) {
    const achivElement = document.createElement("li");
    achivElement.classList.add("user_last-game");
    achivElement.innerHTML = `
    <div class="user_game-preview">
        <img class="user_game-img" src="https://media.retroachievements.org/Badge/${achiv.BadgeName}.png" alt="">
    </div>
    <div class="user_game-title">${achiv.Title}</div>
    <p class="user_game-description">${achiv.DateAwarded ?? achiv.Date}</p>
    `;
    return achivElement;
  }
  close() {
    ui.buttons.user.click();
  }
}
class Notifications {
  get contextMenuItems() {
    return [
      {
        label: "Show header",
        type: "checkbox",
        name: "context_hide-notification-header",
        id: "context_hide-notification-header",
        checked: this.SHOW_HEADER,
        event: `onchange="ui.notifications.SHOW_HEADER = this.checked;"`,
      },
      {
        label: "Hide background",
        type: "checkbox",
        name: "context_hide-notification-bg",
        id: "context_hide-notification-bg",
        checked: this.HIDE_BG,
        event: `onchange="ui.notifications.HIDE_BG = this.checked;"`,
      },
      {
        label: "Show timestamp",
        type: "checkbox",
        name: "context_show-notification-time",
        id: "context_show-notification-time",
        checked: this.SHOW_TIMESTAMP,
        event: `onchange="ui.notifications.SHOW_TIMESTAMP = this.checked;"`,
      }
    ];
  }
  types = {
    newGame: "newGame",
    earnedAchivs: "earnedAchivs",
  }
  get VISIBLE() {
    return !this.section.classList.contains("hidden");
  }
  get SHOW_TIMESTAMP() {
    return config?.ui.notification_section?.showTimestamp ?? true;
  }
  set SHOW_TIMESTAMP(value) {
    if (!config.ui.notification_section) {
      config.ui.notification_section = {};
    }
    this.section.querySelectorAll(".notification_timestamp").forEach(timeStamp => timeStamp.classList.toggle("hidden", this.SHOW_TIMESTAMP))
    config.ui.notification_section.showTimestamp = value;
    config.writeConfiguration();
    this.section.classList.toggle("compact", !this.SHOW_HEADER);
  }
  get SHOW_HEADER() {
    return config?.ui.notification_section?.showHeader ?? true;
  }
  set SHOW_HEADER(value) {
    if (!config.ui.notification_section) {
      config.ui.notification_section = {};
    }
    config.ui.notification_section.showHeader = value;
    config.writeConfiguration();
    this.section.classList.toggle("compact", !this.SHOW_HEADER);
  }
  get HIDE_BG() {
    return config?.ui.notification_section?.hideBg ?? false;
  }
  set HIDE_BG(value) {
    if (!config.ui.notification_section) {
      config.ui.notification_section = {};
    }
    config.ui.notification_section.hideBg = value;
    config.writeConfiguration();
    this.section.classList.toggle("hide-bg", this.HIDE_BG);
  }
  get NOTIFICATIONS() {
    return this._notifications ?? {
      time: "",
      notifications: [],
    };
  }
  constructor() {
    this.initializeElements();
    this.addEvents();
    this.HIDE_BG = this.HIDE_BG;
    this.SHOW_HEADER = this.SHOW_HEADER;
    this.updateInterval = setInterval(() => {
      this.container.querySelectorAll(".notification_timestamp").forEach(timeStamp => {
        timeStamp.innerText = this.getDeltaTime(timeStamp.dataset.time);
      })
    }, 1 * 1000 * 60)
  }

  initializeElements() {
    this.section = document.querySelector("#notification_section");
    this.container = this.section.querySelector(".notification-container");
    this.resizer = this.section.querySelector(".resizer");
  }
  addEvents() {
    this.section.addEventListener("mousedown", (e) => {
      UI.moveEvent(this.section, e);
    });
    this.section.addEventListener("contextmenu", (event) => {
      ui.showContextmenu({
        event: event,
        menuItems: this.contextMenuItems,
        sectionCode: "",
      });
    });
    this.resizer.addEventListener("mousedown", event => {
      event.stopPropagation();
      this.section.classList.add("resized");
      UI.resizeEvent({
        event: event,
        section: this.section,
      });
    });
  }

  parseUserSummary(userInfo) {

    userInfo.lastGames.map(game => {
      game.DateEarnedHardcore = game.LastPlayed;
      game.type = this.types.newGame;
      return game;
    })
    userInfo.lastAchivs.map(achiv => {
      achiv.DateEarnedHardcore = achiv.DateAwarded;
      achiv.type = this.types.earnedAchivs;
      achiv.BadgeURL = `Badge/${achiv.BadgeName}.png`;
      return achiv;
    });
    ([...userInfo.lastAchivs, ...userInfo.lastGames]
      .sort((a, b) => -1 * UI.sortBy.latest(a, b))
    ).forEach(element =>
      this.pushNotification({
        type: element.type,
        elements: element,
        time: element.DateEarnedHardcore,
      })
    );
  }
  pushNotification({ type, elements, time }) {
    const timestampElement = this.generatePopupTime(time);
    let messageElements = [];
    switch (type) {
      case this.types.newGame:
        messageElements.push(this.generateNewgameElement(elements));
        break;
      case this.types.earnedAchivs:
        messageElements = this.generateNewachivsElements(Array.isArray(elements) ? elements : [elements]);
        break;
      default:
        console.log(`notification type doesn't exist`);
        return;
    }
    const notificationElement = this.generateTimeBlock(timestampElement, messageElements);
    messageElements.length > 0 ? this.container.prepend(notificationElement) : "";
    const elementHeight = notificationElement.getBoundingClientRect().height;
    this.container.style.setProperty("--offset-height", `${elementHeight}px`);
    notificationElement.classList.add("notification_popup");
  }

  generateTimeBlock(timeStamp, messageElements) {
    const timeBlockElement = document.createElement("ul");
    timeBlockElement.classList.add("notification_timeblock-list");
    timeBlockElement.appendChild(timeStamp);
    messageElements.forEach(element => {
      timeBlockElement.appendChild(element);
    })
    return timeBlockElement;
  }
  generatePopupTime(time) {
    const toDate = (s) => {
      const [datePart, timePart] = s.split(', ');

      const [day, month, year] = datePart.split('.').map(Number);

      const [hours, minutes] = timePart.split(':').map(Number);

      return new Date(year, month - 1, day, hours, minutes);
    }
    const timestampElement = document.createElement("li");
    const popupTime = (time ? toDate(time) : new Date()).getTime();
    timestampElement.dataset.time = popupTime;
    timestampElement.classList.add("notification_timestamp");
    !this.SHOW_TIMESTAMP ? timestampElement.classList.add("hidden") : "";
    timestampElement.innerHTML = `
     ${this.getDeltaTime(popupTime)}
    `;
    return timestampElement;
  }

  generateNewgameElement(gameObject) {
    const gameMessage = document.createElement("li");
    gameMessage.classList.add("notification-game", "new-game");
    // <div class="notificaton_header">Launched game</div>
    gameMessage.innerHTML =
      `
      <div class="prev">
        <img class="prev-img" src="https://media.retroachievements.org${gameObject.ImageIcon}" alt=" ">
      </div>
      <div class="notification_details">
        <h3 class="achiv-name">
          <a target="_blanc" href="https://retroachievements.org/game/${gameObject.ID ?? gameObject.GameID}">
            ${gameObject.Title}
          </a>
        </h3>
        <p class="achiv-description">${gameObject.Genre ? gameObject.Genre + ",\n" : ""}${gameObject.ConsoleName}</p>
        <div class="notification_description-icons">
          <p class="notification_description-text" title="points">
            <i class="notification_description-icon  points-icon"></i>
            ${gameObject.points_total ?? ""}
          </p>
          <p class="notification_description-text" title="retropoints">
            <i class="notification_description-icon  achievements-icon"></i>
            ${gameObject.achievements_published ?? gameObject.AchievementsTotal}
          </p>
          <p class="notification_description-text" title="earned by">
            <i class="notification_description-icon  players-icon"></i>
            ${gameObject.NumDistinctPlayersHardcore ?? ""}
          </p>
        </div>
      </div>
    `;
    return gameMessage;
  }

  generateNewachivsElements(achivs) {
    let achivElements = [];
    achivs.forEach(achiv => {
      const { AchievementID, BadgeURL, Description, Title, Points, TrueRatio, HardcoreMode, ID } = achiv;
      let earnPercent = "";
      if (ui.GAME_DATA.ID == achiv.GameID) {
        earnPercent = ~~(100 * ui.ACHIEVEMENTS[AchievementID ?? ID].NumAwardedHardcore / ui.GAME_DATA.NumDistinctPlayers);
      }
      const achivElement = document.createElement("li");
      achivElement.classList.add("notification-achiv", "new-achiv");
      // <div class="notificaton_header">Earned achievement ${HardcoreMode == 1 ? "hardcore" : "softcore"}</div>

      achivElement.innerHTML =
        `   
      <div class="prev">
                <img class="prev-img" src="https://media.retroachievements.org/${BadgeURL}" alt=" ">
              </div>
              <div class="notification_details">
                <h3 class="achiv-name"><a target="_blanc" href="https://retroachievements.org/achievement/${AchievementID ?? ID}">${Title}</a></h3>
                <p class="achiv-description">${Description}</p>
                <div class="notification_description-icons">       
                  <p class="notification_description-text" title="points">
                    <i class="notification_description-icon  points-icon"></i>
                    ${Points}
                  </p>
                  
                  <p class="notification_description-text" title="retropoints">
                    <i class="notification_description-icon  retropoints-icon"></i>
                    ${TrueRatio ?? ""}
                  </p>
                  <p class="notification_description-text" title="earned by">
                    <i class="notification_description-icon  trending-icon"></i>
                    ${earnPercent ? earnPercent + "%" : ""}
                  </p>
                </div>             
              </div>
      `;
      achivElements.push(achivElement);
    })

    return achivElements;
  }

  getDeltaTime(timeStamp) {
    let date = +timeStamp;
    let now = (new Date()).getTime();
    let deltaSeconds = ~~((now - date) / 1000);
    return deltaSeconds < 2 * 60 ? "moment ago" :
      deltaSeconds < 10 * 60 ? `few minutes ago` :
        deltaSeconds < 60 * 60 ? `${~~(deltaSeconds / 60)} minutes ago` :
          deltaSeconds < 60 * 60 * 12 ? new Date(date).toLocaleTimeString().replace(/:[^:]*$/gi, "") :
            new Date(date).toLocaleString().replace(/:[^:]*$/gi, "");
  }
}
class Stats {
  get contextMenuItems() {
    return [
      {
        label: "Show stats",
        elements: [
          {
            type: "checkbox",
            name: "context_show-points",
            id: "context_show-points",
            label: "Hard points",
            checked: this.SHOW_HP,
            event: `onchange="ui.stats.SHOW_HP = this.checked;"`,
          },
          {
            type: "checkbox",
            name: "context_show-retropoints",
            id: "context_show-retropoints",
            label: "Retropoints",
            checked: this.SHOW_RP,
            event: `onchange="ui.stats.SHOW_RP = this.checked;"`,
          },
          {
            type: "checkbox",
            name: "context_show-softpoints",
            id: "context_show-softpoints",
            label: "Softpoints",
            checked: this.SHOW_SP,
            event: `onchange="ui.stats.SHOW_SP = this.checked;"`,
          },
          {
            type: "checkbox",
            name: "context_show-rank",
            id: "context_show-rank",
            label: "Rank",
            checked: this.SHOW_RANK,
            event: `onchange="ui.stats.SHOW_RANK = this.checked;"`,
          },
          {
            type: "checkbox",
            name: "context_show-percentile",
            id: "context_show-percentile",
            label: "Percentile",
            checked: this.SHOW_PERCENTILE,
            event: `onchange="ui.stats.SHOW_PERCENTILE = this.checked;"`,
          },

          {
            type: "checkbox",
            name: "context_show-true-ratio",
            id: "context_show-true-ratio",
            label: "True Ratio",
            checked: this.SHOW_TR,
            event: `onchange="ui.stats.SHOW_TR = this.checked;"`,
          },
        ]
      },
      {
        label: "Style",
        elements: [
          {
            type: "checkbox",
            name: "context_show-header",
            id: "context_show-header",
            label: "Show header",
            checked: this.SHOW_HEADER,
            event: `onchange="ui.stats.SHOW_HEADER = this.checked;"`,
          },
          {
            type: "checkbox",
            name: "context_show-bg",
            id: "context_show-bg",
            label: "Show background",
            checked: this.SHOW_BG,
            event: `onchange="ui.stats.SHOW_BG = this.checked;"`,
          },
        ]
      },
      {
        type: "checkbox",
        name: "context_show-session-progress",
        id: "context_show-session-progress",
        label: "Show Session Progress",
        checked: this.SHOW_SESSION_PROGRESS,
        event: `onchange="ui.stats.SHOW_SESSION_PROGRESS = this.checked;"`,
      }


    ];
  }
  get SHOW_BG() {
    return config.ui?.stats_section?.showBG ?? true;
  }
  set SHOW_BG(value) {
    this.saveProppertySetting("showBG", value);
    this.setElementsVisibility();
  }
  get SHOW_HEADER() {
    return config.ui?.stats_section?.showHeader ?? true;
  }
  set SHOW_HEADER(value) {
    this.saveProppertySetting("showHeader", value);
    this.setElementsVisibility();
  }
  get SHOW_HP() {
    return config.ui?.stats_section?.showHP ?? true;
  }
  set SHOW_HP(value) {
    this.saveProppertySetting("showHP", value);
    this.setElementsVisibility();
  }

  get SHOW_RP() {
    return config.ui?.stats_section?.showRP ?? true;
  }
  set SHOW_RP(value) {
    this.saveProppertySetting("showRP", value);
    this.setElementsVisibility();
  }

  get SHOW_SP() {
    return config.ui?.stats_section?.showSP ?? true;
  }
  set SHOW_SP(value) {
    this.saveProppertySetting("showSP", value);
    this.setElementsVisibility();
  }

  get SHOW_RANK() {
    return config.ui?.stats_section?.showRank ?? true;
  }
  set SHOW_RANK(value) {
    this.saveProppertySetting("showRank", value);
    this.setElementsVisibility();
  }
  get SHOW_PERCENTILE() {
    return config.ui?.stats_section?.showPercentile ?? true;
  }
  set SHOW_PERCENTILE(value) {
    this.saveProppertySetting("showPercentile", value);
    this.setElementsVisibility();
  }
  get SHOW_TR() {
    return config.ui?.stats_section?.showTrueRatio ?? true;
  }
  set SHOW_TR(value) {
    this.saveProppertySetting("showTrueRatio", value);
    this.setElementsVisibility();
  }
  get SHOW_SESSION_PROGRESS() {
    return config.ui?.stats_section?.showSessionProgress ?? true;
  }
  set SHOW_SESSION_PROGRESS(value) {
    this.saveProppertySetting("showSessionProgress", value);
    this.setElementsVisibility();
  }
  get VISIBLE() {
    return !this.section.classList.contains("hidden");
  }
  saveProppertySetting(property, value) {
    if (!config.ui.stats_section) {
      config.ui.stats_section = {};
    }
    config.ui.stats_section[property] = value;
    config.writeConfiguration();
  }
  initialUserSummary;
  userSummary;
  constructor() {

    this.initializeElements();
    this.setElementsVisibility();
    this.addEvents();
  }
  initializeElements() {
    this.section = document.querySelector("#stats_section");
    this.header = this.section.querySelector(".header-container");
    this.container = this.section.querySelector(".stats-container");
    this.rankRateElement = this.section.querySelector('#stats_rank-rate');
    this.rankElement = this.section.querySelector('#stats_rank');
    this.pointsElement = this.section.querySelector('#stats_points');
    this.retropointsElement = this.section.querySelector('#stats_retropoints');
    this.softpointsElement = this.section.querySelector('#stats_softpoints');
    this.trueRatioElement = this.section.querySelector('#stats_true-ratio');
    this.masteredCountElement = this.section.querySelector('#stats_mastered-count');
    this.beatenCountElement = this.section.querySelector('#stats_beaten-count');
    this.playedCountElement = this.section.querySelector('#stats_played-count');

    this.resizer = this.section.querySelector(".resizer");
  }
  setElementsVisibility() {
    this.pointsElement.closest("li").classList.toggle("hidden", !this.SHOW_HP);
    this.retropointsElement.closest("li").classList.toggle("hidden", !this.SHOW_RP);
    this.softpointsElement.closest("li").classList.toggle("hidden", !this.SHOW_SP);
    this.rankElement.closest("li").classList.toggle("hidden", !this.SHOW_RANK);
    this.rankRateElement.closest("li").classList.toggle("hidden", !this.SHOW_PERCENTILE);
    this.trueRatioElement.closest("li").classList.toggle("hidden", !this.SHOW_TR);
    this.section.classList.toggle("compact", !this.SHOW_HEADER);
    this.section.classList.toggle("hide-bg", !this.SHOW_BG);
    this.container.classList.toggle("show-session-progress", this.SHOW_SESSION_PROGRESS)

  }
  addEvents() {
    this.header.addEventListener("mousedown", (e) => {
      UI.moveEvent(this.section, e);
    });
    this.section.addEventListener("contextmenu", (event) => {
      ui.showContextmenu({
        event: event,
        menuItems: this.contextMenuItems,
        sectionCode: "",
      });
    });

    this.resizer.addEventListener("mousedown", event => {
      event.stopPropagation();
      this.section.classList.add("resized");
      UI.resizeEvent({
        event: event,
        section: this.section,
      });
    });
    new Sortable(this.container, {
      animation: 100,
      // chosenClass: "stats__stat-container",
    });
  }
  initialSetStats({ userSummary, completionProgress }) {
    this.initialData = {
      Rank: userSummary.Rank,
      rankRate: +(100 * userSummary.Rank / userSummary.TotalRanked).toFixed(2),
      TotalPoints: userSummary.TotalPoints,
      TotalSoftcorePoints: userSummary.TotalSoftcorePoints,
      TotalTruePoints: userSummary.TotalTruePoints,
      trueRatio: +(userSummary.TotalTruePoints / userSummary.TotalPoints).toFixed(2),

    }
    if (userSummary) {
      this.userSummary = userSummary;
      this.initialUserSummary = userSummary;
      this.rankElement.innerText = userSummary.Rank;
      this.rankRateElement.innerText = (100 * userSummary.Rank / userSummary.TotalRanked).toFixed(2) + '%';
      this.pointsElement.innerText = userSummary.TotalPoints;
      this.softpointsElement.innerText = userSummary.TotalSoftcorePoints;
      this.retropointsElement.innerText = userSummary.TotalTruePoints;
      this.trueRatioElement.innerText = (userSummary.TotalTruePoints / userSummary.TotalPoints).toFixed(2);
    }
    if (completionProgress) {
    }
  }
  async updateStats({ currentUserSummary }) {
    if (!currentUserSummary) {
      currentUserSummary = await apiWorker.getUserSummary({ gamesCount: "0", achievesCount: 0 });
    };

    const setValue = (element, property) => {

      let delta = 0;
      let sessionDelta = 0;
      let value = 0;
      let oldValue = 0;
      switch (property) {
        case "rankRate":
          value = (100 * currentUserSummary.Rank / currentUserSummary.TotalRanked).toFixed(2);
          oldValue = (100 * this.userSummary.Rank / this.userSummary.TotalRanked).toFixed(2);
          delta = +(value - oldValue).toFixed(2);
          sessionDelta = +(value - this.initialData.rankRate).toFixed(2)
          value += "%";
          break;
        case "trueRatio":
          value = (currentUserSummary.TotalTruePoints / currentUserSummary.TotalPoints).toFixed(2);
          oldValue = (this.userSummary.TotalTruePoints / this.userSummary.TotalPoints).toFixed(2);
          delta = +(value - oldValue).toFixed(2);
          sessionDelta = +(value - this.initialData.trueRatio).toFixed(2)
          break;
        default:
          delta = currentUserSummary[property] - this.userSummary[property];
          sessionDelta = currentUserSummary[property] - this.initialData[property];
          value = currentUserSummary[property];
      }
      if (delta === 0) return;
      const isNegativeDelta = delta < 0;

      const isSessionNegativeDelta = sessionDelta < 0;

      element.classList.add("delta");
      element.classList.toggle('negative', isNegativeDelta);
      element.dataset.delta = `${isNegativeDelta ? "" : "+"}${delta}`;
      const delay = 5000;
      setTimeout(() => {
        element.innerHTML = value + ` <span class="session-progress ${isSessionNegativeDelta ? "negative" : ""}">
          ${isSessionNegativeDelta ? "" : "+"}${sessionDelta}</span>`;
        element.classList.remove("delta");
      }, delay)
    }
    setValue(this.rankRateElement, "rankRate");
    setValue(this.rankElement, "Rank");
    setValue(this.pointsElement, "TotalPoints");
    setValue(this.softpointsElement, "TotalSoftcorePoints");
    setValue(this.retropointsElement, "TotalTruePoints");
    setValue(this.trueRatioElement, "trueRatio");

    this.userSummary = currentUserSummary;
  }
}



const delay = (ms) => {
  return new Promise(resolve => setTimeout(resolve, ms));
}
function generateBadges(badges) {
  return badges?.reduce((acc, badge) => acc += `<i class="game-card_suffix game-title_${badge.toLowerCase()}">${badge}</i> `, "")
}
function generateGenres(genres) {
  return genres?.reduce((acc, genre) => acc += `<i class="game-card_suffix game-title_genre">${Genres[genre]}</i> `, "")
}
function lazyLoad({ list, items, callback }) {
  const trigger = document.createElement("div");
  trigger.classList.add("lazy-load_trigger")
  list.appendChild(trigger);

  // Ініціалізація списку з початковими елементами
  let itemIndex = 0;
  const initialLoadCount = 40;
  const loadItems = (count) => {
    for (let i = 0; i < count && itemIndex < items.length; i++) {
      list.appendChild(callback(items[itemIndex++]));
    }
  };
  loadItems(initialLoadCount);

  // Callback функція для Intersection Observer
  const loadMoreItems = (entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        loadItems(initialLoadCount);
        // Оновлюємо спостереження
        observer.unobserve(trigger);
        list.appendChild(trigger);
        itemIndex < items.length && observer.observe(trigger);
      }
    });
  };
  // Налаштування Intersection Observer
  const observerOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 1.0
  };
  const observer = new IntersectionObserver(loadMoreItems, observerOptions);

  // Початкове спостереження за тригером
  observer.observe(trigger);
}
const parseCurrentGameLevel = (richPresence) => {
  let levelNumber;
  const levelNames = [
    'level',
    'levels',
    'stage',
    'area',
    'world',
    'mission',
    'chapter',
    'section',
    'part',
    'zone',
    'phase',
    'realm',
    'domain',
    'episode',
    'act',
    'sequence',
    'tier',
    'floor',
    'dimension',
    'region',
    'floor',
    'scene',
    '🚩',
    'in',
  ];
  const levelNamesString = levelNames.join("|");
  const replaceWrittenNumbers = (inputStr) => {
    const numberMapping = {
      'first': 1, 'second': 2, 'third': 3, 'fourth': 4, 'fifth': 5,
      'sixth': 6, 'seventh': 7, 'eighth': 8, 'ninth': 9, 'tenth': 10,
      '1st': 1, '2nd': 2, '3rd': 3, '4th': 4, '5th': 5,
      '6th': 6, '7th': 7, '8th': 8, '9th': 9, '10th': 10
    };

    const regex = new RegExp(Object.keys(numberMapping).join("|"), 'gi');

    return inputStr.replace(regex, match => {
      return numberMapping[match.toLowerCase()];
    });
  }

  const checkLevel = (inputStr, levelNames) => {
    const regexWordSecond = new RegExp(`(${levelNamesString})(\\s|-\\s*|:\\s*)((\\d+-\\d+)|(\\d+))`, 'gi');

    const regexWordFirst = new RegExp(`\\s*((\\d+-\\d+)|(\\d+))\\s(${levelNamesString})`, 'gi');

    const matchesSecond = inputStr.matchAll(regexWordSecond);
    for (const match of matchesSecond) {
      const level = Number(match[3]?.replace('-', '.'));
      return level;
    }

    // const matchesFirst = inputStr.matchAll(regexWordFirst);
    // for (const match of matchesFirst) {
    //   const level = Number(match[1]?.replace('-', '.'));
    //   return level;
    // }

    return null;
  };

  const inputStr = replaceWrittenNumbers(richPresence);

  levelNumber = checkLevel(inputStr);

  return Number.isFinite(levelNumber) ? levelNumber : false;

}

const RAPlatforms = {
  "1": "Genesis/Mega Drive",
  "2": "Nintendo 64",
  "3": "SNES/Super Famicom",
  "4": "Game Boy",
  "5": "GB Advance",//"Game Boy Advance",
  "6": "GB Color",//"Game Boy Color",
  "7": "NES/Famicom",
  "8": "PC Engine/TurboGrafx-16",
  "9": "Sega CD",
  "10": "32X",
  "11": "Master System",
  "12": "PlayStation",
  "13": "Atari Lynx",
  "14": "Neo Geo Pocket",
  "15": "Game Gear",
  "17": "Atari Jaguar",
  "18": "Nintendo DS",
  "21": "PlayStation 2",
  "23": "Magnavox Odyssey 2",
  "24": "Pokemon Mini",
  "25": "Atari 2600",
  "27": "Arcade",
  "28": "Virtual Boy",
  "29": "MSX",
  "33": "SG-1000",
  "37": "Amstrad CPC",
  "38": "Apple II",
  "39": "Saturn",
  "40": "Dreamcast",
  "41": "PlayStation Portable",
  "43": "3DO Interactive Multiplayer",
  "44": "ColecoVision",
  "45": "Intellivision",
  "46": "Vectrex",
  "47": "PC-8000/8800",
  "49": "PC-FX",
  "51": "Atari 7800",
  "53": "WonderSwan",
  "56": "Neo Geo CD",
  "57": "Fairchild Channel F",
  "63": "Watara Supervision",
  "69": "Mega Duck",
  "71": "Arduboy",
  "72": "WASM-4",
  "73": "Arcadia 2001",
  "74": "Interton VC 4000",
  "75": "Elektor TV Games Computer",
  "76": "PC Engine CD/TurboGrafx-CD",
  "77": "Atari Jaguar CD",
  "78": "Nintendo DSi",
  "80": "Uzebox",
  "101": "Events",
  "102": "Standalone"
}
const Genres = {
  "1": "Compilation",
  "2": "Strategy",
  "3": "Casino",
  "4": "Music",
  "5": "Action",
  "6": "Platform",
  "7": "Puzzle",
  "8": "Quiz",
  "9": "Shooter",
  "10": "Vehicle Simulation",
  "11": "Construction and Management Simulation",
  "12": "Fighting",
  "13": "Sports",
  "14": "Role-Playing",
  "15": "Racing",
  "16": "Beat 'em Up",
  "17": "Adventure",
  "18": "Education",
  "19": "Life Simulation",
  "20": "Board Game",
  "21": "Stealth",
  "22": "Pinball",
  "23": "Flight Simulator",
  "24": "Visual Novel",
  "25": "Horror",
  "26": "Sandbox",
  "27": "Party",
  "28": "MMO"
}
const platformsByManufacturer = {
  'SEGA': {

    "SG-1000": "33",
    "Master System": "11",
    "Genesis/Mega Drive": "1",
    "Game Gear": "15",
    "Sega CD": "9",
    "32X": "10",
    "Saturn": "39",
    "Dreamcast": "40",
  },

  'Nintendo': {

    "NES/Famicom": "7",
    "Game Boy": "4",
    "SNES/Super Famicom": "3",
    "Game Boy Color": "6",
    "Nintendo 64": "2",
    "Game Boy Advance": "5",
    "Virtual Boy": "28",
    "Nintendo DS": "18",
    "Nintendo DSi": "78",
    "Pokemon Mini": "24"
  },

  'NEC': {

    "PC Engine/TurboGrafx-16": "8",
    "PC Engine CD/TurboGrafx-CD": "76",
    "PC-8000/8800": "47",
    "PC-FX": "49"
  },

  'SONY': {

    "PlayStation": "12",
    "PlayStation 2": "21",
    "PlayStation Portable": "41"
  },

  'SNK': {

    "Neo Geo Pocket": "14",
    "Neo Geo CD": "56"
  },

  'Atari': {

    "Atari 2600": "25",
    "Atari 7800": "51",
    "Atari Lynx": "13",
    "Atari Jaguar": "17",
    "Atari Jaguar CD": "77"
  },

  'Other': {

    "Magnavox Odyssey 2": "23",
    "Arcade": "27",
    "Apple II": "38",
    "Amstrad CPC": "37",
    "MSX": "29",
    "3DO Interactive Multiplayer": "43",
    "ColecoVision": "44",
    "Intellivision": "45",
    "Vectrex": "46",
    "WonderSwan": "53",
    "Fairchild Channel F": "57",
    "Watara Supervision": "63",
    "Mega Duck": "69",
    "Arduboy": "71",
    "WASM-4": "72",
    "Arcadia 2001": "73",
    "Interton VC 4000": "74",
    "Elektor TV Games Computer": "75",
    "Uzebox": "80"
  },

  'Special': {

    "Events": "101",
    "Standalone": "102"
  }
};

const CDRPlatforms = {
  1: "sega_genesis_roms",//: "Genesis/Mega Drive",
  2: "n64-roms",//: "Nintendo 64",
  3: "snes-rom",//: "SNES/Super Famicom",
  4: "gb_roms",//: "Game Boy",
  5: "gba-roms",//: "Game Boy Advance",
  6: "gbc_roms",//: "Game Boy Color",
  7: "nes-roms",//: "NES/Famicom",
  8: "turbografx-16",//: "PC Engine/TurboGrafx-16",
  9: "sega_cd_isos",//: "Sega CD",
  10: "sega_genesis_roms",//!: "32X",
  //! 11: "145",//!: "Master System",
  12: "psx-iso",//: "PlayStation",
  //! 13: "188",//!: "Atari Lynx",
  //! 14: "317",//: "Neo Geo Pocket",
  15: "game-gear",//: "Game Gear",
  //! 17: "313",//: "Atari Jaguar",
  18: "nds-roms", //"Nintendo DS",
  21: "ps2-iso",// "PlayStation 2",
  //! "23": "Magnavox Odyssey 2",
  // 24: "319",//: "Pokemon Mini",
  //! 25: "185",//: "Atari 2600",
  //! "27": "Arcade",
  //! 28: "310",//: "Virtual Boy",
  29: "msx-roms",//: "MSX",//* 304 - MSX2
  //! "33": "SG-1000",
  37: "665",//: "Amstrad CPC",
  //! "38": "Apple II",
  //! "39": "Saturn",
  //! "40": "Dreamcast",
  41: "psp",// "PlayStation Portable",
  43: "3do-iso",//: "3DO Interactive Multiplayer",
  //! 44: "294",//: "ColecoVision",
  //! 45: "298",//: "Intellivision",
  //! 46: "296",//: "Vectrex",
  //! "47": "PC-8000/8800",
  //! "49": "PC-FX",
  //! 51: "187",//: "Atari 7800",
  53: "wonderswan",//: "WonderSwan",
  56: "neo-geo-cd",//: "Neo Geo CD", //? neo geo
  //! 57: "190",//: "Fairchild Channel F",
  //! 63: "312",//: "Watara Supervision",
  //! "69": "Mega Duck",
  //! "71": "Arduboy",
  //!"72": "WASM-4",
  //! 73: "322",//: "Arcadia 2001",
  //! "74": "Interton VC 4000",
  //! "75": "Elektor TV Games Computer",
  76: "turbografx-cd",//: "PC Engine CD/TurboGrafx-CD",
  //! 77: "313",//: "Atari Jaguar CD", 313 (notCD)
  // 78: "nds-roms",// "Nintendo DSi",
  //! "80": "Uzebox",
  // "101": "Events",
  // "102": "Standalone"
}
const ELPlatforms = {
  1: "39",//: "Genesis/Mega Drive",
  2: "146",//: "Nintendo 64",
  3: "37",//: "SNES/Super Famicom",
  4: "149",//: "Game Boy",
  5: "1173",//: "Game Boy Advance",
  6: "149",//: "Game Boy Color",
  7: "13",//: "NES/Famicom",
  8: "148",//: "PC Engine/TurboGrafx-16",
  9: "369",//: "Sega CD",
  10: "40",//: "32X",
  11: "145",//: "Master System",
  12: "346",//: "PlayStation",
  13: "188",//: "Atari Lynx",
  14: "317",//: "Neo Geo Pocket",
  15: "147",//: "Game Gear",
  17: "313",//: "Atari Jaguar",
  //! "18": "Nintendo DS", 
  //! "21": "PlayStation 2",
  //! "23": "Magnavox Odyssey 2",
  24: "319",//: "Pokemon Mini",
  25: "185",//: "Atari 2600",
  //! "27": "Arcade",
  28: "310",//: "Virtual Boy",
  29: "303",//: "MSX",//* 304 - MSX2
  //! "33": "SG-1000",
  37: "665",//: "Amstrad CPC",
  //! "38": "Apple II",
  //! "39": "Saturn",
  //! "40": "Dreamcast",
  //! "41": "PlayStation Portable",
  43: "372",//: "3DO Interactive Multiplayer",
  44: "294",//: "ColecoVision",
  45: "298",//: "Intellivision",
  46: "296",//: "Vectrex",
  //! "47": "PC-8000/8800",
  //! "49": "PC-FX",
  51: "187",//: "Atari 7800",
  53: "315",//: "WonderSwan",
  56: "685",//: "Neo Geo CD", //? neo geo
  57: "190",//: "Fairchild Channel F",
  63: "312",//: "Watara Supervision",
  //! "69": "Mega Duck",
  //! "71": "Arduboy",
  //!"72": "WASM-4",
  73: "322",//: "Arcadia 2001",
  //! "74": "Interton VC 4000",
  //! "75": "Elektor TV Games Computer",
  76: "148",//: "PC Engine CD/TurboGrafx-CD",
  77: "313",//: "Atari Jaguar CD", 313 (notCD)
  //! "78": "Nintendo DSi",
  //! "80": "Uzebox",
  // "101": "Events",
  // "102": "Standalone"
}
const googleQuerySite = 'site:www.romhacking.net OR site:wowroms.com/en/roms OR site:cdromance.org OR site:coolrom.com.au/roms OR site:planetemu.net OR site:emulatorgames.net OR site:romsfun.com/roms OR site:emu-land.net/en';

