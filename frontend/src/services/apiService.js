export const baseURL = import.meta.env.VITE_BASE_URL;

export async function fetchDeviceInfo() {
    try {
        const response = await fetch(baseURL + '/api/items?path=/');
        if (!response.ok) throw new Error(response);
        const result = await response.json();
        return result;
    }
    catch (err) { console.error(err); }
}

export async function fetchItemsInfo(path) {
    try {
        const response = await fetch(baseURL + '/api/items?path=' + path);
        if (!response.ok) throw new Error(response);
        const result = await response.json();
        return result;
    }
    catch (err) { console.error(err); }
}