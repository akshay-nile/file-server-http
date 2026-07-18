import { useEffect, useRef, useState } from 'react';
import { AutomaticGainController, FilterBand, getLEDColor, getSmoothCurve } from '../services/visualizer';

type Props = { source: AudioNode };

function MusicVisualizer({ source }: Props) {

    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [drawSmoothCurveVisualizer, setDrawSmoothCurveVisualizer] = useState(false);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        canvas.width = canvas.clientWidth;
        canvas.height = canvas.clientHeight;

        const context = canvas.getContext('2d');
        if (!context) return;

        let lowerCutOffFreq = 40, upperCutOffFreq = 80; // First band Fc = 60 Hz
        let bandWidth = upperCutOffFreq - lowerCutOffFreq;
        while (lowerCutOffFreq < 10000) {               // Last band Fc = 10.4 KHz
            FilterBand.createFilterBand(source, [lowerCutOffFreq, upperCutOffFreq]);
            bandWidth *= 1.1;       // Bandwidth increases by 10 % for every next band
            lowerCutOffFreq = upperCutOffFreq;
            upperCutOffFreq += Math.round(bandWidth);
        }

        const agc = new AutomaticGainController({
            sampleSize: 15,         // Average 15 samples before adjusting the gain
            gainLimits: [1, 5],     // Gain can vary from 1 to 5 times the original level
            thresholds: [30, 60]    // Min and Max threshold of the total lit LED percentage
        });

        const LEDCount = 20;        // LEDs per bar strip
        const LEDGap = 3;           // LED horizontal and vertical spacing 
        const LEDSize = canvas.width / FilterBand.bands.length - LEDGap;   // LED square size

        canvas.height = (LEDSize + LEDGap) * LEDCount;  // To keep LEDs exactly square shaped

        if (drawSmoothCurveVisualizer) {
            const gradient = context.createLinearGradient(0, canvas.height, 0, 0);
            gradient.addColorStop(0.0, '#00FF00');
            gradient.addColorStop(0.4, '#FFFF00');
            gradient.addColorStop(1.0, '#FF0000');
            context.strokeStyle = gradient;
        } else context.strokeStyle = '#3A3A3A';

        let animationId = 0;

        const draw = drawSmoothCurveVisualizer
            ? () => {               // For drawing Smooth Curve Visualizer 
                if (!context || !canvas) return;

                const values = FilterBand.getBandValues(canvas.height, agc.gain);
                const curve = getSmoothCurve(values, canvas);

                context.clearRect(0, 0, canvas.width, canvas.height);
                context.beginPath();
                for (let x = 0; x < curve.length; x++) {
                    context.moveTo(x, canvas.height);
                    context.lineTo(x, canvas.height - curve[x]);
                }
                context.stroke();

                agc.addSample(values, canvas.height, 3);
                animationId = requestAnimationFrame(draw);
            }
            : () => {               // For drawing LED Dot-Matrix Visualizer
                if (!context || !canvas) return;

                const values = FilterBand.getBandValues(LEDCount, agc.gain);
                context.clearRect(0, 0, canvas.width, canvas.height);

                for (let i = 0, g = 0.5; i < values.length; i++, g += 1.0) {
                    const value = Math.round(values[i]);
                    const x = g * LEDGap + i * LEDSize;

                    for (let j = 0; j < LEDCount; j++) {
                        const LEDIndex = j + 1;
                        const y = canvas.height - LEDIndex * LEDSize - j * LEDGap;

                        context.fillStyle = getLEDColor(LEDIndex / LEDCount);

                        if (j < value) context.fillRect(x, y, LEDSize, LEDSize);  // LED On
                        else context.strokeRect(x, y, LEDSize, LEDSize);    // LED Off
                    }
                }

                agc.addSample(values, LEDCount, 3);
                animationId = requestAnimationFrame(draw);
            };

        draw();
        return () => {
            cancelAnimationFrame(animationId);
            FilterBand.disconnectAllBands();
        };
    }, [source, drawSmoothCurveVisualizer]);

    return <canvas
        ref={canvasRef}
        className={`w-full ${drawSmoothCurveVisualizer && 'border border-neutral-700'}`}
        onClick={() => setDrawSmoothCurveVisualizer(prev => !prev)} />;
}

export default MusicVisualizer;