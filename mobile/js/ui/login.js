import { config } from "../main.js";

export const Login = () => {
    const sectionUrl = './sections/login.elem';
    return fetch(sectionUrl)
        .then(responce => responce.text())
        .then(sectionHTML => {
            const sectionElement = document.createElement("section");
            sectionElement.className = "login__section";
            sectionElement.innerHTML = sectionHTML;
            return sectionElement;
        })
        .then(sectionElement => {
            config.USER_NAME && (sectionElement.querySelector("#login_user-name").value = config.USER_NAME);
            config.API_KEY && (sectionElement.querySelector("#login__api-key").value = config.API_KEY);
            config.identConfirmed && (sectionElement.querySelector("#login__submit-button").classList.add("verified"));
            return sectionElement;
        })
}