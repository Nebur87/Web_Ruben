/**
 * LITOARTE - JavaScript para Página de Contacto
 * Funcionalidades: OpenStreetMaps, geolocalización, rutas, formularios
 */

// =============== VARIABLES GLOBALES ===============
let map = null;
let userMarker = null;
let storeMarker = null;
let routeControl = null;

// Datos de la tienda
const STORE_DATA = {
    name: 'Ruben Litofanías',
    lat: 47.061,  // Lüscerz, Suiza
    lng: 7.188,
    address: 'Hauptstrasse 50, 2575 Lüscerz, Suiza',
    phone: '+41 32 315 55 55',
    email: 'info@rubenlitofanias.ch',
    hours: {
        'Lunes': '09:00 - 18:00',
        'Martes': '09:00 - 18:00',
        'Miércoles': '09:00 - 18:00',
        'Jueves': '09:00 - 18:00',
        'Viernes': '09:00 - 18:00',
        'Sábado': '10:00 - 14:00',
        'Domingo': 'Cerrado'
    }
};

// =============== INICIALIZACIÓN ===============
document.addEventListener('DOMContentLoaded', function() {
    console.log('📍 Contacto - Inicializando...');
    
    initNavigation();
    initMap();
    initContactForm();
    initGeolocation();
    initScheduleDisplay();
    
    console.log('✅ Contacto - Inicializado correctamente');
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

// =============== INICIALIZACIÓN DEL MAPA ===============
function initMap() {
    const mapContainer = document.getElementById('mapa-contacto');
    if (!mapContainer) {
        console.warn('⚠️ Contenedor del mapa no encontrado');
        return;
    }

    try {
        // Inicializar mapa centrado en la tienda
        map = L.map('mapa-contacto', {
            center: [STORE_DATA.lat, STORE_DATA.lng],
            zoom: 15,
            zoomControl: true,
            scrollWheelZoom: true
        });

        // Agregar tiles de OpenStreetMap
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors',
            maxZoom: 19
        }).addTo(map);

        // Crear marcador de la tienda
        createStoreMarker();
        
        // Agregar controles del mapa
        addMapControls();
        
        console.log('🗺️ Mapa inicializado correctamente');
        
    } catch (error) {
        console.error('❌ Error inicializando mapa:', error);
        showMapError();
    }
}

function createStoreMarker() {
    // Icono personalizado para la tienda
    const storeIcon = L.divIcon({
        html: `
            <div class="store-marker">
                <div class="marker-icon">🏪</div>
                <div class="marker-pulse"></div>
            </div>
        `,
        className: 'custom-marker',
        iconSize: [40, 40],
        iconAnchor: [20, 40]
    });

    // Crear marcador
    storeMarker = L.marker([STORE_DATA.lat, STORE_DATA.lng], {
        icon: storeIcon,
        title: STORE_DATA.name
    }).addTo(map);

    // Popup con información de la tienda
    const popupContent = `
        <div class="store-popup">
            <h3>${STORE_DATA.name}</h3>
            <p><strong>📍 Dirección:</strong><br>${STORE_DATA.address}</p>
            <p><strong>📞 Teléfono:</strong><br>
                <a href="tel:${STORE_DATA.phone}">${STORE_DATA.phone}</a>
            </p>
            <p><strong>📧 Email:</strong><br>
                <a href="mailto:${STORE_DATA.email}">${STORE_DATA.email}</a>
            </p>
            <div class="popup-actions">
                <button class="btn-small btn-primary" onclick="getUserLocation()">
                    📍 Cómo llegar
                </button>
                <a href="https://www.openstreetmap.org/directions?from=&to=${STORE_DATA.lat}%2C${STORE_DATA.lng}" 
                   target="_blank" class="btn-small btn-secondary">
                    🗺️ Abrir en OSM
                </a>
            </div>
        </div>
    `;

    storeMarker.bindPopup(popupContent, {
        maxWidth: 300,
        closeButton: true
    });

    // Abrir popup automáticamente
    storeMarker.openPopup();
}

function addMapControls() {
    // Control de localización
    const locationButton = L.control({ position: 'topright' });
    locationButton.onAdd = function() {
        const div = L.DomUtil.create('div', 'leaflet-bar leaflet-control');
        div.innerHTML = `
            <a href="#" class="location-control" title="Mi ubicación" onclick="getUserLocation(); return false;">
                <span class="location-icon">📍</span>
            </a>
        `;
        return div;
    };
    locationButton.addTo(map);

    // Control de zoom al taller
    const storeButton = L.control({ position: 'topright' });
    storeButton.onAdd = function() {
        const div = L.DomUtil.create('div', 'leaflet-bar leaflet-control');
        div.innerHTML = `
            <a href="#" class="store-control" title="Ver taller" onclick="focusOnStore(); return false;">
                <span class="store-icon">🏪</span>
            </a>
        `;
        return div;
    };
    storeButton.addTo(map);
}

