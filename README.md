# 🚀 CodigoPy - Sistema de Gestión de Inventario

![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Vercel](https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)
![Render](https://img.shields.io/badge/Render-46E3B7?style=for-the-badge&logo=render&logoColor=white)

> **Sistema completo de gestión de inventario y punto de venta**, diseñado para negocios en Paraguay con soporte para moneda dual (USD/Gs.) y facturación profesional.

---

## 🎯 Características Principales

### 💰 Gestión de Caja
- Apertura y cierre de caja diario
- Control de efectivo en mano
- Verificación de cierre con previsualización
- Reapertura de caja (mismo día)
- Resumen mensual con ventas reales
- Conversión automática USD → Guaraníes (Gs. 6.600)

### 🛒 Punto de Venta
- Ventas rápidas con búsqueda de productos
- Múltiples métodos de pago: Efectivo, Tarjeta, Transferencia, Crédito
- Descuentos por porcentaje
- Generación de tickets para impresoras térmicas (80mm)
- Cancelación de ventas con reversión de stock

### 📦 Inventario
- CRUD completo de productos
- Control de stock con alertas de mínimo/máximo
- Historial de movimientos (entradas, salidas, ajustes)
- Categorización de productos con colores
- Búsqueda por SKU, nombre o descripción

### 👥 Gestión de Clientes y Proveedores
- Registro completo de clientes y proveedores
- Historial de compras por cliente
- Información de contacto y datos fiscales (RUC para Paraguay)

### 📊 Reportes y Dashboard
- Dashboard en tiempo real con métricas clave
- Reporte de ventas por período
- Productos más vendidos
- Inventario valorizado
- Productos con stock bajo
- Exportación a CSV

### 🔐 Seguridad
- Autenticación con JWT
- Roles: Administrador, Supervisor, Operador
- Rutas protegidas según rol
- Tokens con expiración automática

### 📱 Responsive Design
- Interfaz completamente responsive
- Optimizado para desktop, tablet y móvil
- Menú lateral adaptable con botón hamburguesa en móviles

---

## 🛠️ Stack Tecnológico

### Frontend
| Tecnología | Propósito |
|------------|-----------|
| React 18 | Librería principal |
| TypeScript | Tipado estático |
| Vite | Build tool |
| Tailwind CSS | Estilos |
| React Router | Navegación |
| Axios | Comunicación HTTP |
| Lucide React | Iconos |
| date-fns | Formateo de fechas |

### Backend
| Tecnología | Propósito |
|------------|-----------|
| Node.js | Runtime |
| Express | Framework REST API |
| MongoDB + Mongoose | Base de datos |
| JWT | Autenticación |
| bcryptjs | Encriptación de contraseñas |
| CORS | Seguridad |

### Despliegue
| Servicio | Uso |
|----------|-----|
| Vercel | Frontend (CDN global) |
| Render | Backend API |
| MongoDB Atlas | Base de datos en la nube |

---

## 📁 Estructura del Proyecto

```
CodigoPy/
├── frontend/                 # React + Vite
│   ├── src/
│   │   ├── components/      # Componentes reutilizables
│   │   │   ├── common/      # Componentes comunes (Price, etc.)
│   │   │   ├── layout/      # Layout principal (Sidebar, Header)
│   │   │   ├── movements/    # Formulario y tabla de movimientos
│   │   │   ├── navigation/   # Navegación
│   │   │   ├── products/     # Gestión de productos
│   │   │   ├── reports/      # Componentes de reportes
│   │   │   └── users/        # Gestión de usuarios
│   │   ├── context/          # Contextos de React (Auth)
│   │   ├── hooks/            # Hooks personalizados
│   │   ├── pages/            # Páginas de la aplicación
│   │   │   ├── Products/     # CRUD de productos
│   │   │   ├── Categories/  # Gestión de categorías
│   │   │   └── movements/    # Historial de movimientos
│   │   ├── router/           # Configuración de rutas
│   │   ├── services/         # Servicios API (Axios)
│   │   ├── types/           # Definiciones TypeScript
│   │   └── utils/           # Utilidades (formatters, ticket printer)
│   └── package.json
│
├── server/                  # Node.js + Express
│   ├── config/              # Configuración de BD
│   ├── controllers/         # Lógica de negocio
│   ├── middleware/          # Auth middleware
│   ├── models/              # Modelos Mongoose
│   ├── routes/              # Rutas de la API
│   └── index.js             # Entry point
│
└── package.json             # Scripts para ejecutar ambos
```

---

## 🚀 Despliegue en Producción

### Frontend (Vercel)
- **URL**: https://codigo-py-flax.vercel.app
- Despliegue automático desde GitHub

### Backend (Render)
- **URL**: https://codigopy-api.onrender.com
- Base de datos: MongoDB Atlas

---

## 💻 Instalación Local

```bash
# Clonar el repositorio
git clone https://github.com/Nelson-Sosa/CodigoPy.git
cd CodigoPy

# Instalar todas las dependencias
npm run install:all

# Ejecutar en desarrollo (frontend + backend)
npm run dev

# O ejecutar por separado:
npm run dev:frontend    # Frontend en http://localhost:5173
npm run dev:backend     # Backend en http://localhost:5000
```

### Variables de Entorno (Backend)

Crea un archivo `.env` en la carpeta `server/`:

```env
PORT=5000
MONGO_URI=mongodb+srv://tu_usuario:tu_password@cluster.mongodb.net/tu_db
JWT_SECRET=tu_secreto_jwt
JWT_EXPIRES_IN=7d
```

---

## 📋 Credenciales de Prueba

El sistema incluye datos de prueba precargados:

| Rol | Email | Contraseña |
|-----|-------|------------|
| Administrador | admin@codigopy.com | admin123 |
| Supervisor | supervisor@codigopy.com | super123 |
| Operador | operador@codigopy.com | oper123 |

---

## 🎨 Funcionalidades por Rol

| Funcionalidad | Admin | Supervisor | Operador |
|---------------|-------|------------|----------|
| Dashboard | ✅ | ✅ | ✅ |
| Apertura/Cierre de Caja | ✅ | ✅ | ✅ |
| Ventas | ✅ | ✅ | ✅ |
| Productos (CRUD) | ✅ | ✅ | ❌ |
| Movimientos | ✅ | ✅ | ✅ |
| Categorías | ✅ | ✅ | ❌ |
| Clientes | ✅ | ✅ | ✅ |
| Proveedores | ✅ | ✅ | ❌ |
| Reportes | ✅ | ✅ | ✅ |
| Configuración | ✅ | ✅ | ❌ |
| Gestión de Usuarios | ✅ | ❌ | ❌ |

---

## 🔮 Próximas Funcionalidades

- [ ] Módulo de Compras/Órdenes de Compra
- [ ] Integración con facturación electrónica SET Paraguay (e-Kuatia)
- [ ] App móvil nativa (React Native)
- [ ] Notificaciones push
- [ ] Multi-sucursal
- [ ] Reportes avanzados con gráficos interactivos

---

## 📝 Licencia

Este proyecto es software propietario. Todos los derechos reservados.

---

## 👨‍💻 Autor

**Nelson Sosa**

- GitHub: [@Nelson-Sosa](https://github.com/Nelson-Sosa)
- LinkedIn: [Nelson Sosa](https://www.linkedin.com/in/nelson-sosa-b9b901398/?skipRedirect=true)

---

⭐ ¿Te gusta el proyecto? Dale una estrella en GitHub
