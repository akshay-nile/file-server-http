import type { HomeInfo, ItemsInfo, Thumbnail } from './models';
import { getSettings, getShortcuts } from './settings';

async function tryToFetch<T>(path: string, options: RequestInit = { method: 'GET' }): Promise<T> {
    try {
        const response = await fetch(path, options);
        if (response.status >= 400) {
            if (response.status === 401) window.dispatchEvent(new Event('authentication'));
            else window.dispatchEvent(new CustomEvent('error', { detail: await response.json() }));
            return {} as T;
        }
        window.dispatchEvent(new CustomEvent('error', { detail: null }));
        return await (response as Response).json();
    } catch {
        window.dispatchEvent(new CustomEvent('error', {
            detail: {
                code: 500, status: 'Server Error',
                message: 'Server went offline or encountered an error'
            }
        }));
        return {} as T;
    }
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

export function getFileURL(path: string, stream: boolean) {
    const params = 'path=' + encodeURIComponent(path) + '&stream=' + stream;
    return '/open?' + params;
}