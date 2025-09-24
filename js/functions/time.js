export function formatTime(seconds, shortType = false) {
    if (!isFinite(seconds)) return ("");
    const isNegative = seconds < 0;
    seconds = Math.abs(seconds);

    let hours = Math.floor(seconds / 3600);
    let minutes = Math.floor((seconds % 3600) / 60);
    let remainingSeconds = seconds % 60;

    // Додавання ведучих нулів, якщо необхідно
    hours = hours.toString().padStart(2, "0");
    minutes = minutes.toString().padStart(2, "0");
    remainingSeconds = remainingSeconds.toString().padStart(2, "0");

    const fullTime = `${isNegative ? "-" : ""}${hours > 0 ? hours + ":" : ""}${minutes}:${remainingSeconds}`;
    const shortTime = hours == 0
        ? fullTime
        : `${isNegative ? "-" : ""}${hours}<i class="time__blinked-dots">:</i>${minutes}`;
    return shortType ? shortTime : fullTime;
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