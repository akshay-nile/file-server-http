import type { ItemInfo, ItemsInfo, MusicPlayerData, Settings } from './models';

const MUSIC_KEY = 'music-player';
const SETTINGS_KEY = 'settings';
const SHORTCUTS_KEY = 'shortcuts';

export const defaultSettings: Settings = {
    sort_by: 'name',
    show_hidden: false,
    reverse: false
};

export function getSettings(): Settings {
    if (SETTINGS_KEY in localStorage) {
        return JSON.parse(localStorage.getItem(SETTINGS_KEY) as string);
    }
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(defaultSettings));
    return defaultSettings;
}

export function setSettings(settings: Settings) {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}

export function isChanged(userSettings: Settings, currSettings = getSettings()) {
    if (userSettings.sort_by !== currSettings.sort_by) return true;
    if (userSettings.reverse !== currSettings.reverse) return true;
    if (userSettings.show_hidden !== currSettings.show_hidden) return true;
    return false;
}

export function getShortcuts(): ItemsInfo | null {
    return JSON.parse(localStorage.getItem(SHORTCUTS_KEY) ?? 'null');
}

export function setShortcuts(shortcuts: ItemsInfo) {
    const isEmpty = shortcuts.folders.length === 0 && shortcuts.files.length === 0;
    localStorage.setItem(SHORTCUTS_KEY, JSON.stringify(isEmpty ? null : shortcuts));
}

export function shortcutsExists(item: ItemInfo): boolean {
    const shortcuts = getShortcuts();
    if (shortcuts === null) return false;
    if (shortcuts.folders.find(folder => folder.path === item.path)) return true;
    if (shortcuts.files.find(file => file.path === item.path)) return true;
    return false;
}

export function getMusicPlayerData(): MusicPlayerData | null {
    if (MUSIC_KEY in localStorage) {
        return JSON.parse(localStorage.getItem(MUSIC_KEY) as string);
    }
    return null;
}

export function setMusicPlayerData(data: MusicPlayerData) {
    localStorage.setItem(MUSIC_KEY, JSON.stringify(data));
}