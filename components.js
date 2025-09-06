/**
 * ==================================================================================
 * INITIALISATION DE TOUTE LA LOGIQUE INTERACTIVE DU SITE
 * Cette fonction est le "cerveau" du site. Elle est appelée seulement APRÈS
 * que tous les composants (navbar, footer) ont été chargés dans la page.
 * ==================================================================================
 */
function initializeSiteLogic() {

    // --- NAVBAR: EFFET AU DÉFILEMENT & MENU MOBILE ---
    const navbar = document.querySelector('.navbar');
    if (navbar) {
        // Effet d'opacité au scroll
        window.addEventListener('scroll', () => {
            if (window.scrollY > 50) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }
        });

        // Logique du menu hamburger sur mobile
        const hamburger = navbar.querySelector('.nav-hamburger');
        const navMenu = navbar.querySelector('.nav-menu');
        const navLinks = navbar.querySelectorAll('.nav-link, .nav-btn, .social-link');

        hamburger.addEventListener('click', () => {
            navMenu.classList.toggle('active');
            hamburger.classList.toggle('hamburger-toggle');
        });

        // Ferme le menu mobile quand on clique sur un lien
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

        // Vos valeurs de vitesse de déplacement
        const titleMoveFactor = -1;
        const backgroundMoveFactor = 4;
        const floorMoveFactor = 0.5;
        const foregroundMoveFactor = 2;

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

        heroSection.addEventListener('mousemove', (e) => {
            if (window.innerWidth < 768) return;
            const xPos = (e.clientX - window.innerWidth / 2) / window.innerWidth;
            const yPos = (e.clientY - window.innerHeight / 2) / window.innerHeight;
            handleParallax(xPos * 50, yPos * 50);
        });

        function requestDeviceOrientation() {
            if (typeof DeviceOrientationEvent.requestPermission === 'function') {
                DeviceOrientationEvent.requestPermission()
                    .then(permissionState => { if (permissionState === 'granted') { window.addEventListener('deviceorientation', handleOrientation); } })
                    .catch(console.error);
            } else { window.addEventListener('deviceorientation', handleOrientation); }
        }

        if (typeof DeviceOrientationEvent.requestPermission === 'function' && window.innerWidth <= 768) {
            const p = document.createElement('p');
            p.innerHTML = 'Cliquez ici pour activer l\'effet parallax';
            p.style.cssText = 'position:absolute; bottom:20px; z-index:10; color:#555; cursor:pointer; font-size:12px;';
            heroSection.appendChild(p);
            p.addEventListener('click', () => { requestDeviceOrientation(); p.style.display = 'none'; }, { once: true });
        } else {
            window.addEventListener('deviceorientation', handleOrientation);
        }

        function handleOrientation(event) {
            if (window.innerWidth > 768) return;
            const x = event.gamma;
            const y = event.beta - 45;
            handleParallax(x, y);
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
 * Ce code s'exécute dès que la page est prête. Il charge la navbar et le footer,
 * puis il appelle initializeSiteLogic() pour activer toutes les animations.
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