// Об'єкт для зберігання інформації про користувача
let userIdent = {
  API_KEY: localStorage.getItem("RAApiKey") ?? "",
  USER_NAME: localStorage.getItem("RAUserName") ?? "",
};

// Ініціалізація UI
let ui = new UI();

// Ініціалізація APIWorker з ідентифікацією користувача
let apiWorker = new APIWorker({ identification: userIdent });
let apiTikInterval;

// Інтервал оновлення даних
let UPDATE_RATE_IN_SECS = 5;

// Змінна для зберігання ID гри
let gameID = localStorage.getItem("RAGameID") ?? "";

// Функція для оновлення інформації про користувача
function updateUserIdent({ loginName, apiKey }) {
  loginName ? localStorage.setItem("RAUserName", loginName) : "";
  apiKey ? localStorage.setItem("RAApiKey", apiKey) : "";
  userIdent = {
    API_KEY: localStorage.getItem("RAApiKey") ?? "",
    USER_NAME: localStorage.getItem("RAUserName") ?? "",
  };
  apiWorker = new APIWorker({ identification: userIdent });
}

// Функція для оновлення ID гри
function updateGameID(id) {
  gameID = id;
  localStorage.setItem("RAGameID", id);
  getAchivs();
}

// Функція для отримання досягнень гри
async function getAchivs() {
  try {
    // Отримання інформації про прогрес гри від API
    const resp = await apiWorker.getGameProgress({ gameID: gameID });

    // Парсинг та відображення досягнень гри
    ui.parseGameAchievements(resp);

    // Підгонка розміру досягнень
    ui.fitSizeVertically();

    // Оновлення інформації в картці гри
    ui.updateGameCardInfo(resp);
  } catch (error) {
    console.error(error);

    // Додання помилки до кнопки перегляду та зупинка перегляду
    ui.settings.watchButton.classList.add("error");
    stopWatching();
  }
}

// Функція для оновлення досягнень
async function updateAchievements() {
  try {
    // Отримання останніх досягнень від API
    const achivs = await apiWorker.getRecentAchieves({ minutes: 2000 });

    // Проходження по кожному досягненню
    achivs.forEach((achiv) => {
      // Знаходження елементу досягнення за його ідентифікатором
      const achivElement = ui.achievementsBlock.achivsSection.querySelector(
        `[data-achiv-id="${achiv.AchievementID}"]`
      );

      // Перевірка, чи існує елемент досягнення та чи збігається його тип з налаштованим сортуванням
      if (achivElement) {
        const hardcore = achiv.HardcoreMode == 1;
        if (
          ui.SORT_METHOD === sortBy.latest &&
          ((!achivElement.classList.contains("hardcore") && hardcore) ||
            !achivElement.classList.contains("earned"))
        ) {
          // Переміщення елементу до початку списку, якщо він щойно зароблений і сортування за останнім заробленим
          switchElementToStart(achivElement);
        }

        // Додавання класів для відображення зароблених досягнень
        achivElement.classList.toggle("earned", true);
        achivElement.classList.toggle("hardcore", hardcore);
      }
    });
  } catch (error) {
    console.error(error); // Обробка помилок
  }
}

function switchElementToStart(element) {
  element.parentNode.insertBefore(element, element.parentNode.firstChild);
}
// Функція для початку слідкування за досягненнями
function startWatching() {
  ui.settings.watchButton.classList.add("active");
  ui.settings.watchButton.innerText = "Watching";
  ui.settings.watchButton.classList.remove("error");
  getAchivs();
  apiTikInterval = setInterval(() => {
    updateAchievements();
    ui.settings.watchButton.classList.remove("tick");
    setTimeout(() => ui.settings.watchButton.classList.add("tick"), 500);
  }, UPDATE_RATE_IN_SECS * 1000);
}

// Функція для зупинки слідкування за досягненнями
function stopWatching() {
  ui.settings.watchButton.classList.remove("active");
  ui.settings.watchButton.innerText = "Watch";
  clearInterval(apiTikInterval);
}

// Функція для закриття налаштувань
function closeSettings() {
  ui.settings.container.classList.add("hidden");
}

// Функція для відкриття налаштувань
function openSettings() {
  ui.settings.container.classList.toggle("hidden");
}

// Функція для закриття картки гри
function closeGameCard() {
  ui.gameCard.container.classList.add("hidden");
}

// Функція для відкриття картки гри
function openGameCard() {
  ui.gameCard.container.classList.toggle("hidden");
}
