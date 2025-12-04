import type { Toast } from 'primereact/toast';
import type { Platform } from './models';

// Detects Phone/Tablet devices with touch input to avoid tooltip
const isTouchDevice = window && ('ontouchstart' in window || navigator.maxTouchPoints > 0);

// Supported image, audio and video file extentions for thumbnail generation
const supportedImageExtentions = new Set(['jpg', 'jpeg', 'png', 'ico', 'bmp', 'gif', 'webp']);
const supportedAudioExtentions = new Set(['mp3', 'flac', 'wav']);
const supportedVideoExtentions = new Set(['mp4', 'mkv', 'avi', 'mov', 'webm', '3gp']);

export function formatDate(timestamp: number): string {
    const date = new Date(timestamp);

    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();

    const hours24 = date.getHours();
    const minutes = String(date.getMinutes()).padStart(2, '0');

    const ampm = hours24 >= 12 ? 'PM' : 'AM';
    const hours12 = String(hours24 % 12 || 12).padStart(2, '0');

    return `${day}-${month}-${year} ${hours12}:${minutes} ${ampm}`;
}

export function formatSize(bytes: number): string {
    if (bytes > 1024 * 1024 * 1024) return (bytes / 1024 / 1024 / 1024).toFixed(2) + ' GB';
    if (bytes > 1024 * 1024) return (bytes / 1024 / 1024).toFixed(1) + ' MB';
    if (bytes > 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return bytes + ' B';
}

export function getTooltip(label: string): string | undefined {
    return !isTouchDevice ? label : undefined;
}

export function canGenerateThumbnail(filename: string, platform: Platform): boolean {
    if (!filename.includes('.')) return false;
    const extention = filename.split('.').at(-1) as string;
    if (supportedImageExtentions.has(extention.toLowerCase())) return true;
    if (supportedAudioExtentions.has(extention.toLowerCase())) return true;
    if (supportedVideoExtentions.has(extention.toLowerCase()) && platform === 'Windows') return true;
    return false;
}

export let toast: Toast;
export const setToast = (toastRef: Toast) => toast = toastRef;

// Catch the server-offline png image and store in memory
export let serverOfflineImgUrl = '/public/icons/server-offline.png';
fetch(serverOfflineImgUrl)
    .then(response => response.blob()
        .then(blob => serverOfflineImgUrl = URL.createObjectURL(blob)));
