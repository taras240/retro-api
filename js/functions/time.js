export function formatTime(totalSeconds, shortType = false) {
    if (!isFinite(totalSeconds)) return ("");

    const { hours, minutes, seconds, isNegative } = parseTimeParts(totalSeconds);

    const fullTime = `${isNegative ? "-" : ""}${hours > 0 ? hours + ":" : ""}${minutes}:${seconds}`;
    const shortTime = hours == 0
        ? fullTime
        : `${isNegative ? "-" : ""}${hours}<i class="time__blinked-dots">:</i>${minutes}`;
    return shortType ? shortTime : fullTime;
}
export function parseTimeParts(totalSeconds) {
    if (!isFinite(totalSeconds)) return ({
        seconds: "00",
        minutes: "00",
        hours: "00"
    });

    const isNegative = totalSeconds < 0;
    totalSeconds = Math.abs(totalSeconds);

    let hours = Math.floor(totalSeconds / 3600);
    let minutes = Math.floor((totalSeconds % 3600) / 60);
    let seconds = totalSeconds % 60;

    // Додавання ведучих нулів, якщо необхідно
    hours = hours.toString().padStart(2, "0");
    minutes = minutes.toString().padStart(2, "0");
    seconds = seconds.toString().padStart(2, "0");

    return { hours, minutes, seconds, isNegative };
}
export function secondsToBadgeString(seconds) {
    if (!seconds) return "--/--";
    seconds = +seconds;

    let hours = Math.floor(seconds / 3600);
    let minutes = Math.floor((seconds % 3600) / 60);
    let remainingSeconds = seconds % 60;

    return hours ? `${hours}h${minutes}m` : minutes ?
        `${minutes}min${minutes > 1 ? "s" : ""}` : `${remainingSeconds}secs`
}
export function formatDateTime(UTCTime, props) {
    const options = {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
        ...props
    };
    const UTCReg = /(\+00\:00$)|(z$)/gi;

    !UTCReg.test(UTCTime) && (UTCTime += "+00:00"); // Mark time as UTC Time 

    const date = new Date(UTCTime);

    if (isNaN(date.getTime())) return "";

    const localDate = date.toLocaleDateString("uk-UA", options);
    return localDate;
}
export function formatDate(date) {
    return new Date(date).toLocaleDateString("uk-UA")
}