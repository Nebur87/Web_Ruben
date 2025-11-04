/**
 * LITOARTE - Servidor Backend
 * API REST para gestión de pedidos, pagos con Stripe y envío de emails
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

const db = require('./database');
const emailService = require('./emailService');

// Inicializar Stripe solo si hay clave configurada
let stripe;
if (process.env.STRIPE_SECRET_KEY) {
    stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
} else {
    console.warn('⚠️  STRIPE_SECRET_KEY no configurada - pagos deshabilitados');
}

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Inicializar base de datos
db.initDatabase();

console.log('🚀 Servidor LitoArte iniciando...');
// ==================== SUBIDAS TEMPORALES DE FOTOS ====================

// Carpeta de uploads
const UPLOADS_DIR = path.join(__dirname, 'uploads');
if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true });
const TEMP_DIR = path.join(UPLOADS_DIR, 'temp');
if (!fs.existsSync(TEMP_DIR)) fs.mkdirSync(TEMP_DIR, { recursive: true });

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        // cada petición usa su subcarpeta según token
        let token = req.body.token;
        if (!token) {
            token = uuidv4();
            req.body.token = token;
        }
        const dir = path.join(TEMP_DIR, token);
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        cb(null, dir);
    },
    filename: function (req, file, cb) {
        const ts = Date.now();
        const safe = (file.originalname || 'foto').replace(/[^a-zA-Z0-9._-]/g, '_');
        cb(null, `${ts}_${safe}`);
    }
});

const upload = multer({ storage });

/**
 * POST /api/uploads/temp - Subir fotos temporalmente
 * campo: fotos[]
 * respuesta: { success, token, files:[{filename, pathRel}] }
 */
app.post('/api/uploads/temp', upload.array('fotos[]', 10), (req, res) => {
    try {
        const token = req.body.token || uuidv4();
        const files = (req.files || []).map(f => ({
            filename: f.filename,
            pathRel: path.join('uploads', 'temp', token, f.filename).replace(/\\/g, '/'),
            mime: f.mimetype,
            size: f.size
        }));

        res.json({ success: true, token, files });
    } catch (error) {
        console.error('❌ Error en subida temporal:', error);
        res.status(500).json({ error: 'Error al subir fotos' });
    }
});


// ==================== UTILIDADES ====================

/**
 * Generar número de pedido único
 */
function generarNumeroPedido() {
    const fecha = new Date();
    const año = fecha.getFullYear();
    const mes = String(fecha.getMonth() + 1).padStart(2, '0');
    const dia = String(fecha.getDate()).padStart(2, '0');
    const fechaStr = `${año}${mes}${dia}`;
    
    const timestamp = Date.now().toString();
    const numeroSecuencial = timestamp.slice(-3).padStart(3, '0');
    
    return `LITO-${fechaStr}-${numeroSecuencial}`;
}

// ==================== ENDPOINTS API ====================

/**
 * GET /api/health - Health check
 */
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'ok', 
        message: 'Servidor LitoArte funcionando correctamente',
        timestamp: new Date().toISOString()
    });
});

/**
 * POST /api/pedidos/crear - Crear un nuevo pedido
 */
app.post('/api/pedidos/crear', async (req, res) => {
    try {
        const { contacto, producto, cantidad, cantidadLitofanias, plazo, extras, precios, newsletter } = req.body;

        // Validaciones básicas
        if (!contacto || !contacto.nombre || !contacto.email || !producto) {
            return res.status(400).json({ 
                error: 'Datos incompletos. Se requiere contacto, producto y precios.' 
            });
        }

        // Generar número de pedido
        const numeroPedido = generarNumeroPedido();

        // Mapeo de datos para la base de datos
        const pedidoData = {
            numero_pedido: numeroPedido,
            cliente_nombre: contacto.nombre,
            cliente_apellidos: contacto.apellidos,
            cliente_email: contacto.email,
            cliente_telefono: contacto.telefono,
            producto_tipo: producto.tipo,
            producto_nombre: producto.nombre,
            cantidad: cantidad || 1,
            cantidad_litofanias: cantidadLitofanias || null,
            plazo_entrega: plazo,
            precio_base: precios.base,
            precio_extras: precios.extras,
            precio_descuento: precios.descuento,
            precio_total: precios.total,
            estado: 'pendiente_pago',
            newsletter: newsletter || false,
            extras: extras || []
        };

        // Guardar en base de datos
        const pedidoId = db.crearPedido(pedidoData);

        console.log(`✅ Pedido creado: ${numeroPedido} (ID: ${pedidoId})`);

        res.json({
            success: true,
            numeroPedido,
            pedidoId,
            message: 'Pedido creado correctamente'
        });

    } catch (error) {
        console.error('❌ Error al crear pedido:', error);
        res.status(500).json({ 
            error: 'Error al crear el pedido',
            details: error.message 
        });
    }
});

