// Como não existe um pacote @types/chartjs-node-canvas oficial,
// criamos nossa própria definição de módulo para que o TypeScript
// entenda a biblioteca e ofereça autocompletar e verificação de tipos.

import { ChartConfiguration } from 'chart.js';

declare module 'chartjs-node-canvas' {
    export interface ChartJSNodeCanvasOptions {
        width: number;
        height: number;
        backgroundColour?: string;
        type?: 'svg' | 'png' | 'jpeg';
        chartCallback?: (ChartJS: any) => void;
        plugins?: any;
    }

    export class ChartJSNodeCanvas {
        constructor(options: ChartJSNodeCanvasOptions);

        renderToBuffer(
            configuration: ChartConfiguration,
            mimeType?: 'image/png' | 'image/jpeg'
        ): Promise<Buffer>;

        renderToDataURL(
            configuration: ChartConfiguration,
            mimeType?: 'image/png' | 'image/jpeg'
        ): Promise<string>;
    }
}