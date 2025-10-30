import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// Exportar a Excel
export const exportarExcel = (datos, nombreArchivo, nombreHoja = 'Datos') => {
  const worksheet = XLSX.utils.json_to_sheet(datos);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, nombreHoja);
  
  // Ajustar ancho de columnas automáticamente
  const maxWidth = datos.reduce((w, r) => Math.max(w, Object.keys(r).length), 10);
  worksheet['!cols'] = Array(maxWidth).fill({ wch: 15 });
  
  XLSX.writeFile(workbook, `${nombreArchivo}.xlsx`);
};

// Exportar tabla a PDF
export const exportarPDF = (titulo, columnas, datos, nombreArchivo) => {
  try {
    const doc = new jsPDF('l', 'mm', 'a4'); // landscape, milímetros, A4
    
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    
    // Título
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text(titulo, pageWidth / 2, 15, { align: 'center' });
    
    // Fecha de generación
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    const fecha = new Date().toLocaleString('es-PE', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
    doc.text(`Generado: ${fecha}`, pageWidth / 2, 22, { align: 'center' });
    
    // Línea separadora
    doc.setLineWidth(0.5);
    doc.line(20, 25, pageWidth - 20, 25);
    
    // Tabla usando autoTable (importado como función)
    autoTable(doc, {
      startY: 30,
      head: [columnas],
      body: datos,
      theme: 'grid',
      headStyles: {
        fillColor: [52, 152, 219],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        halign: 'center',
        fontSize: 10
      },
      bodyStyles: {
        fontSize: 9,
        cellPadding: 3
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245]
      },
      margin: { left: 15, right: 15 },
      didDrawPage: function(data) {
        // Footer con número de página
        doc.setFontSize(8);
        doc.setTextColor(100);
        const str = 'Página ' + doc.internal.getCurrentPageInfo().pageNumber;
        doc.text(str, pageWidth / 2, pageHeight - 10, { align: 'center' });
        
        // Footer adicional
        doc.text('Sistema de Control de Ventas', pageWidth / 2, pageHeight - 5, { align: 'center' });
      }
    });
    
    // Guardar PDF
    doc.save(`${nombreArchivo}.pdf`);
    console.log('PDF generado exitosamente');
    
  } catch (error) {
    console.error('Error al generar PDF:', error);
    alert('Error al generar el PDF: ' + error.message);
  }
};