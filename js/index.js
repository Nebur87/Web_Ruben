/**
 * LITOARTE - JavaScript para Página Principal
 * Funcionalidades: Navegación, carga de noticias, animaciones, interacciones
 */

// =============== VARIABLES GLOBALES ===============
let noticias = [];
let noticiasMostradas = 3;

// =============== INICIALIZACIÓN ===============
document.addEventListener('DOMContentLoaded', function() {
    console.log('🎨 LitoArte - Inicializando aplicación...');
    
    initNavigation();
    loadNoticias();
    initScrollAnimations();
    initSmoothScroll();
    initHeaderEffects();
    
    console.log('✅ LitoArte - Aplicación inicializada correctamente');
});

// =============== NAVEGACIÓN ===============
function initNavigation() {
    const navToggle = document.querySelector('.nav-toggle');
    const navMenu = document.querySelector('.nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');

    // Toggle del menú móvil
    if (navToggle && navMenu) {
        navToggle.addEventListener('click', function() {
            navMenu.classList.toggle('active');
            navToggle.classList.toggle('active');
            
            // Prevenir scroll del body cuando el menú está abierto
            document.body.style.overflow = navMenu.classList.contains('active') ? 'hidden' : '';
        });

        // Cerrar menú al hacer click en un enlace
        navLinks.forEach(link => {
            link.addEventListener('click', function() {
                navMenu.classList.remove('active');
                navToggle.classList.remove('active');
                document.body.style.overflow = '';
            });
        });

        // Cerrar menú al hacer click fuera
        document.addEventListener('click', function(e) {
            if (!navToggle.contains(e.target) && !navMenu.contains(e.target)) {
                navMenu.classList.remove('active');
                navToggle.classList.remove('active');
                document.body.style.overflow = '';
            }
        });
    }

    // Resaltar enlace activo según la página actual
    highlightActiveNavLink();
}

function highlightActiveNavLink() {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    const navLinks = document.querySelectorAll('.nav-link');
    
    navLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (href === currentPage || 
            (currentPage === '' && href === 'index.html') ||
            (currentPage === 'index.html' && href === 'index.html')) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
}

