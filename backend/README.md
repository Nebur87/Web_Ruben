# 🚀 LitoArte Backend - Servidor de Pedidos y Pagos

Backend completo para el sistema de gestión de pedidos, pagos con Stripe y envío de emails.

## 📋 Características

- ✅ API REST completa para gestión de pedidos
- 💳 Integración con Stripe para pagos seguros
- 📧 Sistema de emails automáticos (Nodemailer)
- 💾 Base de datos SQLite para persistencia
- 📊 Panel de estadísticas
- 🔔 Webhooks de Stripe para confirmaciones automáticas
- 📝 Historial completo de cada pedido

## 🛠️ Tecnologías

- **Node.js** + **Express** - Servidor y API
- **Stripe** - Pasarela de pagos
- **Nodemailer** - Envío de emails
- **SQLite** (better-sqlite3) - Base de datos
- **CORS** - Acceso desde frontend
- **dotenv** - Variables de entorno

## 📦 Instalación

### 1. Instalar dependencias

```bash
cd backend
npm install
```

### 2. Configurar variables de entorno

Copia el archivo de ejemplo y edítalo con tus credenciales:

```bash
cp .env.example .env
```

Edita el archivo `.env`:

```env
# Puerto del servidor
PORT=3000

# Stripe (obtener en https://dashboard.stripe.com/apikeys)
STRIPE_SECRET_KEY=sk_test_tu_clave_secreta_aqui
STRIPE_WEBHOOK_SECRET=whsec_tu_webhook_secret_aqui

# Email (Gmail recomendado para desarrollo)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=tu-email@gmail.com
EMAIL_PASS=tu-app-password-aqui

# Email de la empresa
EMPRESA_EMAIL=pedidos@litoarte.com
EMPRESA_NOMBRE=LitoArte
EMPRESA_TELEFONO=+41 32 123 45 67

# URLs del frontend
FRONTEND_URL=http://localhost:5500
SUCCESS_URL=http://localhost:5500/views/pago-exitoso.html
CANCEL_URL=http://localhost:5500/views/presupuesto.html

# Base de datos
DB_PATH=./database/pedidos.db
```

### 3. Configurar Stripe

#### a) Obtener claves de API

