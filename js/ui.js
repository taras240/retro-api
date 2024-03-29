class UI {
  static set REVERSE_SORT(value) {
    config.reverseSort = value;
  }
  static get REVERSE_SORT() {
    return config.reverseSort;
  }
  static set SORT_METHOD(value) {
    config.sortAchievementsBy = value;
  }
  static get SORT_METHOD() {
    return sortBy[config.sortAchievementsBy];
  }
  // filterBy.all;
  static set FILTER_METHOD(value) {
    config.filterAchievementsBy = value;
  }
  static get FILTER_METHOD() {
    return filterBy[config.filterAchievementsBy];
  }
  static filterMethods = {
    all: "all",
    earned: "earned",
    notEarned: "notEarned",
  };
  static sortMethods = {
    latest: "latest",
    earnedCount: "earnedCount",
    points: "points",
    default: "default",
  };
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

  constructor() {
    //Завантаження секцій з jsx файлів
    loadSections().then(() => {
      // Ініціалізація елементів
      this.initializeElements();

      // Додавання подій
      this.addEvents();

      //Встановлення розмірів і розміщення елементів
      this.setPositions();

      //Встановлення збережених значень для полів вводу
      this.setValues();

      //Оновлення кольорів
      UI.updateColors();

      //Оновлення ачівментсів
      if (config.identConfirmed) {
        this.settings.checkIdButton.click();
      }
    });
  }

  initializeElements() {
    this.about = {
      section: document.querySelector("#help_section"),
    };

    this.loginCard = new LoginCard();
    this.target = new Target();
    this.achievementsBlock = new AchievementsBlock();
    this.buttons = new ButtonPanel();
    this.settings = new Settings();
    this.statusPanel = new StatusPanel();
    this.awards = new Awards();
    this.gameCard = new GameCard();
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
  }

  setValues() {
    // Встановити ключ API з об'єкта ідентифікації користувача
    this.loginCard.apiKey.value = config.API_KEY;

    // Встановити значення логіну та API з об'єкта ідентифікації користувача
    this.loginCard.userName.value = config.USER_NAME;
    this.loginCard.userImage.src = config.userImageSrc;

    if (config.identConfirmed) {
      this.loginCard.section
        .querySelector(".submit-login")
        .classList.add("verified");
    }
    switch (config.filterAchievementsBy) {
      case UI.filterMethods.all:
        this.settings.filterByAllRadio.checked = true;
        break;
      case UI.filterMethods.earned:
        this.settings.filterByEarnedRadio.checked = true;
        break;
      case UI.filterMethods.notEarned:
        this.settings.filterByNotEarnedRadio.checked = true;
        break;
      default:
        this.settings.filterByAllRadio.checked = true;
        break;
    }
    switch (config.sortAchievementsBy) {
      case UI.sortMethods.default:
        this.settings.sortByDefaultButton.checked = true;
        break;
      case UI.sortMethods.earnedCount:
        this.settings.sortByEarnedButton.checked = true;
        break;
      case UI.sortMethods.latest:
        this.settings.sortByLatestButton.checked = true;
        break;
      case UI.sortMethods.points:
        this.settings.sortByPointsButton.checked = true;
        break;
      default:
      case UI.sortMethods.default:
        this.settings.sortByDefaultButton.checked = true;
        break;
    }

    this.settings.reverseSortButton.checked = config.reverseSort == -1;
    this.settings.stretchButton.checked = config.stretchAchievements;
    this.achievementsBlock.container.style.height = config.stretchAchievements
      ? "100%"
      : "auto";

    // this.settings.stretchButton.classList
    // Отримати ідентифікатор гри з localStorage та встановити його значення
    this.settings.gameID.value = config.gameID;

    this.settings.targetUserInput.value = config.targetUser ?? config.USER_NAME;
    this.settings.targetUserInput.setAttribute(
      "placeholder",
      config.USER_NAME || "your username if empty"
    );
    this.settings.updateInterval.value = config.updateDelay;

    this.settings.maximumWidthInput.value = config.ACHIV_MAX_SIZE;
    this.settings.minimumWidthInput.value = config.ACHIV_MIN_SIZE;

    this.settings.mainColorInput.value = config.mainColor;
    this.settings.secondaryColorInput.value = config.secondaryColor;
    this.settings.accentColorInput.value = config.accentColor;
    this.settings.fontColorInput.value = config.fontColor;
    this.settings.selectionColorInput.value = config.selectionColor;
    this.settings.colorPresetSelector.value = config.colorsPreset;
    this.settings.colorPresetSelector.dispatchEvent(new Event("change"));

    if (!this.achievementsBlock.section.classList.contains("hidden")) {
      this.buttons.achievements.classList.add("checked");
    }
    if (!this.settings.section.classList.contains("hidden")) {
      this.buttons.settings.classList.add("checked");
    }
    if (!this.loginCard.section.classList.contains("hidden")) {
      this.buttons.login.classList.add("checked");
    }
    if (!this.target.section.classList.contains("hidden")) {
      this.buttons.target.classList.add("checked");
    }
    if (!this.gameCard.section.classList.contains("hidden")) {
      this.buttons.gameCard.classList.add("checked");
    }
  }
  addEvents() {}
  updateGameInfo({
    Title,
    ConsoleName,
    ImageIcon,
    NumAchievements,
    UserCompletionHardcore,
    points_total,
    Achievements,
  }) {
    const { gamePreview, gameTitle, gamePlatform, gameAchivsCount } =
      ui.statusPanel;

    gamePreview.setAttribute(
      "src",
      `https://media.retroachievements.org${ImageIcon}`
    );
    gameTitle.innerText = Title || "Some game name";
    gamePlatform.innerText = ConsoleName || "";
    ui.statusPanel.updateProgress({
      totalPoints: points_total,
      completion: UserCompletionHardcore,
      achievements: Achievements,
    });
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

    // Оновлюємо ширину та висоту контейнера з урахуванням змін
    section.style.width = `${startWidth + widthChange}px`;
    section.style.height = `${startHeight + heightChange}px`;
  }
  static moveEvent(section, e) {
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
    section.style.left = e.clientX - offsetX + "px";
    section.style.top = e.clientY - offsetY + "px";
  }

  static addDraggingEventForElements(container) {
    const dragAndDropItems = container;

    new Sortable(dragAndDropItems, {
      animation: 150,
      // chosenClass: "target-achiv-chosen",
      // dragClass: "target-achiv-drag",
    });
  }

  static switchSectionVisibility(section) {
    section.classList.toggle("hidden");
    config.setNewPosition({
      id: section.id,
      hidden: section.classList.contains("hidden"),
    });
  }
}