function showMapError() {
    const mapContainer = document.getElementById('mapa-contacto');
    if (mapContainer) {
        mapContainer.innerHTML = `
            <div class="map-error">
                <div class="error-icon">🗺️</div>
                <h3>Error cargando el mapa</h3>
                <p>No se pudo cargar el mapa interactivo.</p>
                <div class="fallback-info">
                    <h4>📍 Nuestra ubicación:</h4>
                    <p>${STORE_DATA.address}</p>
                    <p>📞 ${STORE_DATA.phone}</p>
                    <a href="mailto:${STORE_DATA.email}" class="btn btn-primary">
                        Enviar Email
                    </a>
                </div>
            </div>
        `;
    }
}

// =============== GEOLOCALIZACIÓN ===============
function initGeolocation() {
    // Verificar si el navegador soporta geolocalización
    if (!navigator.geolocation) {
        console.warn('⚠️ Geolocalización no soportada');
        return;
    }

    // Botón de ubicación automática
    const locationBtn = document.getElementById('get-location-btn');
    if (locationBtn) {
        locationBtn.addEventListener('click', getUserLocation);
    }
}

function getUserLocation() {
    if (!navigator.geolocation) {
        showToast('Tu navegador no soporta geolocalización', 'error');
        return;
    }

    // Mostrar loading
    const locationBtn = document.querySelector('.location-control');
    if (locationBtn) {
        locationBtn.innerHTML = '<span class="loading-spinner">⏳</span>';
    }

    showToast('Obteniendo tu ubicación...', 'info');

    navigator.geolocation.getCurrentPosition(
        position => {
            const { latitude, longitude } = position.coords;
            console.log(`📍 Ubicación obtenida: ${latitude}, ${longitude}`);
            
            addUserMarker(latitude, longitude);
            calculateRoute(latitude, longitude);
            
            // Restaurar botón
            if (locationBtn) {
                locationBtn.innerHTML = '<span class="location-icon">📍</span>';
            }
            
            showToast('¡Ubicación encontrada!', 'success');
        },
        error => {
            console.error('❌ Error obteniendo ubicación:', error);
            
            // Restaurar botón
            if (locationBtn) {
                locationBtn.innerHTML = '<span class="location-icon">📍</span>';
            }
            
            let message = 'No se pudo obtener tu ubicación';
            switch (error.code) {
                case error.PERMISSION_DENIED:
                    message = 'Permiso de ubicación denegado';
                    break;
                case error.POSITION_UNAVAILABLE:
                    message = 'Ubicación no disponible';
                    break;
                case error.TIMEOUT:
                    message = 'Tiempo de espera agotado';
                    break;
            }
            
            showToast(message, 'error');
        },
        {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 300000 // 5 minutos
        }
    );
}

function addUserMarker(lat, lng) {
    // Remover marcador anterior si existe
    if (userMarker) {
        map.removeLayer(userMarker);
    }

    // Icono para ubicación del usuario
    const userIcon = L.divIcon({
        html: `
            <div class="user-marker">
                <div class="marker-icon">👤</div>
                <div class="marker-ring"></div>
            </div>
        `,
        className: 'custom-marker',
        iconSize: [30, 30],
        iconAnchor: [15, 30]
    });

    // Crear marcador del usuario
    userMarker = L.marker([lat, lng], {
        icon: userIcon,
        title: 'Tu ubicación'
    }).addTo(map);

    userMarker.bindPopup(`
        <div class="user-popup">
            <h4>📍 Tu ubicación</h4>
            <p>Desde aquí hasta nuestro taller</p>
            <button class="btn-small btn-primary" onclick="calculateRoute(${lat}, ${lng})">
                🚗 Calcular ruta
            </button>
        </div>
    `);

    // Ajustar vista para mostrar ambos marcadores
    const group = L.featureGroup([userMarker, storeMarker]);
    map.fitBounds(group.getBounds(), { padding: [20, 20] });
}

