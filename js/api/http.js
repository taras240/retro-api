import { ui } from "../script.js";

// Cache for storing request results with timestamps
const requestCache = new Map();
// Map for storing in-flight requests (promises)
const inFlightRequests = new Map();
// Queue for serializing network requests
const requestQueue = [];
let isProcessingQueue = false;
let lastRequestTime = 0;

const CACHE_TTL = 3000; // 3 seconds in milliseconds
const THROTTLE_MS = 600; // 0.6 seconds between requests

function getCacheKey(endpoint, params) {
    return `${endpoint}:${JSON.stringify(params)}`;
}

function getCachedData(endpoint, params) {
    const key = getCacheKey(endpoint, params);
    const cached = requestCache.get(key);
    if (cached) {
        const age = Date.now() - cached.timestamp;
        if (age < CACHE_TTL) {
            return cached.data;
        } else {
            requestCache.delete(key);
        }
    }
    return null;
}

function setCachedData(endpoint, params, data) {
    const key = getCacheKey(endpoint, params);
    requestCache.set(key, {
        data,
        timestamp: Date.now()
    });
}

function sleep(ms) {
    return new Promise((res) => setTimeout(res, ms));
}

async function processQueue() {
    if (isProcessingQueue) return;
    isProcessingQueue = true;

    while (requestQueue.length > 0) {
        // Wait out the remaining throttle window since the last request started
        const elapsed = Date.now() - lastRequestTime;
        const wait = THROTTLE_MS - elapsed;
        if (lastRequestTime > 0 && wait > 0) {
            await sleep(wait);
        }

        const task = requestQueue.shift();
        lastRequestTime = Date.now();

        try {
            const result = await task.run();
            task.resolve(result);
        } catch (err) {
            task.reject(err);
        }
    }

    isProcessingQueue = false;
}

export async function request(endpoint, params) {
    const key = getCacheKey(endpoint, params);

    // Check cache first
    const cachedData = getCachedData(endpoint, params);
    if (cachedData !== null) {
        return cachedData;
    }

    // If identical request is already in flight (or queued), reuse its promise
    if (inFlightRequests.has(key)) {
        return inFlightRequests.get(key);
    }

    const BASE_URL = `https://retroachievements.org/API/`;
    const TEST_BASE_URL = `/json/apiTemplates/`
    let url = new URL(BASE_URL + endpoint);
    if (ui?.isTest) {
        return await fetch(TEST_BASE_URL + endpoint.replace(/\.php.*/, ".json")).then(r => r.json());
    }
    for (const [pkey, value] of Object.entries(params || {})) {
        if (value !== undefined && value !== null) {
            url.searchParams.set(pkey, value);
        }
    }

    // Create outer promise so duplicates can share it immediately
    let resolveOuter, rejectOuter;
    const outerPromise = new Promise((resolve, reject) => {
        resolveOuter = resolve;
        rejectOuter = reject;
    });
    inFlightRequests.set(key, outerPromise);
    outerPromise.finally(() => inFlightRequests.delete(key));

    const task = {
        run: async () => {
            const controller = new AbortController();
            const id = setTimeout(() => controller.abort(), 3000);
            try {
                const response = await fetch(url.toString(), { signal: controller.signal });
                clearTimeout(id);

                if (!response.ok) {
                    let body;
                    try { body = await response.text(); } catch { body = null; }
                    const err = new Error(response.statusText || `HTTP error ${response.status}`);
                    err.status = response.status;
                    err.body = body;
                    throw err;
                }

                const text = await response.text();
                let result;
                try { result = text ? JSON.parse(text) : null; } catch { result = text; }

                setCachedData(endpoint, params, result);
                return result;
            } catch (err) {
                if (err.name === 'AbortError') throw new Error('Request timed out');
                throw err;
            }
        },
        resolve: resolveOuter,
        reject: rejectOuter,
    };

    requestQueue.push(task);
    processQueue();

    return outerPromise;
}