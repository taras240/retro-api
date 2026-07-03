import { Config } from "./config.js";
import { UI } from "./ui.js";
import { Watcher } from "./watcher.js";
import { initSubsets } from "./functions/api/subsets.js";
import { isSupported } from "./functions/main/isSupported.js";
import { fromHtml } from "./functions/html.js";
let config, ui, watcher, APIEvents, UIEvents, userAuthData;
const userAgent = navigator.userAgent || navigator.vendor || window.opera;

if (!isSupported()) {
  document.body.innerHTML = "";
  document.body.append(fromHtml(`
    <div style="font-family: 'system-ui','arial'; font-size: 2rem;">This platform is not supported.</div>
  `));
}
else if (/android/i.test(userAgent) || (/iPhone/.test(userAgent) && !window.MSStream)) {
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

  if (window.__TAURI__) {
    let requestId = 0;
    window.invokeRust = (method, ...args) => {
      return new Promise((resolve, reject) => {
        const id = ++requestId;

        function listener(event) {
          if (event.data.id !== id) return;

          window.removeEventListener("message", listener);

          if (event.data.error)
            reject(event.data.error);
          else
            resolve(event.data.result);
        }

        window.addEventListener("message", listener);

        parent.postMessage({
          id,
          method,
          args
        }, "*");
      });
    }

  }
}

export { config, ui, watcher, APIEvents, UIEvents, userAuthData }
export const { configData } = config