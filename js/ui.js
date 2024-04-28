class UI {
  VERSION = "0.15";
  static AUTOCLOSE_CONTEXTMENU = false;
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

  };

  get ACHIEVEMENTS() {
    return this.GAME_DATA.Achievements;
  }
  get GAME_DATA() {
    return this._gameData;
  }
  set ACHIEVEMENTS(achievementsObject) {
    Object.values(achievementsObject.Achievements).map((achievement) => {
      UI.fixAchievement(achievement, achievementsObject);
    });
    this._gameData = achievementsObject;
    this.achievementsBlock.forEach((clone) =>
      clone.parseGameAchievements(this.GAME_DATA)
    );
    this.gameCard.updateGameCardInfo(this.GAME_DATA);
    if (this.target.AUTOFILL) {
      this.target.clearAllAchivements();
      this.target.fillItems();
    }
    this.progression.fillCards();
  }
  static fixAchievement(achievement, achievements) {
    const { BadgeName, DateEarned, DateEarnedHardcore } = achievement;

    //Додаєм кількість гравців
    achievement.totalPlayers = achievements.NumDistinctPlayers;

    // Визначаєм, чи отримано досягнення та чи є воно хардкорним
    achievement.isEarned = DateEarned ?? false;
    achievement.isHardcoreEarned = DateEarnedHardcore ?? false;

    // Додаєм адресу зображення для досягнення
    achievement.prevSrc = `https://media.retroachievements.org/Badge/${BadgeName}.png`;

    //Повертаємо виправлений об'єкт
    return achievement;
  }
  constructor() {
    loadSections()
      .then(() => {
        // Ініціалізація елементів
        this.initializeElements();

        //Встановлення розмірів і розміщення елементів
        this.setPositions();

        //Оновлення кольорів
        UI.updateColors();

        //Оновлення ачівментсів
        if (config.identConfirmed) {
          if (config.version != this.VERSION) {
            setTimeout(() => {
              document
                .querySelector("#help_section")
                .classList.remove("hidden");
              config.version = this.VERSION;
            }, 1500);
          }
          config.startOnLoad
            ? this.statusPanel.watchButton.click()
            : this.settings.checkIdButton.click();
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
    this.wrapper = document.querySelector(".wrapper");
    this.about = {
      section: document.querySelector("#help_section"),
    };
    this.loginCard = new LoginCard();
    this.target = new Target();
    this.achievementsBlock = [new AchievementsBlock()];
    this.settings = new Settings();
    this.awards = new Awards();
    this.gameCard = new GameCard();
    this.statusPanel = new StatusPanel();
    this.buttons = new ButtonPanel();
    this.games = new Games();
    this.progression = new Progression();
    document.addEventListener("click", (e) => {
      document.querySelectorAll(".context-menu").forEach((el) => el.remove());
    });
    document.body.addEventListener("contextmenu", (e) => {
      e.preventDefault();
      document.querySelector(".context-menu")?.remove();
      // this.contextMenu ? this.contextMenu.remove() : "";
      this.contextMenu = UI.generateContextMenu({
        menuItems: this.settings.contextMenuItems,
      });
      this.wrapper.appendChild(this.contextMenu);

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
  }
  //Встановлення розмірів і розміщення елементів
  setPositions() {
    // Проходження по кожному ідентифікатору контейнера в об'єкті config.uierw
    Object.getOwnPropertyNames(config.ui).forEach((containerId) => {
      // Отримання елемента за його ідентифікатором
      let element = document.getElementById(containerId);
      if (!element) return;
      // Отримання позиції та розмірів елемента з об'єкта config.ui
      const { x, y, width, height, hidden } = config.ui[containerId];
      // Встановлення нових значень стилів елемента, якщо вони вказані у config.ui
      // Якщо значення відсутнє (undefined), то стилі не змінюються
      x ? (element.style.left = x) : "";
      y ? (element.style.top = y) : "";
      width ? (element.style.width = width) : "";
      height ? (element.style.height = height) : "";
      hidden ? element.classList.add("hidden", "disposed") : "";
    });
    this.buttons.games.checked = !this.games.section.classList.contains("hidden");
    document.querySelector("#background-animation").style.display =
      config.bgVisibility ? "display" : "none";
  }
  showContextmenu({ event, menuItems, sectionCode = "" }) {
    event.preventDefault();
    event.stopPropagation();
    document.querySelector(".context-menu")?.remove();
    // this.contextMenu ? this.contextMenu.remove() : "";
    this.contextMenu = UI.generateContextMenu({
      menuItems: menuItems,
      sectionCode: sectionCode,
    });
    this.wrapper.appendChild(this.contextMenu);

    event.x + this.contextMenu.offsetWidth > window.innerWidth
      ? (this.contextMenu.style.left =
        event.x - this.contextMenu.offsetWidth + "px")
      : (this.contextMenu.style.left = event.x + "px");
    event.y + this.contextMenu.offsetHeight > window.innerHeight
      ? (this.contextMenu.style.top =
        event.y - this.contextMenu.offsetHeight + "px")
      : (this.contextMenu.style.top = event.y + "px");

    this.contextMenu.classList.remove("hidden");
  }
  createAchievementsTemplate() {
    if (this.achievementsBlock.length === 2) {
      UI.switchSectionVisibility(this.achievementsBlock[1]);
    } else {
      this.achievementsBlock.push(new AchievementsBlock(true));
      this.achievementsBlock.at(-1).parseGameAchievements(this.GAME_DATA);
    }
  }
  checkForNewAchieves(lastEarnedAchieves) {
    let earnedAchievements = [];
    lastEarnedAchieves.forEach((achievement) => {
      const savedAchievement = this.ACHIEVEMENTS[achievement.AchievementID];
      if (savedAchievement) {
        const isHardcoreMismatch =
          achievement.HardcoreMode === 1 && !savedAchievement?.isHardcoreEarned;
        const isSoftCoreMismatch = !savedAchievement.isEarned;
        if (isSoftCoreMismatch || isHardcoreMismatch) {
          earnedAchievements.push(achievement);
        }
      }
    });
    this.updateAchievements(earnedAchievements);
    return earnedAchievements?.map((achievement) => achievement.AchievementID);
  }
  updateAchievements(earnedAchievements) {
    earnedAchievements.forEach((achievement) => {
      const { HardcoreMode, Date } = achievement;
      const savedAchievement = this.ACHIEVEMENTS[achievement.AchievementID];
      if (HardcoreMode == 1) {
        savedAchievement.isHardcoreEarned = true;
        savedAchievement.DateEarnedHardcore = Date;
      }
      savedAchievement.isEarned = true;
      savedAchievement.DateEarned = savedAchievement.DateEarned ?? Date;
      this.ACHIEVEMENTS[achievement.AchievementID] = savedAchievement;
    });
  }
  static updateAchievementsSection({ widget, earnedAchievementIDs }) {
    earnedAchievementIDs.forEach((id) => {
      const achievement = ui.ACHIEVEMENTS[id];
      const achieveElement = widget.container.querySelector(
        `[data-achiv-id="${id}"]`
      );
      achieveElement.classList.add(
        "earned",
        achievement.isHardcoreEarned ? "hardcore" : "f"
      );
      achievement.DateEarnedHardcore
        ? (achieveElement.dataset.DateEarnedHardcore =
          achievement.DateEarnedHardcore)
        : "";

      if (widget.SORT_NAME === UI.sortMethods.latest) {
        widget.moveToTop(achieveElement);
      }
    });
    widget?.applyFilter();
  }
  updateGameInfo({
    Title,
    ConsoleName,
    ImageIcon,
    NumAchievements,
    UserCompletionHardcore,
    points_total,
    Achievements,
  }) {
    const {
      gamePreview,
      gameTitle,
      gamePlatform,
      gameAchivsCount,
      richPresence,
    } = ui.statusPanel;
    ui.gameCard.section.classList.remove("mastered");
    gamePreview.setAttribute(
      "src",
      `https://media.retroachievements.org${ImageIcon}`
    );
    gameTitle.innerText = Title || "Some game name";
    gameTitle.setAttribute(
      "href",
      "https://retroachievements.org/game/" + config.gameID
    );
    gamePlatform.innerText = ConsoleName || "";
    ui.statusPanel.updateProgress({
      totalPoints: points_total,
      achievements: Achievements,
    });
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
      const isExpandable = menuItem.hasOwnProperty("subMenu");
      let menuElement = document.createElement("li");
      menuElement.classList.add(
        "context-menu_item",
        isExpandable ? "expandable" : "f"
      );

      if (isExpandable) {
        menuElement.innerHTML += menuItem.label;
        menuElement.appendChild(
          UI.generateContextMenu({
            menuItems: menuItem.subMenu,
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
              }-${sectionCode}" id="${menuItem.id}-${sectionCode}" 
             ${menuItem.checked == true ? "checked" : ""} ${menuItem.event ?? ""
              }></input>
            <label class="context-menu_${menuItem.type}"  for="${menuItem.id
              }-${sectionCode}">${menuItem.label}</label>
            `;
            break;
          case "input-number":
            menuElement.innerHTML += `
            ${menuItem.prefix}
            <input class="context-menu_${menuItem.type}" id="${menuItem.id
              }-${sectionCode}" type="number" value="${menuItem.value ?? ""}" ${menuItem.event ?? ""
              } onclick="event.stopPropagation()">${menuItem.postfix ?? ""
              } </input>
            `;
            break;
          case "text-input":
            menuElement.innerHTML += `
              ${menuItem.prefix}
              <input class="context-menu_${menuItem.type}" id="${menuItem.id
              }-${sectionCode}" type="text"  onclick="event.stopPropagation()">${menuItem.postfix ?? ""
              }</input>
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
  // Функція зміни розміру вікна
  static resizeEvent({ event, section, postFunc }) {
    let resizeValues = {
      // Зберігаємо початкові розміри елемента
      startWidth: section.clientWidth,
      startHeight: section.clientHeight,

      // Зберігаємо координати миші
      startX: event.clientX,
      startY: event.clientY,
    };
    const resizeHandler = (event) => {
      UI.setSize(event, resizeValues, section);

      // Підігнати розмір досягнень відповідно до нового розміру контейнера
      postFunc ? postFunc() : "";
    };
    // Додаємо подію mousemove до документа
    document.addEventListener("mousemove", resizeHandler);

    // Видаляємо подію mousemove з документа, коли користувач відпускає кнопку миші
    document.addEventListener("mouseup", () => {
      document.removeEventListener("mousemove", resizeHandler);
      section.classList.remove("resized");
      config.setNewPosition({
        id: section.id,
        width: section.clientWidth,
        height: section.clientHeight,
      });
    });
  }
  static setSize(event, resizeValues, section) {
    // Отримуємо дані про розміри і початкові координати зміни розміру
    const { startWidth, startHeight, startX, startY } = resizeValues;

    // Обчислюємо зміни в розмірах з урахуванням переміщення миші
    const widthChange = event.clientX - startX;
    const heightChange = event.clientY - startY;

    //Залипанн до інших віджентів
    let width = startWidth + widthChange;
    let height = startHeight + heightChange;
    let { newHeight, newWidth } = UI.stickResizingSection({
      width: width,
      height: height,
      stickySection: section,
    });
    //Залипання до країв екрана
    const TOLERANCE = 10;
    const { offsetTop, offsetLeft } = section;
    //Перевірка залипання до правого краю
    newWidth =
      Math.abs(window.innerWidth - offsetLeft - newWidth) < TOLERANCE
        ? window.innerWidth - offsetLeft
        : newWidth;

    //Перевірка залипання до нижнього краю
    newHeight =
      Math.abs(window.innerHeight - newHeight - offsetTop) < TOLERANCE
        ? window.innerHeight - offsetTop
        : newHeight;

    // Оновлюємо ширину та висоту контейнера з урахуванням змін
    section.style.width = `${newWidth}px`;
    section.style.height = `${newHeight}px`;
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
        conditions.forEach(({ check, action }) => {
          if (check(section)) {
            action(section);
          }
        });
      }
    });

    return { newXPos, newYPos };
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
        conditions.forEach(({ check, action }) => {
          if (check(section)) {
            action(section);
          }
        });
      }
    });

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
      section.removeEventListener("mousemove", handleMouseMove);
      section.removeEventListener("mouseup", handleMouseUp);
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
    section.addEventListener("mousemove", handleMouseMove);
    section.addEventListener("mouseup", handleMouseUp);
    section.addEventListener("mouseleave", handleMouseUp);
  }
  static setPosition(e, offsetX, offsetY, section) {
    e.preventDefault();
    let XPos = e.clientX - offsetX;
    let YPos = e.clientY - offsetY;
    const { clientHeight, clientWidth } = section;

    //Перевірка залипань до інших віджетів
    let { newXPos, newYPos } = UI.stickMovingSection({
      x: XPos,
      y: YPos,
      stickySection: section,
    });

    //Перевірка залипання до правого краю
    const TOLERANCE = 10;
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

    //Встановлення нових позицій
    section.style.left = newXPos + "px";
    section.style.top = newYPos + "px";
  }

  static addDraggingEventForElements(container) {
    // const dragAndDropItems = container;
    // var list = document.getElementById("myList");
    // new Sortable(dragAndDropItems, {
    //   animation: 100,
    //   chosenClass: "dragged",
    // });
    // , {
    //   animation: 100,
    //   // chosenClass: "draggable",
    //   // dragClass: "draggableClass",
    // });
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
}

