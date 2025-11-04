/**
 * Generador y gestor de reseñas multiidioma
 */

// Datos para generar reseñas
const NOMBRES = {
    de: ['Klaus', 'Hans', 'Petra', 'Helga', 'Wolfgang', 'Greta', 'Friedrich', 'Ursula', 'Dieter', 'Ingrid', 'Stefan', 'Monika', 'Thomas', 'Sabine', 'Michael'],
    fr: ['Marie', 'Pierre', 'Sophie', 'Jean', 'Camille', 'Laurent', 'Isabelle', 'François', 'Nathalie', 'Philippe', 'Valérie', 'Antoine', 'Céline', 'Nicolas'],
    it: ['Marco', 'Giuseppe', 'Maria', 'Francesca', 'Luigi', 'Sofia', 'Antonio', 'Giulia', 'Andrea', 'Chiara', 'Matteo', 'Valentina', 'Luca', 'Elena'],
    es: ['Carlos', 'Ana', 'José', 'María', 'Antonio', 'Carmen', 'Francisco', 'Isabel', 'Manuel', 'Laura', 'David', 'Marta', 'Javier', 'Patricia'],
    pt: ['João', 'Ana', 'Pedro', 'Maria', 'Carlos', 'Sofia', 'Miguel', 'Beatriz', 'António', 'Mariana', 'Francisco', 'Carolina', 'Ricardo', 'Inês']
};

const APELLIDOS = {
    de: ['Müller', 'Schmidt', 'Weber', 'Fischer', 'Wagner', 'Becker', 'Schulz', 'Hoffmann', 'Koch', 'Richter', 'Klein', 'Wolf', 'Schröder', 'Neumann'],
    fr: ['Dubois', 'Martin', 'Bernard', 'Thomas', 'Robert', 'Richard', 'Petit', 'Durand', 'Leroy', 'Moreau', 'Simon', 'Laurent', 'Lefebvre', 'Michel'],
    it: ['Rossi', 'Russo', 'Ferrari', 'Esposito', 'Bianchi', 'Romano', 'Colombo', 'Ricci', 'Marino', 'Greco', 'Bruno', 'Gallo', 'Conti', 'De Luca'],
    es: ['García', 'Rodríguez', 'Martínez', 'López', 'González', 'Hernández', 'Pérez', 'Sánchez', 'Ramírez', 'Torres', 'Flores', 'Rivera', 'Gómez'],
    pt: ['Silva', 'Santos', 'Ferreira', 'Pereira', 'Oliveira', 'Costa', 'Rodrigues', 'Martins', 'Sousa', 'Fernandes', 'Gonçalves', 'Gomes', 'Lopes']
};

const PAISES = {
    de: 'Alemania',
    fr: 'Francia',
    it: 'Italia',
    es: 'España',
    pt: 'Portugal'
};