/**
 * POST /api/pagos/crear-session - Crear sesión de pago de Stripe
 */
app.post('/api/pagos/crear-session', async (req, res) => {
    try {
        const { numeroPedido } = req.body;

        if (!numeroPedido) {
            return res.status(400).json({ error: 'Número de pedido requerido' });
        }

        // Obtener pedido de la base de datos
        const pedido = db.obtenerPedido(numeroPedido);

        if (!pedido) {
            return res.status(404).json({ error: 'Pedido no encontrado' });
        }

        // Crear items para Stripe
        const lineItems = [];

        // Item principal (producto)
        lineItems.push({
            price_data: {
                currency: 'eur',
                product_data: {
                    name: pedido.producto_nombre,
                    description: `Plazo de entrega: ${pedido.plazo_entrega} días`,
                },
                unit_amount: Math.round(parseFloat(pedido.precio_base) * 100),
            },
            quantity: 1,
        });

        // Extras
        if (pedido.extras && pedido.extras.length > 0) {
            pedido.extras.forEach(extra => {
                lineItems.push({
                    price_data: {
                        currency: 'eur',
                        product_data: {
                            name: extra.extra_nombre,
                        },
                        unit_amount: Math.round(parseFloat(extra.extra_precio) * 100),
                    },
                    quantity: 1,
                });
            });
        }

        // Crear sesión de Stripe Checkout
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: lineItems,
            mode: 'payment',
            success_url: `${process.env.SUCCESS_URL}?session_id={CHECKOUT_SESSION_ID}&pedido=${numeroPedido}`,
            cancel_url: `${process.env.CANCEL_URL}?cancelado=true`,
            customer_email: pedido.cliente_email,
            client_reference_id: numeroPedido,
            metadata: {
                numero_pedido: numeroPedido,
                pedido_id: pedido.id.toString()
            }
        });

        // Asociar session ID al pedido
        db.asociarStripeSession(numeroPedido, session.id);

        console.log(`💳 Sesión de pago creada para pedido ${numeroPedido}: ${session.id}`);

        res.json({
            success: true,
            sessionId: session.id,
            url: session.url
        });

    } catch (error) {
        console.error('❌ Error al crear sesión de pago:', error);
        res.status(500).json({ 
            error: 'Error al crear sesión de pago',
            details: error.message 
        });
    }
});

/**
 * POST /api/pagos/crear-session-v2 - Crear sesión de pago SIN pedido previo
 * Body: { payload: { contacto, producto, cantidad, cantidadLitofanias, plazo, extras[], precios }, tempToken }
 * Guarda payload en carpeta temp/<token>/order.json y crea sesión con metadata { temp_token }
 */
