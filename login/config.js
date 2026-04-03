let CONFIG_FILE_NAME = "retroApiConfig";
export class Config {
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


  constructor() {
    this.readLocationParams();

    this.readConfiguration();
  }

  readConfiguration() {
    CONFIG_FILE_NAME += this.urlConfig?.id ?? "";
    let config = JSON.parse(localStorage.getItem(CONFIG_FILE_NAME));

    if (!config) {
      config = {
        identification: {
          RAApi_key: "",
          RAApi_login: "",
        },
        settings: {
        },
        ui: {},
      };


    }
    this._cfg = config;
    localStorage.setItem(CONFIG_FILE_NAME, JSON.stringify(this._cfg));
    this.writeConfiguration();
  }

  readLocationParams = () => {
    const params = new URLSearchParams(location.search);
    const allowed = ["uiLayout", "id"];
    this.urlConfig = Object.fromEntries(
      [...params].filter(([key]) => allowed.includes(key))
    );
  };
  writeConfiguration() {
    localStorage.setItem(CONFIG_FILE_NAME, JSON.stringify(this._cfg));

  }

}
