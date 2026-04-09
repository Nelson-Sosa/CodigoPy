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
    const formattedDate = date.toLocaleDateString('es-PY', { day: '2-digit', month: '2-digit', year: 'numeric' });
    const exchangeRate = 6600;
    const totalGs = Math.round(sale.total * exchangeRate);
    const formatGs = (amount) => {
        return Math.round(amount * exchangeRate).toLocaleString("es-PY");
    };
    const numberToWords = (num) => {
        const unidades = ["", "uno", "dos", "tres", "cuatro", "cinco", "seis", "siete", "ocho", "nueve"];
        const decenas = ["", "diez", "veinte", "treinta", "cuarenta", "cincuenta", "sesenta", "setenta", "ochenta", "noventa"];
        if (num === 0)
            return "cero";
        const miles = Math.floor(num / 1000);
        const resto = num % 1000;
        let result = "";
        if (miles > 0) {
            if (miles === 1)
                result = "un mil";
            else
                result = (miles < 20 ? unidades[miles] : decenas[Math.floor(miles / 10)] + (miles % 10 > 0 ? " y " + unidades[miles % 10] : "")) + " mil";
        }
        if (resto > 0) {
            if (miles > 0)
                result += " ";
            if (resto < 20) {
                result += unidades[resto];
            }
            else {
                result += decenas[Math.floor(resto / 10)];
                if (resto % 10 > 0) {
                    result += " y " + unidades[resto % 10];
                }
            }
        }
        return result;
    };
    const totalEnLetras = numberToWords(totalGs);
    const getPaymentLabel = (method) => {
        const labels = {
            cash: "Efectivo",
            card: "Tarjeta",
            transfer: "Transferencia",
            credit: "Credito",
        };
        return labels[method] || method;
    };
    const clientName = sale.client?.name || sale.clientName || "CONSUMIDOR FINAL";
    const clientIdentifier = sale.client?.ruc || sale.clientRuc || "";
    const clientPhone = sale.client?.phone || "";
    const clientAddress = sale.client?.address || settings.address || "";
    const formatInvoiceNumber = () => {
        const num = String(settings.currentInvoiceNumber || 0).padStart(7, '0');
        return `${settings.invoiceEstablishment}-${settings.invoicePoint}-${num}`;
    };
    const formatDate = (dateStr) => {
        if (!dateStr)
            return '';
        const d = new Date(dateStr);
        return d.toLocaleDateString('es-PY', { day: '2-digit', month: '2-digit', year: 'numeric' });
    };
    const iva5 = Math.round(sale.subtotal * 0.05);
    const iva10 = Math.round(sale.subtotal * 0.10);
    const totalIva = iva5 + iva10;
    const itemsHTML = sale.items.map((item) => `
    <tr>
      <td style="padding: 6px 8px; text-align: center; font-size: 12px;">${item.quantity}</td>
      <td style="padding: 6px 8px; text-align: left; font-size: 12px;">${item.productName}</td>
      <td style="padding: 6px 8px; text-align: right; font-size: 12px;">Gs. ${formatGs(item.unitPrice)}</td>
      <td style="padding: 6px 8px; text-align: right; font-size: 12px;">-</td>
      <td style="padding: 6px 8px; text-align: right; font-size: 12px;">-</td>
      <td style="padding: 6px 8px; text-align: right; font-size: 12px;">Gs. ${formatGs(item.subtotal)}</td>
    </tr>
  `).join("");
    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Factura ${formatInvoiceNumber()}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: Arial, sans-serif; font-size: 12px; color: #333; padding: 10px; }
    .invoice-container { max-width: 850px; margin: 0 auto; }
    
    /* Header */
    .header {
      display: table;
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 5px;
    }
    
    .company-name {
      font-size: 22px;
      font-weight: bold;
      color: #1e40af;
      margin-bottom: 5px;
    }
    .company-detail {
      font-size: 11px;
      line-height: 1.5;
      color: #555;
    }
    
    .timbrado-box {
      border: 1px solid #ccc;
      padding: 8px;
    }
    .timbrado-title {
      background: #1e40af;
      color: #fff;
      text-align: center;
      padding: 4px;
      font-weight: bold;
      font-size: 11px;
      margin-bottom: 5px;
    }
    .timbrado-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 10px;
    }
    .timbrado-table td {
      padding: 3px 6px;
      border-bottom: 1px solid #eee;
    }
    .timbrado-table td:first-child {
      font-weight: bold;
      color: #666;
      width: 45%;
    }
    
    .invoice-title {
      background: #1e40af;
      color: #fff;
      text-align: center;
      padding: 10px;
      font-weight: bold;
      font-size: 18px;
      margin-top: 5px;
    }
    
    /* Client */
    .client-section {
      border: 1px solid #ccc;
      padding: 10px;
      margin: 8px 0;
    }
    .client-title {
      color: #1e40af;
      padding-bottom: 5px;
      font-weight: bold;
      font-size: 11px;
      margin-bottom: 8px;
      border-bottom: 1px solid #eee;
    }
    .client-grid {
      display: table;
      width: 100%;
      font-size: 11px;
    }
    .client-row {
      display: table-row;
    }
    .client-label {
      display: table-cell;
      font-weight: bold;
      padding: 3px 8px;
      width: 18%;
      color: #666;
    }
    .client-value {
      display: table-cell;
      padding: 3px 8px;
      width: 32%;
    }
    
    /* Items Table */
    .items-table {
      width: 100%;
      border-collapse: collapse;
      margin: 8px 0;
      font-size: 12px;
      border: 1px solid #ccc;
    }
    .items-table th {
      background: #f5f5f5;
      padding: 8px;
      font-weight: bold;
      text-align: center;
      border-bottom: 2px solid #ccc;
    }
    .items-table td {
      padding: 8px;
      border-bottom: 1px solid #eee;
    }
    .items-table th:nth-child(1) { width: 8%; }
    .items-table th:nth-child(2) { width: 37%; text-align: left; }
    .items-table th:nth-child(3) { width: 15%; }
    .items-table th:nth-child(4) { width: 13%; }
    .items-table th:nth-child(5) { width: 13%; }
    .items-table th:nth-child(6) { width: 14%; }
    
    /* Totals */
    .totals-section {
      display: table;
      width: 100%;
      margin: 8px 0;
    }
    .totals-left {
      display: table-cell;
      width: 55%;
      padding-right: 15px;
      vertical-align: top;
    }
    .totals-right {
      display: table-cell;
      width: 45%;
      vertical-align: top;
    }
    
    .liquidation-box {
      border: 1px solid #ccc;
    }
    .liquidation-title {
      background: #1e40af;
      color: #fff;
      padding: 6px;
      font-weight: bold;
      font-size: 11px;
      text-align: center;
    }
    .liquidation-table {
      width: 100%;
      font-size: 11px;
    }
    .liquidation-table td {
      padding: 6px 10px;
      border-bottom: 1px solid #eee;
    }
    .liquidation-table td:last-child {
      text-align: right;
    }
    .liquidation-table .total-row {
      background: #1e40af;
      color: #fff;
      font-weight: bold;
      font-size: 14px;
    }
    
    .total-letras {
      font-size: 11px;
      line-height: 1.6;
      margin-top: 5px;
      padding: 10px;
      border: 1px solid #ccc;
      min-height: 50px;
    }
    .total-letras strong {
      display: block;
      margin-bottom: 3px;
    }
    
    /* Footer */
    .footer {
      margin-top: 15px;
      padding-top: 10px;
      border-top: 1px solid #ccc;
      text-align: center;
      font-size: 10px;
      color: #888;
    }
    
    @media print {
      body { padding: 0; }
    }
  </style>