app.post('/api/pagos/crear-session-v2', async (req, res) => {
    try {
        const { payload, tempToken } = req.body;
        if (!payload || !payload.producto || !payload.precios) {
            return res.status(400).json({ error: 'Datos de pedido incompletos' });
        }
        const token = tempToken || uuidv4();
        const dir = path.join(TEMP_DIR, token);
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        fs.writeFileSync(path.join(dir, 'order.json'), JSON.stringify(payload, null, 2), 'utf8');

        // Construir line_items desde payload
        const lineItems = [];
        // Producto base
        lineItems.push({
            price_data: {
                currency: 'eur',
                product_data: {
                    name: payload.producto.nombre,
                    description: `Plazo: ${payload.plazo} días`
                },
                unit_amount: Math.round(parseFloat(payload.precios.base) * 100)
            },
            quantity: 1
        });
        // Extras
        if (Array.isArray(payload.extras)) {
            payload.extras.forEach(ex => {
                const p = Number(ex.precio || 0);
                if (p > 0) {
                    lineItems.push({
                        price_data: {
                            currency: 'eur',
                            product_data: { name: ex.nombre },
                            unit_amount: Math.round(p * 100)
                        },
                        quantity: 1
                    });
                }
            });
        }

        const successUrl = `${process.env.SUCCESS_URL}?session_id={CHECKOUT_SESSION_ID}`;
        const cancelUrl = `${process.env.CANCEL_URL}?cancelado=true`;

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: lineItems,
            mode: 'payment',
            success_url: successUrl,
            cancel_url: cancelUrl,
            customer_email: payload?.contacto?.email,
            metadata: { temp_token: token }
        });

        res.json({ success: true, sessionId: session.id, url: session.url, tempToken: token });
    } catch (error) {
        console.error('❌ Error crear-session-v2:', error);
        res.status(500).json({ error: 'Error al crear sesión de pago', details: error.message });
    }
});

/**
 * GET /api/pedidos/:numeroPedido - Obtener detalles de un pedido
 */
app.get('/api/pedidos/:numeroPedido', (req, res) => {
    try {
        const { numeroPedido } = req.params;
        const pedido = db.obtenerPedido(numeroPedido);

        if (!pedido) {
            return res.status(404).json({ error: 'Pedido no encontrado' });
        }

        res.json({
            success: true,
            pedido
        });

    } catch (error) {
        console.error('❌ Error al obtener pedido:', error);
        res.status(500).json({ 
            error: 'Error al obtener el pedido',
            details: error.message 
        });
    }
});

/**
 * GET /api/pedidos - Listar pedidos con filtros opcionales
 */
app.get('/api/pedidos', (req, res) => {
    try {
        const filtros = {
            estado: req.query.estado,
            email: req.query.email,
            desde: req.query.desde,
            hasta: req.query.hasta,
            limite: req.query.limite ? parseInt(req.query.limite) : undefined
        };

        const pedidos = db.listarPedidos(filtros);

        res.json({
            success: true,
            count: pedidos.length,
            pedidos
        });

    } catch (error) {
        console.error('❌ Error al listar pedidos:', error);
        res.status(500).json({ 
            error: 'Error al listar pedidos',
            details: error.message 
        });
    }
});

/**
 * PUT /api/pedidos/:numeroPedido/estado - Actualizar estado de un pedido
 */
app.put('/api/pedidos/:numeroPedido/estado', (req, res) => {
    try {
        const { numeroPedido } = req.params;
        const { estado, notas } = req.body;

        if (!estado) {
            return res.status(400).json({ error: 'Estado requerido' });
        }

        const estadosValidos = ['pendiente_pago', 'pago_confirmado', 'en_produccion', 'completado', 'enviado', 'entregado', 'cancelado'];
        if (!estadosValidos.includes(estado)) {
            return res.status(400).json({ error: 'Estado no válido' });
        }

        db.actualizarEstado(numeroPedido, estado, notas);

        console.log(`✅ Estado actualizado para ${numeroPedido}: ${estado}`);

        res.json({
            success: true,
            message: 'Estado actualizado correctamente'
        });

    } catch (error) {
        console.error('❌ Error al actualizar estado:', error);
        res.status(500).json({ 
            error: 'Error al actualizar estado',
            details: error.message 
        });
    }
});

/**
 * POST /api/pedidos/:numeroPedido/enviar-emails - Enviar emails de confirmación
 */
app.post('/api/pedidos/:numeroPedido/enviar-emails', async (req, res) => {
    try {
        const { numeroPedido } = req.params;
        const pedido = db.obtenerPedido(numeroPedido);

        if (!pedido) {
            return res.status(404).json({ error: 'Pedido no encontrado' });
        }

        console.log(`📧 Enviando emails de confirmación para pedido ${numeroPedido}...`);

        const resultados = await emailService.enviarEmailsConfirmacion(pedido);

        res.json({
            success: resultados.exito,
            resultados,
            message: resultados.exito ? 'Emails enviados correctamente' : 'Error al enviar algunos emails'
        });

    } catch (error) {
        console.error('❌ Error al enviar emails:', error);
        res.status(500).json({ 
            error: 'Error al enviar emails',
            details: error.message 
        });
    }
});

