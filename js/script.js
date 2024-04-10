let config = new Config();
const RECENT_DELAY_MILISECS = 20 * 60 * 1000; //maybe don't need
const RECENT_ACHIVES_RANGE_MINUTES = 5; // for auto update
// Ініціалізація UI
let ui = new UI();
// Ініціалізація APIWorker з ідентифікацією користувача
let apiWorker = new APIWorker();
//Інтервал автооновлення ачівментсів
let apiTikInterval;

// Функція для отримання досягнень гри
async function getAchievements() {
  try {
    ui.statusPanel.watchButton.classList.remove("error");
    // Отримання інформації про прогрес гри від API
    const response = await apiWorker.getGameProgress(config);

    // Парсинг та відображення досягнень гри
    ui.achievementsBlock.parseGameAchievements(response);

    //Додаєм можливість перетягування елементів
    UI.addDraggingEventForElements(ui.achievementsBlock.container);

    // Оновлення інформації в картці гри
    ui.gameCard.updateGameCardInfo(response);

    if (config.autoFillTarget) {
      ui.target.clearAllAchivements();
      ui.target.fillItems();
    }
  } catch (error) {
    // Додання помилки до кнопки перегляду та зупинка перегляду
    ui.statusPanel.watchButton.classList.add("error");
    stopWatching();
    console.error(error);
  }
}
async function getAwards() {
  const response = await apiWorker.getUserAwards({});
  ui.awards.parseAwards(response);
}
async function updateAwards() {
  const response = await apiWorker.getUserAwards({});
  if (
    response.TotalAwardsCount != ui.awards.container.dataset.total ||
    response.MasteryAwardsCount != ui.awards.container.dataset.mastery ||
    response.BeatenHardcoreAwardsCount != ui.awards.container.dataset.beatenHard
  ) {
    ui.awards.parseAwards(response);
  }
}
// Функція для оновлення досягнень
async function updateAchievements() {
  try {
    // Отримання недавніх досягнень від API //* 5 minutes recomend
    const achievements = await apiWorker.getRecentAchieves({
      minutes: RECENT_ACHIVES_RANGE_MINUTES,
    });
    // Ітерація через кожне досягнення
    achievements.forEach((achievement) => {
      // Знаходження елементу досягнення за його ідентифікатором
      const achievementElement = ui.achievementsBlock.container.querySelector(
        `[data-achiv-id="${achievement.AchievementID}"]`
      );
      const targetElement = ui.target.container.querySelector(
        `[data-achiv-id="${achievement.AchievementID}"]`
      );
      if (achievementElement) {
        const isHardcore = achievement.HardcoreMode === 1;
        const isLatestSort =
          config.sortAchievementsBy === UI.sortMethods.latest;

        const isHardcoreMismatch =
          achievementElement.classList.contains("hardcore") !== isHardcore;
        const isNotEarned = !achievementElement.classList.contains("earned");
        const isAchieved = isNotEarned || isHardcoreMismatch;
        // Перевірка, чи потрібно перемістити елемент на початок
        if (isLatestSort && isAchieved) {
          switchElementToStart(achievementElement);
        }
        if (isAchieved) {
          updateAwards();
        }
        if (isHardcoreMismatch) {
          ui.statusPanel.updateProgress({ points: achievement.Points });
        }
        // Додавання класів для відображення зароблених досягнень
        achievementElement?.classList.add("earned");
        targetElement?.classList.add("earned");

        if (isHardcore) {
          achievementElement.classList.add("hardcore");
          achievementElement.dataset.DateEarnedHardcore =
            achievement?.DateEarnedHardcore;
          targetElement?.classList.add("hardcore");
          if (targetElement && config.autoClearTarget) {
            setTimeout(
              () => targetElement.remove(),
              config.autoClearTargetTime * 1000
            );
          }
        }
        ui.achievementsBlock.applyFilter();
      }
    });
  } catch (error) {
    console.error(error); // Обробка помилок
  }
}

function switchElementToStart(element) {
  if (UI.REVERSE_SORT == -1) {
    ui.achievementsBlock.container.appendChild(element);
  } else {
    element.parentNode.insertBefore(element, element.parentNode.firstChild);
  }
}
// Функція для початку слідкування за досягненнями
function startWatching() {
  // Оновлення стану та тексту кнопки слідкування
  ui.statusPanel.watchButton.classList.add("active");
  // ui.settings.watchButton.innerText = "Watching";

  // Отримання початкових досягнень
  getAchievements();
  checkUpdates();
  if (config.autoClearTarget) {
    ui.target.clearEarned();
  }

  // Встановлення інтервалу для оновлення досягнень та зміни стану кнопки
  apiTikInterval = setInterval(() => {
    checkUpdates();
    toggleTickClass();
  }, config.updateDelayInMiliSecs);
}
let TOTAL_POINTS = 0;
let SOFTCORE_POINTS = 0;
async function checkUpdates() {
  const responce = await apiWorker.getProfileInfo({});
  if (responce.LastGameID != config.gameID) {
    config.gameID = responce.LastGameID;
    ui.settings.gameID.value = config.gameID;
    if (config.identConfirmed) {
      ui.target.clearAllAchivements();
      getAchievements();
    }
  }
  if (
    responce.TotalPoints != TOTAL_POINTS ||
    responce.TotalSoftcorePoints != SOFTCORE_POINTS
  ) {
    updateAchievements();
    TOTAL_POINTS = responce.TotalPoints;
    SOFTCORE_POINTS = responce.TotalSoftcorePoints;
  }
  ui.statusPanel.richPresence.innerText = responce.RichPresenceMsg;
}
// Функція для перемикання класу "tick" на кнопці слідкування
function toggleTickClass() {
  ui.statusPanel.watchButton.classList.remove("tick");
  setTimeout(() => ui.statusPanel.watchButton.classList.add("tick"), 500);
}