</head>
<body>
  <div class="invoice-container">
    <!-- Header -->
    <table class="header" style="border-collapse: collapse; width: 100%;">
      <tr>
        <td style="width: 55%; vertical-align: top; padding-right: 10px;">
          <div class="company-name">Tech Store Paraguay</div>
          <div class="company-detail">
            RUC: ${settings.ruc}<br>
            ${settings.address}${settings.city ? '<br>' + settings.city : ''}<br>
            Tel: ${settings.phone}${settings.email ? ' | Email: ' + settings.email : ''}
          </div>
        </td>
        <td style="width: 45%; vertical-align: top;">
          <div class="timbrado-box">
            <div class="timbrado-title">TIMBRADO N°</div>
            <table class="timbrado-table">
              <tr>
                <td>Nro. Timbrado:</td>
                <td><strong>${settings.timbradoNumber || '-'}</strong></td>
              </tr>
              <tr>
                <td>Nro. Factura:</td>
                <td>${formatInvoiceNumber()}</td>
              </tr>
              <tr>
                <td>Fecha Inicio:</td>
                <td>${formatDate(settings.timbradoFrom) || '-'}</td>
              </tr>
              <tr>
                <td>Fecha Vto:</td>
                <td>${formatDate(settings.timbradoTo) || '-'}</td>
              </tr>
            </table>
          </div>
        </td>
      </tr>
    </table>
    
    <div class="invoice-title">FACTURA</div>
    
    <!-- Client -->
    <div class="client-section">
      <div class="client-title">DATOS DEL RECEPTOR</div>
      <div class="client-grid">
        <div class="client-row">
          <div class="client-label">Nombre / Razon Social:</div>
          <div class="client-value wide">${clientName}</div>
        </div>
        <div class="client-row">
          <div class="client-label">RUC / CI:</div>
          <div class="client-value medium">${clientIdentifier || 'Consumidor Final'}</div>
          <div class="client-label">Direccion:</div>
          <div class="client-value medium">${clientAddress || '-'}</div>
        </div>
        <div class="client-row">
          <div class="client-label">Telefono:</div>
          <div class="client-value medium">${clientPhone || '-'}</div>
          <div class="client-label">Fecha:</div>
          <div class="client-value medium">${formattedDate}</div>
        </div>
      </div>
    </div>
    
    <!-- Items -->
    <table class="items-table">
      <thead>
        <tr>
          <th>Cant.</th>
          <th style="text-align: left;">Descripcion</th>
          <th>Precio Unit.</th>
          <th>Exenta</th>
          <th>Grav. 5%</th>
          <th>Grav. 10%</th>
        </tr>
      </thead>
      <tbody>
        ${itemsHTML}
      </tbody>
    </table>
    
    <!-- Totals -->
    <table class="totals-section">
      <tr>
        <td style="width: 55%; vertical-align: top; padding-right: 10px;">
          <div class="total-letras">
            <strong>Son: Gs. ${formatGs(sale.total)} (${totalEnLetras})</strong>
          </div>
        </td>
        <td style="width: 45%; vertical-align: top;">
          <div class="liquidation-box">
            <div class="liquidation-title">LIQUIDACION</div>
            <table class="liquidation-table">
              <tr>
                <td>Subtotal:</td>
                <td>Gs. ${formatGs(sale.subtotal)}</td>
              </tr>
              <tr>
                <td>IVA 5%:</td>
                <td>Gs. ${formatGs(iva5)}</td>
              </tr>
              <tr>
                <td>IVA 10%:</td>
                <td>Gs. ${formatGs(iva10)}</td>
              </tr>
              <tr>
                <td>Total IVA:</td>
                <td>Gs. ${formatGs(totalIva)}</td>
              </tr>
              <tr class="total-row">
                <td>TOTAL A PAGAR:</td>
                <td>Gs. ${formatGs(sale.total)}</td>
              </tr>
            </table>
          </div>
        </td>
      </tr>
    </table>
    
    <!-- Footer -->
    <div class="footer">
      <p>Forma de Pago: <strong>${getPaymentLabel(sale.paymentMethod)}</strong></p>
      <p style="margin-top: 5px;">${settings.footerMessage}</p>
    </div>
  </div>
</body>
</html>
  `;
    return html;
};
export const printInvoice = async (sale) => {
    const html = await generateInvoiceHTML(sale);
    const printWindow = window.open("", "_blank", "width=900,height=700");
    if (printWindow) {
        printWindow.document.write(html);
        printWindow.document.close();
        printWindow.focus();
        setTimeout(() => {
            printWindow.print();
        }, 300);
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
