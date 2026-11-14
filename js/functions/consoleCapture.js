const pendingEntries = [];
const subscribers = new Set();
let installed = false;

const formatArgument = (value) => {
    if (typeof value === "string") return value;
    if (value instanceof Error) return value.stack || `${value.name}: ${value.message}`;
    if (typeof value === "undefined") return "undefined";
    if (typeof value === "bigint") return `${value}n`;

    try {
        return JSON.stringify(value) ?? String(value);
    } catch {
        return "[Unserializable value]";
    }
};

const publishEntry = (entry) => {
    if (subscribers.size === 0) {
        pendingEntries.push(entry);
        return;
    }
    subscribers.forEach((subscriber) => subscriber(entry));
};

export function installConsoleCapture() {
    if (installed) return;
    installed = true;

    ["error", "log", "warn"].forEach((level) => {
        const original = console[level].bind(console);
        console[level] = (...args) => {
            publishEntry(`[${level.toUpperCase()}] ${args.map(formatArgument).join(" ")}`);
            original(...args);
        };
    });
}

export function subscribeToConsole(subscriber) {
    subscribers.add(subscriber);
    pendingEntries.splice(0).forEach(subscriber);
    return () => subscribers.delete(subscriber);
}
