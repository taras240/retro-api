export function addReleaseBadges(gameData) {
    const ignoredWords = [/\[SUBSET[^\[]*\]/gi, /~[^~]*~/g, ".HACK//",];
    let title = gameData.Title;

    const badges = ignoredWords.reduce((badges, word) => {
        const reg = new RegExp(word, "gi");
        const matches = gameData.Title.match(reg);
        if (matches) {
            matches.forEach(match => {
                title = title.replace(match, "");
                let badge = match;
                badges.push(badge.replace(/[~\.\[\]]|subset -|\/\//gi, ""));
            })
        }
        return badges;
    }, []);
    gameData.badges = badges;
    gameData.Title = title.trim();
}