class AchievementsBlock {
  constructor() {
    // Елементи блока досягнень
    this.section = document.querySelector("#achievements_section"); // Секція блока досягнень
    this.container = document.querySelector(".achievements-container"); //Контейнер  з досягненнями
    this.resizer = document.querySelector("#achivs-resizer"); // Ресайзер блока досягнень
    // Додавання подій для пересування вікна ачівментсів
    this.section.addEventListener("mousedown", (e) => {
      UI.moveEvent(this.section, e);
    });
    this.resizer.addEventListener("mousedown", (event) => {
      event.stopPropagation();
      this.section.classList.add("resized");
      UI.resizeEvent({
        event: event,
        section: this.section,
        postFunc: () => ui.settings.fitSizeVertically(),
      });
    });
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
    this.displaySortedAchievements(achivs);

    // Підгонка розміру досягнень
    ui.settings.fitSizeVertically();
  }

  displaySortedAchievements(achievementsObject) {
    Object.values(achievementsObject.Achievements)
      .filter((a) => UI.FILTER_METHOD(a))
      .sort((a, b) => UI.SORT_METHOD(a, b) * UI.REVERSE_SORT)
      .forEach((achievement) => {
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
    const { ID, Points, isEarned, isHardcoreEarned, prevSrc } = achievement;

    let achivElement = document.createElement("li");
    achivElement.classList.add("achiv-block");

    if (isEarned) {
      achivElement.classList.add("earned");
      if (isHardcoreEarned) {
        achivElement.classList.add("hardcore");
      }
    }

    achivElement.dataset.achivId = ID;
    achivElement.dataset.points =
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
      this.fixDetailsPosition(achivDetails);
      achivElement.addEventListener("mouseleave", (e) => {
        setTimeout(
          () => achivDetails.classList.remove("left-side", "top-side"),
          200
        );
      });
    });

    achivElement.addEventListener("mousedown", (e) => e.stopPropagation());
    toTargetButton.addEventListener("click", () => {
      ui.target.addAchieveToTarget(achievement);
    });

    return achivElement;
  }
  generateAchivDetails({
    Title,
    Description,
    DateEarned,
    Points,
    NumAwardedHardcore,
    totalPlayers,
  }) {
    let detailsElement = document.createElement("div");
    detailsElement.classList.add("achiv-details-block");
    detailsElement.innerHTML = `
              <h3>${Title}</h3>
              <p>${Description}</p>
              <p>Earned by ${NumAwardedHardcore} of ${totalPlayers} players</p>
              <p class="points">${Points} points</p>
              ${DateEarned ? "<p>Earned " + DateEarned + "</p>" : ""}
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
}

class ButtonPanel {
  constructor() {
    this.section = document.querySelector("#buttons_section");
    this.settings = document.querySelector("#open-settings-button");
    this.achievements = document.querySelector("#open-achivs-button");
    this.login = document.querySelector("#open-login-button");
    this.about = document.querySelector("#open-about-button");
    this.gameCard = document.querySelector("#open-game-card-button");
    this.target = document.querySelector("#open-target-button");
  }
}
class StatusPanel {
  constructor() {
    this.section = document.querySelector("#update-section");
    this.gamePreview = document.querySelector("#game-preview"); // Іконка гри
    this.gameTitle = document.querySelector("#game-title"); // Заголовок гри
    this.gamePlatform = document.querySelector("#game-platform"); // Платформа гри
    this.watchButton = document.querySelector("#watching-button"); // Кнопка спостереження за грою
    this.progresBar = document.querySelector("#status-progress-bar");

    // Додаємо обробник події 'click' для кнопки автооновлення
    this.watchButton.addEventListener("click", (e) => {
      e.stopPropagation();
      // Перевіряємо стан кнопки та відповідно запускаємо або припиняємо автооновлення
      if (this.watchButton.classList.contains("active")) {
        stopWatching();
      } else {
        apiWorker
          .getProfileInfo({})
          .then((resp) => {
            ui.settings.gameID.value = resp.LastGameID;
            config.gameID = resp.LastGameID;
          })
          .then(() => startWatching());
      }
    });
    this.section.addEventListener("mousedown", (e) => {
      UI.moveEvent(this.section, e);
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
    const completionByPoints = (width * points) / totalPoints || 0;
    const completionByCount = (width * achievedCount) / totalCount || 0;

    // Встановлення стилів прогресу
    this.progresBar.style.setProperty(
      "--progress-points",
      completionByPoints + "px"
    );
    this.progresBar.style.setProperty(
      "--progress-count",
      completionByCount + "px"
    );
  }
}
class Settings {
  constructor() {
    // Елементи налаштувань
    this.section = document.querySelector(".prefs_section"); //* Контейнер налаштувань
    this.header = document.querySelector(".prefs-header-container");
    this.updateInterval = document.querySelector("#update-time"); // Поле введення інтервалу оновлення
    this.sortByLatestButton = document.querySelector("#sort-by-latest"); // Кнопка сортування за останніми
    this.sortByEarnedButton = document.querySelector("#sort-by-earned"); // Кнопка сортування за заробленими
    this.sortByPointsButton = document.querySelector("#sort-by-points"); // Кнопка сортування за балами
    this.sortByDefaultButton = document.querySelector("#sort-by-default"); // Кнопка сортування за замовчуванням
    this.reverseSortButton = document.querySelector("#reverse-sort"); // Чекбокс сортування по зворотньому порядку
    this.filterByAllRadio = document.querySelector("#filter-by-all"); // Фільтр за всіма
    this.filterByEarnedRadio = document.querySelector("#filter-by-earned"); // Фільтр за заробленими
    this.filterByNotEarnedRadio = document.querySelector(
      "#filter-by-not-earned"
    ); // Фільтр за не заробленими
    //!-------------------------------[ COLORS ]-----------------------------
    this.mainColorInput = document.querySelector("#main-color-input");
    this.secondaryColorInput = document.querySelector("#secondary-color-input");
    this.accentColorInput = document.querySelector("#accent-color-input");
    this.fontColorInput = document.querySelector("#font-color-input");
    this.selectionColorInput = document.querySelector("#selection-color-input"); //
    this.colorPresetSelector = document.querySelector(
      "#color-preset-selection"
    );
    //!-----------------------------------------

    this.stretchButton = document.querySelector("#stretch-achivs");
    this.minimumWidthInput = document.querySelector("#achiv-min-width");
    this.maximumWidthInput = document.querySelector("#achiv-max-width");
    this.targetUserInput = document.querySelector("#target-user");
    this.gameID = document.querySelector("#game-id"); // Поле введення ідентифікатора гри
    this.getGameIdButton = document.querySelector(".get-id-button"); // Кнопка отримання ідентифікатора гри
    this.checkIdButton = document.querySelector(".check-id-button"); // Кнопка перевірки ідентифікатора гри
    // this.gameAchivsCount = document.querySelector("#game-achivs-count"); // Кількість досягнень гри
    //
    this.addEvents();
  }
  addEvents() {
    // Додаємо обробник події 'change' для поля введення інтервалу оновлення
    this.updateInterval.addEventListener("change", () => {
      // Оновлюємо інтервал оновлення
      config.updateDelay = this.updateInterval.value || 5;
    });

    // Додаємо обробник події 'change' для поля введення ідентифікатора гри
    this.gameID.addEventListener("change", () => {
      // Оновлюємо ідентифікатор гри
      config.gameID = this.gameID.value;
    });

    // Додає подію кліку для сортування за замовчуванням
    this.sortByDefaultButton.addEventListener("click", (e) => {
      e.stopPropagation();
      // Встановлює метод сортування за замовчуванням
      UI.SORT_METHOD = UI.sortMethods.default;
      // Застосовує сортування та оновлює інтерфейс
      this.applySorting();
    });

    // Додає подію кліку для сортування за отриманням досягнення
    this.sortByEarnedButton.addEventListener("click", (e) => {
      e.stopPropagation();
      // Встановлює метод сортування за отриманням досягнення
      UI.SORT_METHOD = UI.sortMethods.earnedCount;
      // Застосовує сортування та оновлює інтерфейс
      this.applySorting();
    });

    // Додає подію кліку для сортування за датою отримання
    this.sortByLatestButton.addEventListener("click", (e) => {
      e.stopPropagation();
      // Встановлює метод сортування за датою отримання
      UI.SORT_METHOD = UI.sortMethods.latest;
      // Застосовує сортування та оновлює інтерфейс
      this.applySorting();
    });

    // Додає подію кліку для сортування за кількістю балів
    this.sortByPointsButton.addEventListener("click", (e) => {
      e.stopPropagation();
      // Встановлює метод сортування за кількістю балів
      UI.SORT_METHOD = UI.sortMethods.points;
      // Застосовує сортування та оновлює інтерфейс
      this.applySorting();
    });
    this.reverseSortButton.addEventListener("click", (e) => {
      e.stopPropagation();
      // Встановлює reverse сортування
      UI.REVERSE_SORT = this.reverseSortButton.checked;
      // Застосовує сортування та оновлює інтерфейс
      this.applySorting();
    });
    // Додає подію кліку для фільтрування
    this.filterByEarnedRadio.addEventListener("click", (e) => {
      e.stopPropagation();
      UI.FILTER_METHOD = UI.filterMethods.earned;
      this.applyFilter();
    });
    this.filterByNotEarnedRadio.addEventListener("click", (e) => {
      e.stopPropagation();
      UI.FILTER_METHOD = UI.filterMethods.notEarned;
      this.applyFilter();
    });
    this.filterByAllRadio.addEventListener("click", (e) => {
      e.stopPropagation();
      UI.FILTER_METHOD = UI.filterMethods.all;
      this.applyFilter();
    });

    this.stretchButton.addEventListener("click", (e) => {
      config.stretchAchievements = this.stretchButton.checked;
      ui.achievementsBlock.container.style.height = config.stretchAchievements
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

    // Додавання подій для пересування вікна налаштувань
    this.header.addEventListener("mousedown", (e) => {
      UI.moveEvent(this.section, e);
    });
  }
  applySorting() {
    // Клікає на кнопку перевірки ідентифікатора для виконання сортування
    this.checkIdButton.click();
  }
  applyFilter() {
    // filterButton.parentNode
    //   .querySelectorAll(".checked")
    //   .forEach((child) => child.classList.remove("checked"));
    // filterButton.classList.add("checked");
    // Клікає на кнопку перевірки ідентифікатора для виконання сортування
    this.checkIdButton.click();
  }

  // Автопідбір розміру значків ачівментсів
  fitSizeVertically() {
    // Отримання посилання на блок досягнень та його дочірні елементи
    const { section, container } = ui.achievementsBlock;
    const achivs = Array.from(container.children);
    const achivsCount = achivs.length;

    // Перевірка, чи є елементи в блоці досягнень
    if (achivsCount === 0) return;

    // Отримання розмірів вікна блоку досягнень
    const windowHeight = section.clientHeight - 2;
    const windowWidth = section.clientWidth - 2;

    // Початкова ширина досягнення для розрахунку
    let achivWidth = Math.floor(
      Math.sqrt((windowWidth * windowHeight) / achivsCount)
    );

    let rowsCount, colsCount;
    // Цикл для знаходження оптимального розміру досягнень
    do {
      achivWidth--;
      rowsCount = Math.floor(windowHeight / achivWidth);
      colsCount = Math.floor(windowWidth / achivWidth);
    } while (rowsCount * colsCount < achivsCount && achivWidth > 0);
    achivWidth =
      achivWidth < config.ACHIV_MIN_SIZE
        ? config.ACHIV_MIN_SIZE
        : achivWidth > config.ACHIV_MAX_SIZE
        ? config.ACHIV_MAX_SIZE
        : achivWidth;
    // Встановлення розміру кожного досягнення в блоку
    achivs.forEach((achiv) => (achiv.style.width = achivWidth + "px"));
  }
}

class GameCard {
  constructor() {
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
    //-----------

    // Додавання подій для пересування вікна картки гри
    this.section.addEventListener("mousedown", (e) => {
      UI.moveEvent(this.section, e);
    });
  }
  updateGameCardInfo({
    Title,
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
    this.preview.setAttribute(
      "src",
      `https://media.retroachievements.org${ImageBoxArt}`
    );
    this.platform.innerText = ConsoleName;
    this.developer.innerText = Developer || "-";
    this.publisher.innerText = Publisher || "-";
    this.genre.innerText = Genre || "-";
    this.released.innerText = Released || "-";
    this.completion.innerText = `${UserCompletion} [${UserCompletionHardcore}]`;
  }
}

