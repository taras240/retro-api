import { config, ui } from "../script.js";

function setPosition(event, offsetX, offsetY, section) {
    event.preventDefault();
    const XPos = event.clientX - offsetX;
    const YPos = event.clientY - offsetY;

    const { newXPos, newYPos } = stickMovingSection({
        x: XPos,
        y: YPos,
        stickySection: section,
    });

    section.style.left = newXPos + "px";
    section.style.top = newYPos + "px";
}
export function stickMovingSection({ x, y, stickySection }) {
    const { clientHeight, clientWidth } = stickySection;
    let newYPos = y;
    let newXPos = x;
    if (config.ui.isWindowsSticky === false) {
        return { newXPos, newYPos }
    }
    const TOLERANCE = ui.STICK_TOLERANCE;
    const MARGIN = ui.STICK_MARGIN;
    const stickConditions = [
        //* bottom-bottom
        {
            check: (section) =>
                Math.abs(
                    y + clientHeight - section.offsetTop - section.clientHeight
                ) < TOLERANCE,
            action: (section) =>
                (newYPos = section.offsetTop + section.clientHeight - clientHeight),
        },
        //* top-top
        {
            check: (section) => Math.abs(y - section.offsetTop) < TOLERANCE,
            action: (section) => (newYPos = section.offsetTop),
        },
        //* top - bottom
        {
            check: (section) =>
                Math.abs(y - section.offsetTop - section.clientHeight) < TOLERANCE,
            action: (section) =>
                (newYPos = section.offsetTop + section.clientHeight + MARGIN),
        },
        //* bottom - top
        {
            check: (section) =>
                Math.abs(y + clientHeight - section.offsetTop) < TOLERANCE,
            action: (section) =>
                (newYPos = section.offsetTop - clientHeight - MARGIN),
        },
        //* right - right
        {
            check: (section) =>
                Math.abs(x + clientWidth - section.offsetLeft - section.clientWidth) <
                TOLERANCE,
            action: (section) =>
                (newXPos = section.offsetLeft + section.clientWidth - clientWidth),
        },
        //* left - left
        {
            check: (section) => Math.abs(x - section.offsetLeft) < TOLERANCE,
            action: (section) => (newXPos = section.offsetLeft),
        },
        //* right - left
        {
            check: (section) =>
                Math.abs(x + clientWidth - section.offsetLeft) < TOLERANCE,
            action: (section) =>
                (newXPos = section.offsetLeft - clientWidth - MARGIN),
        },
        //* left - right
        {
            check: (section) =>
                Math.abs(x - section.offsetLeft - section.clientWidth) < TOLERANCE,
            action: (section) =>
                (newXPos = section.offsetLeft + section.clientWidth + MARGIN),
        },
    ];

    document.querySelectorAll(".section").forEach((section) => {
        if (stickySection != section) {
            stickConditions.forEach(({ check, action }) => check(section) && action(section));
        }
    });
    newXPos =
        Math.abs(window.innerWidth - newXPos - clientWidth) < TOLERANCE
            ? window.innerWidth - clientWidth
            : newXPos;

    //Перевірка залипання до лівого краю
    newXPos = Math.abs(newXPos) < TOLERANCE ? 0 : newXPos;

    //Перевірка залипання до нижнього краю
    newYPos =
        Math.abs(window.innerHeight - newYPos - clientHeight) < TOLERANCE
            ? window.innerHeight - clientHeight
            : newYPos;

    //Перевірка залипання до верхнього краю
    newYPos = Math.abs(newYPos) < TOLERANCE ? 0 : newYPos;
    return { newXPos, newYPos };
}
function moveEvent(section, event) {
    const onMouseMoveEvent = (event) => {
        setPosition(event, offsetX, offsetY, section);
    }
    const onMouseUpEvent = (event) => {
        event.preventDefault();
        removeEvents();
        savePosition();
    };
    const removeEvents = () => {
        section.classList.remove("dragable");
        app.removeEventListener("mousemove", onMouseMoveEvent);
        app.removeEventListener("mouseup", onMouseUpEvent);
    }
    const addEvents = () => {
        section.classList.add("dragable");
        app.addEventListener("mousemove", onMouseMoveEvent);
        app.addEventListener("mouseup", onMouseUpEvent);
    }
    const savePosition = () => {
        config.setNewPosition({
            id: section.id,
            xPos: section.style.left,
            yPos: section.style.top,
        });
    }
    const { app } = ui;

    const { left, top } = section.getBoundingClientRect();
    const offsetX = event.clientX - left;
    const offsetY = event.clientY - top;
    addEvents();
}



export { moveEvent }