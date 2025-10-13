import type { Home, Items, Thumbnail } from './models';
import { getSettings } from './settings';

let baseURL = window.location.href;
let retryCount = 2;

if (import.meta.env.VITE_BASE_URL) baseURL = import.meta.env.VITE_BASE_URL;
else if (baseURL.includes('/?path=')) baseURL = baseURL.split('/?path=')[0];

async function tryToFetch<T>(path: string): Promise<T> {
    try {
        const response = await fetch(baseURL + path);
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

export async function getItems(path: string, search = ''): Promise<Items> {
    let params = 'path=' + encodeURIComponent(path);
    if (search.trim().length > 0) params += '&search=' + encodeURIComponent(search);
    const settings = getSettings();
    params += `&sort_by=${settings.sort_by}&show_hidden=${settings.show_hidden}&reverse=${settings.reverse}`;
    return await tryToFetch('/explore?' + params);
}

export async function getThumbanils(path: string): Promise<Thumbnail[]> {
    const params = 'path=' + encodeURIComponent(path) + '&cached=true';
    return await tryToFetch('/thumbnails?' + params);
}

export async function getThumbanil(path: string): Promise<Thumbnail> {
    const params = 'path=' + encodeURIComponent(path);
    return await tryToFetch('/thumbnails?' + params);
}