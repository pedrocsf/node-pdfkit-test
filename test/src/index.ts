import PDFDocumentClass = require('pdfkit');
type PDFDocument = InstanceType<typeof PDFDocumentClass>;
process.on('unhandledRejection', (reason, promise) => {
  console.error('FATAL: Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

import * as fs from 'fs';
import path from 'path';
import { ChartJSNodeCanvas } from 'chartjs-node-canvas';
import SVGtoPDFKit = require('svg-to-pdfkit');
import { ChartConfiguration } from 'chart.js';

const outputDir = path.join(__dirname, 'output');
const outputPath = path.join(outputDir, 'exemplo-pdfkit.pdf');

async function setupDirectory() {
  await fs.promises.mkdir(outputDir, { recursive: true });
}

function addPageNumbers(doc: PDFDocument) {
  const pageCount = doc.bufferedPageRange().count;
  for (let i = 0; i < pageCount; i++) {
    doc.switchToPage(i);

    const oldBottomMargin = doc.page.margins.bottom;
    doc.page.margins.bottom = 0;

    doc.fontSize(10).text(
      `Página ${i + 1} de ${pageCount}`,
      0,
      doc.page.height - (oldBottomMargin / 2) - 5, 
      {
        width: doc.page.width,
        align: 'center',
      }
    );

    doc.page.margins.bottom = oldBottomMargin; 
  }
}

function getPdfAsBuffer(doc: PDFDocument): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const buffers: Buffer[] = [];
    doc.on('data', (chunk) => buffers.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(buffers)));
    doc.on('error', (err) => reject(err));
  });
}

async function addAreaChartToPdf(doc: PDFDocument) {
  const chartWidth_chartjs = 450;
  const chartHeight_chartjs = 250;

  const chartJSNodeCanvasSVG = new ChartJSNodeCanvas({
    width: chartWidth_chartjs,
    height: chartHeight_chartjs,
    type: 'svg'
  });

  const areaConfiguration: ChartConfiguration<'line'> = {
    type: 'line',
    data: {
      labels: ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho'],
      datasets: [
        {
          label: 'Receita',
          data: [120, 190, 300, 500, 200, 350],
          fill: true,
          backgroundColor: 'rgba(75, 192, 192, 0.2)',
          borderColor: 'rgb(75, 192, 192)',
          tension: 0.1
        },
        {
          label: 'Despesa',
          data: [50, 90, 120, 200, 150, 180],
          fill: true,
          backgroundColor: 'rgba(255, 99, 132, 0.2)',
          borderColor: 'rgb(255, 99, 132)',
          tension: 0.1
        }
      ],
    },
    options: {
      scales: {
        y: {
          beginAtZero: true
        }
      }
    }
  };

  try {
    const areaSvgBuffer = await chartJSNodeCanvasSVG.renderToBuffer(areaConfiguration);
    const svgX = (doc.page.width - chartWidth_chartjs) / 2;
    const svgY = doc.y;
    SVGtoPDFKit(doc, areaSvgBuffer.toString(), svgX, svgY);
    doc.y = svgY + chartHeight_chartjs;
    doc.moveDown(2);
  } catch (error) {
    console.error('Erro ao renderizar o gráfico de Área:', error);
  }
}

