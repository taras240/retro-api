let userIdent = {
  API_KEY: localStorage.getItem("RAApiKey") ?? "",
  USER_NAME: localStorage.getItem("RAUserName") ?? "",
};
let gameID = localStorage.getItem("gameID") ?? "";
let updateRateInSecs = 5;
let ui = new UI();
let apiWorker = new APIWorker();

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
document
  .querySelector(".settings_container")
  .addEventListener("click ", (e) => {
    console.log(e);
  });
