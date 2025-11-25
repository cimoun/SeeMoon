import { toPng, toSvg } from 'html-to-image';
import { jsPDF } from 'jspdf';

const DEFAULT_NAME = 'bpmn-diagram';

export async function exportDiagram(node, format) {
  if (!node) throw new Error('Контейнер диаграммы не найден');
  const fileName = `${DEFAULT_NAME}.${format}`;
  if (format === 'png') {
    await saveDataUrl(() => toPng(node, { pixelRatio: 2, cacheBust: true }), fileName);
    return;
  }
  if (format === 'svg') {
    await saveDataUrl(() => toSvg(node, { cacheBust: true }), fileName);
    return;
  }
  if (format === 'pdf') {
    await exportPdf(node, `${DEFAULT_NAME}.pdf`);
    return;
  }
  throw new Error(`Формат ${format} не поддерживается`);
}

async function saveDataUrl(generator, fileName) {
  const dataUrl = await generator();
  const link = document.createElement('a');
  link.href = dataUrl;
  link.download = fileName;
  link.click();
}

async function exportPdf(node, fileName) {
  const { width, height } = node.getBoundingClientRect();
  const image = await toPng(node, { pixelRatio: 2, cacheBust: true });
  const orientation = width >= height ? 'landscape' : 'portrait';
  const pdf = new jsPDF({
    orientation,
    unit: 'px',
    format: [width, height]
  });
  pdf.addImage(image, 'PNG', 0, 0, width, height);
  pdf.save(fileName);
}