class Awards {
  constructor() {
    this.section = document.querySelector(".awards_section"); // Контейнер інформації про гру
    this.header = document.querySelector(".awards-header_container");
    this.container = document.querySelector(".awards-content_container");
    this.resizer = document.querySelector("#awards-resizer");
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
    // console.log(userAwards);
    this.container.innerHTML = `
      <li class="console-awards all-consoles">
      <h3 class="awards-console_header">Total</h3>
      <ul class="console-awards-values ">
        <li class="awarded-games total">${userAwards.TotalAwardsCount}</li>
        <li class="awarded-games beaten-softcore">${userAwards.BeatenSoftcoreAwardsCount}</li>
        <li class="awarded-games beaten">${userAwards.BeatenHardcoreAwardsCount}</li>
        <li class="awarded-games completed">${userAwards.CompletionAwardsCount}</li>
        <li class="awarded-games mastered">${userAwards.MasteryAwardsCount}</li>
      </ul>
      <button class="expand-awards_button" onclick="ui.awards.expandAwards(this)"> </button>
      <ul class="awarded-games_list total hidden">
      </ul>
    </li>
      `;
    let gamesArray = [...userAwards.VisibleUserAwards];
    gamesArray = this.fixGamesProperties(gamesArray);

    gamesArray.forEach((game) => {
      this.container
        .querySelector(".awarded-games_list.total")
        .appendChild(this.makeGameAwardsElement(game));
    });
    const sortedGames = this.generateAwardsGroupsArray(gamesArray);
    this.generateConsolesAwards(sortedGames);
  }