class AchievementsBlock {
  get contextMenuItems() {
    return [
      {
        label: "Sort",
        subMenu: [
          {
            type: "radio",
            name: "context-sort",
            id: "context-sort_latest",
            label: "Latest",
            checked: this.SORT_NAME === UI.sortMethods.latest,
            event: `onchange="ui.achievementsBlock[${this.CLONE_NUMBER}].SORT_NAME = UI.sortMethods.latest;"`,
          },
          {
            type: "radio",
            name: "context-sort",
            id: "context-sort_rarest",
            label: "Rarest",
            checked: this.SORT_NAME === UI.sortMethods.earnedCount,
            event: `onchange="ui.achievementsBlock[${this.CLONE_NUMBER}].SORT_NAME = UI.sortMethods.earnedCount;"`,
          },
          {
            type: "radio",
            name: "context-sort",
            id: "context-sort_points",
            label: "Points",
            checked: this.SORT_NAME === UI.sortMethods.points,
            event: `onchange="ui.achievementsBlock[${this.CLONE_NUMBER}].SORT_NAME = UI.sortMethods.points;"`,
          },
          {
            type: "radio",
            name: "context-sort",
            id: "context-sort_retropoints",
            label: "Retropoints",
            checked: this.SORT_NAME === UI.sortMethods.truepoints,
            event: `onchange="ui.achievementsBlock[${this.CLONE_NUMBER}].SORT_NAME = UI.sortMethods.truepoints;"`,
          },
          {
            type: "radio",
            name: "context-sort",
            id: "context-sort_default",
            label: "Default",
            checked: this.SORT_NAME === UI.sortMethods.default,
            event: `onchange="ui.achievementsBlock[${this.CLONE_NUMBER}].SORT_NAME = UI.sortMethods.default;"`,
          },
          {
            type: "radio",
            name: "context-sort",
            id: "context-sort_disable",
            label: "Disable",
            checked: this.SORT_NAME === UI.sortMethods.disable,
            event: `onchange="ui.achievementsBlock[${this.CLONE_NUMBER}].SORT_NAME = UI.sortMethods.disable;"`,
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
        subMenu: [
          {
            type: "radio",
            name: "context-filter",
            id: "context_filter-progression",
            label: "Progression",
            checked: this.FILTER_NAME === UI.filterMethods.progression,
            event: `onchange="ui.achievementsBlock[${this.CLONE_NUMBER}].FILTER_NAME = UI.filterMethods.progression;"`,
          },
          {
            type: "radio",
            name: "context-filter",
            id: "context_filter-missable",
            label: "Missable",
            checked: this.FILTER_NAME === UI.filterMethods.missable,
            event: `onchange="ui.achievementsBlock[${this.CLONE_NUMBER}].FILTER_NAME = UI.filterMethods.missable;"`,
          },
          {
            type: "radio",
            name: "context-filter",
            id: "context_filter-earned",
            label: "Earned",
            checked: this.FILTER_NAME === UI.filterMethods.earned,
            event: `onchange="ui.achievementsBlock[${this.CLONE_NUMBER}].FILTER_NAME = UI.filterMethods.earned;"`,
          },
          {
            type: "radio",
            name: "context-filter",
            id: "context_filter-all",
            label: "All",
            checked: this.FILTER_NAME === UI.filterMethods.all,
            event: `onchange="ui.achievementsBlock[${this.CLONE_NUMBER}].FILTER_NAME = UI.filterMethods.all;"`,
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
        label: "Achieve style",
        subMenu: [
          {
            type: "checkbox",
            name: "context_autoscroll-achieves",
            id: "context_autoscroll-achieves",
            label: "Autoscroll",
            checked: this.AUTOSCROLL,
            event: `onchange="ui.achievementsBlock[${this.CLONE_NUMBER}].AUTOSCROLL = this.checked;"`,
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
          {
            type: "checkbox",
            name: "context_stretch-achieves",
            id: "context_stretch-achieves",
            label: "Stretch",
            checked: this.ACHIV_STRETCH,
            event: `onchange="ui.achievementsBlock[${this.CLONE_NUMBER}].ACHIV_STRETCH = this.checked;"`,
          },
        ],
      },
      {
        label: "Show background",
        type: "checkbox",
        name: "context_show-bg",
        id: "context_show-bg",
        checked: this.BG_VISIBILITY,
        event: `onchange="ui.achievementsBlock[${this.CLONE_NUMBER}].BG_VISIBILITY = this.checked;"`,
      },
    ];
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
    return sortBy[this.SORT_NAME];
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
    return filterBy[this.FILTER_NAME];
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
    this.section.classList.toggle("bg-visible", this.BG_VISIBILITY);
  }
  get AUTOSCROLL() {
    return config?.ui[this.SECTION_NAME]?.autoscroll ?? true;
  }
  set AUTOSCROLL(value) {
    config.ui[this.SECTION_NAME].autoscroll = value;
    value ? this.startAutoScroll() : this.stopAutoScroll();
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
    this.cloneAchieves();
  }
  initializeElements() {
    // Елементи блока досягнень
    this.section = this.generateNewWidget({}); // Секція блока досягнень
    document.querySelector(".wrapper").appendChild(this.section);

    this.container = this.section.querySelector(`.achievements-container`); //Контейнер  з досягненнями
    this.resizer = this.section.querySelector(
      `#achivs-resizer${this.CLONE_NUMBER}`
    ); // Ресайзер блока досягнень
  }
  addEvents() {
    // Додавання подій для пересування вікна ачівментсів
    this.section.addEventListener("mousedown", (e) => {
      UI.moveEvent(this.section, e);
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
        postFunc: () => {
          this.fitSizeVertically(true);
        },
      });
    });
    this.resizer.addEventListener("mouseup", (e) => {
      this.startAutoScroll();
    });
  }
  setValues() {
    // if (!config.ui.achievements_section) {
    //   UI.switchSectionVisibility(this);
    // }
    this.section.classList.toggle("bg-visible", this.BG_VISIBILITY);
    if (config.ui[this.SECTION_NAME]) {
      // UI.switchSectionVisibility(this);
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
  }

  clearAchievementsSection() {
    const { container } = this;
    container.innerHTML = "";
  }
  // Розбирає отримані досягнення гри та відображає їх на сторінці
  parseGameAchievements(achivs) {
    // Очистити вміст розділу досягнень
    this.clearAchievementsSection();

    // Оновити інформацію про гру
    ui.updateGameInfo(achivs);

    // Відсортувати досягнення та відобразити їх
    this.displayAchievements(achivs);

    // Підгонка розміру досягнень
    this.fitSizeVertically();

    this.applyFilter();
    this.applySorting();
    this.startAutoScroll();
    //Додаєм можливість перетягування елементів
    UI.addDraggingEventForElements(this.container);
  }

  displayAchievements(achievementsObject) {
    Object.values(achievementsObject.Achievements).forEach((achievement) => {
      this.displayAchievement(achievement);
    });
  }

  displayAchievement(achievement) {
    const { container } = this;
    const achivElement = this.generateAchievement(achievement);
    container.appendChild(achivElement);
  }
  //Додавання відсутніх властивостей
  fixAchievement(achievement, achievements) {
    const { BadgeName, DateEarned, DateEarnedHardcore } = achievement;

    //Додаєм кількість гравців
    achievement.totalPlayers = achievements.NumDistinctPlayers;

    // Визначаєм, чи отримано досягнення та чи є воно хардкорним
    achievement.isEarned = DateEarned !== undefined;
    achievement.isHardcoreEarned = DateEarnedHardcore !== undefined;

    // Додаєм адресу зображення для досягнення
    achievement.prevSrc = `https://media.retroachievements.org/Badge/${BadgeName}.png`;

    //Повертаємо виправлений об'єкт
    return achievement;
  }

  generateAchievement(achievement) {
    const {
      ID,
      Points,
      TrueRatio,
      isEarned,
      isHardcoreEarned,
      prevSrc,
      NumAwardedHardcore,
      DateEarnedHardcore,
      type,
      DisplayOrder,
    } = achievement;

    let achivElement = document.createElement("li");
    achivElement.classList.add("achiv-block");

    if (isEarned) {
      achivElement.classList.add("earned");
      if (isHardcoreEarned) {
        achivElement.classList.add("hardcore");
      }
    }

    achivElement.dataset.achivId = ID;
    achivElement.dataset.Points = Points;
    achivElement.dataset.TrueRatio = TrueRatio;
    achivElement.dataset.DisplayOrder = DisplayOrder;

    achivElement.dataset.NumAwardedHardcore = NumAwardedHardcore;
    DateEarnedHardcore
      ? (achivElement.dataset.DateEarnedHardcore = DateEarnedHardcore)
      : "";
    achivElement.dataset.type = type;

    let previewContainer = document.createElement("div");
    previewContainer.classList.add("preview-container");

    let achivPreview = document.createElement("img");
    achivPreview.classList.add("achiv-preview");
    achivPreview.src = prevSrc;

    previewContainer.appendChild(achivPreview);
    achivElement.appendChild(previewContainer);

    let toTargetButton = document.createElement("button");
    toTargetButton.classList.add("add-to-target");
    toTargetButton.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 -960 960 960" width="24">
        <path d="M440-280h80v-160h160v-80H520v-160h-80v160H280v80h160v160Zm40 200q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-80q134 0 227-93t93-227q0-134-93-227t-227-93q-134 0-227 93t-93 227q0 134 93 227t227 93Zm0-320Z"/>
      </svg>
    `;
    achivElement.appendChild(toTargetButton);

    // let achivDetails = this.generateAchivDetails(achievement);
    // achivElement.appendChild(achivDetails);

    achivElement.addEventListener("mouseover", (e) => {
      const popUp = this.generateAchivDetails(achievement);
      ui.wrapper.querySelectorAll(".popup").forEach((popup) => popup.remove());
      popUp.classList.add("popup");
      ui.wrapper.appendChild(popUp);

      const rect = achivElement.getBoundingClientRect();
      const leftPos = rect.left + achivElement.offsetWidth + 8;
      const topPos = rect.top + 2;
      popUp.style.left = leftPos + "px";
      popUp.style.top = topPos + "px";
      this.fixDetailsPosition(popUp);

      requestAnimationFrame(() => popUp.classList.add("visible"));
    });
    achivElement.addEventListener("mouseleave", (e) => {
      ui.wrapper.querySelectorAll(".popup").forEach((popup) => popup.remove());
    });
    //!----------[ CONTEXT MENU ]---------------

    achivElement.addEventListener("mousedown", (e) => {
      e.stopPropagation();
    });
    // achivElement.addEventListener("click", (e) => {
    //   this.container.querySelectorAll(".achiv-block").forEach((achiv) => {
    //     if (achiv !== achivElement) achiv.classList.remove("expanded");
    //   });
    //   // achivElement.classList.toggle("expanded");
    // });
    toTargetButton.addEventListener("click", (e) => {
      ui.target.addAchieveToTarget(achievement);
    });

    return achivElement;
  }

  generateAchivDetails({
    Title,
    Description,
    DateEarned,
    DateEarnedHardcore,
    Points,
    TrueRatio,
    NumAwardedHardcore,
    totalPlayers,
  }) {
    let detailsElement = document.createElement("div");
    detailsElement.classList.add("achiv-details-block");
    detailsElement.dataset.pointStyle =
      Points < 10 ? "poor" : Points < 20 ? "normal" : "reach";
    detailsElement.innerHTML = `
    <h3>${Title}</h3>
    <p>${Description}</p>
    <p>Earned by ${NumAwardedHardcore} of ${totalPlayers} players</p>
    <p class="points">${Points} [${TrueRatio}] points</p>
    ${DateEarnedHardcore
        ? "<p>Earned hardcore: " + fixTimeString(DateEarnedHardcore) + "</p>"
        : DateEarned
          ? "<p>Earned softcore: " + fixTimeString(DateEarned) + "</p>"
          : ""
      }
      `;
    return detailsElement;
  }
  fixDetailsPosition(achivDetails) {
    let { left, right, top, bottom } = achivDetails.getBoundingClientRect();
    if (left < 0) {
      achivDetails.classList.remove("left-side");
    }
    if (right > window.innerWidth) {
      achivDetails.classList.add("left-side");
    }
    if (top < 0) {
      achivDetails.classList.remove("top-side");
    } else if (bottom > window.innerHeight) {
      achivDetails.classList.add("top-side");
    }
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
    if (isLoadDynamic || !config.ui[this.SECTION_NAME]?.height) {
      windowHeight = section.clientHeight - 35;
      windowWidth = section.clientWidth;
    } else {
      windowHeight = parseInt(config.ui[this.SECTION_NAME].height) - 35;
      windowWidth = parseInt(config.ui[this.SECTION_NAME].width);
    }

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
      rowsCount = Math.floor(windowHeight / (achivWidth + 2));
      colsCount = Math.floor(windowWidth / (achivWidth + 2));
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
  autoscrollInterval;
  startAutoScroll(toBottom = true) {
    clearInterval(this.autoscrollInterval);
    let speedInPixPerSec = 20;
    let refreshRateMiliSecs = 50;

    let scrollContainer = this.container;
    let speedInPixels = 1;
    const pauseOnEndMilisecs = 500;
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
            clearInterval(this.autoscrollInterval);
            setTimeout(() => this.startAutoScroll(false), pauseOnEndMilisecs);
          }
        } else {
          scrollContainer.scrollTop -= speedInPixels;
          if (scrollContainer.scrollTop === 0) {
            clearInterval(this.autoscrollInterval);
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
      </svg></div>
    <h2 class="widget-header-text achivs-header-text">Achieves${this.CLONE_NUMBER === 0 ? "" : this.CLONE_NUMBER
      }</h2>

    <button class="header-button header-icon" onclick="ui.achievementsBlock[${this.CLONE_NUMBER
      }].close();">
      <svg height="24" viewBox="0 -960 960 960" width="24">
        <path d="m256-200-56-56 224-224-224-224 56-56 224 224 224-224 56 56-224 224 224 224-56 56-224-224-224 224Z" />
      </svg>
    </button>
  </div>
  <ul class="achievements-container"></ul>
  <div class="resizer" id="achivs-resizer${this.CLONE_NUMBER}"></div>
    `;
    return newWidget;
  }
  cloneAchieves() {
    // let achievements = ui.achievementsBlock[0]?.container.innerHTML;
    // this.container.innerHTML = achievements ?? "";
    // this.container.querySelectorAll(".achiv-block").forEach((achivElement) => {
    //   let achivDetails = achivElement.querySelector(".achiv-details-block");
    //   achivElement.addEventListener("mouseenter", (e) => {
    //     achivDetails.classList.remove("left-side", "top-side");
    //     this.fixDetailsPosition(achivDetails);
    //   });
    //   achivElement.addEventListener("mousedown", (e) => {
    //     e.stopPropagation();
    //   });
    // });
    // this.container
    //   .querySelectorAll(".add-to-target")
    //   .forEach((button) => (button.style.display = "none"));
    // this.applyFilter();
    // this.applySorting();
    // this.fitSizeVertically();
  }
}

class ButtonPanel {
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
    this.about = this.section.querySelector("#open-about-button");
    this.gameCard = this.section.querySelector("#open-game-card-button");
    this.target = this.section.querySelector("#open-target-button");
    this.status = this.section.querySelector("#open-status-button");
    this.awards = this.section.querySelector("#open-awards-button");
    this.games = this.section.querySelector("#open-games-button");
    this.progression = this.section.querySelector("#open-progression-button");
    this.userImage = this.section.querySelector("#side-panel-user-image");


  }
  addEvents() {
    // Отримуємо посилання на панель
    this.sidePanel = document.querySelector("#side_panel");
    setTimeout(() => ui.buttons.section.classList.remove("expanded"), 2000);
    // Додаємо подію для відслідковування руху миші
    document.addEventListener("mousemove", (e) => {
      // Перевіряємо, чи миша знаходиться біля правого краю екрану
      if (e.clientX < 10) {
        // Якщо так, показуємо панель
        this.section.classList.add("expanded");
        this.section.addEventListener("mouseleave", (e) => {
          setTimeout(
            () => ui.buttons.section.classList.remove("expanded"),
            200
          );
        });
      }
    });
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
    this.settings.addEventListener("change", (e) => {
      UI.switchSectionVisibility(ui.settings);
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
    this.about.addEventListener("change", (e) => {
      UI.switchSectionVisibility(ui.about);
    });
    this.progression.addEventListener("change", (e) => {

      UI.switchSectionVisibility(ui.progression);
    });
  }

  setValues() {
    // Встановлення початкових індикаторів віджетів
    this.achievements.checked =
      !config.ui?.achievements_section?.hidden ?? false;

    this.settings.checked = !config.ui?.settings_section?.hidden ?? true;

    this.login.checked = !config.ui?.login_section?.hidden ?? true;

    this.target.checked = !config.ui?.target_section?.hidden ?? true;

    this.gameCard.checked = !config.ui?.game_section?.hidden ?? true;

    this.status.checked = !config.ui?.["update-section"]?.hidden ?? true;

    this.awards.checked = !config.ui?.awards_section?.hidden ?? true;
    this.progression.checked = !config.ui?.progression_section?.hidden ?? true;
    this.userImage.src = config.userImageSrc;
  }
}
class StatusPanel {
  constructor() {
    this.initializeElements();
    this.addEvents();
    if (!config.ui["update-section"]) {
      UI.switchSectionVisibility(this);
    }
  }
  initializeElements() {
    this.section = document.querySelector("#update-section");
    this.gamePreview = document.querySelector("#game-preview"); // Іконка гри
    this.textBlock = document.querySelector("#update-text-block");
    this.gameTitle = document.querySelector("#game-title"); // Заголовок гри
    this.gamePlatform = document.querySelector("#game-platform"); // Платформа гри
    this.richPresence = document.querySelector("#rich-presence");
    this.watchButton = document.querySelector("#watching-button"); // Кнопка спостереження за грою
    this.progresBar = document.querySelector("#status-progress-bar");
    this.progressStatusText = document.querySelector("#status-progress-text");
    this.resizer = document.querySelector("#status-resizer");
  }
  addEvents() {
    this.watchButton.addEventListener("mousedown", (e) => {
      e.stopPropagation();
    });
    // Додаємо обробник події 'click' для кнопки автооновлення
    this.watchButton.addEventListener("click", (e) => {
      e.stopPropagation();
      // Перевіряємо стан кнопки та відповідно запускаємо або припиняємо автооновлення
      this.watchButton.classList.contains("active")
        ? stopWatching()
        : startWatching();
    });
    //relel;
    this.textBlock.addEventListener("mousedown", (e) => {
      UI.moveEvent(this.section, e);
      //fsdf;
    });
    this.resizer.addEventListener("mousedown", (event) => {
      event.stopPropagation();
      this.section.classList.add("resized");
      UI.resizeEvent({
        event: event,
        section: this.section,
        postFunc: () => "",
      });
    });
  }
  updateProgress({ totalPoints, earnedAchievementIDs, achievements }) {
    let achievedCount = 0; // Лічильник досягнень
    let totalCount = 0; // Загальна кількість досягнень
    let totalEarnedPoints = 0;
    const width = this.section.clientWidth || 0; // Отримання ширини блока

    // Перевірка наявності досягнень
    if (achievements) {
      // Підрахунок кількості досягнень та набраних балів
      Object.values(achievements).forEach((achievement) => {
        totalCount++; // Збільшення загальної кількості досягнень
        if (achievement.DateEarnedHardcore) {
          totalEarnedPoints += achievement.Points; // Додавання балів
          achievedCount++; // Збільшення кількості досягнень
        }
      });
      // Збереження загальної кількості досягнень та балів у датасет
      this.progresBar.dataset.totalCount = totalCount;
      this.progresBar.dataset.totalPoints = totalPoints;
    } else {
      achievedCount =
        parseInt(this.progresBar.dataset.achievedCount) +
        earnedAchievementIDs.length || 0;
      totalEarnedPoints = parseInt(this.progresBar.dataset.points);
      earnedAchievementIDs.forEach((id) => {
        if (ui.ACHIEVEMENTS[id].DateEarnedHardcore) {
          totalEarnedPoints += ui.ACHIEVEMENTS[id].Points;
        }
      });

      // Оновлення значень у випадку відсутності досягнень
      totalCount = parseInt(this.progresBar.dataset.totalCount) || 0;
      // points = totalEarnedPoints;
      totalPoints = parseInt(this.progresBar.dataset.totalPoints) || 0;
    }
    // Оновлення даних про досягнення та бали у датасет
    this.progresBar.dataset.achievedCount = achievedCount;
    this.progresBar.dataset.points = totalEarnedPoints;

    // Обчислення прогресу за балами та за кількістю досягнень
    const completionByPoints = totalEarnedPoints / totalPoints || 0;
    const completionByPointsPercents = ~~(completionByPoints * 100) + "%";
    //*Потрібно перевести ширину у відсотки від ширини прогресу по поінтах
    const completionByPointsInPixels = completionByPoints * width;
    const completionByCount =
      (width * achievedCount) / (totalCount * completionByPointsInPixels) || 0;
    const completionByCountPercent =
      ~~((100 * achievedCount) / totalCount) + "%";
    // Встановлення стилів прогресу
    this.progresBar.style.setProperty(
      "--progress-points",
      completionByPoints * 100 + "%"
    );
    this.progresBar.style.setProperty(
      "--progress-count",
      completionByCount * 100 + "%"
    );
    ui.gameCard.updateGameInfoElement({
      name: "Completion",
      value: `${completionByPointsPercents} of points [${completionByCountPercent}]`,
    });
    if (totalPoints === totalEarnedPoints) {
      ui.gameCard.section.classList.add("mastered");
    }
    this.progressStatusText.innerText = completionByPointsPercents;
  }
}
class Settings {
  get contextMenuItems() {
    return [
      {
        label: "Colors",
        subMenu: [
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
      {
        label: "Show bg-animation",
        type: "checkbox",
        name: "context_show-bg-animation",
        id: "context_show-bg-animation",
        checked: ui.settings.BG_ANIMATION,
        event: `onchange="ui.settings.BG_ANIMATION = this.checked;"`,
      },
      // {
      //   prefix: "Update delay",
      //   postfix: "sec",
      //   type: "input-number",
      //   id: "context-menu_update-delay",
      //   label: "Update delay",
      //   value: this.ACHIV_MIN_SIZE,
      //   event: `onchange="ui.achievementsBlock[${this.CLONE_NUMBER}].ACHIV_MIN_SIZE = this.value;"`,
      // },
      // {
      //   prefix: "Target user",
      //   postfix: "",
      //   type: "text-input",
      //   id: "context-menu_target-user",
      //   label: "Target user",
      //   value: this.ACHIV_MIN_SIZE,
      //   event: `onchange="ui.achievementsBlock[${this.CLONE_NUMBER}].ACHIV_MIN_SIZE = this.value;"`,
      // },
      {
        label: "Start on load",
        type: "checkbox",
        name: "context_show-start-on-load",
        id: "context_show-start-on-load",
        checked: ui.settings.START_ON_LOAD,
        event: `onchange="ui.settings.START_ON_LOAD = this.checked;"`,
      },
    ];
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
  constructor() {
    this.initializeElements();
    this.addEvents();
    this.setValues();
  }
  initializeElements() {
    // Елементи налаштувань
    this.section = document.querySelector("#settings_section"); //* Контейнер налаштувань

    this.header = document.querySelector(".prefs-header-container");
    this.updateInterval = document.querySelector("#update-time"); // Поле введення інтервалу оновлення

    //!-------------------------------[ COLORS ]-----------------------------
    this.mainColorInput = document.querySelector("#main-color-input");
    this.secondaryColorInput = document.querySelector("#secondary-color-input");
    this.accentColorInput = document.querySelector("#accent-color-input");
    this.fontColorInput = document.querySelector("#font-color-input");
    this.selectionColorInput = document.querySelector("#selection-color-input"); //
    this.colorPresetSelector = document.querySelector(
      "#color-preset-selection"
    );
    this.showBackgroundCheckbox = document.querySelector(
      "#show-background_button"
    );
    //!-----------------------------------------

    this.targetUserInput = document.querySelector("#target-user");
    this.gameID = document.querySelector("#game-id"); // Поле введення ідентифікатора гри
    this.getGameIdButton = document.querySelector(".get-id-button"); // Кнопка отримання ідентифікатора гри
    this.checkIdButton = document.querySelector(".check-id-button"); // Кнопка перевірки ідентифікатора гри
    this.startOnLoadCheckbox = document.querySelector("#update-on-load");
  }
  setValues() {
    if (!config.ui.settings_section) {
      UI.switchSectionVisibility(this);
    }
    // this.settings.stretchButton.classList
    // Отримати ідентифікатор гри з localStorage та встановити його значення
    this.gameID.value = config.gameID;

    this.targetUserInput.value = config.targetUser ?? config.USER_NAME;
    this.targetUserInput.setAttribute(
      "placeholder",
      config.USER_NAME || "your username if empty"
    );
    this.updateInterval.value = config.updateDelay;

    this.mainColorInput.value = config.mainColor;
    this.secondaryColorInput.value = config.secondaryColor;
    this.accentColorInput.value = config.accentColor;
    this.fontColorInput.value = config.fontColor;
    this.selectionColorInput.value = config.selectionColor;
    this.colorPresetSelector.value = config.colorsPreset;
    this.colorPresetSelector.dispatchEvent(new Event("change"));
    this.showBackgroundCheckbox.checked = config.bgVisibility;
    this.startOnLoadCheckbox.checked = config.startOnLoad;
  }
  addEvents() {
    // Додаємо обробник події 'change' для поля введення інтервалу оновлення
    this.updateInterval.addEventListener("change", () => {
      // Оновлюємо інтервал оновлення
      config.updateDelay = this.updateInterval.value || 5;
    });
    this.showBackgroundCheckbox.addEventListener("change", (e) => {
      config.bgVisibility = this.showBackgroundCheckbox.checked;
      document.querySelector("#background-animation").style.display =
        config.bgVisibility ? "block" : "none";
    });
    // Додаємо обробник події 'change' для поля введення ідентифікатора гри
    this.gameID.addEventListener("change", () => {
      // Оновлюємо ідентифікатор гри
      config.gameID = this.gameID.value;
    });

    this.mainColorInput.addEventListener("change", (e) => {
      e.stopPropagation();
      config.mainColor = this.mainColorInput.value;
      UI.updateColors("custom");
    });
    this.secondaryColorInput.addEventListener("change", (e) => {
      e.stopPropagation();
      config.secondaryColor = this.secondaryColorInput.value;
      UI.updateColors("custom");
    });
    this.accentColorInput.addEventListener("change", (e) => {
      e.stopPropagation();
      config.accentColor = this.accentColorInput.value;
      UI.updateColors("custom");
    });
    this.fontColorInput.addEventListener("change", (e) => {
      e.stopPropagation();
      const preset = (this.colorPresetSelector.value = "custom");
      config.fontColor = this.fontColorInput.value;
      UI.updateColors("custom");
    });
    this.selectionColorInput.addEventListener("change", (e) => {
      e.stopPropagation();
      config.selectionColor = this.selectionColorInput.value;
      UI.updateColors("custom");
    });
    this.colorPresetSelector.addEventListener("change", (e) => {
      const preset = this.colorPresetSelector.value;
      document
        .querySelector(".colors-block")
        .classList.toggle("hidden", preset !== "custom");
      UI.updateColors(preset);
    });

    this.targetUserInput.addEventListener("change", (e) => {
      e.stopPropagation();
      config.targetUser = this.targetUserInput.value;
    });

    //Додаємо обробник події 'click' для кнопки отримання id останньої гри
    this.getGameIdButton.addEventListener("click", () => {
      apiWorker.getProfileInfo({}).then((resp) => {
        this.gameID.value = resp.LastGameID;
        config.gameID = resp.LastGameID;
      });
    });

    //Додаємо обробник події 'click' для кнопки отримання списку ачівментсів для вибраного id гри
    this.checkIdButton.addEventListener("click", () => {
      getAchievements();
    });

    this.startOnLoadCheckbox.addEventListener("change", (e) => {
      e.stopPropagation();
      config.startOnLoad = this.startOnLoadCheckbox.checked;
    });

    // Додавання подій для пересування вікна налаштувань
    this.header.addEventListener("mousedown", (e) => {
      UI.moveEvent(this.section, e);
    });
  }
  close() {
    ui.buttons.settings.click();
  }
}

class GameCard {
  get contextMenuItems() {
    return this._contextMenuItems;
  }
  set contextMenuItems(value) {
    this._contextMenuItems = value;
  }
  _contextMenuItems = [
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
        this.contextMenuItems.map((menuItem) => {
          menuItem.label == name ? (menuItem.checked = checkbox.checked) : "";
        });
        if (!config.ui.hasOwnProperty("game_section")) {
          config.ui.game_section = [];
        }
        config.ui.game_section.gameInfoElements = this.gameInfoElements;
        config.ui.game_section.contextMenuItems = this.contextMenuItems;
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
    if (!config.ui.game_section) {
      UI.switchSectionVisibility(this);
    }
    //-----------

    // Додавання подій для пересування вікна картки гри
  }
  loadSavedData() {
    config.ui?.game_section?.gameInfoElements
      ? (this.gameInfoElements = config.ui.game_section.gameInfoElements)
      : "";
    config.ui?.game_section?.contextMenuItems
      ? (this.contextMenuItems = config.ui.game_section.contextMenuItems)
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
        postFunc: () => "",
      });
    });
  }
  updateGameCardInfo({
    Title,
    ID,
    ImageBoxArt,
    ConsoleName,
    Developer,
    Publisher,
    Genre,
    Released,
    UserCompletion,
    UserCompletionHardcore,
    achievements_published,
    players_total,
    points_total,
  }) {
    this.header.innerText = Title;
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
  awardTypes = {
    mastery: "mastery",
    completion: "completion",
    beatenSoftcore: "beatenSoftcore",
    beatenHardcore: "beatenHardcore",
  };
  constructor() {
    this.initializeElements();
    this.addEvents();
    if (!config.ui.awards_section) {
      UI.switchSectionVisibility(this);
    }
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
    this.section.querySelector("#awards-button").click();
    this.resizer.addEventListener("mousedown", (event) => {
      event.stopPropagation();
      this.section.classList.add("resized");
      UI.resizeEvent({
        event: event,
        section: this.section,
        postFunc: () => "",
      });
    });
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
          // Генеруємо рядок часу на основі дати нагородження за допомогою функції fixTimeString
          game.timeString = fixTimeString(game.AwardedAt);
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
  get contextMenuItems() {
    return [
      {
        label: "Sort",
        subMenu: [
          {
            type: "radio",
            name: "context-sort",
            id: "context-sort_latest",
            label: "Latest",
            checked: this.SORT_NAME === UI.sortMethods.latest,
            event: `onchange="ui.target.SORT_NAME = UI.sortMethods.latest;"`,
          },
          {
            type: "radio",
            name: "context-sort",
            id: "context-sort_rarest",
            label: "Rarest",
            checked: this.SORT_NAME === UI.sortMethods.earnedCount,
            event: `onchange="ui.target.SORT_NAME = UI.sortMethods.earnedCount;"`,
          },
          {
            type: "radio",
            name: "context-sort",
            id: "context-sort_points",
            label: "Points",
            checked: this.SORT_NAME === UI.sortMethods.points,
            event: `onchange="ui.target.SORT_NAME = UI.sortMethods.points;"`,
          },
          {
            type: "radio",
            name: "context-sort",
            id: "context-sort_retropoints",
            label: "Retropoints",
            checked: this.SORT_NAME === UI.sortMethods.truepoints,
            event: `onchange="ui.target.SORT_NAME = UI.sortMethods.truepoints;"`,
          },
          {
            type: "radio",
            name: "context-sort",
            id: "context-sort_default",
            label: "Default",
            checked: this.SORT_NAME === UI.sortMethods.default,
            event: `onchange="ui.target.SORT_NAME = UI.sortMethods.default;"`,
          },
          // {
          //   type: "radio",
          //   name: "context-sort",
          //   id: "context-sort_id",
          //   label: "ID",
          //   checked: this.SORT_NAME === UI.sortMethods.id,
          //   event: `onchange="ui.target.SORT_NAME = UI.sortMethods.id;"`

          // },
          {
            type: "radio",
            name: "context-sort",
            id: "context-sort_dont-sort",
            label: "Disable",
            checked: this.SORT_NAME === UI.sortMethods.disable,
            event: `onchange="ui.target.SORT_NAME = UI.sortMethods.disable;"`,
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
        subMenu: [
          {
            type: "radio",
            name: "context-filter",
            id: "context_filter-progression",
            label: "Progression",
            checked: this.FILTER_NAME === UI.filterMethods.progression,
            event: `onchange="ui.target.FILTER_NAME = UI.filterMethods.progression;"`,
          },
          {
            type: "radio",
            name: "context-filter",
            id: "context_filter-missable",
            label: "Missable",
            checked: this.FILTER_NAME === UI.filterMethods.missable,
            event: `onchange="ui.target.FILTER_NAME = UI.filterMethods.missable;"`,
          },
          {
            type: "radio",
            name: "context-filter",
            id: "context_filter-earned",
            label: "Earned",
            checked: this.FILTER_NAME === UI.filterMethods.earned,
            event: `onchange="ui.target.FILTER_NAME = UI.filterMethods.earned;"`,
          },
          {
            type: "radio",
            name: "context-filter",
            id: "context_filter-all",
            label: "All",
            checked: this.FILTER_NAME === UI.filterMethods.all,
            event: `onchange="ui.target.FILTER_NAME = UI.filterMethods.all;"`,
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
        subMenu: [
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
        subMenu: [
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
  sectionCode = "-target";
  set SORT_NAME(value) {
    config._cfg.settings.sortTargetBy = value;
    config.writeConfiguration();
    this.applySort();
  }
  get SORT_NAME() {
    return config._cfg.settings.sortTargetBy || UI.sortMethods.default;
  }
  get SORT_METHOD() {
    return sortBy[this.SORT_NAME];
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
    return filterBy[this.FILTER_NAME];
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
  constructor() {
    this.initializeElements();
    this.addEvents();
  }
  initializeElements() {
    this.section = document.querySelector("#target_section");

    this.header = document.querySelector(".target-header_container");
    this.container = document.querySelector(".target-container");

    this.autoclearCheckbox = document.querySelector(
      `#context-autoclear${this.sectionCode}`
    );
    this.autoClearInput = document.querySelector(
      `#context-autoclear-delay${this.sectionCode}`
    );
    this.autofillCheckbox = document.querySelector(
      `#context-autofill${this.sectionCode}`
    );

    this.sortByLatestRadio = document.querySelector(
      `#context-sort_latest${this.sectionCode}`
    );

    this.sortByPointsRadio = document.querySelector(
      `#context-sort_points${this.sectionCode}`
    );
    this.sortByTruepointsRadio = document.querySelector(
      `#context-sort_retropoints${this.sectionCode}`
    );
    this.sortByRarestRadio = document.querySelector(
      `#context-sort_rarest${this.sectionCode}`
    );

    this.sortByIdRadio = document.querySelector(
      `#context-sort_id${this.sectionCode}`
    );
    this.sortByDefaultRadio = document.querySelector(
      `#context-sort_default${this.sectionCode}`
    );
    this.sortByDisableRadio = document.querySelector(
      `#context-sort_dont-sort${this.sectionCode}`
    );
    this.sortReverseCheckbox = document.querySelector(
      `#context-reverse-sort${this.sectionCode}`
    );

    this.filterByMissableRadio = document.querySelector(
      `#context_filter-missable${this.sectionCode}`
    );
    this.filterByEarnedRadio = document.querySelector(
      `#context_filter-earned${this.sectionCode}`
    );
    this.filterByAllRadio = document.querySelector(
      `#context_filter-all${this.sectionCode}`
    );
    this.filterReverseCheckbox = document.querySelector(
      `#context-reverse-filter${this.sectionCode}`
    );
    this.hideFilteredCheckbox = document.querySelector(
      `#context-hide-filtered${this.sectionCode}`
    );
    this.clearAllAchivementsButton = document.querySelector(
      `#context-clear-all${this.sectionCode}`
    );
    this.fillAchivementsButton = document.querySelector(
      `#context-fill${this.sectionCode}`
    );
    // this.moveToTopCheckbox = document.querySelector("#target-move-to-top");

    this.resizer = document.querySelector("#target-resizer");
  }

  addEvents() {
    // Додавання подій для пересування вікна досягнень
    this.resizer.addEventListener("mousedown", (event) => {
      event.stopPropagation();
      this.section.classList.add("resized");
      UI.resizeEvent({
        event: event,
        section: this.section,
        postFunc: () => "",
      });
    });
    // Додавання подій для пересування вікна target
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
  }
  isAchievementInTargetSection({ ID, targetContainer }) {
    const targetAchievements = [
      ...targetContainer.querySelectorAll(".target-achiv"),
    ].map((el) => +el.dataset.achivId);

    return targetAchievements.includes(ID);
  }
  addAchieveToTarget({
    Title,
    prevSrc,
    Description,
    Points,
    TrueRatio,
    isEarned,
    isHardcoreEarned,
    ID,
    type,
    NumAwardedHardcore,
    totalPlayers,
    DateEarnedHardcore,
    DisplayOrder,
  }) {
    // Перевіряємо чи ачівки нема в секції тарґет
    if (
      this.isAchievementInTargetSection({
        ID: ID,
        targetContainer: this.container,
      })
    ) {
      return;
    }

    let targetElement = document.createElement("li");
    targetElement.classList.add("target-achiv");
    // targetElement.setAttribute("draggable", "true");
    targetElement.dataset.type = type;
    targetElement.dataset.Points = Points;
    targetElement.dataset.TrueRatio = TrueRatio;
    targetElement.dataset.DisplayOrder = DisplayOrder;
    DateEarnedHardcore
      ? (targetElement.dataset.DateEarnedHardcore = DateEarnedHardcore)
      : "";

    targetElement.dataset.NumAwardedHardcore = NumAwardedHardcore;
    targetElement.dataset.achivId = ID;
    if (isEarned) {
      targetElement.classList.add("earned");
      if (isHardcoreEarned) {
        targetElement.classList.add("hardcore");
      }
    }

    targetElement.innerHTML = `
    <button class="delete-from-target" title="remove from target" onclick="ui.target.deleteFromTarget(this)">
      <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 -960 960 960" width="24">
        <path d="M280-440h400v-80H280v80ZM480-80q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-80q134 0 227-93t93-227q0-134-93-227t-227-93q-134 0-227 93t-93 227q0 134 93 227t227 93Zm0-320Z"/>
      </svg>
    </button>
    <div class="prev">
              <img
                class="prev-img"
                src="${prevSrc}"
                alt=" "
              />
            </div>
            <div class="target-achiv-details">
              <h3 class="achiv-name"><a target="_blanc" href="https://retroachievements.org/achievement/${ID}">${Title}</a></h3>
              <p class="achiv-description">${Description}</p>
              <div class="target-other-descriptions">
                <div class=" condition ${type ?? "none"
      }" title="achievement type"></div>
                <p class="target-description-text" title="points">${Points} [${TrueRatio}] points</p>
                <p class="target-description-text" title="earned by">${~~(
        (100 * NumAwardedHardcore) /
        totalPlayers
      )}%</p>
              </div>
             
            </div>
    `;
    targetElement.addEventListener("mousedown", (e) => e.stopPropagation());
    this.container.appendChild(targetElement);

    UI.addDraggingEventForElements(this.container);

    const conditions = {
      progression: "progression",
      win_condition: "win_condition",
      missable: "missable",
    };
    if (!this.isDynamicAdding) {
      this.applyFilter();
      this.applySort();
    }

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
  deleteFromTarget(button) {
    button.parentNode.remove();
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
    ui.achievementsBlock[0].container
      .querySelectorAll(".achiv-block")
      .forEach((achievement) => {
        if (true) {
          achievement.querySelector(".add-to-target").click();
        }
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
  }

  addEvents() {
    this.header.addEventListener("mousedown", (e) => {
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
          apiWorker
            .getProfileInfo({ targetUser: userName })
            .then((resp) => {
              config.gameID = resp.LastGameID;
            })
            .then(() => getAchievements({}));
          // ui.statusPanel.watchButton.click();
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
  get SORT_METHOD() {
    return sortBy[this.SORT_NAME];
  }
  get SORT_NAME() {
    return config._cfg.ui?.games_section?.sort_name ?? UI.sortMethods.title;
  }
  set SORT_NAME(value) {
    config._cfg.ui.games_section.sort_name = value;
    config.writeConfiguration();
    this.applySort()
  }
  set REVERSE_SORT(value) {
    config._cfg.ui.games_section.reverse_sort = value ? 1 : -1;
    config.writeConfiguration();
    this.applySort()
  }
  get REVERSE_SORT() {
    return config._cfg.ui?.games_section?.reverse_sort ?? 1;
  }

  get GAMES_GROUP() {
    return config._cfg.ui?.games_section?.games_group ?? "all";
  }
  set GAMES_GROUP(value) {
    config._cfg.ui.games_section.games_group = value;
    config.writeConfiguration();
    this.changeGamesGroup(this.GAMES_GROUP);
  }
  async changeGamesGroup(group) {
    switch (group) {
      case 'recent':
        this.GAMES.all = await this.getRecentGamesArray({});
        this.clearList();
        this.fillFullList();
        this.applySort();
        break;
      default:
        this.clearList();
        await this.loadGamesArray()
    }
  }
  applySort() {
    this.GAMES.all = [...this.GAMES.all].sort((a, b) => this.SORT_METHOD(a, b) * this.REVERSE_SORT);
    this.clearList();
    this.fillFullList();
  }
  applyFilter() {
    const checkBoxes = this.platformFiltersList.querySelectorAll("[type='checkbox']");
    this.GAMES.all = [];
    checkBoxes.forEach(checkbox => {

      if (checkbox.dataset.platformId && checkbox.checked) {
        this.GAMES.all = this.GAMES.all.concat(this.GAMES[checkbox.dataset.platformId]);
      }
      const searchbarValue = this.searchbar.value;
      this.searchbar.classList.toggle("empty", searchbarValue)

      if (searchbarValue) {

        let regex = new RegExp(searchbarValue, "i");

        this.GAMES.all = [...this.GAMES.all.filter(game => regex.test(game.Title))];

        // clearList();

        // fillFullList();
      }

    })
    this.applySort()
  }
  fillFullList = () => {
    while (this.isEndOfListVisible({ list: this.gamesList }) && this.GAMES["all"]?.length > Number(this.gamesList.dataset.currentGamesArrayPosition)) {
      this.fillGamesDown({ list: this.gamesList, platformID: "all" }); // Після отримання даних заповнюємо список ігор
    }
  }
  clearList = () => {
    this.gamesList.innerHTML = "";
    this.gamesList.dataset.currentGamesArrayPosition = 0;
  }
  platformCodes = {
    "0": "Recently Played",
    "all": "All games",
    "1": "Genesis/Mega Drive",
    "2": "Nintendo 64",
    "3": "SNES/Super Famicom",
    "4": "Game Boy",
    "5": "Game Boy Advance",
    "6": "Game Boy Color",
    "7": "NES/Famicom",
    "8": "PC Engine/TurboGrafx-16",
    "12": "PlayStation",
    "21": "PlayStation 2",
    "41": "PlayStation Portable",
  }
  gameFilters = {
    "1": "Genesis/Mega Drive",
    "2": "Nintendo 64",
    "3": "SNES/Super Famicom",
    "4": "Game Boy",
    "5": "Game Boy Advance",
    "6": "Game Boy Color",
    "7": "NES/Famicom",
    "8": "PC Engine/TurboGrafx-16",
    "12": "PlayStation",
    "21": "PlayStation 2",
    "41": "PlayStation Portable",
  }
  plaformsInfo = {};
  GAMES = {};
  BATCH_SIZE = 10;
  MAX_GAMES_IN_LIST = 50;
  constructor() {
    this.loadPlatformInfo();
    this.initializeElements();
    this.addEvents();

    this.loadGamesArray().then(() => {
      this.fillGamesDown({ list: this.section.querySelector(".platform-list"), platformID: "all" })
      this.generateFiltersList();
      this.setValues();
      // this.generateGamesLists();
    })

  }
  initializeElements() {
    this.section = document.querySelector("#games_section");
    this.header = this.section.querySelector(".header-container");
    this.container = this.section.querySelector(".games_container");
    // this.platformsContainer = this.section.querySelector(".platforms-list_container");
    this.searchbar = this.section.querySelector("#games_search-input");
    this.platformFiltersList = this.section.querySelector("#games_filter-platform-list");
    this.gamesList = this.section.querySelector("#games-list");
    // this.platformList = this.section.querySelector(".platform-list");
    this.resizer = this.section.querySelector(".resizer");
  }
  addEvents() {
    this.resizer.addEventListener("mousedown", (event) => {
      event.stopPropagation();
      this.section.classList.add("resized");
      UI.resizeEvent({
        event: event,
        section: this.section,
        postFunc: () => "",
      });
    });
    // Додавання подій для пересування вікна target
    this.header.addEventListener("mousedown", (e) => {
      UI.moveEvent(this.section, e);
    });
    this.searchbar.addEventListener("input", () => this.searchInputHandler());
    this.gamesList.addEventListener("scroll", () => this.gamesListScrollHandler())

  }
  setValues() {
    switch (this.SORT_NAME) {
      case UI.sortMethods.achievementsCount:
        this.section.querySelector("#games_sort-achieves").checked = true;
        break;
      case UI.sortMethods.points:
        this.section.querySelector("#games_sort-points").checked = true;
        break;
      default:
        this.section.querySelector("#games_sort-title").checked = true;
        break;
    }
  }
  async loadPlatformInfo() {
    try {
      const responce = await fetch(`./json/games/consoles.json`);
      const platformsData = await responce.json();
      this.plaformsInfo = platformsData;
    } catch (error) {
      console.error("Error fetching games:", error);
    }
  }
  isEndOfListVisible({ list }) {
    const lastItem = list.lastElementChild;
    // Перевіряємо, чи останній елемент списку є видимим у зоні прокрутки

    return !lastItem || lastItem?.getBoundingClientRect().bottom <= window.innerHeight + 200;
  }
  isFirstOfListVisible({ list }) {
    const firstItem = list.children[0];

    // Перевіряємо, чи останній елемент списку є видимим у зоні прокрутки
    return firstItem?.getBoundingClientRect().bottom > -200;
  }
  async fillGamesDown({ list, platformID }) {
    !list.dataset.currentGamesArrayPosition ? list.dataset.currentGamesArrayPosition = 0 : "";

    let startIndex = Number(list.dataset.currentGamesArrayPosition) ?? 0;
    let lastIndex = startIndex + this.BATCH_SIZE >= this.GAMES[platformID].length ?
      this.GAMES[platformID].length :
      startIndex + this.BATCH_SIZE;
    list.dataset.currentGamesArrayPosition = lastIndex;
    // Використовуємо збережені дані у властивості games для заповнення списку
    for (let i = startIndex; i < lastIndex; i++) {
      const gameElement = this.generateGameElement(this.GAMES[platformID][i]);
      list.appendChild(gameElement);
    }
  }
  async fillGamesTop({ list, platformID }) {
    !list.dataset.currentGamesArrayPosition ? list.dataset.currentGamesArrayPosition = 0 : "";

    let startIndex = list.dataset.currentGamesArrayPosition - list.children.length - 1;
    // Використовуємо збережені дані у властивості games для заповнення списку
    for (let i = startIndex; i > startIndex - this.BATCH_SIZE && i >= 0; i--) {
      const gameElement = this.generateGameElement(this.GAMES[platformID][i]);
      list.prepend(gameElement);
    }
  }
  clearGamesTop({ list }) {
    if (list.children.length > this.MAX_GAMES_IN_LIST) {
      for (let i = 0; i < this.BATCH_SIZE; i++) {

        list.firstChild.remove();
      }
    }
  }
  clearGamesDown({ list }) {
    let lastIndex = list.dataset.currentGamesArrayPosition - this.BATCH_SIZE;
    lastIndex = lastIndex < 0 ? 0 : lastIndex;
    if (list.children.length > this.MAX_GAMES_IN_LIST) {
      for (let i = list.dataset.currentGamesArrayPosition; i > lastIndex; i--) {
        list.lastChild.remove();
      }
      list.dataset.currentGamesArrayPosition = lastIndex;
    }
  }


  async getRecentGamesArray() {
    const resp = await apiWorker.getRecentlyPlayedGames({});
    return resp;
    // this.GAMES["0"] = resp;
  }

  async loadGamesArray() {
    for (const platformCode of Object.getOwnPropertyNames(this.platformCodes)) {
      await this.getAllGames({ consoleCode: platformCode });
    }
    this.GAMES["all"] = this.GAMES.saved = Object.values(this.GAMES).flat();
    this.applySort();
  }
  async getAllGames({ consoleCode }) {
    try {
      if (!(consoleCode == 0 || consoleCode == "all")) {
        const gamesResponse = await fetch(`./json/games/${consoleCode}.json`);
        const gamesJson = await gamesResponse.json();
        this.GAMES[consoleCode] = gamesJson; // Зберігаємо отримані дані у властивості games
      }

    } catch (error) {
      console.error("Error fetching games:", error);
    }
  }
  async showMoreDescription(element) {
    let gameListItem = element.closest(".platform_game-item");
    if (gameListItem.classList.contains("expanded")) {
      const gameMoreInfoElement = gameListItem.querySelector(".game-more_block");
      gameMoreInfoElement.remove();
    }
    else {
      const gameID = gameListItem.dataset.gameID;
      const gameMoreInfoElement = document.createElement("div");
      gameMoreInfoElement.classList.add("game-more_block");
      const resp = await apiWorker.getGameInfo({ gameID: gameID });
      gameMoreInfoElement.innerHTML = `
      <img src="https://media.retroachievements.org/${resp.ImageTitle}" alt="" class="game-description_ingame-preview">
      <img src="https://media.retroachievements.org/${resp.ImageIngame}" alt="" class="game-description_ingame-preview">
    `;
      gameListItem.appendChild(gameMoreInfoElement);
    }
    gameListItem.classList.toggle("expanded");

    // {
    //   "Title": "1942",
    //   "GameTitle": "1942",
    //   "ConsoleID": 7,
    //   "ConsoleName": "NES/Famicom",
    //   "Console": "NES/Famicom",
    //   "ForumTopicID": 323,
    //   "Flags": 0,
    //   "GameIcon": "/Images/043934.png",
    //   "ImageIcon": "/Images/043934.png",
    //   "ImageTitle": "/Images/000549.png",
    //   "ImageIngame": "/Images/000550.png",
    //   "ImageBoxArt": "/Images/011488.png",
    //   "Publisher": "Capcom",
    //   "Developer": "Capcom, Micronics",
    //   "Genre": "Shoot 'em Up",
    //   "Released": "December 11, 1985"
    // }


  }


  generateFiltersList() {
    Object.getOwnPropertyNames(this.gameFilters).forEach(platformCode => {
      const filterItem = document.createElement("li");
      filterItem.classList.add("game-filters_item");
      filterItem.innerHTML =
        `
        <input checked onchange='ui.games.applyFilter()' type="checkbox" data-platform-id="${platformCode}"  name="game-filters_item" id="game-filters_${platformCode}" ></input>
        <label class="game-filters_checkbox" for="game-filters_${platformCode}">${this.platformCodes[platformCode]}</label>
      `;
      this.platformFiltersList.appendChild(filterItem);
    })
  }
  generateGameElement(game) {
    let { Title, ID, GameID, ConsoleName, ImageIcon, Points, PossibleScore, ForumTopicID, NumAchievements, AchievementsTotal, NumLeaderboards } = game;
    const imgName = game.ImageIcon.slice(ImageIcon.lastIndexOf("/") + 1, ImageIcon.lastIndexOf(".") + 1) + "webp";
    const gameElement = document.createElement("li");

    gameElement.dataset.gameID = ID;
    gameElement.classList.add("platform_game-item");
    gameElement.innerHTML = `   
      <div class="game-preview_container">
          <img src="./assets/imgCache/${imgName}"  onerror="this.src='https://media.retroachievements.org${ImageIcon}';" alt="" class="game-preview_image">
      </div>
      <h3 class="game-description_title"><button title="open game" class="game-description_button" onclick="config.gameID = ${ID}; getAchievements()">${Title}</button></h3>
      <div class="game-description_container">
        <div class="game-description_block">
            <p title="achievements count"  class="game-description  achievements-count">
                <i class="game-description_icon achievements-icon"></i>${NumAchievements}</p>
            <p title="points count" class="game-description  points-count">
              <i class="game-description_icon points-icon"></i>
            ${Points}</p>
            <p title="leaderboards count" class="game-description  leaderboards-count">
              <i class="game-description_icon leaderboards-icon"></i>${NumLeaderboards}</p>            
        </div>
        <div class="game-description_block">
          <button class="game-description_button  expand-button" onclick="ui.games.showMoreDescription(this)">
            <i class="game-description_icon link_icon expand_icon"></i>
          </button>
        </div>
        <div class="game-description_block">
          <a title="go to RA" target="_blanc" href="https://retroachievements.org/game/${ID}"
                class="game-description game-description_link" >
                <i class="game-description_icon link_icon ra-link_icon"></i>
          </a>
          <a title=" go to RA forum" target="_blanc" href="https://retroachievements.org/viewtopic.php?t=${ForumTopicID}"
                class="game-description game-description_link   " ">
        <i class="game-description_icon link_icon forum-icon"></i>
          </a>
          <a title=" search for downloading" target="_blanc" href="https://romhustler.org/roms/search?query=${Title}"
                class="game-description game-description_link  " ">                
          <i class="game-description_icon link_icon download-icon"></i></a>
        </div>
          
      </div>
    `
    return gameElement;
  }
  gamesListScrollHandler() {
    if (this.isEndOfListVisible({ list: this.gamesList })) {
      this.fillGamesDown({ list: this.gamesList, platformID: "all" });
      this.clearGamesTop({ list: this.gamesList });
    }
    if (this.isFirstOfListVisible({ list: this.gamesList })) {
      this.fillGamesTop({ list: this.gamesList, platformID: "all" });
      this.clearGamesDown({ list: this.gamesList });
    }
  }
  searchInputHandler() {
    const clearList = () => {
      this.gamesList.innerHTML = "";
      this.gamesList.dataset.currentGamesArrayPosition = 0;
    }
    const recoverGamesData = () => {
      this.GAMES.all = this.GAMES.saved;
      this.applyFilter();

    }
    const fillFullList = () => {
      while (this.isEndOfListVisible({ list: this.gamesList }) && this.GAMES["all"]?.length > Number(this.gamesList.dataset.currentGamesArrayPosition)) {
        this.fillGamesDown({ list: this.gamesList, platformID: "all" }); // Після отримання даних заповнюємо список ігор
      }
    }
    recoverGamesData();
    const searchbarValue = this.searchbar.value;

    this.searchbar.classList.toggle("empty", searchbarValue == "")

    let regex = new RegExp(searchbarValue, "i");

    let searchGames = this.GAMES.all.filter(game => regex.test(game.Title));

    this.GAMES.all = searchGames;

    clearList();

    fillFullList();
  }
  clearSearchbar() {
    this.searchbar.value = "";
    this.searchInputHandler();
  }
}
class Progression {
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
        postFunc: () => "",
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
      .filter(achiv => filterBy.progression(achiv))
      .sort((a, b) => -1 * sortBy.id(a, b))
      .sort((a, b) => -1 * sortBy.default(a, b))
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
  generateCard({ Title, ID, prevSrc, Points, TrueRatio, NumAwardedHardcore, totalPlayers, type, Description, DisplayOrder }) {
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
//* Методи сортування для досягнень гри
const sortBy = {
  latest: (a, b) => {
    // Перевіряємо, чи існують дати та обираємо найновішу
    const dateA = a.DateEarnedHardcore
      ? new Date(a.DateEarnedHardcore)
      : -Infinity;
    const dateB = b.DateEarnedHardcore
      ? new Date(b.DateEarnedHardcore)
      : -Infinity;
    return dateB - dateA; // Повертає різницю дат
  },

  earnedCount: (a, b) => b.NumAwardedHardcore - a.NumAwardedHardcore,

  points: (a, b) => a.Points - b.Points,

  truepoints: (a, b) => a.TrueRatio - b.TrueRatio,

  default: (a, b) => a.DisplayOrder - b.DisplayOrder,

  id: (a, b) => a.ID - b.ID,

  disable: (a, b) => 0,

  achievementsCount: (a, b) => a.NumAchievements - b.NumAchievements,

  title: (b, a) => {
    var nameA = a.Title.toUpperCase();
    var nameB = b.Title.toUpperCase();
    if (nameA < nameB) {
      return -1;
    }
    if (nameA > nameB) {
      return 1;
    }
    return 0;
  },
};

//* Методи фільтрування для досягнень гри
const filterBy = {
  earned: (achievement) => achievement.DateEarnedHardcore,
  notEarned: (achievement) => !achievement.DateEarnedHardcore,
  missable: (achievement) => achievement.type === "missable",
  progression: (achievement) => achievement.type === "progression" || achievement.type === "win_condition",
  all: () => true,
};

const fixTimeString = (
  (dateString) => {
    const date = new Date(dateString);
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
)
