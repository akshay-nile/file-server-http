import { useEffect, useRef } from 'react';

type Props = { audioNode: AudioNode };

function MusicVisualizer({ audioNode }: Props) {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        canvas.width = canvas.clientWidth;
        canvas.height = canvas.clientHeight;
        const context = canvas.getContext('2d');

        const splitter = audioNode.context.createChannelSplitter(2);
        audioNode.connect(splitter);
        audioNode.connect(audioNode.context.destination);

        const leftAnalyser = audioNode.context.createAnalyser();
        leftAnalyser.fftSize = 512;
        leftAnalyser.smoothingTimeConstant = 0;

        const rightAnalyser = audioNode.context.createAnalyser();
        rightAnalyser.fftSize = 512;
        rightAnalyser.smoothingTimeConstant = 0;

        splitter.connect(leftAnalyser, 0);
        splitter.connect(rightAnalyser, 1);

        const leftData = new Float32Array(leftAnalyser.frequencyBinCount);
        const rightData = new Float32Array(rightAnalyser.frequencyBinCount);

        const length = Math.min(leftData.length, rightData.length);
        const center = canvas.width / 2;

        let smoothLeft = 0;
        let smoothRight = 0;
        const jitter = 0.5;
        const rmsGain = 2.0;

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
            audioNode.disconnect();
        };
    }, [audioNode]);

    return <canvas ref={canvasRef} className="w-full h-[35px]" />;
}

export default MusicVisualizer;