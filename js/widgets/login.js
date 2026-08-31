import { fromHtml } from "../functions/html.js";
import { getRaKeyUrl } from "../functions/raLinks.js";

export function LoginWindowElement(config) {
    const verifyUserIdent = ({ userName, apiKey }) => {
        let url = `https://retroachievements.org/API/API_GetUserProfile.php?u=${userName}&y=${apiKey}`;
        return fetch(url).then((resp) => resp.json());
    }
    const submitLogin = () => {
        const urlParams = new URLSearchParams(location.search);
        const userName = userNameInput.value;
        const apiKey = apiKeyInput.value;
        verifyUserIdent({ userName: userName, apiKey: apiKey })
            .then((userObj) => {
                if (!userObj.ID) errorLogin();
                else {
                    updateLogin({
                        userName: userName,
                        apiKey: apiKey,
                        userObj: userObj,
                    });
                    setTimeout(() => location.reload(), 500);
                }
            })
            .catch(() => errorLogin());
    }
    const updateLogin = ({ userName, apiKey, userObj }) => {
        config.USER_NAME = userName;
        config.API_KEY = apiKey;
        config.identConfirmed = true;
        config.userImageSrc = `https://media.retroachievements.org${userObj?.UserPic}`;
        submitButton.classList.remove("error");
        submitButton.classList.add("verified");
    }

    const errorLogin = () => {
        config.identConfirmed = false;
        submitButton.classList.remove("verified");
        submitButton.classList.add("error");
    }


    const loginWindow = fromHtml(`
        <.login-screen>
            <section.login__section>
                <.login__container>
                    <.login-form__container>
                        <.login__header-container>
                            <.ra-img__container>
                                <img.ra-img src="./assets/img/tr_logo.png">
                            </>
                            <h1.login__header>Retrocheevos</h1>
                            <p.login__description>Unofficial retroachivements.org tracker</p>
                        </>
                        <.login__input-container>
                            <input id="login__ra-username" class="login__input login__text-input" type="text">
                            <label for="login__ra-username" class="login__input-label">${lang.raUserName}</label>
                        </>
                        <.login__input-container">
                            <input type="password" id="login__ra-api" class="login__input login__text-input">
                            <label for="login__ra-api" class="login__input-label">${lang.raAPIKey}</label>
                            <a class="login__get-api" data-title="${lang.gotoRASettings}"
                                href="${getRaKeyUrl}" target="_blank">${lang.getAPIKey}</a>
                        </>
                        <.login__buttons-container">
                            <button class="login__input login__button-input" id="submit-login">Submit</button>
                            <button class="login__input login__button-input login__import-settings" id="login-import-settings">Import Settings</button>
                        </>
                    </>
                </>
            </section>
        </>
    `);

    const userNameInput = loginWindow.querySelector("#login__ra-username");
    const apiKeyInput = loginWindow.querySelector("#login__ra-api");
    const submitButton = loginWindow.querySelector("#submit-login");
    const importSettingsButton = loginWindow.querySelector("#login-import-settings");

    importSettingsButton.addEventListener("click", () => config.importSettingsFromJson());

    submitButton.addEventListener('click', () => submitLogin());
    userNameInput.value = config.USER_NAME ?? "";
    apiKeyInput.value = config.API_KEY ?? "";
    return loginWindow;
}