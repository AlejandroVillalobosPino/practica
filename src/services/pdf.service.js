import PDFDocument from 'pdfkit';

export const generateDeliveryNotePDF = (deliveryNote) => {
    return new Promise((resolve, reject) => {
        try {
            const doc = new PDFDocument({ margin: 50 });
            const buffers = [];

            // Vamos guardando el PDF en memoria
            doc.on('data', buffers.push.bind(buffers));
            doc.on('end', () => resolve(Buffer.concat(buffers)));

            // --- DISEÑO DEL PDF ---

            // Cabecera
            doc.fontSize(20).text('ALBARÁN DE TRABAJO', { align: 'center' });
            doc.moveDown(2);

            // Información General
            doc.fontSize(12).font('Helvetica-Bold').text(`Nº Albarán: `, { continued: true }).font('Helvetica').text(deliveryNote.deliveryNoteNumber);
            doc.font('Helvetica-Bold').text(`Fecha: `, { continued: true }).font('Helvetica').text(new Date(deliveryNote.date).toLocaleDateString());
            doc.moveDown();

            doc.font('Helvetica-Bold').text(`Proyecto: `, { continued: true }).font('Helvetica').text(deliveryNote.project.name);
            doc.font('Helvetica-Bold').text(`Cliente: `, { continued: true }).font('Helvetica').text(deliveryNote.client.name);
            doc.moveDown(2);

            // Conceptos (Items)
            doc.fontSize(14).font('Helvetica-Bold').text('Conceptos facturables:', { underline: true });
            doc.moveDown(0.5);

            deliveryNote.items.forEach(item => {
                doc.fontSize(12).font('Helvetica').text(`• ${item.quantity}x ${item.concept} ${item.hours ? `(${item.hours}h)` : ''}`);
                if (item.description) {
                    doc.fontSize(10).fillColor('gray').text(`  ${item.description}`);
                    doc.fillColor('black'); // Restaurar color
                }
                doc.moveDown(0.5);
            });

            doc.moveDown(2);

            // Sección de Firma
            if (deliveryNote.status === 'SIGNED' && deliveryNote.signatureUrl) {
                doc.fontSize(12).font('Helvetica-Bold').fillColor('green').text('ESTADO: FIRMADO');
                doc.fontSize(10).fillColor('blue').text('Ver firma digital (clic aquí)', { link: deliveryNote.signatureUrl, underline: true });
            } else {
                doc.fontSize(12).font('Helvetica-Bold').fillColor('red').text('ESTADO: PENDIENTE DE FIRMA');
            }

            // Finalizar documento
            doc.end();
        } catch (error) {
            reject(error);
        }
    });
};