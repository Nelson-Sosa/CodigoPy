import { settingsService } from "../../services/api";

interface ClientData {
  name: string;
  ruc?: string;
  phone?: string;
  email?: string;
  address?: string;
}

interface SaleData {
  invoiceNumber: string;
  client?: ClientData | null;
  clientName: string;
  clientRuc?: string;
  items: Array<{
    productName: string;
    quantity: number;
    unitPrice: number;
    subtotal: number;
  }>;
  subtotal: number;
  discount: number;
  tax?: number;
  total: number;
  paymentMethod: string;
  createdAt: string;
}

interface Settings {
  businessName: string;
  ruc: string;
  address: string;
  city: string;
  phone: string;
  email: string;
  taxName: string;
  taxRate: number;
  invoiceEstablishment: string;
  invoicePoint: string;
  currentInvoiceNumber: number;
  timbradoNumber: string;
  timbradoFrom: string;
  timbradoTo: string;
  currencySymbol: string;
  footerMessage: string;
}

export const generateInvoiceHTML = async (sale: SaleData): Promise<string> => {
  let settings: Settings = {
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
  } catch (e) {
    console.log("Using default settings");
  }

  const date = new Date(sale.createdAt);
  const formattedDate = date.toLocaleDateString('es-PY', { day: '2-digit', month: '2-digit', year: 'numeric' });

  const exchangeRate = 6600;
  const totalGs = Math.round(sale.total * exchangeRate);

  const formatGs = (amount: number) => {
    return Math.round(amount * exchangeRate).toLocaleString("es-PY");
  };

  const numberToWords = (num: number): string => {
    const unidades = ["", "uno", "dos", "tres", "cuatro", "cinco", "seis", "siete", "ocho", "nueve"];
    const decenas = ["", "diez", "veinte", "treinta", "cuarenta", "cincuenta", "sesenta", "setenta", "ochenta", "noventa"];

    if (num === 0) return "cero";

    const miles = Math.floor(num / 1000);
    const resto = num % 1000;

    let result = "";

    if (miles > 0) {
      if (miles === 1) result = "un mil";
      else result = (miles < 20 ? unidades[miles] : decenas[Math.floor(miles / 10)] + (miles % 10 > 0 ? " y " + unidades[miles % 10] : "")) + " mil";
    }

    if (resto > 0) {
      if (miles > 0) result += " ";
      if (resto < 20) {
        result += unidades[resto];
      } else {
        result += decenas[Math.floor(resto / 10)];
        if (resto % 10 > 0) {
          result += " y " + unidades[resto % 10];
        }
      }
    }

    return result;
  };

  const totalEnLetras = numberToWords(totalGs);

  const getPaymentLabel = (method: string) => {
    const labels: Record<string, string> = {
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

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleDateString('es-PY', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  const iva5 = Math.round(sale.subtotal * 0.05);
  const iva10 = Math.round(sale.subtotal * 0.10);
  const totalIva = iva5 + iva10;

  const itemsHTML = sale.items.map((item) => `
    <tr>
      <td style="padding: 5px 8px; border: 1px solid #000; text-align: center; font-size: 11px;">${item.quantity}</td>
      <td style="padding: 5px 8px; border: 1px solid #000; text-align: left; font-size: 11px;">${item.productName}</td>
      <td style="padding: 5px 8px; border: 1px solid #000; text-align: right; font-size: 11px;">${item.unitPrice.toFixed(2)}</td>
      <td style="padding: 5px 8px; border: 1px solid #000; text-align: right; font-size: 11px;">0</td>
      <td style="padding: 5px 8px; border: 1px solid #000; text-align: right; font-size: 11px;">0</td>
      <td style="padding: 5px 8px; border: 1px solid #000; text-align: right; font-size: 11px;">${item.subtotal.toFixed(2)}</td>
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
    body { font-family: Arial, sans-serif; font-size: 12px; color: #000; padding: 10px; }
    .invoice-container { max-width: 850px; margin: 0 auto; }
    
    /* Header */
    .header {
      display: table;
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 5px;
    }
    .header-left {
      display: table-cell;
      width: 55%;
      vertical-align: top;
      padding-right: 10px;
    }
    .header-right {
      display: table-cell;
      width: 45%;
      vertical-align: top;
    }
    
    .company-name {
      font-size: 20px;
      font-weight: bold;
      color: #000;
      margin-bottom: 5px;
    }
    .company-detail {
      font-size: 10px;
      line-height: 1.4;
    }
    
    .timbrado-box {
      border: 1px solid #000;
      padding: 8px;
    }
    .timbrado-title {
      background: #000;
      color: #fff;
      text-align: center;
      padding: 3px;
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
      padding: 2px 5px;
      border: 1px solid #000;
    }
    .timbrado-table td:first-child {
      font-weight: bold;
      background: #f0f0f0;
      width: 40%;
    }
    
    .invoice-title {
      background: #000;
      color: #fff;
      text-align: center;
      padding: 8px;
      font-weight: bold;
      font-size: 16px;
      margin-top: 5px;
    }
    
    /* Client */
    .client-section {
      border: 1px solid #000;
      padding: 8px;
      margin: 5px 0;
    }
    .client-title {
      background: #f0f0f0;
      padding: 3px 8px;
      font-weight: bold;
      font-size: 11px;
      margin-bottom: 5px;
      border-bottom: 1px solid #000;
    }
    .client-grid {
      display: table;
      width: 100%;
      font-size: 10px;
    }
    .client-row {
      display: table-row;
    }
    .client-label {
      display: table-cell;
      font-weight: bold;
      padding: 2px 5px;
      width: 15%;
      border: 1px solid #000;
      background: #f5f5f5;
    }
    .client-value {
      display: table-cell;
      padding: 2px 5px;
      width: 35%;
      border: 1px solid #000;
    }
    .client-value.wide {
      width: 85%;
    }
    .client-value.medium {
      width: 35%;
    }
    
    /* Items Table */
    .items-table {
      width: 100%;
      border-collapse: collapse;
      margin: 5px 0;
      font-size: 11px;
    }
    .items-table th {
      background: #f0f0f0;
      border: 1px solid #000;
      padding: 5px;
      font-weight: bold;
      text-align: center;
    }
    .items-table td {
      border: 1px solid #000;
      padding: 5px;
    }
    .items-table th:nth-child(1) { width: 8%; }
    .items-table th:nth-child(2) { width: 32%; text-align: left; }
    .items-table th:nth-child(3) { width: 15%; }
    .items-table th:nth-child(4) { width: 15%; }
    .items-table th:nth-child(5) { width: 15%; }
    .items-table th:nth-child(6) { width: 15%; }
    
    /* Totals */
    .totals-section {
      display: table;
      width: 100%;
      border-collapse: collapse;
      margin: 5px 0;
    }
    .totals-left {
      display: table-cell;
      width: 55%;
      padding-right: 10px;
      vertical-align: top;
    }
    .totals-right {
      display: table-cell;
      width: 45%;
      vertical-align: top;
    }
    
    .liquidation-box {
      border: 1px solid #000;
    }
    .liquidation-title {
      background: #f0f0f0;
      padding: 5px;
      font-weight: bold;
      font-size: 11px;
      border-bottom: 1px solid #000;
      text-align: center;
    }
    .liquidation-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 11px;
    }
    .liquidation-table td {
      padding: 4px 8px;
      border-bottom: 1px solid #000;
    }
    .liquidation-table td:last-child {
      text-align: right;
      font-weight: bold;
    }
    .liquidation-table tr:last-child td {
      border-bottom: none;
    }
    .liquidation-table .total-row {
      background: #000;
      color: #fff;
      font-weight: bold;
      font-size: 14px;
    }
    .liquidation-table .total-row td {
      padding: 8px;
      border-bottom: none;
    }
    
    .total-letras {
      font-size: 10px;
      line-height: 1.5;
      margin-top: 5px;
      padding: 5px;
      border: 1px solid #000;
      min-height: 60px;
    }
    .total-letras strong {
      display: block;
      margin-bottom: 3px;
    }
    
    /* Footer */
    .footer {
      margin-top: 10px;
      padding-top: 5px;
      border-top: 1px solid #000;
      text-align: center;
      font-size: 9px;
      color: #666;
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
          <div class="company-name">${settings.businessName}</div>
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
                <td>Total a Pagar:</td>
                <td><strong>Gs. ${formatGs(sale.total)}</strong></td>
              </tr>
              <tr>
                <td>IVA 5%:</td>
                <td>Gs. ${formatGs(iva5)}</td>
              </tr>
              <tr>
                <td>IVA 10%:</td>
                <td>Gs. ${formatGs(iva10)}</td>
              </tr>
              <tr class="total-row">
                <td>TOTAL IVA:</td>
                <td>Gs. ${formatGs(totalIva)}</td>
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

export const printInvoice = async (sale: SaleData) => {
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

export const downloadInvoicePDF = async (sale: SaleData) => {
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
