
// Detects Phone/Tablet devices with touch input to avoid tooltip
const isTouchDevice = window && ('ontouchstart' in window || navigator.maxTouchPoints > 0);

// Supported file extentions for thumbnail generation
const supportedExtentions = new Set([
    'jpg', 'jpeg', 'png', 'ico', 'bmp', 'gif', 'webp',  // Supported image exentions
    'mp3', 'flac', 'wav'    // Supported audio extentions
]);

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

export function canGenerateThumbnail(filename: string): boolean {
    if (!filename.includes('.')) return false;
    const extention = filename.split('.').at(-1) as string;
    return supportedExtentions.has(extention.toLowerCase());
}

