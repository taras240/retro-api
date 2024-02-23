const userIdent = {
  API_KEY: localStorage.getItem("RAApiKey") ?? "",
  USER_NAME: localStorage.getItem("RAUserName") ?? "",
};
// let gameId = localStorage.getItem("gameID");
let updateRateInSecs = 5;
// userIdent.API_KEY = localStorage.getItem("apiKey");
// userIdent.USER_NAME = localStorage.getItem("userName");
let ui = new UI();
// ui.gameID.value = gameId;
let apiWorker = new APIWorker({
  key: userIdent.API_KEY,
  userName: userIdent.USER_NAME,
});

const requestGameProgress = "API_GetGameInfoAndUserProgress.php";
const requestUserRecentAchievements = "API_GetUserRecentAchievements.php";
const requestGetUserProfile = "API_GetUserProfile.php";

function updateAchivs(fun) {
  apiWorker.getGameProgress({}).then((resp) => {
    ui.parseGameAchievements(resp);
  });
}

function startWatching() {
  document.querySelector("#start-watching").classList.add("hidden");
  document.querySelector("#stop-watching").classList.remove("hidden");

  updateAchivs();
  worker = setInterval(() => {
    updateAchivs();
  }, updateRateInSecs * 1000);
}

function stopWatching() {
  document.querySelector("#stop-watching").classList.add("hidden");
  document.querySelector("#start-watching").classList.remove("hidden");
  clearInterval(worker);
}
function closeSettings() {
  ui.settings.classList.add("hidden");
}
function openSettings() {
  ui.settings.classList.contains("hidden")
    ? ui.settings.classList.remove("hidden")
    : ui.settings.classList.add("hidden");
}
