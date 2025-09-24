import { delay } from "../functions/delay.js";
import { apiWorker, config, watcher } from "../script.js";
import { PopupWindow } from "../widgets/popupWindow.js";
import { input } from "./inputElements.js";

export function gamePropsPopup() {
  const gameDataItems = (gameData) => [
    {
      label: ui.lang.title,
      elements: [
        {
          type: "text",
          title: ui.lang.gameTitleHint,
          id: "game-props-title",
          value: gameData?.FixedTitle ?? '',
        },
      ]
    },
    {
      label: ui.lang.platform,
      elements: [
        {
          type: "text",
          title: ui.lang.platform,
          id: "game-props-platform",
          value: gameData?.ConsoleName ?? '',
        },
      ]
    },
    {
      label: ui.lang.genre,
      elements: [
        {
          type: "text",
          title: ui.lang.genre,
          id: "game-props-genre",
          value: gameData?.Genre ?? '',
        },
      ]
    },
    // {
    //   label: "Level names",
    //   elements: [{
    //     type: "text",
    //     title: "zone names devided by ','",
    //     id: `game-props-zones`,
    //     value: gameData?.zones.join(", ") ?? "",
    //   }]
    // },
    {
      label: ui.lang.timePlayed,
      elements: [
        {
          type: "number",
          title: ui.lang.timePlayed,
          id: "game-props-time",
          value: gameData?.TimePlayed ?? 0,
        },
      ]
    },
    {
      elements: [
        {
          id: "reset-game-props",
          label: ui.lang.resetData,
          type: "button",
        },
        {
          id: "save-game-props",
          label: ui.lang.saveData,
          type: "button",
        },
      ]
    },
  ]
  let gameDataWindow;
  const contentHtml = (items) => `
    <ul class="game-props__list flex-column-list">
      ${items.map(propsLine => `
          <li class="game-props__item">${propsLine.label ?? ""}
              ${propsLine.elements.map(inputData => input(inputData)).join("\n")}
          </li>
      `).join("\n")
    }
    </ul>`;

  const getGameDataFromWindow = (window) => ({
    FixedTitle: window.querySelector("#game-props-title")?.value,
    ConsoleName: window.querySelector("#game-props-platform")?.value,
    Genre: window.querySelector("#game-props-genre")?.value,
    TimePlayed: Number(window.querySelector("#game-props-time")?.value ?? 0),
  });

  const updateGameConfig = (data, ID) => {
    config.gamesDB[ID] = data;
    config.writeConfiguration();
  };

  const resetGameData = async (window, gameData) => {
    const originalGameData = apiWorker.gameData;

    watcher.GAME_DATA.FixedTitle = originalGameData.FixedTitle;
    watcher.GAME_DATA.ConsoleName = originalGameData.ConsoleName;
    watcher.GAME_DATA.Genre = originalGameData.Genre;

    updateGameConfig({ TimePlayed: watcher.GAME_DATA.TimePlayed }, gameData.ID);

    watcher.reset();
    gameDataWindow?.section?.remove();
    open(originalGameData);
  }

  const saveGameData = (window, gameData) => {
    const originalGameData = apiWorker.gameData;
    const newGameData = getGameDataFromWindow(window);

    Object.getOwnPropertyNames(newGameData)
      .forEach(property => {
        watcher.GAME_DATA[property] = newGameData[property];
        if (newGameData[property] == originalGameData[property]) {
          delete newGameData[property]
        }
      })

    updateGameConfig(newGameData, gameData.ID);

    watcher.reset();
  }


  const addEvents = (window, data) => {
    window.querySelector("#save-game-props")?.addEventListener("click", () => saveGameData(window, data));
    window.querySelector("#reset-game-props")?.addEventListener("click", () => resetGameData(window, data));

  }
  const open = (gameData) => {
    const popupData = () => ({
      title: gameData?.FixedTitle,
      content: contentHtml(gameDataItems(gameData)),
      id: `game-data-popup`,
      classList: ["game-data__section"]
    })
    gameDataWindow = new PopupWindow(popupData());
    addEvents(gameDataWindow.section, gameData)
  }

  return { open }
}