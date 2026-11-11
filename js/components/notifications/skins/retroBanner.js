import { getAlertActivityLabel } from "../../../functions/alerts/alertActivityLabel.js";
import { fromHtml } from "../../../functions/html.js";

export function retroBannerAlert(data, lang) {
    const status = getAlertActivityLabel(data, lang);
    const heading = data.title || "";
    const meta = data.meta || "";
    const platform = data.details?.platform || "";
    const background = data.backgroundImageUrl
        ? `<img class="retro-banner__background" src="${data.backgroundImageUrl}" alt="">`
        : "";

    return fromHtml(`
        <li.alerts-popup.skin-retro-banner style="--alert-color:${data.badge.color}">
            ${background}
            <.retro-banner__shade/>
            <.retro-banner__content>
                <.retro-banner__body>
                    <img.retro-banner__image src="${data.imageUrl}" alt="">
                    <.retro-banner__text>
                        <h3.retro-banner__header>${status}</h2>
                        <h2.retro-banner__title>${heading}</h3>
                        ${meta ? `<p.retro-banner__meta>${meta}</p>` : ""}
                    </>
                </>
            </>
        </li>
    `);
}
