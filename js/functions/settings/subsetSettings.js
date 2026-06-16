import { inputTypes } from "../../components/inputElements.js";
import { config, configData, ui, watcher } from "../../script.js";

export function contextSwitchSetsMenu() {
    const subsets = Object.entries(watcher.GAME_DATA?.availableSubsets ?? {});
    const setID = watcher.GAME_DATA?.ID;
    return subsets.length > 1 ? {
        label: ui.lang.switchSubset,
        elements: subsets.map(([subsetName, subsetID]) => {
            const gameID = configData.gameID;
            subsetID = parseInt(subsetID);
            const isCurrentSet = subsetID === setID;

            return {
                type: inputTypes.RADIO,
                name: "subset-switch",
                id: `subset-switch-${subsetName}`,
                label: subsetName,
                checked: isCurrentSet,
                onChange: () => {
                    if (/^main$/i.test(subsetName)) {
                        delete config.gamesDB[gameID].setID;
                    }
                    else {
                        config.gamesDB[gameID].setID = subsetID;
                    }
                    watcher.updateGameData(gameID)
                },
            }
        })
    } : ""
}

export function contextSetsMenu({ onChange, isChecked } = {}) {
    onChange ??= (subsetID) => watcher.setSubset(subsetID);
    isChecked ??= (subsetID) => config.gameConfig().visibleSubsets?.includes(subsetID);
    const setID = watcher.GAME_DATA?.ID;
    const subsets = Object.entries(watcher.GAME_DATA?.availableSubsets ?? {});
    return subsets.length > 1 ? {
        label: ui.lang.subsets,
        elements: subsets.map(([subsetName, subsetID]) => {
            subsetID = parseInt(subsetID);
            const isCurrentSet = subsetID === setID;
            // if (isCurrentSet || !subsetID) return "";
            // const checked = isCurrentSet || isVisible;
            return {
                type: inputTypes.CHECKBOX,
                label: subsetName,
                checked: isChecked(subsetID),
                onChange: () => onChange(subsetID),
            }
        }),
    } : ""
}  