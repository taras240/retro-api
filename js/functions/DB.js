export function openDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open("retrocheevosDB", 1);
        request.onupgradeneeded = e => {
            const db = e.target.result;
            db.createObjectStore("handles");
        };
        request.onsuccess = e => resolve(e.target.result);
        request.onerror = e => reject(e.target.error);
    });
}
export async function saveHandle(handle, name = "log") {
    const db = await openDB();
    const tx = db.transaction("handles", "readwrite");
    tx.objectStore("handles").put(handle, name);
    tx.oncomplete = () => console.log("Handle saved in IndexedDB");
    tx.onerror = e => console.error("Error:", e);
}
export async function loadHandle(name = "log") {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const tx = db.transaction("handles", "readonly");
        const store = tx.objectStore("handles");
        const req = store.get(name);
        req.onsuccess = e => resolve(e.target.result);
        req.onerror = e => reject(e.target.error);
    });
}