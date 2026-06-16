import { APIEvents } from "../script.js";

const worker = new Worker(
    new URL('./api.worker.js', import.meta.url),
    { type: 'module' }
);
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