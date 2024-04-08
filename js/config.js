const CONFIG_FILE_NAME = "retroApiConfig";
class Config {
  //! ----------[ Login information ]------------------
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
    this.writeConfiguration();
  }
  //!-----------------[ Settings data ]--------------------
  //*-----------------[ Achieves ]-----------------
  get achivsBgVisibility() {
    return this._cfg.settings.achivsBgVisibility ?? false;
  }
  set achivsBgVisibility(value) {
    this._cfg.settings.achivsBgVisibility = value;
    this.writeConfiguration();
  }
  //*-----------------[ Target ]-----------------
  get autoClearTarget() {
    return this._cfg.settings.autoClearTarget;
  }
  set autoClearTarget(value) {
    this._cfg.settings.autoClearTarget = value;
    this.writeConfiguration();
  }
  get autoClearTargetTime() {
    return Number(this._cfg.settings.autoClearTargetTime ?? 5);
  }
  set autoClearTargetTime(value) {
    this._cfg.settings.autoClearTargetTime = value >= 0 ? value : 0;
    this.writeConfiguration();
  }
  get autoFillTarget() {
    return this._cfg.settings.autoFillTarget;
  }
  set autoFillTarget(value) {
    this._cfg.settings.autoFillTarget = value;
    this.writeConfiguration();
  }
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
      ui.settings.getGameIdButton.click();
      getAwards();
    }
  }

  get gameID() {
    return this._cfg.settings.gameID;
  }
  set gameID(value) {
    this._cfg.settings.gameID = value;
    this.writeConfiguration();
  }

  get filterAchievementsBy() {
    return this._cfg.settings.filterBy || "all";
  }
  set filterAchievementsBy(value) {
    this._cfg.settings.filterBy = value;
    this.writeConfiguration();
  }

  get sortAchievementsBy() {
    return this._cfg.settings.sortBy || "default";
  }
  set sortAchievementsBy(value) {
    this._cfg.settings.sortBy = value;
    this.writeConfiguration();
  }
  get reverseSort() {
    return this._cfg.settings.reverseSort || "1";
  }
  set reverseSort(value) {
    this._cfg.settings.reverseSort = value ? "-1" : "1";
    this.writeConfiguration();
  }
  get stretchAchievements() {
    return this._cfg.settings.stretchAchievements !== "0";
  }
  set stretchAchievements(value) {
    this._cfg.settings.stretchAchievements = value ? "1" : "0";
    this.writeConfiguration();
  }

  get updateDelay() {
    return this._cfg.settings.updateDelay;
  }
  get updateDelayInMiliSecs() {
    return this._cfg.settings.updateDelay * 1000;
  }
  set updateDelay(value) {
    this._cfg.settings.updateDelay = value;
    this.writeConfiguration();
  }

  get ui() {
    return this._cfg.ui;
  }

  get ACHIV_MIN_SIZE() {
    return this._cfg.settings.ACHIV_MIN_SIZE ?? 30;
  }
  set ACHIV_MIN_SIZE(value) {
    this._cfg.settings.ACHIV_MIN_SIZE = value;
    this.writeConfiguration();
  }
  get ACHIV_MAX_SIZE() {
    return this._cfg.settings.ACHIV_MAX_SIZE ?? 150;
  }
  set ACHIV_MAX_SIZE(value) {
    this._cfg.settings.ACHIV_MAX_SIZE = value;
    this.writeConfiguration();
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

  get bgVisibility() {
    return this._cfg.settings.bgVisibility;
  }
  set bgVisibility(value) {
    this._cfg.settings.bgVisibility = value;
    this.writeConfiguration();
  }
  //!---------------[ COLORS ]-----
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
    if (this._cfg.ui.hasOwnProperty(id)) {
      xPos ? (this._cfg.ui[id].x = xPos) : "";
      yPos ? (this._cfg.ui[id].y = yPos) : "";
      width ? (this._cfg.ui[id].width = width + "px") : "";
      height ? (this._cfg.ui[id].height = height + "px") : "";
      hidden !== undefined ? (this._cfg.ui[id].hidden = hidden) : "";
    } else {
      this._cfg.ui[id] = {
        id: id,
        x: xPos,
        y: yPos,
        width: width,
        height: height,
        hidden: hidden,
      };
    }
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
        ui: { some: 1 },
      };
    }
    this._cfg = config;
    this.writeConfiguration();
  }
  writeConfiguration() {
    localStorage.setItem(CONFIG_FILE_NAME, JSON.stringify(this._cfg));
  }
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
    mainColor: "#222831",
    secondaryColor: "#393E46",
    accentColor: "#00ADB5",
    fontColor: "#eeeeee",
    selectionColor: "#EEEEEE",
  },
  brown: {
    mainColor: "#481E14",
    secondaryColor: "#9B3922",
    accentColor: "#0C0C0C",
    fontColor: "#eeeeee",
    selectionColor: "#F2613F",
  },
  midnight: {
    mainColor: "#35374B",
    secondaryColor: "#344955",
    accentColor: "#78A083",
    fontColor: "#eeeeee",
    selectionColor: "#50727B",
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
  default: {
    mainColor: "#2f2187",
    secondaryColor: "#2c2079",
    accentColor: "#464a36",
    fontColor: "#eeeeee",
    selectionColor: "#978aff",
  },
};
