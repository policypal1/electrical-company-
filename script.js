const menuToggle = document.querySelector('.menu-toggle');
const mobileMenu = document.querySelector('.mobile-menu');

if (menuToggle && mobileMenu) {
  const closeMenu = () => {
    menuToggle.classList.remove('is-open');
    mobileMenu.classList.remove('is-open');
    menuToggle.setAttribute('aria-expanded', 'false');
    menuToggle.setAttribute('aria-label', 'Open menu');
  };

  menuToggle.addEventListener('click', () => {
    const isOpen = menuToggle.classList.toggle('is-open');
    mobileMenu.classList.toggle('is-open', isOpen);
    menuToggle.setAttribute('aria-expanded', String(isOpen));
    menuToggle.setAttribute('aria-label', isOpen ? 'Close menu' : 'Open menu');
  });

  mobileMenu.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', closeMenu);
  });

  window.addEventListener('resize', () => {
    if (window.innerWidth > 1080) closeMenu();
  });
}

const heroVisual = document.querySelector('.hero-visual');
const mainProjectCard = document.querySelector('.project-card-main');

if (heroVisual && mainProjectCard) {
  const setMainFocus = (enabled) => {
    if (window.innerWidth <= 760) return;
    heroVisual.classList.toggle('main-focused', enabled);
    mainProjectCard.setAttribute('aria-pressed', String(enabled));
  };

  const toggleMainFocus = () => {
    if (window.innerWidth <= 760) return;
    setMainFocus(!heroVisual.classList.contains('main-focused'));
  };

  mainProjectCard.addEventListener('click', (event) => {
    event.stopPropagation();
    toggleMainFocus();
  });

  mainProjectCard.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      toggleMainFocus();
    }
  });

  document.addEventListener('click', (event) => {
    if (!heroVisual.contains(event.target)) setMainFocus(false);
  });

  window.addEventListener('resize', () => {
    if (window.innerWidth <= 760) {
      heroVisual.classList.remove('main-focused');
      mainProjectCard.setAttribute('aria-pressed', 'false');
    }
  });
}

const servicesGrid = document.querySelector('#services-grid');
const servicesToggle = document.querySelector('.services-toggle');

if (servicesGrid && servicesToggle) {
  const toggleLabel = servicesToggle.querySelector('span');

  servicesToggle.addEventListener('click', () => {
    const expanded = servicesGrid.classList.toggle('is-expanded');
    servicesToggle.setAttribute('aria-expanded', String(expanded));
    if (toggleLabel) {
      toggleLabel.textContent = expanded ? 'Show Fewer Services' : 'View All Residential Services';
    }
  });
}
