import { RA_PLATFORM_CODES } from "../enums/RAPlatforms.js";
import { apiWorker, config } from "../script.js";
import { sendJsonToDiscord } from "./discord.js";
import { formatTime } from "./time.js";

function downloadCSV(csvContent, filename) {
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}
function downloadJSON(jsonContent, filename) {
    const blob = new Blob([JSON.stringify(jsonContent)], { type: 'text/json;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    return true;
}
async function copyToClipboard(text) {
    if (navigator.clipboard) {
        await navigator.clipboard.writeText(text)
    } else {
        // Fallback для старих браузерів
        const textarea = document.createElement("textarea");
        textarea.value = text;
        textarea.style.position = "fixed"; // уникнути прокрутки
        document.body.appendChild(textarea);
        textarea.focus();
        textarea.select();
        try {
            document.execCommand('copy');
        } catch (err) {
            console.error('Не вдалося скопіювати (fallback):', err);
        }
        document.body.removeChild(textarea);
    }
}
// exportDataAsCSV
async function exportCompletionDataToXlsx() {
    const completion = await apiWorker.completionProgress();
    const completionResults = completion?.Results.map(game => ({
        Title: game.Title,
        ID: game.GameID,
        Platform: RA_PLATFORM_CODES[game.ConsoleID]?.Name ?? "-",
        Award: game.HighestAwardKind,
        AwardDate: game.HighestAwardDate && (new Date(game.HighestAwardDate)).toLocaleString(),
        LastEarnedDate: game.MostRecentAwardedDate && (new Date(game.MostRecentAwardedDate)).toLocaleString(),
        TotalAchievements: game.NumAchievements,
        EarnedAchievements: game.NumAwardedHardcore,
        EarnedAchievementsSoftcore: game.NumAwarded,
        PlayedTime: formatTime(config.gamesDB[game.GameID]?.TimePlayed),
        Notes: config.gamesDB[game.GameID]?.notes?.replace(/;|\n/g, " "),
    }));

    if (!completionResults || completionResults.length == 0) return;

    const headers = [
        ...Object.keys(completionResults[0])
    ];

    const rows = completionResults.map(row => [
        row.Title,
        row.ID,
        row.Platform,
        row.Award,
        row.AwardDate,
        row.LastEarnedDate,
        row.TotalAchievements,
        row.EarnedAchievements,
        row.EarnedAchievementsSoftcore,
        row.PlayedTime,
        row.Notes,
    ]);

    const csvContent = [
        headers.join(";"),
        ...rows.map(row => row.join(";"))
    ].join("\n");
    downloadCSV(csvContent, "completion");
}
async function exportWantToPlayToCSV() {
    const wantList = await apiWorker.getWantToPlayGamesList({ count: 500 });
    const wantListResults = wantList?.map(game => ({
        Title: game.Title,
        ID: game.ID,
        ConsoleName: RA_PLATFORM_CODES[game.ConsoleID]?.Name ?? "-",
        AchievementsPublished: game.AchievementsPublished,
    }));
    const headers = [
        ...Object.keys(wantListResults[0])
    ];
    const rows = wantListResults.map(row => [
        row.Title,
        row.ID,
        row.ConsoleName,
        row.AchievementsPublished,
    ]);

    const csvContent = [
        headers.join(";"),
        ...rows.map(row => row.join(";"))
    ].join("\n");
    downloadCSV(csvContent, "wantToPlay");
}

export const exportToCSV = {
    completion: exportCompletionDataToXlsx,
    wantToPlay: exportWantToPlayToCSV,
}

// exportDataAsJSON

export async function exportSettingsToJson({ direction }) {
    const settingsString = localStorage.getItem("retroApiConfig");

    const settings = JSON.parse(settingsString);
    settings.apiWorker && delete settings.apiWorker.completionProgress;
    settings.version = ui.VERSION;
    switch (direction) {
        case "file":
            downloadJSON(settings, `RCSettings_v${settings.version}`);
            break;
        case "clipboard":
            await copyToClipboard(settingsString);
            break;
        case "discord":
            sendJsonToDiscord({ jsonData: settings, fileName: `RCSettings_v${settings.version}`, message: "retrocheevos settings file" })
            break;
    }
}