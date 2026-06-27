import { useEffect, useRef, useState } from 'react';
import { useToastMessage } from '../contexts/ToastMessage/useToastMessage';

type Props = { audioNode: AudioNode };

function MusicVisualizer({ audioNode }: Props) {
    const { showToast } = useToastMessage();
    const fistStartRef = useRef<boolean>(true);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [beatMode, setBeatMode] = useState<boolean>(false);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        canvas.width = canvas.clientWidth;
        canvas.height = canvas.clientHeight;
        const context = canvas.getContext('2d');

        const splitter = audioNode.context.createChannelSplitter(2);

        const leftAnalyser = audioNode.context.createAnalyser();
        leftAnalyser.fftSize = 512;
        leftAnalyser.smoothingTimeConstant = 0;

        const rightAnalyser = audioNode.context.createAnalyser();
        rightAnalyser.fftSize = 512;
        rightAnalyser.smoothingTimeConstant = 0;

        audioNode.connect(audioNode.context.destination);

        if (beatMode) {
            const filter = audioNode.context.createBiquadFilter();
            filter.type = 'lowpass';
            filter.frequency.value = 100;
            filter.Q.value = 2;
            audioNode.connect(filter);
            filter.connect(splitter);
        } else audioNode.connect(splitter);

        splitter.connect(leftAnalyser, 0);
        splitter.connect(rightAnalyser, 1);

        if (!fistStartRef.current) showToast({
            severity: 'info',
            summary: 'Low Pass Filter ' + (beatMode ? 'ON' : 'OFF'),
            detail: 'Visualizer shows ' + (beatMode ? '(bass) beats only.' : 'sound intensity.')
        });
        fistStartRef.current = false;

        const leftData = new Float32Array(leftAnalyser.frequencyBinCount);
        const rightData = new Float32Array(rightAnalyser.frequencyBinCount);

        const length = Math.min(leftData.length, rightData.length);
        const center = canvas.width / 2;

        let smoothLeft = 0;
        let smoothRight = 0;
        const jitter = 0.4;
        const rmsGain = 2;

        const LEDCount = 26;
        const LEDGap = 2;
        const LEDWidth = (center - (LEDCount - 1) * LEDGap) / LEDCount;

        let animationId = 0;

        function getRMSValueOfLEDs(): [number, number] {
            leftAnalyser.getFloatTimeDomainData(leftData);
            rightAnalyser.getFloatTimeDomainData(rightData);

            let leftSum = 0, rightSum = 0;
            for (let i = 0; i < length; i++) {
                leftSum += leftData[i] * leftData[i];
                rightSum += rightData[i] * rightData[i];
            }

            const leftRMS = Math.sqrt(leftSum / leftData.length) * rmsGain;
            const rightRMS = Math.sqrt(rightSum / rightData.length) * rmsGain;

            smoothLeft += (leftRMS - smoothLeft) * jitter;
            smoothRight += (rightRMS - smoothRight) * jitter;

            const leftLEDs = Math.min(LEDCount, Math.round(smoothLeft * LEDCount));
            const rightLEDs = Math.min(LEDCount, Math.round(smoothRight * LEDCount));

            return [leftLEDs, rightLEDs];
        }

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

            const [leftLEDs, rightLEDs] = getRMSValueOfLEDs();
            context.clearRect(0, 0, canvas.width, canvas.height);

            for (let i = 0; i < LEDCount - 1; i++) {
                const color = getLEDColor(i);

                // Left Channel LED Strip
                const xLeft = center - 5 - (i + 1) * LEDWidth - i * LEDGap;

                if (i < leftLEDs) {
                    context.fillStyle = color;
                    context.fillRect(xLeft, 0, LEDWidth, canvas.height);
                } else {
                    context.strokeStyle = 'gray';
                    context.strokeRect(xLeft, 0, LEDWidth, canvas.height);
                }

                // Right Channel LED Strip
                const xRight = center + 5 + i * (LEDWidth + LEDGap);

                if (i < rightLEDs) {
                    context.fillStyle = color;
                    context.fillRect(xRight, 0, LEDWidth, canvas.height);
                } else {
                    context.strokeStyle = 'gray';
                    context.strokeRect(xRight, 0, LEDWidth, canvas.height);
                }
            }

            animationId = requestAnimationFrame(draw);
        }

        draw();
        return () => {
            cancelAnimationFrame(animationId);
            leftAnalyser.disconnect();
            rightAnalyser.disconnect();
            splitter.disconnect();
            audioNode.disconnect();
        };
    }, [audioNode, beatMode, showToast]);

    return <canvas
        ref={canvasRef}
        className="w-full h-[35px]"
        onClick={() => setBeatMode(prev => !prev)} />;
}

export default MusicVisualizer;