class UI {
  SORT_METHOD = sortBy.default;

  constructor() {
    document.querySelector(".wrapper").appendChild(createGameCard());

    // Ініціалізувати елементи
    this.initializeElements();

    // Додати події
    this.addEvents();

    //Встановити розміри і розміщення елементів
    this.setPositions();

    // Встановити ключ API з об'єкта ідентифікації користувача
    this.settings.apiKey.value = config.API_KEY;

    // Встановити значення логіну з об'єкта ідентифікації користувача
    this.settings.login.value = config.USER_NAME;

    // Отримати ідентифікатор гри з localStorage та встановити його значення
    this.settings.gameID.value = config.gameID;

    this.settings.updateInterval.value = config.updateDelay;
  }

  initializeElements() {
    // Елементи блока досягнень
    this.achievementsBlock = {
      section: document.querySelector("section.achivs"), // Контейнер блока досягнень
      achivsSection: document.querySelector(".achivs_section"), // Секція з досягненнями
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
      section: document.querySelector(".prefs_section"), // Контейнер налаштувань
      apiKey: document.querySelector("#api-key"), // Поле введення ключа API
      login: document.querySelector("#login-input"), // Поле введення логіну
      updateInterval: document.querySelector("#update-time"), // Поле введення інтервалу оновлення
      sortByLatestButton: document.querySelector("#sort-by-latest"),
      sortByEarnedButton: document.querySelector("#sort-by-erned"),
      sortByPointsButton: document.querySelector("#sort-by-points"),
      sortByDefaultButton: document.querySelector("#sort-by-default"),
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
      section: document.querySelector("#target-section"),
      container: document.querySelector(".target-container"),
    };
    this.buttons = {
      section: document.querySelector("#buttons-block"),
    };
  }
  //Встановлення розмірів і розміщення елементів
  setPositions() {
    // Проходження по кожному ідентифікатору контейнера в об'єкті config.ui
    Object.getOwnPropertyNames(config.ui).forEach((containerId) => {
      // Отримання елемента за його ідентифікатором
      let element = document.getElementById(containerId);

      // Отримання позиції та розмірів елемента з об'єкта config.ui
      const { x, y, width, height } = config.ui[containerId];

      // Встановлення нових значень стилів елемента, якщо вони вказані у config.ui
      // Якщо значення відсутнє (undefined), то стилі не змінюються
      x ? (element.style.left = x) : "";
      y ? (element.style.top = y) : "";
      width ? (element.style.width = width) : "";
      height ? (element.style.height = height) : "";
    });
  }

