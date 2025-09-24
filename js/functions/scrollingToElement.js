import { delay } from "./delay.js";

export async function scrollElementIntoView({ container, element, scrollByX = true, scrollByY = true }) {
    if (!container || !element) return;
    const containerRect = container.getBoundingClientRect();
    const elRect = element.getBoundingClientRect();
    const offsetTop =
        elRect.top - containerRect.top + container.scrollTop - (container.clientHeight / 2) + (element.offsetHeight / 2);
    const offsetLeft =
        elRect.left - containerRect.left + container.scrollLeft - (container.clientWidth / 2) + (element.offsetWidth / 2);


    container.scrollTo({
        top: scrollByY ? offsetTop : container.scrollTop,
        left: scrollByX ? offsetLeft : container.scrollLeft,
        behavior: 'smooth'
    });
    await delay(600);
};
