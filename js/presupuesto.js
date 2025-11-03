/**
 * LITOARTE - JavaScript para Formulario de Presupuesto
 * Funcionalidades: Validaciones en tiempo real, cálculo dinámico, UX mejorada
 */

// =============== VARIABLES GLOBALES ===============
let presupuestoData = {
    contacto: {},
    producto: null,
    cantidad: 1,
    cantidadLitofanias: 2,
    plazo: 15,
    extras: [],
    precios: {
        base: 0,
        extras: 0,
        descuento: 0,
        total: 0
    }
};

const PRODUCTOS = {
    mesa: { precio: 45, nombre: 'Lámpara de Mesa', basePrice: 45 },
    pared: { 
        precio: 65, 
        nombre: 'Lámpara de Pared',
        basePrice: 65,
        descuentoSegunda: 0.15,
        precios: {
            1: 65,
            2: 120  // 65 + (65 * 0.85) = 65 + 55.25 = 120.25 ≈ 120
        }
    },
    techo: { 
        precio: 120, 
        nombre: 'Lámpara de Techo',
        basePrice: 50, // 50€ por litofanía
        soportePrice: 50, // 50€ soporte fijo
        precios: {
            2: 150, // (2 * 50) + 50 = 150
            3: 200, // (3 * 50) + 50 = 200
            4: 250, // (4 * 50) + 50 = 250
            5: 300  // (5 * 50) + 50 = 300
        }
    },
    personalizada: { precio: 80, nombre: 'Diseño Personalizado', basePrice: 80 }
};

const EXTRAS = {
    'led-color': { precio: 15, nombre: 'LED de Color Variable' },
    'dimmer': { precio: 10, nombre: 'Regulador de Intensidad' },
    'marco': { precio: 25, nombre: 'Marco Premium' },
    'grabado': { precio: 12, nombre: 'Grabado Personalizado' },
    'envio': { precio: 8, nombre: 'Envío Express' },
    'embalaje': { precio: 5, nombre: 'Embalaje de Regalo' }
};

const DESCUENTOS = {
    15: 0.05,  // 5% descuento para 15-30 días
    31: 0.10   // 10% descuento para 31-60 días
};

// =============== INICIALIZACIÓN ===============
document.addEventListener('DOMContentLoaded', function() {
    console.log('💰 Presupuesto - Inicializando...');
    
    initNavigation();
    initFormValidation();
    initProductSelection();
    initProductConfiguration();
    initExtrasSelection();
    initPlazoCalculation();
    initPresupuestoDisplay();
    initFormSubmission();
    
    // Calcular presupuesto inicial
    calcularPresupuesto();
    
    console.log('✅ Presupuesto - Inicializado correctamente');
});

// =============== NAVEGACIÓN ===============
function initNavigation() {
    const navToggle = document.querySelector('.nav-toggle');
    const navMenu = document.querySelector('.nav-menu');

    if (navToggle && navMenu) {
        navToggle.addEventListener('click', function() {
            navMenu.classList.toggle('active');
            document.body.style.overflow = navMenu.classList.contains('active') ? 'hidden' : '';
        });

        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', function() {
                navMenu.classList.remove('active');
                document.body.style.overflow = '';
            });
        });
    }
}

// =============== VALIDACIÓN DE FORMULARIO ===============
function initFormValidation() {
    const form = document.getElementById('presupuesto-form');
    if (!form) return;

    // Validaciones en tiempo real para campos de contacto
    const nombre = document.getElementById('nombre');
    const apellidos = document.getElementById('apellidos');
    const telefono = document.getElementById('telefono');
    const email = document.getElementById('email');

    if (nombre) {
        nombre.addEventListener('input', () => validateField(nombre, validateNombre));
        nombre.addEventListener('blur', () => validateField(nombre, validateNombre));
    }

    if (apellidos) {
        apellidos.addEventListener('input', () => validateField(apellidos, validateApellidos));
        apellidos.addEventListener('blur', () => validateField(apellidos, validateApellidos));
    }

    if (telefono) {
        // Solo permitir números
        telefono.addEventListener('input', function(e) {
            this.value = this.value.replace(/[^0-9]/g, '');
            validateField(telefono, validateTelefono);
        });
        telefono.addEventListener('blur', () => validateField(telefono, validateTelefono));
    }

    if (email) {
        email.addEventListener('input', () => validateField(email, validateEmail));
        email.addEventListener('blur', () => validateField(email, validateEmail));
    }
}