  addEvents() {
    // Додаємо обробник події 'change' для поля введення ключа API
    this.settings.apiKey.addEventListener("change", () => {
      // Оновлюємо ідентифікатор користувача з новим значенням ключа API
      config.API_KEY = this.settings.apiKey.value;
    });

    // Додаємо обробник події 'change' для поля введення логіну
    this.settings.login.addEventListener("change", () => {
      // Оновлюємо ідентифікатор користувача з новим значенням логіну
      config.USER_NAME = this.settings.login.value;
    });

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
    this.settings.sortByDefaultButton.addEventListener("click", () => {
      // Встановлює метод сортування за замовчуванням
      this.SORT_METHOD = sortBy.default;
      // Застосовує сортування та оновлює інтерфейс
      this.applySorting({ sortButton: this.settings.sortByDefaultButton });
    });

    // Додає подію кліку для сортування за отриманням досягнення
    this.settings.sortByEarnedButton.addEventListener("click", () => {
      // Встановлює метод сортування за отриманням досягнення
      this.SORT_METHOD = sortBy.earnedCount;
      // Застосовує сортування та оновлює інтерфейс
      this.applySorting({ sortButton: this.settings.sortByEarnedButton });
    });

    // Додає подію кліку для сортування за датою отримання
    this.settings.sortByLatestButton.addEventListener("click", () => {
      // Встановлює метод сортування за датою отримання
      this.SORT_METHOD = sortBy.latest;
      // Застосовує сортування та оновлює інтерфейс
      this.applySorting({ sortButton: this.settings.sortByLatestButton });
    });

    // Додає подію кліку для сортування за кількістю балів
    this.settings.sortByPointsButton.addEventListener("click", () => {
      // Встановлює метод сортування за кількістю балів
      this.SORT_METHOD = sortBy.points;
      // Застосовує сортування та оновлює інтерфейс
      this.applySorting({ sortButton: this.settings.sortByPointsButton });
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
      moveEvent(this.settings.section);
    });
    // Додавання подій для пересування вікна ачівментсів
    this.achievementsBlock.achivsSection.addEventListener("mousedown", (e) => {
      moveEvent(this.achievementsBlock.section);
    });
    // Додавання подій для пересування вікна картки гри
    this.gameCard.section.addEventListener("mousedown", (e) => {
      moveEvent(this.gameCard.section);
    });

    // Додавання подій для пересування вікна target
    this.target.section.addEventListener("mousedown", (e) => {
      moveEvent(this.target.section);
    });

    this.buttons.section.addEventListener("mousedown", (e) => {
      moveEvent(this.buttons.section);
    });
    // Подія для зміни розміру вікна ачівментсів
    this.achievementsBlock.resizer.addEventListener("mousedown", (event) => {
      event.stopPropagation();
      resizeEvent({
        event: event,
        section: this.achievementsBlock.section,
        postFunc: () => this.fitSizeVertically(),
      });
    });

    // Функція для пересування вікна
    function moveEvent(section) {
      section.addEventListener("mousedown", (e) => {
        let offsetX = e.clientX - section.getBoundingClientRect().left;
        let offsetY = e.clientY - section.getBoundingClientRect().top;
        section.classList.add("dragable");
        const handleMouseMove = (e) =>
          setPosition(e, offsetX, offsetY, section);
        section.addEventListener("mousemove", handleMouseMove);
        const handleMouseUp = (e) => {
          section.classList.remove("dragable");
          section.removeEventListener("mousemove", handleMouseMove);
          section.removeEventListener("mouseup", handleMouseUp);

          config.setNewPosition({
            id: section.id,
            xPos: section.style.left,
            yPos: section.style.top,
          });
          e.preventDefault();
        };

        section.addEventListener("mouseup", handleMouseUp);
        section.addEventListener("mouseleave", handleMouseUp);
      });
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
      .forEach((child) => child.classList.remove("checked"));
    // Додає клас "checked" до обраної кнопки сортування
    sortButton.classList.add("checked");
    // Клікає на кнопку перевірки ідентифікатора для виконання сортування
    this.settings.checkIdButton.click();
  }

  /**
   * Розбирає отримані досягнення гри та відображає їх на сторінці
   * @param {Object} achivs - об'єкт з отриманими досягненнями гри
   */
  parseGameAchievements(achivs) {
    const { achivsSection } = this.achievementsBlock;

    // Очищаємо вміст розділу досягнень
    achivsSection.innerHTML = "";

    // Оновлюємо інформацію про гру
    this.updateGameInfo({
      title: achivs.Title,
      platform: achivs.ConsoleName,
      imageIcon: achivs.ImageIcon,
      achivsCount: achivs.NumAchievements,
    });

    // Сортуємо досягнення за обраним методом сортування та відображаємо їх
    Object.values(achivs.Achievements)
      .sort((a, b) => this.SORT_METHOD(a, b))
      .forEach((achiv) => {
        const {
          BadgeName,
          Title,
          Description,
          DateEarned,
          DateEarnedHardcore,
          ID,
          Points,
        } = achiv;
        // Генеруємо HTML-елемент досягнення та додаємо його до секції досягнень
        let achivElement = this.generateAchievement({
          badgeName: BadgeName,
          title: Title,
          description: Description,
          dateEarned: DateEarned,
          dateHardEarned: DateEarnedHardcore,
          achivID: ID,
          points: Points,
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
    points,
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
      if (diffMinutes < RECENT_DELAY_MILISECS) {
        achivElement.classList.add(
          isHardcoreEarned ? "recent-earned-hard" : "recent-earned"
        );
      }
    }

    // Додавання dataset для ідентифікації досягнення
    achivElement.dataset.achivId = achivID;
    // Додавання dataset для очок досягнення
    achivElement.dataset.points =
      points < 10 ? "poor" : points < 20 ? "normal" : "reach";

    // Створення зображення досягнення
    let previewContainer = document.createElement("div");
    previewContainer.classList.add("preview-container");
    let achivPreview = document.createElement("img");
    achivPreview.classList.add("achiv-preview");
    achivPreview.src = `https://media.retroachievements.org/Badge/${badgeName}.png`;
    previewContainer.appendChild(achivPreview);
    achivElement.appendChild(previewContainer);

    let toTargetButton = document.createElement("button");
    toTargetButton.classList.add("add-to-target");
    previewContainer.appendChild(toTargetButton);
    // Додавання деталей досягнення
    let achivDetails = this.generateAchivDetails({
      name: title,
      description: description,
      dateEarned: dateEarned,
      points: points,
    });
    achivElement.appendChild(achivDetails);
    toTargetButton.addEventListener("mousedown", (e) => e.stopPropagation());
    toTargetButton.addEventListener("click", (e) => {
      e.stopPropagation();
      this.addAchieveToTarget({
        name: title,
        description: description,
        points: points,
        prevSrc: `https://media.retroachievements.org/Badge/${badgeName}.png`,
        isEarned: isEarned,
        isHardcoreEarned: isHardcoreEarned,
        achivID: achivID,
      });
    });
    return achivElement;
  }

  generateAchivDetails({ name, description, dateEarned, points }) {
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

    // Додаємо очки до елемента деталей
    let coinsElement = document.createElement("p");
    coinsElement.classList.add("points");
    coinsElement.textContent = points + " points";
    detailsElement.appendChild(coinsElement);

    // Додаємо дату досягнення до елемента деталей, якщо вона існує
    if (dateEarned) {
      let dateElement = document.createElement("p");
      dateElement.textContent = "Earned " + dateEarned;
      detailsElement.appendChild(dateElement);
    }

    return detailsElement;
  }

  addAchieveToTarget({
    name,
    prevSrc,
    description,
    points,
    isEarned,
    isHardcoreEarned,
    achivID,
  }) {
    if (
      [...this.target.container.querySelectorAll(".target-achiv")]
        .map((el) => +el.dataset.achivId)
        .includes(achivID)
    ) {
      return;
    }

    let targetElement = document.createElement("div");
    targetElement.classList.add("target-achiv");
    isEarned ? targetElement.classList.add("earned") : "";
    isHardcoreEarned ? targetElement.classList.add("hardcore") : "";
    targetElement.dataset.achivId = achivID;
    targetElement.innerHTML = `
    <button class="delete-from-target" onclick="ui.deleteFromTarget(this)"></button>
    <div class="prev">
              <img
                class="prev-img"
                src="${prevSrc}"
                alt=" "
              />
            </div>
            <div class="target-achiv-details">
              <h3 class="achiv-name">${name}</h3>
              <p class="achiv-description">${description}</p>
              <p class="points">${points} points</p>
            </div>
    `;
    this.target.container.appendChild(targetElement);
  }

  deleteFromTarget(button) {
    button.parentNode.remove();
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
