// Cache for storing request results with timestamps
const requestCache = new Map();
// Map for storing in-flight requests (promises)
const inFlightRequests = new Map();
const CACHE_TTL = 3000; // 3 seconds in milliseconds

function getCacheKey(endpoint, params) {
    // Create a unique key from endpoint and params
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
            // Remove expired cache
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

export async function request(endpoint, params) {
    const key = getCacheKey(endpoint, params);

    // Check cache first
    const cachedData = getCachedData(endpoint, params);
    if (cachedData !== null) {
        return cachedData;
    }

    // Check if this request is already in flight
    if (inFlightRequests.has(key)) {
        return inFlightRequests.get(key);
    }

    const BASE_URL = `https://retroachievements.org/API/`;
    const url = new URL(BASE_URL + endpoint);
    for (const [key, value] of Object.entries(params)) {
        if (value !== undefined && value !== null) {
            url.searchParams.set(key, value);
        }
    }
    const timeout = 3000;
    const fetchOptions = {};

    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);

    // Create the promise and store it in inFlightRequests
    const requestPromise = (async () => {
        try {
            const response = await fetch(url, { signal: controller.signal, ...fetchOptions });
            clearTimeout(id);

            if (!response.ok) {
                // Try to include response body for better error messages
                let body;
                try {
                    body = await response.text();
                } catch (e) {
                    body = null;
                }
                const err = new Error(response.statusText || `HTTP error ${response.status}`);
                err.status = response.status;
                err.body = body;
                throw err;
            }

            // Try to parse JSON, fallback to text if not JSON
            const text = await response.text();
            let result;
            try {
                result = text ? JSON.parse(text) : null;
            } catch (e) {
                result = text;
            }

            // Cache the successful result
            setCachedData(endpoint, params, result);
            return result;
        } catch (err) {
            if (err.name === 'AbortError') {
                throw new Error('Request timed out');
            }
            throw err;
        } finally {
            // Remove from in-flight requests when done
            inFlightRequests.delete(key);
        }
    })();

    // Store the promise so other concurrent requests can use it
    inFlightRequests.set(key, requestPromise);

    return requestPromise;
}