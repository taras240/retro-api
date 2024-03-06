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
  get gameID() {
    return this._cfg.settings.gameID;
  }
  set gameID(value) {
    this._cfg.settings.gameID = value;
    this.writeConfiguration();
    getAchievements();
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
  constructor() {
    this.readConfiguration();
  }
  setNewPosition({ id, xPos, yPos, width, height, hidden }) {
    if (this._cfg.ui.hasOwnProperty(id)) {
      xPos ? (this._cfg.ui[id].x = xPos) : "";
      yPos ? (this._cfg.ui[id].y = yPos) : "";
      width ? (this._cfg.ui[id].width = width + "px") : "";
      height ? (this._cfg.ui[id].height = height + "px") : "";
      this._cfg.ui[id].hidden = hidden;
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
