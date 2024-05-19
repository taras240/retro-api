const RECENT_ACHIVES_RANGE_MINUTES = 5; // for auto update
let config = new Config();
// Ініціалізація UI
let ui = new UI();
// Ініціалізація APIWorker 
let apiWorker = new APIWorker();
//Інтервал автооновлення ачівментсів
let apiTrackerInterval;

// Функція для отримання досягнень гри
async function getAchievements() {
  try {
    // Отримання інформації про прогрес гри від API
    const response = await apiWorker.getGameProgress({});

    ui.GAME_DATA = response;
    ui.statusPanel.watchButton.classList.remove("error");

  } catch (error) {
    // Додання помилки до кнопки перегляду та зупинка перегляду
    ui.statusPanel.watchButton.classList.add("error");
    stopWatching();
    console.error(error);
  }
}

// Функція для оновлення досягнень
async function updateAchievements() {
  try {
    // Отримання недавніх досягнень від API
    const achievements = await apiWorker.getRecentAchieves({
      minutes: RECENT_ACHIVES_RANGE_MINUTES,
    });
    const earnedAchievementsIDs = ui.checkForNewAchieves(achievements);

    if (earnedAchievementsIDs.length > 0) {
      ui.updateWidgets({ earnedAchievementsIDs: earnedAchievementsIDs });
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
  apiTrackerInterval = setInterval(() => {
    checkUpdates();
  }, config.updateDelayInMiliSecs);
}
let totalPoints = 0;
let softcorePoints = 0;
async function checkUpdates() {
  const responce = await apiWorker.getProfileInfo({});
  if (responce.LastGameID != config.gameID) {
    config.gameID = responce.LastGameID;
    getAchievements().then(() =>
      ui.userInfo.pushNewGame({ game: ui.GAME_DATA })
    );
  }
  if (
    responce.TotalPoints != totalPoints ||
    responce.TotalSoftcorePoints != softcorePoints
  ) {
    updateAchievements();
    totalPoints = responce.TotalPoints;
    softcorePoints = responce.TotalSoftcorePoints;
    ui.userInfo.updatePoints({ points: responce });
  }

  ui.statusPanel.richPresence.innerText = responce.RichPresenceMsg;
}


// Функція для зупинки слідкування за досягненнями
function stopWatching() {
  ui.statusPanel.watchButton.classList.remove("active");
  clearInterval(apiTrackerInterval);
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
const authTokenGetter = () => {

}
function openTwitchBotAuth() {
  //https://www.twitchapps.com/tmi/
  const twitchAUTHLink = 'https://id.twitch.tv/oauth2/authorize?response_type=token&client_id=q6batx0epp608isickayubi39itsckt&redirect_uri=https://twitchapps.com/tmi/&scope=chat%3Aread+chat%3Aedit';
  window.open(twitchAUTHLink, '_blank');
}
// const client = new tmi.Client({
//   options: { debug: true },
//   identity: {
//     username: 'retrocheevos',
//     password: ''
//   },
//   channels: ['']
// });

// client.connect();
