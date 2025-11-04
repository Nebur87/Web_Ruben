/**
 * Servicio de Emails con Nodemailer
 * Gestiona el envío de confirmaciones al cliente y notificaciones a la empresa
 */

const nodemailer = require('nodemailer');

/**
 * Crear transporter de Nodemailer
 */
function crearTransporter() {
    return nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: parseInt(process.env.EMAIL_PORT),
        secure: process.env.EMAIL_SECURE === 'true',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        },
        tls: {
            rejectUnauthorized: false  // Solo para desarrollo
        }
    });
}

/**
 * Formatear detalles del pedido para email
 */
function formatearDetallesPedido(pedido) {
    let detalles = `
Producto: ${pedido.producto_nombre}
`;

    if (pedido.cantidad_litofanias) {
        detalles += `Cantidad de litofanías: ${pedido.cantidad_litofanias}\n`;
    }
    if (pedido.cantidad > 1) {
        detalles += `Cantidad: ${pedido.cantidad}\n`;
    }

    detalles += `Plazo de entrega: ${pedido.plazo_entrega} días\n`;

    if (pedido.extras && pedido.extras.length > 0) {
        detalles += `\nExtras:\n`;
        pedido.extras.forEach(extra => {
            detalles += `- ${extra.extra_nombre}: ${parseFloat(extra.extra_precio).toFixed(2)}€\n`;
        });
    }

    detalles += `
Precio base: ${parseFloat(pedido.precio_base).toFixed(2)}€
Extras: ${parseFloat(pedido.precio_extras).toFixed(2)}€`;
    
    if (pedido.precio_descuento > 0) {
        detalles += `
Descuento: -${parseFloat(pedido.precio_descuento).toFixed(2)}€`;
    }

    detalles += `
TOTAL: ${parseFloat(pedido.precio_total).toFixed(2)}€`;

    return detalles;
}

/**
 * Generar HTML para email del cliente
 */
function generarHTMLCliente(pedido) {
    const detalles = formatearDetallesPedido(pedido);
    const fechaFormateada = new Date(pedido.fecha_creacion).toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });

    return `
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #6366f1; color: white; padding: 30px 20px; text-align: center; }
        .header h1 { margin: 0; font-size: 28px; }
        .content { background: #f9fafb; padding: 30px 20px; }
        .pedido-box { background: white; border: 2px solid #e5e7eb; border-radius: 8px; padding: 20px; margin: 20px 0; }
        .pedido-box h3 { margin-top: 0; color: #6366f1; }
        .detalle { white-space: pre-line; font-family: 'Courier New', monospace; background: #f3f4f6; padding: 15px; border-radius: 4px; }
        .total { font-size: 24px; font-weight: bold; color: #6366f1; text-align: center; margin: 20px 0; }
        .estado { background: #d1fae5; color: #065f46; padding: 10px; border-radius: 4px; text-align: center; font-weight: bold; }
        .footer { text-align: center; padding: 20px; font-size: 14px; color: #666; border-top: 1px solid #e5e7eb; }
        .contacto { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>¡Gracias por tu pedido!</h1>
        </div>
        
        <div class="content">
            <h2>Hola ${pedido.cliente_nombre},</h2>
            <p>Tu pedido ha sido confirmado y está siendo procesado. Te mantendremos informado sobre el progreso.</p>
            
            <div class="pedido-box">
                <h3>📋 Detalles del Pedido</h3>
                <p><strong>Número de Pedido:</strong> <span style="color: #6366f1; font-size: 18px;">${pedido.numero_pedido}</span></p>
                <p><strong>Fecha:</strong> ${fechaFormateada}</p>
                
                <div class="detalle">${detalles}</div>
                
                <div class="total">Total: ${parseFloat(pedido.precio_total).toFixed(2)}€</div>
                <div class="estado">✅ ${pedido.pagado ? 'PAGADO' : 'PENDIENTE DE PAGO'}</div>
            </div>
            
            <div class="contacto">
                <h3 style="margin-top: 0;">📞 ¿Necesitas ayuda?</h3>
                <p>Si tienes alguna pregunta sobre tu pedido, no dudes en contactarnos:</p>
                <ul style="margin: 10px 0;">
                    <li><strong>Email:</strong> ${process.env.EMPRESA_EMAIL}</li>
                    <li><strong>Teléfono:</strong> ${process.env.EMPRESA_TELEFONO}</li>
                </ul>
                <p style="margin-bottom: 0;"><em>Por favor, menciona tu número de pedido en cualquier comunicación.</em></p>
            </div>
            
            <p style="text-align: center; color: #666; font-size: 14px;">
                Nos pondremos en contacto contigo pronto para confirmar los detalles finales y coordinar la entrega.
            </p>
        </div>
        
        <div class="footer">
            <p><strong>${process.env.EMPRESA_NOMBRE}</strong></p>
            <p>Transformamos tus recuerdos en luz ✨</p>
        </div>
    </div>
</body>
</html>
    `;
}