// =============== FUNCIONES DE VALIDACIÓN ===============
function validateNombre(value) {
    const regex = /^[A-Za-zÁáÉéÍíÓóÚúÜüÑñ\s]+$/;
    if (!value.trim()) {
        return { valid: false, message: 'El nombre es obligatorio' };
    }
    if (value.length > 15) {
        return { valid: false, message: 'Máximo 15 caracteres' };
    }
    if (!regex.test(value)) {
        return { valid: false, message: 'Solo se permiten letras' };
    }
    return { valid: true, message: '' };
}

function validateApellidos(value) {
    const regex = /^[A-Za-zÁáÉéÍíÓóÚúÜüÑñ\s]+$/;
    if (!value.trim()) {
        return { valid: false, message: 'Los apellidos son obligatorios' };
    }
    if (value.length > 40) {
        return { valid: false, message: 'Máximo 40 caracteres' };
    }
    if (!regex.test(value)) {
        return { valid: false, message: 'Solo se permiten letras' };
    }
    return { valid: true, message: '' };
}

function validateTelefono(value) {
    const regex = /^[0-9]{9}$/;
    if (!value.trim()) {
        return { valid: false, message: 'El teléfono es obligatorio' };
    }
    if (!regex.test(value)) {
        return { valid: false, message: 'Debe tener exactamente 9 dígitos' };
    }
    return { valid: true, message: '' };
}

function validateEmail(value) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!value.trim()) {
        return { valid: false, message: 'El email es obligatorio' };
    }
    if (!regex.test(value)) {
        return { valid: false, message: 'Formato de email inválido' };
    }
    return { valid: true, message: '' };
}

function validateField(field, validator) {
    const result = validator(field.value);
    const errorElement = document.getElementById(field.id + '-error');
    
    if (result.valid) {
        field.classList.remove('invalid');
        field.classList.add('valid');
        if (errorElement) errorElement.textContent = '';
    } else {
        field.classList.remove('valid');
        field.classList.add('invalid');
        if (errorElement) errorElement.textContent = result.message;
    }
    
    return result.valid;
}

// =============== SELECCIÓN DE PRODUCTOS ===============
function initProductSelection() {
    const productRadios = document.querySelectorAll('input[name="producto"]');
    
    productRadios.forEach(radio => {
        radio.addEventListener('change', function() {
            if (this.checked) {
                presupuestoData.producto = this.value;
                
                // Actualizar UI
                updateProductSelection(this);
                showProductConfiguration(this.value);
                calcularPresupuesto();
                
                console.log(`📦 Producto seleccionado: ${PRODUCTOS[this.value].nombre}`);
            }
        });
    });
}

function updateProductSelection(selectedRadio) {
    // Remover clase activa de todas las opciones
    document.querySelectorAll('.product-option').forEach(option => {
        option.classList.remove('selected');
    });
    
    // Agregar clase activa a la opción seleccionada
    selectedRadio.closest('.product-option').classList.add('selected');
}

function showProductConfiguration(productType) {
    // Ocultar todas las configuraciones
    document.querySelectorAll('[id^="config-"]').forEach(config => {
        config.style.display = 'none';
    });
    
    // Mostrar configuración específica
    const configElement = document.getElementById(`config-${productType}`);
    if (configElement) {
        configElement.style.display = 'block';
        
        // Resetear valores por defecto
        if (productType === 'pared') {
            presupuestoData.cantidad = 1;
            document.getElementById('cantidad-pared').value = '1';
        } else if (productType === 'techo') {
            presupuestoData.cantidadLitofanias = 2;
            document.getElementById('cantidad-litofanias').value = '2';
            updateImagenesRequirement(2);
        }
    }
}

// =============== CONFIGURACIÓN DE PRODUCTOS ===============
function initProductConfiguration() {
    // Configuración lámpara de pared
    const cantidadPared = document.getElementById('cantidad-pared');
    if (cantidadPared) {
        cantidadPared.addEventListener('change', function() {
            presupuestoData.cantidad = parseInt(this.value);
            calcularPresupuesto();
        });
    }
    
    // Configuración lámpara de techo
    const cantidadLitofanias = document.getElementById('cantidad-litofanias');
    if (cantidadLitofanias) {
        cantidadLitofanias.addEventListener('change', function() {
            presupuestoData.cantidadLitofanias = parseInt(this.value);
            updateImagenesRequirement(presupuestoData.cantidadLitofanias);
            calcularPresupuesto();
        });
    }
}

