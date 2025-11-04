/**
 * Panel de Administración de Pedidos
 * Gestión completa de pedidos desde el frontend
 */

const API_URL = 'http://localhost:3000/api';

let pedidosData = [];
let pedidoActual = null;

// ==================== INICIALIZACIÓN ====================

document.addEventListener('DOMContentLoaded', function() {
    cargarEstadisticas();
    cargarPedidos();

    // Event listeners
    document.getElementById('btn-refresh').addEventListener('click', function() {
        cargarEstadisticas();
        cargarPedidos();
    });

    document.getElementById('btn-aplicar-filtros').addEventListener('click', aplicarFiltros);
    document.getElementById('btn-limpiar-filtros').addEventListener('click', limpiarFiltros);
    
    // Búsqueda en tiempo real
    document.getElementById('search-box').addEventListener('input', filtrarTabla);
});

// ==================== ESTADÍSTICAS ====================

async function cargarEstadisticas() {
    try {
        const response = await fetch(`${API_URL}/estadisticas`);
        
        if (!response.ok) {
            throw new Error('Error al cargar estadísticas');
        }

        const data = await response.json();
        const stats = data.estadisticas;

        // Actualizar valores
        document.getElementById('stat-total').textContent = stats.total;
        document.getElementById('stat-pendientes').textContent = stats.pendientes;
        document.getElementById('stat-confirmados').textContent = stats.confirmados;
        document.getElementById('stat-ventas').textContent = `${parseFloat(stats.totalVentas || 0).toFixed(2)}€`;
        document.getElementById('stat-hoy').textContent = stats.hoy;

    } catch (error) {
        console.error('Error al cargar estadísticas:', error);
    }
}

// ==================== PEDIDOS ====================

async function cargarPedidos() {
    mostrarLoading();

    try {
        const response = await fetch(`${API_URL}/pedidos`);
        
        if (!response.ok) {
            throw new Error('Error al cargar pedidos');
        }

        const data = await response.json();
        pedidosData = data.pedidos || [];

        if (pedidosData.length === 0) {
            mostrarSinResultados();
        } else {
            mostrarTabla();
            renderizarPedidos(pedidosData);
        }

    } catch (error) {
        console.error('Error al cargar pedidos:', error);
        mostrarError(error.message);
    }
}

async function aplicarFiltros() {
    mostrarLoading();

    try {
        const estado = document.getElementById('filter-estado').value;
        const limite = document.getElementById('filter-limite').value;

        let url = `${API_URL}/pedidos?`;
        const params = [];

        if (estado) params.push(`estado=${estado}`);
        if (limite) params.push(`limite=${limite}`);

        url += params.join('&');

        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error('Error al aplicar filtros');
        }

        const data = await response.json();
        pedidosData = data.pedidos || [];

        if (pedidosData.length === 0) {
            mostrarSinResultados();
        } else {
            mostrarTabla();
            renderizarPedidos(pedidosData);
        }

    } catch (error) {
        console.error('Error al aplicar filtros:', error);
        mostrarError(error.message);
    }
}

function limpiarFiltros() {
    document.getElementById('filter-estado').value = '';
    document.getElementById('filter-limite').value = '20';
    document.getElementById('search-box').value = '';
    cargarPedidos();
}

function filtrarTabla() {
    const searchTerm = document.getElementById('search-box').value.toLowerCase();
    
    if (!searchTerm) {
        renderizarPedidos(pedidosData);
        return;
    }

    const filtrados = pedidosData.filter(pedido => {
        return pedido.numero_pedido.toLowerCase().includes(searchTerm) ||
               pedido.cliente_email.toLowerCase().includes(searchTerm) ||
               pedido.cliente_nombre.toLowerCase().includes(searchTerm) ||
               pedido.cliente_apellidos.toLowerCase().includes(searchTerm);
    });

    if (filtrados.length === 0) {
        mostrarSinResultados();
    } else {
        mostrarTabla();
        renderizarPedidos(filtrados);
    }
}

