import { ALERT_TYPES } from "../enums/alerts.js";
import { apiWorker, config, configData, watcher } from "../script.js";
import { delay } from "./delay.js";
import { cheevoUrl, gameImageUrl, gameUrl } from "./raLinks.js";
import { formatTime } from "./time.js";

const goldColorCode = 16766720;
const silverColorCode = 12632256;
const limeColorCode = 65280;
const botImageLink = 'https://taras240.github.io/retro-api/assets/img/overlay_sets/mario_q/q.png';
const footerLink = 'retrocheevos.vercel.app';

export async function sendDiscordAlert({ message = "", type, value, award, id }) {
    const targetUser = configData.targetUser || config.USER_NAME;
    const gameMessage = (gameData) => {
        const header = `${targetUser} has launched the game: \n${gameData.Title}`;
        const description = `
          Platform: ${gameData.ConsoleName}
          Realeased: ${gameData.Released}
          Achievements: ${gameData.NumAwardedToUserHardcore} / ${gameData.NumAchievements}
          Points: ${gameData.unlockData.hardcore.points} / ${gameData.unlockData.softcore.points} / ${gameData.totalPoints}
          Retropoints:  ${gameData.unlockData.hardcore.retropoints} / ${gameData.totalRetropoints}
        `;
        const message = {
            header: header,
            description: description,
            color: limeColorCode,
            colour: "lime",
            url: gameUrl(gameData.ID),
            image: gameImageUrl(gameData.ImageIcon),
        }
        return message;
    }
    const awardMessage = (gameData, award) => {
        const header = `${targetUser} has ${award.toUpperCase()} the game: \n${gameData.Title}`;

        const description = `
          Earned in: ${formatTime(gameData.TimePlayed)}
          Platform: ${gameData.ConsoleName}
          Realeased: ${gameData.Released}
          Achievements: ${gameData?.unlockData?.hardcore.count} / ${gameData?.unlockData?.softcore.count} / ${gameData.NumAchievements}
          Points: ${gameData.unlockData.hardcore.points} / ${gameData.unlockData.softcore.points} / ${gameData.totalPoints}
          Retropoints: ${gameData.unlockData.hardcore.retropoints} / ${gameData.totalRetropoints}
        `;
        const message = {
            header: header,
            description: description,
            color: (award == 'beaten' || award == 'mastered') ? goldColorCode : silverColorCode,
            colour: (award == 'beaten' || award == 'mastered') ? "gold" : "silver",
            url: gameUrl(gameData.ID),
            image: gameImageUrl(gameData.ImageIcon),
        }
        return message;
    }
    const cheevoMessage = (gameData, cheevo) => {
        const header = `${targetUser} unlocked cheevo${cheevo.isEarnedHardcore
            ? '' : " (casual mode)"}: \n${cheevo.Title}`
        const description = `
        Game: [${gameData.Title}](${gameUrl(gameData.ID)})
        Unlocked in: ${formatTime(gameData.TimePlayed)}
        Description: ${cheevo.Description}
        Points: ${cheevo.Points}
        Retropoints:  ${cheevo.TrueRatio}
        `;
        message = {
            header: header,
            description: description,
            color: cheevo.isEarnedHardcore ? goldColorCode : silverColorCode,
            url: cheevoUrl(cheevo),
            image: cheevo.prevSrc,
        }
        return message;
    }
    const webhook = configData.discordWebhook;
    if (!webhook) {
        return;
    }
    let messageElements = {};
    const gameData = watcher.GAME_DATA;

    switch (type) {
        case ALERT_TYPES.GAME:
            messageElements = gameMessage(gameData);
            break;
        case ALERT_TYPES.AWARD:
            await delay(2000);
            messageElements = awardMessage(value, award);
            break;
        case ALERT_TYPES.CHEEVO:
            const cheevo = value;
            messageElements = cheevoMessage(gameData, cheevo);
            break;
    }
    const embedMessage = {
        username: 'RETROCHEEVOS',
        avatar_url: botImageLink,
        embeds: [
            {
                thumbnail: {
                    url: messageElements.image
                },
                title: messageElements.header,
                url: messageElements.url,
                color: messageElements.color,
                colour: messageElements.colour,
                description: messageElements.description.replace(/\n[ \t]*/g, '\n'),
                footer: {
                    text: footerLink,
                },
                timestamp: new Date().toISOString(),
            },
        ],
    };
    fetch(webhook, {
        body: JSON.stringify(embedMessage),
        headers: {
            "Content-Type": "application/json",
        },
        method: "POST",
    })
        .then(function (res) {

        })
        .catch(function (res) {
            console.log(res);
        });
}
export function sendJsonToDiscord({ jsonData, fileName, message }) {
    const jsonBlob = new Blob(
        [JSON.stringify(jsonData, null, 2)],
        { type: "application/json" }
    );

    const formData = new FormData();
    formData.append("file", jsonBlob, `${fileName}.json`);

    formData.append("payload_json", JSON.stringify({
        username: "RETROCHEEVOS",
        avatar_url: botImageLink,
    }));

    fetch(configData.discordWebhook, {
        method: "POST",
        body: formData,
    })
        .then(res => {
            if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
            console.log("Файл відправлено успішно!");
        })
        .catch(err => console.error("Помилка при відправці:", err));

}