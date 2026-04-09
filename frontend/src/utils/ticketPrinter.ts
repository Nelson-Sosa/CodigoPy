import { settingsService } from "../services/api";
import { format } from "date-fns";

interface TicketItem {
  productName: string;
  quantity: number;
  subtotal: number;
}

interface TicketData {
  invoiceNumber: string;
  clientName: string;
  items: TicketItem[];
  subtotal: number;
  discount: number;
  tax?: number;
  total: number;
  paymentMethod: string;
  createdAt: string;
}

export const printTicket = async (sale: TicketData) => {
  const printWindow = window.open("", "_blank", "width=300,height=600");
  if (!printWindow) {
    alert("Por favor permite ventanas emergentes para imprimir");
    return;
  }

  let businessName = "MI NEGOCIO";
  let address = "";
  let phone = "";
  let ruc = "";
  let footerMessage = "¡Gracias por su compra!";
  let exchangeRate = 6600;

  try {
    const res = await settingsService.get();
    businessName = res.data?.businessName || "MI NEGOCIO";
    address = res.data?.address || "";
    phone = res.data?.phone || "";
    ruc = res.data?.ruc || "";
    footerMessage = res.data?.footerMessage || "¡Gracias por su compra!";
    exchangeRate = res.data?.exchangeRate || 6600;
  } catch (e) {
    console.log("Using default settings");
  }

  const formatGs = (price: number) => {
    return (price * exchangeRate).toLocaleString("es-PY");
  };

  const getPaymentLabel = (method: string) => {
    switch (method) {
      case "cash": return "EFECTIVO";
      case "card": return "TARJETA";
      case "transfer": return "TRANSFERENCIA";
      case "credit": return "CREDITO";
      default: return method.toUpperCase();
    }
  };

  const printContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Ticket - ${sale.invoiceNumber}</title>
        <style>
          @page {
            size: 80mm auto;
            margin: 0;
          }
          body {
            margin: 0;
            padding: 10px;
            font-family: 'Courier New', monospace;
            font-size: 12px;
            width: 80mm;
          }
          * {
            font-family: 'Courier New', monospace;
            font-size: 12px;
          }
          .center { text-align: center; }
          .bold { font-weight: bold; }
          .line { border-top: 1px dashed #000; border-bottom: 1px dashed #000; padding: 5px 0; }
          .total { font-size: 16px; font-weight: bold; text-align: center; padding: 5px 0; border-top: 1px dashed #000; border-bottom: 1px dashed #000; }
          table { width: 100%; }
          td { vertical-align: top; }
          .right { text-align: right; }
        </style>
      </head>
      <body>
        <div class="center">
          <div class="bold" style="font-size: 14px;">${businessName}</div>
          ${address ? `<div>${address}</div>` : ""}
          ${phone ? `<div>Tel: ${phone}</div>` : ""}
          ${ruc ? `<div>RUC: ${ruc}</div>` : ""}
        </div>
        
        <div class="line">
          <div class="bold center">TICKET DE VENTA</div>
          <div class="center">N° ${sale.invoiceNumber}</div>
          <div class="center">${format(new Date(sale.createdAt), "dd/MM/yyyy HH:mm")}</div>
          <div>Cliente: ${sale.clientName || "Consumidor Final"}</div>
        </div>
        
        <table>
          <tr><td><b>PRODUCTO</b></td><td class="right"><b>IMPORTE</b></td></tr>
          ${sale.items.map(item => `
            <tr>
              <td>${item.quantity} x ${item.productName}</td>
              <td class="right">$${item.subtotal.toFixed(2)}</td>
            </tr>
          `).join("")}
        </table>
        
        <div style="margin-top: 5px;">
          <div><span>Subtotal:</span><span class="right">$${sale.subtotal.toFixed(2)}</span></div>
          ${sale.discount > 0 ? `<div><span>Descuento:</span><span class="right">-$${sale.discount.toFixed(2)}</span></div>` : ""}
          ${(sale.tax || 0) > 0 ? `<div><span>IVA:</span><span class="right">$${(sale.tax || 0).toFixed(2)}</span></div>` : ""}
        </div>
        
        <div class="total">
          TOTAL: $${sale.total.toFixed(2)}
          <div style="font-size: 10px; font-weight: normal;">Gs. ${formatGs(sale.total)}</div>
        </div>
        
        <div style="margin-top: 5px;">
          <div>Pago: ${getPaymentLabel(sale.paymentMethod)}</div>
        </div>
        
        <div class="center" style="border-top: 1px dashed #000; padding-top: 8px; margin-top: 8px;">
          <div>${footerMessage}</div>
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
  }, 250);
};
