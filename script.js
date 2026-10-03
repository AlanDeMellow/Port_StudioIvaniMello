const box = document.querySelector('#lightbox'); const allGallery = document.querySelector('#all-gallery'); const track = document.querySelector('#portfolio-carousel'); const photos = [...track.querySelectorAll('.work')]; let last, current = 0;
function renderPhoto() { const photo = photos[current]; box.querySelector('img').src = photo.dataset.photo; box.querySelector('img').alt = photo.dataset.title + ' — trabalho de Ivani Mello'; box.querySelector('p').textContent = (current + 1) + ' / ' + photos.length + ' · ' + photo.dataset.title; }
function openPhoto(index, origin) { last = origin; current = index; renderPhoto(); box.showModal(); }
photos.forEach((button, i) => button.addEventListener('click', () => openPhoto(i, button)));
box.querySelector('.close').addEventListener('click', () => box.close()); box.addEventListener('close', () => last?.focus());
function changePhoto(delta) { current = (current + delta + photos.length) % photos.length; renderPhoto(); }
box.querySelector('.viewer-prev').addEventListener('click', () => changePhoto(-1)); box.querySelector('.viewer-next').addEventListener('click', () => changePhoto(1)); box.addEventListener('keydown', e => { if (e.key === 'ArrowLeft') { e.preventDefault(); changePhoto(-1); } if (e.key === 'ArrowRight') { e.preventDefault(); changePhoto(1); } });
[box, allGallery].forEach(dialog => dialog.addEventListener('click', e => { if (e.target === dialog) { const r = dialog.getBoundingClientRect(); if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) dialog.close(); } }));
const galleryButton = document.querySelector('.all-photos'); photos.forEach((photo, i) => { const button = photo.cloneNode(true); button.classList.remove('reveal', 'pending'); button.addEventListener('click', () => { allGallery.close(); openPhoto(i, galleryButton); }); allGallery.querySelector('.all-grid').append(button); }); galleryButton.addEventListener('click', () => allGallery.showModal()); allGallery.querySelector('.close').addEventListener('click', () => allGallery.close()); allGallery.addEventListener('close', () => galleryButton.focus());
const header = document.querySelector('.site-header'); const toggle = document.querySelector('.menu-toggle'); const nav = document.querySelector('#main-nav');
function closeMenu() { nav.classList.remove('open'); toggle.setAttribute('aria-expanded', 'false'); toggle.setAttribute('aria-label', 'Abrir menu'); }
toggle.addEventListener('click', () => { const open = toggle.getAttribute('aria-expanded') !== 'true'; toggle.setAttribute('aria-expanded', String(open)); toggle.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu'); nav.classList.toggle('open', open); });
nav.querySelectorAll('a').forEach(a => a.addEventListener('click', closeMenu)); document.addEventListener('keydown', e => { if (e.key === 'Escape' && nav.classList.contains('open')) { closeMenu(); toggle.focus(); } }); document.addEventListener('click', e => { if (!header.contains(e.target)) closeMenu(); }); window.addEventListener('resize', () => { if (window.innerWidth > 700) closeMenu(); });
function updateHeader() { header.classList.toggle('scrolled', window.scrollY > 40); } window.addEventListener('scroll', updateHeader, { passive: true }); updateHeader();
const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
if ('IntersectionObserver' in window) {
    const sections = document.querySelectorAll('main section[id]'); const links = [...nav.querySelectorAll('a')]; const activeObserver = new IntersectionObserver(entries => { entries.forEach(entry => { if (entry.isIntersecting) { links.forEach(a => { const active = a.hash === '#' + entry.target.id; a.classList.toggle('active', active); if (active) a.setAttribute('aria-current', 'location'); else a.removeAttribute('aria-current'); }); } }); }, { rootMargin: '-15% 0px -60% 0px' }); sections.forEach(s => activeObserver.observe(s));
    if (!reduced.matches) { const observer = new IntersectionObserver(entries => { entries.forEach(entry => { if (entry.isIntersecting) { entry.target.classList.remove('pending'); observer.unobserve(entry.target); } }); }, { threshold: .08 }); document.querySelectorAll('.section-heading,.service,.about-photo,.about-copy,.contact>div').forEach((el, i) => { el.classList.add('reveal', 'pending'); el.style.setProperty('--delay', ((el.matches('.work,.service') ? i % 3 : 0) * 65) + 'ms'); observer.observe(el); }); document.documentElement.classList.add('motion-ready'); reduced.addEventListener('change', e => { if (e.matches) document.querySelectorAll('.pending').forEach(el => el.classList.remove('pending')); }); }
}

const carouselReduced = window.matchMedia('(prefers-reduced-motion: reduce)');
const pause = document.querySelector('.carousel-pause'); let paused = carouselReduced.matches, dragging = false, position = track.scrollLeft, previousTime = 0, loopWidth = 0;
const copies = photos.map((photo, index) => { const copy = photo.cloneNode(true); copy.setAttribute('aria-hidden', 'true'); copy.tabIndex = -1; copy.addEventListener('click', () => openPhoto(index, photos[index])); track.append(copy); return copy; });
function measureLoop() { loopWidth = copies[0].offsetLeft - photos[0].offsetLeft; position = track.scrollLeft; }
measureLoop(); if ('ResizeObserver' in window) new ResizeObserver(measureLoop).observe(track); else window.addEventListener('resize', measureLoop);
function syncPause() { pause.textContent = paused ? 'Retomar carrossel' : 'Pausar carrossel'; pause.setAttribute('aria-pressed', String(paused)); }
syncPause(); pause.addEventListener('click', () => { paused = !paused; syncPause(); }); carouselReduced.addEventListener('change', e => { paused = e.matches; syncPause(); });
function advance(delta) { const step = photos[0].getBoundingClientRect().width + parseFloat(getComputedStyle(track).columnGap || '0'); position = loopWidth > 0 ? ((track.scrollLeft + delta * step) % loopWidth + loopWidth) % loopWidth : 0; track.scrollLeft = position; }
document.querySelector('.carousel-prev').addEventListener('click', () => advance(-1)); document.querySelector('.carousel-next').addEventListener('click', () => advance(1));
track.addEventListener('pointerdown', () => dragging = true); window.addEventListener('pointerup', () => { dragging = false; position = track.scrollLeft; }); window.addEventListener('pointercancel', () => { dragging = false; position = track.scrollLeft; });
track.addEventListener('wheel', () => { position = track.scrollLeft; }, { passive: true });
function animateCarousel(time) {
    const elapsed = previousTime ? Math.min(time - previousTime, 50) : 0; previousTime = time;
    if (!paused && !dragging && !document.hidden && !box.open && !allGallery.open && loopWidth > 0) {
        // Use a floating-point position so rounding of scrollLeft never stalls the motion.
        if (Math.abs(track.scrollLeft - position) > 2) position = track.scrollLeft;
        position = (position + elapsed * .032) % loopWidth; track.scrollLeft = position;
    }
    requestAnimationFrame(animateCarousel);
}
requestAnimationFrame(animateCarousel);
