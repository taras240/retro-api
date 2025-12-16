export const formatText = (string, data) => {
    return string.replace(/\{\{(\w+)\}\}/g, (_, key) => {
        const value = data[key];
        return typeof value === "function" ? value() : value ?? "";
    });
}