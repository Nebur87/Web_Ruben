/**
 * LITOARTE - Servidor Backend
 * API REST para gestión de pedidos, pagos con Stripe y envío de emails
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const db = require('./database');
const emailService = require('./emailService');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Inicializar base de datos
db.initDatabase();

console.log('🚀 Servidor LitoArte iniciando...');

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

        // Descuento (si existe)
        if (parseFloat(pedido.precio_descuento) > 0) {
            lineItems.push({
                price_data: {
                    currency: 'eur',
                    product_data: {
                        name: 'Descuento por plazo de entrega',
                    },
                    unit_amount: -Math.round(parseFloat(pedido.precio_descuento) * 100),
                },
                quantity: 1,
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
    console.log(`💳 Stripe configurado con clave: ${process.env.STRIPE_SECRET_KEY.substring(0, 10)}...`);
});