function updateImagenesRequirement(numLitofanias) {
    const totalImagenes = numLitofanias * 2; // 2 imágenes por litofanía
    
    const totalElement = document.getElementById('total-imagenes');
    const porLitofaniaElement = document.getElementById('imagenes-por-litofania');
    
    if (totalElement) totalElement.textContent = totalImagenes;
    if (porLitofaniaElement) porLitofaniaElement.textContent = '2';
}

// =============== SELECCIÓN DE EXTRAS ===============
function initExtrasSelection() {
    const extraCheckboxes = document.querySelectorAll('input[name="extras"]');
    
    extraCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            updateExtrasSelection();
            calcularPresupuesto();
        });
    });
}

function updateExtrasSelection() {
    const checkedExtras = document.querySelectorAll('input[name="extras"]:checked');
    presupuestoData.extras = Array.from(checkedExtras).map(checkbox => checkbox.value);
    
    console.log(`🎁 Extras seleccionados: ${presupuestoData.extras.length}`);
}

// =============== CÁLCULO DE PLAZO Y DESCUENTOS ===============
function initPlazoCalculation() {
    const plazoInput = document.getElementById('plazo');
    const descuentoDisplay = document.getElementById('descuento-plazo');
    
    if (plazoInput) {
        plazoInput.addEventListener('input', function() {
            presupuestoData.plazo = parseInt(this.value) || 15;
            updateDescuentoDisplay();
            calcularPresupuesto();
        });
        
        // Validar rango
        plazoInput.addEventListener('blur', function() {
            const value = parseInt(this.value);
            if (value < 7) {
                this.value = 7;
                presupuestoData.plazo = 7;
            } else if (value > 60) {
                this.value = 60;
                presupuestoData.plazo = 60;
            }
            updateDescuentoDisplay();
            calcularPresupuesto();
        });
    }
    
    function updateDescuentoDisplay() {
        if (!descuentoDisplay) return;
        
        const plazo = presupuestoData.plazo;
        let descuentoTexto = '';
        
        if (plazo >= 15 && plazo <= 30) {
            descuentoTexto = '5% descuento';
        } else if (plazo >= 31) {
            descuentoTexto = '10% descuento';
        } else {
            descuentoTexto = 'Sin descuento';
        }
        
        descuentoDisplay.textContent = descuentoTexto;
        descuentoDisplay.style.display = plazo >= 15 ? 'inline' : 'none';
    }
}

// =============== CÁLCULO Y DISPLAY DEL PRESUPUESTO ===============
function initPresupuestoDisplay() {
    // Los elementos ya están en el HTML, solo necesitamos referenciarlos
    updatePresupuestoDisplay();
}

function calcularPresupuesto() {
    // Precio base del producto según tipo y configuración
    let precioBase = 0;
    
    if (presupuestoData.producto && PRODUCTOS[presupuestoData.producto]) {
        const producto = PRODUCTOS[presupuestoData.producto];
        
        if (presupuestoData.producto === 'pared') {
            // Lámpara de pared con descuento en la segunda unidad
            if (presupuestoData.cantidad === 1) {
                precioBase = producto.precios[1];
            } else if (presupuestoData.cantidad === 2) {
                precioBase = producto.precios[2];
            }
        } else if (presupuestoData.producto === 'techo') {
            // Lámpara de techo con precio según número de litofanías
            precioBase = producto.precios[presupuestoData.cantidadLitofanias] || producto.precio;
        } else {
            // Mesa y personalizada (precio fijo)
            precioBase = producto.precio;
        }
    }
    
    // Precio de extras
    let precioExtras = 0;
    presupuestoData.extras.forEach(extraId => {
        if (EXTRAS[extraId]) {
            precioExtras += EXTRAS[extraId].precio;
        }
    });
    
    // Subtotal
    const subtotal = precioBase + precioExtras;
    
    // Calcular descuento por plazo
    let descuento = 0;
    const plazo = presupuestoData.plazo;
    
    if (plazo >= 31) {
        descuento = subtotal * DESCUENTOS[31];
    } else if (plazo >= 15) {
        descuento = subtotal * DESCUENTOS[15];
    }
    
    // Total final
    const total = subtotal - descuento;
    
    // Actualizar datos
    presupuestoData.precios = {
        base: precioBase,
        extras: precioExtras,
        subtotal: subtotal,
        descuento: descuento,
        total: total
    };
    
    // Actualizar display
    updatePresupuestoDisplay();
    
    console.log('💰 Presupuesto calculado:', presupuestoData.precios);
}

