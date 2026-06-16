import { Config } from "./config.js";
import { UI } from "./ui.js";
import { Watcher } from "./watcher.js";
import { initSubsets } from "./functions/api/subsets.js";
let config, ui, watcher, APIEvents, UIEvents, userAuthData;

const userAgent = navigator.userAgent || navigator.vendor || window.opera;

if (/android/i.test(userAgent) || (/iPhone/.test(userAgent) && !window.MSStream)) {
  window.location.href = "./mobile/index.html";
}
else {
  APIEvents = new EventTarget();
  UIEvents = new EventTarget();
  config = new Config();
  ui = new UI();
  watcher = new Watcher();
  window.ui = ui;
  window.config = config;
  window.configData = config.configData;
  window.watcher = watcher;
  // userAuthData = new UserAuthData();
}

export { config, ui, watcher, APIEvents, UIEvents, userAuthData }
export const { configData } = config