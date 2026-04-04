import { Config } from "./config.js";
import { UI } from "./ui.js";
import { APIWorker } from "./apiWorker.js"
import { Watcher } from "./watcher.js";
let config, ui, apiWorker, watcher, APIEvents, userAuthData;

const userAgent = navigator.userAgent || navigator.vendor || window.opera;

if (/android/i.test(userAgent) || (/iPhone/.test(userAgent) && !window.MSStream)) {
  window.location.href = "./mobile/index.html";
}
else {
  APIEvents = new EventTarget();
  config = new Config();
  ui = new UI();
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
  const urlParams = new URLSearchParams(location.search);
  window.location.href = `./login?${urlParams.toString()}`;
}

export { config, ui, apiWorker, watcher, APIEvents, userAuthData }
export const { configData } = config