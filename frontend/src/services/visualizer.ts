const FFT_SIZE = 1024;

type FilterConfigs = {
    type: BiquadFilterType,
    freq: number,
    Q: number
}

export class AudioBand {

    private level: number = 0;
    private readonly gain: number = 1;
    private readonly filter: BiquadFilterNode;
    private readonly analyser: AnalyserNode;

    private static readonly buffer = new Float32Array(FFT_SIZE);

    constructor(source: AudioNode, configs: FilterConfigs) {
        this.gain = 2.5 + Math.floor(configs.freq / 1000);

        this.filter = source.context.createBiquadFilter();
        this.filter.type = configs.type;
        this.filter.frequency.value = configs.freq;
        this.filter.Q.value = configs.Q;

        this.analyser = source.context.createAnalyser();
        this.analyser.fftSize = FFT_SIZE;

        source.connect(this.filter);
        this.filter.connect(this.analyser);
    }

    getLevel(max: number = 1): number {
        this.analyser.getFloatTimeDomainData(AudioBand.buffer);

        let sum = 0;
        for (let i = 0; i < AudioBand.buffer.length; i++) {
            sum += Math.abs(AudioBand.buffer[i]);
        }
        const average = (sum / AudioBand.buffer.length) * this.gain;

        this.level += (average - this.level) * 0.4;
        return Math.min(max, this.level * max);
    }

    disconnect() {
        this.analyser.disconnect();
        this.filter.disconnect();
    }

}