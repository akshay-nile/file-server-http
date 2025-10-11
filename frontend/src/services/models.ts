export type Platform = 'Windows' | 'Android';

export type DeviceInfo = { hostname: string, platform: Platform };

export type SizeInfo = { total: number, used: number, free: number };

export interface DriveInfo {
    letter: string | null;
    label: string;
    path: string;
    size: SizeInfo;
}

export interface Home {
    device: DeviceInfo;
    drives: Array<DriveInfo>;
}

export interface ItemInfo {
    name: string;
    path: string;
    hidden: boolean;
    date: number;
}

export interface FileInfo extends ItemInfo {
    size: string;
}

export interface FolderInfo extends ItemInfo {
    size: [number, number];
}

export interface Items {
    folders: Array<FolderInfo>;
    files: Array<FileInfo>;
}