// ==================== RENDERIZADO ====================

function renderizarPedidos(pedidos) {
    const tbody = document.getElementById('pedidos-tbody');
    tbody.innerHTML = '';

    pedidos.forEach(pedido => {
        const tr = document.createElement('tr');
        
        const fechaFormateada = new Date(pedido.fecha_creacion).toLocaleDateString('es-ES', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });

        tr.innerHTML = `
            <td><strong>${pedido.numero_pedido}</strong></td>
            <td>${fechaFormateada}</td>
            <td>
                <div>${pedido.cliente_nombre} ${pedido.cliente_apellidos}</div>
                <small style="color: #666;">${pedido.cliente_email}</small>
            </td>
            <td>${pedido.producto_nombre}</td>
            <td><strong>${parseFloat(pedido.precio_total).toFixed(2)}€</strong></td>
            <td>${getBadgeEstado(pedido.estado)}</td>
            <td>${getBadgePagado(pedido.pagado)}</td>
            <td>
                <div class="action-buttons">
                    <button class="btn-icon" onclick="verDetalle('${pedido.numero_pedido}')" title="Ver detalles">
                        👁️
                    </button>
                    <button class="btn-icon" onclick="cambiarEstado('${pedido.numero_pedido}', '${pedido.estado}')" title="Cambiar estado">
                        ✏️
                    </button>
                    <button class="btn-icon" onclick="reenviarEmails('${pedido.numero_pedido}')" title="Reenviar emails">
                        📧
                    </button>
                </div>
            </td>
        `;

        tbody.appendChild(tr);
    });

    // Actualizar contador
    document.getElementById('total-count').textContent = `Total: ${pedidos.length} pedido${pedidos.length !== 1 ? 's' : ''}`;
}

function getBadgeEstado(estado) {
    const badges = {
        'pendiente_pago': '<span class="badge badge-pendiente">Pendiente Pago</span>',
        'pago_confirmado': '<span class="badge badge-confirmado">Pago Confirmado</span>',
        'en_produccion': '<span class="badge badge-produccion">En Producción</span>',
        'completado': '<span class="badge badge-completado">Completado</span>',
        'enviado': '<span class="badge badge-enviado">Enviado</span>',
        'entregado': '<span class="badge badge-entregado">Entregado</span>',
        'cancelado': '<span class="badge badge-cancelado">Cancelado</span>'
    };

    return badges[estado] || `<span class="badge">${estado}</span>`;
}

function getBadgePagado(pagado) {
    return pagado 
        ? '<span class="badge badge-pagado">✓ Sí</span>'
        : '<span class="badge badge-no-pagado">✗ No</span>';
}

// ==================== ESTADOS DE LA UI ====================

function mostrarLoading() {
    document.getElementById('loading').style.display = 'block';
    document.getElementById('error').style.display = 'none';
    document.getElementById('tabla-container').style.display = 'none';
    document.getElementById('no-results').style.display = 'none';
}

function mostrarTabla() {
    document.getElementById('loading').style.display = 'none';
    document.getElementById('error').style.display = 'none';
    document.getElementById('tabla-container').style.display = 'block';
    document.getElementById('no-results').style.display = 'none';
}

function mostrarError(mensaje) {
    document.getElementById('loading').style.display = 'none';
    document.getElementById('error').style.display = 'block';
    document.getElementById('tabla-container').style.display = 'none';
    document.getElementById('no-results').style.display = 'none';
    document.getElementById('error-message').textContent = mensaje;
}

function mostrarSinResultados() {
    document.getElementById('loading').style.display = 'none';
    document.getElementById('error').style.display = 'none';
    document.getElementById('tabla-container').style.display = 'none';
    document.getElementById('no-results').style.display = 'block';
}

// ==================== DETALLES DEL PEDIDO ====================

