import { UI } from "../ui.js";
import { config, configData, ui, watcher } from "../script.js";
import { inputTypes, input } from "../components/inputElements.js";
import { Widget } from "./widget.js";
import { obsPresets } from "../enums/obsPresets.js";
import { stateboxClickHandler } from "../functions/stateBoxClick.js";
import { local } from "../enums/locals.js";
import { colorPresets } from "../enums/colorPresets.js";
import { fonts } from "../enums/fontsPreset.js";
import { ANIMATIONS } from "../enums/bgAnimations.js";
export class Settings extends Widget {
    widgetIcon = {
        iconClass: "settings-icon",
    };
    get settingsItems() {
        return [
            {
                label: ui.lang.style,
                elements: [
                    {
                        type: inputTypes.SELECTOR,
                        label: ui.lang.selectColors,
                        id: "settings_colors-selector",
                        selectValues: [
                            ...Object.keys(colorPresets).map(presetName => ({
                                type: inputTypes.RADIO,
                                name: "settings_color-scheme",
                                id: `settings_color-scheme-${presetName}`,
                                label: presetName,
                                checked: configData.preset === presetName,
                                event: `onchange=\"configData.preset = '${presetName}'\"`,
                            })),
                            {
                                type: inputTypes.RADIO,
                                name: "settings_color-scheme",
                                id: `settings_color-scheme-custom`,
                                label: "custom",
                                checked: configData.preset === "custom",
                                event: `onchange=\"configData.preset = 'custom'\"`,
                            }]
                    },
                    {
                        type: inputTypes.CHECKBOX,
                        label: ui.lang.showBgAnimation,
                        id: "settings_show-bg",
                        onChange: "configData.bgVisibility = this.checked;",
                        checked: configData.bgVisibility,
                    },
                    {
                        type: inputTypes.SELECTOR,
                        label: ui.lang.animType,
                        id: "settings_anims-variant",
                        selectValues: [
                            ...Object.values(ANIMATIONS).map(anim => ({
                                type: inputTypes.RADIO,
                                name: "settings_anim-variant",
                                id: `settings_anim-variant-${anim}`,
                                label: anim,
                                checked: configData.bgAnimType === anim,
                                event: `onchange=\"configData.bgAnimType = '${anim}'\"`,
                            })),]
                    },
                    {
                        type: inputTypes.CHECKBOX,
                        label: ui.lang.stickyWindows,
                        id: "settings_sticky-windows",
                        onChange: "ui.settings.IS_WINDOWS_STICKY = this.checked;",
                        checked: this.IS_WINDOWS_STICKY,
                    },
                    {
                        type: inputTypes.CHECKBOX,
                        label: ui.lang.cheevoOnHover,
                        id: "settings_cheevo-on-hover",
                        onChange: "configData.showCheevoOnHover = this.checked;",
                        checked: configData.showCheevoOnHover,
                    },
                ]
            },
            {
                label: ui.lang.customColors,
                elements: [
                    {
                        type: inputTypes.COLOR,
                        id: "main-color-input",
                        label: "main color",
                        value: configData.customColors.mainColor,
                        onChange: "configData.customColors = {colorProperty: 'mainColor', color: this.value};",
                    },
                    {
                        type: inputTypes.COLOR,
                        id: "secondary-color-input",
                        label: "secondary color",
                        value: configData.customColors.secondaryColor,
                        onChange: "configData.customColors  = {colorProperty: 'secondaryColor', color: this.value};",
                    },
                    {
                        type: inputTypes.COLOR,
                        id: "accent-color-input",
                        label: "accent color",
                        value: configData.customColors.accentColor,
                        onChange: "configData.customColors = {colorProperty: 'accentColor', color: this.value};",
                    },
                    {
                        type: inputTypes.COLOR,
                        id: "selection-color-input",
                        label: "selection color",
                        value: configData.customColors.selectionColor,
                        onChange: "configData.customColors = {colorProperty: 'selectionColor', color: this.value};",
                    },
                    {
                        type: inputTypes.COLOR,
                        id: "font-color-input",
                        label: "font color",
                        value: configData.customColors.fontColor,
                        onChange: "configData.customColors  = {colorProperty: 'fontColor', color: this.value};",
                    },
                ]
            },
            {
                label: ui.lang.fontFamily,
                elements: [
                    {
                        type: inputTypes.SELECTOR,
                        label: ui.lang.selectFont,
                        id: "settings_font-family",
                        selectValues: [
                            ...Object.keys(fonts).map(fontName => ({
                                type: inputTypes.RADIO,
                                name: "settings_font-family",
                                id: `settings_font-family-${fontName}`,
                                label: fontName,
                                checked: configData.fontFamilyName === fontName,
                                event: `onchange="configData.fontFamilyName = '${fontName}';"`,
                            })),
                            // {
                            //     type: inputTypes.RADIO,
                            //     name: "settings_font-family",
                            //     id: "settings_font-family-Custom",
                            //     label: "Custom",
                            //     checked: ui.settings.FONT_NAME === "custom",
                            //     event: "onchange=\"ui.settings.selectFont('custom');\"",
                            // },
                        ]
                    },
                    // {
                    //     type: inputTypes.SEARCH_INPUT,
                    //     label: ui.lang.pasteHere,
                    //     id: "settings_font-input",
                    //     value: "",
                    //     onChange: "ui.settings.FONT_FAMILY = this.value; this.value = '';",
                    // },
                    {
                        type: inputTypes.BUTTON,
                        label: "-",
                        id: "settings_font-size-decrease",
                        onClick: "configData.fontSize = parseFloat(configData.fontSize) - 0.5;",
                    },
                    {
                        type: inputTypes.BUTTON,
                        label: "+",
                        id: "settings_font-size-increase",
                        onClick: "configData.fontSize = parseFloat(configData.fontSize) + 0.5;",
                    },
                ]
            },
            {
                label: ui.lang.raApi,
                elements: [
                    {
                        type: inputTypes.SEARCH_INPUT,
                        label: configData.targetUser || config.USER_NAME,
                        id: "settings_target-user-input",
                        value: configData.targetUser,
                        onChange: "configData.targetUser = this.value",
                        title: ui.lang.targetUserInputHint,
                    },
                    {
                        type: inputTypes.BUTTON,
                        label: ui.lang.checkGameID,
                        id: "settings_check-game-id",
                        onClick: "watcher.updateGameData(document.getElementById('settings_game-id-input').value)",
                    },
                    {
                        type: inputTypes.BUTTON,
                        label: ui.lang.getLastID,
                        id: "settings_get-last-id",
                        onClick: "ui.settings.getLastGameID()",
                    },
                    {
                        type: inputTypes.NUM_INPUT,
                        label: ui.lang.gameID,
                        id: "settings_game-id-input",
                        value: configData.gameID,
                        onChange: "configData.gameID = this.value;",
                    },
                    {
                        type: inputTypes.CHECKBOX,
                        label: ui.lang.loadLastSubset,
                        id: "settings_load-last-subset",
                        onChange: "configData.loadLastSubset = this.checked;",
                        checked: configData.loadLastSubset,
                    },
                ]
            },
            {
                label: ui.lang.autoupdate,
                elements: [
                    {
                        type: inputTypes.CHECKBOX,
                        label: ui.lang.startOnLoad,
                        id: "settings_start-on-load",
                        onChange: "configData.startOnLoad = this.checked;",
                        checked: configData.startOnLoad,
                    },
                    {
                        type: inputTypes.CHECKBOX,
                        label: ui.lang.pauseIfOffline,
                        id: "settings_autopause",
                        onChange: "configData.pauseIfOnline = this.checked;",
                        checked: configData.pauseIfOnline,
                    },
                    {
                        type: inputTypes.NUM_INPUT,
                        label: "sec",
                        id: "settings_update-delay-input",
                        value: configData.updateDelaySec,
                        onChange: "configData.updateDelaySec = this.value",
                        title: ui.lang.autoupdateInputHint,
                    },

                ]
            },
            {
                label: ui.lang.logParser,
                elements: [
                    {
                        type: inputTypes.CHECKBOX,
                        label: ui.lang.enableLogParser,
                        id: "settings_enable-log-parser",
                        onChange: "configData.parseLog = this.checked;",
                        checked: configData.parseLog,
                    },
                    {
                        label: ui.lang.selectRarchLog,
                        type: inputTypes.BUTTON,
                        id: "context_open-log-selector",
                        onClick: "config.selectLogFile('rarch')",
                    },
                ]
            },
            {
                label: ui.lang.fsAlerts,
                elements: [
                    {
                        type: inputTypes.CHECKBOX,
                        label: ui.lang.earnCheevoAlert,
                        id: "settings_fsalert-cheevo",
                        onChange: "configData.fsNewCheevo = this.checked;",
                        checked: configData.fsNewCheevo,
                    },
                    {
                        type: inputTypes.CHECKBOX,
                        label: ui.lang.earnAwardAlert,
                        id: "settings_fsalert-award",
                        onChange: "configData.fsNewAward = this.checked;",
                        checked: configData.fsNewAward,
                    },
                    {
                        type: inputTypes.NUM_INPUT,
                        label: ui.lang.duration,
                        id: "settings_fsakert-duration-input",
                        value: configData.fsAlertDuration,
                        onChange: "configData.fsAlertDuration = this.value",
                        title: ui.lang.fsAlertDurationInputHint
                    }
                ]
            },
            {
                label: ui.lang.dsAlerts,
                elements: [
                    {
                        type: inputTypes.TEXT_INPUT,
                        label: ui.lang.pasteWebhook,
                        id: "settings_discord-hook-input",
                        value: configData.discordWebhook ?? "",
                        onChange: "configData.discordWebhook = value;",
                    },
                    {
                        type: inputTypes.CHECKBOX,
                        label: ui.lang.startGameAlert,
                        id: "settings_discord-start-game",
                        onChange: "configData.discordNewGame = this.checked;",
                        checked: configData.discordNewGame,
                    },
                    {
                        type: inputTypes.CHECKBOX,
                        label: ui.lang.startSession,
                        id: "settings_discord-start-session",
                        onChange: "configData.discordStartSession = this.checked;",
                        checked: configData.discordStartSession,
                    },
                    {
                        type: inputTypes.CHECKBOX,
                        label: ui.lang.earnCheevoAlert,
                        id: "settings_discord-new-cheevo",
                        onChange: "configData.discordNewCheevo = this.checked;",
                        checked: configData.discordNewCheevo,
                    },
                    {
                        type: inputTypes.NUM_INPUT,
                        label: ui.lang.points,
                        id: "settings_min-points-alert",
                        title: ui.lang.DSAlertMinPointsInputHint,
                        value: configData.minPointsDiscordAlert,
                        onChange: "configData.minPointsDiscordAlert = this.value;",
                    },
                    {
                        type: inputTypes.NUM_INPUT,
                        label: ui.lang.retropoints,
                        title: ui.lang.DSAlertMinTruePointsInputHint,
                        id: "settings_min-retropoints-alert",
                        value: configData.minRetroPointsDiscordAlert,
                        onChange: "configData.minRetroPointsDiscordAlert = this.value;",
                    },
                    {
                        type: inputTypes.CHECKBOX,
                        label: "Hardcore Only",
                        id: "settings_discord-hard-award",
                        onChange: "configData.hardOnlyDiscordAlert = this.checked;",
                        checked: configData.hardOnlyDiscordAlert,
                    },
                    {
                        type: inputTypes.CHECKBOX,
                        label: ui.lang.earnAwardAlert,
                        id: "settings_discord-new-award",
                        onChange: "configData.discordNewAward = this.checked;",
                        checked: configData.discordNewAward,
                    },

                ]
            },
            {
                label: "Language",
                elements: [
                    {
                        name: "settings-language",
                        type: inputTypes.RADIO,
                        label: "English",
                        id: "settings_lang-en",
                        onChange: `ui.settings.LANG = '${local.en}';`,
                        checked: this.LANG === local.en,
                    },
                    {
                        name: "settings-language",
                        type: inputTypes.RADIO,
                        label: "Português (Brasil)",
                        id: "settings_lang-br",
                        onChange: `ui.settings.LANG = '${local.br}';`,
                        checked: this.LANG === local.br,
                    },
                    {
                        name: "settings-language",
                        type: inputTypes.RADIO,
                        label: "Українська",
                        id: "settings_lang-ua",
                        onChange: `ui.settings.LANG = '${local.ua}';`,
                        checked: this.LANG === local.ua,
                    },
                ]
            },
            {
                label: ui.lang.data,
                elements: [
                    {
                        label: ui.lang.exportCompletion,
                        type: inputTypes.BUTTON,
                        id: "context_export-completion",
                        onClick: "ui.exportCompletionDataToXlsx()",
                    },
                    {
                        label: ui.lang.exportWantToPlay,
                        type: inputTypes.BUTTON,
                        id: "context_export-wtp-list",
                        onClick: "ui.exportWantToPlayToCSV()",
                    },
                    {
                        label: ui.lang.exportSettings,
                        type: inputTypes.BUTTON,
                        id: "context_export-settings",
                        onClick: "ui.exportSettingsToJson()",
                    },
                    {
                        label: ui.lang.importSettings,
                        type: inputTypes.BUTTON,
                        id: "context_import-settings",
                        onClick: "ui.importSettingsFromJson()",
                    },
                    {
                        label: ui.lang.clearCache,
                        type: inputTypes.BUTTON,
                        id: "context_clear-cache",
                        onClick: "apiWorker.cache.clear()",
                    }]

            }
        ]
    }

