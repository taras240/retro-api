export const moveDirections = {
    top: "N",
    left: "W",
    right: "E",
    bottom: "S",
    topRight: "NE",
    topLeft: "NW",
    bottomRight: "SE",
    bottomLeft: "SW",
}
export const sumDirections = (verticalDir, horizontalDir) => {
    return verticalDir + horizontalDir;
}