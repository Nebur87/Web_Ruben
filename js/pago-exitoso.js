/**
 * Lógica de página de Pago Exitoso
 * Procesa la confirmación después del pago con Stripe
 */

const API_URL = 'http://localhost:3000/api';

/**
 * Procesar confirmación de pago exitoso (flujo V2 por session_id)
 */
let __confirmInFlight = false;
async function procesarConfirmacion() {
    if (__confirmInFlight) return;
    __confirmInFlight = true;
    try {
        // Obtener parámetros de la URL
        const urlParams = new URLSearchParams(window.location.search);
        const sessionId = urlParams.get('session_id');

        if (!sessionId) {
            throw new Error('No se encontró session_id');
        }

        console.log('📦 Confirmando pago con session_id:', sessionId);

        // Confirmar pago y crear pedido en servidor (v2)
        const confirmResponse = await fetch(`${API_URL}/pagos/confirmar?session_id=${encodeURIComponent(sessionId)}`, {
            method: 'POST'
        });

        if (!confirmResponse.ok) {
            const err = await confirmResponse.json().catch(() => ({}));
            throw new Error(err.error || 'Error al confirmar pago');
        }

        const confirmData = await confirmResponse.json();
        const pedido = confirmData.pedido;

        console.log('✅ Pago confirmado. Pedido creado:', confirmData.numeroPedido);

        // Mostrar detalles del pedido
        mostrarDetallesPedido(pedido);

        // Mostrar estado de email como informativo (el backend ya los envía)
        const emailStatus = document.getElementById('email-status');
        emailStatus.className = 'email-status';
        emailStatus.innerHTML = `
            <strong>✅ Confirmación enviada</strong>
            <p>Hemos enviado un email de confirmación a: <strong>${pedido.cliente_email}</strong></p>
            <p style="font-size: 0.9rem; color: #666; margin-top: 0.5rem;">
                Revisa tu bandeja de entrada y spam. Si no recibes el email en unos minutos, contacta con nosotros.
            </p>
        `;

        // Mostrar sección de éxito
        document.getElementById('loading-section').style.display = 'none';
        document.getElementById('success-section').style.display = 'block';

    } catch (error) {
        console.error('❌ Error al procesar confirmación:', error);
        
        // Mostrar sección de error
        document.getElementById('loading-section').style.display = 'none';
        document.getElementById('error-section').style.display = 'block';
    } finally {
        __confirmInFlight = false;
    }
}

/**
 * Mostrar detalles del pedido en la página
 */
function mostrarDetallesPedido(pedido) {
    const container = document.getElementById('pedido-details');
    
    let extrasHTML = '';
    if (pedido.extras && pedido.extras.length > 0) {
        extrasHTML = pedido.extras.map(e => 
            `<div class="detail-row">
                <span>${e.extra_nombre}</span>
                <span>${parseFloat(e.extra_precio).toFixed(2)}€</span>
            </div>`
        ).join('');
    }

    const fechaFormateada = new Date(pedido.fecha_creacion).toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });

    container.innerHTML = `
        <h3>Resumen del Pedido</h3>
        <div class="detail-row">
            <span><strong>Número de Pedido:</strong></span>
            <span><strong>${pedido.numero_pedido}</strong></span>
        </div>
        <div class="detail-row">
            <span>Fecha:</span>
            <span>${fechaFormateada}</span>
        </div>
        <div class="detail-row">
            <span>Producto:</span>
            <span>${pedido.producto_nombre}</span>
        </div>
        ${pedido.cantidad_litofanias ? `
        <div class="detail-row">
            <span>Cantidad de litofanías:</span>
            <span>${pedido.cantidad_litofanias}</span>
        </div>` : ''}
        <div class="detail-row">
            <span>Plazo de entrega:</span>
            <span>${pedido.plazo_entrega} días</span>
        </div>
        ${extrasHTML}
        ${parseFloat(pedido.precio_descuento) > 0 ? `
        <div class="detail-row">
            <span>Descuento:</span>
            <span style="color: #4caf50;">-${parseFloat(pedido.precio_descuento).toFixed(2)}€</span>
        </div>` : ''}
        <div class="detail-row">
            <span>TOTAL PAGADO:</span>
            <span>${parseFloat(pedido.precio_total).toFixed(2)}€</span>
        </div>
    `;
}

// Ejecutar al cargar la página
document.addEventListener('DOMContentLoaded', function() {
    // Verificar si venimos de Stripe con session_id
    const urlParams = new URLSearchParams(window.location.search);
    const sessionId = urlParams.get('session_id');

    if (sessionId) {
        console.log('✅ Confirmación de pago con session_id:', sessionId);
        procesarConfirmacion();
    } else {
        // No hay session_id, mostrar error
        document.getElementById('loading-section').style.display = 'none';
        document.getElementById('error-section').style.display = 'block';
    }
});
