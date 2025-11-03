/**
 * Lógica de página de Pago Exitoso
 * Procesa la confirmación después del pago con Stripe
 */

const API_URL = 'http://localhost:3000/api';

/**
 * Procesar confirmación de pago exitoso
 */
async function procesarConfirmacion() {
    try {
        // Obtener parámetros de la URL
        const urlParams = new URLSearchParams(window.location.search);
        const numeroPedido = urlParams.get('pedido');
        const sessionId = urlParams.get('session_id');

        if (!numeroPedido) {
            throw new Error('No se encontró número de pedido');
        }

        console.log('📦 Procesando confirmación para pedido:', numeroPedido);

        // Obtener datos del pedido del servidor
        const response = await fetch(`${API_URL}/pedidos/${numeroPedido}`);
        
        if (!response.ok) {
            throw new Error('Error al obtener datos del pedido');
        }

        const data = await response.json();
        const pedido = data.pedido;

        console.log('📦 Pedido recuperado:', pedido);

        // Mostrar detalles del pedido
        mostrarDetallesPedido(pedido);

        // Enviar emails de confirmación
        const emailStatus = document.getElementById('email-status');
        emailStatus.innerHTML = '<div class="loading-spinner" style="width: 30px; height: 30px;"></div><p>Enviando confirmaciones por email...</p>';

        const emailResponse = await fetch(`${API_URL}/pedidos/${numeroPedido}/enviar-emails`, {
            method: 'POST'
        });

        const emailData = await emailResponse.json();

        // Mostrar resultado del envío de emails
        if (emailData.success) {
            emailStatus.className = 'email-status';
            emailStatus.innerHTML = `
                <strong>✅ Confirmación enviada</strong>
                <p>Hemos enviado un email de confirmación a: <strong>${pedido.cliente_email}</strong></p>
                <p style="font-size: 0.9rem; color: #666; margin-top: 0.5rem;">
                    Revisa tu bandeja de entrada y spam. Si no recibes el email en unos minutos, contacta con nosotros.
                </p>
            `;
        } else {
            emailStatus.className = 'email-status error';
            emailStatus.innerHTML = `
                <strong>⚠️ Error al enviar emails</strong>
                <p>Tu pedido se procesó correctamente, pero hubo un problema al enviar la confirmación.</p>
                <p>Número de pedido: <strong>${pedido.numero_pedido}</strong></p>
                <p style="font-size: 0.9rem;">Por favor, guarda este número y contacta con nosotros.</p>
            `;
        }

        // Mostrar sección de éxito
        document.getElementById('loading-section').style.display = 'none';
        document.getElementById('success-section').style.display = 'block';

    } catch (error) {
        console.error('❌ Error al procesar confirmación:', error);
        
        // Mostrar sección de error
        document.getElementById('loading-section').style.display = 'none';
        document.getElementById('error-section').style.display = 'block';
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
    // Verificar si venimos de Stripe con parámetro de pedido
    const urlParams = new URLSearchParams(window.location.search);
    const numeroPedido = urlParams.get('pedido');

    if (numeroPedido) {
        console.log('✅ Confirmación de pago para pedido:', numeroPedido);
        procesarConfirmacion();
    } else {
        // No hay número de pedido, mostrar error
        document.getElementById('loading-section').style.display = 'none';
        document.getElementById('error-section').style.display = 'block';
    }
});
