import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';
import { ChartJSNodeCanvas } from 'chartjs-node-canvas';
import { ChartConfiguration } from 'chart.js';

const outputDir = path.join(__dirname, 'output');
const outputPath = path.join(outputDir, 'exemplo-pdfkit.pdf');

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

async function generatePdf() {
  const doc = new PDFDocument({
    size: 'A4',
    margin: 50
  });

  const stream = fs.createWriteStream(outputPath);
  doc.pipe(stream);


  const endPromise = new Promise<void>((resolve, reject) => {
    stream.on('finish', resolve);
    stream.on('error', reject);
  });

  try {
    doc
      .fontSize(22)
      .fillColor('blue')
      .text('Guia prático de PDFKit', {
        align: 'center'
      });

    doc.moveDown();

    doc
      .fontSize(12)
      .fillColor('black')
      .text(
        'Este PDF foi gerado com Node.js + PDFKit. Aqui você vai aprender os principais métodos para criar textos, formas, imagens e múltiplas páginas.',
        {
          align: 'justify'
        }
      );

    doc.moveDown(2);

  doc
    .fontSize(16)
    .fillColor('darkgreen')
    .text('2. Posicionamento manual (x, y)', 50, doc.y);

  doc.moveDown();

  const startY = doc.y;

  doc
    .fontSize(12)
    .fillColor('black')
    .text('Texto posicionado em x=50, y=' + startY, 50, startY);

  doc
    .fillColor('red')
    .text('Texto em vermelho em x=300, mesma altura', 300, startY);

  doc.moveDown(3);

  doc
    .fontSize(16)
    .fillColor('darkgreen')
    .text('3. Formatação de texto');

  doc.moveDown();

  doc.fontSize(12).fillColor('black').text('Texto normal');
  doc.fontSize(14).fillColor('purple').text('Texto maior e roxo');
  doc.font('Helvetica-Bold').text('Texto em negrito');
  doc.font('Helvetica-Oblique').text('Texto em itálico');
  doc.font('Helvetica').text('Voltando para fonte normal');

  doc.moveDown(2);

  doc
    .fontSize(16)
    .fillColor('darkgreen')
    .text('4. Formas (retângulos e linhas)');

  doc.moveDown();

  const shapeY = doc.y;

  doc
    .rect(50, shapeY, 120, 50)
    .fill('#DDEEFF');

  doc
    .rect(200, shapeY, 120, 50)
    .stroke('#000000');

  doc
    .moveTo(350, shapeY)
    .lineTo(500, shapeY + 50)
    .lineWidth(2)
    .stroke('red');

  doc
    .fillColor('black')
    .fontSize(10)
    .text('Retângulo preenchido', 50, shapeY + 60)
    .text('Retângulo com borda', 200, shapeY + 60)
    .text('Linha diagonal', 350, shapeY + 60);

  doc.moveDown(6);

  doc
    .fontSize(16)
    .fillColor('darkgreen')
    .text('5. Círculos / elipses');

  doc.moveDown();

  const circleY = doc.y + 20;

  doc
    .circle(100, circleY, 30)
    .fill('#FFD699');

  doc
    .circle(220, circleY, 30)
    .stroke('blue');

  doc
    .ellipse(360, circleY, 50, 25)
    .fillAndStroke('#CCFFCC', 'green');

  doc.moveDown(6);

  doc
    .fontSize(16)
    .fillColor('darkgreen')
    .text('6. Exemplo de tabela manual');

  doc.moveDown();

  const tableTop = doc.y;
  const col1 = 50;
  const col2 = 250;
  const col3 = 400;
  const rowHeight = 25;

  doc
    .rect(50, tableTop, 500, rowHeight)
    .fill('#EAEAEA');

  doc
    .fillColor('black')
    .font('Helvetica-Bold')
    .fontSize(12)
    .text('Produto', col1 + 5, tableTop + 7)
    .text('Qtd', col2 + 5, tableTop + 7)
    .text('Preço', col3 + 5, tableTop + 7);

  const data = [
    ['Caneta', '2', 'R$ 5,00'],
    ['Caderno', '1', 'R$ 20,00'],
    ['Mochila', '1', 'R$ 120,00'],
  ];

  let currentY = tableTop + rowHeight;

  doc.font('Helvetica');

  data.forEach((row, index) => {
    doc.rect(50, currentY, 500, rowHeight).stroke('#CCCCCC');

    doc.text(row[0] ?? '', col1 + 5, currentY + 7);
    doc.text(row[1] ?? '', col2 + 5, currentY + 7);
    doc.text(row[2] ?? '', col3 + 5, currentY + 7);

    currentY += rowHeight;
  });

  doc.moveDown(8);

  const imagePath = path.join(__dirname, 'assets', 'image.jpg');

  doc
    .fontSize(16)
    .fillColor('darkgreen')
    .text('8. Imagem (se existir no caminho)');

  doc.moveDown();

  if (fs.existsSync(imagePath)) {
    doc.image(imagePath, {
      fit: [250, 200],
      align: 'center'
    });

    doc.moveDown();
    doc
      .fontSize(12)
      .fillColor('black')
      .text('Imagem inserida com fit: [250, 200]', {
        align: 'center'
      });
  } else {
    doc
      .fontSize(12)
      .fillColor('red')
      .text(`Imagem não encontrada em: ${imagePath}`);
  }

  doc.moveDown(2);

  doc
    .fontSize(16)
    .fillColor('darkgreen')
    .text('9. Caixa de texto com largura definida');

  doc.moveDown();

  doc
    .fontSize(12)
    .fillColor('black')
    .text(
      'Quando você define width, o PDFKit faz quebra de linha automaticamente dentro da largura especificada. Isso é muito útil para montar blocos, colunas e layouts mais organizados.',
      50,
      doc.y,
      {
        width: 220,
        align: 'justify'
      }
    );

  const boxY = doc.y - 60;

  doc
    .rect(320, boxY, 200, 60)
    .stroke('#888888');

  doc
    .fontSize(10)
    .fillColor('gray')
    .text('Exemplo de caixa desenhada manualmente', 330, boxY + 20);

  doc.moveDown(6);

  doc.addPage();

  doc
    .fontSize(20)
    .fillColor('blue')
    .text('Página 2 - Gráficos e Recursos Adicionais', {
      align: 'center'
    });

  doc.moveDown(2);

  doc
    .fontSize(16)
    .fillColor('darkgreen')
    .text('10. Gráfico de Barras Simples');

  doc.moveDown();

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

    doc.fillColor('black').fontSize(10).text(point.label, xPos, barChartY + chartHeight + 5, {
      width: barWidth,
      align: 'center'
    });
    // Adiciona valor da barra
    doc.fillColor('black').fontSize(8).text(point.value.toString(), xPos, yPos - 15, {
      width: barWidth,
      align: 'center'
    });
  });

  doc.moveDown(10);

  doc
    .fontSize(16)
    .fillColor('darkgreen')
    .text('11. Gráfico Avançado (Radar com Chart.js)');

  doc.moveDown();

  doc
    .fontSize(12)
    .fillColor('black')
    .text(
      'Como o PDFKit não possui uma API de gráficos complexos, a melhor abordagem é usar uma biblioteca especializada como o Chart.js para gerar o gráfico como uma imagem e, em seguida, inseri-la no PDF. Para isso, usamos o pacote `chartjs-node-canvas`.',
      { align: 'justify' }
    );

  doc.moveDown();

  const chartWidth_chartjs_radar = 450;
  const chartHeight_chartjs_radar = 400;
  const chartJSNodeCanvasRadar = new ChartJSNodeCanvas({ width: chartWidth_chartjs_radar, height: chartHeight_chartjs_radar });

  const radarConfiguration: ChartConfiguration = {
    type: 'radar',
    data: {
      labels: [
        'Desenvolvimento',
        'Design',
        'Marketing',
        'Suporte',
        'Vendas',
      ],
      datasets: [
        {
          label: 'Equipe A',
          data: [85, 70, 90, 65, 75],
          fill: true,
          backgroundColor: 'rgba(255, 99, 132, 0.2)',
          borderColor: 'rgb(255, 99, 132)',
        },
        {
          label: 'Equipe B',
          data: [60, 88, 75, 95, 82],
          fill: true,
          backgroundColor: 'rgba(54, 162, 235, 0.2)',
          borderColor: 'rgb(54, 162, 235)',
        },
      ],
    },
  };

    try {
      const radarPngBuffer = await chartJSNodeCanvasRadar.renderToBuffer(radarConfiguration);

      doc.image(radarPngBuffer, {
        fit: [chartWidth_chartjs_radar, chartHeight_chartjs_radar],
        align: 'center'
      });

      doc.moveDown(2);
    } catch (error) {
      doc
        .fontSize(12)
        .fillColor('red')
        .text('Erro ao renderizar o gráfico Radar. Verifique o ambiente do Chart.js.', {
          align: 'left'
        });
      console.error('Erro ao renderizar o gráfico Radar:', error);
    }

  doc.addPage();
  doc
    .fontSize(20)
    .fillColor('blue')
    .text('Página 3 - Mais Gráficos', {
      align: 'center'
    });
  doc.moveDown(2);

  doc
    .fontSize(16)
    .fillColor('darkgreen')
    .text('12. Gráfico Avançado (Área com Chart.js em SVG)');

  doc.moveDown();

  doc
    .fontSize(12)
    .fillColor('black')
    .text(
      'Gerar gráficos como SVG (Scalable Vector Graphics) é a melhor abordagem para PDFs, pois mantém a qualidade vetorial (sem pixelização ao dar zoom). Para isso, configuramos o `chartjs-node-canvas` para gerar um SVG e usamos a biblioteca `svg-to-pdfkit` para desenhá-lo no documento.',
      { align: 'justify' }
    );
  doc.moveDown();

  const chartWidth_chartjs = 450;
  const chartHeight_chartjs = 250;

  const chartJSNodeCanvasSVG = new ChartJSNodeCanvas({
    width: chartWidth_chartjs,
    height: chartHeight_chartjs
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
      const areaPngBuffer = await chartJSNodeCanvasSVG.renderToBuffer(areaConfiguration);

      doc.image(areaPngBuffer, {
        fit: [chartWidth_chartjs, chartHeight_chartjs],
        align: 'center'
      });
    } catch (error) {
      doc
        .fontSize(12)
        .fillColor('red')
        .text('Erro ao renderizar o gráfico de Area. Verifique o ambiente do Chart.js.', {
          align: 'left'
        });
      console.error('Erro ao renderizar o gráfico de Area:', error);
    }
  const pageHeight = doc.page.height;

  doc
    .fontSize(10)
    .fillColor('gray')
    .text(
      'Rodapé simples gerado com PDFKit',
      50,
      pageHeight - 50,
      {
        align: 'center',
        width: 500
      }
    );

  } finally {
    doc.end();
  }

  await endPromise;
}

generatePdf()
  .then(() => {
    console.log(`PDF gerado com sucesso em: ${outputPath}`);
  })
  .catch(err => {
    console.error('Ocorreu um erro ao gerar o PDF:', err);
  });