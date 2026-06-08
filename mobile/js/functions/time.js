export function toLocalString(dateString) {
    const date = new Date(dateString);
    return date.toLocaleString();
}