let userIdent = {
  API_KEY: localStorage.getItem("RAApiKey") ?? "",
  USER_NAME: localStorage.getItem("RAUserName") ?? "",
};
let gameID = localStorage.getItem("gameID") ?? "";
let updateRateInSecs = 5;
let ui = new UI();
let apiWorker = new APIWorker();
let apiTikInterval;
function updateUserIdent({ loginName, apiKey }) {
  loginName ? localStorage.setItem("RAUserName", loginName) : "";
  apiKey ? localStorage.setItem("RAApiKey", apiKey) : "";
  userIdent = {
    API_KEY: localStorage.getItem("RAApiKey") ?? "",
    USER_NAME: localStorage.getItem("RAUserName") ?? "",
  };
  apiWorker = new APIWorker();
}
function updateGameID(id) {
  gameID = id;
  localStorage.setItem("RAGameID", id);
  updateAchivs();
}
function updateAchivs() {
  apiWorker.getGameProgress({ gameID: gameID }).then((resp) => {
    // console.log(resp);
    ui.parseGameAchievements(resp);
    ui.updateGameCardInfo(resp);
    ui.fitSizeVertically();
  });
}

function startWatching() {
  updateAchivs();

  apiTikInterval = setInterval(() => {
    updateAchivs();
  }, updateRateInSecs * 1000);
}
function stopWatching() {
  clearInterval(apiTikInterval);
}

function closeSettings() {
  ui.settings.classList.add("hidden");
}
function openSettings() {
  ui.settings.classList.contains("hidden")
    ? ui.settings.classList.remove("hidden")
    : ui.settings.classList.add("hidden");
}

function closeGameCard() {
  ui.gameCard.classList.add("hidden");
}
function openGameCard() {
  ui.gameCard.classList.contains("hidden")
    ? ui.gameCard.classList.remove("hidden")
    : ui.gameCard.classList.add("hidden");
}
///////////////////////////
///       MOVE SETTINGS
///////////////////////////
let offsetX, offsetY;
ui.settings.addEventListener("mousedown", (e) => {
  offsetX = e.clientX - ui.settings.getBoundingClientRect().left;
  offsetY = e.clientY - ui.settings.getBoundingClientRect().top;
  ui.settings.classList.add("dragable");
  ui.settings.addEventListener("mousemove", moveSettingsWindow);
});

ui.settings.addEventListener("mouseup", (e) => {
  ui.settings.classList.remove("dragable");
  ui.settings.removeEventListener("mousemove", moveSettingsWindow);
  e.preventDefault();
});
ui.settings.addEventListener("mouseleave", (e) => {
  ui.settings.classList.remove("dragable");
  ui.settings.removeEventListener("mousemove", moveSettingsWindow);
  e.preventDefault();
});
function moveSettingsWindow(e) {
  e.preventDefault();
  ui.settings.style.left = e.clientX - offsetX + "px";
  ui.settings.style.top = e.clientY - offsetY + "px";
}
///////////////////////////
///       MOVE GAME-CARD
///////////////////////////
ui.gameCard.addEventListener("mousedown", (e) => {
  offsetX = e.clientX - ui.gameCard.getBoundingClientRect().left;
  offsetY = e.clientY - ui.gameCard.getBoundingClientRect().top;
  ui.gameCard.classList.add("dragable");
  ui.gameCard.addEventListener("mousemove", moveGameCardWindow);
});

ui.gameCard.addEventListener("mouseup", (e) => {
  ui.gameCard.classList.remove("dragable");
  ui.gameCard.removeEventListener("mousemove", moveGameCardWindow);
  e.preventDefault();
});
ui.gameCard.addEventListener("mouseleave", (e) => {
  ui.gameCard.classList.remove("dragable");
  ui.gameCard.removeEventListener("mousemove", moveGameCardWindow);
  e.preventDefault();
});
function moveGameCardWindow(e) {
  e.preventDefault();
  ui.gameCard.style.left = e.clientX - offsetX + "px";
  ui.gameCard.style.top = e.clientY - offsetY + "px";
}
