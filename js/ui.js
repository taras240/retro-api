
import { config, ui, watcher, configData } from "./script.js";

import { cheevoPopupElement } from "./components/cheevoPopup.js";
import { hintElement } from "./components/hint.js";
import { generateContextMenu } from "./components/contextMenu.js";
import { pushFSAlerts } from "./components/fsAlerts.js";

import { sendDiscordAlert } from "./functions/discord.js";
import { exportToCSV, exportSettingsToJson } from "./functions/exportData.js";
import { setPopupPosition } from "./functions/popupPosition.js";

import { AchievementsBlock } from "./widgets/cheevos.js";
import { Target } from "./widgets/target.js";
import { SidePanel } from "./widgets/sidePanel.js";
import { Settings } from "./widgets/settings.js";
import { Note } from "./widgets/note.js";
import { Awards } from "./widgets/awards.js";
import { GameCard } from "./widgets/gameCard.js";
import { Progression } from "./widgets/progression.js";
import { UserStatistic } from "./widgets/userStatistic.js";
import { Notifications } from "./widgets/notifications.js";
import { Games } from "./widgets/games.js";
import { Status } from "./widgets/statusV2.js";
// import { GameList } from "./widgets/gamesList.js";
import { Links } from "./widgets/links.js";
import { ALERT_TYPES } from "./enums/alerts.js";
import { langPackUrl, local } from "./enums/locals.js";
import { colorPresets } from "./enums/colorPresets.js";
import { dialogWindow } from "./components/dialogWindow.js";
import { inputTypes } from "./components/inputElements.js";
import { initBgAnimation } from "./functions/bgAnimations.js";
import { WiiEvent } from "./widgets/wiiEvent.js";
import { delay } from "./functions/delay.js";
import { Completion } from "./widgets/completion.js";
import { LoginWindowElement } from "./widgets/login.js";
import { Constructor } from "./widgets/constructor.js";
import { GAME_AWARD_TYPES } from "./enums/gameAwards.js";


export class UI {
  VERSION = "0.83";
  isCEF = !('Notification' in window);
  CURRENT_LEVEL;
  AUTOCLOSE_CONTEXTMENU = false;
  STICK_MARGIN = 1;
  STICK_TOLERANCE = 7;
  hltb = {};
  // isTest = true;
  constructor() {
    this.toggleLoading(false);
    this.initUI();
  }
  async loadLang() {
    const defLangResp = await fetch(langPackUrl(local.en));
    const defLang = await defLangResp.json()
    const localSet = config.ui?.local ?? local.en;
    if (localSet === local.en) {
      this.lang = defLang;
    }
    else {
      const langRep = await fetch(langPackUrl(localSet));
      const lang = await langRep.json();
      this.lang = { ...defLang, ...lang };
    }
  }

  async initUI() {
    await this.loadLang();

    // Ініціалізація елементів
    this.initializeElements();

    this.addEvents();
    this.updateColors();
    configData.bgVisibility = configData.bgVisibility;

    if (config.identConfirmed) {
      watcher.autostart();
    }
    else {
      this.showLogin();
    }

  }
  initializeElements() {
    this.app = document.querySelector(".wrapper");
    this.buttons = new SidePanel();
    // this.statusPanel = new StatusPanel();
    new WiiEvent();
    this.statusPanel = new Status("statusPanel", true);
    this.status = new Status("status", false);
    new AchievementsBlock(1);
    new AchievementsBlock(2);
    this.target = new Target();
    new Target(2);
    this.gameCard = new GameCard();
    this.stats = new UserStatistic();
    // this.gameList = new GameList();
    this.progression = new Progression();
    this.note = new Note();
    this.awards = new Awards();
    this.notifications = new Notifications();
    this.games = new Games();
    this.settings = new Settings();
    new Links();
    this.constr = new Constructor();
    // new Completion();


  }

