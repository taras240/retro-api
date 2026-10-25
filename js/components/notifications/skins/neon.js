import { fromHtml } from "../../../functions/html.js";

const presentDetails = (data, lang) => {
    const detail = (label, value) => value === undefined || value === null || value === ""
        ? ""
        : `<span class="neon-alert__detail"><span>${label}:</span> ${value}</span>`;
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

export function neonAlert(data, lang) {
    const details = presentDetails(data, lang);

    return fromHtml(`
        <li.alerts-popup.skin-neon style="--alert-color:${data.badge.color}">
            <.neon-alert__frame>
                <.neon-alert__heading>
                    <span.neon-alert__status>${data.badge.title}</span>
                    <h3.neon-alert__title><a href="${data.titleUrl}" target="_blank">${data.title}</a></h3>
                </>
                <.neon-alert__body>
                    <img.neon-alert__image src="${data.imageUrl}" alt="">
                    <.neon-alert__details>
                        ${data.meta ? `<p.neon-alert__meta>${data.meta}</p>` : ""}
                        ${details ? `<.neon-alert__details-list>${details}</>` : ""}
                    </>
                </>
            </>
        </>
    `);
}
