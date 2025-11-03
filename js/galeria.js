/**
 * LITOARTE - JavaScript para Galería de Litofanías
 * Funcionalidades: Filtros, lightbox, lazy loading, efectos visuales
 */

// =============== VARIABLES GLOBALES ===============
let galleryItems = [];
let filteredItems = [];
let currentImageIndex = 0;
let lightboxImages = [];
let isLightboxOpen = false;

// =============== CONFIGURACIÓN DE IMÁGENES DE EJEMPLO ===============
const sampleImages = {
    mesa: [
        { 
            src: '../assets/img/galeria/mesa-01.jpg', 
            title: 'Lámpara de Mesa Familiar', 
            description: 'Lámpara de mesa personalizada con imagen familiar. Iluminación LED cálida.',
            price: '45€'
        },
        { 
            src: '../assets/img/galeria/mesa-02.jpg', 
            title: 'Lámpara de Mesa Vintage', 
            description: 'Diseño vintage con acabados en madera y litofanía clásica.',
            price: '55€'
        },
        { 
            src: '../assets/img/galeria/mesa-03.jpg', 
            title: 'Lámpara de Mesa Moderna', 
            description: 'Diseño minimalista perfecto para espacios contemporáneos.',
            price: '50€'
        }
    ],
    pared: [
        { 
            src: '../assets/img/galeria/pared-01.jpg', 
            title: 'Lámpara de Pared Paisaje', 
            description: 'Elegante aplique de pared con litofanía de paisaje montañoso.',
            price: '65€'
        },
        { 
            src: '../assets/img/galeria/pared-02.jpg', 
            title: 'Lámpara de Pared Floral', 
            description: 'Delicado diseño floral para espacios elegantes y relajantes.',
            price: '70€'
        },
        { 
            src: '../assets/img/galeria/pared-03.jpg', 
            title: 'Lámpara de Pared Geométrica', 
            description: 'Patrones geométricos que crean efectos lumínicos únicos.',
            price: '75€'
        }
    ],
    techo: [
        { 
            src: '../assets/img/galeria/techo-01.jpg', 
            title: 'Lámpara de Techo Arquitectónica', 
            description: 'Impresionante lámpara de techo con diseño arquitectónico moderno.',
            price: '120€'
        },
        { 
            src: '../assets/img/galeria/techo-02.jpg', 
            title: 'Lámpara de Techo Circular', 
            description: 'Diseño circular con múltiples litofanías que crean un ambiente único.',
            price: '140€'
        },
        { 
            src: '../assets/img/galeria/techo-03.jpg', 
            title: 'Lámpara de Techo Artística', 
            description: 'Pieza única que combina arte y funcionalidad en techos altos.',
            price: '180€'
        }
    ],
    personalizada: [
        { 
            src: '../assets/img/galeria/personalizada-01.jpg', 
            title: 'Litofanía Personalizada Mascota', 
            description: 'Litofanía especial creada a partir de una fotografía de mascota querida.',
            price: '80€'
        },
        { 
            src: '../assets/img/galeria/personalizada-02.jpg', 
            title: 'Retrato Familiar Personalizado', 
            description: 'Litofanía única con retrato familiar en alta definición.',
            price: '95€'
        },
        { 
            src: '../assets/img/galeria/personalizada-03.jpg', 
            title: 'Paisaje Personalizado', 
            description: 'Tu lugar favorito convertido en una hermosa litofanía.',
            price: '85€'
        }
    ]
};

// =============== INICIALIZACIÓN ===============
document.addEventListener('DOMContentLoaded', function() {
    console.log('🖼️ Galería - Inicializando...');
    
    initNavigation();
    initGallery();
    initFilters();
    initLightbox();
    initLazyLoading();
    initLoadMoreButton();
    
    console.log('✅ Galería - Inicializada correctamente');
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

        // Cerrar menú al hacer click en enlaces
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', function() {
                navMenu.classList.remove('active');
                document.body.style.overflow = '';
            });
        });
    }
}

// =============== INICIALIZACIÓN DE GALERÍA ===============
function initGallery() {
    const galleryGrid = document.getElementById('gallery-grid');
    if (!galleryGrid) {
        console.error('Grid de galería no encontrado');
        return;
    }

    // Limpiar galería actual (elementos estáticos del HTML)
    galleryGrid.innerHTML = '';
    
    // Generar todas las imágenes dinámicamente
    generateGalleryItems();
    
    // Mostrar todas las imágenes inicialmente
    filteredItems = [...galleryItems];
    renderGallery();
}

