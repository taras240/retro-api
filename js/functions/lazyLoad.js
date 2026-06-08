import { fromHtml } from "./html.js";

export function lazyLoad({ list, items, elementGenerator }) {
    const trigger = fromHtml(`<div class="lazy-load_trigger"/>`);
    list.appendChild(trigger);

    // Ініціалізація списку з початковими елементами
    let itemIndex = 0;
    const initialLoadCount = 20;
    const loadItems = (count) => {
        for (let i = 0; i < count && itemIndex < items.length; i++) {
            list.appendChild(elementGenerator(items[itemIndex++]));
        }
    };
    loadItems(initialLoadCount);

    // Callback функція для Intersection Observer
    const loadMoreItems = (entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                loadItems(initialLoadCount);
                // Оновлюємо спостереження
                observer.unobserve(trigger);
                list.appendChild(trigger);
                itemIndex < items.length && observer.observe(trigger);
            }
        });
    };
    // Налаштування Intersection Observer
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 1.0
    };
    const observer = new IntersectionObserver(loadMoreItems, observerOptions);

    // Початкове спостереження за тригером
    observer.observe(trigger);
}