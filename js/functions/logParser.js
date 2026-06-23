let fileHandle;
let lastSize = 0;
let isHardmode = true;

function parseCheevos(text) {
    let cheevoIDArray = [];
    let currentGame;
    text.split("\n").forEach(line => {
        if (line.includes("Awarding achievement")) {
            const cheevoIDMatch = line.match(/(?:Awarding\sachievement\s)(\d+)/);
            if (cheevoIDMatch) {
                const cheevoID = cheevoIDMatch[1];
                cheevoIDArray.push(cheevoID);
            }
        }
        else if (line.includes("loaded")) {
            const gameMatch = line.match(/(?:Game\s)(\d+)(?:\sloaded,\shardcore\s)(enabled|disabled)/);
            if (gameMatch) {
                const gameID = gameMatch[1];
                isHardmode = gameMatch[2] === "enabled";
                currentGame = { gameID, isHardmode };
            }
        }
    });
    const unlockedCheevos = [...new Set(cheevoIDArray)].map(cheevoID => ({
        AchievementID: +cheevoID,
        HardcoreMode: isHardmode ? 1 : 0,
        Date: new Date(),
    }));
    return { unlockedCheevos, currentGame }
}

export async function readLog({ fileHandle, path }) {
    let file;
    let text;
    if (window.__TAURI__) {
        file = await window.invokeRust("getFileData", path);
        if (file.length < lastSize) {
            lastSize = 0;
        }
        text = file.slice(lastSize, file.length);
        lastSize = file.length;
    }
    else {
        file = await fileHandle.getFile();
        if (file.size < lastSize) {
            lastSize = 0;
        }
        const slice = file.slice(lastSize, file.size);
        text = await slice.text();
        lastSize = file.size;
    }
    if (text.length > 0) {
        console.log(text);
        const unlockedCheevos = parseCheevos(text);
        return unlockedCheevos;
    }
    return {};
}

