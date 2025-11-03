# 📋 Guía de Configuración - Sistema de Pagos y Emails

Esta guía te ayudará a configurar la pasarela de pagos (Stripe) y el sistema de envío de emails (EmailJS) para tu sitio web de LitoArte.

## 📦 Archivos Creados

- `js/config.js` - Configuración de claves y servicios
- `js/payment.js` - Módulo de pasarela de pagos con Stripe
- `js/email.js` - Módulo de envío de emails con EmailJS
- `views/pago-exitoso.html` - Página de confirmación post-pago
- `SETUP.md` - Este archivo de documentación

## 🔧 Paso 1: Configurar Stripe (Pasarela de Pagos)

### 1.1 Crear cuenta en Stripe

1. Ve a [https://stripe.com](https://stripe.com)
2. Haz clic en "Empezar ahora" o "Sign up"
3. Completa el registro con tus datos

### 1.2 Obtener las claves de API

1. Inicia sesión en [https://dashboard.stripe.com](https://dashboard.stripe.com)
2. Ve a "Developers" → "API keys"
3. Verás dos tipos de claves:
   - **Publishable key** (Clave publicable) - Empieza con `pk_test_...` o `pk_live_...`
   - **Secret key** (Clave secreta) - Empieza con `sk_test_...` o `sk_live_...`

⚠️ **IMPORTANTE**: Solo necesitas la **Publishable key** (clave publicable) para este proyecto.

### 1.3 Modo de pruebas vs. Producción

- **Modo de pruebas** (`pk_test_...`): Para desarrollo. Los pagos no son reales.
- **Modo en vivo** (`pk_live_...`): Para producción. Los pagos son reales.

**Recomendación**: Usa las claves de prueba (`pk_test_...`) mientras desarrollas.

### 1.4 Tarjetas de prueba de Stripe

Para probar pagos en modo test, usa estas tarjetas:

| Tipo | Número | Fecha | CVC | Resultado |
|------|--------|-------|-----|-----------|
| Éxito | 4242 4242 4242 4242 | Cualquier futura | Cualquier 3 dígitos | Pago exitoso |
| Rechazado | 4000 0000 0000 0002 | Cualquier futura | Cualquier 3 dígitos | Pago rechazado |

## 📧 Paso 2: Configurar EmailJS (Envío de Emails)

### 2.1 Crear cuenta en EmailJS

1. Ve a [https://www.emailjs.com](https://www.emailjs.com)
2. Haz clic en "Sign Up" (Registrarse)
3. Completa el registro (puedes usar Google)

### 2.2 Crear un servicio de email

1. En el dashboard, ve a "Email Services"
2. Haz clic en "Add New Service"
3. Selecciona tu proveedor de email:
   - **Gmail** (recomendado para pruebas)
   - Outlook
   - Yahoo
   - Otros servicios SMTP
4. Sigue las instrucciones para conectar tu cuenta
5. Guarda el **Service ID** (ej: `service_abc123`)

### 2.3 Crear templates de email

Necesitas crear **dos templates**:

#### Template 1: Confirmación al Cliente

1. Ve a "Email Templates" → "Create New Template"
2. Nombre: "Confirmación Pedido Cliente"
3. Configura el template con estos parámetros:

**Subject (Asunto):**
```
Confirmación de Pedido {{numero_pedido}} - LitoArte
```

**Content (Contenido HTML):**
```html
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #6366f1; color: white; padding: 20px; text-align: center; }
        .content { background: #f9fafb; padding: 20px; }
        .footer { text-align: center; padding: 20px; font-size: 12px; color: #666; }
        .pedido-box { background: white; border: 1px solid #e5e7eb; padding: 15px; margin: 15px 0; }
        .total { font-size: 20px; font-weight: bold; color: #6366f1; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>¡Gracias por tu pedido!</h1>
        </div>
        
        <div class="content">
            <h2>Hola {{cliente_nombre}},</h2>
            <p>Tu pedido ha sido confirmado y está siendo procesado.</p>
            
            <div class="pedido-box">
                <h3>Detalles del Pedido</h3>
                <p><strong>Número de Pedido:</strong> {{numero_pedido}}</p>
                <p><strong>Fecha:</strong> {{fecha_pedido}}</p>
                <p><strong>Producto:</strong> {{producto_nombre}}</p>
                <p><strong>Plazo de entrega:</strong> {{plazo_entrega}} días</p>
                
                <hr>
                
                <pre>{{detalles_pedido}}</pre>
                
                <p class="total">Total: {{precio_total}}€</p>
                <p style="color: green;">✅ Estado: {{estado_pago}}</p>
            </div>
            
            <p>Nos pondremos en contacto contigo pronto para confirmar los detalles y coordinar la entrega.</p>
            
            <p>Si tienes alguna pregunta, no dudes en contactarnos:</p>
            <ul>
                <li>Email: {{empresa_email}}</li>
                <li>Teléfono: {{empresa_telefono}}</li>
            </ul>
        </div>
        
        <div class="footer">
            <p>{{empresa_nombre}} - Transformamos tus recuerdos en luz</p>
        </div>
    </div>
</body>
</html>
```

4. Guarda y anota el **Template ID** (ej: `template_xyz789`)

#### Template 2: Notificación a la Empresa

1. Crea otro template nuevo
2. Nombre: "Notificación Nuevo Pedido Empresa"
3. Configura con estos parámetros:

**Subject:**
```
🔔 NUEVO PEDIDO: {{numero_pedido}}
```

**Content:**
```html
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .alert { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 15px 0; }
        .pedido-info { background: #f3f4f6; padding: 15px; margin: 10px 0; }
    </style>
</head>
<body>
    <div class="container">
        <div class="alert">
            <h2>🔔 Nuevo Pedido Recibido</h2>
        </div>
        
        <div class="pedido-info">
            <h3>Información del Pedido</h3>
            <p><strong>Número:</strong> {{numero_pedido}}</p>
            <p><strong>Fecha:</strong> {{fecha_pedido}}</p>
            <p><strong>Estado Pago:</strong> {{estado_pago}}</p>
            <p><strong>Total:</strong> {{precio_total}}€</p>
        </div>
        
        <div class="pedido-info">
            <h3>Datos del Cliente</h3>
            <p><strong>Nombre:</strong> {{cliente_nombre_completo}}</p>
            <p><strong>Email:</strong> {{cliente_email}}</p>
            <p><strong>Teléfono:</strong> {{cliente_telefono}}</p>
            <p><strong>Newsletter:</strong> {{newsletter}}</p>
        </div>
        
        <div class="pedido-info">
            <h3>Producto</h3>
            <p><strong>Tipo:</strong> {{producto_nombre}} ({{producto_tipo}})</p>
            <p><strong>Cantidad:</strong> {{cantidad}}</p>
            <p><strong>Litofanías:</strong> {{cantidad_litofanias}}</p>
            <p><strong>Plazo:</strong> {{plazo_entrega}} días</p>
            <p><strong>Extras:</strong> {{extras_lista}}</p>
        </div>
        
        <div class="pedido-info">
            <h3>Detalles Completos</h3>
            <pre>{{detalles_pedido}}</pre>
        </div>
    </div>
</body>
</html>
```

4. Guarda y anota el **Template ID**

### 2.4 Obtener la Public Key

1. Ve a "Account" → "General"
2. Copia tu **Public Key** (ej: `AbCdEfGh123456789`)

## ⚙️ Paso 3: Configurar tu Aplicación

### 3.1 Editar `js/config.js`

Abre el archivo `js/config.js` y reemplaza los valores de ejemplo con tus claves reales:

```javascript
const CONFIG = {
    // ===== STRIPE =====
    stripe: {
        publicKey: 'pk_test_TU_CLAVE_AQUI', // ← Pega tu Publishable Key
        currency: 'eur',
        locale: 'es'
    },

    // ===== EMAILJS =====
    emailjs: {
        publicKey: 'TU_PUBLIC_KEY_AQUI',      // ← Pega tu Public Key
        serviceId: 'service_XXXXXXX',          // ← Pega tu Service ID
        
        templates: {
            cliente: 'template_XXXXXXX',       // ← Template ID del cliente
            empresa: 'template_YYYYYYY'        // ← Template ID de la empresa
        }
    },

    // ===== DATOS DE LA EMPRESA =====
    empresa: {
        nombre: 'LitoArte',
        email: 'tu-email@ejemplo.com',         // ← Tu email real
        telefono: '+41 32 123 45 67',          // ← Tu teléfono
        direccion: 'Lüscherz, Suiza'
    }
};
```

### 3.2 Verificar la configuración

1. Abre `views/presupuesto.html` en tu navegador
2. Abre la consola del navegador (F12)
3. Si ves el mensaje `⚠️ ATENCIÓN: Debes configurar tus claves reales en js/config.js`, significa que aún tienes valores de ejemplo

## 🧪 Paso 4: Probar el Sistema

### 4.1 Prueba del formulario

1. Abre `views/presupuesto.html`
2. Completa el formulario con datos de prueba
3. Haz clic en "Enviar Presupuesto"

### 4.2 Prueba del pago

1. Serás redirigido a Stripe Checkout
2. Usa la tarjeta de prueba: `4242 4242 4242 4242`
3. Fecha: Cualquier fecha futura (ej: 12/25)
4. CVC: Cualquier 3 dígitos (ej: 123)
5. Completa los datos de facturación

### 4.3 Confirmación

1. Después del pago, serás redirigido a `pago-exitoso.html`
2. Deberías ver:
   - ✅ Número de pedido generado
   - 📧 Confirmación de emails enviados
   - Resumen del pedido

### 4.4 Verificar emails

1. Revisa la bandeja de entrada del email que usaste en el formulario
2. Deberías recibir un email de confirmación
3. El email de la empresa llegará al email configurado en `config.js`

## 🔒 Seguridad

### ⚠️ IMPORTANTE: No subir claves a GitHub

1. Añade `js/config.js` a tu `.gitignore`:

```bash
# .gitignore
js/config.js
```

2. Crea un archivo de ejemplo `js/config.example.js`:

```bash
cp js/config.js js/config.example.js
```

3. En `config.example.js`, deja los valores de ejemplo (TU_CLAVE_AQUI)
4. Sube solo el archivo de ejemplo a GitHub

### Variables de entorno (Opcional - Para producción)

En producción, considera usar variables de entorno:

```javascript
const CONFIG = {
    stripe: {
        publicKey: process.env.STRIPE_PUBLIC_KEY || 'pk_test_...'
    },
    emailjs: {
        publicKey: process.env.EMAILJS_PUBLIC_KEY || '...'
    }
};
```

## 📊 Flujo Completo del Proceso

```
1. Usuario completa formulario
   ↓
2. Clic en "Enviar Presupuesto"
   ↓
3. Se genera número de pedido (ej: LITO-20231103-001)
   ↓
4. Se guarda pedido en localStorage
   ↓
5. Redirección a Stripe Checkout
   ↓
6. Usuario completa pago
   ↓
7. Stripe redirige a pago-exitoso.html
   ↓
8. Se recupera pedido de localStorage
   ↓
9. Se envían emails:
   - Confirmación al cliente
   - Notificación a la empresa
   ↓
10. Se muestra confirmación final
    ↓
11. Se limpia localStorage
```

## 🐛 Solución de Problemas

### Problema: No se carga Stripe

**Solución**: Verifica que el script de Stripe esté antes de tus scripts:
```html
<script src="https://js.stripe.com/v3/"></script>
<script src="../js/config.js"></script>
<script src="../js/payment.js"></script>
```

### Problema: No se envían emails

**Soluciones**:
1. Verifica que EmailJS esté inicializado (mensaje en consola)
2. Revisa que los Template IDs sean correctos
3. Verifica el límite de emails (gratis: 200/mes)
4. Comprueba que el servicio de email esté conectado

### Problema: Error "Stripe is not defined"

**Solución**: El script de Stripe no se cargó. Verifica tu conexión a internet y que el CDN esté accesible.

### Problema: No funciona en localhost

**Solución**: Stripe funciona en localhost. EmailJS también. Si tienes problemas:
1. Usa un servidor local (Live Server en VS Code)
2. No abras el archivo directamente (file://)

## 💰 Costos y Límites

### Stripe
- **Modo test**: Gratis ilimitado
- **Modo producción**: 
  - 1.4% + 0.25€ por transacción en Europa
  - Sin cuota mensual

### EmailJS
- **Plan gratuito**: 200 emails/mes
- **Plan Personal**: $7/mes - 10,000 emails
- **Plan Pro**: Desde $15/mes

## 📚 Recursos Adicionales

- [Documentación Stripe](https://stripe.com/docs)
- [Documentación EmailJS](https://www.emailjs.com/docs/)
- [Stripe Testing Cards](https://stripe.com/docs/testing)

## ✅ Checklist Final

Antes de pasar a producción:

- [ ] Claves de Stripe configuradas
- [ ] Templates de EmailJS creados
- [ ] Email de la empresa configurado
- [ ] Probado con tarjeta de prueba
- [ ] Emails de confirmación recibidos
- [ ] `config.js` añadido a `.gitignore`
- [ ] Cambiar de claves test a live en Stripe
- [ ] Verificar cuenta de Stripe activada

## 🆘 Soporte

Si tienes problemas:
1. Revisa la consola del navegador (F12)
2. Verifica los logs de Stripe Dashboard
3. Revisa los logs de EmailJS Dashboard
4. Consulta esta documentación

---

**¡Listo!** 🎉 Tu sistema de pagos y emails está configurado.
