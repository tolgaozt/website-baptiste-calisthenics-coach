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

        // Option 1 : La page charge rapidement
        window.addEventListener('load', hideLoader);

        // Option 2 : Failsafe si le chargement est trop long (2 secondes max)
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

    // --- SECTION À PROPOS: CARROUSEL ---
    const carousel = document.querySelector('.about-image-carousel');
    if (carousel) {
        const track = carousel.querySelector('.carousel-track');
        const slides = Array.from(track.children);
        const dotsNav = carousel.querySelector('.carousel-nav');
        const dots = Array.from(dotsNav.children);
        if (slides.length === 0) return;
        let currentIndex = 0;
        const slideWidth = slides[0].getBoundingClientRect().width;
        const moveToSlide = (targetIndex) => {
            if (!track || !dots[currentIndex] || !dots[targetIndex]) return;
            track.style.transform = 'translateX(-' + slideWidth * targetIndex + 'px)';
            dots[currentIndex].classList.remove('active');
            dots[targetIndex].classList.add('active');
            currentIndex = targetIndex;
        };
        dotsNav.addEventListener('click', e => {
            const targetDot = e.target.closest('button.carousel-dot');
            if (!targetDot) return;
            const targetIndex = dots.findIndex(dot => dot === targetDot);
            moveToSlide(targetIndex);
        });
        let isDragging = false, startPos = 0, currentTranslate = 0, prevTranslate = 0;
        const getPositionX = (event) => event.type.includes('mouse') ? event.pageX : event.touches[0].clientX;
        const touchStart = (event) => { isDragging = true; startPos = getPositionX(event); carousel.style.cursor = 'grabbing'; };
        const touchMove = (event) => { if (isDragging) { const currentPosition = getPositionX(event); currentTranslate = prevTranslate + currentPosition - startPos; track.style.transform = `translateX(${currentTranslate}px)`; } };
        const touchEnd = () => { isDragging = false; carousel.style.cursor = 'grab'; const movedBy = currentTranslate - prevTranslate; if (movedBy < -50 && currentIndex < slides.length - 1) currentIndex++; if (movedBy > 50 && currentIndex > 0) currentIndex--; moveToSlide(currentIndex); prevTranslate = -currentIndex * slideWidth; track.style.transform = `translateX(${prevTranslate}px)`; };
        carousel.addEventListener('mousedown', touchStart);
        carousel.addEventListener('mousemove', touchMove);
        carousel.addEventListener('mouseup', touchEnd);
        carousel.addEventListener('mouseleave', touchEnd);
        carousel.addEventListener('touchstart', touchStart, { passive: true });
        carousel.addEventListener('touchmove', touchMove, { passive: true });
        carousel.addEventListener('touchend', touchEnd);
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