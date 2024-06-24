import { Config } from "./config.js";
import { UI } from "./ui.js";
import { APIWorker } from "./apiWorker.js"

let config, ui, apiWorker, userAuthData;

const userAgent = navigator.userAgent || navigator.vendor || window.opera;

if (/android/i.test(userAgent) || (/iPhone/.test(userAgent) && !window.MSStream)) {
  window.location.href = "./mobile/index.html";
}

else {
  config = new Config();
  // Ініціалізація UI
  ui = new UI();
  // Ініціалізація APIWorker 
  apiWorker = new APIWorker();
  window.ui = ui;
  window.config = config;
  // userAuthData = new UserAuthData();
}
document.addEventListener('keydown', checkKonamiCode);
let konamiCode = [];
let konamiCount = 0;
let removeSecretTimeout = 0;
function checkKonamiCode(event) {
  const codes = ["ArrowUp", "ArrowUp", "ArrowDown", "ArrowDown", "ArrowLeft", "ArrowRight", "ArrowLeft", "ArrowRight", "KeyB", "KeyA"];
  const enteredKey = event.code;
  if (enteredKey === codes[konamiCode.length]) {
    konamiCode.push(enteredKey);
    konamiCode.length === codes.length && (konamiCount = konamiCount === 1 ? 2 : 1, doMusic());
  }
  else {
    konamiCode = [];
  }
}
function doMusic() {
  removeSecretTimeout && clearTimeout(removeSecretTimeout);
  document.querySelector("#secret")?.remove();
  let ad = document.createElement("audio");
  konamiCode.length !== 10 && (ad = null);
  konamiCode = [];
  ad.id = "secret";
  ad.innerHTML = `
    <source src="./assets/s/ss-${konamiCount}.m4a" type="audio/mpeg">
  `;
  ui.app.appendChild(ad);
  ad.play();
  const bcg = document.querySelector("#background-animation");
  bcg.style.opacity = 0;
  setTimeout(() => {
    bcg.style.opacity = 1;
    bcg.classList.add("secret");
    document.querySelector("#background-animation").style.display = "block";
  }, 2000);
  const durationInSecs = konamiCount === 2 ? 4 * 60 : 1.1 * 60;
  removeSecretTimeout = setTimeout(() => {
    bcg.classList.remove("secret");
    document.querySelector("#background-animation").style.display =
      config.bgVisibility ? "block" : "none";

  }, durationInSecs * 1000)
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



export { config, ui, apiWorker, userAuthData }