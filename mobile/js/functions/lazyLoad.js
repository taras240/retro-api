export function lazyLoad({ list, items, callback }) {
    const trigger = document.createElement("div");
    trigger.classList.add("lazy-load_trigger")
    list.appendChild(trigger);

    // Ініціалізація списку з початковими елементами
    let itemIndex = 0;
    const initialLoadCount = 40;
    const loadItems = (count) => {
        for (let i = 0; i < count && itemIndex < items.length; i++) {
            list.appendChild(callback(items[itemIndex++]));
        }
    };
    loadItems(initialLoadCount);

    // Callback функція для Intersection Observer
    const loadMoreItems = (entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                loadItems(initialLoadCount);
                observer.unobserve(trigger);
                if (itemIndex < items.length) {
                    list.appendChild(trigger);
                    observer.observe(trigger);
                }
                else {
                    trigger.remove();
                }

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