const TEXTOS_RESENAS = {
    de: [
        'Absolut fantastisch! Die Qualität der Lithophanie ist erstklassig.',
        'Wunderschöne Arbeit! Ein echtes Kunstwerk für mein Zuhause.',
        'Sehr zufrieden mit dem Kauf. Schnelle Lieferung und perfekte Verpackung.',
        'Hervorragende Schweizer Qualität! Kann ich nur weiterempfehlen.',
        'Die Lithophanie übertrifft alle Erwartungen. Einfach perfekt!',
        'Toller Service und exzellente Handwerkskunst. Danke!',
        'Meine Familie war begeistert vom Geschenk. Wunderschön!',
        'Professionelle Arbeit und schneller Versand. Sehr empfehlenswert!',
        'Die LED-Beleuchtung ist perfekt abgestimmt. Großartig!',
        'Beste Lithophanie die ich je gesehen habe. Absolut empfehlenswert!',
        'Genau wie auf den Fotos. Die Details sind beeindruckend!',
        'Super Geschenkidee! Meine Frau hat Freudentränen vergossen.',
        'Hochwertige Verarbeitung und tolles Design. Danke!',
        'Die Erinnerungen an unsere Hochzeit erstrahlen nun jeden Tag.',
        'Bin absolut begeistert. Top Qualität zum fairen Preis!',
        'Die Lampe ist ein echter Hingucker in unserem Wohnzimmer.',
        'Tolle Handarbeit! Man sieht die Liebe zum Detail.',
        'Sehr guter Kundenservice. Alle Fragen wurden schnell beantwortet.',
        'Die 3D-Druck Technologie ist faszinierend. Tolles Ergebnis!',
        'Preis-Leistung stimmt absolut. Werde wieder bestellen!'
    ],
    fr: [
        'Magnifique travail artisanal. Je recommande vivement!',
        'Service client exceptionnel. La lampe est parfaite!',
        'Qualité impeccable et livraison rapide. Très satisfait!',
        'Un cadeau parfait pour ma mère. Elle était ravie!',
        'L\'impression 3D est d\'une précision incroyable. Bravo!',
        'Excellent rapport qualité-prix. Je commanderai à nouveau!',
        'La lumière LED donne un effet magnifique aux photos.',
        'Travail soigné et professionnel. Merci beaucoup!',
        'Superbe réalisation qui illumine mon salon. Parfait!',
        'Je suis très impressionné par la qualité du produit.',
        'Les détails sont extraordinaires. Un vrai chef-d\'œuvre!',
        'Emballage soigné et livraison dans les délais annoncés.',
        'Mes amis me demandent tous où j\'ai trouvé cette merveille!',
        'La lithophanie a dépassé toutes mes attentes. Magnifique!',
        'Service personnalisé et résultat exceptionnel. Merci!',
        'C\'est le cadeau idéal pour immortaliser des souvenirs.',
        'Qualité suisse irréprochable. Je suis ravi!',
        'L\'éclairage LED crée une ambiance chaleureuse parfaite.',
        'Artisanat de haute qualité. Félicitations!',
        'Je recommande à 100%. Produit et service excellents!'
    ],
    it: [
        'Semplicemente perfetto! La qualità supera le aspettative.',
        'Bellissima lampada! Arrivata ben imballata e intatta.',
        'Lavoro eccellente. La consiglio a tutti!',
        'La litofania è stupenda. Un vero capolavoro!',
        'Servizio clienti fantastico e prodotto di alta qualità.',
        'Molto soddisfatto dell\'acquisto. Ottimo lavoro!',
        'Le foto di famiglia sono venute meravigliosamente.',
        'Qualità svizzera impeccabile. Consiglio vivamente!',
        'Un regalo perfetto che ha emozionato tutti.',
        'Artigianato di altissimo livello. Complimenti!',
        'I dettagli sono incredibili. Sembra una vera opera d\'arte!',
        'Spedizione veloce e packaging professionale. Perfetto!',
        'La luce LED esalta perfettamente le foto. Bellissimo!',
        'Rapporto qualità-prezzo eccellente. Molto soddisfatto!',
        'Ho ordinato già la seconda. Sono capolavori!',
        'Il servizio clienti è stato molto disponibile e gentile.',
        'La stampa 3D è di una precisione sorprendente.',
        'Regalo unico che lascia tutti a bocca aperta. Fantastico!',
        'Qualità premium e attenzione ai dettagli impressionante.',
        'Consegna puntuale e prodotto perfetto. Grazie mille!'
    ],
    es: [
        'Trabajo impecable. Superó todas mis expectativas.',
        'La atención al detalle es increíble. Muy recomendable!',
        'Excelente calidad y servicio rápido. Muy satisfecho!',
        'Un regalo perfecto. La calidad es extraordinaria.',
        'Profesionalidad y calidad suiza. No puedo estar más contento.',
        'La litofanía quedó preciosa con las fotos de mi boda.',
        'Servicio al cliente excepcional. Producto de primera calidad.',
        'Entrega rápida y producto impecable. Recomiendo 100%!',
        'La iluminación LED es perfecta. Trabajo espectacular!',
        'Artesanía de primera. Volveré a comprar seguro.',
        'Los detalles son asombrosos. Una verdadera obra de arte!',
        'Embalaje perfecto y entrega puntual. Muy profesionales.',
        'Mi familia quedó emocionada con el regalo. ¡Precioso!',
        'Calidad premium a precio justo. Estoy encantado!',
        'El acabado es impresionante. Mejor de lo esperado.',
        'Atención personalizada y resultado espectacular. Gracias!',
        'La tecnología LED crea un ambiente mágico. Perfecto!',
        'He pedido ya tres lámparas. Todas perfectas!',
        'Regalo único que emocionó a mi madre. Excelente!',
        'Profesionales de verdad. Calidad suiza garantizada.'
    ],
    pt: [
        'Produto excepcional! Recomendo muito!',
        'Qualidade suíça impecável. Muito satisfeito!',
        'A litofania ficou linda com as fotos da família.',
        'Excelente acabamento e entrega rápida. Perfeito!',
        'Trabalho artesanal de primeira qualidade. Adorei!',
        'Atendimento profissional e produto impecável.',
        'As fotos ficaram maravilhosas iluminadas. Lindo!',
        'Qualidade excepcional e preço justo. Recomendo!',
        'Presente perfeito que emocionou muito. Obrigado!',
        'Tecnologia LED funciona perfeitamente. Excelente!',
        'Os detalhes são incríveis. Uma verdadeira obra de arte!',
        'Embalagem cuidadosa e entrega no prazo. Profissionais!',
        'Minha esposa chorou de emoção. Presente perfeito!',
        'Qualidade premium. Melhor compra que já fiz!',
        'O acabamento é impecável. Superou expectativas!',
        'Atendimento personalizado e resultado espetacular.',
        'A iluminação LED cria um ambiente acolhedor perfeito.',
        'Já encomendei a segunda. São obras de arte!',
        'Presente único que deixou todos impressionados.',
        'Profissionalismo e qualidade suíça. Recomendo muito!'
    ]
};

