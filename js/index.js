/**
 * LITOARTE - JavaScript para Página Principal
 * Funcionalidades: Navegación, animaciones, interacciones
 */

// =============== INICIALIZACIÓN ===============
document.addEventListener('DOMContentLoaded', function() {
    console.log('🎨 LitoArte - Inicializando aplicación...');
    
    initNavigation();
    initScrollAnimations();
    initSmoothScroll();
    initHeaderEffects();
    
    // Inicializar sistema de reseñas si existe
    if (typeof initResenas === 'function') {
        initResenas();
    }
    
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

// =============== ANIMACIONES AL SCROLL ===============
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
    const animatableElements = document.querySelectorAll('.producto-card, .caracteristica, .testimonio-card');
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
    if (e.filename && !e.filename.includes('.jpg') && !e.filename.includes('.png') && !e.filename.includes('.svg')) {
        showToast('Ha ocurrido un error. Por favor, recarga la página.', 'error');
    }
});

console.log('📄 index.js cargado correctamente');