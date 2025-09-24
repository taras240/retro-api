let fileHandle;
let lastSize = 0;
let isHardmode = true;
// async function openLogFile() {
//     // Користувач вибирає файл
//     [fileHandle] = await window.showOpenFilePicker({
//         types: [{ description: "Log files", accept: { "text/plain": [".log"] } }]
//     });
//     readLog();
// }
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

export async function readLog(fileHandle) {
    const file = await fileHandle.getFile();
    if (file.size < lastSize) {
        lastSize = 0;
    }
    if (file.size > lastSize) {
        const slice = file.slice(lastSize, file.size);
        const text = await slice.text();
        lastSize = file.size;
        const unlockedCheevos = parseCheevos(text);
        return unlockedCheevos;
    }
    return {};
}

