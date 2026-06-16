import { ALERT_TYPES } from "../enums/alerts.js";
import { GAME_AWARD_TYPES } from "../enums/gameAwards.js";
import { config, configData, watcher } from "../script.js";
import { delay } from "./delay.js";
import { formatText } from "./formatText.js";
import { cheevoUrl, gameImageUrl, gameUrl } from "./raLinks.js";
import { formatTime } from "./time.js";

const goldColorCode = 16766720;
const silverColorCode = 12632256;
const limeColorCode = 65280;
const botImageLink = 'https://taras240.github.io/retro-api/assets/img/overlay_sets/mario_q/q.png';
const footerLink = 'retrocheevos.vercel.app';
const getAuthorUrl = (targetUser) => `https://retroachievements.org/user/${targetUser?.trim()}`
const getProgressBar = (current, total, size = 12) => {
    const percent = total === 0 ? 0 : current / total;
    const filled = Math.round(size * percent);
    const empty = size - filled;

    return "█".repeat(filled) + "░".repeat(empty) + ` ${Math.round(percent * 100)}% (${current}/${total})`;
}
export async function sendDiscordAlert({ message = "", type, value, award, id }) {
    const targetUser = configData.targetUser || config.USER_NAME;
    const gameMessage = (gameData) => {
        const author = {
            name: formatText(ui.lang.userLauchedGame, {
                user: targetUser
            }),
            url: getAuthorUrl(targetUser),
        };
        const title = gameData.Title;
        const description = gameStatsLines(gameData).replace(/\n[ \t]*/g, '\n');

        message = {
            author,
            title,
            url: gameUrl(gameData.ID),
            description,
            color: limeColorCode,
            colour: "lime",
            thumbnail: {
                url: gameImageUrl(gameData.ImageIcon),
            }
        }
        return message;
    }
    const awardMessage = (gameData, award) => {
        const author = {
            name: formatText(ui.lang.userEarnedAward, {
                user: targetUser,
                award: award.toUpperCase(),
            }),
            url: getAuthorUrl(targetUser),
        };
        const title = gameData.Title;
        const description = `
                ${formatText(ui.lang.awardEarnedInTime, {
            time: formatTime(gameData.TimePlayed)
        })}
                ${gameStatsLines(gameData)}
            `.replace(/\n[ \t]*/g, '\n');
        const isHardcoreAward = [GAME_AWARD_TYPES.BEATEN, GAME_AWARD_TYPES.MASTERED].includes(award);
        message = {
            author,
            title,
            url: gameUrl(gameData.ID),
            description,
            color: isHardcoreAward ? goldColorCode : silverColorCode,
            colour: isHardcoreAward ? "gold" : "silver",
            thumbnail: {
                url: gameImageUrl(gameData.ImageIcon),
            }
        }
        return message;
    }
    const cheevoMessage = (gameData, cheevo) => {
        const author = {
            name: formatText(ui.lang.userUnlockedCheevo, { user: targetUser }),
            url: getAuthorUrl(targetUser),
        };
        const title = cheevo.Title;
        const description = `
            ${ui.lang.game}: [${gameData.Title}](${gameUrl(gameData.ID)})
            ${formatText(ui.lang.unlockedInTime, { time: formatTime(gameData.TimePlayed) })}
            ${ui.lang.description}: ${cheevo.Description}
            ${ui.lang.points}: ${cheevo.Points}
            ${ui.lang.retropoints}:  ${cheevo.TrueRatio}
        `.replace(/\n[ \t]*/g, '\n');
        message = {
            author,
            title,
            url: cheevoUrl(cheevo),
            description,
            color: cheevo.isEarnedHardcore ? goldColorCode : silverColorCode,
            colour: cheevo.isEarnedHardcore ? "gold" : "silver",
            thumbnail: {
                url: cheevo.prevSrc
            }
        }
        return message;
    }
    const webhook = configData.discordWebhook;
    if (!webhook) {
        return;
    }
    let messageText = {};
    const gameData = watcher.GAME_DATA;

    switch (type) {
        case ALERT_TYPES.GAME:
            messageText = gameMessage(gameData);
            break;
        case ALERT_TYPES.AWARD:
            await delay(2000);
            messageText = awardMessage(value, award);
            break;
        case ALERT_TYPES.CHEEVO:
            const cheevo = value;
            messageText = cheevoMessage(gameData, cheevo);
            break;
    }
    const embedMessage = {
        username: 'RETROCHEEVOS',
        avatar_url: botImageLink,
        embeds: [
            {
                ...messageText,
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
const gameStatsLines = (gameData) => {
    const formatStatsLine = (stats = []) => [...new Set(stats.filter(v => v))].join("/");

    return `
        ${ui.lang.platform}: ${gameData.ConsoleName}
        ${ui.lang.released}: ${gameData.Released}
        ${ui.lang.cheevos}: ${formatStatsLine([gameData?.unlockData?.hardcore.count, gameData?.unlockData?.softcore.count, gameData.NumAchievements])}
        ${ui.lang.points}: ${formatStatsLine([gameData.unlockData.hardcore.points, gameData.unlockData.softcore.points, gameData.totalPoints])}
        ${ui.lang.retropoints}: ${formatStatsLine([gameData.unlockData.hardcore.retropoints, gameData.totalRetropoints])}
`};