# 🎨 LitoArte - Ruben Litofanías

## 📖 Descripción
Sitio web profesional para **Ruben Litofanías**, especialista en la creación de litofanías personalizadas ubicado en Lüscerz, Suiza. Proyecto desarrollado como trabajo final del módulo de JavaScript.

## ✨ Características Principales

### 🏠 **Página Principal (index.html)**
- Hero section con presentación
- Sección de productos destacados
- **Carga dinámica de noticias** desde JSON con AJAX
- Sección "Acerca de" con información del taller
- Navegación responsive con menú hamburguesa

### 🖼️ **Galería (galeria.html)**
- **Sistema de filtros** por categorías (Mesa, Pared, Techo, Personalizada)
- **Lightbox modal** para visualización ampliada de imágenes
- **Lazy loading** para optimización de carga
- Grid responsive adaptable a diferentes dispositivos

### 💰 **Presupuesto (presupuesto.html)**
- **Formulario complejo** con validaciones en tiempo real
- **Cálculo automático** de precios según producto y extras
- **Sistema de descuentos** basado en plazo de entrega (5% y 10%)
- **Modal de confirmación** con resumen del pedido
- Validaciones estrictas de campos (nombre, apellidos, teléfono, email)

### 📍 **Contacto (contacto.html)**
- **Mapa interactivo** con OpenStreetMaps centrado en Lüscerz, Suiza
- **Geolocalización** del usuario
- **Cálculo de rutas** automático usando OSRM
- **Formulario de contacto** con validaciones
- **Horarios dinámicos** con indicador de estado (abierto/cerrado)

### ⚖️ **Aviso Legal (aviso-legal.html)**
- Política de privacidad completa
- Términos y condiciones
- Información sobre cookies
- Cumplimiento RGPD

## 🛠️ Tecnologías Utilizadas

### **Frontend**
- **HTML5** - Estructura semántica y accesible
- **CSS3** - Diseño responsive con variables CSS, animaciones y grid/flexbox
- **JavaScript ES6+** - Vanilla JS sin dependencias externas

### **APIs y Librerías**
- **Leaflet.js** - Mapas interactivos OpenStreetMaps
- **Leaflet Routing Machine** - Cálculo de rutas
- **OSRM** - Motor de enrutamiento open source

### **Funcionalidades Avanzadas**
- **AJAX** con fetch() para carga de datos JSON
- **Geolocalización API** del navegador
- **Local Storage** para persistencia de datos
- **Responsive Design** mobile-first
- **Progressive Enhancement**

## 📁 Estructura del Proyecto

```
trabajo_final_js/
├── index.html              # Página principal
├── noticias.json          # Base de datos de noticias
├── css/
│   └── styles.css         # Estilos completos del sitio
├── js/
│   ├── index.js           # JavaScript página principal
│   ├── galeria.js         # Funcionalidad de galería
│   ├── presupuesto.js     # Sistema de presupuestos
│   └── contacto.js        # Mapas y contacto
├── views/
│   ├── galeria.html       # Página de galería
│   ├── presupuesto.html   # Formulario de presupuestos
│   ├── contacto.html      # Página de contacto
│   └── aviso-legal.html   # Página legal
└── assets/
    └── img/               # Imágenes del sitio
```

## 🚀 Características Técnicas

### **Validaciones JavaScript**
- ✅ Nombres y apellidos (solo letras, longitud específica)
- ✅ Teléfono (formato suizo/internacional)
- ✅ Email (formato RFC compliant)
- ✅ Formularios con feedback visual en tiempo real

### **Cálculo de Presupuestos**
- ✅ Precios base por tipo de producto
- ✅ Extras opcionales con precios individuales
- ✅ Sistema de descuentos por plazo de entrega
- ✅ Cálculo automático y actualización en tiempo real

### **Integración de Mapas**
- ✅ Marcadores personalizados con iconos
- ✅ Popups informativos con datos de contacto
- ✅ Controles de navegación personalizados
- ✅ Responsive en dispositivos móviles

### **Optimización y UX**
- ✅ Lazy loading de imágenes
- ✅ Animaciones CSS suaves
- ✅ Loading states y feedback visual
- ✅ Error handling robusto
- ✅ Accesibilidad mejorada

## 🎯 Cumplimiento de Requisitos Académicos

### **✅ Requisitos HTML5**
- Estructura semántica con elementos HTML5
- 5 páginas web interconectadas
- Formularios complejos con validaciones
- Contenido multimedia integrado

### **✅ Requisitos CSS3**
- Variables CSS para mantenimiento
- Diseño responsive mobile-first
- Animaciones y transiciones
- Grid y Flexbox para layouts

### **✅ Requisitos JavaScript**
- AJAX con fetch() para carga de datos JSON
- Validaciones complejas en tiempo real
- Manipulación del DOM
- Event handling avanzado
- APIs del navegador (Geolocation)

### **✅ Funcionalidades Avanzadas**
- Integración con OpenStreetMaps
- Sistema de cálculo dinámico
- Persistencia de datos
- Interfaz de usuario interactiva

## 🌐 Datos de Contacto

- **📍 Ubicación:** Hauptstrasse 50, 2575 Lüscerz, Suiza
- **📞 Teléfono:** +41 32 315 55 55
- **📧 Email:** info@rubenlitofanias.ch
- **⏰ Horarios:** Lun-Vie 9:00-18:00, Sáb 10:00-14:00

## 🔧 Instalación y Uso

1. **Clonar el repositorio:**
   ```bash
   git clone https://github.com/Nebur87/Web_Ruben.git
   cd Web_Ruben
   ```

2. **Abrir con Live Server:**
   - Usar extensión Live Server en VS Code
   - O abrir `index.html` directamente en el navegador

3. **Para desarrollo local:**
   ```bash
   # Con Python
   python -m http.server 8000
   
   # Con Node.js
   npx http-server
   ```

## 📊 Estado del Proyecto

- ✅ **HTML:** Validado W3C sin errores
- ✅ **CSS:** Sintaxis perfecta y responsive
- ✅ **JavaScript:** Funcional sin errores de consola
- ✅ **Compatibilidad:** Probado en Chrome, Firefox, Safari, Edge
- ✅ **Responsive:** Optimizado para móviles y tablets

## 🏆 Características Destacadas

- **🎨 Diseño profesional** listo para uso comercial
- **⚡ Rendimiento optimizado** con lazy loading
- **🔒 Formularios seguros** con validaciones estrictas
- **🗺️ Mapas avanzados** con geolocalización
- **📱 Totalmente responsive** en todos los dispositivos
- **♿ Accesible** con estructura semántica

---

**Desarrollado por:** Ruben  
**Proyecto:** Trabajo Final JavaScript  
**Fecha:** Noviembre 2025  
**Tecnologías:** HTML5 + CSS3 + JavaScript ES6+ + OpenStreetMaps