// =============== CARGA DE NOTICIAS ===============
async function loadNoticias() {
    const container = document.getElementById('noticias-container');
    const verMasBtn = document.getElementById('ver-mas-noticias');
    
    if (!container) {
        console.warn('Container de noticias no encontrado');
        return;
    }

    try {
        console.log('📰 Cargando noticias...');
        
        const response = await fetch('noticias.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        noticias = data.noticias || [];
        
        if (noticias.length === 0) {
            mostrarMensajeNoNoticias(container);
            return;
        }

        mostrarNoticias(container);
        
        // Configurar botón "Ver más"
        if (verMasBtn) {
            verMasBtn.addEventListener('click', function() {
                noticiasMostradas += 3;
                mostrarNoticias(container);
                
                if (noticiasMostradas >= noticias.length) {
                    verMasBtn.style.display = 'none';
                }
            });
            
            // Ocultar botón si no hay más noticias para mostrar
            if (noticias.length <= noticiasMostradas) {
                verMasBtn.style.display = 'none';
            }
        }
        
        console.log(`✅ ${noticias.length} noticias cargadas correctamente`);
        
    } catch (error) {
        console.error('❌ Error al cargar noticias:', error);
        mostrarErrorNoticias(container);
    }
}

function mostrarNoticias(container) {
    // Limpiar container pero mantener el loading
    const loadingEl = container.querySelector('.loading');
    container.innerHTML = '';
    
    const noticiasAMostrar = noticias.slice(0, noticiasMostradas);
    
    noticiasAMostrar.forEach((noticia, index) => {
        const noticiaEl = createNoticiaElement(noticia, index);
        container.appendChild(noticiaEl);
    });
    
    // Animar aparición de las nuevas noticias
    const nuevasNoticias = container.querySelectorAll('.noticia-card:not(.animated)');
    nuevasNoticias.forEach((card, index) => {
        card.classList.add('animated');
        setTimeout(() => {
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
        }, index * 100);
    });
}

function createNoticiaElement(noticia, index) {
    const article = document.createElement('article');
    article.className = 'noticia-card';
    article.style.opacity = '0';
    article.style.transform = 'translateY(20px)';
    article.style.transition = 'all 0.6s ease-out';
    
    // Imagen por defecto si no existe
    const imagenSrc = noticia.imagen || 'assets/img/noticia-default.jpg';
    
    article.innerHTML = `
        <div class="noticia-image">
            <img src="${imagenSrc}" alt="${noticia.titulo}" loading="lazy" 
                 onerror="this.src='assets/img/noticia-default.jpg'">
        </div>
        <div class="noticia-content">
            <div class="noticia-fecha">${formatearFecha(noticia.fecha)}</div>
            <h3 class="noticia-titulo">${noticia.titulo}</h3>
            <p class="noticia-resumen">${noticia.resumen}</p>
            <button class="btn btn-outline" onclick="mostrarNoticiaCompleta(${noticia.id})">
                Leer más
            </button>
        </div>
    `;
    
    return article;
}

function mostrarMensajeNoNoticias(container) {
    container.innerHTML = `
        <div class="no-noticias">
            <p>📰 No hay noticias disponibles en este momento.</p>
            <p>¡Vuelve pronto para conocer nuestras novedades!</p>
        </div>
    `;
}

function mostrarErrorNoticias(container) {
    container.innerHTML = `
        <div class="error-noticias">
            <p>❌ Error al cargar las noticias.</p>
            <button class="btn btn-secondary" onclick="loadNoticias()">
                Intentar de nuevo
            </button>
        </div>
    `;
}

function formatearFecha(fechaStr) {
    try {
        // Si la fecha viene como string "28 octubre 2025"
        if (typeof fechaStr === 'string' && !fechaStr.includes('-')) {
            return fechaStr;
        }
        
        const fecha = new Date(fechaStr);
        if (isNaN(fecha)) {
            return fechaStr; // Devolver la fecha original si no se puede parsear
        }
        
        return fecha.toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    } catch (error) {
        console.warn('Error al formatear fecha:', error);
        return fechaStr;
    }
}

// =============== MODAL DE NOTICIA COMPLETA ===============
function mostrarNoticiaCompleta(noticiaId) {
    const noticia = noticias.find(n => n.id === noticiaId);
    if (!noticia) {
        console.error('Noticia no encontrada:', noticiaId);
        return;
    }
    
    // Crear modal
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
        <div class="modal-content">
            <button class="modal-close" onclick="cerrarModal(this)">&times;</button>
            <div class="modal-header">
                <h2>${noticia.titulo}</h2>
                <div class="noticia-fecha">${formatearFecha(noticia.fecha)}</div>
            </div>
            <div class="modal-body">
                ${noticia.imagen ? `<img src="${noticia.imagen}" alt="${noticia.titulo}" class="noticia-imagen-completa">` : ''}
                <p class="noticia-contenido-completo">${noticia.contenido}</p>
            </div>
            <div class="modal-footer">
                <button class="btn btn-primary" onclick="cerrarModal(this)">Cerrar</button>
                <a href="views/contacto.html" class="btn btn-secondary">Contactar</a>
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
    
    const modalContent = modal.querySelector('.modal-content');
    modalContent.style.cssText = `
        background: white;
        border-radius: 12px;
        max-width: 600px;
        max-height: 80vh;
        overflow-y: auto;
        position: relative;
        transform: scale(0.9);
        transition: transform 0.3s ease;
    `;
    
    // Agregar al DOM y animar
    document.body.appendChild(modal);
    document.body.style.overflow = 'hidden';
    
    requestAnimationFrame(() => {
        modal.style.opacity = '1';
        modalContent.style.transform = 'scale(1)';
    });
}

function cerrarModal(button) {
    const modal = button.closest('.modal-overlay');
    if (modal) {
        modal.style.opacity = '0';
        modal.querySelector('.modal-content').style.transform = 'scale(0.9)';
        
        setTimeout(() => {
            document.body.removeChild(modal);
            document.body.style.overflow = '';
        }, 300);
    }
}

// =============== EFECTOS DE SCROLL ===============
function initScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in-up');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Observar elementos animables
    const animatableElements = document.querySelectorAll('.producto-card, .caracteristica, .info-card');
    animatableElements.forEach(el => {
        observer.observe(el);
    });
}

function initSmoothScroll() {
    // Scroll suave para enlaces internos
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            
            if (target) {
                const headerHeight = document.querySelector('.header-fixed').offsetHeight;
                const targetPosition = target.offsetTop - headerHeight - 20;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
}

function initHeaderEffects() {
    const header = document.querySelector('.header-fixed');
    if (!header) return;
    
    let lastScrollY = window.scrollY;
    let ticking = false;
    
    function updateHeader() {
        const currentScrollY = window.scrollY;
        
        if (currentScrollY > 100) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
        
        // Auto-hide en móvil
        if (window.innerWidth <= 768) {
            if (currentScrollY > lastScrollY && currentScrollY > 200) {
                header.style.transform = 'translateY(-100%)';
            } else {
                header.style.transform = 'translateY(0)';
            }
        }
        
        lastScrollY = currentScrollY;
        ticking = false;
    }
    
    function requestTick() {
        if (!ticking) {
            requestAnimationFrame(updateHeader);
            ticking = true;
        }
    }
    
    window.addEventListener('scroll', requestTick);
    
    // Reset en resize
    window.addEventListener('resize', () => {
        if (window.innerWidth > 768) {
            header.style.transform = 'translateY(0)';
        }
    });
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

// =============== MANEJO DE ERRORES GLOBALES ===============
window.addEventListener('error', function(e) {
    console.error('Error global:', e.error);
    // No mostrar toast para errores de imágenes
    if (!e.filename.includes('.jpg') && !e.filename.includes('.png')) {
        showToast('Ha ocurrido un error. Por favor, recarga la página.', 'error');
    }
});

// =============== EXPORTAR FUNCIONES GLOBALES ===============
window.mostrarNoticiaCompleta = mostrarNoticiaCompleta;
window.cerrarModal = cerrarModal;
window.loadNoticias = loadNoticias;

console.log('📄 index.js cargado correctamente');