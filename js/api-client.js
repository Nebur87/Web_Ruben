/**
 * Cliente API para comunicarse con el backend
 * Reemplaza los módulos de payment.js y email.js
 */

const API_URL = 'http://localhost:3000/api';

/**
 * Crear un nuevo pedido en el servidor (flujo V1)
 */
async function crearPedido(formData) {
    try {
        const response = await fetch(`${API_URL}/pedidos/crear`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Error al crear pedido');
        }

        const data = await response.json();
        return data;

    } catch (error) {
        console.error('❌ Error al crear pedido:', error);
        throw error;
    }
}

/**
 * Crear sesión de pago de Stripe (flujo V1)
 */
async function crearSessionPago(numeroPedido) {
    try {
        const response = await fetch(`${API_URL}/pagos/crear-session`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ numeroPedido })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Error al crear sesión de pago');
        }

        const data = await response.json();
        return data;

    } catch (error) {
        console.error('❌ Error al crear sesión de pago:', error);
        throw error;
    }
}

/**
 * Redirigir a la página de pago de Stripe
 */
function redirigirAPago(url) {
    window.location.href = url;
}

/**
 * Subir fotos temporalmente (flujo V2 sin pedido previo)
 * formData debe contener uno o más campos 'fotos[]'
 */
async function subirFotosTemporales(formData) {
    try {
        const response = await fetch(`${API_URL}/uploads/temp`, {
            method: 'POST',
            body: formData
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({}));
            throw new Error(error.error || 'Error al subir fotos');
        }

        return await response.json();
    } catch (error) {
        console.error('❌ Error al subir fotos temporales:', error);
        throw error;
    }
}

/**
 * Crear sesión de pago (flujo V2 sin pedido previo)
 * payload: objeto con { contacto, producto, cantidad, cantidadLitofanias, plazo, extras[], precios, newsletter }
 * tempToken: token devuelto por la subida temporal de fotos
 */
async function crearSessionPagoV2(payload, tempToken) {
    try {
        const response = await fetch(`${API_URL}/pagos/crear-session-v2`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ payload, tempToken })
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({}));
            throw new Error(error.error || 'Error al crear sesión de pago');
        }

        return await response.json();
    } catch (error) {
        console.error('❌ Error al crear sesión de pago (v2):', error);
        throw error;
    }
}

// Exportar funciones
window.APIClient = {
    crearPedido,
    crearSessionPago,
    redirigirAPago,
    subirFotosTemporales,
    crearSessionPagoV2
};
