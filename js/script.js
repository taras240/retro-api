let config = new Config();
RECENT_DELAY_MILISECS = 20 * 60 * 1000; //mins => secs => milisecs

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
    const resp = await apiWorker.getGameProgress({ gameID: config.gameID });

    // Парсинг та відображення досягнень гри
    ui.parseGameAchievements(resp);

    // Підгонка розміру досягнень
    ui.fitSizeVertically();

    // Оновлення інформації в картці гри
    ui.updateGameCardInfo(resp);
  } catch (error) {
    // Додання помилки до кнопки перегляду та зупинка перегляду
    ui.settings.watchButton.classList.add("error");
    stopWatching();
    console.error(error);
  }
}

// Функція для оновлення досягнень
async function updateAchievements() {
  try {
    // Отримання недавніх досягнень від API
    const achievements = await apiWorker.getRecentAchieves({
      minutes: 60 * 60,
    });

    // Ітерація через кожне досягнення
    achievements.forEach((achievement) => {
      // Знаходження елементу досягнення за його ідентифікатором
      const achievementElement =
        ui.achievementsBlock.achivsSection.querySelector(
          `[data-achiv-id="${achievement.AchievementID}"]`
        );
      const targetElement = ui.target.container.querySelector(
        `[data-achiv-id="${achievement.AchievementID}"]`
      );
      if (achievementElement) {
        const isHardcore = achievement.HardcoreMode === 1;
        const isLatestSort = ui.SORT_METHOD === sortBy.latest;
        const isHardcoreMismatch =
          achievementElement.classList.contains("hardcore") !== isHardcore;
        const isNotEarned = !achievementElement.classList.contains("earned");

        // Перевірка, чи потрібно перемістити елемент на початок
        if (isLatestSort && (isHardcoreMismatch || isNotEarned)) {
          switchElementToStart(achievementElement);
        }

        // Додавання класів для відображення зароблених досягнень
        achievementElement.classList.add("earned");
        targetElement.classList.add("earned");
        if (isHardcore) {
          achievementElement.classList.add("hardcore");
          targetElement.classList.add("hardcore");
        }
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
  // Оновлення стану та тексту кнопки слідкування
  ui.settings.watchButton.classList.add("active");
  ui.settings.watchButton.innerText = "Watching";
  ui.settings.watchButton.classList.remove("error");

  // Отримання початкових досягнень
  getAchievements();

  // Встановлення інтервалу для оновлення досягнень та зміни стану кнопки
  apiTickInterval = setInterval(() => {
    updateAchievements();
    toggleTickClass();
  }, config.updateDelayInMiliSecs);
}

// Функція для перемикання класу "tick" на кнопці слідкування
function toggleTickClass() {
  ui.settings.watchButton.classList.remove("tick");
  setTimeout(() => ui.settings.watchButton.classList.add("tick"), 500);
}

// Функція для зупинки слідкування за досягненнями
function stopWatching() {
  ui.settings.watchButton.classList.remove("active");
  ui.settings.watchButton.innerText = "Watch";
  clearInterval(apiTikInterval);
}

// Функція для відкриття налаштувань
function openSettings() {
  ui.switchSectionVisibility(ui.settings.section);
}
// Функція для відкриття/закриття картки гри
function openGameCard() {
  ui.switchSectionVisibility(ui.gameCard.section);
}
// Функція для закриття About
function openAbout() {
  ui.switchSectionVisibility(ui.about.section);
}
function openTarget() {
  ui.switchSectionVisibility(ui.target.section);
}
function openAllAchivs() {
  ui.switchSectionVisibility(ui.achievementsBlock.section);
}
function clearTarget() {
  ui.target.container.innerHTML = "";
}