  addEvents() {
    const mouseMoveEvent = async (event) => {
      const checkSideBar = (event) => {
        const xPos = event.clientX;
        xPos < 20 && this.buttons.show();
      }
      const removePopups = async (popups) => {
        popups.forEach((popup) => popup.remove());
      }
      event.stopPropagation();
      const hint = event.target.closest(`[data-title]`)?.dataset.title;
      const cheevoID = event.target.closest('[data-achiv-id]')?.dataset?.achivId;
      const cheevo = watcher.CHEEVOS[cheevoID];

      const oldPopups = document.querySelectorAll(".popup:not(.fixed)");

      if (hint && hint === oldPopups[0]?.innerText) return;
      if (!hint && oldPopups[0]?.dataset.id && oldPopups[0]?.dataset.id == cheevoID) return;

      removePopups(oldPopups);
      const isCheevoPopup = !hint && cheevo;
      if (isCheevoPopup && !configData.showCheevoOnHover) return;
      const popup = hint ?
        hintElement(hint) : cheevo ?
          cheevoPopupElement(cheevo) : undefined;
      if (popup) {
        this.app.appendChild(popup);
        setPopupPosition(popup, event, isCheevoPopup);
        setTimeout(() => popup.classList.add("visible"), isCheevoPopup ? 500 : 150);
      }
      checkSideBar(event)
    }
    this.app.addEventListener('mousemove', mouseMoveEvent)

    this.app.addEventListener('mouseleave',
      () => {
        document.querySelectorAll(".popup:not(.fixed)").forEach((popup) => popup.remove());
        this.buttons.section.classList.remove("expanded");
      }
    )
    this.app.addEventListener("click", (event) => {
      const showCheevoPopup = (cheevoID) => {

        const cheevo = watcher.CHEEVOS[cheevoID];
        const popup = cheevo ? cheevoPopupElement(cheevo, true) : undefined;
        this.app.appendChild(popup);
        setPopupPosition(popup, event);
        setTimeout(() => popup.classList.add("visible"), 0);
      }
      document.querySelectorAll(".context-menu").forEach((el) => el.remove());
      if (event.target.closest("button, a, .badge-button")) return;
      const cheevoID = event.target.closest('[data-achiv-id]')?.dataset?.achivId;
      cheevoID && showCheevoPopup(cheevoID);

    });
    this.app.addEventListener("contextmenu", (e) => {
      this.showContextmenu({ event: e, menuItems: this.settings.contextMenuItems })
    });
    this.app.addEventListener('mousedown', (event) => {
      // this.app.removeEventListener('mousemove', mouseMoveEvent);
      document.querySelectorAll(".popup, .dialog-window")?.forEach(p => p.remove())
    })
    this.app.addEventListener('mouseup', (event) => {

      // this.app.addEventListener('mousemove', mouseMoveEvent)
    })
  }
  toggleBgAnimation(value) {
    this.bgAnimation && this.bgAnimation.stop()
    if (!this.animContainer) {
      this.animContainer = document.createElement("div");
      this.animContainer.id = "background-animation";
      document.body.appendChild(this.animContainer);
    }
    if (value) {
      this.bgAnimation = initBgAnimation(this.animContainer, configData.bgAnimType);
      this.bgAnimation.start();
    }
  }
  toggleLoading(isLoading, message) {
    const loading = document.querySelector(".loading-section");
    loading.classList.toggle("hidden", !isLoading);
    loading.dataset.message = message ?? "Loading...";

  }
  showAwardsAlerts(awardsArray = []) {
    pushFSAlerts(awardsArray);
    const hardcoreAwards = [GAME_AWARD_TYPES.BEATEN, GAME_AWARD_TYPES.MASTERED];
    if (configData.discordNewAward) {
      awardsArray.forEach(awardObject => {
        if (configData.hardOnlyDiscordAlert && !hardcoreAwards.includes(awardObject.award)) {
          return;
        }
        sendDiscordAlert(awardObject);
      });
    }

    //! awardsArray.length && setTimeout(() => ui.stats.updateChart(), 4000);
  }
  showCheevoAlerts(cheevos = []) {
    const cheevoAlerts = cheevos
      .map(cheevo => ({
        type: ALERT_TYPES.CHEEVO,
        value: cheevo
      }));

    cheevoAlerts.forEach(alert => {
      const cheevo = alert.value;
      const {
        minPointsDiscordAlert,
        minRetroPointsDiscordAlert,
        hardOnlyDiscordAlert,
        discordNewCheevo
      } = configData;

      const isMinPointsMatch = cheevo.Points >= minPointsDiscordAlert || cheevo.TrueRatio >= minRetroPointsDiscordAlert;
      const isTypeMatch = hardOnlyDiscordAlert ? cheevo.isEarnedHardcore : true;

      if (discordNewCheevo && isMinPointsMatch && isTypeMatch) {
        sendDiscordAlert(alert);
      }
    })
    pushFSAlerts(cheevoAlerts);
  }
  showContextmenu({ event, menuItems, sectionCode = "" }) {
    const setContextPosition = (contextMenu, isSubmenu) => {
      if (!isSubmenu) {
        contextMenu.style.left = event.x + "px";
        contextMenu.style.top = event.y + "px";
      }

      const dimensions = contextMenu.getBoundingClientRect();
      if (dimensions.right > window.innerWidth) {
        contextMenu.classList.add("to-left");
      }

      if (dimensions.bottom > window.innerHeight) {
        contextMenu.classList.add("to-top");
      }
      console.log(dimensions.right, dimensions.bottom);
    }
    const setSubmenuPositions = (contextMenu) => {
      const submenus = contextMenu.querySelectorAll(".context-submenu")
      submenus.forEach(submenu => {
        submenu.style.visibility = "hidden";
        submenu.style.display = "block";
        setContextPosition(submenu, true);
        submenu.style.visibility = "";
        submenu.style.display = "";
      })
    }

    event.preventDefault();
    event.stopPropagation();
    document.querySelector(".context-menu")?.remove();
    const contextMenu = generateContextMenu({
      menuItems,
      sectionCode,
    });

    this.app.appendChild(contextMenu);

    setContextPosition(contextMenu);
    setSubmenuPositions(contextMenu);
    contextMenu.classList.remove("hidden");
  }

