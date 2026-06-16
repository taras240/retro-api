export function setPopupPosition(popup, event, isCheevo) {
    const { innerWidth: windowWidth, innerHeight: windowHeight } = window;
    const { clientX: leftPos, clientY: topPos } = event;
    const popupWidth = popup.offsetWidth;
    const popupHeight = popup.offsetHeight;

    let popupXPos = 0;
    let popupYPos = 0;

    if (isCheevo) {
        const cheevoContainer = event.target.closest('[data-achiv-id]');
        const container = event.target.closest('.section,.constructor-element');
        const cheevoRect = cheevoContainer ? cheevoContainer.getBoundingClientRect() : { top: topPos };
        const containerRect = container ? container.getBoundingClientRect() : null;

        // Prefer to position relative to container's right edge when possible
        const rightAnchor = containerRect ? containerRect.right : leftPos;
        popupYPos = calcPopupPosition(popupHeight, windowHeight, cheevoRect.top, 0);

        if (containerRect && rightAnchor + popupWidth > windowWidth) {
            const popupLeftPos = containerRect.left - popupWidth;
            if (popupLeftPos < 0) {
                // fallback to cursor-based positioning
                popupXPos = calcPopupPosition(popupWidth, windowWidth, leftPos);
                popupYPos = calcPopupPosition(popupHeight, windowHeight, topPos);
            } else {
                popupXPos = popupLeftPos;
            }
        } else {
            popupXPos = rightAnchor;
        }
    } else {
        popupYPos = calcPopupPosition(popupHeight, windowHeight, topPos);
        popupXPos = calcPopupPosition(popupWidth, windowWidth, leftPos);
    }

    popup.style.left = popupXPos + 'px';
    popup.style.top = popupYPos + 'px';
}
const calcPopupPosition = (popupSize, windowSize, cursorPosition, delta = 10) => {
    // prefer placing after cursor, otherwise before cursor, otherwise clamp to small margin
    if (cursorPosition + popupSize + delta <= windowSize) return cursorPosition + delta;
    if (cursorPosition - popupSize - delta >= 0) return cursorPosition - popupSize - delta;
    return 5;
};