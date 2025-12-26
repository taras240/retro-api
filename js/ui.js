import { loadSections } from "./htmlBuilder.js";

import { config, ui, apiWorker, watcher, configData } from "./script.js";
import { gameGenres } from "./enums/gameGenres.js";

import { cheevoPopupElement } from "./components/cheevoPopup.js";
import { hintElement } from "./components/hint.js";
import { generateBadges } from "./components/badges.js";
import { generateContextMenu } from "./components/contextMenu.js";
import { pushFSAlerts } from "./components/fsAlerts.js";

import { sendDiscordAlert } from "./functions/discord.js";
import { exportToCSV, exportSettingsToJson } from "./functions/exportData.js";
import { setPopupPosition } from "./functions/popupPosition.js";

import { AchievementsBlock } from "./widgets/cheevos.js";
import { Target } from "./widgets/target.js";
import { StatusPanel } from "./removed/status.js";
import { SidePanel } from "./widgets/sidePanel.js";
import { Settings } from "./widgets/settings.js";
import { Note } from "./widgets/note.js";
import { Awards } from "./widgets/awards.js";
import { GameCard } from "./widgets/gameCard.js";
import { Progression } from "./widgets/progression.js";
import { UserStatistic } from "./widgets/userStatistic.js";
import { Notifications } from "./widgets/notifications.js";
import { Games } from "./widgets/games.js";
// import { Aotw } from "./widgets/aotw.js";
// import { Status } from "./widgets/statusV2.js";
import { Status } from "./widgets/statusV2.js";
import { TwitchIntegration } from "./twitch.js";
import { GameList } from "./widgets/gamesList.js";
import { Links } from "./widgets/links.js";
import { alertTypes } from "./enums/alerts.js";
import { gamePropsPopup } from "./components/gamePropsPopup.js";
import { langPackUrl, local } from "./enums/locals.js";
import { delay } from "./functions/delay.js";
import { colorPresets } from "./enums/colorPresets.js";
import { parseCurrentGameLevel } from "./functions/parseRP.js";
import { dialogWindow } from "./components/dialogWindow.js";
import { inputTypes } from "./components/inputElements.js";
import { initBgAnimation } from "./functions/bgAnimations.js";
import { Recap } from "./widgets/recap.js";



export class UI {
  VERSION = "0.81";
  isCEF = !('Notification' in window);
  CURRENT_LEVEL;
  AUTOCLOSE_CONTEXTMENU = false;
  STICK_MARGIN = 1;
  STICK_TOLERANCE = 7;
  hltb = {};
  isTest = true;
  twitchClient = new TwitchIntegration();
  gamePopup = () => gamePropsPopup();
  constructor() {
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
    await delay(25);
  }

  async initUI() {
    await this.loadLang();
    await loadSections();
    // Ініціалізація елементів
    this.initializeElements();

    this.addEvents();
    UI.updateColors();
    configData.bgVisibility = configData.bgVisibility;

    if (config.identConfirmed) { //&& !this.isTest
      configData.startOnLoad
        ? watcher.start()
        : watcher.updateGameData();

      setTimeout(() => {
        apiWorker.getUserSummary({}).then(userSummary => {
          watcher.updateUserData({ userSummary })
          this.userInfo?.update({ userSummary });
          this.stats?.initialSetStats({ userSummary });
          // this.statusPanel?.updateStatistics({ userSummary });
        })
      }, 3000);
    }
    // Вимкнення вікна завантаження
    setTimeout(
      () =>
        document.querySelector(".loading-section").classList.add("hidden"),
      500
    );

  }
  initializeElements() {
    this.app = document.querySelector(".wrapper");
    this.recap = new Recap();
    // this.statusPanel = new StatusPanel();
    this.statusPanel = new Status("statusPanel", true);
    this.status = new Status("status", false);
    // this.status2 = new Status(true);
    this.achievementsBlock = [new AchievementsBlock()]; this.createAchievementsTemplate();
    this.target = new Target();
    this.gameCard = new GameCard();
    this.stats = new UserStatistic();
    this.gameList = new GameList();
    this.progression = new Progression();
    this.note = new Note();
    this.awards = new Awards();
    this.notifications = new Notifications();
    this.games = new Games();
    this.settings = new Settings();
    this.links = new Links();
    this.buttons = new SidePanel();

  }

