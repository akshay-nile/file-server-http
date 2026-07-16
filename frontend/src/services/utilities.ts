import type { Platform, SearchInfo } from './models';

// Detects Phone/Tablet devices with touch input to avoid showing tooltips
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

export let searchInfo: SearchInfo | null = null;
export function setSearchInfo(info: SearchInfo) { searchInfo = info; }
export function clearSearchInfo() { searchInfo = null; }

export const loaderStyle = {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '66vh',
    width: '40%'
};


// Music Visualizer utility functions and classes

export function getRMS(buffer: ArrayLike<number>): number {
    let sum = 0;
    for (let i = 0; i < buffer.length; i++) sum += buffer[i] * buffer[i];
    return Math.sqrt(sum / buffer.length);
}

export function getSmoothCurve(values: number[], canvas: HTMLCanvasElement): number[] {
    if (values.length < 2) return new Array(canvas.width).fill(values[0] ?? 0);

    const result = new Array<number>(canvas.width);
    const segmentWidth = canvas.width / (values.length - 1);

    for (let x = 0; x < canvas.width; x++) {
        const s = Math.min(values.length - 2, Math.floor(x / segmentWidth));

        const t = (x - s * segmentWidth) / segmentWidth;
        const t2 = t * t;
        const t3 = t2 * t;

        const p0 = values[Math.max(0, s - 1)];
        const p1 = values[s];
        const p2 = values[s + 1];
        const p3 = values[Math.min(values.length - 1, s + 2)];

        const y = 0.5 * (
            (2 * p1) +
            (-p0 + p2) * t +
            (2 * p0 - 5 * p1 + 4 * p2 - p3) * t2 +
            (-p0 + 3 * p1 - 3 * p2 + p3) * t3
        );

        result[x] = Math.max(0, Math.min(canvas.height, y));
    }

    return result;
}

export function getLEDColor(ratio: number): string {
    let red: number, green: number;

    if (ratio < 0.5) {
        red = Math.round(255 * ratio * 2);
        green = 255;
    } else {
        red = 255;
        green = Math.round(255 * (1 - (ratio - 0.5) * 2));
    }

    return `rgb(${red}, ${green}, 10)`;
}

type AGCConfigs = { sampleSize: number, gainLimits: [number, number], thresholds: [number, number] };

export class AutomaticGainController {

    private sampleSum: number = 0;
    private sampleCounter: number = 0;
    private readonly sampleSize: number;

    gain: number;
    minGain: number;
    maxGain: number;

    private readonly upperThreshold: number;
    private readonly lowerThreshold: number;

    constructor(configs: AGCConfigs) {
        if (configs.sampleSize < 1) throw new Error('Invalid sample size: ' + configs.sampleSize);
        this.sampleSize = configs.sampleSize;

        this.minGain = Math.min(...configs.gainLimits);
        this.maxGain = Math.max(...configs.gainLimits);
        this.gain = (this.minGain + this.maxGain) / 2;

        this.lowerThreshold = Math.min(...configs.thresholds);
        this.upperThreshold = Math.max(...configs.thresholds);
    }

    addSample(values: number[], peakValue: number, windowSize: number) {
        let sum = 0;
        for (let i = 0; i < values.length; i++) sum += values[i];
        this.sampleSum += 100 * sum / (peakValue * values.length);
        this.sampleCounter++;
        if (this.sampleCounter >= this.sampleSize) {
            const average = this.sampleSum / this.sampleSize;
            if (average > 0) this.adjustGain(average);
            this.sampleSum = 0;
            this.sampleCounter = 0;
        }

        // Reduce the gain if there's any overshoot detected
        if (this.gain <= this.minGain) return;
        let overshootCount = 0;
        for (let i = 0; i < values.length - windowSize; i++) {
            let overshotingBars = 0;
            for (let j = 0; j < windowSize; j++) if (values[i + j] >= peakValue) overshotingBars++;
            if (overshotingBars === windowSize) overshootCount++;
        }
        if (overshootCount > 0) {
            const overshootRatio = 1 - overshootCount / values.length / windowSize;
            this.gain = Math.max(this.minGain, this.gain * overshootRatio);
        }
    }

    private adjustGain(average: number) {
        if (average > this.upperThreshold && this.gain > this.minGain) {
            this.gain -= (average - this.upperThreshold) / 50;  // fast decay
            this.gain = Math.max(this.minGain, this.gain);
        } else if (average < this.lowerThreshold && this.gain < this.maxGain) {
            this.gain += (this.lowerThreshold - average) / 200; // slow attack
            this.gain = Math.min(this.maxGain, this.gain);
        }
    }

}

