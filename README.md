# 🎨 LitoArte - Ruben Litofanías

## 📖 Descripción
Sitio web profesional completo para **Ruben Litofanías**, especialista en la creación de litofanías personalizadas ubicado en Lüscerz, Suiza. Sistema completo de e-commerce con frontend y backend integrados.

## ✨ Características Principales

### 🏠 **Página Principal (index.html)**
- Hero section con presentación
- Sección de productos destacados
- **Carga dinámica de noticias** desde JSON con AJAX
- Sección "Acerca de" con información del taller
- Navegación responsive con menú hamburguesa

### 🖼️ **Galería (galeria.html)**
- **Sistema de filtros** por categorías (Mesa, Pared, Techo, Personalizada)
- **Lightbox modal** para visualización ampliada de imágenes
- **Lazy loading** para optimización de carga
- Grid responsive adaptable a diferentes dispositivos

### 💰 **Presupuesto (presupuesto.html)**
- **Formulario completo** con validaciones en tiempo real
- **Cálculo automático** de precios según producto y extras
- **Sistema de descuentos** basado en plazo de entrega
- **Subida de fotos obligatoria** por litofanía con validación de orientación
- **Integración con backend** para gestión de pedidos
- **Pasarela de pagos Stripe** completamente funcional
- **Sistema de emails automáticos** (cliente + empresa)
- Validaciones estrictas de todos los campos

### 📍 **Contacto (contacto.html)**
- **Mapa interactivo** con OpenStreetMaps centrado en Lüscerz, Suiza
- **Geolocalización** del usuario
- **Cálculo de rutas** automático usando OSRM
- **Formulario de contacto** con validaciones
- **Horarios dinámicos** con indicador de estado

### ⚖️ **Aviso Legal (aviso-legal.html)**
- Política de privacidad completa
- Términos y condiciones
- Información sobre cookies
- Cumplimiento RGPD

### 🎯 **Sistema Backend (NUEVO)**
- **API REST completa** para gestión de pedidos
- **Base de datos SQLite** con historial completo
- **Webhooks de Stripe** para confirmaciones automáticas
- **Envío de emails** con Nodemailer (HTML responsive)
- **Panel de estadísticas** y gestión
- **Estados de pedidos** rastreables
- **Separación completa** HTML/CSS/JS

## 🛠️ Tecnologías Utilizadas

### **Frontend**
- **HTML5** - Estructura semántica y accesible
- **CSS3** - Diseño responsive con variables CSS, animaciones y grid/flexbox
- **JavaScript ES6+** - Vanilla JS, fetch API, módulos

### **Backend**
- **Node.js** + **Express** - Servidor y API REST
- **Stripe** - Integración de pagos del lado servidor
- **Nodemailer** - Envío de emails HTML
- **SQLite** (better-sqlite3) - Base de datos embebida
- **CORS** - Comunicación frontend-backend
- **dotenv** - Gestión de variables de entorno

### **APIs y Librerías (Frontend)**
- **Leaflet.js** - Mapas interactivos OpenStreetMaps
- **Leaflet Routing Machine** - Cálculo de rutas
- **OSRM** - Motor de enrutamiento open source

### **Funcionalidades Avanzadas**
- **AJAX** con fetch() para comunicación con API
- **Geolocalización API** del navegador
- **Responsive Design** mobile-first
- **Progressive Enhancement**
- **RESTful API** completa
- **Webhooks** para automatización
- **Base de datos relacional** con historial

## 📁 Estructura del Proyecto

```
trabajo_final_js/
├── index.html                    # Página principal
├── noticias.json                 # Base de datos de noticias
├── README.md                     # Documentación principal
├── .gitignore                    # Archivos a ignorar
│
├── backend/                      # ⭐ SERVIDOR BACKEND
│   ├── server.js                 # Servidor Express principal
│   ├── database.js               # Módulo de base de datos SQLite
│   ├── emailService.js           # Servicio de emails con Nodemailer
│   ├── package.json              # Dependencias del backend
│   ├── .env.example              # Ejemplo de configuración
│   ├── .gitignore                # Ignorar .env y node_modules
│   ├── README.md                 # Documentación del backend
│   └── database/
│       └── pedidos.db            # Base de datos (se crea automáticamente)
│
├── css/
│   ├── styles.css                # Estilos completos del sitio
│   └── pago-exitoso.css          # Estilos específicos página de confirmación
│
├── js/
│   ├── api-client.js             # Cliente para comunicación con API
│   ├── index.js                  # JavaScript página principal
│   ├── galeria.js                # Funcionalidad de galería
│   ├── presupuesto.js            # Sistema de presupuestos
│   ├── contacto.js               # Mapas y contacto
│   └── pago-exitoso.js           # Lógica confirmación de pago
│
├── views/
│   ├── galeria.html              # Página de galería
│   ├── presupuesto.html          # Formulario de presupuestos
│   ├── pago-exitoso.html         # Confirmación post-pago (HTML limpio)
│   ├── contacto.html             # Página de contacto
│   └── aviso-legal.html          # Página legal
│
└── assets/
    └── img/                      # Imágenes del sitio
```