/**
 * Generar HTML para email de la empresa
 */
function generarHTMLEmpresa(pedido) {
    const detalles = formatearDetallesPedido(pedido);
    const fechaFormateada = new Date(pedido.fecha_creacion).toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });

    let extrasTexto = 'Ninguno';
    if (pedido.extras && pedido.extras.length > 0) {
        extrasTexto = pedido.extras.map(e => `${e.extra_nombre} (${parseFloat(e.extra_precio).toFixed(2)}€)`).join(', ');
    }

    return `
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 700px; margin: 0 auto; padding: 20px; }
        .alert { background: #fef3c7; border-left: 6px solid #f59e0b; padding: 20px; margin: 20px 0; }
        .alert h2 { margin-top: 0; color: #92400e; }
        .info-box { background: #f3f4f6; border-radius: 8px; padding: 20px; margin: 15px 0; }
        .info-box h3 { margin-top: 0; color: #1f2937; border-bottom: 2px solid #6366f1; padding-bottom: 10px; }
        .info-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e5e7eb; }
        .info-row:last-child { border-bottom: none; }
        .label { font-weight: bold; color: #4b5563; }
        .value { color: #1f2937; }
        .detalle { white-space: pre-line; font-family: 'Courier New', monospace; background: white; padding: 15px; border: 1px solid #d1d5db; border-radius: 4px; }
        .highlight { background: #dbeafe; padding: 2px 6px; border-radius: 3px; font-weight: bold; }
        .total-box { background: #6366f1; color: white; padding: 20px; text-align: center; border-radius: 8px; margin: 20px 0; }
        .total-box .amount { font-size: 32px; font-weight: bold; }
    </style>
</head>
<body>
    <div class="container">
        <div class="alert">
            <h2>🔔 NUEVO PEDIDO RECIBIDO</h2>
            <p style="margin: 0; font-size: 18px;">Pedido: <span class="highlight">${pedido.numero_pedido}</span></p>
        </div>
        
        <div class="total-box">
            <div>IMPORTE TOTAL</div>
            <div class="amount">${parseFloat(pedido.precio_total).toFixed(2)}€</div>
            <div style="margin-top: 10px;">Estado: ${pedido.pagado ? '✅ PAGADO' : '⏳ PENDIENTE'}</div>
        </div>
        
        <div class="info-box">
            <h3>👤 Datos del Cliente</h3>
            <div class="info-row">
                <span class="label">Nombre completo:</span>
                <span class="value">${pedido.cliente_nombre} ${pedido.cliente_apellidos}</span>
            </div>
            <div class="info-row">
                <span class="label">Email:</span>
                <span class="value">${pedido.cliente_email}</span>
            </div>
            <div class="info-row">
                <span class="label">Teléfono:</span>
                <span class="value">${pedido.cliente_telefono}</span>
            </div>
            <div class="info-row">
                <span class="label">Newsletter:</span>
                <span class="value">${pedido.newsletter ? 'Sí' : 'No'}</span>
            </div>
        </div>
        
        <div class="info-box">
            <h3>📦 Información del Producto</h3>
            <div class="info-row">
                <span class="label">Producto:</span>
                <span class="value">${pedido.producto_nombre}</span>
            </div>
            <div class="info-row">
                <span class="label">Tipo:</span>
                <span class="value">${pedido.producto_tipo}</span>
            </div>
            <div class="info-row">
                <span class="label">Cantidad:</span>
                <span class="value">${pedido.cantidad}</span>
            </div>
            ${pedido.cantidad_litofanias ? `
            <div class="info-row">
                <span class="label">Litofanías:</span>
                <span class="value">${pedido.cantidad_litofanias}</span>
            </div>
            ` : ''}
            <div class="info-row">
                <span class="label">Plazo:</span>
                <span class="value">${pedido.plazo_entrega} días</span>
            </div>
            <div class="info-row">
                <span class="label">Extras:</span>
                <span class="value">${extrasTexto}</span>
            </div>
        </div>
        
        <div class="info-box">
            <h3>💰 Desglose de Precios</h3>
            <div class="detalle">${detalles}</div>
        </div>
        
        <div class="info-box">
            <h3>📅 Información Adicional</h3>
            <div class="info-row">
                <span class="label">Fecha del pedido:</span>
                <span class="value">${fechaFormateada}</span>
            </div>
            <div class="info-row">
                <span class="label">Estado:</span>
                <span class="value">${pedido.estado}</span>
            </div>
            ${pedido.stripe_session_id ? `
            <div class="info-row">
                <span class="label">Stripe Session:</span>
                <span class="value" style="font-size: 11px;">${pedido.stripe_session_id}</span>
            </div>
            ` : ''}
        </div>
        
        <div style="background: #e0e7ff; padding: 15px; border-radius: 8px; margin-top: 20px;">
            <p style="margin: 0;"><strong>⚡ Acción requerida:</strong> Revisa el pedido y contacta al cliente para confirmar los detalles de las fotos y la entrega.</p>
        </div>
    </div>
</body>
</html>
    `;
}

