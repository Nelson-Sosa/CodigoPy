# 🛒 CodigoPy POS - Sistema de Gestión Comercial y Punto de Venta

![React](https://img.shields.io/badge/React_18-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![Express](https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=express&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB_Atlas-47A248?style=for-the-badge&logo=mongodb&logoColor=white)
![Firebase](https://img.shields.io/badge/Firebase_Hosting-FFCA28?style=for-the-badge&logo=firebase&logoColor=black)
![Render](https://img.shields.io/badge/Render-46E3B7?style=for-the-badge&logo=render&logoColor=white)

> **Solución integral de punto de venta (POS), control de stock y administración de caja** desarrollada para optimizar las operaciones de comercios y pequeñas/medianas empresas (PyMEs), con soporte para moneda dual (**USD / Guaraníes Gs.**), emisión de tickets térmicos y control de márgenes de ganancia.

---

## 🌐 Demo en Vivo & Acceso de Prueba

El sistema se encuentra desplegado y 100% operativo en la nube para evaluación técnica y demostración comercial:

| Servicio | Enlace | Estado |
| :--- | :--- | :--- |
| **Frontend Web (App)** | [https://codigopy-pos.web.app](https://codigopy-pos.web.app/) | ![Online](https://img.shields.io/badge/Estado-Online-brightgreen) |
| **API Backend** | [https://sistemapos-cs2d.onrender.com](https://sistemapos-cs2d.onrender.com/) | ![Active](https://img.shields.io/badge/API-Active-blue) |
| **Health Check** | [Ver Estado del Servidor](https://sistemapos-cs2d.onrender.com/health) | `{"status":"ok","database":"connected"}` |

### 🔑 Credenciales de Demostración (Acceso Total para Reclutadores y Clientes)

Para explorar todas las funcionalidades administrativas, reportes y configuraciones del sistema:

```yaml
Rol: Administrador (Admin)
Email: admin@codigopy.com
Contraseña: Admin2025!
```

> 💡 **Nota de prueba:** La base de datos es de demostración en tiempo real. Si el servidor backend en Render lleva unos minutos inactivo, la primera petición puede tardar unos segundos en despertar (instancia free-tier).

---

## 💼 ¿Por qué CodigoPy POS? (Valor para Negocios)

CodigoPy POS resuelve los problemas diarios más críticos de un comercio minorista o distribuidor:

1. **Evita pérdidas en caja:** Flujo estricto de apertura, arqueo y cierre diario con previsualización de ventas reales en efectivo, tarjetas y transferencias.
2. **Protege tu margen de ganancia:** Alerta y bloquea ventas si el precio aplicado cae por debajo del margen mínimo de rentabilidad configurado (15%).
3. **Control real del stock:** Kardex de movimientos (entradas, salidas, ajustes de inventario) con alerta de stock mínimo para evitar roturas.
4. **Moneda Dual (Gs. / USD):** Diseñado especialmente para la dinámica comercial de Paraguay y la región con cotización diaria configurable.
5. **Tickets Profesionales:** Generación de recibos listos para impresión térmica de 80mm / 58mm.

---

## 🚀 Módulos y Funcionalidades

### 💰 1. Control y Gestión de Caja
- Apertura diaria con registro de saldo inicial.
- Arqueo y cierre de caja con cálculo automático de sobrante/faltante.
- Historial de cierres de caja con detalle por medio de pago.
- Soporte para reapertura de caja y cierres de seguridad.

### 🛒 2. Punto de Venta (POS) Ágil
- Búsqueda instantánea de productos por código de barras, SKU o nombre.
- Carrito de compras reactivo con cálculo de subtotales, IVA y descuentos.
- Múltiples medios de pago: **Efectivo, Tarjeta de Débito/Crédito, Transferencia Bancaria y Crédito**.
- Indicador visual del margen de rentabilidad (%) en tiempo real en cada ítem.
- Cancelación y anulación de ventas con restitución automática de stock.

### 📦 3. Inventario y Catálogo de Productos
- Catálogo de productos con categorías, códigos, precios de costo y venta.
- Gestión de stock actual, stock mínimo y punto de reposición.
- Historial completo de movimientos de almacén con motivos de ajuste.
- Clasificación visual por categorías y etiquetas de colores.

### 👥 4. Clientes y Proveedores
- Libreta de clientes con RUC / Cédula, teléfono y dirección.
- Historial de compras por cliente.
- Directorio de proveedores para compras y reposición de mercaderías.

### 📈 5. Dashboard y Reportes Gerenciales
- Métricas clave en tiempo real: ventas del día, ticket promedio y ganancia estimada.
- Reporte de productos más vendidos y productos con bajo stock.
- Valorización total del inventario (precio costo vs. precio venta).
- Exportación de reportes a formato CSV / Excel.

### 🔒 6. Seguridad y Control de Acceso
- Autenticación segura mediante JSON Web Tokens (JWT) almacenados en sesión.
- Control de acceso basado en roles (**RBAC**):
  - **Administrador:** Acceso completo a finanzas, costos, reportes, usuarios y ajustes del sistema.
  - **Vendedor:** Enfocado exclusivamente en ventas rápidas, consulta de catálogo y apertura/cierre de su caja.

---

## 🏗️ Arquitectura Técnica

```
                         ┌────────────────────────────────────────┐
                         │           Cliente / Navegador          │
                         └───────────────────┬────────────────────┘
                                             │ HTTPS
                                             ▼
                         ┌────────────────────────────────────────┐
                         │   Frontend (SPA en React 18 + Vite)    │
                         │       Firebase Hosting (CDN Global)    │
                         └───────────────────┬────────────────────┘
                                             │ REST API / JSON + Bearer JWT
                                             ▼
                         ┌────────────────────────────────────────┐
                         │   Backend (Node.js 20+ / Express)      │
                         │       Desplegado en Render             │
                         └───────────────────┬────────────────────┘
                                             │ Mongoose Driver (TLS/SSL)
                                             ▼
                         ┌────────────────────────────────────────┐
                         │      Base de Datos Cloud               │
                         │         MongoDB Atlas                  │
                         └────────────────────────────────────────┘
```

---

## 🛠️ Stack Tecnológico Detallado

### Frontend
- **Framework:** React 18 con TypeScript
- **Tooling:** Vite 7 (Hot Module Replacement de ultra alta velocidad)
- **Estilos:** Tailwind CSS (diseño responsive móvil, tablet y escritorio)
- **Enrutamiento:** React Router DOM v6 con guardias de autenticación
- **Cliente HTTP:** Axios con interceptores para inyección de token JWT y manejo de errores 401
- **Iconografía:** Lucide React

### Backend & Base de Datos
- **Entorno:** Node.js v20+ / Express 4.x
- **Base de Datos:** MongoDB Atlas (Cluster Cloud)
- **ODM:** Mongoose 8.x con esquemas fuertemente tipados
- **Seguridad:** `bcryptjs` para hashing unidireccional de contraseñas + `jsonwebtoken` (JWT)
- **CORS:** Políticas configuradas para dominios autorizados de producción y desarrollo

### Infraestructura & Despliegue
- **Frontend Hosting:** Firebase Hosting (Google Cloud CDN)
- **Backend Hosting:** Render Web Service (Node.js)
- **Base de Datos:** MongoDB Atlas Replica Set

---

## 💻 Instalación y Ejecución Local

Si deseas clonar el proyecto y levantarlo en tu entorno local:

### 1. Clonar el repositorio
```bash
git clone https://github.com/Nelson-Sosa/CodigoPy.git
cd CodigoPy
```

### 2. Configurar el Backend (`/server`)
```bash
cd server
npm install
```

Crea un archivo `.env` dentro de `server/`:
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/codigopy_pos
JWT_SECRET=tu_secreto_super_seguro_de_desarrollo
NODE_ENV=development
```

Inicializa datos de prueba (opcional):
```bash
npm run seed
```

Inicia el servidor en modo desarrollo:
```bash
npm run dev
```

### 3. Configurar el Frontend (`/frontend`)
En otra terminal:
```bash
cd frontend
npm install
```

Crea un archivo `.env.local` dentro de `frontend/`:
```env
VITE_API_URL=http://localhost:5000
```

Ejecuta el servidor de desarrollo Vite:
```bash
npm run dev
```
Accede en tu navegador a `http://localhost:5173`.

---

## 👨‍💻 Sobre el Desarrollador

**Nelson Sosa**  
*Desarrollador Full Stack | Especialista en soluciones comerciales y software empresarial.*

- **Portafolio / GitHub:** [@Nelson-Sosa](https://github.com/Nelson-Sosa)
- **LinkedIn:** [Nelson Sosa en LinkedIn](https://www.linkedin.com/in/nelson-sosa-b9b901398/)
- **Contacto comercial:** ¿Te interesa implementar este sistema en tu negocio o requieres personalizaciones? Contáctame a través de LinkedIn.

---

⭐ **Si este proyecto te resulta interesante o útil, no dudes en dejar una estrella en el repositorio.**
