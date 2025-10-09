import type { Home, Items } from './models';

let baseURL = import.meta.env.VITE_BASE_URL as string;
let retryCount = 2;

async function tryToFetch<T>(path: string): Promise<T> {
    try {
        const response = await fetch(baseURL + '/' + path);
        return await (response as Response).json();
    } catch (error) {
        console.error(error);
        if (import.meta.env.VITE_WIFI_URL && retryCount-- > 0) {
            baseURL = import.meta.env.VITE_WIFI_URL as string;
            return await tryToFetch(path);
        }
    }
    return [] as T;
}

export async function getHome(): Promise<Home> {
    return await tryToFetch('/explore?path=/');
}

export async function getItems(path: string): Promise<Items> {
    return await tryToFetch('/explore?path=' + encodeURIComponent(path));
}