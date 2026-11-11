import { ALERT_TYPES } from "../../../enums/alerts.js";
import { getAlertActivityLabel } from "../../../functions/alerts/alertActivityLabel.js";
import { fromHtml } from "../../../functions/html.js";

export function fullscreenAlert(data, lang) {
    const status = getAlertActivityLabel(data, lang);
    const isAchievement = data.type === ALERT_TYPES.CHEEVO;
    const isAward = data.type === ALERT_TYPES.AWARD;
    return fromHtml(`
            <.fs-alert__container>
                <.fs-alert__main-content>
                    <.fs-alert__border.fs-alert__border-top/>
                    <.fs-alert__header>${status}</>
                    <.fs-alert__sub-border/>
                    <.fs-alert__image-container>
                        <.fs-alert__light/>
                        <img.fs-alert__image src="${data.imageUrl}">
                        <.fs-alert__blick/>
                    </>
                    <.fs-alert__title>
                        ${data.title}
                    </>
                    <.fs-alert__border.fs-alert__border-botton/>
                    <.fs-alert__description>
                        ${isAchievement ? data.meta : ""}
                    </>
                </>
            </>
        `);
}