/**
 * ==================================================================================
 * INITIALISATION DE TOUTE LA LOGIQUE INTERACTIVE DU SITE
 * ==================================================================================
 */
function initializeSiteLogic() {

    // --- LOGIQUE DE L'ÉCRAN DE CHARGEMENT (PRELOADER) AVEC SÉCURITÉ ---
    const loader = document.getElementById('loader');
    if (loader) {
        let loaderHidden = false;
        const hideLoader = () => {
            if (!loaderHidden) {
                loader.classList.add('loader-hidden');
                loaderHidden = true;
            }
        };
        window.addEventListener('load', hideLoader);
        setTimeout(hideLoader, 2000);
    }

    // --- NAVBAR: EFFET AU DÉFILEMENT & MENU MOBILE ---
    const navbar = document.querySelector('.navbar');
    if (navbar) {
        window.addEventListener('scroll', () => {
            navbar.classList.toggle('scrolled', window.scrollY > 50);
        });
        const hamburger = navbar.querySelector('.nav-hamburger');
        const navMenu = navbar.querySelector('.nav-menu');
        const navLinks = navbar.querySelectorAll('.nav-link, .nav-btn, .social-link');
        hamburger.addEventListener('click', () => {
            navMenu.classList.toggle('active');
            hamburger.classList.toggle('hamburger-toggle');
        });
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                if (navMenu.classList.contains('active')) {
                    navMenu.classList.remove('active');
                    hamburger.classList.remove('hamburger-toggle');
                }
            });
        });
    }

    // --- SECTION HÉROS: EFFET PARALLAX ---
    const heroSection = document.querySelector('.hero-section');
    if (heroSection) {
        const titleBackground = heroSection.querySelector('.hero-title-background');
        const backgroundImage = heroSection.querySelector('.hero-background-image');
        const floorImage = heroSection.querySelector('.hero-floor-image');
        const foregroundImage = heroSection.querySelector('.hero-foreground-image');
        const titleMoveFactor = -1, backgroundMoveFactor = 4, floorMoveFactor = 0.5, foregroundMoveFactor = 2;
        const handleParallax = (x, y) => {
            const newY = Math.max(0, y);
            const titleParallax = `translate(${x * titleMoveFactor}px, ${y * titleMoveFactor}px)`;
            const bgParallax = `translate(${x * backgroundMoveFactor}px, ${y * backgroundMoveFactor}px)`;
            const floorParallax = `translate(${x * floorMoveFactor}px, 0px)`;
            const fgParallax = `translate(${x * foregroundMoveFactor}px, ${newY * foregroundMoveFactor}px)`;
            if (titleBackground) titleBackground.style.transform = `translate(calc(-50% + var(--hero-title-x, 0px)), calc(-50% + var(--hero-title-y, 0px))) ${titleParallax}`;
            if (backgroundImage) backgroundImage.style.transform = `translate(calc(-50% + var(--hero-bg-x)), calc(-50% + var(--hero-bg-y))) scale(var(--hero-bg-scale)) ${bgParallax}`;
            if (floorImage) floorImage.style.transform = `translate(calc(-50% + var(--hero-floor-x)), var(--hero-floor-y)) scale(var(--hero-floor-scale)) ${floorParallax}`;
            if (foregroundImage) foregroundImage.style.transform = `translate(calc(-50% + var(--hero-fg-x)), var(--hero-fg-y)) scale(var(--hero-fg-scale)) ${fgParallax}`;
        };
        handleParallax(0, 0);
        if (window.innerWidth > 768) {
            heroSection.addEventListener('mousemove', (e) => {
                const xPos = (e.clientX - window.innerWidth / 2) / window.innerWidth;
                const yPos = (e.clientY - window.innerHeight / 2) / window.innerHeight;
                handleParallax(xPos * 50, yPos * 50);
            });
        }
    }
    
    // --- LOGIQUE POUR L'ASPECT RATIO DYNAMIQUE DES CARTES DE PROGRAMME ---
    const dynamicImages = document.querySelectorAll('.program-image-dynamic');
    dynamicImages.forEach(img => {
        if (img.complete) { setAspectRatio(img); } 
        else { img.addEventListener('load', () => setAspectRatio(img)); }
    });

    function setAspectRatio(img) {
        const wrapper = img.parentElement;
        if (wrapper && img.naturalHeight > 0) {
            wrapper.style.aspectRatio = img.naturalWidth / img.naturalHeight;
        }
    }

    // --- LOGIQUE POUR LE FILTRE DE COULEUR DYNAMIQUE ---
    function updateColorFilter() {
        const colorMatrix = document.getElementById('colorize-matrix');
        if (!colorMatrix) return;
        const style = getComputedStyle(document.documentElement);
        const hexColor = style.getPropertyValue('--accent-color').trim();
        let r = 0, g = 0, b = 0;
        if (/^#([A-Fa-f0-9]{3}){1,2}$/.test(hexColor)) {
            let c = hexColor.substring(1).split('');
            if (c.length === 3) { c = [c[0], c[0], c[1], c[1], c[2], c[2]]; }
            c = '0x' + c.join('');
            r = ((c >> 16) & 255) / 255;
            g = ((c >> 8) & 255) / 255;
            b = (c & 255) / 255;
        }
        const rLum = 0.2126, gLum = 0.7152, bLum = 0.0722;
        const newValues = [
            rLum * r, gLum * r, bLum * r, 0, 0,
            rLum * g, gLum * g, bLum * g, 0, 0,
            rLum * b, gLum * b, bLum * b, 0, 0,
            0, 0, 0, 1, 0
        ].join(' ');
        colorMatrix.setAttribute('values', newValues);
    }
    updateColorFilter();

    // =================================================================================
    // CORRECTION DÉFINITIVE DU SCRIPT DE REDIRECTION
    // =================================================================================
    const redirectInput = document.getElementById('form-redirect');
    if (redirectInput) {
        // Cette nouvelle méthode est beaucoup plus robuste
        const location = window.location;
        const path = location.pathname.substring(0, location.pathname.lastIndexOf('/') + 1);
        const thankYouUrl = location.origin + path + 'thank-you.html';
        
        redirectInput.value = thankYouUrl;
    }
}

/**
 * ==================================================================================
 * CHARGEUR DE COMPOSANTS
 * ==================================================================================
 */
document.addEventListener('DOMContentLoaded', () => {
    const componentPlaceholders = document.querySelectorAll('[data-component]');
    const loadPromises = [];

    componentPlaceholders.forEach(placeholder => {
        const path = placeholder.getAttribute('data-component');
        if (path) {
            const promise = fetch(path)
                .then(response => {
                    if (!response.ok) throw new Error(`Could not load component: ${path}`);
                    return response.text();
                })
                .then(html => {
                    placeholder.outerHTML = html;
                });
            loadPromises.push(promise);
        }
    });

    Promise.all(loadPromises)
        .then(initializeSiteLogic)
        .catch(error => console.error('Error loading components:', error));
});