## 🚀 Características Técnicas

### **Validaciones JavaScript**
- ✅ Nombres y apellidos (solo letras, longitud específica)
- ✅ Teléfono (formato suizo/internacional)
- ✅ Email (formato RFC compliant)
- ✅ Formularios con feedback visual en tiempo real

### **Cálculo de Presupuestos**
- ✅ Precios base por tipo de producto
- ✅ Extras opcionales con precios individuales
- ✅ Sistema de descuentos por plazo de entrega
- ✅ Cálculo automático y actualización en tiempo real

### **Integración de Mapas**
- ✅ Marcadores personalizados con iconos
- ✅ Popups informativos con datos de contacto
- ✅ Controles de navegación personalizados
- ✅ Responsive en dispositivos móviles

### **Optimización y UX**
- ✅ Lazy loading de imágenes
- ✅ Animaciones CSS suaves
- ✅ Loading states y feedback visual
- ✅ Error handling robusto
- ✅ Accesibilidad mejorada

## 🎯 Cumplimiento de Requisitos Académicos

### **✅ Requisitos HTML5**
- Estructura semántica con elementos HTML5
- 5 páginas web interconectadas
- Formularios complejos con validaciones
- Contenido multimedia integrado

### **✅ Requisitos CSS3**
- Variables CSS para mantenimiento
- Diseño responsive mobile-first
- Animaciones y transiciones
- Grid y Flexbox para layouts

### **✅ Requisitos JavaScript**
- AJAX con fetch() para carga de datos JSON
- Validaciones complejas en tiempo real
- Manipulación del DOM
- Event handling avanzado
- APIs del navegador (Geolocation)

### **✅ Funcionalidades Avanzadas**
- Integración con OpenStreetMaps
- Sistema de cálculo dinámico
- Persistencia de datos
- Interfaz de usuario interactiva

## 🌐 Datos de Contacto

- **📍 Ubicación:** Hauptstrasse 50, 2575 Lüscerz, Suiza
- **📞 Teléfono:** +41 32 315 55 55
- **📧 Email:** info@rubenlitofanias.ch
- **⏰ Horarios:** Lun-Vie 9:00-18:00, Sáb 10:00-14:00

## 🔧 Instalación y Uso

### **1. Clonar el repositorio**

```bash
git clone https://github.com/Nebur87/Web_Ruben.git
cd Web_Ruben
```

### **2. Configurar y ejecutar el Backend**

```bash
# Ir al directorio del backend
cd backend

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env
# Editar .env con tus credenciales de Stripe y email

# Iniciar el servidor
npm run dev
```

El servidor estará disponible en `http://localhost:3000`

**📖 Consulta `backend/README.md` para documentación completa del backend**

### **3. Ejecutar el Frontend**

```bash
# Volver al directorio raíz
cd ..

# Usar Live Server en VS Code o cualquier servidor local
# Por ejemplo con Python:
python -m http.server 5500

# O con Node.js http-server:
npx http-server -p 5500
```

El frontend estará disponible en `http://localhost:5500`

### **4. Configurar Stripe Webhooks (opcional para desarrollo)**

```bash
# Instalar Stripe CLI
# https://stripe.com/docs/stripe-cli

# Iniciar sesión
stripe login

# Escuchar webhooks
stripe listen --forward-to localhost:3000/webhook/stripe
```

## 🧪 Pruebas

### **Probar el flujo completo de compra:**

1. **Iniciar ambos servidores:**
   - Backend: `cd backend && npm run dev` (puerto 3000)
   - Frontend: Live Server (puerto 5500)
   - Stripe CLI: `stripe listen --forward-to localhost:3000/webhook/stripe`

2. **Completar un pedido:**
   - Ir a `http://localhost:5500/views/presupuesto.html`
   - Completar el formulario
   - Subir fotos (según orientación)
   - Hacer clic en "Enviar Presupuesto"

