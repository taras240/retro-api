export function setPopupPosition(popup, event) {

    const calcPopupPosition = (popupSize, windowSize, cursorPosition, delta = 10) => {
        if (cursorPosition + popupSize + delta < windowSize) return cursorPosition + delta;
        if (cursorPosition - popupSize - delta < 0) return 5;
        return cursorPosition - popupSize - delta;
    }
    const windowWidth = document.documentElement.clientWidth;
    const windowHeight = document.documentElement.clientHeight;

    const leftPos = event.x;
    const topPos = event.y;

    popup.style.top = calcPopupPosition(popup.offsetHeight, windowHeight, topPos) + "px";
    popup.style.left = calcPopupPosition(popup.offsetWidth, windowWidth, leftPos) + "px";

}