import { colorPresets } from "./enums/colorPresets.js";
import { fonts } from "./enums/fontsPreset.js";
import { loadHandle, openDB, saveHandle } from "./functions/DB.js";
import { ui } from "./script.js";
import { UI } from "./ui.js";

const CONFIG_FILE_NAME = "retroApiConfig";
const CONFIG_VERSION = 3.12;
export class Config {
  //! ----------[ Login information ]------------------
  get version() {
    return this._cfg.version ?? "0";
  }
  set version(value) {
    this._cfg.version = value;
    this.writeConfiguration();
  }
  get API_KEY() {
    return this._cfg.identification.RAApi_key;
  }
  set API_KEY(value) {
    this._cfg.identification.RAApi_key = value;
    this.writeConfiguration();

  }

  get USER_NAME() {
    return this._cfg.identification.RAApi_login;
  }
  set USER_NAME(value) {
    this._cfg.identification.RAApi_login = value;
    this.writeConfiguration();
  }

  get identConfirmed() {
    return this._cfg.identification.identConfirmed ?? false;
  }
  set identConfirmed(value) {
    this._cfg.identification.identConfirmed = value;
    this.writeConfiguration();
  }

  get userImageSrc() {
    return this._cfg.identification.userImageSrc || "";
  }
  set userImageSrc(value) {
    this._cfg.identification.userImageSrc = value;
    this.ui.buttons && (ui.buttons.userImage.src = value);
    this.writeConfiguration();
  }

  configData = new Proxy({}, {
    get: (_, property) => {
      const defValue = this.configDefaultValues[property] ?? true;
      return this.getSettingProperty(property) ?? defValue;
    },
    set: (_, property, value) => {
      const preprocessor = this.configValuePreprocessors[property];
      if (typeof preprocessor === 'function') {
        value = preprocessor(value);
      }

      this.saveSettingProperty(property, value);

      const callback = this.configSetCallbacks?.[property];
      if (typeof callback === 'function') {
        callback.call(this, value);
      }

      return true;
    }
  });
  configDefaultValues = {
    bgVisibility: false,
    bgAnimType: "",
    startOnLoad: false,
    targetUser: "",
    gameID: 1,
    updateDelaySec: 5,
    customColors: colorPresets.default,
    preset: "default",
    fsAlertDuration: 15,
    fsNewCheevo: false,
    fsNewAward: true,
    minPointsDiscordAlert: 0,
    minRetroPointsDiscordAlert: 0,
    hardOnlyDiscordAlert: false,
    fontSize: 14,
    fontFamilyName: "default", //fontSelectorName
    pauseIfOnline: false, //config.ui.pauseOffline
    discordNewGame: true, //_cfg?.discordNewGame
    discordNewCheevo: true, //_cfg?.discordNewCheevo
    discordNewAward: true, //_cfg?.discordNewAward
    discordStartSession: true, //_cfg?.discordStartSession
    discordWebhook: "", //_cfg.discordWebhook,
    parseLog: false, //logfileHandle for retroarch
    showCheevoOnHover: false,
    loadLastSubset: true,
  }
  configValuePreprocessors = {
    updateDelaySec: (value) => parseInt(value) < 5 ? 5 : parseInt(value),
    customColors: ({ colorProperty, color }) => {
      // color = color.toUpperCase();
      // console.log("colors", color);
      const colors = {
        ...configData.customColors,
        ...{ [colorProperty]: color }
      }
      return colors;
    },
    fsAlertDuration: (value) => value < 5 ? 5 : value > 60 ? 60 : value,
    minPointsDiscordAlert: (value) => parseInt(value) >= 0 ? value : 0,
    minRetroPointsDiscordAlert: (value) => parseInt(value) >= 0 ? value : 0,

  };
  configSetCallbacks = {
    targetUser() {
      if (this.identConfirmed) {
        ui.settings.getLastGameID();
        ui.awards.updateAwards();
      }
    },
    bgVisibility(value) {
      ui.toggleBgAnimation(value)
      // const bgElement = document.querySelector("#background-animation");
      // bgElement && (bgElement.style.display = value ? "block" : "none");
    },
    bgAnimType(value) {
      ui.toggleBgAnimation(false);
      ui.toggleBgAnimation(true);
    },
    customColors() {
      this.configData.preset = "custom";
    },
    preset(value) {
      UI.updateColors();
    },
    fontSize(size) {
      document.documentElement.style.setProperty('font-size', `${size}px`);
    },
    fontFamilyName(fontName) {
      const fontNames = Object.keys(fonts);
      if (fontNames.includes(fontName)) {
        const fontLink = document.createElement('link');
        fontLink.rel = 'stylesheet';
        fontLink.href = fonts[fontName];
        document.head.appendChild(fontLink);
        document.documentElement.style.setProperty("--font-family", `"${fontName}", system-ui, sans-serif`);
      }
      else {
        document.documentElement.style.setProperty("--font-family", `system-ui, sans-serif`);
      }
    }

  }