async function generatePdf() {
  console.log('Iniciando a geração do PDF...');
  const doc = new PDFDocumentClass({
    size: 'A4',
    margin: 50,
    bufferPages: true
  });

  const pdfBufferPromise = getPdfAsBuffer(doc);

  try {
    console.log('Adicionando conteúdo da primeira página...');

    // Formas básicas (retângulos e linha)
    const shapeY = doc.y;
    doc.rect(50, shapeY, 120, 50).fill('#DDEEFF');
    doc.rect(200, shapeY, 120, 50).stroke('#000000');
    doc.moveTo(350, shapeY).lineTo(500, shapeY + 50).lineWidth(2).stroke('red');

    doc.moveDown(6);

    // Círculos e elipse
    const circleY = doc.y + 20;
    doc.circle(100, circleY, 30).fill('#FFD699');
    doc.circle(220, circleY, 30).stroke('blue');
    doc.ellipse(360, circleY, 50, 25).fillAndStroke('#CCFFCC', 'green');

    doc.moveDown(6);

    // Estrutura de tabela (somente grade)
    const tableTop = doc.y;
    const rowHeight = 25;
    const totalRows = 4;

    doc.rect(50, tableTop, 500, rowHeight).fill('#EAEAEA');

    for (let i = 1; i <= totalRows; i++) {
      doc.rect(50, tableTop + (i * rowHeight), 500, rowHeight).stroke('#CCCCCC');
    }

    doc.moveDown(8);

    const imagePath = path.join(__dirname, 'assets', 'image.jpg');

    // Insercao de imagem (se existir no caminho)
    if (fs.existsSync(imagePath)) {
      doc.image(imagePath, {
        fit: [250, 200],
        align: 'center'
      });
    }

    doc.moveDown(6);

    doc.addPage();

    console.log('Adicionando conteúdo da segunda página (gráficos)...');

    // Gráfico de barras (eixos e barras)

    const barChartY = doc.y + 20;
    const barChartX = 50;
    const chartWidth = 400;
    const chartHeight = 150;
    const barWidth = 40;
    const barSpacing = 20;

    const dataPoints = [
      { label: 'Jan', value: 80 },
      { label: 'Fev', value: 120 },
      { label: 'Mar', value: 60 },
      { label: 'Abr', value: 150 },
    ];

    doc.moveTo(barChartX, barChartY).lineTo(barChartX, barChartY + chartHeight).stroke('black');
    doc.moveTo(barChartX, barChartY + chartHeight).lineTo(barChartX + chartWidth, barChartY + chartHeight).stroke('black');

    dataPoints.forEach((point, index) => {
      const xPos = barChartX + (index * (barWidth + barSpacing)) + barSpacing;
      const barHeight = (point.value / 150) * chartHeight;
      const yPos = barChartY + chartHeight - barHeight;

      doc.rect(xPos, yPos, barWidth, barHeight).fill('#4CAF50');
    });

    doc.moveDown(10);

    // Radar via Chart.js
    const chartWidth_chartjs_radar = 450;
    const chartHeight_chartjs_radar = 400;
    const chartJSNodeCanvasRadar = new ChartJSNodeCanvas({ width: chartWidth_chartjs_radar, height: chartHeight_chartjs_radar });

    const radarConfiguration: ChartConfiguration = {
      type: 'radar',
      data: {
        labels: ['', '', '', '', ''],
        datasets: [
          {
            label: '',
            data: [85, 70, 90, 65, 75],
            fill: true,
            backgroundColor: 'rgba(255, 99, 132, 0.2)',
            borderColor: 'rgb(255, 99, 132)',
          },
          {
            label: '',
            data: [60, 88, 75, 95, 82],
            fill: true,
            backgroundColor: 'rgba(54, 162, 235, 0.2)',
            borderColor: 'rgb(54, 162, 235)',
          },
        ],
      },
      options: {
        plugins: {
          legend: {
            display: false
          }
        }
      }
    };

    try {
      const radarPngBuffer = await chartJSNodeCanvasRadar.renderToBuffer(radarConfiguration);

      doc.image(radarPngBuffer, {
        fit: [chartWidth_chartjs_radar, chartHeight_chartjs_radar],
        align: 'center'
      });

      doc.moveDown(2);
    } catch (error) {
      console.error('Erro ao renderizar o gráfico Radar:', error);
    }

    // SVG externo renderizado com svg-to-pdfkit
    const svgPath = path.join(__dirname, 'assets', 'svg.svg');

    if (fs.existsSync(svgPath)) {
      const svgContent = fs.readFileSync(svgPath, 'utf-8');
      const svgWidth = 400;
      const svgX = (doc.page.width - svgWidth) / 2;
      SVGtoPDFKit(doc, svgContent, svgX, doc.y, { width: svgWidth });
    }

    console.log('Todo o conteúdo foi adicionado.');

    console.log('Finalizando o documento PDF (doc.end())...');
    doc.end();

    console.log('Aguardando a finalização do buffer do PDF...');
    const pdfData = await pdfBufferPromise;
    console.log(`Buffer do PDF criado com sucesso. Tamanho: ${pdfData.length} bytes.`);

    console.log(`Escrevendo o arquivo em: ${outputPath}...`);
    await fs.promises.writeFile(outputPath, pdfData);
    console.log('Arquivo PDF escrito no disco com sucesso.');

  } catch (err) {
    console.error('Ocorreu um erro CRÍTICO durante a geração do PDF:', err);
    throw err;
  }
}

async function main() {
  await setupDirectory();
  await generatePdf();
  console.log(`\nPDF gerado com sucesso em: ${outputPath}`);
}

main().catch((err) => {
  console.error('\nOcorreu um erro fatal na execução do script:', err);
  process.exit(1);
});