function generateGalleryItems() {
    galleryItems = [];
    
    // Combinar todas las categorías
    Object.keys(sampleImages).forEach(category => {
        sampleImages[category].forEach((item, index) => {
            galleryItems.push({
                ...item,
                category: category,
                id: `${category}-${index + 1}`,
                // Imagen placeholder si no existe la real
                src: `https://picsum.photos/400/300?random=${galleryItems.length + 1}`
            });
        });
    });
    
    console.log(`📸 ${galleryItems.length} imágenes generadas para la galería`);
}

function renderGallery() {
    const galleryGrid = document.getElementById('gallery-grid');
    if (!galleryGrid) return;
    
    galleryGrid.innerHTML = '';
    
    filteredItems.forEach((item, index) => {
        const galleryItem = createGalleryItem(item, index);
        galleryGrid.appendChild(galleryItem);
    });
    
    // Actualizar array de imágenes para lightbox
    lightboxImages = filteredItems.map(item => ({
        src: item.src,
        title: item.title,
        description: item.description
    }));
    
    // Animar aparición
    animateGalleryItems();
}

function createGalleryItem(item, index) {
    const article = document.createElement('article');
    article.className = 'gallery-item';
    article.setAttribute('data-category', item.category);
    article.style.opacity = '0';
    article.style.transform = 'translateY(20px)';
    
    article.innerHTML = `
        <div class="gallery-image">
            <img src="${item.src}" alt="${item.title}" loading="lazy" 
                 onerror="this.src='https://picsum.photos/400/300?random=${index + 100}'">
            <div class="gallery-overlay">
                <button class="gallery-btn view-btn" onclick="openLightbox(${index})" 
                        data-title="${item.title}">
                    <span class="icon">👁️</span>
                    Ver
                </button>
                <button class="gallery-btn info-btn" onclick="showItemInfo('${item.id}')"
                        data-description="${item.description}">
                    <span class="icon">ℹ️</span>
                    Info
                </button>
            </div>
        </div>
        <div class="gallery-info">
            <h3>${item.title}</h3>
            <p>${item.description.substring(0, 60)}...</p>
            <span class="gallery-price">${item.price}</span>
        </div>
    `;
    
    return article;
}

function animateGalleryItems() {
    const items = document.querySelectorAll('.gallery-item');
    items.forEach((item, index) => {
        setTimeout(() => {
            item.style.transition = 'all 0.6s ease-out';
            item.style.opacity = '1';
            item.style.transform = 'translateY(0)';
        }, index * 100);
    });
}

// =============== SISTEMA DE FILTROS ===============
function initFilters() {
    const filterBtns = document.querySelectorAll('.filter-btn');
    
    filterBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const filter = this.getAttribute('data-filter');
            
            // Actualizar botones activos
            filterBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            
            // Filtrar y mostrar imágenes
            filterGallery(filter);
        });
    });
}

function filterGallery(filter) {
    console.log(`🔍 Filtrando galería por: ${filter}`);
    
    if (filter === 'all') {
        filteredItems = [...galleryItems];
    } else {
        filteredItems = galleryItems.filter(item => item.category === filter);
    }
    
    // Animar salida de elementos actuales
    const currentItems = document.querySelectorAll('.gallery-item');
    currentItems.forEach((item, index) => {
        setTimeout(() => {
            item.style.opacity = '0';
            item.style.transform = 'translateY(-20px)';
        }, index * 50);
    });
    
    // Renderizar nuevos elementos después de la animación
    setTimeout(() => {
        renderGallery();
    }, currentItems.length * 50 + 200);
}

// =============== LIGHTBOX ===============
function initLightbox() {
    // Crear estructura del lightbox si no existe
    if (!document.getElementById('lightbox')) {
        createLightboxStructure();
    }
    
    // Event listeners para navegación con teclado
    document.addEventListener('keydown', function(e) {
        if (!isLightboxOpen) return;
        
        switch(e.key) {
            case 'Escape':
                closeLightbox();
                break;
            case 'ArrowLeft':
                prevImage();
                break;
            case 'ArrowRight':
                nextImage();
                break;
        }
    });
}

