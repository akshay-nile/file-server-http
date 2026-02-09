import type { HomeInfo, ItemsInfo, Thumbnail } from './models';
import { getSettings, getShortcuts } from './settings';

// An interceptor that inserts X-Verification-Code header from local-storage in each request
async function fetchWithBrowserId(input: RequestInfo | URL, init: RequestInit = {}): Promise<Response | void> {
    const token = localStorage.getItem('token');
    const headers = new Headers(init.headers || {});
    if (token) headers.set('X-Token', token);
    try {
        const response = await fetch(input, { ...init, headers });
        if (token && response.status === 401) {
            localStorage.removeItem('token');
            window.dispatchEvent(new Event('authentication'));
        }
        return response;
    } catch (error) {
        if (error instanceof TypeError) window.dispatchEvent(new Event('serveroffline'));
    }
}

async function tryToFetch<T>(path: string, options: RequestInit = { method: 'GET' }): Promise<T> {
    try {
        const response = await fetchWithBrowserId(path, options);
        return await (response as Response).json();
    } catch (error) { console.error(error); }
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

export async function getItems(path: string, search: string | null = null): Promise<ItemsInfo> {
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
    return '/open?' + params;
}

export async function uploadFile(file: File): Promise<{ status: 'uploaded' | 'failed' }> {
    const body = new FormData();
    body.append('file', file);
    return await tryToFetch('/upload', { method: 'POST', body: body });
}

export async function modifyItems(action: 'delete' | 'rename', items: Array<string>): Promise<{ count: number }> {
    return await tryToFetch('/modify/' + action, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(items)
    });
}

export async function getTotalSize(folders: string[]): Promise<{ totalSize: number }> {
    return await tryToFetch('/total', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(folders)
    });
}