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
  const formattedTime = date.toLocaleTimeString('es-PY', { hour: '2-digit', minute: '2-digit' });

  const taxAmount = sale.subtotal * (settings.taxRate / 100);
  const exchangeRate = 6600;

  const formatGs = (price: number) => {
    return (price * exchangeRate).toLocaleString("es-PY");
  };

  const getPaymentLabel = (method: string) => {
    const labels: Record<string, string> = {
      cash: "EFECTIVO",
      card: "TARJETA DÉBITO/CRÉDITO",
      transfer: "TRANSFERENCIA BANCARIA",
      credit: "CRÉDITO",
    };
    return labels[method] || method;
  };

  const getPaymentCondition = (method: string) => {
    if (method === "cash") return "AL CONTADO";
    if (method === "credit") return "A CRÉDITO";
    return "";
  };

  const clientName = sale.client?.name || sale.clientName || "CONSUMIDOR FINAL";
  const clientIdentifier = sale.client?.ruc || sale.clientRuc || "";
  const clientPhone = sale.client?.phone || "";
  const clientAddress = sale.client?.address || "";

  const itemsHTML = sale.items.map((item, index) => `
    <tr>
      <td style="padding: 6px 8px; border-bottom: 1px solid #e5e7eb; text-align: center; font-size: 10px;">${index + 1}</td>
      <td style="padding: 6px 8px; border-bottom: 1px solid #e5e7eb; font-size: 11px;">${item.productName}</td>
      <td style="padding: 6px 8px; border-bottom: 1px solid #e5e7eb; text-align: center; font-size: 10px;">${item.quantity}</td>
      <td style="padding: 6px 8px; border-bottom: 1px solid #e5e7eb; text-align: right; font-size: 10px;">${settings.currencySymbol}${item.unitPrice.toFixed(2)}</td>
      <td style="padding: 6px 8px; border-bottom: 1px solid #e5e7eb; text-align: right; font-size: 10px;">${settings.currencySymbol}${item.subtotal.toFixed(2)}</td>
    </tr>
  `).join("");

  const formatInvoiceNumber = () => {
    const num = String(settings.currentInvoiceNumber || 0).padStart(7, '0');
    return `${settings.invoiceEstablishment}-${settings.invoicePoint}-${num}`;
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleDateString('es-PY', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  const timbradoSection = settings.timbradoNumber ? `
    <div style="background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); border: 2px solid #f59e0b; border-radius: 8px; padding: 12px 16px; margin-bottom: 15px; display: flex; justify-content: space-between; align-items: center;">
      <div>
        <span style="font-size: 9px; color: #92400e; text-transform: uppercase; font-weight: bold;">Timbrado N°</span>
        <p style="font-size: 16px; font-weight: bold; color: #78350f; margin: 2px 0;">${settings.timbradoNumber}</p>
      </div>
      <div style="text-align: center;">
        <span style="font-size: 9px; color: #92400e; text-transform: uppercase; font-weight: bold;">Establecimiento</span>
        <p style="font-size: 14px; font-weight: bold; color: #78350f; margin: 2px 0;">${settings.invoiceEstablishment}</p>
      </div>
      <div style="text-align: center;">
        <span style="font-size: 9px; color: #92400e; text-transform: uppercase; font-weight: bold;">Punto de Expedición</span>
        <p style="font-size: 14px; font-weight: bold; color: #78350f; margin: 2px 0;">${settings.invoicePoint}</p>
      </div>
      <div style="text-align: right;">
        <span style="font-size: 9px; color: #92400e; text-transform: uppercase; font-weight: bold;">Validez</span>
        <p style="font-size: 11px; font-weight: bold; color: #78350f; margin: 2px 0;">${formatDate(settings.timbradoFrom)} al ${formatDate(settings.timbradoTo)}</p>
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
    body { font-family: 'Helvetica Neue', Arial, sans-serif; font-size: 12px; color: #1f2937; padding: 20px; background: #fff; }
    .invoice-container { max-width: 800px; margin: 0 auto; }
    
    /* Header */
    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 20px;
      padding-bottom: 15px;
      border-bottom: 3px solid #1e40af;
    }
    .company-info h1 { 
      font-size: 24px; 
      color: #1e40af; 
      margin-bottom: 5px; 
      font-weight: 700;
      letter-spacing: -0.5px;
    }
    .company-info p { font-size: 11px; color: #6b7280; line-height: 1.6; }
    .company-info .ruc { font-weight: 600; color: #374151; }
    
    .invoice-title {
      text-align: right;
    }
    .invoice-title h2 { 
      font-size: 28px; 
      color: #1e40af; 
      font-weight: 800;
      letter-spacing: 2px;
      margin-bottom: 5px;
    }
    .invoice-title .number { 
      font-size: 14px; 
      font-weight: 700; 
      color: #1f2937;
      background: #dbeafe;
      padding: 5px 12px;
      border-radius: 4px;
      display: inline-block;
      margin-bottom: 5px;
    }
    .invoice-title .date { font-size: 11px; color: #6b7280; }
    .invoice-title .condition { 
      font-size: 12px; 
      font-weight: 700; 
      color: #059669; 
      margin-top: 5px;
    }
    
    /* Timbrado */
    .timbrado-box {
      background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
      border: 2px solid #f59e0b;
      border-radius: 8px;
      padding: 12px 16px;
      margin-bottom: 20px;
      display: flex;
      justify-content: space-between;
    }
    .timbrado-item { text-align: center; }
    .timbrado-label { font-size: 8px; color: #92400e; text-transform: uppercase; font-weight: 700; }
    .timbrado-value { font-size: 14px; font-weight: 700; color: #78350f; margin-top: 2px; }
    
    /* Client Section */
    .client-section {
      background: #f9fafb;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      padding: 15px;
      margin-bottom: 20px;
    }
    .client-title {
      font-size: 10px;
      color: #6b7280;
      text-transform: uppercase;
      font-weight: 700;
      margin-bottom: 8px;
      padding-bottom: 5px;
      border-bottom: 1px solid #e5e7eb;
    }
    .client-info {
      display: grid;
      grid-template-columns: 2fr 1fr 1fr 1.5fr;
      gap: 10px;
    }
    .client-item label { font-size: 9px; color: #9ca3af; display: block; }
    .client-item span { font-size: 12px; font-weight: 500; color: #1f2937; }
    .client-item.name span { font-weight: 700; font-size: 14px; }
    
    /* Table */
    .items-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 20px;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      overflow: hidden;
    }
    .items-table thead {
      background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%);
      color: white;
    }
    .items-table th {
      padding: 10px 8px;
      font-size: 10px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .items-table th:nth-child(1) { width: 5%; text-align: center; }
    .items-table th:nth-child(2) { width: 45%; }
    .items-table th:nth-child(3) { width: 10%; text-align: center; }
    .items-table th:nth-child(4) { width: 20%; text-align: right; }
    .items-table th:nth-child(5) { width: 20%; text-align: right; }
    .items-table tbody tr:nth-child(even) { background: #f9fafb; }
    .items-table td { padding: 8px; font-size: 11px; }
    
    /* Totals */
    .totals-section {
      display: flex;
      justify-content: flex-end;
      margin-bottom: 20px;
    }
    .totals-box {
      width: 280px;
      border: 2px solid #e5e7eb;
      border-radius: 8px;
      overflow: hidden;
    }
    .totals-row {
      display: flex;
      justify-content: space-between;
      padding: 8px 15px;
      font-size: 11px;
      border-bottom: 1px solid #e5e7eb;
    }
    .totals-row:last-child { border-bottom: none; }
    .totals-row.subtotal { background: #f9fafb; }
    .totals-row.discount { color: #dc2626; }
    .totals-row.tax { background: #eff6ff; }
    .totals-row.total { 
      background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%);
      color: white;
      font-weight: 700;
      font-size: 16px;
      padding: 12px 15px;
    }
    .totals-row.total .amount { font-size: 18px; }
    
    /* Payment */
    .payment-section {
      background: #f0fdf4;
      border: 1px solid #86efac;
      border-radius: 8px;
      padding: 12px 15px;
      margin-bottom: 20px;
      text-align: center;
    }
    .payment-section span { 
      font-size: 12px; 
      font-weight: 700; 
      color: #166534;
    }
    
    /* Footer */
    .footer {
      text-align: center;
      padding-top: 20px;
      border-top: 2px solid #e5e7eb;
    }
    .footer .thanks {
      font-size: 14px;
      font-weight: 600;
      color: #1e40af;
      margin-bottom: 5px;
    }
    .footer p {
      font-size: 10px;
      color: #9ca3af;
      margin-top: 5px;
    }
    
    @media print {
      body { padding: 0; }
      .invoice-container { max-width: 100%; }
    }
  </style>
</head>
<body>
  <div class="invoice-container">
    <!-- Header -->
    <div class="header">
      <div class="company-info">
        <h1>${settings.businessName}</h1>
        <p><span class="ruc">RUC: ${settings.ruc}</span></p>
        <p>${settings.address}${settings.city ? ', ' + settings.city : ''}</p>
        <p>Tel: ${settings.phone}${settings.email ? ' | Email: ' + settings.email : ''}</p>
      </div>
      <div class="invoice-title">
        <h2>FACTURA</h2>
        <div class="number">${formatInvoiceNumber()}</div>
        <div class="date">Fecha: ${formattedDate} | Hora: ${formattedTime}</div>
        ${sale.paymentMethod === "cash" ? '<div class="condition">PAGO AL CONTADO</div>' : ''}
      </div>
    </div>
    
    <!-- Timbrado -->
    ${timbradoSection}
    
    <!-- Client -->
    <div class="client-section">
      <div class="client-title">Datos del Cliente</div>
      <div class="client-info">
        <div class="client-item name">
          <label>Nombre / Razón Social</label>
          <span>${clientName}</span>
        </div>
        <div class="client-item">
          <label>RUC / CI</label>
          <span>${clientIdentifier || 'Consumidor Final'}</span>
        </div>
        <div class="client-item">
          <label>Teléfono</label>
          <span>${clientPhone || '-'}</span>
        </div>
        <div class="client-item">
          <label>Dirección</label>
          <span>${clientAddress || '-'}</span>
        </div>
      </div>
    </div>
    
    <!-- Items -->
    <table class="items-table">
      <thead>
        <tr>
          <th>#</th>
          <th>Descripción</th>
          <th>Cant.</th>
          <th style="text-align: right;">P. Unit.</th>
          <th style="text-align: right;">Subtotal</th>
        </tr>
      </thead>
      <tbody>
        ${itemsHTML}
      </tbody>
    </table>
    
    <!-- Totals -->
    <div class="totals-section">
      <div class="totals-box">
        <div class="totals-row subtotal">
          <span>Subtotal:</span>
          <span>${settings.currencySymbol}${sale.subtotal.toFixed(2)}</span>
        </div>
        ${sale.discount > 0 ? `
        <div class="totals-row discount">
          <span>Descuento:</span>
          <span>-${settings.currencySymbol}${sale.discount.toFixed(2)}</span>
        </div>
        ` : ""}
        ${settings.taxRate > 0 ? `
        <div class="totals-row tax">
          <span>${settings.taxName} (${settings.taxRate}%):</span>
          <span>${settings.currencySymbol}${taxAmount.toFixed(2)}</span>
        </div>
        ` : ""}
        <div class="totals-row total">
          <span>TOTAL A PAGAR:</span>
          <span class="amount">${settings.currencySymbol}${sale.total.toFixed(2)} (Gs. ${formatGs(sale.total)})</span>
        </div>
      </div>
    </div>
    
    <!-- Payment -->
    <div class="payment-section">
      <span>Forma de Pago: ${getPaymentLabel(sale.paymentMethod)} ${getPaymentCondition(sale.paymentMethod)}</span>
    </div>
    
    <!-- Footer -->
    <div class="footer">
      <div class="thanks">"${settings.footerMessage}"</div>
      <p>Este documento puede ser verificado en SET Paraguay | Sistema de Facturación Electrónica</p>
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
