"use strict";
const CONFIG_FILE_NAME = "retroApiConfig";
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
  get DISCORD_WEBHOOK() {
    return this._cfg.discordWebhook;
  }
  set DISCORD_WEBHOOK(value) {
    this._cfg.discordWebhook = value;
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

  //!-----------------[ Settings data ]--------------------
  get startOnLoad() {
    return this._cfg.settings.startOnLoad;
  }
  set startOnLoad(value) {
    this._cfg.settings.startOnLoad = value;
    this.writeConfiguration();
  }
  get targetUser() {
    return this._cfg.settings.targetUser || this.USER_NAME;
  }
  set targetUser(value) {
    this._cfg.settings.targetUser = value;
    this.writeConfiguration();
    if (this.identConfirmed) {
      ui.settings.getLastGameID();
      ui.awards.updateAwards();
    }
  }
  get gameID() {
    return this._cfg.settings.gameID;
  }
  set gameID(value) {
    this._cfg.settings.gameID = value;
    this.writeConfiguration();
  }
  get updateDelay() {
    const delay = this._cfg.settings.updateDelay;
    return delay < 5 ? 5 : delay;
  }
  get updateDelayInMiliSecs() {
    return this._cfg.settings.updateDelay * 1000;
  }
  set updateDelay(value) {
    let delay = parseInt(value) > 0 ? value : 10;
    this._cfg.settings.updateDelay = delay;
    this.writeConfiguration();
  }
  get bgVisibility() {
    return this._cfg.settings.bgVisibility ?? true;
  }
  set bgVisibility(value) {
    this._cfg.settings.bgVisibility = value;
    this.writeConfiguration();
  }
  get targetMoveToTop() {
    return this._cfg.settings.targetMoveToTop;
  }
  set targetMoveToTop(value) {
    this._cfg.settings.targetMoveToTop = value;
    this.writeConfiguration();
  }
  get aotw() {
    function isActualDate(dateString) {
      const now = new Date();
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(now.getDate() - 7);

      const eventStartDate = new Date(dateString)
      return eventStartDate > oneWeekAgo;
    }
    const aotw = this._cfg.aotw;

    const isActual = aotw && isActualDate(aotw.StartAt)
    return isActual ? this._cfg.aotw : false;
  }
  set aotw(aotw) {
    this._cfg.aotw = aotw;
    this.writeConfiguration();
  }
  get ui() {
    return this._cfg.ui;
  }
  //!---------------[ COLORS ]-----
  get mainColor() {
    return this._cfg.settings.mainColor ?? colorPresets.default.mainColor;
  }
  get secondaryColor() {
    return (
      this._cfg.settings.secondaryColor ?? colorPresets.default.secondaryColor
    );
  }
  get accentColor() {
    return this._cfg.settings.accentColor ?? colorPresets.default.accentColor;
  }
  get fontColor() {
    return this._cfg.settings.fontColor ?? colorPresets.default.fontColor;
  }
  get selectionColor() {
    return (
      this._cfg.settings.selectionColor ?? colorPresets.default.selectionColor
    );
  }
  set mainColor(value) {
    this._cfg.settings.mainColor = value;
    this.writeConfiguration();
  }
  set secondaryColor(value) {
    this._cfg.settings.secondaryColor = value;
    this.writeConfiguration();
  }
  set accentColor(value) {
    this._cfg.settings.accentColor = value;
    this.writeConfiguration();
  }
  set fontColor(value) {
    this._cfg.settings.fontColor = value;
    this.writeConfiguration();
  }
  set selectionColor(value) {
    this._cfg.settings.selectionColor = value;
    this.writeConfiguration();
  }
  get colorsPreset() {
    return this._cfg.settings.preset || "default";
  }
  set colorsPreset(value) {
    this._cfg.settings.preset = value;
    this.writeConfiguration();
  }

  //!---------------[ COLORS ]-----------------------------------
  constructor() {

    this.readConfiguration();
  }

  getColors(preset) {
    this.colorsPreset = preset;
    if (preset === "custom") {
      return {
        mainColor: this.mainColor,
        secondaryColor: this.secondaryColor,
        accentColor: this.accentColor,
        fontColor: this.fontColor,
        selectionColor: this.selectionColor,
      };
    }
    return colorPresets[preset] || colorPresets.default;
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
          updateDelay: 5,
          sort: "default",
          gameID: 1,
          ACHIV_MAX_SIZE: 150,
          ACHIV_MIN_SIZE: 30,
        },
        ui: {},
      };


    }
    this._cfg = config;
    localStorage.setItem(CONFIG_FILE_NAME, JSON.stringify(this._cfg));
    this.writeConfiguration();
  }
  delayedWrite;
  writeConfiguration() {
    clearTimeout(this.delayedWrite);
    this.delayedWrite = setTimeout(() => {
      localStorage.setItem(CONFIG_FILE_NAME, JSON.stringify(this._cfg));
    }, 1000)
  }

}
class UserAuthData {
  get user() {
    return this._user ?? {};
  }
  set user(value) {
    this._user = value;
    this.isSignedIn = true;
    ui.loginCard?.linkGoogleButton.classList.add("linked");
    // this.getData().then((resp) => this.savedData = resp)
  }
  constructor() {
    this.isSignedIn = false;
  }
  removeUser() {
    userAuthData = new UserAuthData();
  }
  async saveData(data) {
    if (this.isSignedIn) {
      await saveData(data);
    }
  }
  async getData() {
    if (this.isSignedIn) {
      const resp = await getData();
      console.log(resp);
      return resp;
    }
  }

