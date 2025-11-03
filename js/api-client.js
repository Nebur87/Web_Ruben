/**
 * Cliente API para comunicarse con el backend
 * Reemplaza los módulos de payment.js y email.js
 */

const API_URL = 'http://localhost:3000/api';

/**
 * Crear un nuevo pedido en el servidor
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
 * Crear sesión de pago de Stripe
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

// Exportar funciones
window.APIClient = {
    crearPedido,
    crearSessionPago,
    redirigirAPago
};