// =============== CÁLCULO DE RUTAS ===============
function calculateRoute(userLat, userLng) {
    if (!userLat || !userLng) {
        showToast('Necesitamos tu ubicación para calcular la ruta', 'error');
        return;
    }

    // Remover ruta anterior si existe
    if (routeControl) {
        map.removeControl(routeControl);
    }

    try {
        // Crear control de rutas
        routeControl = L.Routing.control({
            waypoints: [
                L.latLng(userLat, userLng),
                L.latLng(STORE_DATA.lat, STORE_DATA.lng)
            ],
            routeWhileDragging: false,
            addWaypoints: false,
            createMarker: function() { return null; }, // No crear marcadores adicionales
            lineOptions: {
                styles: [
                    { color: 'var(--color-primary)', weight: 6, opacity: 0.8 }
                ]
            },
            router: L.Routing.osrmv1({
                serviceUrl: 'https://router.project-osrm.org/route/v1',
                language: 'es'
            })
        });

        routeControl.on('routesfound', function(e) {
            const route = e.routes[0];
            const summary = route.summary;
            
            const distance = (summary.totalDistance / 1000).toFixed(1);
            const time = Math.round(summary.totalTime / 60);
            
            showRouteInfo(distance, time);
            
            console.log(`🚗 Ruta calculada: ${distance}km, ${time} min`);
        });

        routeControl.addTo(map);
        
        showToast('Calculando mejor ruta...', 'info');
        
    } catch (error) {
        console.error('❌ Error calculando ruta:', error);
        showToast('Error calculando la ruta', 'error');
        
        // Fallback: mostrar URL de Google Maps
        const googleMapsUrl = `https://www.google.com/maps/dir/${userLat},${userLng}/${STORE_DATA.lat},${STORE_DATA.lng}`;
        showToast(`<a href="${googleMapsUrl}" target="_blank">Abrir en Google Maps</a>`, 'info');
    }
}

function showRouteInfo(distance, time) {
    const routeInfo = document.getElementById('route-info') || createRouteInfoElement();
    
    routeInfo.innerHTML = `
        <div class="route-details">
            <h4>🚗 Información de la ruta</h4>
            <div class="route-stats">
                <div class="stat">
                    <span class="stat-icon">📏</span>
                    <span class="stat-value">${distance} km</span>
                    <span class="stat-label">Distancia</span>
                </div>
                <div class="stat">
                    <span class="stat-icon">⏱️</span>
                    <span class="stat-value">${time} min</span>
                    <span class="stat-label">Tiempo aprox.</span>
                </div>
            </div>
            <div class="route-actions">
                <button class="btn-small btn-primary" onclick="clearRoute()">
                    🗑️ Limpiar ruta
                </button>
                <button class="btn-small btn-secondary" onclick="recalculateRoute()">
                    🔄 Recalcular
                </button>
            </div>
        </div>
    `;
    
    routeInfo.style.display = 'block';
}

function createRouteInfoElement() {
    const routeInfo = document.createElement('div');
    routeInfo.id = 'route-info';
    routeInfo.className = 'route-info-panel';
    
    const mapContainer = document.getElementById('mapa-contacto');
    if (mapContainer && mapContainer.parentNode) {
        mapContainer.parentNode.insertBefore(routeInfo, mapContainer.nextSibling);
    }
    
    return routeInfo;
}

function clearRoute() {
    if (routeControl) {
        map.removeControl(routeControl);
        routeControl = null;
    }
    
    if (userMarker) {
        map.removeLayer(userMarker);
        userMarker = null;
    }
    
    const routeInfo = document.getElementById('route-info');
    if (routeInfo) {
        routeInfo.style.display = 'none';
    }
    
    focusOnStore();
    showToast('Ruta eliminada', 'info');
}

function recalculateRoute() {
    if (userMarker) {
        const pos = userMarker.getLatLng();
        calculateRoute(pos.lat, pos.lng);
    } else {
        getUserLocation();
    }
}

function focusOnStore() {
    if (map && storeMarker) {
        map.setView([STORE_DATA.lat, STORE_DATA.lng], 15);
        storeMarker.openPopup();
    }
}

// =============== HORARIOS ===============
function initScheduleDisplay() {
    const scheduleContainer = document.getElementById('schedule');
    if (!scheduleContainer) return;

    const today = new Date().toLocaleDateString('es-ES', { weekday: 'long' });
    const todayCapitalized = today.charAt(0).toUpperCase() + today.slice(1);
    
    let scheduleHTML = '<div class="schedule-list">';
    
    Object.entries(STORE_DATA.hours).forEach(([day, hours]) => {
        const isToday = day === todayCapitalized;
        const isOpen = hours !== 'Cerrado' && isCurrentlyOpen(hours);
        
        scheduleHTML += `
            <div class="schedule-item ${isToday ? 'today' : ''} ${isOpen ? 'open' : ''}">
                <span class="day">${day}</span>
                <span class="hours">${hours}</span>
                ${isToday ? '<span class="today-indicator">Hoy</span>' : ''}
                ${isToday && isOpen ? '<span class="open-indicator">Abierto</span>' : ''}
            </div>
        `;
    });
    
    scheduleHTML += '</div>';
    scheduleContainer.innerHTML = scheduleHTML;
}