  static authConfig = {
    apiKey: "AIzaSyCElKaoNY84fF61cRb-mUgSS0dy1OBr2P8",
    authDomain: "retrocheevos.firebaseapp.com",
    projectId: "retrocheevos",
    storageBucket: "retrocheevos.appspot.com",
    messagingSenderId: "759529169587",
    appId: "1:759529169587:web:d570ee8023a18590f186c6",
    measurementId: "G-KXGL1SB2LW"
  };
}
const colorPresets = {
  pink: {
    mainColor: "#F2BED1",
    secondaryColor: "#FDCEDF",
    accentColor: "#F8E8EE",
    fontColor: "#000000",
    selectionColor: "#FF5BAE",
  },
  lightgreen: {
    mainColor: "#A5DD9B",
    secondaryColor: "#C5EBAA",
    accentColor: "#F2C18D",
    fontColor: "#000000",
    selectionColor: "#F6F193",
  },
  lightblue: {
    mainColor: "#89CFF3",
    secondaryColor: "#A0E9FF",
    accentColor: "#00A9FF",
    fontColor: "#000000",
    selectionColor: "#CDF5FD",
  },
  blue: {
    mainColor: "#008DDA",
    secondaryColor: "#41C9E2",
    accentColor: "#ACE2E1",
    fontColor: "#000000",
    selectionColor: "#F7EEDD",
  },
  synthwave: {
    mainColor: "#5D0E41",
    secondaryColor: "#A0153E",
    accentColor: "#FF204E",
    fontColor: "#dedede",
    selectionColor: "#00224D",
  },
  darkblue: {
    "mainColor": "#1f1f1f",
    "secondaryColor": "#303134",
    "accentColor": "#34517d",
    "fontColor": "#d6d6d6",
    "selectionColor": "#2c303d"
  },
  brown: {
    mainColor: "#481E14",
    secondaryColor: "#9B3922",
    accentColor: "#0C0C0C",
    fontColor: "#eeeeee",
    selectionColor: "#F2613F",
  },
  pastel: {
    mainColor: "#51829B",
    secondaryColor: "#9BB0C1",
    accentColor: "#F6995C",
    fontColor: "#000",
    selectionColor: "#EADFB4",
  },
  retro: {
    mainColor: "#1D2B53",
    secondaryColor: "#333A73",
    accentColor: "#387ADF",
    fontColor: "#cdcdcd",
    selectionColor: "#FBA834",
  },
  vintage: {
    mainColor: "#222831",
    secondaryColor: "#31363F",
    accentColor: "#76ABAE",
    fontColor: "#eeeeee",
    selectionColor: "#EEEEEE",
  },
  neon: {
    mainColor: "#7E2553",
    secondaryColor: "#FF004D",
    accentColor: "#FAEF5D",
    fontColor: "#000000",
    selectionColor: "#50C4ED",
  },
  gray: {
    mainColor: "#808080",
    secondaryColor: "#757575",
    accentColor: "#cfcfcf",
    fontColor: "#000000",
    selectionColor: "#2ab754",
  },
  default: {
    mainColor: "#070F2B",
    secondaryColor: "#1B1A55",
    accentColor: "#535C91",
    fontColor: "#eeeeee",
    selectionColor: "#9290C3",
  },
  // default: {
  //   mainColor: "#3a037c",
  //   secondaryColor: "#121212",
  //   accentColor: "#058509",
  //   fontColor: "#d6d6d6",
  //   selectionColor: "#ffffff",
  // },
};
