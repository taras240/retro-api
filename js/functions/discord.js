import { ALERT_TYPES } from "../enums/alerts.js";
import { GAME_AWARD_TYPES } from "../enums/gameAwards.js";
import { apiWorker, config, configData, watcher } from "../script.js";
import { delay } from "./delay.js";
import { cheevoUrl, gameImageUrl, gameUrl } from "./raLinks.js";
import { formatTime } from "./time.js";

const goldColorCode = 16766720;
const silverColorCode = 12632256;
const limeColorCode = 65280;
const botImageLink = 'https://taras240.github.io/retro-api/assets/img/overlay_sets/mario_q/q.png';
const footerLink = 'retrocheevos.vercel.app';
const getAuthorUrl = (targetUser) => `https://retroachievements.org/user/${targetUser?.trim()}`
function getProgressBar(current, total, size = 12) {
    const percent = total === 0 ? 0 : current / total;
    const filled = Math.round(size * percent);
    const empty = size - filled;

    return "█".repeat(filled) + "░".repeat(empty) + ` ${Math.round(percent * 100)}% (${current}/${total})`;
}
export async function sendDiscordAlert({ message = "", type, value, award, id }) {
    const targetUser = configData.targetUser || config.USER_NAME;
    const gameMessage = (gameData) => {
        const author = {
            name: `${targetUser} has launched the game`,
            url: getAuthorUrl(targetUser),
        };
        const header = gameData.Title;
        const description = `
          Platform: ${gameData.ConsoleName}
          Released: ${gameData.Released}
          Progress: ${getProgressBar(gameData.NumAwardedToUser, gameData.NumAchievements)}
          Points: ${gameData.unlockData.hardcore.points} / ${gameData.unlockData.softcore.points} / ${gameData.totalPoints}
          Retropoints:  ${gameData.unlockData.hardcore.retropoints} / ${gameData.totalRetropoints}
        `;
        const message = {
            author,
            header,
            description,
            color: limeColorCode,
            colour: "lime",
            url: gameUrl(gameData.ID),
            image: gameImageUrl(gameData.ImageIcon),
        }
        return message;
    }
    const awardMessage = (gameData, award) => {
        const author = {
            name: `${targetUser} has ${award.toUpperCase()} the game`,
            url: getAuthorUrl(targetUser),
        };
        const header = gameData.Title;
        let description;
        if (award === GAME_AWARD_TYPES.MASTERED) {
            description = `
                Award earned in: ${formatTime(gameData.TimePlayed)}
                Platform: ${gameData.ConsoleName}
                Released: ${gameData.Released}
                Achievements: ${gameData.NumAchievements}
                Points: ${gameData.totalPoints}
                Retropoints: ${gameData.totalRetropoints}
            `;
        }
        else {
            description = `
                Award earned in: ${formatTime(gameData.TimePlayed)}
                Platform: ${gameData.ConsoleName}
                Released: ${gameData.Released}
                Achievements: ${gameData?.unlockData?.hardcore.count} / ${gameData?.unlockData?.softcore.count} / ${gameData.NumAchievements}
                Points: ${gameData.unlockData.hardcore.points} / ${gameData.unlockData.softcore.points} / ${gameData.totalPoints}
                Retropoints: ${gameData.unlockData.hardcore.retropoints} / ${gameData.totalRetropoints}
            `;
        }

        const message = {
            author,
            header,
            description,
            color: (award == 'beaten' || award == 'mastered') ? goldColorCode : silverColorCode,
            colour: (award == 'beaten' || award == 'mastered') ? "gold" : "silver",
            url: gameUrl(gameData.ID),
            image: gameImageUrl(gameData.ImageIcon),
        }
        return message;
    }
    const cheevoMessage = (gameData, cheevo) => {
        const author = {
            name: `${targetUser} unlocked cheevo${cheevo.isEarnedHardcore
                ? '' : " (casual mode)"}`,
            url: getAuthorUrl(targetUser),
        };
        const header = cheevo.Title;
        const description = `
        Game: [${gameData.Title}](${gameUrl(gameData.ID)})
        Unlocked in: ${formatTime(gameData.TimePlayed)}
        Description: ${cheevo.Description}
        Points: ${cheevo.Points}
        Retropoints:  ${cheevo.TrueRatio}
        `;
        message = {
            author,
            header,
            description,
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
                author: messageElements.author,

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