function isCurrentlyOpen(hours) {
    if (hours === 'Cerrado') return false;
    
    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();
    
    const [openTime, closeTime] = hours.split(' - ');
    const [openHour, openMin] = openTime.split(':').map(Number);
    const [closeHour, closeMin] = closeTime.split(':').map(Number);
    
    const openMinutes = openHour * 60 + openMin;
    const closeMinutes = closeHour * 60 + closeMin;
    
    return currentTime >= openMinutes && currentTime <= closeMinutes;
}

// =============== FORMULARIO DE CONTACTO ===============
function initContactForm() {
    const form = document.getElementById('contact-form');
    if (!form) return;

    // Validaciones en tiempo real
    const nombre = document.getElementById('contact-nombre');
    const email = document.getElementById('contact-email');
    const telefono = document.getElementById('contact-telefono');
    const mensaje = document.getElementById('contact-mensaje');

    if (nombre) {
        nombre.addEventListener('input', () => validateContactField(nombre, validateNombre));
        nombre.addEventListener('blur', () => validateContactField(nombre, validateNombre));
    }

    if (email) {
        email.addEventListener('input', () => validateContactField(email, validateEmail));
        email.addEventListener('blur', () => validateContactField(email, validateEmail));
    }

    if (telefono) {
        telefono.addEventListener('input', function() {
            this.value = this.value.replace(/[^0-9]/g, '');
            validateContactField(telefono, validateTelefono);
        });
        telefono.addEventListener('blur', () => validateContactField(telefono, validateTelefono));
    }

    if (mensaje) {
        mensaje.addEventListener('input', () => validateContactField(mensaje, validateMensaje));
        mensaje.addEventListener('blur', () => validateContactField(mensaje, validateMensaje));
    }

    // Envío del formulario
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        submitContactForm();
    });
}

// =============== VALIDACIONES DEL FORMULARIO ===============
function validateNombre(value) {
    const regex = /^[A-Za-zÁáÉéÍíÓóÚúÜüÑñ\s]+$/;
    if (!value.trim()) {
        return { valid: false, message: 'El nombre es obligatorio' };
    }
    if (value.length < 2) {
        return { valid: false, message: 'Mínimo 2 caracteres' };
    }
    if (value.length > 50) {
        return { valid: false, message: 'Máximo 50 caracteres' };
    }
    if (!regex.test(value)) {
        return { valid: false, message: 'Solo se permiten letras' };
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

function validateTelefono(value) {
    if (!value.trim()) {
        return { valid: true, message: '' }; // Teléfono es opcional
    }
    if (value.length !== 9) {
        return { valid: false, message: 'Debe tener 9 dígitos' };
    }
    return { valid: true, message: '' };
}

function validateMensaje(value) {
    if (!value.trim()) {
        return { valid: false, message: 'El mensaje es obligatorio' };
    }
    if (value.length < 10) {
        return { valid: false, message: 'Mínimo 10 caracteres' };
    }
    if (value.length > 500) {
        return { valid: false, message: 'Máximo 500 caracteres' };
    }
    return { valid: true, message: '' };
}

function validateContactField(field, validator) {
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

function submitContactForm() {
    const form = document.getElementById('contact-form');
    const formData = new FormData(form);
    
    // Validar formulario completo
    let isValid = true;
    const fields = ['contact-nombre', 'contact-email', 'contact-mensaje'];
    
    fields.forEach(fieldId => {
        const field = document.getElementById(fieldId);
        if (field) {
            let validator;
            switch (fieldId) {
                case 'contact-nombre': validator = validateNombre; break;
                case 'contact-email': validator = validateEmail; break;
                case 'contact-mensaje': validator = validateMensaje; break;
            }
            if (!validateContactField(field, validator)) {
                isValid = false;
            }
        }
    });

    if (!isValid) {
        showToast('Por favor, corrija los errores del formulario', 'error');
        return;
    }

    // Simular envío
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    
    submitBtn.disabled = true;
    submitBtn.textContent = 'Enviando...';
    
    setTimeout(() => {
        showToast('¡Mensaje enviado correctamente!', 'success');
        form.reset();
        
        // Limpiar validaciones
        form.querySelectorAll('.form-input').forEach(input => {
            input.classList.remove('valid', 'invalid');
        });
        
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
        
        console.log('📧 Formulario de contacto enviado:', Object.fromEntries(formData));
    }, 2000);
}

// =============== UTILIDADES ===============
function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = message;
    
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
    }, 5000);
}

// =============== EXPORTAR FUNCIONES GLOBALES ===============
window.getUserLocation = getUserLocation;
window.calculateRoute = calculateRoute;
window.clearRoute = clearRoute;
window.recalculateRoute = recalculateRoute;
window.focusOnStore = focusOnStore;

console.log('📍 contacto.js cargado correctamente');