    get LANG() {
        return config.ui?.local ?? local.en;
    }
    set LANG(value) {
        config.ui.local = value;
        config.writeConfiguration();
        setTimeout(() => location.reload(), 1000)
    }

    get IS_WINDOWS_STICKY() {
        return config.ui.isWindowsSticky ?? true;
    }
    set IS_WINDOWS_STICKY(value) {
        config.ui.isWindowsSticky = value;
        config.writeConfiguration();
    }




    get VISIBLE() {
        return !this.section.classList.contains("hidden");
    }
    get contextMenuItems() {
        return [
            this.contextSetsMenu(),
            {
                label: ui.lang.selectColors,
                elements: [
                    ...Object.keys(colorPresets).map(presetName => ({
                        type: inputTypes.RADIO,
                        name: "context_color-scheme",
                        id: `context_color- scheme - ${presetName}`,
                        label: presetName,
                        checked: configData.preset === presetName,
                        event: `onchange =\"configData.preset = '${presetName}'\"`,
                    })),
                    {
                        type: inputTypes.RADIO,
                        name: "context_color-scheme",
                        id: `settings_color-scheme-custom`,
                        label: "custom",
                        checked: configData.preset === "custom",
                        event: `onchange=\"configData.preset = 'custom'\"`,
                    }]
            },
            {
                label: ui.lang.animType,
                elements: [
                    {
                        label: ui.lang.showBgAnimation,
                        type: inputTypes.CHECKBOX,
                        id: "context_show-bg-animation",
                        checked: configData.bgVisibility,
                        event: `onchange="configData.bgVisibility = this.checked;"`,
                    },

                    ...Object.values(ANIMATIONS).map(anim => ({
                        type: inputTypes.RADIO,
                        name: "context_anim-variant",
                        id: `context_anim-variant-${anim}`,
                        label: anim,
                        checked: configData.bgAnimType === anim,
                        event: `onchange=\"configData.bgAnimType = '${anim}'\"`,
                    })),
                ]
            },

            {
                label: ui.lang.startOnLoad,
                type: inputTypes.CHECKBOX,
                id: "context_show-start-on-load",
                checked: configData.startOnLoad,
                event: `onchange="configData.startOnLoad = this.checked;"`,
            },
        ]
    }
    contextSetsMenu = () => Object.values(watcher.GAME_DATA?.availableSubsets ?? {})?.length > 1 ? {
        label: ui.lang.subsets,
        elements: Object.entries(watcher.GAME_DATA?.availableSubsets).map(([subsetName, subsetID]) => {
            subsetID = parseInt(subsetID);
            const isMainSet = subsetName === "Main";
            if (isMainSet || !subsetID) return "";
            const isVisible = config.gameConfig().visibleSubsets?.includes(subsetID);
            const checked = isMainSet || isVisible;
            return {
                type: inputTypes.CHECKBOX,
                name: "subset-select",
                id: `subset-select-${subsetName}`,
                label: subsetName,
                checked,
                event: `onclick="watcher.setSubset(${subsetID})"`,
            }
        }),
    } : "";
    constructor() {
        super();
        this.setValues();
    }
    setValues() {
        configData.fontSize = configData.fontSize;
        configData.fontFamilyName = configData.fontFamilyName;
    }
    addEvents() {
        super.addEvents();
        this.section.addEventListener("click", (e) => {
            this.section.querySelectorAll(".extended").forEach(el => el.classList.remove("extended"));
        });
    }
    generateWidget(settingsItems) {
        const widgetData = {
            classes: ["prefs_section", "section"],
            id: "settings_section",
            title: ui.lang.settingsSectionName,
            contentClasses: ["settings_container", "content-container"]
        };

        const generateSettingsContainer = (settingsItems) => {
            const container = this.section.querySelector(".content-container");
            container.innerHTML = ``;
            settingsItems.forEach(setting => {
                if (setting.elements) {
                    const settingItemsLine = document.createElement("li");
                    settingItemsLine.classList.add("settings_setting-line");
                    settingItemsLine.innerHTML = `
                    <h3 class="settings_setting-header">
                        ${setting?.label}
                    </h3>`;
                    setting.elements.forEach(settingItem => {
                        settingItemsLine.innerHTML += (input(settingItem));
                    });
                    container.appendChild(settingItemsLine);
                }
                else {
                    container.innerHTML += (input(setting));
                }
            })

        }
        const widget = this.generateWidgetElement(widgetData);
        ui.app.appendChild(widget);
        this.section = widget;
        this.section.querySelector(".resizer")?.remove();

        generateSettingsContainer(settingsItems);
        this.section.querySelectorAll(".statebox").forEach(sbox => sbox.addEventListener("click", stateboxClickHandler))
    }

    openSettings(settingsItems = this.settingsItems) {
        this.close();
        this.generateWidget(settingsItems);
        this.addEvents();
        config.ui.settings_section && (
            config.ui.settings_section.x && (this.section.style.left = config.ui.settings_section.x),
            config.ui.settings_section.y && (this.section.style.top = config.ui.settings_section.y)
        )
        ui.buttons.settings.checked = true;
    }

    close() {
        ui.buttons.settings.checked = false;
        this.section && this.section.remove();
    }


    getLastGameID() {
        apiWorker.getProfileInfo({}).then((resp) => {
            document.getElementById("settings_game-id-input").value = resp.LastGameID;
            configData.gameID = resp.LastGameID;
            watcher.updateGameData();
        });
    }

}