  get ui() {
    return this._cfg.ui;
  }
  get gamesDB() {
    this._cfg.gamesDB || (this._cfg.gamesDB = {})
    return this._cfg.gamesDB;
  }
  get cheevosDB() {
    this._cfg.cheevosDB || (this._cfg.cheevosDB = {})
    return this._cfg.cheevosDB;
  }
  async getFileHandle(emuName = "log") {
    const fileHandle = await loadHandle(emuName)
    return fileHandle;
  }
  constructor() {
    this.readConfiguration();
    this.fixConfig();
  }
  fixConfig = () => {
    if (this.version === CONFIG_VERSION) return;
    try {

      delete this._cfg.apiWorker;
      delete this._cfg.aotw;

      this.version = CONFIG_VERSION;
      this.writeConfiguration();
    }
    catch (err) {
      console.error(err)
    }
  }


  setNewPosition({ id, xPos, yPos, width, height, hidden }) {
    // console.log(id, hidden);
    if (!this._cfg.ui.hasOwnProperty(id)) {
      this._cfg.ui[id] = {
        id: id,
        x: xPos,
        y: yPos,
        width: width,
        height: height,
        hidden: hidden,
      };
    }
    xPos ? (this._cfg.ui[id].x = xPos) : "";
    yPos ? (this._cfg.ui[id].y = yPos) : "";
    width ? (this._cfg.ui[id].width = width + "px") : "";
    height ? (this._cfg.ui[id].height = height + "px") : "";
    hidden !== undefined ? (this._cfg.ui[id].hidden = hidden) : "";
    this.writeConfiguration();
  }
  readConfiguration() {

    let config = JSON.parse(localStorage.getItem(CONFIG_FILE_NAME));

    if (!config) {
      config = {
        identification: {
          RAApi_key: "",
          RAApi_login: "",
        },
        settings: {
          updateDelaySec: 5,
        },
        ui: {},
      };


    }
    this._cfg = config;
    localStorage.setItem(CONFIG_FILE_NAME, JSON.stringify(this._cfg));
    this.writeConfiguration();
  }
  saveUIProperty({ sectionID, property, value }) {
    if (sectionID && property) {
      if (!this.ui[sectionID]) {
        this.ui[sectionID] = {};
      }
      this.ui[sectionID][property] = value;
      this.writeConfiguration()
    }
  }
  saveSettingProperty(property, value) {
    if (property) {
      this._cfg.settings[property] = value;
      this.writeConfiguration()
    }
  }
  getUIProperty({ sectionID, property }) {
    if (sectionID && property) {
      return this.ui[sectionID] ? this.ui[sectionID][property] : undefined;
    }
  }
  getSettingProperty(property) {
    if (property) {
      return this._cfg.settings[property];
    }
  }
  delayedWrite;
  writeConfiguration() {
    clearTimeout(this.delayedWrite);
    this.delayedWrite = setTimeout(() => {
      localStorage.setItem(CONFIG_FILE_NAME, JSON.stringify(this._cfg));
    }, 500)
  }
  async selectLogFile(emuName) {

    async function readFile(fileHandle) {
      // Перевірка дозволу
      let perm = await fileHandle.queryPermission({ mode: "read" });
      if (perm !== "granted") {
        console.warn("Доступ не надано");
      }
      else {
        console.log("Доступ надано")
      }

    }
    let [fileHandle] = await window.showOpenFilePicker({
      types: [{ description: "Log files", accept: { "text/plain": [".log"] } }]
    });
    await saveHandle(fileHandle, emuName);
    await readFile(fileHandle);
  }

}
