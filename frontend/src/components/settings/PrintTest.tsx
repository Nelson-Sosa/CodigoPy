import { useState } from "react";
import { settingsService } from "../services/api";
import { Printer, CheckCircle, AlertCircle } from "lucide-react";

interface PrintTestProps {
  ticketWidth?: "58" | "80" | "3";
}

const PrintTest = ({ ticketWidth = "80" }: PrintTestProps) => {
  const [printing, setPrinting] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");

  const handlePrintTest = async () => {
    setPrinting(true);
    setStatus("idle");

    let businessName = "MI NEGOCIO";
    let address = "";
    let phone = "";
    let ruc = "";
    let footerMessage = "¡Gracias por su compra!";

    try {
      const res = await settingsService.get();
      businessName = res.data?.businessName || "MI NEGOCIO";
      address = res.data?.address || "";
      phone = res.data?.phone || "";
      ruc = res.data?.ruc || "";
      footerMessage = res.data?.footerMessage || "¡Gracias por su compra!";
    } catch (e) {
      // Usar valores por defecto
    }

    const width = ticketWidth === "58" ? "58mm" : ticketWidth === "3" ? "3in" : "80mm";

    const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Test de Impresión - CodigoPy</title>
          <style>
            @page {
              size: ${width} auto;
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
              width: ${width};
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
              font-size: 14px;
              font-weight: bold;
              text-transform: uppercase;
              margin-bottom: 4px;
            }
            .info {
              font-size: 10px;
              color: #333;
              line-height: 1.4;
            }
            .section {
              border: 1px dashed #ccc;
              padding: 6px;
              margin: 6px 0;
              font-size: 10px;
            }
            .section-title {
              font-weight: bold;
              text-transform: uppercase;
              margin-bottom: 4px;
              padding-bottom: 2px;
              border-bottom: 1px solid #000;
            }
            .row {
              display: flex;
              justify-content: space-between;
              margin: 2px 0;
            }
            .item {
              display: flex;
              padding: 3px 0;
              border-bottom: 1px dotted #ccc;
              font-size: 10px;
            }
            .item-qty { width: 20%; }
            .item-desc { width: 45%; word-break: break-word; }
            .item-price { width: 35%; text-align: right; }
            .totals { margin-top: 8px; border-top: 1px solid #000; padding-top: 6px; }
            .total-row { display: flex; justify-content: space-between; margin: 3px 0; }
            .total-final {
              font-size: 14px;
              font-weight: bold;
              background: #000;
              color: #fff;
              padding: 6px;
              text-align: center;
              margin-top: 6px;
            }
            .test-badge {
              background: #ff0000;
              color: #fff;
              padding: 4px 8px;
              text-align: center;
              font-size: 12px;
              font-weight: bold;
              margin-bottom: 8px;
            }
            .footer {
              text-align: center;
              margin-top: 10px;
              padding-top: 8px;
              border-top: 1px dashed #000;
              font-style: italic;
              font-size: 10px;
            }
            .cuts {
              border-top: 1px dashed #000;
              margin-top: 8px;
              padding-top: 4px;
              font-size: 8px;
              color: #666;
              text-align: center;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="test-badge">TICKET DE PRUEBA</div>
            
            <div class="header">
              <div class="business-name">${businessName}</div>
              <div class="info">
                ${address ? `<div>${address}</div>` : ""}
                ${phone ? `<div>Tel: ${phone}</div>` : ""}
                ${ruc ? `<div>RUC: ${ruc}</div>` : ""}
              </div>
            </div>

            <div class="section">
              <div class="section-title">Datos de Prueba</div>
              <div class="row">
                <span><strong>Factura N°:</strong></span>
                <span>TEST-000001</span>
              </div>
              <div class="row">
                <span><strong>Fecha:</strong></span>
                <span>${new Date().toLocaleDateString("es-PY")}</span>
              </div>
              <div class="row">
                <span><strong>Hora:</strong></span>
                <span>${new Date().toLocaleTimeString("es-PY")}</span>
              </div>
            </div>

            <div class="section">
              <div class="section-title">Cliente de Prueba</div>
              <div class="row">
                <span><strong>Nombre:</strong></span>
                <span>CONSUMIDOR FINAL</span>
              </div>
            </div>

            <div class="section">
              <div class="section-title">Detalle</div>
              <div class="item">
                <div class="item-qty">1</div>
                <div class="item-desc">Producto de Prueba A</div>
                <div class="item-price">$10.00</div>
              </div>
              <div class="item">
                <div class="item-qty">2</div>
                <div class="item-desc">Producto de Prueba B</div>
                <div class="item-price">$20.00</div>
              </div>
              <div class="item">
                <div class="item-qty">1</div>
                <div class="item-desc">Producto de Prueba C</div>
                <div class="item-price">$15.00</div>
              </div>
              
              <div class="totals">
                <div class="total-row">
                  <span>Subtotal:</span>
                  <span>$45.00</span>
                </div>
                <div class="total-row">
                  <span>IVA (10%):</span>
                  <span>$4.50</span>
                </div>
                <div class="total-final">
                  TOTAL: $49.50
                </div>
              </div>
            </div>

            <div class="section" style="background: #f9f9f9; text-align: center;">
              <strong>FORMA DE PAGO:</strong><br>
              EFECTIVO
            </div>

            <div class="footer">
              "${footerMessage}"
            </div>

            <div class="cuts">
              ────────────────────────────────────
            </div>
          </div>
        </body>
      </html>
    `;

    try {
      const printWindow = window.open("", "_blank", "width=350,height=700");
      if (!printWindow) {
        setStatus("error");
        alert("Por favor permite ventanas emergentes para imprimir");
        setPrinting(false);
        return;
      }

      printWindow.document.write(printContent);
      printWindow.document.close();
      printWindow.focus();

      setTimeout(() => {
        printWindow.print();
        printWindow.close();
        setStatus("success");
        setPrinting(false);
        setTimeout(() => setStatus("idle"), 3000);
      }, 300);
    } catch (error) {
      setStatus("error");
      setPrinting(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
        <Printer className="text-blue-500" size={20} />
        Configuración de Impresora
      </h2>

      <div className="space-y-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-800 font-medium mb-2">ℹ️ Cómo configurar tu impresora térmica:</p>
          <ol className="text-xs text-blue-700 space-y-1 list-decimal list-inside">
            <li>Abre <strong>Configuración de Windows</strong> (Windows + I)</li>
            <li>Ve a <strong>Dispositivos → Impresoras y escáneres</strong></li>
            <li>Selecciona tu impresora térmica y haz clic en <strong>"Administrar"</strong></li>
            <li>Haz clic en <strong>"Establecer como predeterminada"</strong></li>
            <li>Verifica que el驱动 esté instalado correctamente</li>
          </ol>
        </div>

        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <p className="text-sm text-gray-600 mb-2">
            <strong>Nota:</strong> El sistema usará automáticamente tu <strong>impresora predeterminada de Windows</strong>.
            Asegúrate de que la impresora térmica esté configurada como predeterminada.
          </p>
          <p className="text-xs text-gray-500">
            Formato del ticket: <strong>{ticketWidth === "58" ? "58mm" : ticketWidth === "3" ? "3 pulgadas" : "80mm"}</strong>
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handlePrintTest}
            disabled={printing}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition ${
              printing
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : status === "success"
                ? "bg-green-500 text-white hover:bg-green-600"
                : status === "error"
                ? "bg-red-500 text-white hover:bg-red-600"
                : "bg-blue-600 text-white hover:bg-blue-700"
            }`}
          >
            {printing ? (
              <>
                <span className="animate-spin">⟳</span>
                Imprimiendo...
              </>
            ) : status === "success" ? (
              <>
                <CheckCircle size={18} />
                ¡Impreso exitosamente!
              </>
            ) : status === "error" ? (
              <>
                <AlertCircle size={18} />
                Error al imprimir
              </>
            ) : (
              <>
                <Printer size={18} />
                Imprimir Ticket de Prueba
              </>
            )}
          </button>
        </div>

        {status === "success" && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
            <p className="text-sm text-green-700">
              ✅ ¡El ticket de prueba se envió a la impresora! Si no salió纸张, verifica:
            </p>
            <ul className="text-xs text-green-600 mt-1 space-y-1 list-disc list-inside">
              <li>Que la impresora esté encendida y conectada</li>
              <li>Que tenga papel</li>
              <li>Que sea la impresora predeterminada</li>
            </ul>
          </div>
        )}

        {status === "error" && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="text-sm text-red-700">
              ❌ No se pudo abrir la ventana de impresión. Verifica:
            </p>
            <ul className="text-xs text-red-600 mt-1 space-y-1 list-disc list-inside">
              <li>Permitir ventanas emergentes en el navegador</li>
              <li>Navegador compatible (Chrome, Firefox, Edge)</li>
              <li>Impresora conectada y con papel</li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default PrintTest;