// Функція для зупинки слідкування за досягненнями
function stopWatching() {
  ui.statusPanel.watchButton.classList.remove("active");
  clearInterval(apiTikInterval);
}

// Функція для відкриття налаштувань
function openSettings() {
  const checkbox = document.querySelector("#open-settings-button");
  UI.switchSectionVisibility(ui.settings.section);
  setTimeout(
    () =>
      (checkbox.checked = !ui.settings.section.classList.contains("hidden")),
    10
  );
}
// Функція для відкриття/закриття картки гри
function openGameCard() {
  const checkbox = document.querySelector("#open-game-card-button");
  setTimeout(
    () =>
      (checkbox.checked = !ui.gameCard.section.classList.contains("hidden")),
    10
  );
  UI.switchSectionVisibility(ui.gameCard.section);
}
// Функція для відкриття/закриття досягнень
function openAwards() {
  const checkbox = document.querySelector("#open-awards-button");
  setTimeout(
    () => (checkbox.checked = !ui.awards.section.classList.contains("hidden")),
    10
  );
  UI.switchSectionVisibility(ui.awards.section);
}
// Функція для закриття About
function openAbout() {
  const checkbox = document.querySelector("#open-about-button");
  setTimeout(
    () => (checkbox.checked = !ui.about.section.classList.contains("hidden")),
    10
  );
  UI.switchSectionVisibility(ui.about.section);
}
function openTarget() {
  const checkbox = document.querySelector("#open-target-button");
  setTimeout(
    () => (checkbox.checked = !ui.target.section.classList.contains("hidden")),
    10
  );
  UI.switchSectionVisibility(ui.target.section);
}

function openAllAchivs(e) {
  e?.stopPropagation();
  const checkbox = document.querySelector("#open-achivs-button");
  setTimeout(
    () =>
      (checkbox.checked =
        !ui.achievementsBlock.section.classList.contains("hidden")),
    10
  );
  UI.switchSectionVisibility(ui.achievementsBlock.section);
}
function openStatusPanel() {
  const checkbox = document.querySelector("#open-status-button");
  setTimeout(
    () =>
      (checkbox.checked = !ui.statusPanel.section.classList.contains("hidden")),
    10
  );
  UI.switchSectionVisibility(ui.statusPanel.section);
}
function openLogin() {
  const checkbox = document.querySelector("#open-login-button");
  setTimeout(
    () =>
      (checkbox.checked = !ui.loginCard.section.classList.contains("hidden")),
    10
  );
  UI.switchSectionVisibility(ui.loginCard.section);
}
function clearTarget() {
  ui.target.container.innerHTML = "";
}

//* -------------- LOGIN WINDOW -------------------
function pasteApiKeyFromClipboard() {
  navigator.clipboard
    .readText()
    .then((clipboardText) => {
      // Вставити значення з буферу обміну в поле вводу або куди-небудь інде
      ui.loginCard.apiKey.value = clipboardText;
      config.API_KEY = ui.settings.apiKey.value;
    })
    .catch((err) => {
      console.error("Не вдалося отримати доступ до буферу обміну:", err);
    });
}

function submitLogin() {
  let userName = ui.loginCard.userName.value;
  let apiKey = ui.loginCard.apiKey.value;
  apiWorker
    .verifyUserIdent({ userName: userName, apiKey: apiKey })
    .then((userObj) => {
      if (!userObj.ID) errorLogin();
      else {
        updateLogin({ userName: userName, apiKey: apiKey, userObj: userObj });
      }
    });
}
function updateLogin({ userName, apiKey, userObj }) {
  config.USER_NAME = userName;
  config.API_KEY = apiKey;
  config.identConfirmed = true;
  config.userImageSrc = `https://media.retroachievements.org${userObj?.UserPic}`;
  ui.loginCard.userImage.src = config.userImageSrc;
  document.querySelector("#submit-login").classList.remove("error");
  document.querySelector("#submit-login").classList.add("verified");
}

function errorLogin() {
  config.identConfirmed = false;
  ui.setValues();
  document.querySelector("#submit-login").classList.remove("verified");
  document.querySelector("#submit-login").classList.add("error");
}