function updatePresupuestoDisplay() {
    const precioBase = document.getElementById('precio-base');
    const precioExtras = document.getElementById('precio-extras');
    const subtotal = document.getElementById('subtotal');
    const descuento = document.getElementById('descuento');
    const precioTotal = document.getElementById('precio-total');
    
    if (precioBase) precioBase.textContent = `${presupuestoData.precios.base}€`;
    if (precioExtras) precioExtras.textContent = `${presupuestoData.precios.extras}€`;
    if (subtotal) subtotal.textContent = `${presupuestoData.precios.subtotal}€`;
    if (descuento) {
        descuento.textContent = `-${presupuestoData.precios.descuento.toFixed(2)}€`;
        descuento.parentElement.style.display = presupuestoData.precios.descuento > 0 ? 'flex' : 'none';
    }
    if (precioTotal) {
        precioTotal.textContent = `${presupuestoData.precios.total.toFixed(2)}€`;
        
        // Efecto visual al cambiar el precio
        precioTotal.style.transform = 'scale(1.05)';
        setTimeout(() => {
            precioTotal.style.transform = 'scale(1)';
        }, 200);
    }
}

// =============== ENVÍO DEL FORMULARIO ===============
function initFormSubmission() {
    const form = document.getElementById('presupuesto-form');
    if (!form) return;
    
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        if (validateCompleteForm()) {
            submitPresupuesto();
        }
    });
    
    // Reset del formulario
    const resetBtn = form.querySelector('button[type="reset"]');
    if (resetBtn) {
        resetBtn.addEventListener('click', function(e) {
            e.preventDefault();
            resetForm();
        });
    }
}