3. **Pagar con tarjeta de prueba:**
   - Número: `4242 4242 4242 4242`
   - Fecha: Cualquier fecha futura
   - CVC: Cualquier 3 dígitos

4. **Verificar:**
   - ✅ Redirección a `pago-exitoso.html`
   - ✅ Email al cliente
   - ✅ Email a la empresa
   - ✅ Pedido guardado en base de datos

### **Consultar la base de datos:**

```bash
cd backend/database
sqlite3 pedidos.db

# Ver todos los pedidos
SELECT * FROM pedidos;

# Ver estadísticas
SELECT estado, COUNT(*) FROM pedidos GROUP BY estado;
```

## 📊 API Endpoints Disponibles

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/health` | Health check del servidor |
| POST | `/api/pedidos/crear` | Crear un nuevo pedido |
| POST | `/api/pagos/crear-session` | Crear sesión de pago Stripe |
| GET | `/api/pedidos/:numero` | Obtener detalles de un pedido |
| GET | `/api/pedidos` | Listar todos los pedidos (con filtros) |
| PUT | `/api/pedidos/:numero/estado` | Actualizar estado del pedido |
| POST | `/api/pedidos/:numero/enviar-emails` | Enviar emails de confirmación |
| GET | `/api/pedidos/:numero/historial` | Obtener historial del pedido |
| GET | `/api/estadisticas` | Obtener estadísticas generales |
| POST | `/webhook/stripe` | Webhook de Stripe |

**📖 Consulta `backend/README.md` para ejemplos completos de uso**

3. **Editar `js/config.js` con tus claves:**
   - Stripe Public Key
   - EmailJS Public Key, Service ID y Template IDs
   - Email de tu empresa
   
   📖 **Lee el archivo `SETUP.md` para instrucciones detalladas**

4. **Abrir con Live Server:**
   - Usar extensión Live Server en VS Code
   - O abrir `index.html` directamente en el navegador

### **Para desarrollo local:**
```bash
# Con Python
python -m http.server 8000

# Con Node.js
npx http-server
```

### **Modo de pruebas (sin configurar pagos):**
El sitio funcionará sin configurar Stripe/EmailJS, pero las funciones de pago y email no estarán disponibles. Para probar el formulario sin pagos, comenta las validaciones de pago en `presupuesto.js`.

## 📊 Estado del Proyecto

- ✅ **HTML:** Validado W3C sin errores
- ✅ **CSS:** Sintaxis perfecta y responsive
- ✅ **JavaScript:** Funcional sin errores de consola
- ✅ **Compatibilidad:** Probado en Chrome, Firefox, Safari, Edge
- ✅ **Responsive:** Optimizado para móviles y tablets

## 🏆 Características Destacadas

- **🎨 Diseño profesional** listo para uso comercial
- **⚡ Rendimiento optimizado** con lazy loading
- **🔒 Formularios seguros** con validaciones estrictas
- **� Pagos integrados** con Stripe (modo test y producción)
- **📧 Sistema de emails** automatizado para confirmaciones
- **📝 Generación de números de pedido** únicos
- **�🗺️ Mapas avanzados** con geolocalización
- **📱 Totalmente responsive** en todos los dispositivos
- **♿ Accesible** con estructura semántica
- **🖼️ Subida de imágenes** con validación de formatos y tamaños

## 💳 Sistema de Pagos y Emails

### **Pasarela de Pagos (Stripe)**
- Integración completa con Stripe Checkout
- Modo test para desarrollo (tarjetas de prueba)
- Modo producción para pagos reales
- Generación automática de números de pedido
- Redirección a página de confirmación

### **Sistema de Emails (EmailJS)**
- Email de confirmación al cliente con:
  - Número de pedido
  - Detalles del producto
  - Resumen de precios
  - Información de contacto
- Email de notificación a la empresa con:
  - Datos completos del pedido
  - Información del cliente
  - Estado del pago
  - Detalles para producción

### **Configuración**
Lee el archivo `SETUP.md` para instrucciones paso a paso sobre:
- Cómo obtener claves de Stripe (gratuito en modo test)
- Cómo configurar EmailJS (200 emails gratis/mes)
- Cómo crear templates de email
- Cómo probar el sistema con tarjetas de prueba

---

**Desarrollado por:** Ruben  
**Proyecto:** Trabajo Final JavaScript  
**Fecha:** Noviembre 2025  
**Tecnologías:** HTML5 + CSS3 + JavaScript ES6+ + OpenStreetMaps