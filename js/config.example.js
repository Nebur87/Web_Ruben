/**
 * LITOARTE - Configuración de Servicios Externos (EJEMPLO)
 * 
 * ⚠️ INSTRUCCIONES:
 * 1. Copia este archivo y renómbralo a "config.js"
 * 2. Reemplaza los valores de ejemplo con tus claves reales
 * 3. Lee el archivo SETUP.md para obtener instrucciones detalladas
 * 
 * IMPORTANTE: NO subir config.js con claves reales a GitHub
 * El archivo config.js está en .gitignore por seguridad
 */

const CONFIG = {
    // ===== STRIPE - Pasarela de Pagos =====
    // Obtener en: https://dashboard.stripe.com/test/apikeys
    stripe: {
        publicKey: 'pk_test_TU_CLAVE_PUBLICA_DE_STRIPE', // Reemplaza con tu clave pública
        currency: 'eur',
        locale: 'es'
    },

    // ===== EMAILJS - Servicio de Emails =====
    // Obtener en: https://dashboard.emailjs.com/
    emailjs: {
        publicKey: 'TU_PUBLIC_KEY_EMAILJS',      // Tu Public Key de EmailJS
        serviceId: 'TU_SERVICE_ID',               // Tu Service ID (ej: 'service_abc123')
        
        // Templates para diferentes tipos de email
        templates: {
            cliente: 'TU_TEMPLATE_CLIENTE_ID',    // Template ID para confirmación al cliente
            empresa: 'TU_TEMPLATE_EMPRESA_ID'     // Template ID para notificación a la empresa
        }
    },

    // ===== DATOS DE LA EMPRESA =====
    empresa: {
        nombre: 'LitoArte',
        email: 'pedidos@litoarte.com',           // Cambia por tu email real
        telefono: '+41 32 123 45 67',            // Cambia por tu teléfono
        direccion: 'Lüscherz, Suiza'
    },

    // ===== CONFIGURACIÓN DE PEDIDOS =====
    pedidos: {
        prefijo: 'LITO',                          // Prefijo del número de pedido
        longitudNumero: 3                         // Longitud del número secuencial
    }
};

// Validar que las claves estén configuradas
if (CONFIG.stripe.publicKey.includes('TU_CLAVE') || CONFIG.emailjs.publicKey.includes('TU_PUBLIC_KEY')) {
    console.warn('⚠️ ATENCIÓN: Debes configurar tus claves reales en js/config.js');
    console.info('📖 Pasos:');
    console.info('1. Copia js/config.example.js a js/config.js');
    console.info('2. Edita js/config.js con tus claves reales');
    console.info('3. Lee SETUP.md para instrucciones detalladas');
}

// Exportar configuración
window.LITOARTE_CONFIG = CONFIG;
