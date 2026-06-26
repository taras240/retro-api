import { fromHtml } from "../functions/html.js";
import { ui } from "../script.js";

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
        <div class="login-screen">
            <section class="login__section">
                <div class="login__container">
                    <div class="login-form__container">
                        <div class="login__header-container">
                            <div class="ra-img__container">
                                <img src="./assets/img/ra.png" alt="" srcset="" class="ra-img">
                            </div>
                            <h1 class="login__header">Retrocheevos</h1>
                            <p class="login__description">Unofficial retroachivements.org tracker</p>
                        </div>
                        <div class="login__input-container">
                            <input type="text" name="" id="login__ra-username" class="login__input login__text-input">
                            <label for="login__ra-username" class="login__input-label">${ui.lang.raUserName}</label>
                        </div>
                        <div class="login__input-container">
                            <input type="password" id="login__ra-api" class="login__input login__text-input">
                            <label for="login__ra-api" class="login__input-label">${ui.lang.raAPIKey}</label>
                            <a class="login__get-api" data-title="${ui.lang.gotoRASettings}"
                                href="https://retroachievements.org/controlpanel.php" target="_blank">${ui.lang.getAPIKey}</a>
                        </div>
                        <div class="login__buttons-container">
                            <button class="login__input login__button-input" id="submit-login">Submit</button>
                            <button class="login__input login__button-input login__import-settings" id="login-import-settings">Import Settings</button>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    `);

    const userNameInput = loginWindow.querySelector("#login__ra-username");
    const apiKeyInput = loginWindow.querySelector("#login__ra-api");
    const submitButton = loginWindow.querySelector("#submit-login");
    const importSettingsButton = loginWindow.querySelector("#login-import-settings");

    importSettingsButton.addEventListener("click", () => ui.importSettingsFromJson());

    submitButton.addEventListener('click', () => submitLogin());
    userNameInput.value = config.USER_NAME ?? "";
    apiKeyInput.value = config.API_KEY ?? "";
    return loginWindow;
}