/**
 * POST /api/pedidos/:numeroPedido/confirmar-pago - Confirmar pago exitoso
 * Verifica el estado de la sesión de Stripe si se proporciona session_id
 */
app.post('/api/pedidos/:numeroPedido/confirmar-pago', async (req, res) => {
    try {
        const { numeroPedido } = req.params;
        const { session_id } = req.query;

        const pedido = db.obtenerPedido(numeroPedido);

        if (!pedido) {
            return res.status(404).json({ error: 'Pedido no encontrado' });
        }

        // Si hay session_id, verificar con Stripe que el pago está realizado
        if (session_id) {
            const session = await stripe.checkout.sessions.retrieve(session_id);
            if (session.payment_status !== 'paid') {
                return res.status(400).json({ error: 'El pago no está confirmado aún' });
            }

            // Marcar como pagado con payment_intent
            db.marcarComoPagado(numeroPedido, session.payment_intent);
        } else {
            // Sin verificación (fallback) - marcar como pagado sin payment_intent
            db.marcarComoPagado(numeroPedido, pedido.stripe_payment_intent || null);
        }

        console.log(`✅ Pago confirmado para pedido ${numeroPedido}`);

        res.json({
            success: true,
            message: 'Pago confirmado correctamente'
        });

    } catch (error) {
        console.error('❌ Error al confirmar pago:', error);
        res.status(500).json({ 
            error: 'Error al confirmar pago',
            details: error.message 
        });
    }
});

/**
 * POST /api/pagos/confirmar - Confirmar pago con session_id (flujo v2)
 * Crea el pedido en BD, mueve fotos desde temp a carpeta final, envía emails.
 */
app.post('/api/pagos/confirmar', async (req, res) => {
    try {
        const { session_id } = req.query;
        if (!session_id) return res.status(400).json({ error: 'session_id requerido' });

        const session = await stripe.checkout.sessions.retrieve(session_id);
        if (!session || session.payment_status !== 'paid') {
            return res.status(400).json({ error: 'El pago no está confirmado' });
        }

        const tempToken = session.metadata?.temp_token;
        if (!tempToken) return res.status(400).json({ error: 'Falta temp_token en metadata' });

        const dir = path.join(TEMP_DIR, tempToken);
        const payloadPath = path.join(dir, 'order.json');
        if (!fs.existsSync(payloadPath)) return res.status(404).json({ error: 'Payload temporal no encontrado' });
        const payload = JSON.parse(fs.readFileSync(payloadPath, 'utf8'));

        // Generar número de pedido y calcular importes del payload
        const numeroPedido = generarNumeroPedido();
        const precio_base = Number(payload.precios?.base || 0);
        const precio_extras = Number(payload.precios?.extras || 0);
        const precio_total = Number(payload.precios?.total || (precio_base + precio_extras));

        // Crear pedido en BD como pagado
        const pedidoData = {
            numero_pedido: numeroPedido,
            cliente_nombre: payload.contacto?.nombre,
            cliente_apellidos: payload.contacto?.apellidos,
            cliente_email: payload.contacto?.email,
            cliente_telefono: payload.contacto?.telefono,
            producto_tipo: payload.producto?.tipo,
            producto_nombre: payload.producto?.nombre,
            cantidad: payload.cantidad || 1,
            cantidad_litofanias: payload.cantidadLitofanias || null,
            plazo_entrega: payload.plazo,
            precio_base,
            precio_extras,
            precio_descuento: 0,
            precio_total,
            estado: 'pago_confirmado',
            newsletter: payload.newsletter ? 1 : 0,
            extras: Array.isArray(payload.extras) ? payload.extras : []
        };
        const pedidoId = db.crearPedido(pedidoData);
        db.marcarComoPagado(numeroPedido, session.payment_intent);

        // Insertar extras
        if (Array.isArray(payload.extras) && payload.extras.length > 0) {
            // ya los inserta crearPedido; si no, podríamos insertar aquí
        }

        // Mover fotos a carpeta final del pedido
        const finalDir = path.join(UPLOADS_DIR, 'pedidos', numeroPedido);
        if (!fs.existsSync(finalDir)) fs.mkdirSync(finalDir, { recursive: true });
        let attachments = [];
        if (fs.existsSync(dir)) {
            const files = fs.readdirSync(dir);
            files.forEach(fname => {
                if (fname === 'order.json') return;
                const src = path.join(dir, fname);
                const dst = path.join(finalDir, fname);
                fs.renameSync(src, dst);
                attachments.push({ filename: fname, path: dst });
            });
        }

        // Enviar emails (adjuntar fotos solo a empresa)
        const pedido = db.obtenerPedido(numeroPedido);
        await emailService.enviarEmailsConfirmacion(pedido, { empresaAdjuntos: attachments });

        // Limpiar carpeta temporal
        try { fs.rmSync(dir, { recursive: true, force: true }); } catch {}

        res.json({ success: true, numeroPedido, pedido });
    } catch (error) {
        console.error('❌ Error al confirmar pago (v2):', error);
        res.status(500).json({ error: 'Error al confirmar pago', details: error.message });
    }
});

