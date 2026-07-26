export function toLocalString(dateString) {
    if (!dateString) return null;
    const date = new Date(dateString);
    return date.toLocaleString();
}