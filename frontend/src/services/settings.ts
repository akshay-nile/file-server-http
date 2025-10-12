import type { Settings } from './models';

const SETTINGS_KEY = 'file-server-settings';

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
