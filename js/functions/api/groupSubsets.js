function normalizeSets(subsets) {
    const sets = Object.values(subsets).reduce((acc, gameSets) => {
        const hasSubsets = Object.keys(gameSets).length > 1;
        if (hasSubsets) {
            const setID = gameSets.Main?.ID ?? -1;
            const subsetNames = Object.keys(gameSets);
            subsetNames.forEach(setName => {
                gameSets[setName] = gameSets[setName].ID;
            })
            acc.push(gameSets);
        }
        return acc;
    }, [])
    return sets;
}

export function groupSubsets(gamesArray) {
    const getGroupName = title =>
        title.replace(/\[subset[^\]]*\]/gi, "").trim();
    const getSubsetName = title =>
        title.match(/\[subset\s-\s([^\]]+)\]/i)?.[1] ?? "Main";

    const subsets = gamesArray?.reduce((gr, game) => {
        const groupName = getGroupName(game.Title);
        const subsetName = getSubsetName(game.Title);
        gr[groupName] ??= {};
        gr[groupName][subsetName] = game;

        return gr;
    }, {});

    return normalizeSets(subsets);
}