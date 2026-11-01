import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export function generateOrderInvoice(order) {
  const doc = new jsPDF();

  // Header Bar
  doc.setFillColor(33, 33, 33);
  doc.rect(0, 0, 210, 36, 'F');

  doc.setTextColor(184, 149, 121); // #B89579 Bronze
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('VINCENT & VINTAGE', 14, 18);

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text('FEEL THE STYLE  |  Premium Quality • Comfort • Classy', 14, 26);

  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text(`INVOICE #${order.orderNumber || order.id}`, 196, 18, { align: 'right' });
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(`Date: ${new Date(order.createdAt).toLocaleDateString('en-GB')}`, 196, 26, { align: 'right' });

  // Customer Details
  doc.setTextColor(33, 33, 33);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('BILL TO / SHIP TO:', 14, 48);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Name: ${order.customerName}`, 14, 55);
  doc.text(`Phone: ${order.customerPhone}`, 14, 61);
  doc.text(`Address: ${order.shippingAddress}`, 14, 67);
  doc.text(`Delivery Zone: ${order.deliveryZone} (TK. ${order.deliveryCharge})`, 14, 73);
  doc.text(`Payment Method: ${order.paymentMethod} | Status: ${(order.status || 'pending').toUpperCase()}`, 14, 79);

  // Items Table
  const tableRows = (order.items || []).map((item, idx) => [
    idx + 1,
    `${item.name}\nSKU: ${item.sku || 'N/A'} | Size: ${item.size || 'L'} | Color: ${item.color || 'Standard'}`,
    `TK. ${Number(item.price).toLocaleString()}`,
    item.quantity,
    `TK. ${(Number(item.price) * Number(item.quantity)).toLocaleString()}`
  ]);

  autoTable(doc, {
    startY: 86,
    head: [['#', 'Item Description (SKU / Size / Color)', 'Unit Price', 'Qty', 'Total']],
    body: tableRows,
    theme: 'grid',
    headStyles: {
      fillColor: [78, 56, 40], // #4e3828 Warm Coffee
      textColor: [255, 255, 255],
      fontStyle: 'bold'
    },
    styles: {
      fontSize: 9,
      cellPadding: 4
    }
  });

  const finalY = doc.lastAutoTable.finalY + 10;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Subtotal: TK. ${Number(order.subtotal || 0).toLocaleString()}`, 196, finalY, { align: 'right' });
  doc.text(`Delivery Charge (${order.deliveryZone}): TK. ${Number(order.deliveryCharge || 60).toLocaleString()}`, 196, finalY + 6, { align: 'right' });

  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(169, 129, 83); // #A98153
  doc.text(`Grand Total: TK. ${Number(order.totalAmount || 0).toLocaleString()}`, 196, finalY + 14, { align: 'right' });

  doc.setTextColor(120, 120, 120);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text('Thank you for shopping with Vincent & Vintage! Feel The Style.', 105, 285, { align: 'center' });

  doc.save(`Vincent-Vintage-Invoice-${order.orderNumber || order.id}.pdf`);
}
