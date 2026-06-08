
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

  get userImageSrc() {
    return this._cfg.identification.userImageSrc || "";
  }
  set userImageSrc(value) {
    this._cfg.identification.userImageSrc = value;
    this.ui.buttons && (ui.buttons.userImage.src = value);
    this.writeConfiguration();
  }

  //!-----------------[ Settings data ]--------------------

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

  get ui() {
    return this._cfg.ui;
  }

  constructor() {

    this.readConfiguration();
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
          updateDelay: 15,
          sort: "default",
          gameID: 1,
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
export class UserAuthData {
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