1. Crea una cuenta en [Stripe](https://stripe.com)
2. Ve a **Developers** → **API keys**
3. Copia tu **Secret key** (empieza con `sk_test_...`) a `.env`

#### b) Configurar Webhook (para confirmaciones automáticas)

**Opción 1: Desarrollo local con Stripe CLI** (Recomendado)

1. Instala [Stripe CLI](https://stripe.com/docs/stripe-cli)
2. Ejecuta:
   ```bash
   stripe login
   stripe listen --forward-to localhost:3000/webhook/stripe
   ```
3. Copia el **webhook signing secret** (empieza con `whsec_...`) que aparece en la terminal
4. Pégalo en tu `.env` como `STRIPE_WEBHOOK_SECRET`

**Opción 2: Producción con URL pública**

1. En Stripe Dashboard → **Developers** → **Webhooks**
2. Haz clic en **Add endpoint**
3. URL: `https://tu-dominio.com/webhook/stripe`
4. Eventos: `checkout.session.completed`
5. Copia el **Signing secret** y pégalo en `.env`

### 4. Configurar Gmail (para envío de emails)

#### a) Habilitar verificación en 2 pasos

1. Ve a tu [Cuenta de Google](https://myaccount.google.com/)
2. Seguridad → Verificación en 2 pasos → Activar

#### b) Generar contraseña de aplicación

1. Seguridad → Verificación en 2 pasos → Contraseñas de aplicaciones
2. Selecciona **Correo** y **Otro dispositivo**
3. Copia la contraseña de 16 caracteres
4. Pégala en `.env` como `EMAIL_PASS`

## 🚀 Ejecutar el Servidor

### Modo desarrollo (con reinicio automático)

```bash
npm run dev
```

### Modo producción

```bash
npm start
```

El servidor estará disponible en `http://localhost:3000`

## 📡 API Endpoints

### Health Check

```http
GET /api/health
```

Respuesta:
```json
{
  "status": "ok",
  "message": "Servidor LitoArte funcionando correctamente",
  "timestamp": "2024-11-03T12:00:00.000Z"
}
```

### Crear Pedido

```http
POST /api/pedidos/crear
Content-Type: application/json

{
  "contacto": {
    "nombre": "Juan",
    "apellidos": "Pérez",
    "email": "juan@example.com",
    "telefono": "+41 123456789"
  },
  "producto": {
    "tipo": "mesa",
    "nombre": "Lámpara de Mesa"
  },
  "cantidad": 1,
  "plazo": 15,
  "extras": [
    {
      "id": "envio",
      "nombre": "Envío Express",
      "precio": 8
    }
  ],
  "precios": {
    "base": 45,
    "extras": 8,
    "descuento": 0,
    "total": 53
  },
  "newsletter": true
}
```

### Crear Sesión de Pago

```http
POST /api/pagos/crear-session
Content-Type: application/json

{
  "numeroPedido": "LITO-20231103-001"
}
```

### Obtener Pedido

```http
GET /api/pedidos/:numeroPedido
```

### Listar Pedidos

```http
GET /api/pedidos?estado=pago_confirmado&limite=10
```

Filtros opcionales:
- `estado` - Filtrar por estado
- `email` - Filtrar por email del cliente
- `desde` - Fecha desde (ISO 8601)
- `hasta` - Fecha hasta (ISO 8601)
- `limite` - Límite de resultados

### Actualizar Estado

```http
PUT /api/pedidos/:numeroPedido/estado
Content-Type: application/json

{
  "estado": "en_produccion",
  "notas": "Producción iniciada"
}
```

Estados válidos:
- `pendiente_pago`
- `pago_confirmado`
- `en_produccion`
- `completado`
- `enviado`
- `entregado`
- `cancelado`

### Enviar Emails

```http
POST /api/pedidos/:numeroPedido/enviar-emails
```

### Obtener Historial

```http
GET /api/pedidos/:numeroPedido/historial
```

### Estadísticas

```http
GET /api/estadisticas
```

## 🗄️ Base de Datos

La base de datos SQLite se crea automáticamente en `backend/database/pedidos.db`.

### Tablas

#### `pedidos`
- Información completa del pedido
- Datos del cliente
- Producto y precios
- Estado y pago
- IDs de Stripe

#### `pedido_extras`
- Extras seleccionados por pedido

#### `pedido_historial`
- Registro de cambios de estado
- Auditoría completa

## 🔔 Webhooks

### Stripe Webhook

Endpoint: `/webhook/stripe`

Eventos manejados:
- `checkout.session.completed` - Pago confirmado

Cuando se confirma un pago:
1. Se marca el pedido como pagado
2. Se actualiza el estado a `pago_confirmado`
3. Se envían emails automáticamente (cliente + empresa)

## 📧 Emails

### Email al Cliente

Incluye:
- Número de pedido
- Resumen detallado
- Total pagado
- Datos de contacto de la empresa

### Email a la Empresa

Incluye:
- Notificación de nuevo pedido
- Todos los datos del cliente
- Detalles completos del pedido
- ID de sesión de Stripe

## 🧪 Pruebas

### Tarjetas de prueba de Stripe

| Número | Resultado |
|--------|-----------|
| 4242 4242 4242 4242 | Pago exitoso |
| 4000 0000 0000 0002 | Pago rechazado |
| 4000 0000 0000 9995 | Pago rechazado (fondos insuficientes) |

Fecha: Cualquier fecha futura  
CVC: Cualquier 3 dígitos

### Probar el flujo completo

1. Inicia el servidor: `npm run dev`
2. Inicia Stripe CLI: `stripe listen --forward-to localhost:3000/webhook/stripe`
3. Abre el frontend en Live Server
4. Completa el formulario de presupuesto
5. Usa tarjeta de prueba: `4242 4242 4242 4242`
6. Verifica:
   - ✅ Pedido creado en base de datos
   - ✅ Redirección a Stripe
   - ✅ Webhook recibido
   - ✅ Emails enviados
   - ✅ Página de confirmación

## 📂 Estructura del Proyecto

```
backend/
├── database/
│   └── pedidos.db           # Base de datos (se crea automáticamente)
├── .env                     # Variables de entorno (no subir a Git)
├── .env.example             # Ejemplo de variables
├── database.js              # Módulo de base de datos
├── emailService.js          # Módulo de emails
├── server.js                # Servidor principal
├── package.json             # Dependencias
└── README.md               # Esta documentación
```

## 🔒 Seguridad

### NO subir a GitHub

Añade a `.gitignore`:
```
backend/.env
backend/database/pedidos.db
backend/node_modules/
```

### En producción

1. Usa variables de entorno del sistema (no archivo `.env`)
2. Cambia de claves `test` a claves `live` de Stripe
3. Usa HTTPS siempre
4. Habilita límites de tasa (rate limiting)
5. Valida todos los inputs
6. Usa helmet.js para seguridad adicional

## 🐛 Solución de Problemas

### Error: "Stripe signature verification failed"

- Verifica que `STRIPE_WEBHOOK_SECRET` sea correcto
- Si usas Stripe CLI, asegúrate de que esté corriendo
- El endpoint debe usar `bodyParser.raw()` (ya configurado)

### Error: "Error sending email"

- Verifica credenciales de Gmail
- Asegúrate de haber generado una contraseña de aplicación
- Revisa que la verificación en 2 pasos esté activa

### Error: "Database locked"

- Solo un proceso puede escribir a la vez en SQLite
- Para producción considera PostgreSQL o MySQL

### Puerto 3000 ya en uso

Cambia el puerto en `.env`:
```env
PORT=3001
```

## 📊 Monitoreo

### Ver logs en tiempo real

```bash
npm run dev
```

### Consultar base de datos

```bash
cd backend/database
sqlite3 pedidos.db
```

Consultas útiles:
```sql
-- Ver todos los pedidos
SELECT * FROM pedidos ORDER BY fecha_creacion DESC LIMIT 10;

-- Pedidos pendientes
SELECT * FROM pedidos WHERE estado = 'pendiente_pago';

-- Total de ventas
SELECT SUM(precio_total) FROM pedidos WHERE pagado = 1;
```

## 🚀 Despliegue

### Opciones de hosting

1. **Heroku** - Fácil, gratis para empezar
2. **Railway** - Moderno, muy fácil
3. **DigitalOcean** - VPS tradicional
4. **AWS EC2** - Escalable, más complejo

### Pasos generales

1. Sube el código a GitHub (sin `.env`)
2. Configura variables de entorno en el hosting
3. Cambia URLs en `.env` a tu dominio
4. Configura webhook de Stripe con URL pública
5. Cambia a claves `live` de Stripe

## 📚 Recursos

- [Documentación de Stripe](https://stripe.com/docs)
- [Nodemailer](https://nodemailer.com/)
- [Express.js](https://expressjs.com/)
- [Better SQLite3](https://github.com/WiseLibs/better-sqlite3)

## 🆘 Soporte

Si encuentras problemas:
1. Revisa los logs del servidor
2. Verifica el Dashboard de Stripe
3. Comprueba las variables de entorno
4. Revisa la documentación de cada servicio

---

**¡Listo para procesar pedidos!** 🎉
