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
  setNewPosition({ id, xPos, yPos, width, height }) {
    if (this._cfg.ui.hasOwnProperty(id)) {
      xPos ? (this._cfg.ui[id].x = xPos) : "";
      yPos ? (this._cfg.ui[id].y = yPos) : "";
      width ? (this._cfg.ui[id].width = width + "px") : "";
      height ? (this._cfg.ui[id].height = height + "px") : "";
    } else {
      this._cfg.ui[id] = {
        id: id,
        x: xPos,
        y: yPos,
        width: width,
        height: height,
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

/**
 * Об'єкт з методами сортування для досягнень гри
 */
const sortBy = {
  /**
   * Сортує за найновішою датою, враховуючи якщо доступні обидві дати
   * @param {Object} a - перше досягнення
   * @param {Object} b - друге досягнення
   * @returns {number} - результат порівняння
   */
  latest: (a, b) => {
    // Перевіряємо, чи існують дати та обираємо найновішу
    const dateA = a.DateEarnedHardcore
      ? new Date(a.DateEarnedHardcore)
      : -Infinity;
    const dateB = b.DateEarnedHardcore
      ? new Date(b.DateEarnedHardcore)
      : -Infinity;
    const dateA2 = a.DateEarned ? new Date(a.DateEarned) : -Infinity;
    const dateB2 = b.DateEarned ? new Date(b.DateEarned) : -Infinity;
    const maxDateA = Math.max(dateA, dateA2);
    const maxDateB = Math.max(dateB, dateB2);
    return maxDateB - maxDateA; // Повертає різницю дат
  },

  /**
   * Сортує за кількістю зароблених досягнень у хардкорному режимі
   * @param {Object} a - перше досягнення
   * @param {Object} b - друге досягнення
   * @returns {number} - результат порівняння
   */
  earnedCount: (a, b) => b.NumAwardedHardcore - a.NumAwardedHardcore,

  /**
   * Сортує за кількістю очок досягнення
   * @param {Object} a - перше досягнення
   * @param {Object} b - друге досягнення
   * @returns {number} - результат порівняння
   */
  points: (a, b) => a.Points - b.Points,

  /**
   * За замовчуванням не змінює порядок елементів
   * @param {Object} a - перше досягнення
   * @param {Object} b - друге досягнення
   * @returns {number} - результат порівняння
   */
  default: (a, b) => 0,
};
