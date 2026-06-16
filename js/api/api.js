import { APIEvents } from "../script.js";

function getWorkerUrl() {
    if (typeof import.meta?.url === "string") {
        return new URL("./api.worker.js", import.meta.url);
    }

    const currentScript = document.currentScript;
    if (currentScript?.src) {
        return new URL("./api.worker.js", currentScript.src);
    }

    return new URL("/js/api/api.worker.js", window.location.origin);
}
const worker = new Worker(getWorkerUrl(), {
    type: 'module',
});
const pending = new Map();

worker.onmessage = ({ data }) => {
    const { id, result, error } = data;

    const request = pending.get(id);

    if (!request) {
        return;
    }

    pending.delete(id);

    if (error) {
        request.reject(error);
    } else {
        request.resolve(result);
    }
};

export function call(method, ...params) {
    APIEvents.dispatchEvent(new CustomEvent("APIRequest"));
    return new Promise((resolve, reject) => {
        const id = crypto.randomUUID();

        pending.set(id, { resolve, reject });

        worker.postMessage({
            id,
            method,
            params,
        });
    });
}