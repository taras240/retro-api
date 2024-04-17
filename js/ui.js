class UI {
  VERSION = "0.12";
  static AUTOCLOSE_CONTEXTMENU = false;
  static filterMethods = {
    all: "all",
    earned: "earned",
    notEarned: "notEarned",
    missable: "missable",
  };
  static sortMethods = {
    latest: "latest",
    earnedCount: "earnedCount",
    points: "points",
    truepoints: "truepoints",
    disable: "disable",
    id: "id",
    default: "default",
  };
  _achievementsArray;
  get ACHIEVEMENTS() {
    return this.achievementsArray;
  }
  set ACHIEVEMENTS(value) {
    this.achievementsArray = value;
  }
  achievementsBlockTemplates = [];
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
    this.about = {
      section: document.querySelector("#help_section"),
    };
    this.loginCard = new LoginCard();
    this.target = new Target();
    this.achievementsBlock = new AchievementsBlock();
    this.settings = new Settings();
    this.awards = new Awards();
    this.gameCard = new GameCard();
    this.statusPanel = new StatusPanel();
    this.buttons = new ButtonPanel();
    document.addEventListener("click", (e) => {
      document
        .querySelectorAll(".context-menu")
        .forEach((el) => el.classList.add("hidden"));
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
      hidden ? element.classList.add("hidden") : "";
    });
    document.querySelector("#background-animation").style.display =
      config.bgVisibility ? "display" : "none";
  }
  createAchievementsTemplate() {
    this.achievementsBlockTemplates.length === 1
      ? UI.switchSectionVisibility(this.achievementsBlockTemplates[0])
      : this.achievementsBlockTemplates.push(
        new AchievementsBlockTemplate(
          this.achievementsBlockTemplates.length + 1
        )
      );
  }
  checkForNewAchieves(lastEarnedAchieves) {
    let earnedAchievements = [];
    lastEarnedAchieves.forEach(achievement => {
      const savedAchievement = this.ACHIEVEMENTS[achievement.AchievementID];
      const isHardcoreMismatch = achievement.HardcoreMode === 1 && !savedAchievement.isHardcoreEarned;
      const isSoftCoreMismatch = !savedAchievement.isEarned;
      if (isSoftCoreMismatch || isHardcoreMismatch) {
        earnedAchievements.push(achievement);
      }
    })
    this.updateAchievements(earnedAchievements);
    return earnedAchievements?.map(achievement => achievement.AchievementID);
  }
  updateAchievements(earnedAchievements) {
    earnedAchievements.forEach(achievement => {
      const { HardcoreMode, Date } = achievement;
      const savedAchievement = this.ACHIEVEMENTS[achievement.AchievementID];
      if (HardcoreMode == 1) {
        savedAchievement.isHardcoreEarned = true;
        savedAchievement.DateEarnedHardcore = Date;
      }
      savedAchievement.isEarned = true;
      savedAchievement.DateEarned = savedAchievement.DateEarned ?? Date;
    })
  }
  static updateAchievementsSection({ widget, earnedAchievementIDs }) {
    earnedAchievementIDs.forEach(id => {
      const achievement = ui.ACHIEVEMENTS[id];
      const achieveElement = widget.container.querySelector(`[data-achiv-id="${id}"]`);
      achieveElement.classList.add("earned", achievement.isHardcoreEarned ? "hardcore" : "f");
      achievement.DateEarnedHardcore ? achieveElement.dataset.DateEarnedHardcore = achievement.DateEarnedHardcore : "";

      if (widget.SORT_METHOD === UI.sortMethods.latest) {
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
              }${sectionCode}" id="${menuItem.id}${sectionCode}" 
             ${menuItem.checked == true ? "checked" : ""} ${menuItem.event ?? ""}></input>
            <label class="context-menu_${menuItem.type}"  for="${menuItem.id
              }${sectionCode}">${menuItem.label}</label>
            `;
            break;
          case "input-number":
            menuElement.innerHTML += `
            ${menuItem.prefix}
            <input class="context-menu_${menuItem.type}" id="${menuItem.id
              }${sectionCode}" type="number" value="${menuItem.value ?? ""}" ${menuItem.event ?? ""} onclick="event.stopPropagation()">${menuItem.postfix ?? ""
              } </input>
            `;
            break;
          case "text-input":
            menuElement.innerHTML += `
              ${menuItem.prefix}
              <input class="context-menu_${menuItem.type}" id="${menuItem.id
              }${sectionCode}" type="text">${menuItem.postfix ?? ""
              } onclick="event.stopPropagation()"</input>
              `;
            break;
          case "button":
            menuElement.innerHTML += `
              <button class="context-menu_${menuItem.type}" id="${menuItem.id
              }${sectionCode}" ${menuItem.event ?? ""} type="button">${menuItem.label ?? ""}</button>
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
    section.classList.toggle("hidden");
    config.setNewPosition({
      id: section.id,
      hidden: section.classList.contains("hidden"),
    });
  }
}

