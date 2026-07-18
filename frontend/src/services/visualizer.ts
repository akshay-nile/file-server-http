// Music Visualizer required functions and classes

const FFT_SIZE = 1024;

type AGCConfigs = {
    sampleSize: number,
    gainLimits: [number, number],
    thresholds: [number, number]
};

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

    static getMAV(): number {
        let sum = 0;
        for (let i = 0; i < FilterBand.buffer.length; i++) {
            sum += Math.abs(FilterBand.buffer[i]);
        }
        return sum / FilterBand.buffer.length;
    }

    static getBandValues(max: number = 1, gain: number): number[] {
        const values: number[] = [];
        for (const band of FilterBand.bands) {
            band.analyser.getFloatTimeDomainData(FilterBand.buffer);
            const average = FilterBand.getMAV() * (gain + band.gain);
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