async function verDetalle(numeroPedido) {
    try {
        const response = await fetch(`${API_URL}/pedidos/${numeroPedido}`);
        
        if (!response.ok) {
            throw new Error('Error al cargar detalles');
        }

        const data = await response.json();
        const pedido = data.pedido;

        // Cargar historial
        const historialResponse = await fetch(`${API_URL}/pedidos/${numeroPedido}/historial`);
        const historialData = await historialResponse.json();
        const historial = historialData.historial || [];

        mostrarModalDetalle(pedido, historial);

    } catch (error) {
        console.error('Error al cargar detalles:', error);
        alert('Error al cargar los detalles del pedido');
    }
}

function mostrarModalDetalle(pedido, historial) {
    const modal = document.getElementById('modal-pedido');
    const modalBody = document.getElementById('modal-body');
    
    document.getElementById('modal-titulo').textContent = `Pedido ${pedido.numero_pedido}`;

    const fechaFormateada = new Date(pedido.fecha_creacion).toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });

    let extrasHTML = '';
    if (pedido.extras && pedido.extras.length > 0) {
        extrasHTML = pedido.extras.map(e => `
            <div class="detail-item">
                <div class="detail-label">${e.extra_nombre}</div>
                <div class="detail-value">${parseFloat(e.extra_precio).toFixed(2)}€</div>
            </div>
        `).join('');
    } else {
        extrasHTML = '<p style="color: #666;">Sin extras</p>';
    }

    let historialHTML = '';
    if (historial.length > 0) {
        historialHTML = historial.map(h => {
            const fecha = new Date(h.fecha).toLocaleString('es-ES');
            return `
                <div class="historial-item">
                    <div class="historial-fecha">${fecha}</div>
                    <div class="historial-cambio">
                        ${h.estado_anterior ? `${h.estado_anterior} → ` : ''}${h.estado_nuevo}
                    </div>
                    ${h.notas ? `<div class="historial-notas">${h.notas}</div>` : ''}
                </div>
            `;
        }).join('');
    } else {
        historialHTML = '<p style="color: #666;">Sin historial</p>';
    }

    modalBody.innerHTML = `
        <!-- Cliente -->
        <div class="detail-section">
            <h3>📋 Información del Cliente</h3>
            <div class="detail-grid">
                <div class="detail-item">
                    <div class="detail-label">Nombre</div>
                    <div class="detail-value">${pedido.cliente_nombre} ${pedido.cliente_apellidos}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Email</div>
                    <div class="detail-value">${pedido.cliente_email}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Teléfono</div>
                    <div class="detail-value">${pedido.cliente_telefono}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Newsletter</div>
                    <div class="detail-value">${pedido.newsletter ? 'Sí' : 'No'}</div>
                </div>
            </div>
        </div>

        <!-- Pedido -->
        <div class="detail-section">
            <h3>📦 Detalles del Pedido</h3>
            <div class="detail-grid">
                <div class="detail-item">
                    <div class="detail-label">Número</div>
                    <div class="detail-value">${pedido.numero_pedido}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Fecha</div>
                    <div class="detail-value">${fechaFormateada}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Producto</div>
                    <div class="detail-value">${pedido.producto_nombre}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Plazo</div>
                    <div class="detail-value">${pedido.plazo_entrega} días</div>
                </div>
                ${pedido.cantidad_litofanias ? `
                <div class="detail-item">
                    <div class="detail-label">Litofanías</div>
                    <div class="detail-value">${pedido.cantidad_litofanias}</div>
                </div>
                ` : ''}
                <div class="detail-item">
                    <div class="detail-label">Estado</div>
                    <div class="detail-value">${getBadgeEstado(pedido.estado)}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Pagado</div>
                    <div class="detail-value">${getBadgePagado(pedido.pagado)}</div>
                </div>
            </div>
        </div>

        <!-- Extras -->
        <div class="detail-section">
            <h3>✨ Extras</h3>
            <div class="detail-grid">
                ${extrasHTML}
            </div>
        </div>

        <!-- Precios -->
        <div class="detail-section">
            <h3>💰 Desglose de Precios</h3>
            <div class="detail-grid">
                <div class="detail-item">
                    <div class="detail-label">Base</div>
                    <div class="detail-value">${parseFloat(pedido.precio_base).toFixed(2)}€</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Extras</div>
                    <div class="detail-value">${parseFloat(pedido.precio_extras).toFixed(2)}€</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Descuento</div>
                    <div class="detail-value" style="color: #10b981;">-${parseFloat(pedido.precio_descuento).toFixed(2)}€</div>
                </div>
                <div class="detail-item" style="background: var(--color-primary); color: white;">
                    <div class="detail-label" style="color: white;">TOTAL</div>
                    <div class="detail-value" style="color: white; font-size: 1.5rem;">${parseFloat(pedido.precio_total).toFixed(2)}€</div>
                </div>
            </div>
        </div>

        <!-- Historial -->
        <div class="detail-section">
            <h3>📅 Historial</h3>
            <div class="historial-list">
                ${historialHTML}
            </div>
        </div>

        ${pedido.notas ? `
        <div class="detail-section">
            <h3>📝 Notas</h3>
            <p>${pedido.notas}</p>
        </div>
        ` : ''}
    `;

    modal.style.display = 'flex';
}

