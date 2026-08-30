import { badgeElements } from "../badges.js";
import { buttonsHtml } from "../htmlElements.js";

export const focusCheevoHtml = () => `
        <.rp__focus-cheevo>
            <.rp__focus-preview>
                <img.rp__focus-image src="">
            </>
            <.rp__focus-info>
                <h3.rp__focus-title/>
                <.rp__focus-description"/>
            </>
            <.element-control__container>
                ${buttonsHtml.prev("previous_focus")}
                ${buttonsHtml.reset("reset_focus")}
                ${buttonsHtml.next("next_focus")}
            </>
        </>
    `;