/**
 * Base de Datos SQLite para Pedidos
 * Gestiona la creación y operaciones de la base de datos
 */

const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

// Asegurar que existe el directorio de base de datos
const dbDir = path.join(__dirname, '..', 'database');
if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
}

const dbPath = process.env.DB_PATH || path.join(dbDir, 'pedidos.db');
const db = new Database(dbPath);

// Habilitar foreign keys
db.pragma('foreign_keys = ON');

/**
 * Inicializar tablas de la base de datos
 */
function initDatabase() {
    // Tabla de pedidos
    db.exec(`
        CREATE TABLE IF NOT EXISTS pedidos (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            numero_pedido TEXT UNIQUE NOT NULL,
            fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
            fecha_pago DATETIME,
            
            -- Datos del cliente
            cliente_nombre TEXT NOT NULL,
            cliente_apellidos TEXT NOT NULL,
            cliente_email TEXT NOT NULL,
            cliente_telefono TEXT NOT NULL,
            
            -- Datos del producto
            producto_tipo TEXT NOT NULL,
            producto_nombre TEXT NOT NULL,
            cantidad INTEGER DEFAULT 1,
            cantidad_litofanias INTEGER,
            plazo_entrega INTEGER NOT NULL,
            
            -- Precios
            precio_base DECIMAL(10, 2) NOT NULL,
            precio_extras DECIMAL(10, 2) DEFAULT 0,
            precio_descuento DECIMAL(10, 2) DEFAULT 0,
            precio_total DECIMAL(10, 2) NOT NULL,
            
            -- Estado y pago
            estado TEXT DEFAULT 'pendiente_pago',
            pagado BOOLEAN DEFAULT 0,
            stripe_session_id TEXT,
            stripe_payment_intent TEXT,
            
            -- Newsletter y notas
            newsletter BOOLEAN DEFAULT 0,
            notas TEXT,
            
            -- Control
            ultima_actualizacion DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);

    // Tabla de extras del pedido
    db.exec(`
        CREATE TABLE IF NOT EXISTS pedido_extras (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            pedido_id INTEGER NOT NULL,
            extra_id TEXT NOT NULL,
            extra_nombre TEXT NOT NULL,
            extra_precio DECIMAL(10, 2) NOT NULL,
            FOREIGN KEY (pedido_id) REFERENCES pedidos(id) ON DELETE CASCADE
        )
    `);

    // Tabla de estados del pedido (historial)
    db.exec(`
        CREATE TABLE IF NOT EXISTS pedido_historial (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            pedido_id INTEGER NOT NULL,
            estado_anterior TEXT,
            estado_nuevo TEXT NOT NULL,
            fecha DATETIME DEFAULT CURRENT_TIMESTAMP,
            notas TEXT,
            FOREIGN KEY (pedido_id) REFERENCES pedidos(id) ON DELETE CASCADE
        )
    `);

    // Índices para búsquedas rápidas
    db.exec(`
        CREATE INDEX IF NOT EXISTS idx_numero_pedido ON pedidos(numero_pedido);
        CREATE INDEX IF NOT EXISTS idx_cliente_email ON pedidos(cliente_email);
        CREATE INDEX IF NOT EXISTS idx_estado ON pedidos(estado);
        CREATE INDEX IF NOT EXISTS idx_fecha_creacion ON pedidos(fecha_creacion);
    `);

    console.log('✅ Base de datos inicializada correctamente');
}

/**
 * Crear un nuevo pedido
 */
function crearPedido(pedidoData) {
    const stmt = db.prepare(`
        INSERT INTO pedidos (
            numero_pedido, cliente_nombre, cliente_apellidos, cliente_email, cliente_telefono,
            producto_tipo, producto_nombre, cantidad, cantidad_litofanias, plazo_entrega,
            precio_base, precio_extras, precio_descuento, precio_total,
            estado, newsletter
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const result = stmt.run(
        pedidoData.numero_pedido,
        pedidoData.cliente_nombre,
        pedidoData.cliente_apellidos,
        pedidoData.cliente_email,
        pedidoData.cliente_telefono,
        pedidoData.producto_tipo,
        pedidoData.producto_nombre,
        pedidoData.cantidad || 1,
        pedidoData.cantidad_litofanias || null,
        pedidoData.plazo_entrega,
        pedidoData.precio_base,
        pedidoData.precio_extras,
        pedidoData.precio_descuento,
        pedidoData.precio_total,
        pedidoData.estado || 'pendiente_pago',
        pedidoData.newsletter ? 1 : 0
    );

    const pedidoId = result.lastInsertRowid;

    // Insertar extras si existen
    if (pedidoData.extras && pedidoData.extras.length > 0) {
        const stmtExtra = db.prepare(`
            INSERT INTO pedido_extras (pedido_id, extra_id, extra_nombre, extra_precio)
            VALUES (?, ?, ?, ?)
        `);

        for (const extra of pedidoData.extras) {
            stmtExtra.run(pedidoId, extra.id, extra.nombre, extra.precio);
        }
    }

    // Registrar en historial
    registrarHistorial(pedidoId, null, pedidoData.estado || 'pendiente_pago', 'Pedido creado');

    return pedidoId;
}

/**
 * Obtener pedido por número
 */
function obtenerPedido(numeroPedido) {
    const pedido = db.prepare('SELECT * FROM pedidos WHERE numero_pedido = ?').get(numeroPedido);
    
    if (!pedido) return null;

    // Obtener extras
    const extras = db.prepare('SELECT * FROM pedido_extras WHERE pedido_id = ?').all(pedido.id);
    pedido.extras = extras;

    return pedido;
}

/**
 * Obtener pedido por ID de sesión de Stripe
 */
function obtenerPedidoPorSessionId(sessionId) {
    const pedido = db.prepare('SELECT * FROM pedidos WHERE stripe_session_id = ?').get(sessionId);
    
    if (!pedido) return null;

    const extras = db.prepare('SELECT * FROM pedido_extras WHERE pedido_id = ?').all(pedido.id);
    pedido.extras = extras;

    return pedido;
}

/**
 * Listar todos los pedidos con filtros opcionales
 */
function listarPedidos(filtros = {}) {
    let query = 'SELECT * FROM pedidos WHERE 1=1';
    const params = [];

    if (filtros.estado) {
        query += ' AND estado = ?';
        params.push(filtros.estado);
    }

    if (filtros.email) {
        query += ' AND cliente_email = ?';
        params.push(filtros.email);
    }

    if (filtros.desde) {
        query += ' AND fecha_creacion >= ?';
        params.push(filtros.desde);
    }

    if (filtros.hasta) {
        query += ' AND fecha_creacion <= ?';
        params.push(filtros.hasta);
    }

    query += ' ORDER BY fecha_creacion DESC';

    if (filtros.limite) {
        query += ' LIMIT ?';
        params.push(filtros.limite);
    }

    return db.prepare(query).all(...params);
}

/**
 * Actualizar estado del pedido
 */
function actualizarEstado(numeroPedido, nuevoEstado, notas = null) {
    const pedido = obtenerPedido(numeroPedido);
    if (!pedido) {
        throw new Error('Pedido no encontrado');
    }

    const stmt = db.prepare(`
        UPDATE pedidos 
        SET estado = ?, ultima_actualizacion = CURRENT_TIMESTAMP, notas = ?
        WHERE numero_pedido = ?
    `);

    stmt.run(nuevoEstado, notas, numeroPedido);

    // Registrar en historial
    registrarHistorial(pedido.id, pedido.estado, nuevoEstado, notas);

    return true;
}

/**
 * Marcar pedido como pagado
 */
function marcarComoPagado(numeroPedido, paymentIntentId) {
    const stmt = db.prepare(`
        UPDATE pedidos 
        SET pagado = 1, 
            estado = 'pago_confirmado', 
            fecha_pago = CURRENT_TIMESTAMP,
            stripe_payment_intent = ?,
            ultima_actualizacion = CURRENT_TIMESTAMP
        WHERE numero_pedido = ?
    `);

    stmt.run(paymentIntentId, numeroPedido);

    const pedido = obtenerPedido(numeroPedido);
    registrarHistorial(pedido.id, 'pendiente_pago', 'pago_confirmado', 'Pago confirmado por Stripe');

    return true;
}

/**
 * Asociar sesión de Stripe al pedido
 */
function asociarStripeSession(numeroPedido, sessionId) {
    const stmt = db.prepare(`
        UPDATE pedidos 
        SET stripe_session_id = ?
        WHERE numero_pedido = ?
    `);

    stmt.run(sessionId, numeroPedido);
}

/**
 * Registrar cambio en historial
 */
function registrarHistorial(pedidoId, estadoAnterior, estadoNuevo, notas = null) {
    const stmt = db.prepare(`
        INSERT INTO pedido_historial (pedido_id, estado_anterior, estado_nuevo, notas)
        VALUES (?, ?, ?, ?)
    `);

    stmt.run(pedidoId, estadoAnterior, estadoNuevo, notas);
}

/**
 * Obtener historial de un pedido
 */
function obtenerHistorial(numeroPedido) {
    const pedido = obtenerPedido(numeroPedido);
    if (!pedido) return [];

    return db.prepare(`
        SELECT * FROM pedido_historial 
        WHERE pedido_id = ? 
        ORDER BY fecha DESC
    `).all(pedido.id);
}

/**
 * Obtener estadísticas
 */
function obtenerEstadisticas() {
    const stats = {
        total: db.prepare('SELECT COUNT(*) as count FROM pedidos').get().count,
        pendientes: db.prepare("SELECT COUNT(*) as count FROM pedidos WHERE estado = 'pendiente_pago'").get().count,
        confirmados: db.prepare("SELECT COUNT(*) as count FROM pedidos WHERE pagado = 1").get().count,
        totalVentas: db.prepare('SELECT SUM(precio_total) as total FROM pedidos WHERE pagado = 1').get().total || 0,
        hoy: db.prepare("SELECT COUNT(*) as count FROM pedidos WHERE DATE(fecha_creacion) = DATE('now')").get().count
    };

    return stats;
}

// Exportar funciones
module.exports = {
    initDatabase,
    crearPedido,
    obtenerPedido,
    obtenerPedidoPorSessionId,
    listarPedidos,
    actualizarEstado,
    marcarComoPagado,
    asociarStripeSession,
    obtenerHistorial,
    obtenerEstadisticas,
    db
};
