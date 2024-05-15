class UI {
  VERSION = "0.20";
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
    this.achievementsBlock.forEach((widgetClone) =>
      widgetClone.parseGameAchievements(this.GAME_DATA)
    );
    // this.updateGameInfo(this.GAME_DATA);
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
              UI.switchSectionVisibility({
                section: document
                  .querySelector("#help_section")
              })
              config.version = this.VERSION;
            }, 1500);
          }
          config.startOnLoad
            ? this.statusPanel.watchButton.click()
            : this.settings.checkIdButton.click();
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
    this.games = new Games();
    this.progression = new Progression();
    this.userInfo = new UserInfo();
    this.note = new Note();
    this.notifications = new Notification();

    //*  Must be last initialized to set correct values
    this.buttons = new ButtonPanel();


  }
  //Встановлення розмірів і розміщення елементів
  setPositions() {
    // Проходження по кожному ідентифікатору контейнера в об'єкті config.uierw
    [...document.querySelectorAll(".section")].forEach(section => {
      const id = section.id;
      if (config.ui[id]) {
        if (!section) return;
        // Отримання позиції та розмірів елемента з об'єкта config.ui
        const { x, y, width, height, hidden } = config.ui[id];
        // Встановлення нових значень стилів елемента, якщо вони вказані у config.ui
        // Якщо значення відсутнє (undefined), то стилі не змінюються
        x ? (section.style.left = x) : "";
        y ? (section.style.top = y) : "";
        width ? (section.style.width = width) : "";
        height ? (section.style.height = height) : "";
        const isHidden = hidden ?? true;
        if (isHidden) {
          section.classList.add("hidden", "disposed");
        }

      }
      else {
        section.classList.add("hidden", "disposed");
      }
    })

    this.buttons.games.checked = !this.games.section.classList.contains("hidden");
    document.querySelector("#background-animation").style.display =
      config.bgVisibility ? "display" : "none";
  }
  addEvents() {
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
  updateWidgets({ earnedAchievementsIDs }) {
    //Update Achievements widgets
    this.achievementsBlock.forEach(template =>
      UI.updateAchievementsSection({ earnedAchievementIDs: earnedAchievementsIDs, widget: template }));

    //Update Target widget
    UI.updateAchievementsSection({ earnedAchievementIDs: earnedAchievementsIDs, widget: this.target });
    this.target.delayedRemove();

    //Update Awards widget
    this.awards.VISIBLE ? this.awards.updateAwards() : "";

    //Update Progression widget
    this.progression.updateEarnedCards({ gameIDArray: earnedAchievementsIDs });

    //Update status widget
    this.statusPanel.updateProgress({ earnedAchievementIDs: earnedAchievementsIDs });

    //Update UserInfo widget
    // setTimeout(() => ui.userInfo.update(), 2000);

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
    const achievementsIDs = earnedAchievements?.map((achievement) => achievement.AchievementID);
    this.checkForAwards(achievementsIDs);
    return achievementsIDs;
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
    this.userInfo.pushAchievements({ achievements: earnedAchievements });
    this.notifications.pushNotification({ type: this.notifications.types.earnedAchivs, elements: earnedAchievements });
  }
  //TODO-------------------------------------
  checkForAwards(achievementsIDs) {
    // achievementsIDs.forEach
  }
  updateGameInfo({ Title, ConsoleName, ImageIcon, }) {
    const { gamePreview, gameTitle, gamePlatform } = this.statusPanel;
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
    this.statusPanel.updateData();
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

      if (widget.SORT_NAME === sortMethods.latest) {
        widget.moveToTop(achieveElement);
      }
    });
    widget?.applyFilter();
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
      ui.wrapper.removeEventListener("mousemove", handleMouseMove);
      ui.wrapper.removeEventListener("mouseup", handleMouseUp);
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
    ui.wrapper.addEventListener("mousemove", handleMouseMove);
    ui.wrapper.addEventListener("mouseup", handleMouseUp);
    // section.addEventListener("mouseleave", handleMouseUp);
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
    // container.addEventListener("mousedown", e => e.stopPropagation())
    const dragAndDropItems = container;
    var list = document.getElementById("myList");
    new Sortable(dragAndDropItems, {
      animation: 100,
      chosenClass: "dragged",
    });
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
  get VISIBLE() {
    return !this.section.classList.contains("hidden");
  }
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
            checked: this.SORT_NAME === sortMethods.latest,
            event: `onchange="ui.achievementsBlock[${this.CLONE_NUMBER}].SORT_NAME = sortMethods.latest;"`,
          },
          {
            type: "radio",
            name: "context-sort",
            id: "context-sort_rarest",
            label: "Rarest",
            checked: this.SORT_NAME === sortMethods.earnedCount,
            event: `onchange="ui.achievementsBlock[${this.CLONE_NUMBER}].SORT_NAME = sortMethods.earnedCount;"`,
          },
          {
            type: "radio",
            name: "context-sort",
            id: "context-sort_points",
            label: "Points",
            checked: this.SORT_NAME === sortMethods.points,
            event: `onchange="ui.achievementsBlock[${this.CLONE_NUMBER}].SORT_NAME = sortMethods.points;"`,
          },
          {
            type: "radio",
            name: "context-sort",
            id: "context-sort_retropoints",
            label: "Retropoints",
            checked: this.SORT_NAME === sortMethods.truepoints,
            event: `onchange="ui.achievementsBlock[${this.CLONE_NUMBER}].SORT_NAME = sortMethods.truepoints;"`,
          },
          {
            type: "radio",
            name: "context-sort",
            id: "context-sort_default",
            label: "Default",
            checked: this.SORT_NAME === sortMethods.default,
            event: `onchange="ui.achievementsBlock[${this.CLONE_NUMBER}].SORT_NAME = sortMethods.default;"`,
          },
          {
            type: "radio",
            name: "context-sort",
            id: "context-sort_disable",
            label: "Disable",
            checked: this.SORT_NAME === sortMethods.disable,
            event: `onchange="ui.achievementsBlock[${this.CLONE_NUMBER}].SORT_NAME = sortMethods.disable;"`,
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
            checked: this.FILTER_NAME === filterMethods.progression,
            event: `onchange="ui.achievementsBlock[${this.CLONE_NUMBER}].FILTER_NAME = filterMethods.progression;"`,
          },
          {
            type: "radio",
            name: "context-filter",
            id: "context_filter-missable",
            label: "Missable",
            checked: this.FILTER_NAME === filterMethods.missable,
            event: `onchange="ui.achievementsBlock[${this.CLONE_NUMBER}].FILTER_NAME = filterMethods.missable;"`,
          },
          {
            type: "radio",
            name: "context-filter",
            id: "context_filter-earned",
            label: "Earned",
            checked: this.FILTER_NAME === filterMethods.earned,
            event: `onchange="ui.achievementsBlock[${this.CLONE_NUMBER}].FILTER_NAME = filterMethods.earned;"`,
          },
          {
            type: "radio",
            name: "context-filter",
            id: "context_filter-all",
            label: "All",
            checked: this.FILTER_NAME === filterMethods.all,
            event: `onchange="ui.achievementsBlock[${this.CLONE_NUMBER}].FILTER_NAME = filterMethods.all;"`,
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
      sortMethods.default
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
    return config?.ui[this.SECTION_NAME]?.filterBy || filterMethods.all;
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
    UI.addDraggingEventForElements(this.container);
  }
  setValues() {
    // if (!config.ui.achievements_section) {
    //   UI.switchSectionVisibility(this);
    // }
    this.section.classList.toggle("bg-visible", this.BG_VISIBILITY);
    this.section.classList.toggle("compact", !this.SHOW_HEADER);
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


    // Відсортувати досягнення та відобразити їх
    this.displayAchievements(achivs);

    // Підгонка розміру досягнень
    this.fitSizeVertically();

    this.applyFilter();
    this.applySorting();
    this.startAutoScroll();
    //Додаєм можливість перетягування елементів

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
  autoscrollInterval;
  startAutoScroll(toBottom = true) {
    clearInterval(this.autoscrollInterval);
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
    this.about = this.section.querySelector("#open-about-button");
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
    this.note.addEventListener("change", (e) => {
      UI.switchSectionVisibility(ui.note);
    });
    this.user.addEventListener("change", (e) => {
      UI.switchSectionVisibility(ui.userInfo);
    });
    this.notifications.addEventListener("change", (e) => {
      UI.switchSectionVisibility(ui.notifications);
    });
  }

  setValues() {
    // Встановлення початкових індикаторів віджетів
    this.achievements.checked =
      config.ui?.achievements_section?.hidden === false ?? ui.achievementsBlock[0].VISIBLE;

    this.settings.checked = config.ui?.settings_section?.hidden === false ?? ui.settings.VISIBLE;

    this.login.checked = config.ui?.login_section?.hidden === false ?? ui.loginCard.VISIBLE;

    this.target.checked = config.ui?.target_section?.hidden === false ?? ui.target.VISIBLE;

    this.gameCard.checked = config.ui?.game_section?.hidden === false ?? ui.gameCard.VISIBLE;

    this.status.checked = config.ui?.["update-section"]?.hidden === false ?? ui.statusPanel.VISIBLE;

    this.awards.checked = config.ui?.awards_section?.hidden === false ?? ui.awards.VISIBLE;

    this.note.checked = config.ui?.note_section?.hidden === false ?? ui.note.VISIBLE;

    this.progression.checked = config.ui?.progression_section?.hidden === false ?? ui.progression.VISIBLE;
    this.user.checked = config.ui?.user_section?.hidden === false ?? ui.user.VISIBLE;
    this.notifications.checked = config.ui?.notification_section?.hidden === false ?? ui.notifications.VISIBLE;

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
  get AUTOSCROLL_RICHPRESENCE() {
    return true;
  }
  get VISIBLE() {
    return !this.section.classList.contains("hidden");
  }
  ANIMATION_DELAY_IN_SECONDS = 30;

  stats = {
    gameTitle: ui?.GAME_DATA?.Title ?? "Title",
    gamePlatform: ui?.GAME_DATA?.ConsoleName ?? "Platform",
    richPresence: "Waiting...",
    imageSrc: `https://media.retroachievements.org${ui?.GAME_DATA?.ImageIcon}`,
    totalPoints: ui?.GAME_DATA?.points_total ?? 0,
    totalAchievesCount: ui?.GAME_DATA?.achievements_published ?? 0,
    earnedPoints: 0,
    earnedAchievesCount: 0,
    totalRetropoints: ui?.GAME_DATA?.TotalRetropoints,
    earnedRetropoints: 0,
  }
  gameTime = 0;
  gameTimeInterval;
  get statusTextValues() {
    const statusObj = {
      progressionInPoints: `${this.stats.earnedPoints}/${this.stats.totalPoints} HP`,
      gameTime: `${this.formatTime(this.gameTime)}`,
      progressionInCount: `${this.stats.earnedAchievesCount}/${this.stats.totalAchievesCount} CHEEVOS`,
      progressionInRetroPoints: `${this.stats.earnedRetropoints}/${this.stats.totalRetropoints} RP`,
    }
    if (this.stats.earnedSoftpoints > 0 && this.stats.totalSoftPoints > 0) {
      statusObj.progressionInSoftpoints = `${this.stats.earnedSoftpoints}/${this.stats.totalSoftPoints} SP`
    }
    return statusObj;
  }
  constructor() {
    !config.ui.update_section && (config.ui.update_section = {});
    !config.ui.update_section.playTime && (config.ui.update_section.playTime = {});

    this.initializeElements();
    this.addEvents();
    this.startAutoScrollRP();
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
    this.progresBarDelta = this.section.querySelector("#status_progress-bar-delta");
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
      const savePlayTime = () => {
        config.ui.update_section.playTime[config.gameID] = this.gameTime;
        config.writeConfiguration();
      }
      // Перевіряємо стан кнопки та відповідно запускаємо або припиняємо автооновлення
      if (this.watchButton.classList.contains("active")) {
        stopWatching();
        savePlayTime();
        clearInterval(this.gameTimeInterval);
      }
      else {
        startWatching();
        this.gameTimeInterval = setInterval(() => {
          this.gameTime++;
          this.gameTime % 60 == 0 && (savePlayTime());
          const time = this.formatTime(this.gameTime);
          this.section.querySelector(`.gameTime`) && (this.section.querySelector(`.gameTime`).innerText = time);
        }, 1000)
      }

    });
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
  setValues() {
    //* Обчислення прогресу за балами та за кількістю досягнень
    const completionByPoints = this.stats.earnedPoints / ui.GAME_DATA.points_total || 0;
    const completionByPointsPercents = ~~(completionByPoints * 100) + "%";
    //*Потрібно перевести ширину у відсотки від ширини прогресу по поінтах
    const width = this.section.clientWidth || 0;
    const completionByPointsInPixels = completionByPoints * width;
    const completionByCount =
      (width * this.stats.earnedAchievesCount) / (ui?.GAME_DATA?.achievements_published * completionByPointsInPixels) || 0;
    const completionByCountPercents =
      ~~((100 * this.stats.earnedAchievesCount) / ui?.GAME_DATA?.achievements_published) + "%";

    //* Встановлення стилів прогресу
    this.section.style.setProperty(
      "--progress-points",
      completionByPoints * 100 + "%"
    );
    this.progressStatusText.innerText = "";
    this.startStatsAnimation();
    ui.gameCard.updateGameInfoElement({
      name: "Completion",
      value: `${completionByPointsPercents} of points [${completionByCountPercents}]`,
    });
    ui.gameCard.section.classList.toggle("mastered", this.stats.earnedPoints != 0 && this.stats.totalPoints === this.stats.earnedPoints);

  }
  updateData() {
    this.stats = {
      gameTitle: ui?.GAME_DATA?.Title ?? "Title",
      gamePlatform: ui?.GAME_DATA?.ConsoleName ?? "Platform",
      richPresence: "Waiting...",
      imageSrc: `https://media.retroachievements.org${ui?.GAME_DATA?.ImageIcon}`,
      totalPoints: ui?.GAME_DATA?.points_total ?? 0,
      totalSoftPoints: 0,
      totalAchievesCount: ui?.GAME_DATA?.achievements_published ?? 0,
      earnedPoints: 0,
      earnedAchievesCount: 0,
      totalRetropoints: ui?.GAME_DATA?.TotalRetropoints,
      earnedRetropoints: 0,
      earnedSoftpoints: 0,

    }
    //* Підрахунок кількості досягнень та набраних балів
    Object.values(ui.ACHIEVEMENTS).forEach((achievement) => {
      if (achievement.DateEarnedHardcore) {
        this.stats.earnedPoints += achievement.Points; // Додавання балів
        this.stats.earnedAchievesCount++;
        this.stats.earnedRetropoints += achievement.TrueRatio;
      }
      else if (achievement.DateEarned) {
        this.stats.earnedSoftpoints += achievement.Points;
      }
    });
    this.stats.totalSoftPoints = this.stats.totalPoints - this.stats.earnedPoints;

    this.setValues();
  }
  gameChangeEvent() {
    const { ImageIcon, Title, ConsoleName } = ui.GAME_DATA;
    const { gamePreview, gameTitle, gamePlatform } = this;
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
    this.updateData();
    this.gameTime = config.ui.update_section.playTime[config.gameID] ? config.ui.update_section.playTime[config.gameID] : 0;
  }
  updateProgress({ earnedAchievementIDs }) {
    this.updateData();
    this.startAnimation();

    //push points toggle animation
    this.progresBarDelta.classList.remove("hidden");
    setTimeout(() => this.progresBarDelta.classList.add("hidden"), 50)
  }

  startAnimation() {
    const glassElement = this.section.querySelector(".status_glass-effect");
    glassElement.classList.remove("update");
    setTimeout(() => glassElement.classList.add("update"), 20);
  }

  currentStatusTextIndex = 0;
  statsAnimationInterval;
  startStatsAnimation() {
    this.stopStatsAnimation();


    this.progressStatusText.innerText = Object.values(this.statusTextValues)[this.currentStatusTextIndex++];
    this.progressStatusText.className = `progress_points-percent progress-percent`;
    this.statsAnimationInterval = setInterval(() => {

      this.progressStatusText.classList.add("hide");

      setTimeout(() => {
        const statsTextName = Object.getOwnPropertyNames(this.statusTextValues)[this.currentStatusTextIndex];
        const statsTextValue = this.statusTextValues[statsTextName];
        this.progressStatusText.innerText = statsTextValue;

        this.progressStatusText.className = `progress_points-percent progress-percent ${statsTextName}`;
        statsTextName != "gameTime" && (this.section.style.setProperty(
          "--progress-points",
          this.convertToPercentage(statsTextValue) || "0%"
        ));
        this.currentStatusTextIndex =
          this.currentStatusTextIndex < Object.values(this.statusTextValues).length - 1 ?
            this.currentStatusTextIndex + 1 : 0;
      }, 200)
    }, this.ANIMATION_DELAY_IN_SECONDS * 1000);
  }
  stopStatsAnimation() {
    clearInterval(this.statsAnimationInterval);
    this.currentStatusTextIndex = 0;
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
  convertToPercentage(inputString) {
    // Розбиваємо рядок за допомогою розділювача '/'
    const parts = inputString.split('/');

    // Перетворюємо перші дві частини у числа та рахуємо відсотки
    const result = (parseInt(parts[0], 10) / parseInt(parts[1], 10)) * 100;

    // Повертаємо результат у вигляді рядка з відсотками
    return result.toFixed(2) + '%';
  }
  formatTime(seconds) {
    let hours = Math.floor(seconds / 3600);
    let minutes = Math.floor((seconds % 3600) / 60);
    let remainingSeconds = seconds % 60;

    // Додавання ведучих нулів, якщо необхідно
    hours = (hours < 10) ? "0" + hours : hours;
    minutes = (minutes < 10) ? "0" + minutes : minutes;
    remainingSeconds = (remainingSeconds < 10) ? "0" + remainingSeconds : remainingSeconds;

    return `${hours != "00" ? hours + ":" : ""}${minutes}:${remainingSeconds}`;
  }
}
class Settings {
  get VISIBLE() {
    return !this.section.classList.contains("hidden");
  }
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
      // {
      //   label: "Font",
      //   subMenu: [{
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
    this.fontUrlInput = this.section.querySelector("#settings_font-input");
    this.fontSelector = this.section.querySelector("#font-preset-selection");
    this.fontSizeInput = this.section.querySelector("#settings_font-size");

    this.targetUserInput = document.querySelector("#target-user");
    this.gameID = document.querySelector("#game-id"); // Поле введення ідентифікатора гри
    this.getGameIdButton = document.querySelector(".get-id-button"); // Кнопка отримання ідентифікатора гри
    this.checkIdButton = document.querySelector(".check-id-button"); // Кнопка перевірки ідентифікатора гри
    this.startOnLoadCheckbox = document.querySelector("#update-on-load");

  }
  setValues() {

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
    this.fontSelector.value = config._cfg?.fontSelectorName ?? "default";
    this.fontUrlInput.value = this.FONT_NAME;
    this.fontSizeInput.value = this.FONT_SIZE;
    this.showBackgroundCheckbox.checked = config.bgVisibility;
    this.startOnLoadCheckbox.checked = config.startOnLoad;
    this.FONT_SIZE = this.FONT_SIZE;
    this.FONT_FAMILY = this.fonts[config._cfg?.fontSelectorName ?? "default"];
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

    this.fontSelector.addEventListener("change", e => {
      const font = this.fontSelector.value;
      this.fontColorInput.value = "this.FONT_NAME";
      this.FONT_FAMILY = this.fonts[font];
      config._cfg.fontSelectorName = font;
      config.writeConfiguration();
      this.fontUrlInput.value = this.FONT_NAME;
    })
    this.fontSizeInput.addEventListener("change", e => {
      this.FONT_SIZE = this.fontSizeInput.value;
    })
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
        postFunc: () => "",
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
    sufixes,
  }) {
    this.header.innerHTML = `${FixedTitle} ${this.SHOW_BADGES ? this.generateSufixes(sufixes) : ""} `;
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
  generateSufixes(sufixes) {
    return sufixes?.reduce((acc, sufix) => acc += `<i class="game-card_suffix game-title_${sufix.toLowerCase()}">${sufix}</i>`, "")
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
        postFunc: () => "",
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
  get VISIBLE() {
    return !this.section.classList.contains("hidden");
  }
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
            checked: this.SORT_NAME === sortMethods.latest,
            event: `onchange="ui.target.SORT_NAME = sortMethods.latest;"`,
          },
          {
            type: "radio",
            name: "context-sort",
            id: "context-sort_rarest",
            label: "Rarest",
            checked: this.SORT_NAME === sortMethods.earnedCount,
            event: `onchange="ui.target.SORT_NAME = sortMethods.earnedCount;"`,
          },
          {
            type: "radio",
            name: "context-sort",
            id: "context-sort_points",
            label: "Points",
            checked: this.SORT_NAME === sortMethods.points,
            event: `onchange="ui.target.SORT_NAME = sortMethods.points;"`,
          },
          {
            type: "radio",
            name: "context-sort",
            id: "context-sort_retropoints",
            label: "Retropoints",
            checked: this.SORT_NAME === sortMethods.truepoints,
            event: `onchange="ui.target.SORT_NAME = sortMethods.truepoints;"`,
          },
          {
            type: "radio",
            name: "context-sort",
            id: "context-sort_default",
            label: "Default",
            checked: this.SORT_NAME === sortMethods.default,
            event: `onchange="ui.target.SORT_NAME = sortMethods.default;"`,
          },
          // {
          //   type: "radio",
          //   name: "context-sort",
          //   id: "context-sort_id",
          //   label: "ID",
          //   checked: this.SORT_NAME === sortMethods.id,
          //   event: `onchange="ui.target.SORT_NAME = sortMethods.id;"`

          // },
          {
            type: "radio",
            name: "context-sort",
            id: "context-sort_dont-sort",
            label: "Disable",
            checked: this.SORT_NAME === sortMethods.disable,
            event: `onchange="ui.target.SORT_NAME = sortMethods.disable;"`,
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
            checked: this.FILTER_NAME === filterMethods.progression,
            event: `onchange="ui.target.FILTER_NAME = filterMethods.progression;"`,
          },
          {
            type: "radio",
            name: "context-filter",
            id: "context_filter-missable",
            label: "Missable",
            checked: this.FILTER_NAME === filterMethods.missable,
            event: `onchange="ui.target.FILTER_NAME = filterMethods.missable;"`,
          },
          {
            type: "radio",
            name: "context-filter",
            id: "context_filter-earned",
            label: "Earned",
            checked: this.FILTER_NAME === filterMethods.earned,
            event: `onchange="ui.target.FILTER_NAME = filterMethods.earned;"`,
          },
          {
            type: "radio",
            name: "context-filter",
            id: "context_filter-all",
            label: "All",
            checked: this.FILTER_NAME === filterMethods.all,
            event: `onchange="ui.target.FILTER_NAME = filterMethods.all;"`,
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
      {
        label: "Show header",
        type: "checkbox",
        name: "context_hide-target-header",
        id: "context_hide-target-header",
        checked: this.SHOW_HEADER,
        event: `onchange="ui.target.SHOW_HEADER = this.checked;"`,
      },
      {
        type: "checkbox",
        name: "context_autoscroll-target",
        id: "context_autoscroll-target",
        label: "Autoscroll",
        checked: this.AUTOSCROLL,
        event: `onchange="ui.target.AUTOSCROLL = this.checked;"`,
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
  sectionCode = "-target";
  set SORT_NAME(value) {
    config._cfg.settings.sortTargetBy = value;
    config.writeConfiguration();
    this.applySort();
  }
  get SORT_NAME() {
    return config._cfg.settings.sortTargetBy || sortMethods.default;
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
    return config._cfg.settings.filterTargetBy || filterMethods.all;
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
  get AUTOSCROLL() {
    return config?.ui?.target_section?.autoscroll ?? true;
  }
  set AUTOSCROLL(value) {
    config.ui.target_section.autoscroll = value;
    value ? this.startAutoScroll() : this.stopAutoScroll();
  }
  constructor() {
    this.initializeElements();
    this.addEvents();

    this.section.classList.toggle("compact", !this.SHOW_HEADER);
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
    UI.addDraggingEventForElements(this.container)
    this.startAutoScroll();
  }
  autoscrollInterval;
  startAutoScroll(toBottom = true) {
    clearInterval(this.autoscrollInterval);
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
              <i class=" target_description-icon ${type ?? "none"}" title="achievement type"></i> 
             
                <p class="target-description-text" title="points"><i class="target_description-icon  points-icon"></i>${Points}
                </p>
                
                <p class="target-description-text" title="retropoints"><i class="target_description-icon  retropoints-icon"></i>${TrueRatio}
                </p>
                <p class="target-description-text" title="earned by"><i class="target_description-icon  trending-icon"></i>${~~(
        (100 * NumAwardedHardcore) / totalPlayers)}%
                </p>
              </div>             
            </div>
    `;
    this.container.appendChild(targetElement);

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
    Object.values(ui.ACHIEVEMENTS).forEach(achievement => {
      this.addAchieveToTarget(achievement)
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
  get VISIBLE() {
    return !this.section.classList.contains("hidden");
  }
  get SORT_METHOD() {
    return sortBy[this.SORT_NAME];
  }
  get SORT_NAME() {
    return config._cfg.ui?.games_section?.sort_name ?? sortMethods.title;
  }
  set SORT_NAME(value) {
    config._cfg.ui.games_section.sort_name = value;
    config.writeConfiguration();
    this.applySort()
  }
  set REVERSE_SORT(value) {
    config._cfg.ui.games_section.reverse_sort = value ? -1 : 1;
    config.writeConfiguration();
    this.applySort()
  }
  get REVERSE_SORT() {
    return config._cfg.ui?.games_section?.reverse_sort ?? -1;
  }

  get GAMES_GROUP() {
    return config._cfg.ui?.games_section?.games_group ?? "all";
  }
  set GAMES_GROUP(value) {
    config._cfg.ui.games_section.games_group = value;
    config.writeConfiguration();
    this.changeGamesGroup(this.GAMES_GROUP);
  }
  set PLATFORMS_FILTER(checkbox) {
    const platformId = checkbox.dataset.platformId;
    const checkedPlatforms = this.PLATFORMS_FILTER;

    if (checkbox.checked) {
      checkedPlatforms.push(platformId);
    }
    else {
      const index = checkedPlatforms.indexOf(platformId);
      if (index !== -1) {
        checkedPlatforms.splice(index, 1);
      }
    }
    config.ui.games_section.platformsFilter = checkedPlatforms;
    config.writeConfiguration();
    this.applyFilter();
    this.platformFiltersList.querySelector("#game-filters_all").checked = this.PLATFORMS_FILTER.length === Object.keys(this.gameFilters).length;

  }
  get PLATFORMS_FILTER() {
    return config.ui?.games_section?.platformsFilter ?? ["7"];
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

  async changeGamesGroup(group) {
    const recentCheckbox = this.section.querySelector("#games_sort-latest");
    switch (group) {
      case 'recent':
        await this.getRecentGamesArray({});
        recentCheckbox.closest(".games_filters-item").classList.remove("disabled");
        recentCheckbox.click();
        this.fillFullList();
        this.applyFilter();
        break;
      case 'completion':
        await this.getCompletionGamesArray({});
        recentCheckbox.closest(".games_filters-item").classList.remove("disabled");
        recentCheckbox.click();
        this.fillFullList();
        break;
      default:
        recentCheckbox.closest(".games_filters-item").classList.add("disabled");
        this.platformFiltersList.classList.remove("disabled");
        this.section.querySelector("#games_filter-types-list").classList.remove("disabled")
        this.section.querySelector("#games_sort-title").click();
        await this.loadGamesArray();
    }
    this.applySort();
  }
  applySort() {
    this.GAMES.all = this.GAMES.all.sort((a, b) => this.SORT_METHOD(a, b) * this.REVERSE_SORT);
    this.clearList();
    this.fillFullList();
  }
  applyFilter() {
    this.GAMES.all = [];
    this.PLATFORMS_FILTER.forEach(platformId => {
      this.GAMES.all = this.GAMES.all.concat(this.GAMES[platformId]);

    })
    const searchbarValue = this.searchbar.value;
    this.searchbar.classList.toggle("empty", searchbarValue == "")

    if (searchbarValue != "") {

      let regex = new RegExp(searchbarValue, "i");

      this.GAMES.all = this.GAMES.all.filter(game => regex.test(game?.Title));

    }
    this.applyTypesFilter();
    this.applySort()
  }
  applyTypesFilter() {
    const types = this.TYPES_FILTER;
    let filteredGamesArray = [];
    types.forEach(type => {
      filteredGamesArray = filteredGamesArray.concat(
        this.GAMES.all
          ?.filter(game =>
            game?.sufixes.includes(type.toUpperCase()) || (game?.sufixes.length == 0 && type == "original")
          )
      );
    })
    this.GAMES.all = filteredGamesArray;
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
    "Genesis/Mega Drive": "1",
    "Nintendo 64": "2",
    "SNES/Super Famicom": "3",
    "Game Boy": "4",
    "Game Boy Advance": "5",
    "Game Boy Color": "6",
    "NES/Famicom": "7",
    "PC Engine/TurboGrafx-16": "8",
    "PlayStation": "12",
    "PlayStation 2": "21",
    "PlayStation Portable": "41",
    "etc.": "999",
  }
  platformNames = {
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
    "999": "etc.",
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
    "999": "etc.",
  }
  plaformsInfo = {};
  GAMES = {};
  BATCH_SIZE = 10;
  MAX_GAMES_IN_LIST = 50;
  constructor() {
    this.initializeElements();
    this.addEvents();
    this.generateFiltersList();
    this.setValues();
    this.loadGamesArray()
      .then(() => {
        this.applyFilter();
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
    this.section.querySelector(".games_search-bar_container").addEventListener("click", e => {
      e.stopPropagation();
    })
    this.section.addEventListener("click", () => {
      this.section.querySelector(".extended")?.classList.remove("extended");
      this.section.querySelector("#games_settings-checkbox").checked = false;
    });

    this.searchbar.addEventListener("input", () => this.searchInputHandler());
    this.gamesList.addEventListener("scroll", () => this.gamesListScrollHandler())

  }
  setValues() {
    this.gamesList.innerHTML = "";
    switch (this.SORT_NAME) {
      case sortMethods.achievementsCount:
        this.section.querySelector("#games_sort-achieves").checked = true;
        break;
      case sortMethods.points:
        this.section.querySelector("#games_sort-points").checked = true;
        break;
      default:
        this.section.querySelector("#games_sort-title").checked = true;
        break;
    }
    this.TYPES_FILTER.forEach(type => {
      const checkbox = this.section.querySelector(`#game-filters_${type.toLowerCase()}`);
      checkbox ? checkbox.checked = true : "";
    })
    this.REVERSE_SORT == -1 ? this.section.querySelector("#games_sort-reverse").checked = true : "";
    this.platformFiltersList.querySelector("#game-filters_all").checked = this.PLATFORMS_FILTER.length === Object.keys(this.gameFilters).length;

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
  fillGamesDown({ list }) {
    !list.dataset.currentGamesArrayPosition ? list.dataset.currentGamesArrayPosition = 0 : "";

    let startIndex = Number(list.dataset.currentGamesArrayPosition) ?? 0;
    let lastIndex = startIndex + this.BATCH_SIZE >= this.GAMES.all.length ?
      this.GAMES.all.length :
      startIndex + this.BATCH_SIZE;
    list.dataset.currentGamesArrayPosition = lastIndex;
    // Використовуємо збережені дані у властивості games для заповнення списку
    for (let i = startIndex; i < lastIndex; i++) {
      const gameElement = this.generateGameElement(this.GAMES.all[i]);
      list.appendChild(gameElement);
    }
  }
  fillGamesTop({ list }) {
    !list.dataset.currentGamesArrayPosition ? list.dataset.currentGamesArrayPosition = 0 : "";

    let startIndex = list.dataset.currentGamesArrayPosition - list.children.length - 1;
    // Використовуємо збережені дані у властивості games для заповнення списку
    for (let i = startIndex; i > startIndex - this.BATCH_SIZE && i >= 0; i--) {
      const gameElement = this.generateGameElement(this.GAMES.all[i]);
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
    this.GAMES = {};
    this.clearList();
    resp.forEach(game => {
      const platformCode =
        this.platformNames.hasOwnProperty(game.ConsoleID) ? game.ConsoleID : this.platformCodes["etc."];
      if (!this.GAMES[platformCode]) {
        this.GAMES[platformCode] = []
      }
      this.GAMES[platformCode].push(game)
    })
    this.GAMES.all = this.GAMES.saved = Object.values(this.GAMES).flat();
    this.applyFilter();
  }
  async getCompletionGamesArray() {
    const resp = await apiWorker.SAVED_COMPLETION_PROGRESS;
    this.GAMES = {};
    this.clearList();
    resp.Results.forEach(game => {
      const platformCode =
        this.platformNames.hasOwnProperty(game.ConsoleID) ? game.ConsoleID : this.platformCodes["etc."];
      if (!this.GAMES[platformCode]) {
        this.GAMES[platformCode] = []
      }
      this.GAMES[platformCode].push(game)
    })
    this.GAMES.all = this.GAMES.saved = Object.values(this.GAMES).flat();
    this.applyFilter();
  }


  async loadGamesArray() {
    this.GAMES = {};
    this.clearList();
    for (const platformCode of Object.getOwnPropertyNames(this.platformNames)) {
      await this.getAllGames({ consoleCode: platformCode });
    }
    this.GAMES.all = this.GAMES.saved = Object.values(this.GAMES).flat();
  }
  async getAllGames({ consoleCode }) {
    try {
      if (!(consoleCode == 0 || consoleCode == "all")) {
        const gamesResponse = await fetch(`./json/games/${consoleCode}.json`);
        const gamesJson = await gamesResponse.json();

        const ignoredWords = ["~UNLICENSED~", "~DEMO~", "~HOMEBREW~", "~HACK~", "~PROTOTYPE~", ".HACK//", "~TEST KIT~"];

        this.GAMES[consoleCode] = gamesJson.map(game => {
          let title = game.Title;
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
        })
      }

    } catch (error) {
      return [];
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
    const checkedElements = this.PLATFORMS_FILTER;
    Object.getOwnPropertyNames(this.gameFilters).forEach(platformCode => {
      const isChecked = checkedElements.includes(platformCode);
      const filterItem = document.createElement("li");
      filterItem.classList.add("game-filters_item");
      filterItem.innerHTML =
        `
        <input ${isChecked ? "checked" : ""} onchange='ui.games.PLATFORMS_FILTER = this' type="checkbox" data-platform-id="${platformCode}"  name="game-filters_item" id="game-filters_${platformCode}" ></input>
        <label class="game-filters_checkbox" for="game-filters_${platformCode}">${this.platformNames[platformCode]}</label>
      `;
      this.platformFiltersList.appendChild(filterItem);
    })
  }
  generateSufixes(sufixes) {
    return sufixes?.reduce((acc, sufix) => acc += `<i class="game-title_suffix game-title_${sufix.toLowerCase()}">${sufix}</i>`, "")
  }
  generateGameElement(game) {
    let { Title, FixedTitle, ID, GameID, sufixes, ConsoleName, ImageIcon, Points, PossibleScore, ForumTopicID, NumAchievements, AchievementsTotal, NumLeaderboards } = game;
    const imgName = game.ImageIcon.slice(ImageIcon.lastIndexOf("/") + 1, ImageIcon.lastIndexOf(".") + 1) + "webp";
    const gameElement = document.createElement("li");
    const sufixesElements = this.generateSufixes(sufixes);
    gameElement.dataset.gameID = ID;
    gameElement.classList.add("platform_game-item");
    gameElement.innerHTML = `   
      <div class="game-preview_container">
          <img src="./assets/imgCache/${imgName}"  onerror="this.src='https://media.retroachievements.org${ImageIcon}';" alt="" class="game-preview_image">
      </div>
      <h3 class="game-description_title"><button title="open game" class="game-description_button" 
        onclick="config.gameID = ${ID}; getAchievements()">${FixedTitle}
        ${sufixesElements ?? ""}
        <i class="game-title_suffix game-title_platform">${ConsoleName}</i>
       
        </button></h3>
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

    this.searchbar.classList.toggle("empty", searchbarValue == "");

    let regex = new RegExp(searchbarValue, "i");

    let searchGames = this.GAMES.all.filter(game => regex.test(game.Title));

    this.GAMES.all = searchGames;

    clearList();

    fillFullList();

  }
  markAllFilters() {
    if (this.PLATFORMS_FILTER.length === Object.keys(this.gameFilters).length) {
      config.ui.games_section.platformsFilter = [];
      this.platformFiltersList.querySelectorAll("[type='checkbox']").forEach(checkbox => checkbox.checked = false);
      config.writeConfiguration();
      this.applyFilter();
    }
    else {
      config.ui.games_section.platformsFilter = [...Object.keys(this.gameFilters)];
      this.platformFiltersList.querySelectorAll("[type='checkbox']").forEach(checkbox => checkbox.checked = true);
      config.writeConfiguration();
      this.applyFilter();
    }

  }
  clearSearchbar() {
    this.searchbar.value = "";
    this.searchInputHandler();
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
        postFunc: () => "",
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
      setTimeout(() => this.update(), 5000);
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
        postFunc: () => "",
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
  update() {
    apiWorker.getUserSummary({}).then(resp => {
      const { User, Status, UserPic, Rank, TotalRanked, TotalPoints, TotalSoftcorePoints, TotalTruePoints, RecentlyPlayed, RecentAchievements } = resp;
      this.USER_INFO.userName = User;
      this.USER_INFO.status = Status.toLowerCase();
      this.USER_INFO.userImageSrc = `https://media.retroachievements.org${UserPic}`;
      this.USER_INFO.userRank = `${Rank} (Top ${~~(10000 * Rank / TotalRanked) / 100}%)`;
      this.USER_INFO.softpoints = TotalSoftcorePoints;
      this.USER_INFO.retropoints = TotalTruePoints;
      this.USER_INFO.hardpoints = TotalPoints;
      this.USER_INFO.lastGames = RecentlyPlayed;
      this.USER_INFO.lastAchivs = Object.values(RecentAchievements)
        .flatMap(RecentAchievements => Object.values(RecentAchievements))
        .sort((a, b) => new Date(b.DateAwarded) - new Date(a.DateAwarded));
      ui.notifications.parseUserSummary(this.USER_INFO)

    }).then(() => this.setValues())

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
    <p class="user_game-description">${fixTimeString(achiv.DateAwarded ?? achiv.Date)}</p>
    `;
    return achivElement;
  }
  close() {
    ui.buttons.user.click();
  }
}
class Notification {
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
        postFunc: () => "",
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
      .sort((a, b) => -1 * sortBy.latest(a, b))
    ).forEach(element =>
      this.pushNotification({
        type: element.type,
        elements: element,
        time: element.DateEarnedHardcore
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
    const timestampElement = document.createElement("li");
    const popupTime = (time ? new Date(time) : new Date()).getTime();
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

  points: (a, b) => parseInt(a.Points) - parseInt(b.Points),

  truepoints: (a, b) => a.TrueRatio - b.TrueRatio,

  default: (a, b) => a.DisplayOrder - b.DisplayOrder,

  id: (a, b) => a.ID - b.ID,

  disable: (a, b) => 0,

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

  }
}
//* Методи фільтрування для досягнень гри
const filterBy = {
  earned: (achievement) => achievement.DateEarnedHardcore,
  notEarned: (achievement) => !achievement.DateEarnedHardcore,
  missable: (achievement) => achievement.type === "missable",
  progression: (achievement) => achievement.type === "progression" || achievement.type === "win_condition",
  all: () => true,
};
const filterMethods = {
  all: "all",
  earned: "earned",
  notEarned: "notEarned",
  missable: "missable",
  progression: "progression",
};
const sortMethods = {
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
