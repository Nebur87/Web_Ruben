# 🖥️ Panel de Administración - LitoArte

## 📋 Descripción

Panel de administración completo para gestionar los pedidos de litofanías. Permite visualizar estadísticas en tiempo real, gestionar estados de pedidos, ver detalles completos y reenviar emails de confirmación.

## 🚀 Acceso

### URL de Desarrollo
```
http://localhost:5500/views/admin.html
```

### Requisitos Previos
1. ✅ Backend ejecutándose en `http://localhost:3000`
2. ✅ Base de datos SQLite configurada
3. ✅ Variables de entorno configuradas en `backend/.env`

**⚠️ IMPORTANTE:** En producción, implementa un sistema de autenticación antes de desplegar el panel de administración.

## 📊 Funcionalidades

### 1. Dashboard de Estadísticas

El panel muestra 5 métricas clave en tiempo real:

- **Total de Pedidos:** Cantidad total de pedidos en el sistema
- **Pedidos Pendientes:** Pedidos que aún no han sido pagados
- **Pedidos Confirmados:** Pedidos con pago confirmado
- **Total Ventas:** Suma total de ventas en euros
- **Pedidos de Hoy:** Cantidad de pedidos creados en el día actual

### 2. Filtros Avanzados

**Por Estado:**
- Todos
- Pendiente Pago
- Pago Confirmado
- En Producción
- Completado
- Enviado
- Entregado
- Cancelado

**Por Cantidad:**
- 20 pedidos
- 50 pedidos
- 100 pedidos
- Todos

**Búsqueda en Tiempo Real:**
- Por número de pedido
- Por email del cliente
- Por nombre del cliente
- Por apellidos del cliente

### 3. Listado de Pedidos

Tabla completa con información clave de cada pedido:

| Columna | Descripción |
|---------|-------------|
| **Número** | Número único de pedido (LITO-YYYYMMDD-XXX) |
| **Fecha** | Fecha y hora de creación |
| **Cliente** | Nombre, apellidos y email |
| **Producto** | Tipo de litofanía |
| **Total** | Precio total en euros |
| **Estado** | Estado actual del pedido con badge de color |
| **Pagado** | Indicador si el pago fue confirmado |
| **Acciones** | Botones para ver, editar y reenviar emails |

### 4. Vista Detallada del Pedido

Al hacer clic en 👁️ (Ver detalles), se muestra un modal con:

#### 📋 Información del Cliente
- Nombre completo
- Email
- Teléfono
- Preferencia de newsletter

#### 📦 Detalles del Pedido
- Número de pedido
- Fecha de creación
- Tipo de producto
- Plazo de entrega
- Cantidad de litofanías (si aplica)
- Estado actual
- Estado de pago

#### ✨ Extras
- Lista de todos los extras seleccionados
- Precio individual de cada extra

#### 💰 Desglose de Precios
- Precio base
- Precio de extras
- Descuento aplicado
- **TOTAL** destacado

#### 📅 Historial
- Todos los cambios de estado
- Fecha y hora de cada cambio
- Notas asociadas (si existen)

#### 📝 Notas
- Comentarios o instrucciones especiales

### 5. Cambio de Estado

Al hacer clic en ✏️ (Cambiar estado), puedes:

1. Seleccionar el nuevo estado
2. Añadir notas opcionales
3. Guardar el cambio

**El sistema automáticamente:**
- ✅ Actualiza el estado en la base de datos
- ✅ Registra el cambio en el historial
- ✅ Guarda las notas asociadas
- ✅ Actualiza las estadísticas

### 6. Reenvío de Emails

Al hacer clic en 📧 (Reenviar emails):

- Envía nuevamente el email de confirmación al cliente
- Envía nuevamente el email de notificación a la empresa
- Muestra confirmación de éxito o error

## 🎨 Códigos de Color

### Badges de Estado

| Estado | Color | Descripción |
|--------|-------|-------------|
| **Pendiente Pago** | 🟡 Amarillo | Esperando pago del cliente |
| **Pago Confirmado** | 🟢 Verde | Pago recibido y confirmado |
| **En Producción** | 🔵 Azul | Se está fabricando el pedido |
| **Completado** | 🟣 Púrpura | Pedido terminado, listo para envío |
| **Enviado** | 🟠 Naranja | Pedido en tránsito |
| **Entregado** | ✅ Verde oscuro | Pedido recibido por el cliente |
| **Cancelado** | 🔴 Rojo | Pedido cancelado |

### Badges de Pago

| Estado | Color | Descripción |
|--------|-------|-------------|
| **Sí** | 🟢 Verde | Pago confirmado |
| **No** | 🔴 Rojo | Pago pendiente |

## 🔄 Flujo de Trabajo Recomendado

### 1. Monitor Diario
```
1. Acceder al panel
2. Revisar estadísticas del día
3. Revisar pedidos pendientes
```

