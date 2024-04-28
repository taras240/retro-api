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
    // Отримання інформації про прогрес гри від API
    const response = await apiWorker.getGameProgress({});
    ui.ACHIEVEMENTS = response;
    ui.statusPanel.watchButton.classList.remove("error");
    // Оновлення інформації в картці гри

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
    const earnedAchievements = ui.checkForNewAchieves(achievements);
    if (earnedAchievements.length > 0) {
      ui.achievementsBlock.forEach(template => UI.updateAchievementsSection({ earnedAchievementIDs: earnedAchievements, widget: template }));
      UI.updateAchievementsSection({ earnedAchievementIDs: earnedAchievements, widget: ui.target });
      ui.target.delayedRemove();
      updateAwards();
      ui.progression.updateEarnedCards({ gameIDArray: earnedAchievements });
      ui.statusPanel.updateProgress({ earnedAchievementIDs: earnedAchievements });
    }
  } catch (error) {
    console.error(error); // Обробка помилок
  }
}

// Функція для початку слідкування за досягненнями
function startWatching() {
  // Оновлення стану та тексту кнопки слідкування
  ui.statusPanel.watchButton.classList.add("active");

  // Отримання початкових досягнень
  getAchievements();
  checkUpdates();
  if (ui.target.AUTOCLEAR) {
    ui.target.clearEarned();
  }

  // Встановлення інтервалу для оновлення досягнень та зміни стану кнопки
  apiTikInterval = setInterval(() => {
    checkUpdates();
    toggleTickClass();
  }, config.updateDelayInMiliSecs);
}
let totalPoints = 0;
let softcorePoints = 0;
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
    responce.TotalPoints != totalPoints ||
    responce.TotalSoftcorePoints != softcorePoints
  ) {
    updateAchievements();
    totalPoints = responce.TotalPoints;
    softcorePoints = responce.TotalSoftcorePoints;
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

// Функція для закриття About
function openAbout() {
  const checkbox = document.querySelector("#open-about-button");
  setTimeout(
    () => (checkbox.checked = !ui.about.section.classList.contains("hidden")),
    10
  );
  UI.switchSectionVisibility(ui.about);
}


function horizontalScroll(event) {
  var delta = Math.max(-1, Math.min(1, (event.wheelDelta || -event.detail)));
  var scrollSpeed = 10;
  var scrollDistance = 10;
  event.currentTarget.scrollLeft -= delta * scrollDistance * scrollSpeed;
  event.preventDefault();
}