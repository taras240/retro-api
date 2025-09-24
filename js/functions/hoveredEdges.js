import { moveDirections, sumDirections } from "../enums/moveDirections.js";

export const getHoveredEdge = (event, section) => {
    const MARGIN = 5;
    const { left, top, width, height } = section.getBoundingClientRect();
    const windowBordersPos = {
        left: left,
        top: top,
        right: left + width,
        bottom: top + height
    }
    const edgeHover = {
        left: event.clientX - windowBordersPos.left <= MARGIN,
        right: windowBordersPos.right - event.clientX <= MARGIN,
        top: event.clientY - windowBordersPos.top <= MARGIN,
        bottom: windowBordersPos.bottom - event.clientY <= MARGIN
    }
    let direction = "";

    if (edgeHover.top) direction = moveDirections.top;
    else if (edgeHover.bottom) direction = moveDirections.bottom;

    if (edgeHover.left) direction += moveDirections.left;
    else if (edgeHover.right) direction += moveDirections.right;
    return direction;

}