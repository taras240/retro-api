import { moveDirections } from "../enums/moveDirections.js";
import { config, ui } from "../script.js";
import { stickMovingSection } from "./movingWidget.js";

// Resizing func for widgets
function resizeEvent({ event, section, callback, resizeDirection = moveDirections.bottomRight }) {
    const { app } = ui;
    const minWidth = parseInt(window.getComputedStyle(section).minWidth ?? 10);
    let resizeValues = {
        // Start sizes
        startWidth: section.clientWidth,
        startHeight: section.clientHeight,
        windowTop: section.offsetTop,
        windowLeft: section.offsetLeft,

        // Pointer position
        startX: event.clientX,
        startY: event.clientY,

        minWidth,
    };
    const onMouseMoveEvent = (event) => {
        section.classList.add("resized", `resised-${resizeDirection}`);
        // Set new sizes for widget
        setSize(event, resizeValues, section, resizeDirection);

    };
    const onMouseUpEvent = (event) => {
        // Call callback func if exist
        callback && callback();
        section.classList.remove("resized", `resised-${[resizeDirection]}`);
        removeEvents();
        // Save new sizes to config file
        saveSize();
    }
    const removeEvents = () => {
        app.removeEventListener("mousemove", onMouseMoveEvent);
        // Remove event 'mousemove' if stop resizing and save new sizes
        app.removeEventListener("mouseup", onMouseUpEvent);
    }
    const addEvents = () => {
        // Add event for mouse move
        app.addEventListener("mousemove", onMouseMoveEvent);

        // Remove event 'mousemove' if stop resizing and save new sizes
        app.addEventListener("mouseup", onMouseUpEvent);
    }
    const saveSize = () => {
        config.setNewPosition({
            id: section.id,
            width: section.clientWidth,
            height: section.clientHeight,
            xPos: section.style.left,
            yPos: section.style.top,
        });
    }
    addEvents();
}
function setSize(event, resizeValues, section, direction = moveDirections.bottomRight) {

    // Getting start sizes for widget
    let { startWidth, startHeight, windowLeft, windowTop, startX, startY, minWidth } = resizeValues;
    const windowRight = windowLeft + startWidth;
    const windowBottom = windowTop + startHeight;
    let newWindowTop = windowTop;
    let newWindowLeft = windowLeft;
    // Calculate delta sizes
    let widthChange = direction.includes(moveDirections.right) ?
        event.clientX - startX :
        startX - event.clientX;
    let heightChange = direction.includes(moveDirections.bottom) ?
        event.clientY - startY :
        startY - event.clientY;
    // debugger;
    let width = startWidth;
    let height = startHeight;
    // console.log(resizeValues)

    if (direction.includes(moveDirections.top)) {
        newWindowTop -= heightChange;
    }
    if (direction.includes(moveDirections.left)) {
        newWindowLeft -= widthChange;
    }

    let { newXPos, newYPos } = stickMovingSection({ x: newWindowLeft, y: newWindowTop, stickySection: section })


    if (direction.includes(moveDirections.top)) {
        heightChange = windowBottom - newYPos - startHeight;
    }
    if (direction.includes(moveDirections.left)) {
        widthChange = windowRight - newXPos - startWidth;
    }

    if (direction.length === 2) {
        width += widthChange;
        height += heightChange;
    }
    else if (["E", "W"].includes(direction)) {
        width += widthChange;
    }
    else {
        height += heightChange;
    }
    //Check for stick to another widgets
    let { newHeight, newWidth } = stickResizingSection({
        width: width,
        height: height,
        stickySection: section,
    });
    if (minWidth >= newWidth) return;
    // Set new sizes for widget
    section.style.width = `${newWidth}px`;
    section.style.height = `${newHeight}px`;
    section.style.left = newXPos + "px";
    section.style.top = newYPos + "px";
}

function stickResizingSection({ width, height, stickySection }) {
    const { offsetTop, offsetLeft } = stickySection;
    let newWidth = width;
    let newHeight = height;
    if (config.ui.isWindowsSticky === false) {
        return { newWidth, newHeight }
    }
    const { STICK_TOLERANCE, STICK_MARGIN } = ui;

    const conditions = [
        // bottom-bottom
        {
            check: (section) =>
                Math.abs(
                    offsetTop + height - section.offsetTop - section.clientHeight
                ) < STICK_TOLERANCE,
            action: (section) =>
                (newHeight = section.offsetTop + section.clientHeight - offsetTop),
        },
        // bottom - top
        {
            check: (section) =>
                Math.abs(offsetTop + height - section.offsetTop) < STICK_TOLERANCE,
            action: (section) =>
                (newHeight = section.offsetTop - offsetTop - STICK_MARGIN),
        },
        // right - right
        {
            check: (section) =>
                Math.abs(
                    offsetLeft + width - section.offsetLeft - section.clientWidth
                ) < STICK_TOLERANCE,
            action: (section) =>
                (newWidth = section.offsetLeft + section.clientWidth - offsetLeft),
        },
        // right - left
        {
            check: (section) =>
                Math.abs(offsetLeft + width - section.offsetLeft) < STICK_TOLERANCE,
            action: (section) =>
                (newWidth = section.offsetLeft - offsetLeft - STICK_MARGIN),
        },
    ];

    document.querySelectorAll(".section").forEach((section) => {
        if (stickySection != section) {
            conditions.forEach(({ check, action }) => check(section) && action(section));
        }
    });

    //Check for stick to window borders
    //Check for stick to right border
    newWidth =
        Math.abs(window.innerWidth - offsetLeft - newWidth) < STICK_TOLERANCE
            ? window.innerWidth - offsetLeft
            : newWidth;

    //Check for stick to bottom border
    newHeight =
        Math.abs(window.innerHeight - offsetTop - newHeight) < STICK_TOLERANCE
            ? window.innerHeight - offsetTop
            : newHeight;

    return { newWidth, newHeight };
}
export { resizeEvent }