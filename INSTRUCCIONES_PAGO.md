# 🔧 Instrucciones para Configurar el Flujo de Pago

## ✅ Cambios Implementados

He solucionado el problema del flujo de pago. Ahora cuando rellenes el formulario:

1. **Se crea el pedido** en la base de datos
2. **Se redirige a Stripe Checkout** para procesar el pago
3. **Al completar el pago exitosamente**, la página de confirmación:
   - Marca el pedido como pagado
   - Envía emails de confirmación al cliente
   - Envía notificación a la empresa

## 📋 Pasos para Probar

### 1. Configurar Variables de Entorno del Backend

Edita el archivo `backend/.env` con tus credenciales:

```env
# Stripe - Obtén tus claves en https://dashboard.stripe.com/test/apikeys
STRIPE_SECRET_KEY=sk_test_tu_clave_secreta_aqui
STRIPE_WEBHOOK_SECRET=whsec_tu_webhook_secret_aqui  # Opcional para este flujo

# Email - Configura tu servicio de email (Gmail, etc.)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=tu-email@gmail.com
EMAIL_PASS=tu-app-password-aqui

# Email de la empresa
EMPRESA_EMAIL=pedidos@litoarte.com
EMPRESA_NOMBRE=LitoArte

# URLs del frontend (ajusta según tu configuración)
FRONTEND_URL=http://localhost:5500
SUCCESS_URL=http://localhost:5500/views/pago-exitoso.html
CANCEL_URL=http://localhost:5500/views/presupuesto.html
```

### 2. Iniciar el Servidor Backend

```bash
cd backend
npm install  # Si no lo has hecho ya
node server.js
```

Deberías ver:
```
✅ Servidor corriendo en http://localhost:3000
```

### 3. Abrir el Frontend

Abre `views/presupuesto.html` en tu navegador (usando Live Server o similar).

### 4. Probar el Flujo Completo

1. **Rellena el formulario** de presupuesto con todos los datos
2. **Selecciona un producto** (Mesa, Pared o Techo)
3. **Sube las fotos requeridas**
4. **Acepta las condiciones**
5. **Haz clic en "Solicitar Pedido"**

**Lo que debería ocurrir:**

✅ El formulario envía los datos al backend  
✅ Se crea el pedido en la base de datos  
✅ Te redirige a Stripe Checkout  
✅ Completas el pago con tarjeta de prueba  
✅ Stripe te redirige a `pago-exitoso.html`  
✅ Se marca el pedido como pagado  
✅ Se envían los emails automáticamente  
✅ Ves la confirmación en pantalla  

## 🧪 Tarjetas de Prueba de Stripe

Usa estas tarjetas para probar:

- **Pago exitoso**: `4242 4242 4242 4242`
- **Pago rechazado**: `4000 0000 0000 0002`
- **Requiere autenticación**: `4000 0025 0000 3155`

**Fecha**: Cualquier fecha futura (ej: 12/25)  
**CVC**: Cualquier 3 dígitos (ej: 123)  
**Código postal**: Cualquiera (ej: 12345)

## 🔍 Verificar que Todo Funciona

### 1. En la Consola del Navegador

Deberías ver logs como:
```
📤 Enviando pedido al servidor...
✅ Pedido creado: LITO-20251104-XXX
💳 Creando sesión de pago...
✅ Sesión Stripe creada
🔄 Redirigiendo a Stripe Checkout...
```

### 2. En la Consola del Servidor

Deberías ver:
```
✅ Pedido creado: LITO-20251104-XXX (ID: 1)
💳 Sesión de pago creada para pedido LITO-20251104-XXX
✅ Pago confirmado y emails enviados para LITO-20251104-XXX
📧 Email enviado al cliente
📧 Email enviado a la empresa
```

### 3. En el Panel de Admin

Ve a `views/admin.html` y verifica que:
- El pedido aparece en la lista
- El estado es "pago_confirmado"
- Todos los detalles son correctos

### 4. En los Emails

Verifica que llegaron los emails a:
- **Cliente**: Email de confirmación con detalles del pedido
- **Empresa**: Notificación del nuevo pedido

## ❌ Solución de Problemas

### Error: "Cliente API no disponible"

**Causa**: El archivo `api-client.js` no se cargó  
**Solución**: Verifica que el archivo esté en `js/api-client.js` y se incluya en el HTML

### Error: "Error al crear pedido"

**Causa**: El backend no está ejecutándose  
**Solución**: Inicia el servidor con `node backend/server.js`

### Error: "Error al crear sesión de pago"

**Causa**: Clave de Stripe incorrecta o no configurada  
**Solución**: Verifica `STRIPE_SECRET_KEY` en `backend/.env`

### No se envían los emails

**Causa**: Configuración de email incorrecta  
**Solución**: 
1. Verifica las credenciales en `backend/.env`
2. Si usas Gmail, necesitas una "App Password" (no tu contraseña normal)
3. Activa "Acceso de apps menos seguras" o usa OAuth2

### El pedido aparece pero no se marca como pagado

**Causa**: La página `pago-exitoso.html` no llamó al endpoint de confirmación  
**Solución**: 
1. Verifica que la URL de éxito incluya el parámetro `?pedido=LITO-XXX`
2. Revisa la consola del navegador en la página de éxito
3. Verifica que el endpoint `/api/pagos/confirmar` funcione

## 📝 Archivos Modificados

Los siguientes archivos fueron actualizados para solucionar el problema:

1. **backend/server.js**
   - Agregado endpoint `/api/pagos/confirmar`

2. **js/pago-exitoso.js**
   - Actualizado para llamar al nuevo endpoint de confirmación
   - Ahora confirma el pago Y envía emails en una sola llamada

3. **views/presupuesto.html**
   - Eliminada configuración inline de Stripe (ya no necesaria)

4. **js/presupuesto.js**
   - Simplificado el manejo de redirección a Stripe
   - Ahora solo usa la URL devuelta por el servidor

## 🎯 Resumen

El flujo ahora es:

```
Formulario → Backend crea pedido → Stripe Checkout → 
Pago exitoso → Página de confirmación → 
Backend marca como pagado y envía emails → Cliente ve confirmación
```

Todo automático, sin necesidad de configurar webhooks de Stripe (aunque el webhook sigue ahí por si lo necesitas en el futuro).

## 🆘 Soporte

Si algo no funciona:

1. Revisa los logs en la consola del navegador (F12)
2. Revisa los logs en la consola del servidor
3. Verifica que todas las credenciales estén configuradas
4. Asegúrate de que el backend esté ejecutándose
5. Usa las tarjetas de prueba de Stripe correctamente
