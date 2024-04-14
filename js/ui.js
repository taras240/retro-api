class UI {
  VERSION = "0.1";
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
    default: "default",
  };
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
          config.startOnLoad
            ? this.statusPanel.watchButton.click()
            : this.settings.checkIdButton.click();
        }
        document
          .querySelectorAll(".header-settings-container")
          .forEach((el) => {
            el.addEventListener("mousedown", (e) => e.stopPropagation());
          });
        if (config.version != this.VERSION) {
          document.querySelector("#help_section").classList.remove("hidden");
          config.version = this.VERSION;
        }
        //Вимкнення вікна завантаження
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
    // Проходження по кожному ідентифікатору контейнера в об'єкті config.ui
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
      completion: UserCompletionHardcore,
      achievements: Achievements,
    });
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

    new Sortable(dragAndDropItems, {
      animation: 150,
      // chosenClass: "target-achiv-chosen",
      // dragClass: "target-achiv-drag",
    });
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
        },
        {
          type: "radio",
          name: "context-sort",
          id: "context-sort_rarest",
          label: "Rarest",
        },
        {
          type: "radio",
          name: "context-sort",
          id: "context-sort_points",
          label: "Points",
        },
        {
          type: "radio",
          name: "context-sort",
          id: "context-sort_retropoints",
          label: "Retropoints",
        },
        {
          type: "radio",
          name: "context-sort",
          id: "context-sort_default",
          label: "Default",
        },
        {
          type: "checkbox",
          name: "context-reverse-sort",
          id: "context-reverse-sort",
          label: "Reverse",
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
        },
        {
          type: "radio",
          name: "context-filter",
          id: "context_filter-earned",
          label: "Earned",
        },
        {
          type: "radio",
          name: "context-filter",
          id: "context_filter-all",
          label: "All",
        },
        {
          type: "checkbox",
          name: "context-reverse-filter",
          id: "context-reverse-filter",
          label: "Reverse",
        },
        {
          type: "checkbox",
          name: "context-hide-filtered",
          id: "context-hide-filtered",
          label: "Hide filtered",
        },
      ],
    },
    {
      label: "Achieve style",
      subMenu: [
        {
          prefix: "Min size",
          type: "input-number",
          id: "context-menu_min-size",
          label: "Min size",
        },
        {
          prefix: "Max size",
          type: "input-number",
          id: "context-menu_max-size",
          label: "Max size",
        },
        {
          type: "checkbox",
          name: "context_stretch-achieves",
          id: "context_stretch-achieves",
          label: "Stretch",
        },
      ],
    },
    {
      label: "Show background",
      type: "checkbox",
      name: "context_show-bg",
      id: "context_show-bg",
    },
  ];
  set SORT_METHOD(value) {
    config.sortAchievementsBy = value;
  }
  get SORT_METHOD() {
    return sortBy[config.sortAchievementsBy];
  }
  // filterBy.all;
  set FILTER_METHOD(value) {
    config.filterAchievementsBy = value;
  }
  get FILTER_METHOD() {
    return filterBy[config.filterAchievementsBy];
  }
  get HIDE_FILTERED() {
    return config._cfg.settings.hideFiltered ?? false;
  }
  set HIDE_FILTERED(value) {
    console.log(value);
    config._cfg.settings.hideFiltered = value;
    config.writeConfiguration();
  }
  get REVERSE_SORT() {
    return config.reverseSort;
  }
  set REVERSE_SORT(value) {
    config.reverseSort = value;
  }
  get REVERSE_FILTER() {
    return config.reverseFilter;
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
    // Елементи блока досягнень
    this.section = document.querySelector(
      `#achievements_section${this.sectionCode}`
    ); // Секція блока досягнень
    this.contextMenu = this.generateContextMenu(this.contextMenuItems);
    this.section.appendChild(this.contextMenu);
    this.bgVisibilityCheckbox = this.section.querySelector(
      `#context_show-bg${this.sectionCode}`
    );
    this.stretchButton = this.section.querySelector(
      `#context_stretch-achieves${this.sectionCode}`
    );
    this.minimumWidthInput = this.section.querySelector(
      `#context-menu_min-size${this.sectionCode}`
    );
    this.maximumWidthInput = this.section.querySelector(
      `#context-menu_max-size${this.sectionCode}`
    );

    this.sortByLatestButton = this.section.querySelector(
      `#context-sort_latest${this.sectionCode}`
    ); // Кнопка сортування за останніми
    this.sortByEarnedButton = this.section.querySelector(
      `#context-sort_rarest${this.sectionCode}`
    ); // Кнопка сортування за заробленими
    this.sortByPointsButton = this.section.querySelector(
      `#context-sort_points${this.sectionCode}`
    ); // Кнопка сортування за балами
    this.sortByTruepointsButton = this.section.querySelector(
      `#context-sort_retropoints${this.sectionCode}`
    );

    this.sortByDefaultButton = this.section.querySelector(
      `#context-sort_default${this.sectionCode}`
    ); // Кнопка сортування за замовчуванням
    this.reverseSortButton = this.section.querySelector(
      `#context-reverse-sort${this.sectionCode}`
    ); // Чекбокс сортування по зворотньому порядку

    this.filterByAllRadio = this.section.querySelector(
      `#context_filter-all${this.sectionCode}`
    ); // Фільтр за всіма
    this.filterByEarnedRadio = this.section.querySelector(
      `#context_filter-earned${this.sectionCode}`
    ); // Фільтр за заробленими
    this.filterByMissableRadio = this.section.querySelector(
      `#context_filter-missable${this.sectionCode}`
    ); // Фільтр за всіма
    this.filterByNotEarnedRadio = this.section.querySelector(
      `#filter-by-not-earned${this.sectionCode}`
    );
    this.reverseFilterCheckbox = this.section.querySelector(
      `#context-reverse-filter${this.sectionCode}`
    ); // Фільтр за не заробленими
    this.hideFilteredCheckbox = this.section.querySelector(
      `#context-hide-filtered${this.sectionCode}`
    );
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
    this.bgVisibilityCheckbox.addEventListener("change", (e) => {
      config.achivsBgVisibility = this.bgVisibilityCheckbox.checked;
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
      config.reverseSort = this.reverseSortButton.checked;
      // Застосовує сортування та оновлює інтерфейс
      this.applySorting();
    });
    // Додає подію кліку для фільтрування
    this.filterByEarnedRadio.addEventListener("click", (e) => {
      e.stopPropagation();
      this.FILTER_METHOD = UI.filterMethods.earned;
      this.applyFilter();
    });
    this.reverseFilterCheckbox.addEventListener("change", (e) => {
      config.reverseFilter = this.reverseFilterCheckbox.checked;
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
    if (!config.ui.achievements_section) {
      UI.switchSectionVisibility(this);
    }
    this.container.style.height = config.stretchAchievements ? "100%" : "auto";
    this.hideFilteredCheckbox.checked = this.HIDE_FILTERED;
    this.bgVisibilityCheckbox.checked = config.achivsBgVisibility;

    switch (config.filterAchievementsBy) {
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
    this.reverseFilterCheckbox.checked = config.reverseFilter;
    switch (config.sortAchievementsBy) {
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
      default:
      case UI.sortMethods.default:
        this.sortByDefaultButton.checked = true;
        break;
    }

    this.maximumWidthInput.value = config.ACHIV_MAX_SIZE;
    this.minimumWidthInput.value = config.ACHIV_MIN_SIZE;
    this.reverseSortButton.checked = config.reverseSort == -1;
    this.stretchButton.checked = config.stretchAchievements;

    config.achivsBgVisibility ? this.section.classList.add("bg-visible") : "";
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

  generateContextMenu(menuItems, isSubmenu = false) {
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
          this.generateContextMenu(menuItem.subMenu, true)
        );
      } else {
        switch (menuItem.type) {
          case "checkbox":
          case "radio":
            menuElement.innerHTML += `
            <input type="${menuItem.type}" name="${menuItem.name}" id="${menuItem.id}${this.sectionCode}"></input>
            <label class="context-menu_${menuItem.type}" for="${menuItem.id}${this.sectionCode}">${menuItem.label}</label>
            `;
            break;
          case "input-number":
            menuElement.innerHTML += `
            ${menuItem.prefix}
            <input class="context-menu_${menuItem.type}" id="${menuItem.id}${this.sectionCode}" type="number">px</input>
            `;
          default:
            break;
        }
      }
      contextElement.appendChild(menuElement);
    });
    contextElement.addEventListener("click", (e) => e.stopPropagation());
    contextElement.addEventListener("mousedown", (e) => e.stopPropagation());
    return contextElement;
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
    ${
      DateEarnedHardcore
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
    if (this.REVERSE_SORT == -1) {
      this.container.appendChild(element);
    } else {
      this.container.insertBefore(element, this.container.firstChild);
    }
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
      achivWidth > config.ACHIV_MIN_SIZE
    );
    achivWidth =
      achivWidth < config.ACHIV_MIN_SIZE
        ? config.ACHIV_MIN_SIZE
        : achivWidth > config.ACHIV_MAX_SIZE
        ? config.ACHIV_MAX_SIZE
        : achivWidth;
    // Встановлення розміру кожного досягнення в блоку
    // container.style.gridTemplateColumns = `repeat(${colsCount}, ${achivWidth}px)`;
    // achivs.forEach((achiv) => (achiv.style.height = achivWidth + "px"));
    container.style.setProperty("--achiv-height", achivWidth + "px");
  }
  applySorting() {
    let achivsArray = [...this.container.querySelectorAll(".achiv-block")];
    achivsArray.sort(
      (a, b) => this.SORT_METHOD(a.dataset, b.dataset) * this.REVERSE_SORT
    );
    this.container.innerHTML = "";
    achivsArray.forEach((achiv) => this.container.appendChild(achiv));
  }
  applyFilter() {
    let achivsArray = [...this.container.querySelectorAll(".achiv-block")];
    achivsArray.forEach((a) => {
      a.classList.remove("removed", "hidden");
      a.classList.toggle(
        this.HIDE_FILTERED ? "removed" : "hidden",
        !this.FILTER_METHOD(a.dataset) ^ this.REVERSE_FILTER
      );
    });
  }
  close() {
    ui.buttons.achievements.click();
  }
}
class AchievementsBlockTemplate extends AchievementsBlock {
  set SORT_METHOD(value) {
    config.ui[`achievements_section${this.sectionCode}`].sortAchievementsBy =
      value;
    this.sortAchievementsBy = value;
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
    this._filterAchievementsBy = value;
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

    <button class="header-button header-icon" onclick="ui.achievementsBlockTemplates[${
      this.id - 1
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
    this.textBlock.addEventListener("mousedown", (e) => {
      UI.moveEvent(this.section, e);
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
  updateProgress({ points = 0, totalPoints, achievements }) {
    let achievedCount = 0; // Лічильник досягнень
    let totalCount = 0; // Загальна кількість досягнень
    const width = this.section.clientWidth || 0; // Отримання ширини блока

    // Перевірка наявності досягнень
    if (achievements) {
      // Підрахунок кількості досягнень та набраних балів
      Object.values(achievements).forEach((achievement) => {
        totalCount++; // Збільшення загальної кількості досягнень
        if (achievement.DateEarnedHardcore) {
          points += achievement.Points; // Додавання балів
          achievedCount++; // Збільшення кількості досягнень
        }
      });
      // Збереження загальної кількості досягнень та балів у датасет
      this.progresBar.dataset.totalCount = totalCount;
      this.progresBar.dataset.totalPoints = totalPoints;
    } else {
      // Оновлення значень у випадку відсутності досягнень
      achievedCount = parseInt(this.progresBar.dataset.achievedCount) + 1 || 0;
      totalCount = parseInt(this.progresBar.dataset.totalCount) || 0;
      points = points
        ? parseInt(this.progresBar.dataset.points) + parseInt(points)
        : 0;
      totalPoints = parseInt(this.progresBar.dataset.totalPoints) || 0;
    }

    // Оновлення даних про досягнення та бали у датасет
    this.progresBar.dataset.achievedCount = achievedCount;
    this.progresBar.dataset.points = points;

    // Обчислення прогресу за балами та за кількістю досягнень
    const completionByPoints = points / totalPoints || 0;
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
    this.progressStatusText.innerText = completionByPointsPercents;
    ui.gameCard.completion.innerText = `${completionByPointsPercents} of points [${completionByCountPercent}]`;
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
  constructor() {
    this.initializeElements();
    this.addEvents();
    if (!config.ui.game_section) {
      UI.switchSectionVisibility(this);
    }
    //-----------

    // Додавання подій для пересування вікна картки гри
  }
  initializeElements() {
    // Елементи інформації про гру
    this.section = document.querySelector(".game-card_section"); // Контейнер інформації про гру
    this.header = document.querySelector("#game-card-header"); // Заголовок гри
    this.preview = document.querySelector("#game-card-image"); // Зображення гри
    this.platform = document.querySelector("#game-card-platform"); // Платформа гри
    this.developer = document.querySelector("#game-card-developer"); // Розробник гри
    this.publisher = document.querySelector("#game-card-publisher"); // Видавець гри
    this.genre = document.querySelector("#game-card-genre"); // Жанр гри
    this.released = document.querySelector("#game-card-released"); // Дата випуску гри
    this.completion = document.querySelector("#game-card-completion"); // Статус завершення гри
  }
  addEvents() {
    this.section.addEventListener("mousedown", (e) => {
      UI.moveEvent(this.section, e);
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
    this.platform.innerText = ConsoleName;
    this.developer.innerText = Developer || "-";
    this.publisher.innerText = Publisher || "-";
    this.genre.innerText = Genre || "-";
    this.released.innerText = Released || "-";
    // this.completion.innerText = `${UserCompletion} [${UserCompletionHardcore}]`;
  }
  close() {
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
          <li class="awarded-games beaten-softcore" title="beaten softcore" onclick="ui.awards.filterAwards('${
            this.awardTypes.beatenSoftcore
          }')">${beatenSoftcore}</li>
          <li class="awarded-games beaten"  title="beaten"  onclick="ui.awards.filterAwards('${
            this.awardTypes.beatenHardcore
          }')">${beaten}</li>
          <li class="awarded-games completed"  title="completed" onclick="ui.awards.filterAwards('${
            this.awardTypes.completion
          }')">${compleated}</li>
          <li class="awarded-games mastered"  title="mastered" onclick="ui.awards.filterAwards('${
            this.awardTypes.mastery
          }')">${mastered}</li>
        </ul>
        <button class="expand-awards_button" onclick="ui.awards.expandAwards(this)"> </button>
        <ul class="awarded-games_list  ${
          consoleName == "Total" ? "" : "hidden"
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
  set SORT_METHOD(value) {
    config.sortTargetBy = value;
  }
  get SORT_METHOD() {
    return sortBy[config.sortTargetBy];
  }
  // filterBy.all;
  set FILTER_METHOD(value) {
    config.filterTargetBy = value;
  }
  get FILTER_METHOD() {
    return filterBy[config.filterTargetBy];
  }
  constructor() {
    this.initializeElements();
    this.setValues();
    this.addEvents();
  }
  initializeElements() {
    this.section = document.querySelector("#target_section");
    this.header = document.querySelector(".target-header_container");
    this.container = document.querySelector(".target-container");

    this.autoclearCheckbox = document.querySelector("#auto-clear-target");
    this.autoClearInput = document.querySelector("#auto-clear-target-time");
    this.autofillCheckbox = document.querySelector("#auto-fill-target");

    this.sortByPointsRadio = document.querySelector("#target-sort-points");
    this.sortByTruepointsRadio = document.querySelector(
      "#target-sort-truepoints"
    );
    this.sortByRarestRadio = document.querySelector("#target-sort-rarest");
    this.sortByDefaultRadio = document.querySelector("#target-sort-default");
    this.sortReverseCheckbox = document.querySelector("#target-reverse-sort");

    this.filterByMissableRadio = document.querySelector(
      "#target-filter-missable"
    );
    this.filterByAllRadio = document.querySelector("#target-filter-all");
    this.moveToTopCheckbox = document.querySelector("#target-move-to-top");

    this.resizer = document.querySelector("#target-resizer");
  }
  setValues() {
    if (!config.ui.target_section) {
      UI.switchSectionVisibility(this);
    }
    this.autoClearInput.value = config.autoClearTargetTime;
    this.autoclearCheckbox.checked = config.autoClearTarget;
    this.autofillCheckbox.checked = config.autoFillTarget;

    switch (config.filterTargetBy) {
      case UI.filterMethods.missable:
        this.filterByMissableRadio.checked = true;
        break;
      default:
        this.filterByAllRadio.checked = true;
    }
    switch (config.sortTargetBy) {
      case UI.sortMethods.earnedCount:
        this.sortByRarestRadio.checked = true;
        break;
      case UI.sortMethods.points:
        this.sortByPointsRadio.checked = true;
        break;
      case UI.sortMethods.truepoints:
        this.sortByTruepointsRadio.checked = true;
        break;
      default:
        this.filterByAllRadio.checked = true;
    }
    this.sortReverseCheckbox.checked = config.reverseSortTarget;
    this.moveToTopCheckbox.checked = config.targetMoveToTop;
  }
  addEvents() {
    this.autoclearCheckbox.addEventListener("change", (e) => {
      e.stopPropagation();
      config.autoClearTarget = this.autoclearCheckbox.checked;
    });
    this.autoClearInput.addEventListener("change", (e) => {
      e.stopPropagation();
      config.autoClearTargetTime = this.autoClearInput.value;
    });
    this.autofillCheckbox.addEventListener("change", (e) => {
      e.stopPropagation();
      config.autoFillTarget = this.autofillCheckbox.checked;
    });
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
    this.sortByDefaultRadio.addEventListener("change", (e) => {
      this.SORT_METHOD = UI.sortMethods.default;
      this.applySort();
    });
    this.sortByRarestRadio.addEventListener("change", (e) => {
      this.SORT_METHOD = UI.sortMethods.earnedCount;
      this.applySort();
    });
    this.sortByPointsRadio.addEventListener("change", (e) => {
      this.SORT_METHOD = UI.sortMethods.points;
      this.applySort();
    });
    this.sortByTruepointsRadio.addEventListener("change", (e) => {
      this.SORT_METHOD = UI.sortMethods.truepoints;
      this.applySort();
    });
    this.sortReverseCheckbox.addEventListener("change", (e) => {
      config.reverseSortTarget = this.sortReverseCheckbox.checked;
      this.applySort();
    });
    this.filterByMissableRadio.addEventListener("change", (e) => {
      this.FILTER_METHOD = UI.filterMethods.missable;
      this.applyFilter();
    });
    this.filterByAllRadio.addEventListener("change", (e) => {
      e.stopPropagation();
      this.FILTER_METHOD = UI.filterMethods.all;
      this.applyFilter();
    });
    this.moveToTopCheckbox.addEventListener("change", (e) => {
      config.targetMoveToTop = this.moveToTopCheckbox.checked;
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
    targetElement.dataset.type = type;
    targetElement.dataset.Points = Points;
    targetElement.dataset.TrueRatio = TrueRatio;
    targetElement.dataset.NumAwardedHardcore = NumAwardedHardcore;
    if (isEarned) {
      targetElement.classList.add("earned");
      if (isHardcoreEarned) {
        targetElement.classList.add("hardcore");
      }
    }

    targetElement.dataset.achivId = ID;

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
                <div class=" condition ${
                  type ?? "none"
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
    this.applyFilter();
    this.applySort();
  }
  moveToTop(element) {
    element && config.targetMoveToTop ? this.container.prepend(element) : "";
  }
  applyFilter() {
    const elements = this.container.querySelectorAll(".target-achiv");
    elements.forEach((element) => {
      element.classList.toggle("hidden", !this.FILTER_METHOD(element.dataset));
    });
  }
  applySort() {
    const elements = [...this.container.querySelectorAll(".target-achiv")];
    this.container.innerHTML = "";
    elements
      .sort(
        (a, b) =>
          this.SORT_METHOD(a.dataset, b.dataset) * config.reverseSortTarget
      )
      .forEach((element) => {
        this.container.appendChild(element);
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
  fillItems() {
    ui.achievementsBlock.container
      .querySelectorAll(".achiv-block")
      .forEach((achievement) => {
        if (!achievement.classList.contains("hardcore")) {
          achievement.querySelector(".add-to-target").click();
        }
      });
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
      this.section.querySelector(".submit-login").classList.add("verified");
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
    const dateA2 = a.DateEarned ? new Date(a.DateEarned) : -Infinity;
    const dateB2 = b.DateEarned ? new Date(b.DateEarned) : -Infinity;
    const maxDateA = Math.max(dateA, dateA2);
    const maxDateB = Math.max(dateB, dateB2);
    return dateB - dateA; // Повертає різницю дат
  },

  earnedCount: (a, b) => b.NumAwardedHardcore - a.NumAwardedHardcore,

  points: (a, b) => a.Points - b.Points,

  truepoints: (a, b) => a.TrueRatio - b.TrueRatio,

  default: (a, b) => a.achivId - b.achivId,
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
