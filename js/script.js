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
    const resp = await apiWorker.getGameProgress({ gameID: gameID });
    ui.parseGameAchievements(resp);
    ui.fitSizeVertically();
    ui.updateGameCardInfo(resp);
    ui.settings.watchButton.classList.remove("error");
  } catch (error) {
    ui.settings.watchButton.classList.add("error");
    stopWatching();
  }
}
// Функція для оновлення досягнень
async function updateAchievements() {
  const achivs = await apiWorker.getRecentAchieves({ minutes: 60 * 60 });
  achivs.forEach((achiv) => {
    ui.achievementsBlock.achivsSection
      .querySelectorAll("[data-achiv-id]")
      .forEach((achivElement) => {
        if (achivElement.dataset.achivId == achiv.AchievementID) {
          achivElement.classList.toggle("earned", true);
          achivElement.classList.toggle("hardcore", achiv.HardcoreMode == 1);
        }
      });
  });
}

// Функція для початку слідкування за досягненнями
function startWatching() {
  ui.settings.watchButton.classList.add("active");
  ui.settings.watchButton.innerText = "Watching";
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