### 2. Gestión de Pedido Nuevo
```
1. Verificar que el pago esté confirmado
2. Revisar detalles y fotos del pedido
3. Cambiar estado a "En Producción"
4. Añadir notas si es necesario
```

### 3. Durante la Producción
```
1. Actualizar estado según avance
2. Añadir notas de progreso
3. Mantener historial actualizado
```

### 4. Al Finalizar
```
1. Cambiar a "Completado"
2. Cambiar a "Enviado" con número de seguimiento en notas
3. Cambiar a "Entregado" al confirmar recepción
```

### 5. En Caso de Problemas
```
1. Si no se recibe email → Usar botón 📧 para reenviar
2. Si hay error de pago → Verificar en dashboard de Stripe
3. Si cliente cancela → Cambiar a "Cancelado" con notas
```

## 🔧 Funciones del JavaScript (admin.js)

### Funciones Principales

```javascript
// Cargar estadísticas desde API
cargarEstadisticas()

// Cargar lista de pedidos (con filtros opcionales)
cargarPedidos()

// Aplicar filtros seleccionados
aplicarFiltros()

// Limpiar todos los filtros
limpiarFiltros()

// Búsqueda en tiempo real
filtrarTabla()

// Ver detalles completos de un pedido
verDetalle(numeroPedido)

// Cambiar estado de un pedido
cambiarEstado(numeroPedido, estadoActual)

// Reenviar emails de confirmación
reenviarEmails(numeroPedido)
```

### Endpoints de API Utilizados

```javascript
GET  /api/estadisticas                      // Dashboard stats
GET  /api/pedidos                            // Lista de pedidos
GET  /api/pedidos?estado=...&limite=...      // Con filtros
GET  /api/pedidos/:numero                    // Detalles del pedido
GET  /api/pedidos/:numero/historial          // Historial de cambios
PUT  /api/pedidos/:numero/estado             // Actualizar estado
POST /api/pedidos/:numero/enviar-emails      // Reenviar emails
```

## 📱 Responsive Design

El panel está completamente optimizado para:

- 🖥️ **Desktop:** Vista completa con grid de 5 columnas
- 📱 **Tablet:** Grid adaptado a 2-3 columnas
- 📱 **Móvil:** Vista en columna única con scroll horizontal en tabla

## 🔒 Seguridad (Producción)

### ⚠️ Implementaciones Necesarias:

1. **Autenticación:**
   ```javascript
   // Añadir login con JWT o sesiones
   // Proteger todas las rutas del admin
   ```

2. **Autorización:**
   ```javascript
   // Verificar roles de usuario
   // Limitar acciones según permisos
   ```

3. **HTTPS:**
   ```
   // Usar SSL/TLS en producción
   // No exponer el panel en HTTP
   ```

4. **Rate Limiting:**
   ```javascript
   // Limitar peticiones por IP
   // Prevenir ataques de fuerza bruta
   ```

5. **Variables de Entorno:**
   ```bash
   # No hardcodear API_URL
   # Usar variables según entorno
   ```

## 🐛 Solución de Problemas

### Error: "No se pueden cargar los pedidos"

**Causa:** Backend no está ejecutándose o CORS bloqueado

**Solución:**
```bash
# Verificar que el backend esté corriendo
cd backend
npm run dev

# Verificar que esté en http://localhost:3000
```

### Error: "No se actualizan las estadísticas"

**Causa:** Base de datos no tiene pedidos o error en consulta

**Solución:**
```bash
# Verificar que existan pedidos
cd backend/database
sqlite3 pedidos.db
SELECT COUNT(*) FROM pedidos;
```

### Error: "No se pueden reenviar emails"

**Causa:** Configuración de email incorrecta en .env

**Solución:**
```bash
# Verificar configuración en backend/.env
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=tu_email@gmail.com
EMAIL_PASS=tu_app_password
```

### Los filtros no funcionan

**Causa:** JavaScript no cargado o error en consola

**Solución:**
```
1. Abrir DevTools (F12)
2. Revisar Console para errores
3. Verificar que admin.js esté cargado
4. Verificar ruta: <script src="../js/admin.js"></script>
```

## 📚 Recursos Adicionales

- **Backend API:** Ver `backend/README.md`
- **Documentación Stripe:** https://stripe.com/docs
- **SQLite:** https://www.sqlite.org/docs.html

## ✅ Checklist de Validación

Antes de usar en producción:

- [ ] Backend configurado y ejecutándose
- [ ] Base de datos inicializada
- [ ] Variables de entorno configuradas
- [ ] Stripe webhooks configurados
- [ ] Email service funcionando
- [ ] Sistema de autenticación implementado
- [ ] HTTPS configurado
- [ ] Backup de base de datos configurado
- [ ] Logs de errores configurados
- [ ] Rate limiting implementado

---

**Desarrollado con ❤️ para LitoArte - Ruben Litofanías**
