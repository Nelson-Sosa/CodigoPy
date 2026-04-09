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

const numberToWordsGs = (num: number): string => {
  const n = Math.floor(num);
  
  if (n === 0) return "cero";
  
  const unidades = [
    "", "uno", "dos", "tres", "cuatro", "cinco", "seis", "siete", "ocho", "nueve",
    "diez", "once", "doce", "trece", "catorce", "quince", "dieciseis", "diecisiete",
    "dieciocho", "diecinueve"
  ];
  
  const decenas = [
    "", "", "veinte", "treinta", "cuarenta", "cincuenta", "sesenta", "setenta", "ochenta", "noventa"
  ];
  
  const cientos = [
    "", "ciento", "doscientos", "trescientos", "cuatrocientos", "quinientos",
    "seiscientos", "setecientos", "ochocientos", "novecientos"
  ];
  
  const miles = [
    "", "mil", "dos mil", "tres mil", "cuatro mil", "cinco mil", "seis mil",
    "siete mil", "ocho mil", "nueve mil"
  ];
  
  if (n < 20) return unidades[n];
  if (n < 100) return decenas[Math.floor(n / 10)] + (n % 10 !== 0 ? " y " + unidades[n % 10] : "");
  if (n < 1000) {
    const c = Math.floor(n / 100);
    const r = n % 100;
    if (n === 100) return "cien";
    return cientos[c] + (r !== 0 ? " " + numberToWordsGs(r) : "");
  }
  if (n < 10000) {
    const m = Math.floor(n / 1000);
    const r = n % 1000;
    return miles[m] + (r !== 0 ? " " + numberToWordsGs(r) : "");
  }
  
  return n.toString();
};

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

  const totalEnLetras = numberToWordsGs(totalGs) + " guaranies";

  const getPaymentCondition = (method: string) => {
    if (method === "cash" || method === "card" || method === "transfer") return "CONTADO";
    if (method === "credit") return "CREDITO";
    return "CONTADO";
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
    if (!dateStr) return '-';
    const d = new Date(dateStr);
    return d.toLocaleDateString('es-PY', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  const gravada10 = Math.round(sale.subtotal * 0.10);
  const totalIva = gravada10;

  const itemsHTML = sale.items.map((item) => `
    <tr>
      <td style="padding: 4px 6px; text-align: center; font-size: 10pt; border: 1px solid #000;">${item.quantity}</td>
      <td style="padding: 4px 6px; text-align: left; font-size: 10pt; border: 1px solid #000;">${item.productName}</td>
      <td style="padding: 4px 6px; text-align: right; font-size: 10pt; border: 1px solid #000;">Gs. ${formatGs(item.unitPrice)}</td>
      <td style="padding: 4px 6px; text-align: right; font-size: 10pt; border: 1px solid #000;">-</td>
      <td style="padding: 4px 6px; text-align: right; font-size: 10pt; border: 1px solid #000;">Gs. ${formatGs(item.subtotal)}</td>
    </tr>
  `).join("");

  const emptyRows = 3;
  const emptyRowsHTML = Array(emptyRows).fill(`
    <tr>
      <td style="padding: 4px 6px; text-align: center; font-size: 10pt; border: 1px solid #000;">&nbsp;</td>
      <td style="padding: 4px 6px; text-align: left; font-size: 10pt; border: 1px solid #000;">&nbsp;</td>
      <td style="padding: 4px 6px; text-align: right; font-size: 10pt; border: 1px solid #000;">&nbsp;</td>
      <td style="padding: 4px 6px; text-align: right; font-size: 10pt; border: 1px solid #000;">&nbsp;</td>
      <td style="padding: 4px 6px; text-align: right; font-size: 10pt; border: 1px solid #000;">&nbsp;</td>
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
    body { font-family: Arial, Helvetica, sans-serif; font-size: 11pt; color: #000; padding: 5px; }
    .invoice-container { max-width: 850px; margin: 0 auto; }
    
    /* Header Table */
    .header-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 0;
    }
    .header-table td {
      border: 1px solid #000;
      padding: 8px;
      vertical-align: top;
    }
    .header-left {
      width: 55%;
    }
    .header-right {
      width: 45%;
    }
    
    .company-name {
      font-size: 16pt;
      font-weight: bold;
      color: #0066cc;
      margin-bottom: 5px;
    }
    .company-detail {
      font-size: 9pt;
      line-height: 1.4;
    }
    
    .timbrado-header {
      font-size: 10pt;
      font-weight: bold;
      text-align: center;
      padding: 3px;
      background: #fff;
    }
    .timbrado-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 9pt;
      margin-top: 5px;
    }
    .timbrado-table td {
      padding: 2px 4px;
      border: 1px solid #000;
    }
    .timbrado-table td:first-child {
      font-weight: bold;
      width: 45%;
    }
    
    .invoice-header-cell {
      text-align: center;
      font-size: 14pt;
      font-weight: bold;
      padding: 10px;
    }
    
    /* Client Section */
    .client-section {
      width: 100%;
      border-collapse: collapse;
      margin: 0;
    }
    .client-section td {
      border: 1px solid #000;
      padding: 5px 8px;
      font-size: 9pt;
    }
    .client-section td:first-child {
      font-weight: bold;
      width: 18%;
    }
    .invoice-date-cell {
      text-align: right;
    }
    
    /* Items Table */
    .items-table {
      width: 100%;
      border-collapse: collapse;
      margin: 0;
    }
    .items-table th {
      font-size: 9pt;
      font-weight: bold;
      padding: 5px 4px;
      border: 1px solid #000;
      text-align: center;
      background: #fff;
    }
    .items-table td {
      border: 1px solid #000;
      padding: 4px;
    }
    .items-table th:nth-child(1) { width: 8%; }
    .items-table th:nth-child(2) { width: 42%; text-align: left; }
    .items-table th:nth-child(3) { width: 18%; }
    .items-table th:nth-child(4) { width: 14%; }
    .items-table th:nth-child(5) { width: 18%; }
    
    /* Totals Section */
    .totals-table {
      width: 100%;
      border-collapse: collapse;
      margin: 0;
    }
    .totals-table td {
      border: 1px solid #000;
      padding: 5px 8px;
      font-size: 9pt;
    }
    .totals-table td:first-child {
      font-weight: bold;
      width: 60%;
      text-align: right;
    }
    .totals-table td:last-child {
      width: 40%;
      text-align: right;
      font-weight: bold;
    }
    
    .son-row td {
      height: 35px;
      vertical-align: top;
    }
    
    /* Final Total Box */
    .final-total-section {
      width: 100%;
      border-collapse: collapse;
      margin: 0;
    }
    .final-total-section td {
      border: 1px solid #000;
      padding: 6px 8px;
      font-size: 9pt;
    }
    .final-total-section td:first-child {
      font-weight: bold;
      width: 55%;
      text-align: right;
    }
    .final-total-section td:last-child {
      width: 45%;
      text-align: right;
      font-weight: bold;
    }
    .total-final-row td {
      font-size: 12pt;
      font-weight: bold;
      background: #fff;
    }
    
    /* Footer copies */
    .footer-copies {
      margin-top: 15px;
      font-size: 7pt;
      text-align: center;
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
    <table class="header-table">
      <tr>
        <td class="header-left">
          <div class="company-name">${settings.businessName}</div>
          <div class="company-detail">
            RUC: ${settings.ruc}<br>
            ${settings.address}${settings.city ? '<br>' + settings.city : ''}<br>
            Tel: ${settings.phone}${settings.email ? ' | Email: ' + settings.email : ''}
          </div>
        </td>
        <td class="header-right">
          <div class="timbrado-header">TIMBRADO N</div>
          <table class="timbrado-table">
            <tr>
              <td>Nro. Timbrado:</td>
              <td>${settings.timbradoNumber || '-'}</td>
            </tr>
            <tr>
              <td>Fecha Inicio Vigencia:</td>
              <td>${formatDate(settings.timbradoFrom)}</td>
            </tr>
            <tr>
              <td>Fecha Fin Vigencia:</td>
              <td>${formatDate(settings.timbradoTo)}</td>
            </tr>
            <tr>
              <td>RUC:</td>
              <td>${settings.ruc}</td>
            </tr>
          </table>
          <div class="invoice-header-cell">FACTURA</div>
          <div style="text-align: center; font-size: 11pt; font-weight: bold;">${formatInvoiceNumber()}</div>
        </td>
      </tr>
    </table>
    
    <!-- Client -->
    <table class="client-section">
      <tr>
        <td>Fecha de Emision:</td>
        <td style="width: 25%;">${formattedDate}</td>
        <td style="width: 57%;">&nbsp;</td>
      </tr>
      <tr>
        <td>Razon Social:</td>
        <td colspan="2">${clientName}</td>
      </tr>
      <tr>
        <td>RUC:</td>
        <td>${clientIdentifier || 'Consumidor Final'}</td>
        <td>Condicion de Venta: <strong>${getPaymentCondition(sale.paymentMethod)}</strong></td>
      </tr>
      <tr>
        <td>Direccion:</td>
        <td colspan="2">${clientAddress || '-'}</td>
      </tr>
      <tr>
        <td>Telefono:</td>
        <td colspan="2">${clientPhone || '-'}</td>
      </tr>
    </table>
    
    <!-- Items -->
    <table class="items-table">
      <thead>
        <tr>
          <th>Cant</th>
          <th style="text-align: left;">Descripcion</th>
          <th>Precio Unit.</th>
          <th>Exenta</th>
          <th>Gravadas 10%</th>
        </tr>
      </thead>
      <tbody>
        ${itemsHTML}
        ${emptyRowsHTML}
      </tbody>
    </table>
    
    <!-- Subtotals -->
    <table class="totals-table">
      <tr>
        <td>SUB TOTAL:</td>
        <td>Gs. ${formatGs(gravada10)}</td>
      </tr>
      <tr class="son-row">
        <td>Son Gs: ${formatGs(sale.total)} (${totalEnLetras})</td>
        <td>&nbsp;</td>
      </tr>
    </table>
    
    <!-- Final Total -->
    <table class="final-total-section">
      <tr>
        <td>IVA 10%:</td>
        <td>Gs. ${formatGs(totalIva)}</td>
      </tr>
      <tr class="total-final-row">
        <td>TOTAL A PAGAR:</td>
        <td>Gs. ${formatGs(sale.total)}</td>
      </tr>
    </table>
    
    <!-- Footer copies -->
    <div class="footer-copies">
      <span>Original: Cliente</span>&nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp;<span>Duplicado: Archivo Tributario</span>
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
