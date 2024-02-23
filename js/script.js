const userIdent = {
  API_KEY: localStorage.getItem("RAApiKey") ?? "",
  USER_NAME: localStorage.getItem("userName") ?? "",
};
// userIdent.API_KEY = localStorage.getItem("apiKey");
// userIdent.USER_NAME = localStorage.getItem("userName");
let ui = new UI();
let gameId = "1458";
let updateRateInSecs = 5;
let worker = setInterval(() => {});
const gameIdElement = document.querySelector("#game-id");

ui.gameID.value = gameId;

const requestGameProgress = "API_GetGameInfoAndUserProgress.php";
const requestUserRecentAchievements = "API_GetUserRecentAchievements.php";
const requestGetUserProfile = "API_GetUserProfile.php";

let url = `https://retroachievements.org/API/${requestGameProgress}?g=${gameId}&u=${userIdent.USER_NAME}&z=${userIdent.USER_NAME}&y=${userIdent.API_KEY}`;
function generateUrl() {
  // y  =>  Your web API key. // z  =>  Your username.// u  =>  The target username.// g  =>  The target game ID.
  // let url = "achivs.json";
  return `https://retroachievements.org/API/${requestGameProgress}?g=${gameId}&u=${userIdent.USER_NAME}&z=${userIdent.USER_NAME}&y=${userIdent.API_KEY}`;
}
updateAchivs(() => ui.fitSizeVertically());

function updateAchivs(fun) {
  fetch(generateUrl())
    .then((resp) => resp.json())
    .then((resp) => {
      ui.parseGameAchievements(resp);
      fun();
    });
  // console.log("tik");
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