  parseNewAwards({ userAwards }) {
    // Отримуємо загальний контейнер нагород
    const totalAwardsContainer = this.container.querySelector(
      ".console-awards.all-consoles"
    );

    // Визначаємо кількість нових нагород
    const newAwardsCount =
      userAwards.TotalAwardsCount -
      totalAwardsContainer.querySelector(".awarded-games.total").innerText;
    // Якщо немає нових нагород, виходимо з функції
    if (newAwardsCount < 1) return;

    // Функція для інкрементування текстових елементів
    const incrementElementsText = (args) => {
      args.forEach((element) => {
        element.innerText = Number(element.innerText) + 1;
      });
    };

    // Селектори для різних типів нагород
    const awardTypeSelectors = {
      beatenSoftcore: ".awarded-games.beaten-softcore",
      beatenHardcore: ".awarded-games.beaten",
      completion: ".awarded-games.completed",
      mastery: ".awarded-games.mastered",
      total: ".awarded-games.total",
    };

    // Фіксуємо властивості ігор і обрізаємо масив до кількості нових нагород
    const gamesArray = this.fixGamesProperties([
      ...userAwards.VisibleUserAwards,
    ]).slice(0, newAwardsCount);

    // Перебираємо масив ігор для оновлення даних та вставки нових нагород
    gamesArray.forEach((game) => {
      // Отримуємо контейнер нагород для конкретної консолі
      let consoleAwardsContainer = this.container.querySelector(
        `.console-awards[data-console-name="${game.ConsoleName}"]`
      );
      if (!consoleAwardsContainer) {
        consoleAwardsContainer = this.makeConsoleListElement({
          consoleName: game.ConsoleName,
        });
        this.container.appendChild(consoleAwardsContainer);
      }
      // Отримуємо список нагород для конкретної консолі
      const consoleAwardsList = consoleAwardsContainer.querySelector(
        ".awarded-games_list"
      );
      // Отримуємо список загальних нагород
      const totalAwardsList = totalAwardsContainer.querySelector(
        ".awarded-games_list"
      );

      // Інкрементуємо кількість нагород для кожного типу та загальну кількість нагород
      incrementElementsText([
        totalAwardsContainer.querySelector(
          awardTypeSelectors[game.awardeTypeFixed]
        ),
        consoleAwardsContainer.querySelector(
          awardTypeSelectors[game.awardeTypeFixed]
        ),
        totalAwardsContainer.querySelector(awardTypeSelectors.total),
        consoleAwardsContainer.querySelector(awardTypeSelectors.total),
      ]);

      // Вставляємо нову нагороду до списків нагород
      totalAwardsList.insertBefore(
        this.makeGameAwardsElement(game),
        totalAwardsList.firstChild
      );
      consoleAwardsList.insertBefore(
        this.makeGameAwardsElement(game),
        consoleAwardsList.firstChild
      );
    });
  }