const FFT_SIZE = 1024;

export class FilterBand {

    private level: number = 0;
    private readonly gain: number;
    private readonly analyser: AnalyserNode;
    private readonly lowPassFilter: BiquadFilterNode;
    private readonly highPassFilter: BiquadFilterNode;

    static readonly bands: FilterBand[] = [];
    private static readonly buffer = new Float32Array(FFT_SIZE);

    private constructor(source: AudioNode, band: [number, number]) {
        const upperCutOffFrequency = Math.max(...band);
        const lowerCutOffFrequency = Math.min(...band);

        this.gain = (upperCutOffFrequency + lowerCutOffFrequency) / (Math.E * 1000);

        this.highPassFilter = source.context.createBiquadFilter();
        this.highPassFilter.type = 'highpass';
        this.highPassFilter.frequency.value = lowerCutOffFrequency;
        this.highPassFilter.Q.value = 1;

        this.lowPassFilter = source.context.createBiquadFilter();
        this.lowPassFilter.type = 'lowpass';
        this.lowPassFilter.frequency.value = upperCutOffFrequency;
        this.lowPassFilter.Q.value = 1;

        this.analyser = source.context.createAnalyser();
        this.analyser.fftSize = FFT_SIZE;
        this.analyser.smoothingTimeConstant = 0;

        source.connect(this.highPassFilter);
        this.highPassFilter.connect(this.lowPassFilter);
        this.lowPassFilter.connect(this.analyser);
    }

    static createFilterBand(source: AudioNode, band: [number, number]) {
        FilterBand.bands.push(new FilterBand(source, band));
    }

    static getBandValues(max: number = 1, gain: number): number[] {
        const values: number[] = [];
        for (const band of FilterBand.bands) {
            band.analyser.getFloatTimeDomainData(FilterBand.buffer);
            const average = getRMS(FilterBand.buffer) * (gain + band.gain);
            band.level += (average - band.level) * 0.4;
            values.push(Math.min(max, band.level * max));
        }
        return values;
    }

    static disconnectAllBands() {
        for (const band of FilterBand.bands) {
            band.analyser.disconnect();
            band.lowPassFilter.disconnect();
            band.highPassFilter.disconnect();
        }
        FilterBand.bands.length = 0;
    }

}

// Multi-layer thumbnail caching (In-Memory -> IndexedDB -> Server)

const thumbnailsMap: Map<string, string> = new Map<string, string>();

const thumbnailsDB = await new Promise<IDBDatabase>((resolve, reject) => {
    const openRequest = indexedDB.open('ThumbnailsDB', 1);
    openRequest.onupgradeneeded = () => {
        if (!openRequest.result.objectStoreNames.contains('thumbnails')) {
            openRequest.result.createObjectStore('thumbnails', { keyPath: 'url' });
        }
    };
    openRequest.onsuccess = () => resolve(openRequest.result);
    openRequest.onerror = () => reject(openRequest.error);
});

async function getThumbnailBlobFromDB(url: string): Promise<Blob> {
    const store = thumbnailsDB.transaction('thumbnails', 'readonly').objectStore('thumbnails');
    return await new Promise((resolve, reject) => {
        const getRequest = store.get(url);
        getRequest.onsuccess = () => resolve(getRequest.result ? getRequest.result.blob : null);
        getRequest.onerror = () => reject(null);
    });
}

async function putThumbnailBlobIntoDB(url: string, blob: Blob) {
    const store = thumbnailsDB.transaction('thumbnails', 'readwrite').objectStore('thumbnails');
    return await new Promise((resolve, reject) => {
        const putRequest = store.put({ url, blob });
        putRequest.onsuccess = () => resolve(putRequest.result);
        putRequest.onerror = () => reject(null);
    });
}

export async function getCachedThumbnail(url: string): Promise<string> {
    // Try to get from In-Memory Map (Caching Layer 1)
    let blobUrl = thumbnailsMap.get(url);
    if (blobUrl) return blobUrl;

    // Try to get from Indexed-DB (Caching Layer 2)
    let blob = await getThumbnailBlobFromDB(url);

    // Try to fetch from the Server (Caching Layer 3)
    if (blob === null) {
        const response = await fetch(url);
        if (!response.ok) return url; // When server fetch fails
        blob = await response.blob();
        await putThumbnailBlobIntoDB(url, blob);  // Store in Indexed-DB
    }

    // Create blobUrl, put in Map, and then return it
    blobUrl = URL.createObjectURL(blob);
    thumbnailsMap.set(url, blobUrl);
    return blobUrl;
}