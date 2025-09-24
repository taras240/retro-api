import { Config } from "./config.js";
import { UI } from "./ui.js";
import { APIWorker } from "./apiWorker.js"
import { Watcher } from "./watcher.js";
let config, ui, apiWorker, watcher, userAuthData;

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
  watcher = new Watcher();
  window.ui = ui;
  window.config = config;
  window.configData = config.configData;
  window.apiWorker = apiWorker;
  window.watcher = watcher;
  // userAuthData = new UserAuthData();
}
if (!config.identConfirmed) {
  console.log('redirect to login')
  window.location.href = "./login";
}
// document.addEventListener('keydown', checkKonamiCode);
// let konamiCode = [];
// let konamiCount = 0;
// let removeSecretTimeout = 0;
// function checkKonamiCode(event) {
//   const codes = ["ArrowUp", "ArrowUp", "ArrowDown", "ArrowDown", "ArrowLeft", "ArrowRight", "ArrowLeft", "ArrowRight", "KeyB", "KeyA"];
//   const enteredKey = event.code;
//   if (enteredKey === codes[konamiCode.length]) {
//     konamiCode.push(enteredKey);
//     konamiCode.length === codes.length && (console.log("konami code entered"));
//   }
//   else {
//     konamiCode = [];
//   }
// }
// function doMusic() {
//   removeSecretTimeout && clearTimeout(removeSecretTimeout);
//   document.querySelector("#secret")?.remove();
//   let ad = document.createElement("audio");
//   konamiCode.length !== 10 && (ad = null);
//   konamiCode = [];
//   ad.id = "secret";
//   ad.innerHTML = `
//     <source src="./assets/s/ss-${0}.m4a" type="audio/mpeg">
//   `;
//   ui.app.appendChild(ad);
//   ad.play();
//   const bcg = document.querySelector("#background-animation");
//   bcg.style.opacity = 0;
//   setTimeout(() => {
//     bcg.style.opacity = 1;
//     bcg.classList.add("secret");
//     document.querySelector("#background-animation").style.display = "block";
//   }, 2000);
//   const durationInSecs = konamiCount === 2 ? 4 * 60 : 1.1 * 60;
//   removeSecretTimeout = setTimeout(() => {
//     bcg.classList.remove("secret");
//     document.querySelector("#background-animation").style.display =
//       config.configData.bgVisibility ? "block" : "none";

//   }, durationInSecs * 1000)
// }

export { config, ui, apiWorker, watcher, userAuthData }
export const { configData } = config