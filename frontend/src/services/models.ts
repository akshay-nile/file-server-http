export type Platform = 'Windows' | 'Android' | undefined;

export type DeviceInfo = { hostname: string, platform: Platform };

export type SizeInfo = { total: number, used: number, free: number };

export type ClipboardInfo = { type: string, content: string | ItemsInfo | null };

export interface DriveInfo {
    letter: string | null;
    label: string;
    path: string;
    size: SizeInfo;
}

export interface HomeInfo {
    device: DeviceInfo;
    drives: Array<DriveInfo>;
    shortcuts: ItemsInfo | null;
    clipboard: ClipboardInfo;
}

export interface ItemInfo {
    name: string;
    path: string;
    hidden: boolean;
    size: number;
    date: number;
    filtered?: boolean;
}

export interface FileInfo extends ItemInfo {
    thumbnail: string | null;
    mimetype: string;
}

export interface FolderInfo extends ItemInfo {
    count: [number, number];
}

export interface ItemsInfo {
    folders: Array<FolderInfo>;
    files: Array<FileInfo>;
}

export interface Settings {
    sort_by: 'name' | 'type' | 'size' | 'date';
    show_hidden: boolean;
    reverse: boolean;
}

export interface Thumbnail {
    filepath: string;
    thumbnail: string | null;
}

export interface SelectedItemsState {
    selectedFiles: FileInfo[];
    toggleFileSelection: (file: FileInfo) => void;

    selectedFolders: FolderInfo[];
    toggleFolderSelection: (folder: FolderInfo) => void;

    isItemSelected: (item: ItemInfo) => boolean;
    isAnyItemSelected: () => boolean;

    clearSelection: () => void;
}

export interface ExplorerItemsState {
    loading: boolean;
    path: string;

    home: HomeInfo;
    setHome: (home: HomeInfo) => void;

    items: ItemsInfo;
    setItems: (items: ItemsInfo) => void;

    explore: (path: string, pushHistory?: boolean, search?: string) => Promise<void>;
}