let todasLasResenas = [];
let resenasMostradas = 12;
let idiomaFiltro = 'todos';

// Generar nombre completo
function generarNombre(idioma) {
    const nombres = NOMBRES[idioma];
    const apellidos = APELLIDOS[idioma];
    const nombre = nombres[Math.floor(Math.random() * nombres.length)];
    const apellido = apellidos[Math.floor(Math.random() * apellidos.length)];
    return `${nombre} ${apellido}`;
}

// Generar puntuación con distribución realista para 4.8
function generarPuntuacion() {
    const random = Math.random() * 100;
    if (random < 81) return 5;  // 81%
    if (random < 95) return 4;  // 14%
    if (random < 99) return 3;  // 4%
    if (random < 99.5) return 2; // 0.5%
    return 1; // 0.5%
}

// Generar fecha aleatoria (últimos 6 meses)
function generarFecha() {
    const hoy = new Date();
    const diasAtras = Math.floor(Math.random() * 180);
    const fecha = new Date(hoy.getTime() - (diasAtras * 24 * 60 * 60 * 1000));
    return fecha.toISOString().split('T')[0];
}

// Generar 470 reseñas
function generarResenas() {
    const resenas = [];
    const idiomas = ['de', 'fr', 'it', 'es', 'pt'];
    const distribucionIdiomas = { de: 35, fr: 25, it: 20, es: 15, pt: 5 }; // Porcentajes

    for (let i = 1; i <= 470; i++) {
        // Seleccionar idioma según distribución
        let idiomaSeleccionado;
        const randomIdioma = Math.random() * 100;
        if (randomIdioma < 35) idiomaSeleccionado = 'de';
        else if (randomIdioma < 60) idiomaSeleccionado = 'fr';
        else if (randomIdioma < 80) idiomaSeleccionado = 'it';
        else if (randomIdioma < 95) idiomaSeleccionado = 'es';
        else idiomaSeleccionado = 'pt';

        const textos = TEXTOS_RESENAS[idiomaSeleccionado];
        
        resenas.push({
            id: i,
            nombre: generarNombre(idiomaSeleccionado),
            pais: PAISES[idiomaSeleccionado],
            idioma: idiomaSeleccionado,
            puntuacion: generarPuntuacion(),
            fecha: generarFecha(),
            texto: textos[Math.floor(Math.random() * textos.length)],
            verificado: Math.random() > 0.05 // 95% verificadas
        });
    }

    // Ordenar por fecha (más recientes primero)
    return resenas.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
}

