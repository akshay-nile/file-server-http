import type { Home, ItemsInfo, Thumbnail } from './models';
import { getSettings } from './settings';

// An interceptor that inserts X-Verification-Code header from local-storage in each request
async function fetchWithBrowserId(input: RequestInfo | URL, init: RequestInit = {}): Promise<Response | void> {
    const verificationCode = localStorage.getItem('verification-code');
    const headers = new Headers(init.headers || {});
    if (verificationCode) headers.set('X-Verification-Code', verificationCode);
    const response = await fetch(input, { ...init, headers });
    if (verificationCode && response.status === 401) {
        localStorage.removeItem('verification-code');
        window.dispatchEvent(new Event('authentication'));
    }
    return response;
}

let baseURL = import.meta.env.VITE_BASE_URL || window.location.origin;
let retryCount = 2;

async function tryToFetch<T>(path: string): Promise<T> {
    try {
        const response = await fetchWithBrowserId(baseURL + path);
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

export async function authenticate(user_code: string | null = null): Promise<{ status: string }> {
    let params = '';
    if (user_code) params = '?verify=' + encodeURIComponent(user_code);
    return await tryToFetch('/authenticate' + params);
}

export async function getHome(): Promise<Home> {
    return await tryToFetch('/explore?path=/');
}

export async function getItems(path: string, search = ''): Promise<ItemsInfo> {
    let params = 'path=' + encodeURIComponent(path);
    if (search.trim().length > 0) params += '&search=' + encodeURIComponent(search);
    const settings = getSettings();
    params += `&sort_by=${settings.sort_by}&show_hidden=${settings.show_hidden}&reverse=${settings.reverse}`;
    return await tryToFetch('/explore?' + params);
}

export async function getThumbanil(path: string): Promise<Thumbnail> {
    const params = 'path=' + encodeURIComponent(path);
    return await tryToFetch('/thumbnail?' + params);
}

export function getFileURL(path: string, stream: boolean) {
    const token = localStorage.getItem('verification-code');
    const params = 'path=' + encodeURIComponent(path) + '&stream=' + stream + '&token=' + token;
    return baseURL + '/open?' + params;
}