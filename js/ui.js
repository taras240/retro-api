class UI {
  SORT_METHOD = sortBy.default;
  FILTER_METHOD = filterBy.all;
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

      //Оновлення ачівментсів
      if (config.identConfirmed) {
        this.settings.checkIdButton.click();
      }
    });
  }

  initializeElements() {
    this.loginCard = {
      section: document.querySelector("#login_section"),
      userName: document.querySelector("#login-user-name"),
      apiKey: document.querySelector("#login-api-key"),
      userImage: document.querySelector(".login-user-image"),
    };
    // Елементи блока досягнень
    this.achievementsBlock = {
      section: document.querySelector("#achievements_section"), // Секція блока досягнень
      container: document.querySelector(".achievements-container"), //Контейнер  з досягненнями
      resizer: document.querySelector("#achivs-resizer"), // Ресайзер блока досягнень
    };

    // Елементи інформації про гру
    this.gameCard = {
      section: document.querySelector(".game-card_section"), // Контейнер інформації про гру
      header: document.querySelector("#game-card-header"), // Заголовок гри
      preview: document.querySelector("#game-card-image"), // Зображення гри
      platform: document.querySelector("#game-card-platform"), // Платформа гри
      developer: document.querySelector("#game-card-developer"), // Розробник гри
      publisher: document.querySelector("#game-card-publisher"), // Видавець гри
      genre: document.querySelector("#game-card-genre"), // Жанр гри
      released: document.querySelector("#game-card-released"), // Дата випуску гри
      completion: document.querySelector("#game-card-completion"), // Статус завершення гри
    };

    // Елементи налаштувань
    this.settings = {
      section: document.querySelector(".prefs_section"), //* Контейнер налаштувань
      updateInterval: document.querySelector("#update-time"), // Поле введення інтервалу оновлення
      sortByLatestButton: document.querySelector("#sort-by-latest"), // Кнопка сортування за останніми
      sortByEarnedButton: document.querySelector("#sort-by-earned"), // Кнопка сортування за заробленими
      sortByPointsButton: document.querySelector("#sort-by-points"), // Кнопка сортування за балами
      sortByDefaultButton: document.querySelector("#sort-by-default"), // Кнопка сортування за замовчуванням
      filterByAll: document.querySelector("#filter-by-all"), // Фільтр за всіма
      filterByEarned: document.querySelector("#filter-by-earned"), // Фільтр за заробленими
      filterByNotEarned: document.querySelector("#filter-by-not-earned"), // Фільтр за не заробленими
      stretchButton: document.querySelector("#stretch-achivs"),
      minimumWidthInput: document.querySelector("#achiv-min-width"),
      maximumWidthInput: document.querySelector("#achiv-max-width"),
      targetUserInput: document.querySelector("#target-user"),
      gameID: document.querySelector("#game-id"), // Поле введення ідентифікатора гри
      watchButton: document.querySelector("#watching-button"), // Кнопка спостереження за грою
      getGameIdButton: document.querySelector(".get-id-button"), // Кнопка отримання ідентифікатора гри
      checkIdButton: document.querySelector(".check-id-button"), // Кнопка перевірки ідентифікатора гри
      gamePreview: document.querySelector("#game-preview"), // Іконка гри
      gameTitle: document.querySelector("#game-title"), // Заголовок гри
      gamePlatform: document.querySelector("#game-platform"), // Платформа гри
      gameAchivsCount: document.querySelector("#game-achivs-count"), // Кількість досягнень гри
    };

    this.about = {
      section: document.querySelector("#help_section"),
    };

    this.target = {
      section: document.querySelector("#target_section"),
      container: document.querySelector(".target-container"),
    };
    this.buttons = {
      section: document.querySelector("#buttons_section"),
      settings: document.querySelector("#open-settings-button"),
      achievements: document.querySelector("#open-achivs-button"),
      login: document.querySelector("#open-login-button"),
      about: document.querySelector("#open-about-button"),
      gameCard: document.querySelector("#open-game-card-button"),
      target: document.querySelector("#open-target-button"),
    };

    this.awards = {
      section: document.querySelector(".awards_section"), // Контейнер інформації про гру
      container: document.querySelector(".awards-content_container"),
    };
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
  addEvents() {
    // Додаємо обробник події 'change' для поля введення інтервалу оновлення
    this.settings.updateInterval.addEventListener("change", () => {
      // Оновлюємо інтервал оновлення
      config.updateDelay = this.settings.updateInterval.value || 5;
    });

    // Додаємо обробник події 'change' для поля введення ідентифікатора гри
    this.settings.gameID.addEventListener("change", () => {
      // Оновлюємо ідентифікатор гри
      config.gameID = this.settings.gameID.value;
    });

    // Додає подію кліку для сортування за замовчуванням
    this.settings.sortByDefaultButton.addEventListener("click", (e) => {
      e.stopPropagation();
      // Встановлює метод сортування за замовчуванням
      this.SORT_METHOD = sortBy.default;
      // Застосовує сортування та оновлює інтерфейс
      this.applySorting({ sortButton: this.settings.sortByDefaultButton });
    });

    // Додає подію кліку для сортування за отриманням досягнення
    this.settings.sortByEarnedButton.addEventListener("click", (e) => {
      e.stopPropagation();
      // Встановлює метод сортування за отриманням досягнення
      this.SORT_METHOD = sortBy.earnedCount;
      // Застосовує сортування та оновлює інтерфейс
      this.applySorting({ sortButton: this.settings.sortByEarnedButton });
    });

    // Додає подію кліку для сортування за датою отримання
    this.settings.sortByLatestButton.addEventListener("click", (e) => {
      e.stopPropagation();
      // Встановлює метод сортування за датою отримання
      this.SORT_METHOD = sortBy.latest;
      // Застосовує сортування та оновлює інтерфейс
      this.applySorting({ sortButton: this.settings.sortByLatestButton });
    });

    // Додає подію кліку для сортування за кількістю балів
    this.settings.sortByPointsButton.addEventListener("click", (e) => {
      e.stopPropagation();
      // Встановлює метод сортування за кількістю балів
      this.SORT_METHOD = sortBy.points;
      // Застосовує сортування та оновлює інтерфейс
      this.applySorting({ sortButton: this.settings.sortByPointsButton });
    });

    this.settings.filterByEarned.addEventListener("click", (e) => {
      e.stopPropagation();
      this.FILTER_METHOD = filterBy.earned;
      this.applyFilter({ filterButton: this.settings.filterByEarned });
    });
    this.settings.filterByNotEarned.addEventListener("click", (e) => {
      e.stopPropagation();
      this.FILTER_METHOD = filterBy.notEarned;
      this.applyFilter({ filterButton: this.settings.filterByNotEarned });
    });
    this.settings.filterByAll.addEventListener("click", (e) => {
      e.stopPropagation();
      this.FILTER_METHOD = filterBy.all;
      this.applyFilter({ filterButton: this.settings.filterByAll });
    });

    this.settings.stretchButton.addEventListener("click", (e) => {
      const { stretchButton } = this.settings;
      if (stretchButton.classList.contains("checked")) {
        stretchButton.classList.remove("checked");
        this.achievementsBlock.container.style.height = "auto";
      } else {
        stretchButton.classList.add("checked");
        this.achievementsBlock.container.style.height = "100%";
      }
    });
    this.settings.minimumWidthInput.addEventListener("change", (e) => {
      const { minimumWidthInput } = this.settings;
      if (minimumWidthInput.value)
        config.ACHIV_MIN_SIZE = minimumWidthInput.value;
      this.fitSizeVertically();
    });
    this.settings.maximumWidthInput.addEventListener("change", (e) => {
      const { maximumWidthInput } = this.settings;
      if (maximumWidthInput.value)
        config.ACHIV_MAX_SIZE = maximumWidthInput.value;
      this.fitSizeVertically();
    });

    this.settings.targetUserInput.addEventListener("change", (e) => {
      e.stopPropagation();
      config.targetUser = this.settings.targetUserInput.value;
    });
    // Додаємо обробник події 'click' для кнопки автооновлення
    this.settings.watchButton.addEventListener("click", (e) => {
      e.stopPropagation();
      // Перевіряємо стан кнопки та відповідно запускаємо або припиняємо автооновлення
      if (this.settings.watchButton.classList.contains("active")) {
        stopWatching();
      } else {
        startWatching();
      }
    });

    //Додаємо обробник події 'click' для кнопки отримання id останньої гри
    this.settings.getGameIdButton.addEventListener("click", () => {
      apiWorker.getProfileInfo({}).then((resp) => {
        this.settings.gameID.value = resp.LastGameID;
        config.gameID = resp.LastGameID;
      });
    });

    //Додаємо обробник події 'click' для кнопки отримання списку ачівментсів для вибраного id гри
    this.settings.checkIdButton.addEventListener("click", () => {
      getAchievements();
    });

    // Додавання подій для пересування вікна налаштувань
    this.settings.section.addEventListener("mousedown", (e) => {
      moveEvent(this.settings.section, e);
    });
    // Додавання подій для пересування вікна досягнень
    this.awards.section.addEventListener("mousedown", (e) => {
      moveEvent(this.awards.section, e);
    });
    // Додавання подій для пересування вікна ачівментсів
    this.achievementsBlock.section.addEventListener("mousedown", (e) => {
      moveEvent(this.achievementsBlock.section, e);
    });
    // Додавання подій для пересування вікна картки гри
    this.gameCard.section.addEventListener("mousedown", (e) => {
      moveEvent(this.gameCard.section, e);
    });

    // Додавання подій для пересування вікна target
    this.target.section.addEventListener("mousedown", (e) => {
      moveEvent(this.target.section, e);
    });
    this.loginCard.section.addEventListener("mousedown", (e) => {
      moveEvent(this.loginCard.section, e);
    });

    // this.buttons.section.addEventListener("mousedown", (e) => {
    //   moveEvent(this.buttons.section, e);
    // });
    // Подія для зміни розміру вікна ачівментсів
    this.achievementsBlock.resizer.addEventListener("mousedown", (event) => {
      event.stopPropagation();
      this.achievementsBlock.section.classList.add("resized");
      resizeEvent({
        event: event,
        section: this.achievementsBlock.section,
        postFunc: () => this.fitSizeVertically(),
      });
    });

    // Функція для пересування вікна
    function moveEvent(section, e) {
      section.classList.add("dragable");

      const rect = section.getBoundingClientRect(); // Отримуємо розміри та позицію вікна
      const offsetX = e.clientX - rect.left;
      const offsetY = e.clientY - rect.top;

      const handleMouseMove = (e) => setPosition(e, offsetX, offsetY, section);

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

    function setPosition(e, offsetX, offsetY, section) {
      e.preventDefault();
      section.style.left = e.clientX - offsetX + "px";
      section.style.top = e.clientY - offsetY + "px";
    }

    // Функція зміни розміру вікна
    function resizeEvent({ event, section, postFunc }) {
      let resizeValues = {
        // Зберігаємо початкові розміри елемента
        startWidth: section.clientWidth,
        startHeight: section.clientHeight,

        // Зберігаємо координати миші
        startX: event.clientX,
        startY: event.clientY,
      };
      const resizeHandler = (event) => {
        setSize(event, resizeValues, section);

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
    function setSize(event, resizeValues, section) {
      // Отримуємо дані про розміри і початкові координати зміни розміру
      const { startWidth, startHeight, startX, startY } = resizeValues;

      // Обчислюємо зміни в розмірах з урахуванням переміщення миші
      const widthChange = event.clientX - startX;
      const heightChange = event.clientY - startY;

      // Оновлюємо ширину та висоту контейнера з урахуванням змін
      section.style.width = `${startWidth + widthChange}px`;
      section.style.height = `${startHeight + heightChange}px`;
    }
  }

  applySorting({ sortButton }) {
    // Знімає клас "checked" з усіх кнопок сортування
    sortButton.parentNode
      .querySelectorAll(".checked")
      ?.forEach((child) => child.classList.remove("checked"));
    // Додає клас "checked" до обраної кнопки сортування
    sortButton.classList.add("checked");
    // Клікає на кнопку перевірки ідентифікатора для виконання сортування
    this.settings.checkIdButton.click();
  }
  applyFilter({ filterButton }) {
    filterButton.parentNode
      .querySelectorAll(".checked")
      .forEach((child) => child.classList.remove("checked"));
    filterButton.classList.add("checked");
    // Клікає на кнопку перевірки ідентифікатора для виконання сортування
    this.settings.checkIdButton.click();
  }
  //!----- AWARDS -----------------------------
  parseAwards(userAwards) {
    this.awards.container.innerHTML = `
    <li class="console-awards all-consoles">
    <h3 class="awards-console_header">Total</h3>
    <ul class="console-awards-values ">
      <li class="awarded-games total">${userAwards.TotalAwardsCount}</li>
      <li class="awarded-games beaten-softcore">${userAwards.BeatenSoftcoreAwardsCount}</li>
      <li class="awarded-games beaten">${userAwards.BeatenHardcoreAwardsCount}</li>
      <li class="awarded-games completed">${userAwards.CompletionAwardsCount}</li>
      <li class="awarded-games mastered">${userAwards.MasteryAwardsCount}</li>
    </ul>
    <button class="expand-awards_button" onclick="expandAwards(this)"> </button>
    <ul class="awarded-games_list total hidden">
    </ul>
  </li>
    `;
    //*------------------------------------------
    let gamesArray = [...userAwards.VisibleUserAwards];
    gamesArray = gamesArray.sort((a, b) => {
      let dateA = new Date(b.AwardedAt);
      let dateB = new Date(a.AwardedAt);
      return dateA - dateB;
    });

    gamesArray.forEach((game) => {
      let gameElement = document.createElement("li");
      gameElement.classList.add("awarded-game");
      gameElement.innerHTML = `
          <img class="awarded-game-preview" src="https://media.retroachievements.org${game.ImageIcon}" alt=" ">
          <h3 class="game-title">${game.Title}</h3>
          <p class="console-name">${game.ConsoleName}</p>
          <p class="awarded-date">${game.AwardedAt}</p>
      `;
      this.awards.container
        .querySelector(".awarded-games_list.total")
        .appendChild(gameElement);
    });
    const sortedGames = this.generateAwardsGroups(gamesArray);
    this.generateConsolesAwards(sortedGames);
  }
  generateAwardsGroups(gamesArray) {
    console.log(gamesArray);
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
      let beatenSoftcore = sortedGames[consoleName].filter(
        (game) => game.AwardType === "Game Beaten" && game.AwardDataExtra === 0
      ).length;
      let beaten = sortedGames[consoleName].filter(
        (game) => game.AwardType === "Game Beaten" && game.AwardDataExtra === 1
      ).length;
      let compleated = sortedGames[consoleName].filter(
        (game) =>
          game.AwardType === "Mastery/Completion" && game.AwardDataExtra === 0
      ).length;
      let mastered = sortedGames[consoleName].filter(
        (game) =>
          game.AwardType === "Mastery/Completion" && game.AwardDataExtra === 1
      ).length;
      consoleListItem.innerHTML = `
      <h3 class="awards-console_header">${consoleName}</h3>
      <ul class="console-awards-values">      
        <li class="awarded-games total">${total}</li>
        <li class="awarded-games beaten-softcore">${beatenSoftcore}</li>
        <li class="awarded-games beaten">${beaten}</li>
        <li class="awarded-games completed">${compleated}</li>
        <li class="awarded-games mastered">${mastered}</li>
      </ul>
      <button class="expand-awards_button" onclick="expandAwards(this)"> </button>
      <ul class="awarded-games_list hidden total">
      </ul>
      `;
      this.awards.container.appendChild(consoleListItem);
      let gamesList = consoleListItem.querySelector(".awarded-games_list");
      sortedGames[consoleName].forEach((game) => {
        let gameElement = document.createElement("li");
        gameElement.classList.add("awarded-game");
        gameElement.innerHTML = `
            <img class="awarded-game-preview" src="https://media.retroachievements.org${game.ImageIcon}" alt=" ">
            <h3 class="game-title">${game.Title}</h3>
            <p class="console-name">${game.ConsoleName}</p>
            <p class="awarded-date">${game.AwardedAt}</p>
        `;
        gamesList.appendChild(gameElement);
      });
    });
  }
  //!----- AWARDS -----------------------------

  // Розбирає отримані досягнення гри та відображає їх на сторінці
  parseGameAchievements(achivs) {
    // Очистити вміст розділу досягнень
    this.clearAchievementsSection();

    // Оновити інформацію про гру
    this.updateGameInfo(achivs);

    // Відсортувати досягнення та відобразити їх
    this.displaySortedAchievements(achivs);

    // Підгонка розміру досягнень
    this.fitSizeVertically();
  }

  clearAchievementsSection() {
    const { container } = this.achievementsBlock;
    container.innerHTML = "";
  }

  displaySortedAchievements(achievementsObject) {
    Object.values(achievementsObject.Achievements)
      .filter((a) => this.FILTER_METHOD(a))
      .sort((a, b) => this.SORT_METHOD(a, b))
      .forEach((achievement) => {
        this.displayAchievement(
          this.fixAchievement(achievement, achievementsObject)
        );
      });
  }

  displayAchievement(achievement) {
    const { container } = this.achievementsBlock;
    const achivElement = this.generateAchievement(achievement);
    container.appendChild(achivElement);
  }

  updateGameInfo({ Title, ConsoleName, ImageIcon, NumAchievements }) {
    const { gamePreview, gameTitle, gamePlatform, gameAchivsCount } =
      this.settings;

    gamePreview.setAttribute(
      "src",
      `https://media.retroachievements.org${ImageIcon}`
    );
    gameTitle.innerText = Title || "Some game name";
    gameAchivsCount.innerText = NumAchievements || 0;
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
    this.gameCard.header.innerText = Title;
    this.gameCard.preview.setAttribute(
      "src",
      `https://media.retroachievements.org${ImageBoxArt}`
    );
    this.gameCard.platform.innerText = ConsoleName;
    this.gameCard.developer.innerText = Developer || "-";
    this.gameCard.publisher.innerText = Publisher || "-";
    this.gameCard.genre.innerText = Genre || "-";
    this.gameCard.released.innerText = Released || "-";
    this.gameCard.completion.innerText = `${UserCompletion} [${UserCompletionHardcore}]`;
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
      this.addAchieveToTarget(achievement);
    });

    return achivElement;
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
        targetContainer: this.target.container,
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
    <button class="delete-from-target" title="remove from target" onclick="ui.deleteFromTarget(this)">
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
    this.target.container.appendChild(targetElement);

    this.addDraggingEventForElements(this.target.container);
  }
  addDraggingEventForElements(container) {
    const dragAndDropItems = container;

    new Sortable(dragAndDropItems, {
      animation: 150,
      // chosenClass: "target-achiv-chosen",
      // dragClass: "target-achiv-drag",
    });
  }
  isAchievementInTargetSection({ ID, targetContainer }) {
    const targetAchievements = [
      ...targetContainer.querySelectorAll(".target-achiv"),
    ].map((el) => +el.dataset.achivId);

    return targetAchievements.includes(ID);
  }

  deleteFromTarget(button) {
    button.parentNode.remove();
  }

  // Автопідбір розміру значків ачівментсів
  fitSizeVertically() {
    // Отримання посилання на блок досягнень та його дочірні елементи
    const { section, container } = this.achievementsBlock;
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

  switchSectionVisibility(section) {
    section.classList.toggle("hidden");
    config.setNewPosition({
      id: section.id,
      hidden: section.classList.contains("hidden"),
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