  fixGamesProperties(gamesArray) {
    return gamesArray
      .map((game) => {
        game.awardedDate = new Date(game.AwardedAt);
        game.awardeTypeFixed =
          game.AwardType === "Game Beaten"
            ? game.AwardDataExtra === 1
              ? "beatenHardcore"
              : "beatenSoftcore"
            : game.AwardDataExtra === 1
            ? "mastery"
            : "completion";
        return game;
      })
      .sort((a, b) => {
        return b.awardedDate - a.awardedDate;
      });
  }
  generateAwardsGroupsArray(gamesArray) {
    return gamesArray.reduce((sortedGames, game) => {
      if (!sortedGames.hasOwnProperty(game.ConsoleName)) {
        sortedGames[game.ConsoleName] = [];
      }
      sortedGames[game.ConsoleName].push(game);
      return sortedGames;
    }, {});
  }
  generateConsolesAwards(sortedGames) {
    Object.getOwnPropertyNames(sortedGames).forEach((consoleName) => {
      let consoleListItem = document.createElement("li");
      consoleListItem.classList.add("console-awards");
      consoleListItem.dataset.consoleName = consoleName;
      let total = sortedGames[consoleName].length;
      const awardsCount = ({ awardType, gamesArray }) =>
        gamesArray.filter((game) => game.awardeTypeFixed === awardType).length;
      let beatenSoftcore = awardsCount({
        awardType: "beatenSoftcore",
        gamesArray: sortedGames[consoleName],
      });
      let beaten = awardsCount({
        awardType: "beatenHardcore",
        gamesArray: sortedGames[consoleName],
      });
      let compleated = awardsCount({
        awardType: "completion",
        gamesArray: sortedGames[consoleName],
      });
      let mastered = awardsCount({
        awardType: "mastery",
        gamesArray: sortedGames[consoleName],
      });
      consoleListItem.innerHTML = `
        <h3 class="awards-console_header">${consoleName}</h3>
        <ul class="console-awards-values">      
          <li class="awarded-games total">${total}</li>
          <li class="awarded-games beaten-softcore">${beatenSoftcore}</li>
          <li class="awarded-games beaten">${beaten}</li>
          <li class="awarded-games completed">${compleated}</li>
          <li class="awarded-games mastered">${mastered}</li>
        </ul>
        <button class="expand-awards_button" onclick="ui.awards.expandAwards(this)"> </button>
        <ul class="awarded-games_list hidden total">
        </ul>
        `;
      this.container.appendChild(consoleListItem);
      let gamesList = consoleListItem.querySelector(".awarded-games_list");
      sortedGames[consoleName].forEach((game) => {
        gamesList.appendChild(this.makeGameAwardsElement(game));
      });
    });
  }
  makeConsoleListElement({ consoleName }) {
    let consoleListItem = document.createElement("li");
    consoleListItem.classList.add("console-awards");
    consoleListItem.dataset.consoleName = consoleName;
    consoleListItem.innerHTML = `
        <h3 class="awards-console_header">${consoleName}</h3>
        <ul class="console-awards-values">      
          <li class="awarded-games total">0</li>
          <li class="awarded-games beaten-softcore">0</li>
          <li class="awarded-games beaten">0</li>
          <li class="awarded-games completed">0</li>
          <li class="awarded-games mastered">0</li>
        </ul>
        <button class="expand-awards_button" onclick="ui.awards.expandAwards(this)"> </button>
        <ul class="awarded-games_list hidden total">
        </ul>
        `;
    return consoleListItem;
  }
  makeGameAwardsElement(game) {
    let gameElement = document.createElement("li");
    gameElement.classList.add("awarded-game", game.awardeTypeFixed);
    gameElement.innerHTML = `
          <img class="awarded-game-preview" src="https://media.retroachievements.org${
            game.ImageIcon
          }" alt=" ">
          <h3 class="game-title">${game.Title}</h3>
          <p class="console-name">${game.ConsoleName}</p>
          <p class="awarded-date">${game.awardedDate.toLocaleDateString(
            "uk-UA"
          )}</p>
      `;
    return gameElement;
  }