function validateCompleteForm() {
    let isValid = true;
    const errors = [];
    
    // Validar campos de contacto
    const nombre = document.getElementById('nombre');
    const apellidos = document.getElementById('apellidos');
    const telefono = document.getElementById('telefono');
    const email = document.getElementById('email');
    
    if (nombre && !validateField(nombre, validateNombre)) {
        isValid = false;
        errors.push('Nombre inválido');
    }
    
    if (apellidos && !validateField(apellidos, validateApellidos)) {
        isValid = false;
        errors.push('Apellidos inválidos');
    }
    
    if (telefono && !validateField(telefono, validateTelefono)) {
        isValid = false;
        errors.push('Teléfono inválido');
    }
    
    if (email && !validateField(email, validateEmail)) {
        isValid = false;
        errors.push('Email inválido');
    }
    
    // Validar producto seleccionado
    if (!presupuestoData.producto) {
        isValid = false;
        errors.push('Debe seleccionar un producto');
        showFieldError('producto', 'Seleccione un tipo de producto');
    }
    
    // Validar condiciones
    const condiciones = document.getElementById('condiciones');
    if (condiciones && !condiciones.checked) {
        isValid = false;
        errors.push('Debe aceptar las condiciones');
        showFieldError('condiciones', 'Debe aceptar las condiciones de privacidad');
    }
    
    if (!isValid) {
        showToast('Por favor, corrija los errores del formulario', 'error');
        console.log('❌ Errores de validación:', errors);
        
        // Scroll al primer error
        const firstError = document.querySelector('.invalid, .form-error:not(:empty)');
        if (firstError) {
            firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }
    
    return isValid;
}

function showFieldError(fieldId, message) {
    const errorElement = document.getElementById(fieldId + '-error');
    if (errorElement) {
        errorElement.textContent = message;
    }
}

function submitPresupuesto() {
    // Recopilar datos del formulario
    const formData = {
        contacto: {
            nombre: document.getElementById('nombre').value,
            apellidos: document.getElementById('apellidos').value,
            telefono: document.getElementById('telefono').value,
            email: document.getElementById('email').value
        },
        producto: presupuestoData.producto,
        plazo: presupuestoData.plazo,
        extras: presupuestoData.extras,
        presupuesto: presupuestoData.precios,
        newsletter: document.getElementById('newsletter')?.checked || false,
        fecha: new Date().toISOString()
    };
    
    console.log('📤 Enviando presupuesto:', formData);
    
    // Simular envío
    const submitBtn = document.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    
    submitBtn.disabled = true;
    submitBtn.textContent = 'Enviando...';
    
    // Simular delay del servidor
    setTimeout(() => {
        // Mostrar modal de éxito
        showSuccessModal(formData);
        
        // Resetear formulario
        setTimeout(() => {
            resetForm();
        }, 2000);
        
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
        
    }, 2000);
}

function showSuccessModal(data) {
    const modal = document.createElement('div');
    modal.className = 'success-modal-overlay';
    modal.innerHTML = `
        <div class="success-modal-content">
            <div class="success-icon">✅</div>
            <h3>¡Presupuesto Enviado!</h3>
            <p>Hemos recibido tu solicitud de presupuesto correctamente.</p>
            <div class="success-details">
                <p><strong>Producto:</strong> ${PRODUCTOS[data.producto].nombre}</p>
                <p><strong>Total:</strong> ${data.presupuesto.total.toFixed(2)}€</p>
                <p><strong>Plazo:</strong> ${data.plazo} días</p>
            </div>
            <p>Te contactaremos en las próximas 24 horas al email: <strong>${data.contacto.email}</strong></p>
            <div class="success-actions">
                <button class="btn btn-primary" onclick="closeSuccessModal(this)">Perfecto</button>
                <a href="../views/contacto.html" class="btn btn-secondary">Ir a Contacto</a>
            </div>
        </div>
    `;
    
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.8);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 2000;
        opacity: 0;
        transition: opacity 0.3s ease;
        padding: 20px;
        box-sizing: border-box;
    `;
    
    document.body.appendChild(modal);
    document.body.style.overflow = 'hidden';
    
    requestAnimationFrame(() => {
        modal.style.opacity = '1';
    });
    
    showToast('¡Presupuesto enviado correctamente!', 'success');
}

function closeSuccessModal(button) {
    const modal = button.closest('.success-modal-overlay');
    if (modal) {
        modal.style.opacity = '0';
        setTimeout(() => {
            if (document.body.contains(modal)) {
                document.body.removeChild(modal);
                document.body.style.overflow = '';
            }
        }, 300);
    }
}

function resetForm() {
    const form = document.getElementById('presupuesto-form');
    if (form) {
        form.reset();
        
        // Limpiar errores
        document.querySelectorAll('.form-error').forEach(error => {
            error.textContent = '';
        });
        
        document.querySelectorAll('.form-input').forEach(input => {
            input.classList.remove('valid', 'invalid');
        });
        
        // Resetear datos
        presupuestoData = {
            contacto: {},
            producto: null,
            cantidad: 1,
            cantidadLitofanias: 2,
            plazo: 15,
            extras: [],
            precios: { base: 0, extras: 0, descuento: 0, total: 0 }
        };
        
        // Ocultar configuraciones específicas
        document.querySelectorAll('[id^="config-"]').forEach(config => {
            config.style.display = 'none';
        });
        
        // Recalcular presupuesto
        calcularPresupuesto();
        
        showToast('Formulario reiniciado', 'info');
    }
}

// =============== UTILIDADES ===============
function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    
    toast.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: var(--color-primary);
        color: white;
        padding: 12px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        z-index: 3000;
        transform: translateX(100%);
        transition: transform 0.3s ease;
        max-width: 300px;
    `;
    
    if (type === 'error') {
        toast.style.background = 'var(--color-error)';
    } else if (type === 'success') {
        toast.style.background = 'var(--color-success)';
    }
    
    document.body.appendChild(toast);
    
    requestAnimationFrame(() => {
        toast.style.transform = 'translateX(0)';
    });
    
    setTimeout(() => {
        toast.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (document.body.contains(toast)) {
                document.body.removeChild(toast);
            }
        }, 300);
    }, 4000);
}

// =============== EXPORTAR FUNCIONES GLOBALES ===============
window.closeSuccessModal = closeSuccessModal;

console.log('💰 presupuesto.js cargado correctamente');