function createLightboxStructure() {
    const lightbox = document.createElement('div');
    lightbox.id = 'lightbox';
    lightbox.className = 'lightbox';
    lightbox.setAttribute('aria-hidden', 'true');
    
    lightbox.innerHTML = `
        <div class="lightbox-content">
            <button class="lightbox-close" onclick="closeLightbox()" aria-label="Cerrar imagen ampliada">&times;</button>
            <button class="lightbox-prev" onclick="prevImage()" aria-label="Imagen anterior">&#8249;</button>
            <button class="lightbox-next" onclick="nextImage()" aria-label="Imagen siguiente">&#8250;</button>
            
            <div class="lightbox-image-container">
                <img id="lightbox-image" src="" alt="" class="lightbox-image">
            </div>
            
            <div class="lightbox-info">
                <h3 id="lightbox-title"></h3>
                <p id="lightbox-description"></p>
                <div class="lightbox-actions">
                    <a href="../views/presupuesto.html" class="btn btn-primary">Solicitar Presupuesto</a>
                    <button class="btn btn-secondary" onclick="closeLightbox()">Cerrar</button>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(lightbox);
    
    // Click fuera del contenido para cerrar
    lightbox.addEventListener('click', function(e) {
        if (e.target === this) {
            closeLightbox();
        }
    });
}

function openLightbox(index) {
    if (lightboxImages.length === 0) return;
    
    currentImageIndex = Math.max(0, Math.min(index, lightboxImages.length - 1));
    isLightboxOpen = true;
    
    const lightbox = document.getElementById('lightbox');
    const lightboxImage = document.getElementById('lightbox-image');
    const lightboxTitle = document.getElementById('lightbox-title');
    const lightboxDescription = document.getElementById('lightbox-description');
    
    const currentImage = lightboxImages[currentImageIndex];
    
    // Actualizar contenido
    lightboxImage.src = currentImage.src;
    lightboxImage.alt = currentImage.title;
    lightboxTitle.textContent = currentImage.title;
    lightboxDescription.textContent = currentImage.description;
    
    // Mostrar lightbox
    lightbox.classList.add('active');
    lightbox.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    
    // Focus en el lightbox para accesibilidad
    lightbox.focus();
    
    console.log(`🔍 Lightbox abierto - Imagen ${currentImageIndex + 1} de ${lightboxImages.length}`);
}

function closeLightbox() {
    const lightbox = document.getElementById('lightbox');
    if (!lightbox) return;
    
    lightbox.classList.remove('active');
    lightbox.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    isLightboxOpen = false;
    
    console.log('❌ Lightbox cerrado');
}

function nextImage() {
    if (lightboxImages.length === 0) return;
    
    currentImageIndex = (currentImageIndex + 1) % lightboxImages.length;
    updateLightboxContent();
}

function prevImage() {
    if (lightboxImages.length === 0) return;
    
    currentImageIndex = currentImageIndex === 0 ? lightboxImages.length - 1 : currentImageIndex - 1;
    updateLightboxContent();
}

function updateLightboxContent() {
    const lightboxImage = document.getElementById('lightbox-image');
    const lightboxTitle = document.getElementById('lightbox-title');
    const lightboxDescription = document.getElementById('lightbox-description');
    
    const currentImage = lightboxImages[currentImageIndex];
    
    // Efecto de transición
    lightboxImage.style.opacity = '0';
    
    setTimeout(() => {
        lightboxImage.src = currentImage.src;
        lightboxImage.alt = currentImage.title;
        lightboxTitle.textContent = currentImage.title;
        lightboxDescription.textContent = currentImage.description;
        lightboxImage.style.opacity = '1';
    }, 200);
}

// =============== INFORMACIÓN DE ELEMENTOS ===============
function showItemInfo(itemId) {
    const item = galleryItems.find(i => i.id === itemId);
    if (!item) return;
    
    // Crear modal de información
    const modal = document.createElement('div');
    modal.className = 'info-modal-overlay';
    modal.innerHTML = `
        <div class="info-modal-content">
            <button class="info-modal-close" onclick="closeInfoModal(this)">&times;</button>
            <div class="info-modal-header">
                <h3>${item.title}</h3>
                <span class="info-modal-price">${item.price}</span>
            </div>
            <div class="info-modal-body">
                <img src="${item.src}" alt="${item.title}" class="info-modal-image">
                <p class="info-modal-description">${item.description}</p>
                <div class="info-modal-details">
                    <div class="detail-item">
                        <strong>Categoría:</strong> ${getCategoryName(item.category)}
                    </div>
                    <div class="detail-item">
                        <strong>Materiales:</strong> PLA premium, LED de calidad
                    </div>
                    <div class="detail-item">
                        <strong>Tiempo de fabricación:</strong> 7-14 días
                    </div>
                </div>
            </div>
            <div class="info-modal-footer">
                <a href="../views/presupuesto.html" class="btn btn-primary">Solicitar Presupuesto</a>
                <button class="btn btn-secondary" onclick="closeInfoModal(this)">Cerrar</button>
            </div>
        </div>
    `;
    
    // Estilos del modal
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
}

function closeInfoModal(button) {
    const modal = button.closest('.info-modal-overlay');
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

function getCategoryName(category) {
    const names = {
        'mesa': 'Lámparas de Mesa',
        'pared': 'Lámparas de Pared',
        'techo': 'Lámparas de Techo',
        'personalizada': 'Diseños Personalizados'
    };
    return names[category] || category;
}

// =============== LAZY LOADING ===============
function initLazyLoading() {
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src || img.src;
                    img.classList.remove('lazy');
                    observer.unobserve(img);
                }
            });
        });

        // Observar imágenes con clase lazy
        document.querySelectorAll('img.lazy').forEach(img => {
            imageObserver.observe(img);
        });
    }
}

// =============== BOTÓN "CARGAR MÁS" ===============
function initLoadMoreButton() {
    const loadMoreBtn = document.getElementById('load-more');
    if (loadMoreBtn) {
        loadMoreBtn.addEventListener('click', function() {
            // Simular carga de más imágenes
            addMoreImages();
        });
    }
}

function addMoreImages() {
    console.log('📸 Cargando más imágenes...');
    
    const loadMoreBtn = document.getElementById('load-more');
    if (loadMoreBtn) {
        loadMoreBtn.textContent = 'Cargando...';
        loadMoreBtn.disabled = true;
    }
    
    // Simular delay de carga
    setTimeout(() => {
        // Agregar más imágenes de ejemplo
        const newImages = [
            { 
                src: 'https://picsum.photos/400/300?random=50', 
                title: 'Nueva Lámpara Especial', 
                description: 'Diseño único recién agregado a nuestra colección.',
                price: '90€',
                category: 'personalizada',
                id: 'new-1'
            },
            { 
                src: 'https://picsum.photos/400/300?random=51', 
                title: 'Edición Limitada', 
                description: 'Pieza exclusiva disponible por tiempo limitado.',
                price: '110€',
                category: 'mesa',
                id: 'new-2'
            }
        ];
        
        galleryItems.push(...newImages);
        
        // Si hay filtro activo, aplicarlo a las nuevas imágenes
        const activeFilter = document.querySelector('.filter-btn.active').getAttribute('data-filter');
        if (activeFilter === 'all') {
            filteredItems.push(...newImages);
        } else {
            filteredItems.push(...newImages.filter(img => img.category === activeFilter));
        }
        
        // Renderizar solo las nuevas imágenes
        const galleryGrid = document.getElementById('gallery-grid');
        const startIndex = filteredItems.length - newImages.length;
        
        newImages.forEach((item, index) => {
            if (activeFilter === 'all' || item.category === activeFilter) {
                const galleryItem = createGalleryItem(item, startIndex + index);
                galleryGrid.appendChild(galleryItem);
            }
        });
        
        // Actualizar lightbox images
        lightboxImages = filteredItems.map(item => ({
            src: item.src,
            title: item.title,
            description: item.description
        }));
        
        // Restaurar botón
        if (loadMoreBtn) {
            loadMoreBtn.textContent = 'Cargar más imágenes';
            loadMoreBtn.disabled = false;
        }
        
        // Animar nuevas imágenes
        const newItems = galleryGrid.querySelectorAll('.gallery-item:not(.animated)');
        newItems.forEach((item, index) => {
            item.classList.add('animated');
            setTimeout(() => {
                item.style.transition = 'all 0.6s ease-out';
                item.style.opacity = '1';
                item.style.transform = 'translateY(0)';
            }, index * 100);
        });
        
        console.log('✅ Nuevas imágenes cargadas');
        
    }, 1500);
}

// =============== EXPORTAR FUNCIONES GLOBALES ===============
window.openLightbox = openLightbox;
window.closeLightbox = closeLightbox;
window.nextImage = nextImage;
window.prevImage = prevImage;
window.showItemInfo = showItemInfo;
window.closeInfoModal = closeInfoModal;

console.log('🖼️ galeria.js cargado correctamente');