function cerrarModal() {
    document.getElementById('modal-pedido').style.display = 'none';
}

// ==================== CAMBIAR ESTADO ====================

function cambiarEstado(numeroPedido, estadoActual) {
    pedidoActual = numeroPedido;
    
    document.getElementById('estado-numero-pedido').textContent = numeroPedido;
    document.getElementById('nuevo-estado').value = estadoActual;
    document.getElementById('notas-estado').value = '';
    
    document.getElementById('modal-estado').style.display = 'flex';
}

async function guardarEstado() {
    const numeroPedido = pedidoActual;
    const nuevoEstado = document.getElementById('nuevo-estado').value;
    const notas = document.getElementById('notas-estado').value;

    try {
        const response = await fetch(`${API_URL}/pedidos/${numeroPedido}/estado`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ estado: nuevoEstado, notas })
        });

        if (!response.ok) {
            throw new Error('Error al actualizar estado');
        }

        alert('Estado actualizado correctamente');
        cerrarModalEstado();
        cargarEstadisticas();
        cargarPedidos();

    } catch (error) {
        console.error('Error al actualizar estado:', error);
        alert('Error al actualizar el estado');
    }
}

function cerrarModalEstado() {
    document.getElementById('modal-estado').style.display = 'none';
    pedidoActual = null;
}

// ==================== REENVIAR EMAILS ====================

async function reenviarEmails(numeroPedido) {
    if (!confirm(`¿Reenviar emails de confirmación para el pedido ${numeroPedido}?`)) {
        return;
    }

    try {
        const response = await fetch(`${API_URL}/pedidos/${numeroPedido}/enviar-emails`, {
            method: 'POST'
        });

        if (!response.ok) {
            throw new Error('Error al enviar emails');
        }

        const data = await response.json();

        if (data.success) {
            alert('Emails enviados correctamente');
        } else {
            alert('Error al enviar algunos emails. Revisa la consola.');
        }

    } catch (error) {
        console.error('Error al enviar emails:', error);
        alert('Error al enviar los emails');
    }
}

// ==================== CERRAR MODALES AL HACER CLIC FUERA ====================

window.onclick = function(event) {
    const modalPedido = document.getElementById('modal-pedido');
    const modalEstado = document.getElementById('modal-estado');
    
    if (event.target === modalPedido) {
        cerrarModal();
    }
    if (event.target === modalEstado) {
        cerrarModalEstado();
    }
};
