import { settingsService } from "../../services/api";
export const generateInvoiceHTML = async (sale) => {
    let settings = {
        businessName: "Mi Empresa",
        ruc: "",
        address: "",
        city: "",
        phone: "",
        email: "",
        taxName: "IVA",
        taxRate: 0,
        invoiceEstablishment: "001",
        invoicePoint: "001",
        currentInvoiceNumber: 0,
        timbradoNumber: "",
        timbradoFrom: "",
        timbradoTo: "",
        currencySymbol: "$",
        footerMessage: "Gracias por su compra",
    };
    try {
        const res = await settingsService.get();
        settings = { ...settings, ...res.data };
    }
    catch (e) {
        console.log("Using default settings");
    }
    const date = new Date(sale.createdAt);
    const formattedDate = date.toLocaleDateString('es-PY');
    const taxAmount = sale.subtotal * (settings.taxRate / 100);
    const getPaymentLabel = (method) => {
        const labels = {
            cash: "Efectivo",
            card: "Tarjeta",
            transfer: "Transferencia",
            credit: "Crédito",
        };
        return labels[method] || method;
    };
    const getPaymentCondition = (method) => {
        if (method === "cash")
            return "AL CONTADO";
        if (method === "credit")
            return "A CRÉDITO";
        return "";
    };
    const clientIdentifier = sale.client?.ruc || sale.client?.phone || "Consumidor Final";
    const clientPhone = sale.client?.phone || "";
    const clientAddress = sale.client?.address || "";
    const itemsHTML = sale.items.map((item, index) => `
    <tr>
      <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: center;">${index + 1}</td>
      <td style="padding: 8px; border-bottom: 1px solid #eee;">${item.productName}</td>
      <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
      <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right;">${settings.currencySymbol}${item.unitPrice.toFixed(2)}</td>
      <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right;">${settings.currencySymbol}${item.subtotal.toFixed(2)}</td>
    </tr>
  `).join("");
    const formatInvoiceNumber = () => {
        const num = String(settings.currentInvoiceNumber || 0).padStart(7, '0');
        return `${settings.invoiceEstablishment}-${settings.invoicePoint}-${num}`;
    };
    const formatDate = (dateStr) => {
        if (!dateStr)
            return '';
        const d = new Date(dateStr);
        return d.toLocaleDateString('es-PY');
    };
    const timbradoSection = settings.timbradoNumber ? `
    <div style="background: #fffbeb; border: 1px solid #fcd34d; border-radius: 5px; padding: 8px 12px; margin-bottom: 15px; display: flex; justify-content: space-between; align-items: center;">
      <div>
        <span style="font-size: 10px; color: #92400e;">TIMBRADO N°</span>
        <p style="font-size: 14px; font-weight: bold; color: #78350f; margin: 0;">${settings.timbradoNumber}</p>
      </div>
      <div style="text-align: right;">
        <span style="font-size: 10px; color: #92400e;">VIGENCIA</span>
        <p style="font-size: 12px; font-weight: bold; color: #78350f; margin: 0;">
          ${formatDate(settings.timbradoFrom)} al ${formatDate(settings.timbradoTo)}
        </p>
      </div>
    </div>
  ` : '';
    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Factura ${sale.invoiceNumber}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: Arial, sans-serif; font-size: 13px; color: #333; padding: 15px; }
    .invoice-container { max-width: 750px; margin: 0 auto; border: 2px solid #333; padding: 20px; }
    .header { margin-bottom: 15px; }
    .company-info { text-align: center; margin-bottom: 10px; border-bottom: 1px solid #333; padding-bottom: 10px; }
    .company-info h1 { font-size: 20px; color: #1a56db; margin-bottom: 3px; }
    .company-info p { font-size: 10px; color: #666; margin: 0; }
    .invoice-header { display: flex; justify-content: space-between; margin-bottom: 10px; }
    .invoice-info { text-align: center; }
    .invoice-info h2 { font-size: 18px; color: #333; margin-bottom: 5px; }
    .invoice-number { font-size: 14px; font-weight: bold; color: #1a56db; }
    .invoice-date { font-size: 11px; color: #666; }
    .condition { font-size: 12px; font-weight: bold; color: #16a34a; margin-top: 5px; }
    .client-section { margin-bottom: 12px; padding: 10px; background: #f9fafb; border-radius: 5px; }
    .client-section h3 { font-size: 10px; color: #666; margin-bottom: 3px; }
    .client-section p { font-size: 12px; margin: 0; }
    .client-row { display: flex; gap: 20px; flex-wrap: wrap; }
    .client-item { margin-bottom: 2px; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 12px; }
    th { background: #1a56db; color: white; padding: 8px 6px; text-align: left; font-size: 11px; }
    th:nth-child(1) { width: 5%; text-align: center; }
    th:nth-child(3), th:nth-child(4), th:nth-child(5) { text-align: right; }
    th:nth-child(3) { text-align: center; }
    td { padding: 6px; font-size: 11px; }
    .totals { display: flex; justify-content: flex-end; margin-bottom: 12px; }
    .totals-table { width: 220px; }
    .totals-table tr td { padding: 4px 6px; font-size: 11px; }
    .totals-table tr.total { background: #1a56db; color: white; font-weight: bold; }
    .totals-table tr.total td { padding: 8px; font-size: 13px; }
    .totals-table tr.tax-row { background: #f0f9ff; }
    .footer { margin-top: 20px; text-align: center; padding-top: 10px; border-top: 1px solid #ddd; }
    .footer p { font-size: 10px; color: #666; margin: 0; }
    .footer .thanks { font-size: 11px; font-weight: bold; color: #1a56db; margin-top: 5px; }
    @media print { body { padding: 0; } .invoice-container { border: 1px solid #333; } }
  </style>
</head>
<body>
  <div class="invoice-container">
    <div class="header">
      <div class="company-info">
        <h1>${settings.businessName}</h1>
        <p>RUC: ${settings.ruc} | ${settings.address} | ${settings.city}</p>
        <p>Tel: ${settings.phone} | ${settings.email}</p>
      </div>
      ${timbradoSection}
      <div class="invoice-header">
        <div></div>
        <div class="invoice-info">
          <h2>FACTURA</h2>
          <p class="invoice-number">${formatInvoiceNumber()}</p>
          <p class="invoice-date">Fecha: ${formattedDate}</p>
          ${sale.paymentMethod === "cash" ? '<p class="condition">PAGO AL CONTADO</p>' : ''}
        </div>
        <div></div>
      </div>
    </div>

    <div class="client-section">
      <h3>CLIENTE</h3>
      <div class="client-row">
        <p><strong>${sale.clientName}</strong></p>
        ${clientIdentifier !== "Consumidor Final" ? `<p>RUC/CI: ${clientIdentifier}</p>` : ''}
        ${clientPhone ? `<p>Tel: ${clientPhone}</p>` : ''}
      </div>
      ${clientAddress ? `<p style="margin-top:3px; color:#666; font-size:10px;">${clientAddress}</p>` : ''}
    </div>

    <table>
      <thead>
        <tr>
          <th>#</th>
          <th>Descripción</th>
          <th>Cant.</th>
          <th>P. Unit.</th>
          <th>Subtotal</th>
        </tr>
      </thead>
      <tbody>
        ${itemsHTML}
      </tbody>
    </table>

    <div class="totals">
      <table class="totals-table">
        <tr>
          <td style="text-align: right;">Subtotal:</td>
          <td style="text-align: right;">${settings.currencySymbol}${sale.subtotal.toFixed(2)}</td>
        </tr>
        ${sale.discount > 0 ? `
        <tr>
          <td style="text-align: right; color: #dc2626;">Descuento:</td>
          <td style="text-align: right; color: #dc2626;">${settings.currencySymbol}${sale.discount.toFixed(2)}</td>
        </tr>
        ` : ""}
        ${settings.taxRate > 0 ? `
        <tr class="tax-row">
          <td style="text-align: right;">${settings.taxName} (${settings.taxRate}%):</td>
          <td style="text-align: right;">${settings.currencySymbol}${taxAmount.toFixed(2)}</td>
        </tr>
        ` : ""}
        <tr class="total">
          <td style="text-align: right;">TOTAL:</td>
          <td style="text-align: right;">${settings.currencySymbol}${sale.total.toFixed(2)}</td>
        </tr>
      </table>
    </div>

    <div class="footer">
      <p>Forma de pago: <strong>${getPaymentLabel(sale.paymentMethod)}</strong> ${getPaymentCondition(sale.paymentMethod)}</p>
      <p class="thanks">${settings.footerMessage}</p>
    </div>
  </div>
</body>
</html>
  `;
    return html;
};
export const printInvoice = async (sale) => {
    const html = await generateInvoiceHTML(sale);
    const printWindow = window.open("", "_blank");
    if (printWindow) {
        printWindow.document.write(html);
        printWindow.document.close();
        printWindow.focus();
        setTimeout(() => {
            printWindow.print();
        }, 250);
    }
};
export const downloadInvoicePDF = async (sale) => {
    const html = await generateInvoiceHTML(sale);
    const printWindow = window.open("", "_blank");
    if (printWindow) {
        printWindow.document.write(html);
        printWindow.document.close();
        printWindow.focus();
        printWindow.onload = () => {
            printWindow.print();
        };
    }
};