/**
 * Enviar email de confirmación al cliente
 */
async function enviarEmailCliente(pedido) {
    const transporter = crearTransporter();

    const mailOptions = {
        from: `"${process.env.EMPRESA_NOMBRE}" <${process.env.EMAIL_USER}>`,
        to: pedido.cliente_email,
        subject: `Confirmación de Pedido ${pedido.numero_pedido} - ${process.env.EMPRESA_NOMBRE}`,
        html: generarHTMLCliente(pedido)
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log('✅ Email enviado al cliente:', info.messageId);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('❌ Error al enviar email al cliente:', error);
        throw error;
    }
}

/**
 * Enviar email de notificación a la empresa
 */
async function enviarEmailEmpresa(pedido, opciones = {}) {
    const transporter = crearTransporter();

    const mailOptions = {
        from: `"Sistema LitoArte" <${process.env.EMAIL_USER}>`,
        to: process.env.EMPRESA_EMAIL,
        subject: `🔔 NUEVO PEDIDO: ${pedido.numero_pedido} - ${parseFloat(pedido.precio_total).toFixed(2)}€`,
        html: generarHTMLEmpresa(pedido),
        attachments: Array.isArray(opciones.empresaAdjuntos) ? opciones.empresaAdjuntos : undefined
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log('✅ Email enviado a la empresa:', info.messageId);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('❌ Error al enviar email a la empresa:', error);
        throw error;
    }
}

/**
 * Enviar ambos emails (cliente y empresa)
 */
async function enviarEmailsConfirmacion(pedido, opciones = {}) {
    const resultados = {
        cliente: null,
        empresa: null,
        exito: false,
        errores: []
    };

    try {
        // Enviar al cliente
        try {
            resultados.cliente = await enviarEmailCliente(pedido);
        } catch (error) {
            resultados.errores.push({ tipo: 'cliente', mensaje: error.message });
        }

        // Enviar a la empresa (con adjuntos opcionales)
        try {
            resultados.empresa = await enviarEmailEmpresa(pedido, opciones);
        } catch (error) {
            resultados.errores.push({ tipo: 'empresa', mensaje: error.message });
        }

        resultados.exito = resultados.cliente !== null || resultados.empresa !== null;

        return resultados;

    } catch (error) {
        console.error('❌ Error general al enviar emails:', error);
        resultados.errores.push({ tipo: 'general', mensaje: error.message });
        return resultados;
    }
}

module.exports = {
    enviarEmailCliente,
    enviarEmailEmpresa,
    enviarEmailsConfirmacion
};