  static applyPosition({ widget }) {
    if (!widget) return;
    const id = widget.section.id;
    const setSidePanelIconValues = () => {
      widget.widgetIcon?.element && (widget.widgetIcon.element.checked = config.ui?.[widget.section?.id]?.hidden === false ?? !widget.VISIBLE);
    }
    const hideWidget = () => {
      widget.section.classList.add("hidden", "disposed");
    }
    if (config.ui[id]) {
      // Getting positions and dimensions from config.ui
      const { x, y, width, height, hidden } = config.ui[id];
      const { clientWidth, clientHeight } = ui.app;
      const xValue = parseInt(x);
      const yValue = parseInt(y);
      // Set positions and dimensions for widget if they are saved in config.ui
      x && (widget.section.style.left = xValue < 0 ? 0 : xValue > (clientWidth - 10) ? `${clientWidth - 100}px` : x);
      y && (widget.section.style.top = yValue < 0 ? 0 : yValue > (clientHeight - 10) ? `${clientHeight - 100}px` : y);
      width && (widget.section.style.width = width);
      height && (widget.section.style.height = height);

      const isHidden = hidden ?? true;
      isHidden && hideWidget();
    }
    else {
      !widget.VISIBLE && hideWidget();
    }
    setSidePanelIconValues();
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
        setPopupPosition(popup, event, !hint && cheevo);
        setTimeout(() => popup.classList.add("visible"), 50);


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
      this.app.removeEventListener('mousemove', mouseMoveEvent);
      document.querySelectorAll(".popup, .dialog-window")?.forEach(p => p.remove())
    })
    this.app.addEventListener('mouseup', (event) => {

      this.app.addEventListener('mousemove', mouseMoveEvent)
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
  gameChangeEvent(isNewGame) {
    const widgetNames = [
      "statusPanel",
      "status",
      // "status2",
      "target",
      // "notifications",
      "gameList",
      "gameCard"
    ]
    this.achievementsBlock.forEach((widget) =>
      widget?.parseGameAchievements(watcher.GAME_DATA)
    );
    widgetNames.forEach(widgetName => this[widgetName]?.gameChangeEvent(isNewGame))

    this.note?.updateGame();
    this.progression?.generateProgression();
  }

  updateWidgets({ earnedAchievementsIDs = [], isLog = false }) {
    // if (earnedAchievementsIDs?.length === 0) return
    // try {
    //   this.aotw?.checkCheevo({ earnedAchievementIDs: earnedAchievementsIDs });
    // } catch (e) { console.log(e) }


    //Update Achievements widgets
    this.achievementsBlock.forEach(template =>
      template.updateEarnedAchieves({ earnedAchievementIDs: earnedAchievementsIDs })
    )

    // Update Target widget
    this.target.updateEarnedAchieves({ earnedAchievementIDs: earnedAchievementsIDs })
    this.target.delayedRemove();

    //Update Awards widget
    this.awards.VISIBLE && this.awards.updateAwards();

    //Update status widget
    this.statusPanel.updateProgress({ earnedAchievementIDs: earnedAchievementsIDs });
    this.status.updateProgress({ earnedAchievementIDs: earnedAchievementsIDs });

    //Update Progression widget
    this.progression.update({ earnedAchievementIDs: earnedAchievementsIDs });

    //Update Stats widget & UserInfo widget
    this.userInfoTimeout && clearTimeout(this.userInfoTimeout);

    const updateDelay = 16 * 1000 * earnedAchievementsIDs.length;
    this.userInfoTimeout = setTimeout(async () => {
      const userSummary = await apiWorker.getUserSummary({ gamesCount: 0, achievesCount: 0 });
      watcher.updateUserData({ userSummary })
      ui.stats?.updateStats({ currentUserSummary: userSummary });
      // ui.statusPanel?.updateStatistics({ userSummary: userSummary });
    }, isLog && updateDelay < 30 * 1000 ? 30 * 1000 : updateDelay);


    const alerts = earnedAchievementsIDs.map(cheevoID => ({ type: alertTypes.CHEEVO, value: watcher.CHEEVOS[cheevoID] }));
    this.notifications.addAlertsToQuery(alerts);
  }
  showGameChangeAlerts(isStart) {
    this.notifications.gameChangeEvent(true);
    if (configData.discordNewGame ||
      (isStart && configData.discordStartSession)) {
      sendDiscordAlert({ type: alertTypes.GAME });
    }
  }
  showAwardsAlerts(awardsArray = []) {
    pushFSAlerts(awardsArray);
    awardsArray.forEach(award => {
      configData.discordNewAward && sendDiscordAlert(award);
      // { message: alert.award, type: alertTypes.award, id: watcher.GAME_DATA?.ID }
    });

    this.statusPanel.addAlertsToQuery(awardsArray);
    this.status.addAlertsToQuery(awardsArray);
    this.notifications.addAlertsToQuery(awardsArray);

    this.gameCard.section.dataset.award = watcher.GAME_DATA?.award ?? "-";
    this.gameCard.section.dataset.progressionAward = watcher.GAME_DATA?.progressionAward ?? "-";
    awardsArray.length && setTimeout(() => ui.stats.updateChart(), 4000);
  }
  showCheevoAlerts(earnedAchievementIDs = []) {
    let cheevoAlerts = earnedAchievementIDs
      .map(id => ({
        type: alertTypes.CHEEVO,
        value: watcher.CHEEVOS[id]
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
    this.statusPanel.addAlertsToQuery(cheevoAlerts);
    this.status.addAlertsToQuery(cheevoAlerts);
  }
  updateWidgetsRichPresence(richPresence = "Rich presence") {
    this.statusPanel.updateRichPresence(richPresence);//.frontSide.richPresence.innerText = richPresence;
    this.status.updateRichPresence(richPresence);
    // this.status2.updateRichPresence(richPresence);

    const currentLevel = parseCurrentGameLevel(richPresence);
    this.CURRENT_LEVEL = currentLevel;

    if (currentLevel) {
      this.target.highlightCurrentLevel(currentLevel);
      this.achievementsBlock.forEach(widget =>
        widget.highlightCurrentLevel(currentLevel)
      )
    }
  }

  showContextmenu({ event, menuItems, sectionCode = "" }) {
    const setContextPosition = () => {
      this.contextMenu.style.left = event.x + "px";
      this.contextMenu.style.top = event.y + "px";

      (window.innerWidth - event.x < this.contextMenu.offsetWidth * 3) &&
        (this.contextMenu.classList.add("to-left"));
      (window.innerHeight - event.y < this.contextMenu.offsetHeight * 2)
        && (this.contextMenu.classList.add("to-top"));
    }

    event.preventDefault();
    event.stopPropagation();
    document.querySelector(".context-menu")?.remove();
    // this.contextMenu ? this.contextMenu.remove() : "";
    this.contextMenu = generateContextMenu({
      menuItems: menuItems,
      sectionCode: sectionCode,
    });
    this.app.appendChild(this.contextMenu);

    setContextPosition();

    this.contextMenu.classList.remove("hidden");
  }
  createAchievementsTemplate() {
    if (this.achievementsBlock.length === 2) {
      UI.switchSectionVisibility(this.achievementsBlock[1]);
    } else {
      this.achievementsBlock.push(new AchievementsBlock(true));
      watcher.GAME_DATA && this.achievementsBlock.at(-1).parseGameAchievements(watcher.GAME_DATA);
    }
  }

  // Функція для зупинки слідкування за досягненнями
  stopWatching() {
    ui.IS_WATCHING = false;
    this.statusPanel.frontSide.watchButton.classList.remove("active");
    clearInterval(ui.apiTrackerInterval);
  }

  static updateColors(presetName) {
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

  static addDraggingEventForElements(container, onDragEnd) {

  }



  static switchSectionVisibility({ section, visible = false }) {
    if (section.classList.contains("hidden") || visible) {
      //set visible
      section.classList.remove("disposed");
      setTimeout(() => section.classList.remove("hidden"), 100);
      config.setNewPosition({
        id: section.id,
        hidden: false,
      })
    }
    else {
      //set hidden
      section.classList.add("hidden")
      setTimeout(() => section.classList.add("disposed"), 300);
      config.setNewPosition({
        id: section.id,
        hidden: true,
      })
    }

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
            event: `onclick="ui.exportSettingsToJson({direction:'file'});"`,
          },
          {
            type: inputTypes.BUTTON,
            id: "dialog-copy",
            label: ui.lang.copyToClipboard,
            event: `onclick="ui.exportSettingsToJson({direction:'clipboard'});"`,
          },
          {
            type: inputTypes.BUTTON,
            id: "dialog-discord",
            label: ui.lang.sendToDS,
            event: `onclick="ui.exportSettingsToJson({direction:'discord'});"`,
          },
        ]
      });
      ui.app.appendChild(dialog);
    }
    else {
      exportSettingsToJson(props);
    }


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

}