// Formatear fecha
function formatearFecha(fechaStr) {
    const fecha = new Date(fechaStr);
    const opciones = { year: 'numeric', month: 'long', day: 'numeric' };
    return fecha.toLocaleDateString('es-ES', opciones);
}

// Obtener bandera por idioma
function obtenerBandera(idioma) {
    const banderas = {
        de: '🇩🇪',
        fr: '🇫🇷',
        it: '🇮🇹',
        es: '🇪🇸',
        pt: '🇵🇹'
    };
    return banderas[idioma] || '';
}

// Crear elemento HTML de reseña
function crearResenaElement(resena) {
    const div = document.createElement('div');
    div.className = 'resena-card';
    div.dataset.idioma = resena.idioma;

    const estrellas = '⭐'.repeat(resena.puntuacion);
    const iniciales = resena.nombre.split(' ').map(n => n[0]).join('');

    div.innerHTML = `
        <div class="resena-header">
            <div class="resena-autor">
                <div class="resena-avatar">${iniciales}</div>
                <div class="resena-info">
                    <h4>${resena.nombre}</h4>
                    <div class="resena-pais">${obtenerBandera(resena.idioma)} ${resena.pais}</div>
                </div>
            </div>
            <div class="resena-puntuacion">${estrellas}</div>
        </div>
        <p class="resena-texto">"${resena.texto}"</p>
        <div class="resena-footer">
            <span class="resena-fecha">${formatearFecha(resena.fecha)}</span>
            ${resena.verificado ? '<span class="resena-verificado">✓ Compra verificada</span>' : ''}
        </div>
    `;

    return div;
}

// Mostrar reseñas
function mostrarResenas() {
    const container = document.getElementById('resenas-lista');
    if (!container) return;

    container.innerHTML = '';

    const resenasFiltradas = idiomaFiltro === 'todos' 
        ? todasLasResenas 
        : todasLasResenas.filter(r => r.idioma === idiomaFiltro);

    const resenasAMostrar = resenasFiltradas.slice(0, resenasMostradas);

    resenasAMostrar.forEach(resena => {
        container.appendChild(crearResenaElement(resena));
    });

    // Mostrar/ocultar botón "Ver más"
    const btnVerMas = document.getElementById('cargar-mas-resenas');
    if (btnVerMas) {
        btnVerMas.style.display = resenasMostradas >= resenasFiltradas.length ? 'none' : 'block';
    }
}

// Inicializar sistema de reseñas
function initResenas() {
    console.log('📝 Cargando sistema de reseñas...');
    
    // Generar todas las reseñas
    todasLasResenas = generarResenas();
    
    // Mostrar primeras reseñas
    mostrarResenas();

    // Filtros de idioma
    const filtros = document.querySelectorAll('.filtro-btn');
    filtros.forEach(btn => {
        btn.addEventListener('click', function() {
            filtros.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            
            idiomaFiltro = this.dataset.idioma;
            resenasMostradas = 12;
            mostrarResenas();
        });
    });

    // Botón cargar más
    const btnCargarMas = document.getElementById('cargar-mas-resenas');
    if (btnCargarMas) {
        btnCargarMas.addEventListener('click', function() {
            resenasMostradas += 12;
            mostrarResenas();
        });
    }

    console.log(`✅ ${todasLasResenas.length} reseñas cargadas correctamente`);
}

// Exportar función de inicialización
window.initResenas = initResenas;
