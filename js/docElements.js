class UI {
  RECENT_DELAY_MILISECS = 20 * 60 * 1000; //mins => secs => milisecs
  constructor() {
    this.initializeElements();
    this.addEvents();

    this.settings.apiKey.value = userIdent.API_KEY;
    this.settings.login.value = userIdent.USER_NAME;
    this.settings.gameID.value = localStorage.getItem("RAGameID");
  }
  initializeElements() {
    // Елементи блока досягнень
    this.achievementsBlock = {
      container: document.querySelector("section.achivs"), // Контейнер блока досягнень
      achivsSection: document.querySelector(".achivs_section"), // Секція з досягненнями
      resizer: document.querySelector("#achivs-resizer"), // Ресайзер блока досягнень
    };

    // Елементи інформації про гру
    this.gameCard = {
      container: document.querySelector(".game-card_section"), // Контейнер інформації про гру
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
      container: document.querySelector(".prefs_section"), // Контейнер налаштувань
      apiKey: document.querySelector("#api-key"), // Поле введення ключа API
      login: document.querySelector("#login-input"), // Поле введення логіну
      updateInterval: document.querySelector("#update-time"), // Поле введення інтервалу оновлення
      gameID: document.querySelector("#game-id"), // Поле введення ідентифікатора гри
      watchButton: document.querySelector("#watching-button"), // Кнопка спостереження за грою
      getGameIdButton: document.querySelector(".get-id-button"), // Кнопка отримання ідентифікатора гри
      checkIdButton: document.querySelector(".check-id-button"), // Кнопка перевірки ідентифікатора гри
      gamePreview: document.querySelector("#game-preview"), // Іконка гри
      gameTitle: document.querySelector("#game-title"), // Заголовок гри
      gamePlatform: document.querySelector("#game-platform"), // Платформа гри
      gameAchivsCount: document.querySelector("#game-achivs-count"), // Кількість досягнень гри
    };
  }

  addEvents() {
    // Додаємо обробник події 'change' для поля введення ключа API
    this.settings.apiKey.addEventListener("change", () => {
      // Оновлюємо ідентифікатор користувача з новим значенням ключа API
      updateUserIdent({ apiKey: this.settings.apiKey.value });
    });

    // Додаємо обробник події 'change' для поля введення логіну
    this.settings.login.addEventListener("change", () => {
      // Оновлюємо ідентифікатор користувача з новим значенням логіну
      updateUserIdent({ loginName: this.settings.login.value });
    });

    // Додаємо обробник події 'change' для поля введення інтервалу оновлення
    this.settings.updateInterval.addEventListener("change", () => {
      // Оновлюємо інтервал оновлення
      UPDATE_RATE_IN_SECS = this.settings.updateInterval.value;
    });

    // Додаємо обробник події 'change' для поля введення ідентифікатора гри
    this.settings.gameID.addEventListener("change", () => {
      // Оновлюємо ідентифікатор гри
      updateGameID(this.settings.gameID.value);
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
        updateGameID(resp.LastGameID);
      });
    });

    //Додаємо обробник події 'click' для кнопки отримання списку ачівментсів для вибраного id гри
    this.settings.checkIdButton.addEventListener("click", () => {
      getAchivs();
    });

    // Додавання подій для зміни розміру вікна ачівментсів
    function resizeAchivsBlock(event, resizeValues, container) {
      // Отримуємо дані про розміри і початкові координати зміни розміру
      const { startWidth, startHeight, startX, startY } = resizeValues;

      // Обчислюємо зміни в розмірах з урахуванням переміщення миші
      const widthChange = event.clientX - startX;
      const heightChange = event.clientY - startY;

      // Оновлюємо ширину та висоту контейнера з урахуванням змін
      container.style.width = `${startWidth + widthChange}px`;
      container.style.height = `${startHeight + heightChange}px`;

      // Підігнати розмір досягнень відповідно до нового розміру контейнера
      ui.fitSizeVertically();
    }
    // Додавання подій для пересування вікна налаштувань
    this.settings.container.addEventListener("mousedown", (e) => {
      let offsetX =
        e.clientX - this.settings.container.getBoundingClientRect().left;
      let offsetY =
        e.clientY - this.settings.container.getBoundingClientRect().top;
      this.settings.container.classList.add("dragable");

      const handleMouseMove = (e) =>
        moveWindowFunction(e, offsetX, offsetY, this.settings.container);

      this.settings.container.addEventListener("mousemove", handleMouseMove);

      // Додання події для завершення пересування вікна налаштувань
      const handleMouseUp = (e) => {
        this.settings.container.classList.remove("dragable");
        this.settings.container.removeEventListener(
          "mousemove",
          handleMouseMove
        );
        this.settings.container.removeEventListener("mouseup", handleMouseUp);
        e.preventDefault();
      };

      this.settings.container.addEventListener("mouseup", handleMouseUp);
      this.settings.container.addEventListener("mouseleave", handleMouseUp);
    });

    // Додавання подій для пересування вікна картки гри
    this.gameCard.container.addEventListener("mousedown", (e) => {
      let offsetX =
        e.clientX - this.gameCard.container.getBoundingClientRect().left;
      let offsetY =
        e.clientY - this.gameCard.container.getBoundingClientRect().top;
      this.gameCard.container.classList.add("dragable");
      const handleMouseMove = (e) =>
        moveWindowFunction(e, offsetX, offsetY, this.gameCard.container);
      this.gameCard.container.addEventListener("mousemove", handleMouseMove);

      // Додання події для завершення пересування вікна картки гри
      const handleMouseUp = (e) => {
        this.gameCard.container.classList.remove("dragable");
        this.gameCard.container.removeEventListener(
          "mousemove",
          handleMouseMove
        );
        this.gameCard.container.removeEventListener("mouseup", handleMouseUp);
        e.preventDefault();
      };

      this.gameCard.container.addEventListener("mouseup", handleMouseUp);
      this.gameCard.container.addEventListener("mouseleave", handleMouseUp);
    });

    // Функція для пересування вікна
    const moveWindowFunction = (e, offsetX, offsetY, container) => {
      e.preventDefault();
      container.style.left = e.clientX - offsetX + "px";
      container.style.top = e.clientY - offsetY + "px";
    };

    // Фуекція для зміни розміру вікна
    this.achievementsBlock.resizer.addEventListener("mousedown", (event) => {
      let resizeValues = {
        // Зберігаємо початкові розміри елемента
        startWidth: this.achievementsBlock.container.clientWidth,
        startHeight: this.achievementsBlock.container.clientHeight,

        // Зберігаємо координати миші
        startX: event.clientX,
        startY: event.clientY,
      };
      const resizeHandler = (event) =>
        resizeAchivsBlock(
          event,
          resizeValues,
          this.achievementsBlock.container
        );
      // Додаємо подію mousemove до документа
      document.addEventListener("mousemove", resizeHandler);

      // Видаляємо подію mousemove з документа, коли користувач відпускає кнопку миші
      document.addEventListener("mouseup", () => {
        document.removeEventListener("mousemove", resizeHandler);
      });
    });
  }

  parseGameAchievements(achivs) {
    const { achivsSection } = this.achievementsBlock;

    achivsSection.innerHTML = "";

    this.updateGameInfo({
      title: achivs.Title,
      platform: achivs.ConsoleName,
      imageIcon: achivs.ImageIcon,
      achivsCount: achivs.NumAchievements,
    });

    Object.values(achivs.Achievements).forEach((achiv) => {
      const {
        BadgeName,
        Title,
        Description,
        DateEarned,
        DateEarnedHardcore,
        ID,
      } = achiv;
      let achivElement = this.generateAchievement({
        badgeName: BadgeName,
        title: Title,
        description: Description,
        dateEarned: DateEarned,
        dateHardEarned: DateEarnedHardcore,
        achivID: ID,
      });
      achivsSection.appendChild(achivElement);
    });
  }

  updateGameInfo({ title, platform, imageIcon, achivsCount }) {
    const { gamePreview, gameTitle, gamePlatform, gameAchivsCount } =
      this.settings;

    gamePreview.setAttribute(
      "src",
      `https://media.retroachievements.org${imageIcon}`
    );
    gameTitle.innerText = title;
    gameAchivsCount.innerText = achivsCount;
    gamePlatform.innerText = platform;
  }

  updateGameCardInfo(gameInfo) {
    const {
      Title,
      ImageBoxArt,
      ConsoleName,
      Developer,
      Publisher,
      Genre,
      Released,
      UserCompletion,
      UserCompletionHardcore,
    } = gameInfo;

    const {
      header,
      preview,
      platform,
      developer,
      publisher,
      genre,
      released,
      completion,
    } = this.gameCard;

    header.innerText = Title;
    preview.setAttribute(
      "src",
      `https://media.retroachievements.org${ImageBoxArt}`
    );
    platform.innerText = ConsoleName;
    developer.innerText = Developer || "-";
    publisher.innerText = Publisher || "-";
    genre.innerText = Genre || "-";
    released.innerText = Released || "-";
    completion.innerText = `${UserCompletion} [${UserCompletionHardcore}]`;
  }

  generateAchievement({
    badgeName,
    title,
    description,
    dateEarned,
    dateHardEarned,
    achivID,
  }) {
    // Створення основного елемента досягнення
    let achivElement = document.createElement("div");
    achivElement.classList.add("achiv-block");

    // Визначення, чи отримано досягнення та чи є воно хардкорним
    let isEarned = dateEarned !== undefined;
    let isHardcoreEarned = dateHardEarned !== undefined;

    // Додавання відповідних класів в залежності від умов
    isEarned ? achivElement.classList.add("earned") : "";
    isHardcoreEarned ? achivElement.classList.add("hardcore") : "";

    // Перевірка на недавно отримані досягнення
    let diffMinutes = isHardcoreEarned
      ? new Date() - new Date(dateHardEarned)
      : isEarned
      ? new Date() - new Date(dateEarned)
      : 0;

    if (isHardcoreEarned || isEarned) {
      if (diffMinutes < this.RECENT_DELAY_MILISECS) {
        achivElement.classList.add(
          isHardcoreEarned ? "recent-earned-hard" : "recent-earned"
        );
      }
    }

    // Додавання dataset для ідентифікації досягнення
    achivElement.dataset.achivId = achivID;

    // Створення зображення досягнення
    let previewContainer = document.createElement("div");
    previewContainer.classList.add("preview-container");
    let achivPreview = document.createElement("img");
    achivPreview.classList.add("achiv-preview");
    achivPreview.src = `https://media.retroachievements.org/Badge/${badgeName}.png`;
    previewContainer.appendChild(achivPreview);
    achivElement.appendChild(previewContainer);

    // Додавання деталей досягнення
    let achivDetails = this.generateAchivDetails({
      name: title,
      description: description,
      dateEarned: dateEarned,
    });
    achivElement.appendChild(achivDetails);

    return achivElement;
  }

  generateAchivDetails({ name, description, dateEarned }) {
    // Створюємо елемент div для деталей досягнення
    let detailsElement = document.createElement("div");
    detailsElement.classList.add("achiv-details-block");

    // Додаємо заголовок до елемента деталей
    let titleElement = document.createElement("h3");
    titleElement.textContent = name;
    detailsElement.appendChild(titleElement);

    // Додаємо опис до елемента деталей
    let descriptionElement = document.createElement("p");
    descriptionElement.textContent = description;
    detailsElement.appendChild(descriptionElement);

    // Додаємо дату досягнення до елемента деталей, якщо вона існує
    if (dateEarned) {
      let dateElement = document.createElement("p");
      dateElement.textContent = "Earned " + dateEarned;
      detailsElement.appendChild(dateElement);
    }

    return detailsElement;
  }

  // Автопідбір розміру значків ачівментсів
  fitSizeVertically() {
    // Отримання посилання на блок досягнень та його дочірні елементи
    const { achivsSection } = this.achievementsBlock;
    const achivs = Array.from(achivsSection.children);
    const achivsCount = achivs.length;

    // Перевірка, чи є елементи в блоці досягнень
    if (achivsCount === 0) return;

    // Отримання розмірів вікна блоку досягнень
    const windowHeight = achivsSection.clientHeight;
    const windowWidth = achivsSection.clientWidth;

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

    // Встановлення розміру кожного досягнення в блоку
    achivs.forEach((achiv) => (achiv.style.width = achivWidth + "px"));
  }
}