  expandAwards(button) {
    const expandContent = button.nextElementSibling;
    expandContent.classList.toggle("hidden");
  }
}

class Target {
  constructor() {
    this.section = document.querySelector("#target_section");
    this.header = document.querySelector(".target-header_container");
    this.container = document.querySelector(".target-container");

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
    isEarned,
    isHardcoreEarned,
    ID,
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
              <h3 class="achiv-name">${Title}</h3>
              <p class="achiv-description">${Description}</p>
              <p class="points">${Points} points</p>
            </div>
    `;
    targetElement.addEventListener("mousedown", (e) => e.stopPropagation());
    this.container.appendChild(targetElement);

    UI.addDraggingEventForElements(this.container);
  }
  deleteFromTarget(button) {
    button.parentNode.remove();
  }
}

class LoginCard {
  constructor() {
    this.section = document.querySelector("#login_section");
    this.header = document.querySelector(".login-header_container");
    this.userName = document.querySelector("#login-user-name");
    this.apiKey = document.querySelector("#login-api-key");
    this.userImage = document.querySelector(".login-user-image");
    //
    this.header.addEventListener("mousedown", (e) => {
      UI.moveEvent(this.section, e);
    });
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

  default: (a, b) => 0,
};

//* Методи фільтрування для досягнень гри
const filterBy = {
  earned: (achievement) => achievement.DateEarnedHardcore,
  notEarned: (achievement) => !achievement.DateEarnedHardcore,
  all: () => true,
};