class AchievementsBlock {
  contextMenuItems = [
    {
      label: "Sort",
      subMenu: [
        {
          type: "radio",
          name: "context-sort",
          id: "context-sort_latest",
          label: "Latest",
          checked: this.SORT_NAME === UI.sortMethods.latest,
          event: `onchange="ui.achievementsBlock.SORT_NAME = UI.sortMethods.latest;"`
        },
        {
          type: "radio",
          name: "context-sort",
          id: "context-sort_rarest",
          label: "Rarest",
          checked: this.SORT_NAME === UI.sortMethods.earnedCount,
          event: `onchange="ui.achievementsBlock.SORT_NAME = UI.sortMethods.earnedCount;"`
        },
        {
          type: "radio",
          name: "context-sort",
          id: "context-sort_points",
          label: "Points",
          checked: this.SORT_NAME === UI.sortMethods.points,
          event: `onchange="ui.achievementsBlock.SORT_NAME = UI.sortMethods.points;"`

        },
        {
          type: "radio",
          name: "context-sort",
          id: "context-sort_retropoints",
          label: "Retropoints",
          checked: this.SORT_NAME === UI.sortMethods.truepoints,
          event: `onchange="ui.achievementsBlock.SORT_NAME = UI.sortMethods.truepoints;"`

        },
        {
          type: "radio",
          name: "context-sort",
          id: "context-sort_default",
          label: "Default",
          checked: this.SORT_NAME === UI.sortMethods.default,
          event: `onchange="ui.achievementsBlock.SORT_NAME = UI.sortMethods.default;"`

        },
        {
          type: "radio",
          name: "context-sort",
          id: "context-sort_disable",
          label: "Disable",
          checked: this.SORT_NAME === UI.sortMethods.disable,
          event: `onchange="ui.achievementsBlock.SORT_NAME = UI.sortMethods.disable;"`

        },
        {
          type: "checkbox",
          name: "context-reverse-sort",
          id: "context-reverse-sort",
          label: "Reverse",
          checked: this.REVERSE_SORT == -1,
          event: `onchange="ui.achievementsBlock.REVERSE_SORT = this.checked"`

        },
      ],
    },
    {
      label: "Filter",
      subMenu: [
        {
          type: "radio",
          name: "context-filter",
          id: "context_filter-missable",
          label: "Missable",
          checked: this.FILTER_NAME === UI.filterMethods.missable,
          event: `onchange="ui.achievementsBlock.FILTER_NAME = UI.filterMethods.missable;"`

        },
        {
          type: "radio",
          name: "context-filter",
          id: "context_filter-earned",
          label: "Earned",
          checked: this.FILTER_NAME === UI.filterMethods.earned,
          event: `onchange="ui.achievementsBlock.FILTER_NAME = UI.filterMethods.earned;"`

        },
        {
          type: "radio",
          name: "context-filter",
          id: "context_filter-all",
          label: "All",
          checked: this.FILTER_NAME === UI.filterMethods.all,
          event: `onchange="ui.achievementsBlock.FILTER_NAME = UI.filterMethods.all;"`

        },
        {
          type: "checkbox",
          name: "context-reverse-filter",
          id: "context-reverse-filter",
          label: "Reverse",
          checked: this.REVERSE_FILTER,
          event: `onchange="ui.achievementsBlock.REVERSE_FILTER = this.checked;"`

        },
        {
          type: "checkbox",
          name: "context-hide-filtered",
          id: "context-hide-filtered",
          label: "Hide filtered",
          checked: this.HIDE_FILTERED,
          event: `onchange="ui.achievementsBlock.HIDE_FILTERED = this.checked;"`

        },
      ],
    },
    {
      label: "Achieve style",
      subMenu: [
        {
          prefix: "Min size",
          postfix: "px",
          type: "input-number",
          id: "context-menu_min-size",
          label: "Min size",
          value: this.ACHIV_MIN_SIZE,
          event: `onchange="ui.achievementsBlock.ACHIV_MIN_SIZE = this.value;"`,
        },
        {
          prefix: "Max size",
          postfix: "px",
          type: "input-number",
          id: "context-menu_max-size",
          label: "Max size",
          value: this.ACHIV_MAX_SIZE,
          event: `onchange="ui.achievementsBlock.ACHIV_MAX_SIZE = this.value;"`,

        },
        {
          type: "checkbox",
          name: "context_stretch-achieves",
          id: "context_stretch-achieves",
          label: "Stretch",
          checked: this.ACHIV_STRETCH,
          event: `onchange="ui.achievementsBlock.ACHIV_STRETCH = this.checked;"`,

        },
      ],
    },
    {
      label: "Show background",
      type: "checkbox",
      name: "context_show-bg",
      id: "context_show-bg",
      checked: this.BG_VISIBILITY,
      event: `onchange="ui.achievementsBlock.BG_VISIBILITY = this.checked;"`,

    },
  ];
  set SORT_NAME(value) {
    config._cfg.settings.sortBy = value;
    config.writeConfiguration();
    this.applySorting();
  }
  get SORT_NAME() {
    return config._cfg.settings.sortBy || UI.sortMethods.default
  }
  get SORT_METHOD() {
    return sortBy[this.SORT_NAME];
  }
  set FILTER_NAME(value) {
    config._cfg.settings.filterBy = value;
    config.writeConfiguration();
    this.applyFilter();
  }
  get FILTER_NAME() {
    return config._cfg.settings.filterBy || UI.filterMethods.all;
  }
  get FILTER_METHOD() {
    return filterBy[this.FILTER_NAME];
  }
  get HIDE_FILTERED() {
    return config._cfg.settings.hideFiltered ?? false;
  }
  set HIDE_FILTERED(value) {
    config._cfg.settings.hideFiltered = value;
    config.writeConfiguration();
    this.applyFilter();
  }
  get REVERSE_SORT() {
    return config._cfg.settings.reverseSort || 1;
  }
  set REVERSE_SORT(value) {
    config._cfg.settings.reverseSort = value ? -1 : 1;
    config.writeConfiguration();
    this.applySorting();
  }
  get REVERSE_FILTER() {
    return config._cfg.settings.reverseFilter ?? false;
  }
  set REVERSE_FILTER(value) {
    config._cfg.settings.reverseFilter = value;
    config.writeConfiguration();
    this.applyFilter();
  }
  get ACHIV_MIN_SIZE() {
    return config._cfg.settings.ACHIV_MIN_SIZE ?? 30;
  }
  set ACHIV_MIN_SIZE(value) {
    if (+value > 10) {
      config._cfg.settings.ACHIV_MIN_SIZE = value;
      config.writeConfiguration();
      this.fitSizeVertically();
    }
  }
  get ACHIV_MAX_SIZE() {
    return config._cfg.settings.ACHIV_MAX_SIZE ?? 150;
  }
  set ACHIV_MAX_SIZE(value) {
    if (+value > +this.ACHIV_MIN_SIZE) {
      config._cfg.settings.ACHIV_MAX_SIZE = value;
      config.writeConfiguration();
      this.fitSizeVertically();
    }
  }
  get ACHIV_STRETCH() {
    return config._cfg.settings.stretchAchievements ?? false;
  }
  set ACHIV_STRETCH(value) {
    config._cfg.settings.stretchAchievements = value;
    config.writeConfiguration();
    this.container.style.height = this.ACHIV_STRETCH ? "100%" : "auto";
  }
  get BG_VISIBILITY() {
    return config._cfg.settings.bgVisibility ?? true;
  }
  set BG_VISIBILITY(value) {
    config._cfg.settings.bgVisibility = value;
    config.writeConfiguration();
    this.section.classList.toggle("bg-visible", this.BG_VISIBILITY);
  }
  constructor(isTemplate = false) {
    this.sectionCode = "";
    if (!isTemplate) {
      this.initializeElements();
      this.addEvents();
      this.setValues();
    }
  }
  initializeElements() {
    // this.generateNewWidget()
    // Елементи блока досягнень
    this.section = document.querySelector(
      `#achievements_section${this.sectionCode}`
    ); // Секція блока досягнень
    this.contextMenu = UI.generateContextMenu({
      menuItems: this.contextMenuItems,
      sectionCode: this.sectionCode,
    });
    this.section.appendChild(this.contextMenu);
    this.container = this.section.querySelector(`.achievements-container`); //Контейнер  з досягненнями
    this.resizer = this.section.querySelector(
      `#achivs-resizer${this.sectionCode}`
    ); // Ресайзер блока досягнень
  }
  addEvents() {
    // Додавання подій для пересування вікна ачівментсів
    this.section.addEventListener("mousedown", (e) => {
      UI.moveEvent(this.section, e);
    });
    this.section.addEventListener("contextmenu", (e) => {
      e.preventDefault();

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
        postFunc: () => this.fitSizeVertically(true),
      });
    });
  }
  setValues() {
    if (!config.ui.achievements_section) {
      UI.switchSectionVisibility(this);
    }
    this.section.classList.toggle("bg-visible", this.BG_VISIBILITY);
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
    //Додаєм можливість перетягування елементів
    UI.addDraggingEventForElements(this.container);
  }

  displayAchievements(achievementsObject) {
    Object.values(achievementsObject.Achievements).forEach((achievement) => {
      this.displayAchievement(
        this.fixAchievement(achievement, achievementsObject)
      );
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
    achivElement.dataset.pointStyle =
      Points < 10 ? "poor" : Points < 20 ? "normal" : "reach";

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
    previewContainer.appendChild(toTargetButton);

    let achivDetails = this.generateAchivDetails(achievement);
    achivElement.appendChild(achivDetails);

    //* fix details popup position
    achivElement.addEventListener("mouseenter", (e) => {
      achivDetails.classList.remove("left-side", "top-side");
      this.fixDetailsPosition(achivDetails);
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
    }
    else {
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
    if (isLoadDynamic || !config.ui.achievements_section?.height) {
      windowHeight = section.clientHeight - 35;
      windowWidth = section.clientWidth;
    } else {
      windowHeight = parseInt(config.ui.achievements_section.height) - 35;
      windowWidth = parseInt(config.ui.achievements_section.width);
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
    container.style.setProperty("--achiv-height", achivWidth + "px");
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
    ui.buttons.achievements.click();
  }
  generateNewWidget({ sectionCode = "" }) {
    const newWidget = document.createElement("section");
    newWidget.id = `achievements_section${this.sectionCode}`;
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
    <h2 class="widget-header-text achivs-header-text">Achieves~</h2>

    <button class="header-button header-icon" onclick="ui.achievementsBlockTemplates[${this.id - 1
      }].close();">
      <svg height="24" viewBox="0 -960 960 960" width="24">
        <path d="m256-200-56-56 224-224-224-224 56-56 224 224 224-224 56 56-224 224 224 224-56 56-224-224-224 224Z" />
      </svg>
    </button>
  </div>
  <ul class="achievements-container"></ul>
  <div class="resizer" id="achivs-resizer${this.sectionCode}"></div>
    `;
    document.querySelector(".wrapper").appendChild(newWidget);
  }
}
class AchievementsBlockTemplate extends AchievementsBlock {
  set SORT_METHOD(value) {
    config.ui[`achievements_section${this.sectionCode}`].sortAchievementsBy =
      value;

    config.writeConfiguration();
  }
  get SORT_METHOD() {
    return sortBy[
      config.ui[`achievements_section${this.sectionCode}`].sortAchievementsBy ||
      UI.sortMethods.default
    ];
  }
  // filterBy.all;
  set FILTER_METHOD(value) {
    config.ui[`achievements_section${this.sectionCode}`].filterAchievementsBy =
      value;
    config.writeConfiguration();
  }
  get FILTER_METHOD() {
    return filterBy[
      config.ui[`achievements_section${this.sectionCode}`]
        .filterAchievementsBy || UI.filterMethods.all
    ];
  }
  get HIDE_FILTERED() {
    return (
      config.ui[`achievements_section${this.sectionCode}`].hideFiltered ?? false
    );
  }
  set HIDE_FILTERED(value) {
    config.ui[`achievements_section${this.sectionCode}`].hideFiltered = value;
    config.writeConfiguration();
  }
  get REVERSE_SORT() {
    return config.ui[`achievements_section${this.sectionCode}`].reverseSort
      ? -1
      : 1;
  }
  set REVERSE_SORT(value) {
    config.ui[`achievements_section${this.sectionCode}`].reverseSort = value;
    config.writeConfiguration();
  }
  get REVERSE_FILTER() {
    return config.ui[`achievements_section${this.sectionCode}`].reverseFilter;
  }
  set REVERSE_FILTER(value) {
    config.ui[`achievements_section${this.sectionCode}`].reverseFilter = value;
    config.writeConfiguration();
  }
  constructor(id) {
    super(true);
    this.id = id;
    this.sectionCode = id ? "-" + id : "";
    this.generateNewWidget();
    super.initializeElements();
    this.addEvents();
    this.setValues();
    this.cloneAchieves();
    super.fitSizeVertically(true);
  }
  addEvents() {
    this.section.addEventListener("contextmenu", (e) => {
      e.preventDefault();

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
    UI.addDraggingEventForElements(this.container);

    this.section.addEventListener("mousedown", (e) => {
      UI.moveEvent(this.section, e);
    });
    this.bgVisibilityCheckbox.addEventListener("change", (e) => {
      this.bgVisibilityCheckbox.checked
        ? this.section.classList.add("bg-visible")
        : this.section.classList.remove("bg-visible");
    });
    // Додає подію кліку для сортування за замовчуванням
    this.sortByDefaultButton.addEventListener("click", (e) => {
      e.stopPropagation();
      // Встановлює метод сортування за замовчуванням
      this.SORT_METHOD = UI.sortMethods.default;
      // Застосовує сортування та оновлює інтерфейс
      this.applySorting();
    });

    // Додає подію кліку для сортування за отриманням досягнення
    this.sortByEarnedButton.addEventListener("click", (e) => {
      e.stopPropagation();
      // Встановлює метод сортування за отриманням досягнення
      this.SORT_METHOD = UI.sortMethods.earnedCount;
      // Застосовує сортування та оновлює інтерфейс
      this.applySorting();
    });

    // Додає подію кліку для сортування за датою отримання
    this.sortByLatestButton.addEventListener("click", (e) => {
      e.stopPropagation();
      // Встановлює метод сортування за датою отримання
      this.SORT_METHOD = UI.sortMethods.latest;
      // Застосовує сортування та оновлює інтерфейс
      this.applySorting();
    });

    // Додає подію кліку для сортування за кількістю балів
    this.sortByPointsButton.addEventListener("click", (e) => {
      e.stopPropagation();
      // Встановлює метод сортування за кількістю балів
      this.SORT_METHOD = UI.sortMethods.points;
      // Застосовує сортування та оновлює інтерфейс
      this.applySorting();
    });
    this.sortByTruepointsButton.addEventListener("click", (e) => {
      e.stopPropagation();
      // Встановлює метод сортування за кількістю балів
      this.SORT_METHOD = UI.sortMethods.truepoints;
      // Застосовує сортування та оновлює інтерфейс
      this.applySorting();
    });
    this.reverseSortButton.addEventListener("click", (e) => {
      e.stopPropagation();
      // Встановлює reverse сортування
      this.REVERSE_SORT = this.reverseSortButton.checked;
      // Застосовує сортування та оновлює інтерфейс
      this.applySorting();
    });
    this.reverseFilterCheckbox.addEventListener("change", (e) => {
      this.REVERSE_FILTER = this.reverseFilterCheckbox.checked;
      this.applyFilter();
    });
    // Додає подію кліку для фільтрування
    this.filterByEarnedRadio.addEventListener("click", (e) => {
      e.stopPropagation();
      this.FILTER_METHOD = UI.filterMethods.earned;
      this.applyFilter();
    });

    this.filterByAllRadio.addEventListener("click", (e) => {
      e.stopPropagation();
      this.FILTER_METHOD = UI.filterMethods.all;
      this.applyFilter();
    });
    this.filterByMissableRadio.addEventListener("click", (e) => {
      e.stopPropagation();
      this.FILTER_METHOD = UI.filterMethods.missable;
      this.applyFilter();
    });
    this.hideFilteredCheckbox.addEventListener("change", (e) => {
      this.HIDE_FILTERED = this.hideFilteredCheckbox.checked;
      this.applyFilter();
    });
    this.stretchButton.addEventListener("click", (e) => {
      config.stretchAchievements = this.stretchButton.checked;
      this.container.style.height = config.stretchAchievements
        ? "100%"
        : "auto";
    });
    this.minimumWidthInput.addEventListener("change", (e) => {
      const { minimumWidthInput } = this;
      if (minimumWidthInput.value)
        config.ACHIV_MIN_SIZE = minimumWidthInput.value;
      this.fitSizeVertically();
    });
    this.maximumWidthInput.addEventListener("change", (e) => {
      const { maximumWidthInput } = this;
      if (maximumWidthInput.value)
        config.ACHIV_MAX_SIZE = maximumWidthInput.value;
      this.fitSizeVertically();
    });
    this.resizer.addEventListener("mousedown", (event) => {
      event.stopPropagation();
      this.section.classList.add("resized");
      UI.resizeEvent({
        event: event,
        section: this.section,
        postFunc: () => this.fitSizeVertically(true),
      });
    });
  }
  setValues() {
    if (config.ui[`achievements_section${this.sectionCode}`]) {
      // UI.switchSectionVisibility(this);
      this.section.style.top =
        config.ui[`achievements_section${this.sectionCode}`].y ?? "0px";
      this.section.style.left =
        config.ui[`achievements_section${this.sectionCode}`].x ?? "0px";
      this.section.style.height =
        config.ui[`achievements_section${this.sectionCode}`].height ?? "600px";
      this.section.style.width =
        config.ui[`achievements_section${this.sectionCode}`].width ?? "350px";
      this.hideFilteredCheckbox.checked = this.HIDE_FILTERED;
    }
    this.container.style.height = config.stretchAchievements ? "100%" : "auto";

    this.bgVisibilityCheckbox.checked = config.achivsBgVisibility;

    switch (
    config.ui[`achievements_section${this.sectionCode}`].filterAchievementsBy
    ) {
      case UI.filterMethods.all:
        this.filterByAllRadio.checked = true;
        break;
      case UI.filterMethods.earned:
        this.filterByEarnedRadio.checked = true;
        break;
      case UI.filterMethods.missable:
        this.filterByMissableRadio.checked = true;
        break;
      default:
        this.filterByAllRadio.checked = true;
        break;
    }
    this.reverseFilterCheckbox.checked = this.REVERSE_FILTER;
    switch (
    config.ui[`achievements_section${this.sectionCode}`].sortAchievementsBy
    ) {
      case UI.sortMethods.default:
        this.sortByDefaultButton.checked = true;
        break;
      case UI.sortMethods.earnedCount:
        this.sortByEarnedButton.checked = true;
        break;
      case UI.sortMethods.latest:
        this.sortByLatestButton.checked = true;
        break;
      case UI.sortMethods.points:
        this.sortByPointsButton.checked = true;
        break;
      case UI.sortMethods.truepoints:
        this.sortByTruepointsButton.checked = true;
        break;
      default:
      case UI.sortMethods.default:
        this.sortByDefaultButton.checked = true;
        break;
    }
    this.reverseSortButton.checked = this.REVERSE_SORT == -1;

    this.maximumWidthInput.value = config.ACHIV_MAX_SIZE;
    this.minimumWidthInput.value = config.ACHIV_MIN_SIZE;
    this.stretchButton.checked = config.stretchAchievements;

    config.achivsBgVisibility ? this.section.classList.add("bg-visible") : "";
  }

  generateNewWidget() {
    const newWidget = document.createElement("section");
    newWidget.id = `achievements_section${this.sectionCode}`;
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
    <h2 class="widget-header-text achivs-header-text">Achieves~</h2>

    <button class="header-button header-icon" onclick="ui.achievementsBlockTemplates[${this.id - 1
      }].close();">
      <svg height="24" viewBox="0 -960 960 960" width="24">
        <path d="m256-200-56-56 224-224-224-224 56-56 224 224 224-224 56 56-224 224 224 224-56 56-224-224-224 224Z" />
      </svg>
    </button>
  </div>
  <ul class="achievements-container"></ul>
  <div class="resizer" id="achivs-resizer${this.sectionCode}"></div>
    `;
    document.querySelector(".wrapper").appendChild(newWidget);
  }
  cloneAchieves() {
    let achievements = ui.achievementsBlock?.container.innerHTML;
    this.container.innerHTML = achievements ?? "";
    this.container.querySelectorAll(".achiv-block").forEach((achivElement) => {
      let achivDetails = achivElement.querySelector(".achiv-details-block");
      achivElement.addEventListener("mouseenter", (e) => {
        achivDetails.classList.remove("left-side", "top-side");
        this.fixDetailsPosition(achivDetails);
      });

      achivElement.addEventListener("mousedown", (e) => {
        e.stopPropagation();
      });
    });
    this.container
      .querySelectorAll(".add-to-target")
      .forEach((button) => (button.style.display = "none"));
    this.applyFilter();
    this.applySorting();
    this.fitSizeVertically();
  }
  close() {
    UI.switchSectionVisibility(ui.achievementsBlockTemplates[0]);
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
    this.header = document.querySelector("#buttons-header_container");
    this.settings = document.querySelector("#open-settings-button");
    this.achievements = document.querySelector("#open-achivs-button");
    this.login = document.querySelector("#open-login-button");
    this.about = document.querySelector("#open-about-button");
    this.gameCard = document.querySelector("#open-game-card-button");
    this.target = document.querySelector("#open-target-button");
    this.status = document.querySelector("#open-status-button");
    this.awards = document.querySelector("#open-awards-button");
    this.userImage = document.querySelector("#side-panel-user-image");
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
      UI.switchSectionVisibility(ui.achievementsBlock);
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
  }

  setValues() {
    // Встановлення початкових індикаторів віджетів
    this.achievements.checked =
      !config.ui?.achievements_section?.hidden ?? true;

    this.settings.checked = !config.ui?.settings_section?.hidden ?? true;

    this.login.checked = !config.ui?.login_section?.hidden ?? true;

    this.target.checked = !config.ui?.target_section?.hidden ?? true;

    this.gameCard.checked = !config.ui?.game_section?.hidden ?? true;

    this.status.checked = !config.ui?.["update-section"]?.hidden ?? true;

    this.awards.checked = !config.ui?.awards_section?.hidden ?? true;
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
      achievedCount = parseInt(this.progresBar.dataset.achievedCount) + earnedAchievementIDs.length || 0;
      totalEarnedPoints = parseInt(this.progresBar.dataset.points);
      earnedAchievementIDs.forEach(id => {
        if (ui.ACHIEVEMENTS[id].DateEarnedHardcore) {
          totalEarnedPoints += ui.ACHIEVEMENTS[id].Points;
        }
      })

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
    this.progressStatusText.innerText = completionByPointsPercents;
  }
}
class Settings {
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
  contextMenuItems = [
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
  // get gameInfo{
  //   return this.gameInfoElements;
  // }
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

    // Генеруємо контекстне меню з використанням методу generateContextMenu() з класу UI
    this.contextMenu = UI.generateContextMenu({
      menuItems: this.contextMenuItems, // Пункти меню передаємо з властивості контекстного об'єкту
      sectionCode: "-game-card", // Код секції передаємо для ідентифікації
    });

    // Додаємо контекстне меню до контейнера з інформацією про гру
    this.section.appendChild(this.contextMenu);

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
  contextMenuItems = [
    {
      label: "Sort",
      subMenu: [
        {
          type: "radio",
          name: "context-sort",
          id: "context-sort_latest",
          label: "Latest",
          checked: this.SORT_NAME === UI.sortMethods.latest,
          event: `onchange="ui.target.SORT_NAME = UI.sortMethods.latest;"`

        },
        {
          type: "radio",
          name: "context-sort",
          id: "context-sort_rarest",
          label: "Rarest",
          checked: this.SORT_NAME === UI.sortMethods.earnedCount,
          event: `onchange="ui.target.SORT_NAME = UI.sortMethods.earnedCount;"`
        },
        {
          type: "radio",
          name: "context-sort",
          id: "context-sort_points",
          label: "Points",
          checked: this.SORT_NAME === UI.sortMethods.points,
          event: `onchange="ui.target.SORT_NAME = UI.sortMethods.points;"`

        },
        {
          type: "radio",
          name: "context-sort",
          id: "context-sort_retropoints",
          label: "Retropoints",
          checked: this.SORT_NAME === UI.sortMethods.truepoints,
          event: `onchange="ui.target.SORT_NAME = UI.sortMethods.truepoints;"`

        },
        {
          type: "radio",
          name: "context-sort",
          id: "context-sort_default",
          label: "Default",
          checked: this.SORT_NAME === UI.sortMethods.default,
          event: `onchange="ui.target.SORT_NAME = UI.sortMethods.default;"`

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
          event: `onchange="ui.target.SORT_NAME = UI.sortMethods.disable;"`

        },
        {
          type: "checkbox",
          name: "context-reverse-sort",
          id: "context-reverse-sort",
          label: "Reverse",
          checked: this.REVERSE_SORT == -1,
          event: `onchange="ui.target.REVERSE_SORT = this.checked"`


        },
      ],
    },
    {
      label: "Filter",
      subMenu: [
        {
          type: "radio",
          name: "context-filter",
          id: "context_filter-missable",
          label: "Missable",
          checked: this.FILTER_NAME === UI.filterMethods.missable,
          event: `onchange="ui.target.FILTER_NAME = UI.filterMethods.missable;"`
        },
        {
          type: "radio",
          name: "context-filter",
          id: "context_filter-earned",
          label: "Earned",
          checked: this.FILTER_NAME === UI.filterMethods.earned,
          event: `onchange="ui.target.FILTER_NAME = UI.filterMethods.earned;"`
        },
        {
          type: "radio",
          name: "context-filter",
          id: "context_filter-all",
          label: "All",
          checked: this.FILTER_NAME === UI.filterMethods.all,
          event: `onchange="ui.target.FILTER_NAME = UI.filterMethods.all;"`
        },
        {
          type: "checkbox",
          name: "context-reverse-filter",
          id: "context-reverse-filter",
          label: "Reverse",
          checked: this.REVERSE_FILTER,
          event: `onchange="ui.target.REVERSE_FILTER = this.checked;"`
        },
        {
          type: "checkbox",
          name: "context-hide-filtered",
          id: "context-hide-filtered",
          label: "Hide filtered",
          checked: this.HIDE_FILTERED,
          event: `onchange="ui.target.HIDE_FILTERED = this.checked;"`
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
          event: `onclick="ui.target.clearAllAchivements();"`
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
          event: `onclick="ui.target.fillItems()"`

        },
        {
          type: "checkbox",
          name: "context-autofill",
          id: "context-autofill",
          label: "Autofill",
          checked: this.AUTOFILL,
          event: `onchange="ui.target.AUTOFILL = this.checked;"`
        },
      ],
    },
  ];
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
    return config._cfg.settings.autoFillTarget ?? false;
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
    if (!config.ui.target_section) {
      UI.switchSectionVisibility(this);
    }
    this.initializeElements();
    this.addEvents();
  }
  initializeElements() {
    this.section = document.querySelector("#target_section");
    this.contextMenu = UI.generateContextMenu({
      menuItems: this.contextMenuItems,
      sectionCode: this.sectionCode,
    });
    this.section.appendChild(this.contextMenu);
    this.section.addEventListener("contextmenu", (e) => {
      e.preventDefault();

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
    }
    else {
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
      this.container.querySelectorAll(".earned").forEach(element => {
        setTimeout(() => element.remove(), this.AUTOCLEAR_DELAY * 1000);
      })
    }
  }
  fillItems() {
    this.isDynamicAdding = true;
    ui.achievementsBlock.container
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

  id: (a, b) => a.achivId - b.achivId,

  disable: (a, b) => 0,
};

//* Методи фільтрування для досягнень гри
const filterBy = {
  earned: (achievement) => achievement.DateEarnedHardcore,
  notEarned: (achievement) => !achievement.DateEarnedHardcore,
  missable: (achievement) => achievement.type === "missable",
  all: () => true,
};

function fixTimeString(dateString) {
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
