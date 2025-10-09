export type Platform = 'Windows' | 'Android';

export type DeviceInfo = { hostname: string, platform: Platform };

export type SizeInfo = { total: number, used: number, free: number };

export interface Drive {
    letter: string;
    label: string;
    path: string;
    size: SizeInfo;
}

export interface Home {
    device: DeviceInfo;
    drives: Array<Drive>;
}

export interface Item {
    name: string;
    path: string;
    hidden: boolean;
    date: number;
}

export interface File extends Item {
    size: string;
}

export interface Folder extends Item {
    size: [number, number];
}

export interface Items {
    folders: Array<Folder>;
    files: Array<File>;
}