  updateColors(presetName) {
    const getColors = (presetName) => {
      function hexToRgba(hex, alpha = 1) {
        hex = hex.replace(/^#/, '');
        if (hex.length === 3) {
          hex = hex.split('').map(char => char + char).join('');
        }

        const bigint = parseInt(hex, 16);
        const r = (bigint >> 16) & 255;
        const g = (bigint >> 8) & 255;
        const b = bigint & 255;

        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
      }
      // this.colorsPreset = presetName;
      let preset;
      if (presetName === "custom") {
        preset = configData.customColors;
      }
      else {
        preset = colorPresets[presetName] || colorPresets.default;
      }
      if (!preset.selectionColor) {
        preset.selectionColor = hexToRgba(preset.accentColor, 0.1);
      }
      return preset;
    }
    const { style } = document.body;
    const {
      mainColor,
      secondaryColor,
      accentColor,
      fontColor,
      selectionColor,
    } = getColors(configData.preset);

    style.setProperty("--main-color", mainColor);
    style.setProperty("--secondary-color", secondaryColor);
    style.setProperty("--accent-color", accentColor);
    style.setProperty("--font-color", fontColor);
    style.setProperty("--selection-color", selectionColor);
  }


  exportCompletionDataToXlsx = () => exportToCSV.completion();
  exportWantToPlayToCSV = () => exportToCSV.wantToPlay();
  exportSettingsToJson = (props) => {
    if (!props) {
      const dialog = dialogWindow({
        title: ui.lang.exportSettings,
        message: ui.lang.exportSettingsMessage,
        elements: [
          {
            type: inputTypes.BUTTON,
            id: "dialog-download",
            label: ui.lang.download,
            onClick: () => ui.exportSettingsToJson({ direction: 'file' }),
          },
          {
            type: inputTypes.BUTTON,
            id: "dialog-copy",
            label: ui.lang.copyToClipboard,
            onClick: () => ui.exportSettingsToJson({ direction: 'clipboard' }),
          },
          {
            type: inputTypes.BUTTON,
            id: "dialog-discord",
            label: ui.lang.sendToDS,
            onClick: () => ui.exportSettingsToJson({ direction: 'discord' }),
          },
        ]
      });
      ui.app.appendChild(dialog);
    }
    else {
      exportSettingsToJson(props);
    }
  }
  resetSettings = () => {
    const dialog = dialogWindow({
      title: ui.lang.resetSettings,
      message: ui.lang.resetSettingsHint,
      elements: [
        {
          type: inputTypes.BUTTON,
          id: "dialog-copy",
          label: ui.lang.cancel,
        },
        {
          type: inputTypes.BUTTON,
          id: "dialog-download",
          label: ui.lang.resetSettings,
          onClick: () => {
            watcher.stop();
            config.resetSettings();
          },
        },
      ]
    });
    ui.app.appendChild(dialog);
  }
  importSettingsFromJson() {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = '.json';

    fileInput.addEventListener('change', function (event) {
      const file = event.target.files[0];
      if (file) {
        const reader = new FileReader();

        reader.onload = function (e) {
          try {
            const settings = JSON.parse(e.target.result);
            console.log('Imported Settings:', settings);
            ui.applySettings(settings);
          } catch (error) {
            console.error('Error parsing JSON:', error);
          }
        };

        reader.onerror = function () {
          console.error('Error reading file:', reader.error);
        };

        reader.readAsText(file);
      } else {
        console.log('No file selected');
      }
    });

    fileInput.click();
  }

  applySettings(settings) {
    if (settings.version >= 0.65) {
      config._cfg = settings;
      config.writeConfiguration();
      setTimeout(() => location.reload(), 1000);
    }
    else {
      console.log('Unsupported file');
    }
  }

  showLogin() {
    const loginScreen = LoginWindowElement(config);
    this.app.append(loginScreen);
  }
}












