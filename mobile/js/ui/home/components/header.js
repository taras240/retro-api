import { ui } from "../../../main.js";

export function headerHtml(userInfo) {
    const retroRatio = +(userInfo.retropoints / userInfo.hardpoints).toFixed(2);
    return `
        <div class="section__header-container user-info__header-container">
            <div class="user-info__header">
                <div class="user-info__avatar-container">
                    <img class="user-info__avatar" src="${userInfo.userImageSrc}" onclick="ui.goto.login()">
                </div>
                <button class="button__switch-mode ${ui.isSoftmode ? "softmode" : ""}" onclick="ui.switchGameMode()">${ui.isSoftmode ? "SOFT" : "HARD"}</button>
                <div class="user-info__user-name-container">
                    <h1 class="user-info__user-name">${userInfo.userName}</h1>
                    <div class="user-info__user-rank">${userInfo.userRank}</div>
                    <div class="user-info__rich-presence">Member since: ${new Date(userInfo.memberSince).toLocaleDateString()}</div>
                </div>
            </div>
            ${userInfo.isInGame ? `
            <div class="user-info__rich-presence"> ${userInfo.richPresence}</div>
            `: ""}
            
            
        </div>
    `;//${this.pointsHtml()}
}