/**
 * GET /api/pedidos/:numeroPedido/historial - Obtener historial de un pedido
 */
app.get('/api/pedidos/:numeroPedido/historial', (req, res) => {
    try {
        const { numeroPedido } = req.params;
        const historial = db.obtenerHistorial(numeroPedido);

        res.json({
            success: true,
            historial
        });

    } catch (error) {
        console.error('❌ Error al obtener historial:', error);
        res.status(500).json({ 
            error: 'Error al obtener historial',
            details: error.message 
        });
    }
});

/**
 * GET /api/estadisticas - Obtener estadísticas generales
 */
app.get('/api/estadisticas', (req, res) => {
    try {
        const stats = db.obtenerEstadisticas();

        res.json({
            success: true,
            estadisticas: stats
        });

    } catch (error) {
        console.error('❌ Error al obtener estadísticas:', error);
        res.status(500).json({ 
            error: 'Error al obtener estadísticas',
            details: error.message 
        });
    }
});

/**
 * POST /webhook/stripe - Webhook de Stripe para confirmar pagos
 * Nota: Este endpoint debe usar bodyParser.raw() en vez de bodyParser.json()
 */
app.post('/webhook/stripe', 
    bodyParser.raw({ type: 'application/json' }),
    async (req, res) => {
        const sig = req.headers['stripe-signature'];
        let event;

        try {
            event = stripe.webhooks.constructEvent(
                req.body,
                sig,
                process.env.STRIPE_WEBHOOK_SECRET
            );
        } catch (err) {
            console.error('❌ Error en webhook de Stripe:', err.message);
            return res.status(400).send(`Webhook Error: ${err.message}`);
        }

        // Manejar el evento
        if (event.type === 'checkout.session.completed') {
            const session = event.data.object;
            const numeroPedido = session.client_reference_id || session.metadata.numero_pedido;

            console.log(`✅ Pago confirmado para pedido ${numeroPedido}`);

            try {
                // Marcar pedido como pagado
                db.marcarComoPagado(numeroPedido, session.payment_intent);

                // Obtener pedido actualizado
                const pedido = db.obtenerPedido(numeroPedido);

                // Enviar emails de confirmación
                await emailService.enviarEmailsConfirmacion(pedido);

                console.log(`📧 Emails de confirmación enviados para ${numeroPedido}`);

            } catch (error) {
                console.error(`❌ Error al procesar pago confirmado:`, error);
            }
        }

        res.json({ received: true });
    }
);

// ==================== INICIAR SERVIDOR ====================

app.listen(PORT, () => {
    console.log(`✅ Servidor corriendo en http://localhost:${PORT}`);
    console.log(`📊 Estadísticas disponibles en http://localhost:${PORT}/api/estadisticas`);
    if (process.env.STRIPE_SECRET_KEY) {
        console.log(`💳 Stripe configurado con clave: ${process.env.STRIPE_SECRET_KEY.substring(0, 10)}...`);
    } else {
        console.log(`⚠️  Stripe NO configurado - verifica tu archivo .env`);
    }
});
