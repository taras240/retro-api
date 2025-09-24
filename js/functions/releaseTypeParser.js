export function parseReleaseVersion(game) {
    const ignoredWords = [/\[SUBSET[^\[]*\]/gi, /~[^~]*~/g, ".HACK//",];
    let title = game.Title;

    const badges = ignoredWords.reduce((badges, word) => {
        const reg = new RegExp(word, "gi");
        const matches = game.Title.match(reg);
        if (matches) {
            matches.forEach(match => {
                title = title.replace(match, "");
                let badge = match;
                badges.push(badge.replace(/[~\.\[\]]|subset -|\/\//gi, ""));
            })
        }
        return badges;
    }, []);
    game.badges = badges;
    game.FixedTitle = title.trim();
    return { badges: badges, FixedTitle: title.trim() };
}