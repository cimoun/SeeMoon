import React, { useRef } from 'react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { saveAs } from 'file-saver';
import './ExportPanel.css';

export function ExportPanel({ nodes, edges, lanes }) {
  const canvasRef = useRef(null);

  const exportToPNG = async () => {
    try {
      const reactFlowElement = document.querySelector('.react-flow');
      if (!reactFlowElement) return;

      const canvas = await html2canvas(reactFlowElement, {
        backgroundColor: '#fafafa',
        scale: 2,
        useCORS: true,
        logging: false,
      });

      canvas.toBlob((blob) => {
        if (blob) {
          saveAs(blob, 'bpmn-diagram.png');
        }
      });
    } catch (error) {
      console.error('Error exporting to PNG:', error);
      alert('Ошибка при экспорте в PNG');
    }
  };

  const exportToPDF = async () => {
    try {
      const reactFlowElement = document.querySelector('.react-flow');
      if (!reactFlowElement) return;

      const canvas = await html2canvas(reactFlowElement, {
        backgroundColor: '#fafafa',
        scale: 2,
        useCORS: true,
        logging: false,
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
      });

      const imgWidth = 297; // A4 landscape width in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      pdf.save('bpmn-diagram.pdf');
    } catch (error) {
      console.error('Error exporting to PDF:', error);
      alert('Ошибка при экспорте в PDF');
    }
  };

  const exportToSVG = () => {
    try {
      const reactFlowElement = document.querySelector('.react-flow');
      if (!reactFlowElement) return;

      // Создаем SVG из содержимого
      const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      const rect = reactFlowElement.getBoundingClientRect();
      svg.setAttribute('width', rect.width);
      svg.setAttribute('height', rect.height);
      svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');

      // Клонируем содержимое (упрощенная версия)
      const svgContent = `
        <rect width="100%" height="100%" fill="#fafafa"/>
        <text x="50%" y="50%" text-anchor="middle" font-size="16" fill="#333">
          SVG экспорт требует дополнительной реализации для точного отображения всех элементов
        </text>
      `;
      svg.innerHTML = svgContent;

      const serializer = new XMLSerializer();
      const svgString = serializer.serializeToString(svg);
      const blob = new Blob([svgString], { type: 'image/svg+xml' });
      saveAs(blob, 'bpmn-diagram.svg');
    } catch (error) {
      console.error('Error exporting to SVG:', error);
      alert('Ошибка при экспорте в SVG');
    }
  };

  return (
    <div className="export-panel" ref={canvasRef}>
      <button onClick={exportToPNG} className="export-button">
        Экспорт PNG
      </button>
      <button onClick={exportToPDF} className="export-button">
        Экспорт PDF
      </button>
      <button onClick={exportToSVG} className="export-button">
        Экспорт SVG
      </button>
    </div>
  );
}
