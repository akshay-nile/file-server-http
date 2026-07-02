import { useEffect, useRef } from 'react';
import { AudioBand } from '../services/visualizer';

type Props = { audioNode: AudioNode };

function MusicVisualizer({ audioNode }: Props) {

    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        canvas.width = canvas.clientWidth;
        canvas.height = canvas.clientHeight;

        const context = canvas.getContext('2d');
        if (!context) return;
        context.strokeStyle = 'gray';

        audioNode.connect(audioNode.context.destination);

        const bands: AudioBand[] = [];
        bands.push(new AudioBand(audioNode, { freq: 200, type: 'lowpass', Q: 1 }));
        bands.push(new AudioBand(audioNode, { freq: 1000, type: 'bandpass', Q: 1.5 }));
        bands.push(new AudioBand(audioNode, { freq: 2000, type: 'bandpass', Q: 1.5 }));
        bands.push(new AudioBand(audioNode, { freq: 4000, type: 'bandpass', Q: 1.5 }));
        bands.push(new AudioBand(audioNode, { freq: 8000, type: 'highpass', Q: 2 }));

        const barGap = 20;
        const barWidth = canvas.width / bands.length - barGap;
        const barHeight = canvas.height;

        const LEDCount = 15;
        const LEDGap = 3;
        const LEDHeight = (barHeight - (LEDCount - 1) * LEDGap) / LEDCount;

        let animationId = 0;

        function getLEDColor(i: number): string {
            const ratio = i / (LEDCount - 1);
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

        function draw() {
            if (!context || !canvas) return;

            context.clearRect(0, 0, canvas.width, canvas.height);

            for (let i = 0, g = 0.5; i < bands.length; i++, g += 1.0) {
                const x = g * barGap + i * barWidth;
                const level = bands[i].getLevel(1);
                const litLEDs = Math.round(level * LEDCount);

                for (let j = 0; j < LEDCount; j++) {
                    context.fillStyle = getLEDColor(j);
                    const y = barHeight - (j + 1) * LEDHeight - j * LEDGap;

                    if (j < litLEDs) context.fillRect(x, y, barWidth, LEDHeight);
                    else context.strokeRect(x, y, barWidth, LEDHeight);
                }
            }

            animationId = requestAnimationFrame(draw);
        }

        draw();
        return () => {
            cancelAnimationFrame(animationId);
            for (let i = 0; i < bands.length; i++) bands[i].disconnect();
            audioNode.disconnect();
        };
    }, [audioNode]);

    return (
        <div className="w-full flex flex-col justify-center items-center">
            <canvas ref={canvasRef} className="w-full h-[200px]" />
            <div className="w-full flex justify-around items-center text-[11px] mt-1">
                <span>200 Hz</span>
                <span>1.0 KHz</span>
                <span>2.0 KHz</span>
                <span>4.0 KHz</span>
                <span>8.0 KHz</span>
            </div>
        </div>
    );
}

export default MusicVisualizer;