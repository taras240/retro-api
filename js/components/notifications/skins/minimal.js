import { fromHtml } from "../../../functions/html.js";

const presentDetails = (data, lang) => {
    const detail = (label, value) => value === undefined || value === null || value === ""
        ? ""
        : `<p.minimal-alert__detail><span>${label}:</span> ${value}</p>`;
    const { details } = data;

    if (data.type === "cheevo" || data.type === "award") {
        const rate = data.type === "cheevo"
            ? details.unlockRate
            : details.playerCount > 0 && details.unlockedCount != null
                ? `${(100 * details.unlockedCount / details.playerCount).toFixed(1)}%`
                : "";
        return [
            detail(lang.unlockRate, rate),
            detail(data.type === "cheevo" ? lang.points : lang.pointsEarned, data.type === "cheevo" ? details.points : details.pointsEarned),
        ].join("");
    }

    const year = String(details.released ?? "").match(/\b\d{4}\b/)?.[0];
    return [
        detail(lang.releaseYear, year),
        detail(lang.developer, details.developer),
        detail(lang.publisher, details.publisher),
    ].join("");
};

export function minimalAlert(data, lang) {
    const details = presentDetails(data, lang);

    return fromHtml(`
        <li.alerts-popup.skin-minimal style="--alert-color:${data.badge.color}">
            <img.minimal-alert__image src="${data.imageUrl}" alt="">
            <.minimal-alert__content>
                <.minimal-alert__heading>
                    <span.minimal-alert__badge>${data.badge.title}</span>
                    <a.minimal-alert__title href="${data.titleUrl}" target="_blank">${data.title}</a>
                </>
                ${data.meta ? `<p.minimal-alert__meta>${data.meta}</p>` : ""}
                ${details ? `<.minimal-alert__details>${details}</>` : ""}
            </>
        </>
    `);
}
