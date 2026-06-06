// =========================================
//  ILLYRIAN E-COMMERCE — script.js
// =========================================

// ---- Navbar scroll shadow ----
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  if (window.scrollY > 10) {
    navbar.classList.add('scrolled');
  } else {
    navbar.classList.remove('scrolled');
  }
});

// ---- Hamburger / Mobile Drawer ----
const hamburgerBtn = document.getElementById('hamburgerBtn');
const mobileDrawer = document.getElementById('mobileDrawer');
const drawerOverlay = document.getElementById('drawerOverlay');

hamburgerBtn.addEventListener('click', () => {
  const isOpen = mobileDrawer.classList.toggle('open');
  drawerOverlay.classList.toggle('show', isOpen);
  hamburgerBtn.classList.toggle('open', isOpen);
});

function closeDrawer() {
  mobileDrawer.classList.remove('open');
  drawerOverlay.classList.remove('show');
  hamburgerBtn.classList.remove('open');
}

// ---- Drag to scroll on product rows ----
document.querySelectorAll('.products-scroll').forEach(slider => {
  let isDown = false;
  let startX;
  let scrollLeft;

  slider.addEventListener('mousedown', (e) => {
    isDown = true;
    slider.classList.add('active');
    startX = e.pageX - slider.offsetLeft;
    scrollLeft = slider.scrollLeft;
  });
  slider.addEventListener('mouseleave', () => {
    isDown = false;
    slider.classList.remove('active');
  });
  slider.addEventListener('mouseup', () => {
    isDown = false;
    slider.classList.remove('active');
  });
  slider.addEventListener('mousemove', (e) => {
    if (!isDown) return;
    e.preventDefault();
    const x = e.pageX - slider.offsetLeft;
    const walk = (x - startX) * 1.5;
    slider.scrollLeft = scrollLeft - walk;
  });
});

// ---- Smooth scroll for anchor links ----
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});

// ---- Newsletter form ----
const nlForm = document.querySelector('.nl-form');
if (nlForm) {
  nlForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const input = nlForm.querySelector('input');
    const btn = nlForm.querySelector('button');
    if (input.value.trim()) {
      btn.textContent = 'SUBSCRIBED ✓';
      btn.style.background = '#e8b84b';
      input.value = '';
      setTimeout(() => {
        btn.textContent = 'SUBSCRIBE';
        btn.style.background = '';
      }, 3000);
    }
  });
  nlForm.querySelector('button').addEventListener('click', () => {
    nlForm.dispatchEvent(new Event('submit'));
  });
}

// ---- Bag counter (demo) ----
let bagCount = 0;
const bagCountEl = document.querySelector('.bag-count');
document.querySelectorAll('.product-card').forEach(card => {
  card.addEventListener('click', () => {
    bagCount++;
    if (bagCountEl) bagCountEl.textContent = bagCount;
  });
});
