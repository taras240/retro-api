const CONFIG_FILE_NAME = "retroApiConfig";
class Config {
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
    if (this.identConfirmed) {
      getAchievements();
    }
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
  get mainColor() {
    return this._cfg.settings.mainColor ?? "#201221";
  }
  get secondaryColor() {
    return this._cfg.settings.secondaryColor ?? "#181118";
  }
  get accentColor() {
    return this._cfg.settings.accentColor ?? "#57125c";
  }
  get fontColor() {
    return this._cfg.settings.fontColor ?? "#eeeeee";
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
  constructor() {
    this.readConfiguration();
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
