import { apiWorker, config, ui } from "../main.js";
let submitButton, usernameInput, apikeyInput;
const updateLogin = ({ userName, apiKey, userObj }) => {
    config.USER_NAME = userName;
    config.API_KEY = apiKey;
    config.identConfirmed = true;
    config.userImageSrc = `https://media.retroachievements.org${userObj?.UserPic}`;
    submitButton.classList.remove("error");
    submitButton.classList.add("verified");
}
const submitRAData = () => {
    let userName = usernameInput?.value ?? "";
    let apiKey = apikeyInput?.value ?? "";

    apiWorker
        .verifyUserIdent({ userName, apiKey })
        .then((userObj) => {
            if (!userObj.ID) {
                config.identConfirmed = false;
                submitButton.classList.add("error");
                submitButton.classList.remove("verified");

            }
            else {
                updateLogin({
                    userName,
                    apiKey,
                    userObj,
                });

                setTimeout(() => {
                    ui.goto.home();
                    location.reload(true)
                }, 1000)
            }
        });
}
export const Login = () => {
    const sectionUrl = './sections/login.elem';
    return fetch(sectionUrl)
        .then(responce => responce.text())
        .then(sectionHTML => {
            const sectionElement = document.createElement("section");
            sectionElement.className = "login__section";
            sectionElement.innerHTML = sectionHTML;

            submitButton = sectionElement.querySelector("#login__submit-button");
            usernameInput = sectionElement.querySelector("#login_user-name");
            apikeyInput = sectionElement.querySelector("#login__api-key");

            return sectionElement;
        })
        .then(sectionElement => {
            usernameInput.value = config?.USER_NAME ?? "";
            apikeyInput.value = config?.API_KEY ?? "";
            submitButton.classList.toggle("verified", config.identConfirmed);

            submitButton.addEventListener("click", e => {
                submitRAData();
            })
            return sectionElement;
        })
}