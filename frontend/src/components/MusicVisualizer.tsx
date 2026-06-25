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
        leftAnalyser.fftSize = 32;

        const rightAnalyser = audioNode.context.createAnalyser();
        rightAnalyser.fftSize = 32;

        splitter.connect(leftAnalyser, 0);  // Left channel
        splitter.connect(rightAnalyser, 1); // Right channel

        const leftData = new Uint8Array(leftAnalyser.frequencyBinCount);
        const rightData = new Uint8Array(rightAnalyser.frequencyBinCount);

        let animationId = 0;

        function draw() {
            if (!context || !canvas) return;

            leftAnalyser.getByteFrequencyData(leftData);
            rightAnalyser.getByteFrequencyData(rightData);

            let leftSum = 0, rightSum = 0;
            const lastBin = Math.ceil(leftData.length / 2);

            for (let i = 1; i < lastBin; i++) {
                leftSum += leftData[i];
                rightSum += rightData[i];
            }

            const leftBeat = leftSum / (lastBin - 1);
            const rightBeat = rightSum / (lastBin - 1);

            const center = canvas.width / 2;
            const ledCount = 30;
            const gap = 2;

            const ledWidth = (center - (ledCount - 1) * gap) / ledCount;
            const leftLedsOn = Math.round((leftBeat / 255) * ledCount);
            const rightLedsOn = Math.round((rightBeat / 255) * ledCount);

            context.clearRect(0, 0, canvas.width, canvas.height);

            for (let i = 0; i < ledCount - 1; i++) {
                // Calculating LED Color Gradient
                const ratio = i / (ledCount - 1);

                let r: number;
                let g: number;

                if (ratio < 0.5) {
                    r = Math.round(255 * ratio * 2);
                    g = 255;
                } else {
                    r = 255;
                    g = Math.round(255 * (1 - (ratio - 0.5) * 2));
                }
                const color = `rgb(${r},${g},10)`;

                // Left Channel LED Strip
                const xLeft = center - 5 - (i + 1) * ledWidth - i * gap;

                if (i < leftLedsOn) {
                    context.fillStyle = color;
                    context.fillRect(xLeft, 0, ledWidth, canvas.height);
                } else {
                    context.strokeStyle = color;
                    context.strokeRect(xLeft, 0, ledWidth, canvas.height);
                }

                // Right Channel LED Strip
                const xRight = center + 5 + i * (ledWidth + gap);

                if (i < rightLedsOn) {
                    context.fillStyle = color;
                    context.fillRect(xRight, 0, ledWidth, canvas.height);
                } else {
                    context.strokeStyle = color;
                    context.strokeRect(xRight, 0, ledWidth, canvas.height);
                }
            }

            animationId = requestAnimationFrame(draw);
        }

        draw();
        return () => cancelAnimationFrame(animationId);
    }, [audioNode]);

    return <canvas ref={canvasRef} className="w-full h-[20px]" />;
}

export default MusicVisualizer;