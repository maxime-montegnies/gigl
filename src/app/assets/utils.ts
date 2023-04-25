
const degToRad = (deg:number) => {
    return deg / 180 * Math.PI;
}
const radToDeg = (deg:number) => {
    return deg / Math.PI * 180;
}

export { degToRad, radToDeg };