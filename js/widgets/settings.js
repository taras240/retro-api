import { UI } from "../ui.js";
import { apiWorker, config, configData, ui, watcher } from "../script.js";
import { inputTypes, input, inputElement } from "../components/inputElements.js";
import { Widget } from "./widget.js";
import { obsPresets } from "../enums/obsPresets.js";
import { local } from "../enums/locals.js";
import { colorPresets } from "../enums/colorPresets.js";
import { fonts } from "../enums/fontsPreset.js";
import { ANIMATIONS } from "../enums/bgAnimations.js";
import { fromHtml } from "../functions/html.js";
import { WATCHER_MODES } from "../enums/watcherModes.js";
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
                        onClick: (event) => ui.showContextmenu({
                            event, menuItems: [
                                ...Object.keys(colorPresets).map(presetName => ({
                                    type: inputTypes.RADIO,
                                    name: "settings_color-scheme",
                                    id: `settings_color-scheme-${presetName}`,
                                    label: presetName,
                                    checked: configData.preset === presetName,
                                    onChange: () => configData.preset = presetName,
                                })),
                                {
                                    type: inputTypes.RADIO,
                                    name: "settings_color-scheme",
                                    id: `settings_color-scheme-custom`,
                                    label: "custom",
                                    checked: configData.preset === "custom",
                                    onChange: () => configData.preset = 'custom',
                                }]
                        }),

                    },
                    {
                        type: inputTypes.CHECKBOX,
                        label: ui.lang.showBgAnimation,
                        id: "settings_show-bg",
                        checked: configData.bgVisibility,
                        onChange: (event) => configData.bgVisibility = event.currentTarget.checked,
                    },
                    {
                        type: inputTypes.SELECTOR,
                        label: ui.lang.animType,
                        id: "settings_anims-variant",
                        onClick: (event) => ui.showContextmenu({
                            event, menuItems: [
                                ...Object.values(ANIMATIONS).map(anim => ({
                                    type: inputTypes.RADIO,
                                    name: "settings_anim-variant",
                                    id: `settings_anim-variant-${anim}`,
                                    label: anim,
                                    checked: configData.bgAnimType === anim,
                                    onChange: () => configData.bgAnimType = anim,
                                }))]
                        })
                    },
                    {
                        type: inputTypes.CHECKBOX,
                        label: ui.lang.stickyWindows,
                        id: "settings_sticky-windows",
                        checked: this.IS_WINDOWS_STICKY,
                        onChange: (event) => ui.settings.IS_WINDOWS_STICKY = event.currentTarget.checked,
                    },
                    {
                        type: inputTypes.CHECKBOX,
                        label: ui.lang.cheevoOnHover,
                        id: "settings_cheevo-on-hover",
                        checked: configData.showCheevoOnHover,
                        onChange: (event) => configData.showCheevoOnHover = event.currentTarget.checked,
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
                        onChange: (event) => configData.customColors = { colorProperty: 'mainColor', color: event.currentTarget.value },
                    },
                    {
                        type: inputTypes.COLOR,
                        id: "secondary-color-input",
                        label: "secondary color",
                        value: configData.customColors.secondaryColor,
                        onChange: (event) => configData.customColors = { colorProperty: 'secondaryColor', color: event.currentTarget.value },
                    },
                    {
                        type: inputTypes.COLOR,
                        id: "accent-color-input",
                        label: "accent color",
                        value: configData.customColors.accentColor,
                        onChange: (event) => configData.customColors = { colorProperty: 'accentColor', color: event.currentTarget.value },
                    },
                    {
                        type: inputTypes.COLOR,
                        id: "selection-color-input",
                        label: "selection color",
                        value: configData.customColors.selectionColor,
                        onChange: (event) => configData.customColors = { colorProperty: 'selectionColor', color: event.currentTarget.value },
                    },
                    {
                        type: inputTypes.COLOR,
                        id: "font-color-input",
                        label: "font color",
                        value: configData.customColors.fontColor,
                        onChange: (event) => configData.customColors = { colorProperty: 'fontColor', color: event.currentTarget.value },
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
                        onClick: (event) => ui.showContextmenu({
                            event, menuItems: [
                                ...Object.keys(fonts).map(fontName => ({
                                    type: inputTypes.RADIO,
                                    name: "settings_font-family",
                                    id: `settings_font-family-${fontName}`,
                                    label: fontName,
                                    checked: configData.fontFamilyName === fontName,
                                    onChange: () => configData.fontFamilyName = fontName,
                                }))

                                // {
                                //     type: inputTypes.RADIO,
                                //     name: "settings_font-family",
                                //     id: "settings_font-family-Custom",
                                //     label: "Custom",
                                //     checked: ui.settings.FONT_NAME === "custom",
                                //     event: "onchange=\"ui.settings.selectFont('custom');\"",
                                // },
                            ]
                        })
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
                        onClick: () => configData.fontSize = parseFloat(configData.fontSize) - 0.5,
                    },
                    {
                        type: inputTypes.BUTTON,
                        label: "+",
                        id: "settings_font-size-increase",
                        onClick: () => configData.fontSize = parseFloat(configData.fontSize) + 0.5,
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
                        title: ui.lang.targetUserInputHint,
                        onChange: (event) => configData.targetUser = event.currentTarget.value,
                    },
                    {
                        type: inputTypes.BUTTON,
                        label: ui.lang.checkGameID,
                        id: "settings_check-game-id",
                        onClick: () => watcher.updateGameData(document.getElementById('settings_game-id-input').value),
                    },
                    {
                        type: inputTypes.BUTTON,
                        label: ui.lang.getLastID,
                        id: "settings_get-last-id",
                        onClick: () => ui.settings.getLastGameID(),
                    },
                    {
                        type: inputTypes.NUM_INPUT,
                        label: ui.lang.gameID,
                        id: "settings_game-id-input",
                        value: configData.gameID,
                        onChange: (event) => configData.gameID = event.currentTarget.value,
                    },
                    // {
                    //     type: inputTypes.CHECKBOX,
                    //     label: ui.lang.loadLastSubset,
                    //     id: "settings_load-last-subset",
                    //     onChange: "configData.loadLastSubset = this.checked;",
                    //     checked: configData.loadLastSubset,
                    // },
                ]
            },
            {
                label: ui.lang.autoupdate,
                elements: [
                    // {
                    //     type: inputTypes.CHECKBOX,
                    //     label: ui.lang.startOnLoad,
                    //     id: "settings_start-on-load",
                    //     checked: configData.startOnLoad,
                    //     onChange: (event) => configData.startOnLoad = event.currentTarget.checked,
                    // },
                    // {
                    //     type: inputTypes.CHECKBOX,
                    //     label: ui.lang.pauseIfOffline,
                    //     id: "settings_autopause",
                    //     checked: configData.pauseIfOffline,
                    //     onChange: (event) => configData.pauseIfOffline = event.currentTarget.checked,
                    // },
                    {
                        type: inputTypes.SELECTOR,
                        label: ui.lang.watcherMode,
                        id: "settings_watcher-mode",
                        onClick: (event) => ui.showContextmenu({
                            event, menuItems: [
                                ...Object.keys(WATCHER_MODES).map(mode => ({
                                    type: inputTypes.RADIO,
                                    name: "settings_watcher-mode",
                                    id: `settings_watcher-mode-${mode}`,
                                    label: mode,
                                    checked: configData.watcherMode === mode,
                                    onChange: () => configData.watcherMode = mode,
                                }))

                                // {
                                //     type: inputTypes.RADIO,
                                //     name: "settings_font-family",
                                //     id: "settings_font-family-Custom",
                                //     label: "Custom",
                                //     checked: ui.settings.FONT_NAME === "custom",
                                //     event: "onchange=\"ui.settings.selectFont('custom');\"",
                                // },
                            ]
                        })
                    },
                    {
                        type: inputTypes.NUM_INPUT,
                        label: "sec",
                        id: "settings_update-delay-input",
                        value: configData.updateDelaySec,
                        title: ui.lang.autoupdateInputHint,
                        onChange: (event) => configData.updateDelaySec = event.currentTarget.value,
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
                        checked: configData.parseLog,
                        onChange: (event) => configData.parseLog = event.currentTarget.checked,
                    },
                    {
                        label: ui.lang.selectRarchLog,
                        type: inputTypes.BUTTON,
                        id: "context_open-log-selector",
                        onClick: () => config.selectLogFile('rarch'),
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
                        checked: configData.fsNewCheevo,
                        onChange: (event) => configData.fsNewCheevo = event.currentTarget.checked,
                    },
                    {
                        type: inputTypes.CHECKBOX,
                        label: ui.lang.earnAwardAlert,
                        id: "settings_fsalert-award",
                        checked: configData.fsNewAward,
                        onChange: (event) => configData.fsNewAward = event.currentTarget.checked,
                    },
                    {
                        type: inputTypes.NUM_INPUT,
                        label: ui.lang.duration,
                        id: "settings_fsakert-duration-input",
                        value: configData.fsAlertDuration,
                        title: ui.lang.fsAlertDurationInputHint,
                        onChange: (event) => configData.fsAlertDuration = event.currentTarget.value,
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
                        onChange: (event) => configData.discordWebhook = event.currentTarget.value,
                    },
                    {
                        type: inputTypes.CHECKBOX,
                        label: ui.lang.startGameAlert,
                        id: "settings_discord-start-game",
                        checked: configData.discordNewGame,
                        onChange: (event) => configData.discordNewGame = event.currentTarget.checked,
                    },
                    {
                        type: inputTypes.CHECKBOX,
                        label: ui.lang.startSession,
                        id: "settings_discord-start-session",
                        checked: configData.discordStartSession,
                        onChange: (event) => configData.discordStartSession = event.currentTarget.checked,
                    },
                    {
                        type: inputTypes.CHECKBOX,
                        label: ui.lang.earnCheevoAlert,
                        id: "settings_discord-new-cheevo",
                        checked: configData.discordNewCheevo,
                        onChange: (event) => configData.discordNewCheevo = event.currentTarget.checked,
                    },
                    {
                        type: inputTypes.NUM_INPUT,
                        label: ui.lang.points,
                        id: "settings_min-points-alert",
                        title: ui.lang.DSAlertMinPointsInputHint,
                        value: configData.minPointsDiscordAlert,
                        onChange: (event) => configData.minPointsDiscordAlert = event.currentTarget.value,
                    },
                    {
                        type: inputTypes.NUM_INPUT,
                        label: ui.lang.retropoints,
                        title: ui.lang.DSAlertMinTruePointsInputHint,
                        id: "settings_min-retropoints-alert",
                        value: configData.minRetroPointsDiscordAlert,
                        onChange: (event) => configData.minRetroPointsDiscordAlert = event.currentTarget.value,
                    },
                    {
                        type: inputTypes.CHECKBOX,
                        label: "Hardcore Only",
                        id: "settings_discord-hard-award",
                        checked: configData.hardOnlyDiscordAlert,
                        onChange: (event) => configData.hardOnlyDiscordAlert = event.currentTarget.checked,
                    },
                    {
                        type: inputTypes.CHECKBOX,
                        label: ui.lang.earnAwardAlert,
                        id: "settings_discord-new-award",
                        checked: configData.discordNewAward,
                        onChange: (event) => configData.discordNewAward = event.currentTarget.checked,
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
                        checked: this.LANG === local.en,
                        onChange: () => ui.settings.LANG = local.en,
                    },
                    {
                        name: "settings-language",
                        type: inputTypes.RADIO,
                        label: "Português (Brasil)",
                        id: "settings_lang-br",
                        checked: this.LANG === local.br,
                        onChange: () => ui.settings.LANG = local.br,
                    },
                    {
                        name: "settings-language",
                        type: inputTypes.RADIO,
                        label: "Українська",
                        id: "settings_lang-ua",
                        checked: this.LANG === local.ua,
                        onChange: () => ui.settings.LANG = local.ua,
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
                        onClick: () => ui.exportCompletionDataToXlsx(),
                    },
                    {
                        label: ui.lang.exportWantToPlay,
                        type: inputTypes.BUTTON,
                        id: "context_export-wtp-list",
                        onClick: () => ui.exportWantToPlayToCSV(),
                    },
                    {
                        label: ui.lang.exportSettings,
                        type: inputTypes.BUTTON,
                        id: "context_export-settings",
                        onClick: () => ui.exportSettingsToJson(),
                    },
                    {
                        label: ui.lang.importSettings,
                        type: inputTypes.BUTTON,
                        id: "context_import-settings",
                        onClick: () => ui.importSettingsFromJson(),
                    },
                    {
                        label: ui.lang.clearCache,
                        type: inputTypes.BUTTON,
                        id: "context_clear-cache",
                        onClick: () => apiWorker.cache.clear(),
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
                        onChange: () => configData.preset = presetName,
                    })),
                    {
                        type: inputTypes.RADIO,
                        name: "context_color-scheme",
                        id: `settings_color-scheme-custom`,
                        label: "custom",
                        checked: configData.preset === "custom",
                        onChange: () => configData.preset = 'custom',
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
                        onChange: (event) => configData.bgVisibility = event.currentTarget.checked,
                    },

                    ...Object.values(ANIMATIONS).map(anim => ({
                        type: inputTypes.RADIO,
                        name: "context_anim-variant",
                        id: `context_anim-variant-${anim}`,
                        label: anim,
                        checked: configData.bgAnimType === anim,
                        onChange: () => configData.bgAnimType = anim,
                    })),
                ]
            },

            // {
            //     label: ui.lang.startOnLoad,
            //     type: inputTypes.CHECKBOX,
            //     id: "context_show-start-on-load",
            //     checked: configData.startOnLoad,
            //     onChange: (event) => configData.startOnLoad = event.currentTarget.checked,
            // },
        ]
    }
    contextSetsMenu = () => Object.values(watcher.GAME_DATA?.availableSubsets ?? {})?.length > 1 ? {
        label: ui.lang.subsets,
        elements: Object.entries(watcher.GAME_DATA?.availableSubsets).map(([subsetName, subsetID]) => {
            subsetID = parseInt(subsetID);
            const isCurrentSet = subsetID === watcher.GAME_DATA.ID;
            if (isCurrentSet || !subsetID) return "";
            const isVisible = config.gameConfig().visibleSubsets?.includes(subsetID);
            const checked = isCurrentSet || isVisible;
            return {
                type: inputTypes.CHECKBOX,
                name: "subset-select",
                id: `subset-select-${subsetName}`,
                label: subsetName,
                checked,
                onChange: (event) => watcher.setSubset(subsetID),
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
                if (!setting) return;
                if (setting.elements) {
                    const settingItemsLine = document.createElement("li");
                    settingItemsLine.classList.add("settings_setting-line");
                    const settingLabel = fromHtml(`
                            <h3 class="settings_setting-header">
                                ${setting?.label}
                            </h3>
                        `)
                    settingItemsLine.append(settingLabel);
                    setting.elements.forEach(settingItem => {
                        settingItemsLine.append(inputElement(settingItem));
                    });
                    container.appendChild(settingItemsLine);
                }
                else {
                    container.append(inputElement(setting));
                }
            })

        }
        const widget = this.generateWidgetElement(widgetData);
        ui.app.appendChild(widget);
        this.section = widget;
        this.section.querySelector(".resizer")?.remove();

        generateSettingsContainer(settingsItems);
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