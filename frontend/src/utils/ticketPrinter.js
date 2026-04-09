import { settingsService } from "../services/api";
import { format } from "date-fns";
export const printTicket = async (sale) => {
    const printWindow = window.open("", "_blank", "width=350,height=700");
    if (!printWindow) {
        alert("Por favor permite ventanas emergentes para imprimir");
        return;
    }
    let businessName = "MI NEGOCIO";
    let address = "";
    let phone = "";
    let ruc = "";
    let timbrado = "";
    let inicioVigencia = "";
    let finVigencia = "";
    let footerMessage = "¡Gracias por su compra!";
    let exchangeRate = 6600;
    try {
        const res = await settingsService.get();
        businessName = res.data?.businessName || "MI NEGOCIO";
        address = res.data?.address || "";
        phone = res.data?.phone || "";
        ruc = res.data?.ruc || "";
        timbrado = res.data?.timbrado || "";
        inicioVigencia = res.data?.inicioVigencia || "";
        finVigencia = res.data?.finVigencia || "";
        footerMessage = res.data?.footerMessage || "¡Gracias por su compra!";
        exchangeRate = res.data?.exchangeRate || 6600;
    }
    catch (e) {
        console.log("Using default settings");
    }
    const formatGs = (price) => {
        return (price * exchangeRate).toLocaleString("es-PY");
    };
    const getPaymentLabel = (method) => {
        switch (method) {
            case "cash": return "EFECTIVO";
            case "card": return "TARJETA DÉBITO/CRÉDITO";
            case "transfer": return "TRANSFERENCIA BANCARIA";
            case "credit": return "CRÉDITO";
            default: return method.toUpperCase();
        }
    };
    const printContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Comprobante - ${sale.invoiceNumber}</title>
        <style>
          @page {
            size: 80mm auto;
            margin: 0;
          }
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          body {
            font-family: 'Courier New', monospace;
            font-size: 11px;
            width: 80mm;
            background: #fff;
          }
          .container {
            padding: 8px;
          }
          .header {
            text-align: center;
            border-bottom: 2px solid #000;
            padding-bottom: 8px;
            margin-bottom: 8px;
          }
          .business-name {
            font-size: 16px;
            font-weight: bold;
            text-transform: uppercase;
            margin-bottom: 4px;
            letter-spacing: 1px;
          }
          .info {
            font-size: 10px;
            color: #333;
            line-height: 1.4;
          }
          .timbrado-box {
            background: #f5f5f5;
            border: 1px solid #ddd;
            padding: 4px;
            margin: 6px 0;
            font-size: 9px;
            text-align: center;
          }
          .timbrado-box div {
            margin: 2px 0;
          }
          .section {
            border: 1px solid #ddd;
            padding: 6px;
            margin: 6px 0;
            font-size: 10px;
          }
          .section-title {
            font-weight: bold;
            background: #000;
            color: #fff;
            padding: 3px 6px;
            margin: -6px -6px 6px -6px;
            font-size: 10px;
            text-transform: uppercase;
          }
          .row {
            display: flex;
            justify-content: space-between;
            margin: 2px 0;
          }
          .items-header {
            display: flex;
            background: #eee;
            padding: 3px;
            font-weight: bold;
            font-size: 9px;
            margin-top: 4px;
          }
          .item {
            display: flex;
            padding: 3px 0;
            border-bottom: 1px dotted #ccc;
            font-size: 10px;
          }
          .item-qty {
            width: 20%;
          }
          .item-desc {
            width: 45%;
            word-break: break-word;
          }
          .item-price {
            width: 35%;
            text-align: right;
          }
          .totals {
            margin-top: 8px;
            border-top: 1px solid #000;
            padding-top: 6px;
          }
          .total-row {
            display: flex;
            justify-content: space-between;
            margin: 3px 0;
          }
          .total-final {
            font-size: 14px;
            font-weight: bold;
            background: #000;
            color: #fff;
            padding: 6px;
            text-align: center;
            margin-top: 6px;
          }
          .payment-info {
            background: #f9f9f9;
            padding: 6px;
            margin-top: 8px;
            border: 1px solid #ddd;
            text-align: center;
          }
          .footer {
            text-align: center;
            margin-top: 10px;
            padding-top: 8px;
            border-top: 1px dashed #000;
          }
          .footer-message {
            font-style: italic;
            font-size: 10px;
            margin-bottom: 4px;
          }
          .cuts {
            border-top: 1px dashed #000;
            margin-top: 8px;
            padding-top: 4px;
            font-size: 8px;
            color: #666;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <!-- HEADER -->
          <div class="header">
            <div class="business-name">${businessName}</div>
            <div class="info">
              ${address ? `<div>${address}</div>` : ""}
              ${phone ? `<div>Tel: ${phone}</div>` : ""}
              ${ruc ? `<div>RUC/CI: ${ruc}</div>` : ""}
            </div>
            
            ${timbrado ? `
            <div class="timbrado-box">
              <div><strong>TIMBRADO N°:</strong> ${timbrado}</div>
              ${inicioVigencia && finVigencia ? `<div>Validez: ${inicioVigencia} al ${finVigencia}</div>` : ""}
            </div>
            ` : ""}
          </div>

          <!-- DATOS DE LA FACTURA -->
          <div class="section">
            <div class="section-title">Datos de la Factura</div>
            <div class="row">
              <span><strong>Factura N°:</strong></span>
              <span>${sale.invoiceNumber}</span>
            </div>
            <div class="row">
              <span><strong>Fecha:</strong></span>
              <span>${format(new Date(sale.createdAt), "dd/MM/yyyy")}</span>
            </div>
            <div class="row">
              <span><strong>Hora:</strong></span>
              <span>${format(new Date(sale.createdAt), "HH:mm:ss")}</span>
            </div>
          </div>

          <!-- DATOS DEL CLIENTE -->
          <div class="section">
            <div class="section-title">Cliente</div>
            <div class="row">
              <span><strong>Nombre:</strong></span>
              <span>${sale.clientName || "CONSUMIDOR FINAL"}${sale.clientRuc ? " - " + sale.clientRuc : ""}</span>
            </div>
          </div>

          <!-- DETALLE DE PRODUCTOS -->
          <div class="section">
            <div class="section-title">Detalle</div>
            <div class="items-header">
              <div class="item-qty">Cant.</div>
              <div class="item-desc">Descripción</div>
              <div class="item-price">Importe</div>
            </div>
            ${sale.items.map(item => `
              <div class="item">
                <div class="item-qty">${item.quantity}</div>
                <div class="item-desc">${item.productName}</div>
                <div class="item-price">$${item.subtotal.toFixed(2)}</div>
              </div>
            `).join("")}
            
            <div class="totals">
              <div class="total-row">
                <span>Subtotal:</span>
                <span>$${sale.subtotal.toFixed(2)}</span>
              </div>
              ${sale.discount > 0 ? `
              <div class="total-row">
                <span>Descuento:</span>
                <span>-$${sale.discount.toFixed(2)}</span>
              </div>
              ` : ""}
              ${(sale.tax || 0) > 0 ? `
              <div class="total-row">
                <span>IVA (10%):</span>
                <span>$${(sale.tax || 0).toFixed(2)}</span>
              </div>
              ` : ""}
              
              <div class="total-final">
                TOTAL: $${sale.total.toFixed(2)}
                <div style="font-size: 10px; font-weight: normal; margin-top: 2px;">
                  Gs. ${formatGs(sale.total)}
                </div>
              </div>
            </div>
          </div>

          <!-- FORMA DE PAGO -->
          <div class="payment-info">
            <strong>FORMA DE PAGO:</strong><br>
            ${getPaymentLabel(sale.paymentMethod)}
          </div>

          <!-- FOOTER -->
          <div class="footer">
            <div class="footer-message">"${footerMessage}"</div>
          </div>

          <div class="cuts">
            ────────────────────────────────────
          </div>
        </div>
      </body>
    </html>
  `;
    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
        printWindow.print();
        printWindow.close();
    }, 300);
};
