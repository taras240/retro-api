import { Config } from "./config.js";
import { UI } from "./ui.js";
import { Watcher } from "./watcher.js";
import { isSupported } from "./functions/main/isSupported.js";
import { fromHtml } from "./functions/html.js";
import { initRaapi, raapi } from "./api/index.js";
let config, ui, watcher, APIEvents, UIEvents, userAuthData;
const userAgent = navigator.userAgent || navigator.vendor || window.opera;

if (false && !isSupported()) {
  document.body.replaceChildren();
  document.body.append(fromHtml(`
    <div style="font-family: 'system-ui','arial'; font-size: 2rem;">This platform is not supported.</div>
  `));
}
else if (/android/i.test(userAgent) || (/iPhone/.test(userAgent) && !window.MSStream)) {
  window.location.href = "./mobile/index.html";
}
else {
  const initialize = async () => {
    config = new Config();
    try {
      await config.ready;
    }
    catch (error) {
      console.error("Failed to initialize configuration", error);
      const loading = document.querySelector(".loading-section");
      if (loading) {
        loading.dataset.message = "Failed to load UI layout settings";
      }
      return;
    }

    APIEvents = new EventTarget();
    window.APIEvents = APIEvents;

    UIEvents = new EventTarget();
    window.UIEvents = UIEvents;

    window.config = config;
    window.configData = config.configData;

    initRaapi(config);
    window.raapi = raapi;

    ui = new UI();
    window.ui = ui;

    watcher = new Watcher();
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
  };
  initialize();
}
