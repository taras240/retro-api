import { delay } from "./delay.js";

export async function animateNewOrder(container, newOrder, animationDuration = 500) {

    const items = [...container.children];
    const positions = new Map();
    items.forEach(el => {
        positions.set(el, el.getBoundingClientRect());
    });
    newOrder.forEach(el => container.appendChild(el));

    newOrder.forEach(async (el, index) => {
        el.style.zIndex = 1000 - index;
        setTimeout(() => el.style.removeProperty('z-index'), animationDuration + 100)
        const old = positions.get(el);
        const newPos = el.getBoundingClientRect();
        const dx = old.left - newPos.left;
        const dy = old.top - newPos.top;

        el.style.transform = `translate(${dx}px, ${dy}px)`;
        el.style.transition = 'transform 0s';
        // await delay(100);
        el.offsetHeight; // force reflow

        el.style.transition = `transform ${animationDuration}ms`;
        el.style.transform = '';
    });
    await delay(animationDuration + 100);
}