import type { HomeInfo, ItemsInfo, Thumbnail } from './models';
import { getSettings, getShortcuts } from './settings';

// An interceptor that inserts X-Verification-Code header from local-storage in each request
async function fetchWithBrowserId(input: RequestInfo | URL, init: RequestInit = {}): Promise<Response | void> {
    const token = localStorage.getItem('token');
    const headers = new Headers(init.headers || {});
    if (token) headers.set('X-Token', token);
    const response = await fetch(input, { ...init, headers });
    if (token && response.status === 401) {
        localStorage.removeItem('token');
        window.dispatchEvent(new Event('authentication'));
    }
    return response;
}

let baseURL = import.meta.env.VITE_BASE_URL || window.location.origin;
let retryCount = 2;

async function tryToFetch<T>(path: string, options: RequestInit = { method: 'GET' }): Promise<T> {
    try {
        const response = await fetchWithBrowserId(baseURL + path, options);
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

export async function authenticate(token: string | null = null): Promise<{ status: string }> {
    const params = token ? '?verify=' + encodeURIComponent(token) : '';
    return await tryToFetch('/authenticate' + params);
}

export async function getHome(): Promise<HomeInfo> {
    const settings = getSettings();
    const params = `path=/&show_hidden=${settings.show_hidden}`;
    return await tryToFetch('/explore?' + params, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(getShortcuts())
    });
}

export async function getItems(path: string, search: string | null | undefined): Promise<ItemsInfo> {
    let params = 'path=' + encodeURIComponent(path);
    if (search) params += '&search=' + encodeURIComponent(search);
    const settings = getSettings();
    params += `&sort_by=${settings.sort_by}&show_hidden=${settings.show_hidden}&reverse=${settings.reverse}`;
    return await tryToFetch('/explore?' + params);
}

export async function getThumbanil(path: string): Promise<Thumbnail> {
    const params = 'path=' + encodeURIComponent(path);
    return await tryToFetch('/thumbnail?' + params);
}

export function getFileURL(path: string, stream: boolean) {
    const token = localStorage.getItem('token');
    const params = 'path=' + encodeURIComponent(path) + '&stream=' + stream + '&token=' + token;
    return baseURL + '/open?' + params;
}

export async function uploadFile(file: File): Promise<{ status: 'uploaded' | 'failed' }> {
    const token = localStorage.getItem('token') as string;
    const body = new FormData();
    body.append('file', file);
    const response = await fetch(baseURL + '/upload', { method: 'POST', headers: { 'X-Token': token }, body: body });
    return await response.json();
}