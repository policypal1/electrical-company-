// ===== JV Electric client updates: hero cleanup, mobile-only recent-work carousel, footer socials =====
(() => {
  const MOBILE_MAX = 760;

  const desktopRecentWorkImages = [
    {
      src: 'jv-remodel-panel-roughin-new.webp',
      alt: 'Residential electrical panel rough-in with organized branch-circuit wiring during construction',
      objectPosition: 'center 54%'
    },
    {
      src: 'jv-panel-upgrade-new.webp',
      alt: 'Residential electrical panel installation with color-coded branch-circuit wiring',
      objectPosition: 'center 57%'
    },
    {
      src: 'jv-recent-work-panel-new.webp',
      alt: 'Finished residential electrical panel installation mounted in a framed wall',
      objectPosition: 'center 63%'
    },
    {
      src: 'jv-service-upgrade-open.webp',
      alt: 'Open residential service upgrade with organized electrical wiring',
      objectPosition: 'center 50%'
    }
  ];

  const mobileRecentWorkImages = [
    {
      src: 'jv-recent-work-exterior-sconce.webp',
      alt: 'Exterior wall sconce installed beside a residential garage door'
    },
    {
      src: 'jv-recent-work-pendants.webp',
      alt: 'Black pendant lighting installed in a bright residential living space'
    },
    {
      src: 'jv-recent-work-kitchen-lighting.webp',
      alt: 'Flush-mount ceiling lights installed above a residential kitchen sink'
    },
    {
      src: 'jv-recent-work-recessed-install.webp',
      alt: 'JV Electric electrician installing recessed lighting during a residential remodel'
    },
    {
      src: 'jv-recent-work-heat-pump-electrical.webp',
      alt: 'Residential heat-pump electrical disconnect, conduit, and outdoor equipment wiring'
    },
    {
      src: 'jv-recent-work-chandelier.webp',
      alt: 'Large black ring chandelier installed over a covered residential patio'
    },
    {
      src: 'jv-recent-work-underground-service.webp',
      alt: 'JV Electric crew completing underground residential electrical trenching and conduit work'
    },
    {
      src: 'jv-recent-work-kitchen-pendants.webp',
      alt: 'Kitchen lighting project with woven pendant lights and recessed ceiling lights'
    },
    {
      src: 'jv-recent-work-panel.webp',
      alt: 'Finished 200 amp residential electrical panel with labeled circuits'
    },
    {
      src: 'jv-recent-work-panel-roughin-2.webp',
      alt: 'Residential electrical panel rough-in with organized branch-circuit wiring'
    },
    {
      src: 'jv-recent-work-service-equipment.webp',
      alt: 'Residential electrical service equipment and disconnect installation'
    },
    {
      src: 'jv-recent-work-service-pedestal.webp',
      alt: 'Outdoor residential electrical service pedestal installation'
    },
    {
      src: 'jv-recent-work-goodman-heat-pump.webp',
      alt: 'Goodman heat-pump electrical installation with exterior disconnect and conduit'
    },
    {
      src: 'jv-recent-work-daikin-heat-pump-2.webp',
      alt: 'Daikin heat-pump electrical installation with exterior disconnect and conduit'
    }
  ];

  const activeRecentWorkImages = () =>
    window.innerWidth <= MOBILE_MAX ? mobileRecentWorkImages : desktopRecentWorkImages;

  const injectStyles = () => {
    if (document.getElementById('jv-client-update-styles')) return;

    const style = document.createElement('style');
    style.id = 'jv-client-update-styles';
    style.textContent = `
      /* Client request: keep the back hero photo and remove the two photos layered in front. */
      .hero-visual .project-card-small,
      .hero-visual .project-card-third {
        display: none !important;
      }

      /* Extra recent-work photos are mobile-only; desktop keeps the original four-photo gallery. */
      .work-card-mobile-extra,
      .work-carousel-controls {
        display: none !important;
      }

      /* Small social row only. Do not expand/rebuild the footer. */
      .footer-social-links {
        display: flex !important;
        align-items: center !important;
        gap: 7px !important;
        margin-top: 7px !important;
        width: max-content !important;
      }

      .footer-social-link {
        width: 29px !important;
        height: 29px !important;
        min-width: 29px !important;
        min-height: 29px !important;
        margin: 0 !important;
        padding: 0 !important;
        border: 1px solid rgba(255,255,255,.17) !important;
        border-radius: 50% !important;
        background: rgba(255,255,255,.045) !important;
        color: #fff !important;
        display: inline-grid !important;
        place-items: center !important;
        line-height: 1 !important;
        text-decoration: none !important;
        transition: background-color 160ms ease, border-color 160ms ease, transform 160ms ease !important;
      }

      .footer-social-link:hover,
      .footer-social-link:focus-visible {
        background: rgba(255,255,255,.11) !important;
        border-color: rgba(255,255,255,.34) !important;
        transform: translateY(-1px) !important;
      }

      .footer-social-link svg {
        width: 14px !important;
        height: 14px !important;
        display: block !important;
        fill: currentColor !important;
      }

      @media (max-width: ${MOBILE_MAX}px) {
        /* Mobile hero: keep the desktop tilt, but make the single phone photo completely straight/flat.
           The shorter visual container removes the empty space left behind by the two removed cards,
           which pulls Customer Reviews closer to the hero image without changing desktop. */
        .hero-inner {
          padding-bottom: 18px !important;
        }

        .hero-visual {
          height: 330px !important;
          min-height: 330px !important;
          margin-top: 4px !important;
          perspective: none !important;
          transform-style: flat !important;
        }

        .hero-visual .project-card-main,
        .hero-visual .project-card-main:hover,
        .hero-visual.main-focused .project-card-main {
          top: 0 !important;
          height: 94% !important;
          transform: translateX(-50%) !important;
          filter: none !important;
        }

        /* One recent-work image at a time, swipeable, matching the site's other mobile carousels. */
        .work-gallery {
          display: flex !important;
          grid-template-columns: none !important;
          grid-template-rows: none !important;
          gap: 12px !important;
          width: 100% !important;
          overflow-x: auto !important;
          overflow-y: hidden !important;
          scroll-snap-type: x mandatory !important;
          scroll-behavior: smooth !important;
          -webkit-overflow-scrolling: touch !important;
          scrollbar-width: none !important;
          overscroll-behavior-x: contain !important;
        }

        .work-gallery::-webkit-scrollbar {
          display: none !important;
        }

        .work-gallery .work-card,
        .work-gallery .work-card-featured,
        .work-gallery .work-card-top,
        .work-gallery .work-card-bottom,
        .work-gallery .work-card-wide,
        .work-gallery .work-card-mobile-extra {
          display: block !important;
          flex: 0 0 100% !important;
          width: 100% !important;
          min-width: 100% !important;
          max-width: 100% !important;
          height: auto !important;
          min-height: 0 !important;
          aspect-ratio: 4 / 5 !important;
          grid-column: auto !important;
          grid-row: auto !important;
          scroll-snap-align: center !important;
          scroll-snap-stop: always !important;
          transform: none !important;
        }

        .work-gallery .work-placeholder,
        .work-gallery .work-placeholder.has-photo {
          width: 100% !important;
          height: 100% !important;
          min-height: 0 !important;
        }

        .work-gallery .work-placeholder img {
          width: 100% !important;
          height: 100% !important;
          object-fit: cover !important;
          object-position: center center !important;
        }

        .work-carousel-controls {
          display: grid !important;
          grid-template-columns: 40px minmax(0, auto) 40px !important;
          justify-content: center !important;
          align-items: center !important;
          gap: 9px !important;
          margin-top: 14px !important;
        }

        .work-carousel-button {
          width: 40px !important;
          height: 40px !important;
          min-width: 40px !important;
          padding: 0 !important;
          border: 1px solid rgba(255,255,255,.18) !important;
          border-radius: 50% !important;
          background: rgba(255,255,255,.055) !important;
          color: #fff !important;
          display: grid !important;
          place-items: center !important;
          cursor: pointer !important;
        }

        .work-carousel-button:active {
          transform: scale(.96) !important;
        }

        .work-carousel-button svg {
          width: 18px !important;
          height: 18px !important;
          fill: none !important;
          stroke: currentColor !important;
          stroke-width: 2 !important;
          stroke-linecap: round !important;
          stroke-linejoin: round !important;
        }

        .work-carousel-dots {
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          gap: 6px !important;
          min-width: 96px !important;
        }

        .work-carousel-dot {
          width: 7px !important;
          height: 7px !important;
          padding: 0 !important;
          border: 0 !important;
          border-radius: 999px !important;
          background: rgba(255,255,255,.32) !important;
          cursor: pointer !important;
          transition: transform 140ms ease, background-color 140ms ease !important;
        }

        .work-carousel-dot.is-active {
          background: var(--brand-gold, #f5c518) !important;
          transform: scale(1.28) !important;
        }

        .footer-social-links {
          margin-top: 6px !important;
        }

        .footer-social-link {
          width: 27px !important;
          height: 27px !important;
          min-width: 27px !important;
          min-height: 27px !important;
        }
      }

      @media (max-width: 420px) {
        .hero-inner {
          padding-bottom: 16px !important;
        }

        .hero-visual {
          height: 285px !important;
          min-height: 285px !important;
        }

        .hero-visual .project-card-main,
        .hero-visual .project-card-main:hover,
        .hero-visual.main-focused .project-card-main {
          height: 94% !important;
          transform: translateX(-50%) !important;
        }
      }
    `;

    document.head.appendChild(style);
  };

  const removeFrontHeroPhotos = () => {
    document
      .querySelectorAll('.hero-visual .project-card-small, .hero-visual .project-card-third')
      .forEach((card) => card.remove());
  };

  const recentCardClass = (index) => {
    if (index === 0) return 'work-card work-card-featured';
    if (index === 1) return 'work-card work-card-top';
    if (index === 2) return 'work-card work-card-bottom';
    if (index === 3) return 'work-card work-card-wide';
    return 'work-card work-card-mobile-extra';
  };

  const recentCardMarkup = ({ src, alt, objectPosition = 'center center' }, index) => `
    <figure class="${recentCardClass(index)}" data-jv-recent-index="${index}">
      <div class="work-placeholder has-photo">
        <img src="${src}" alt="${alt}" loading="lazy" style="object-position: ${objectPosition};" />
      </div>
    </figure>
  `;

  const buildRecentWork = () => {
    const gallery = document.querySelector('.work-gallery');
    if (!gallery) return null;

    gallery.innerHTML = activeRecentWorkImages().map(recentCardMarkup).join('');
    gallery.setAttribute('aria-label', 'JV Electric recent project gallery');
    gallery.dataset.jvClientGallery = 'true';

    let controls = gallery.parentElement?.querySelector('.work-carousel-controls');
    if (!controls) {
      controls = document.createElement('div');
      controls.className = 'work-carousel-controls';
      controls.setAttribute('aria-label', 'Recent work gallery navigation');
      controls.innerHTML = `
        <button class="work-carousel-button work-carousel-prev" type="button" aria-label="Previous recent work photo">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 18l-6-6 6-6" /></svg>
        </button>
        <div class="work-carousel-dots" aria-label="Recent work slides"></div>
        <button class="work-carousel-button work-carousel-next" type="button" aria-label="Next recent work photo">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 6l6 6-6 6" /></svg>
        </button>
      `;
      gallery.insertAdjacentElement('afterend', controls);
    }

    return gallery;
  };

  const enforceRecentWorkImages = () => {
    const gallery = document.querySelector('.work-gallery');
    if (!gallery) return;

    const dataSet = activeRecentWorkImages();
    const cards = Array.from(gallery.querySelectorAll('.work-card'));
    if (cards.length !== dataSet.length) {
      buildRecentWork();
      return enforceRecentWorkImages();
    }

    cards.forEach((card, index) => {
      const image = card.querySelector('img');
      const data = dataSet[index];
      if (!image || !data) return;
      image.src = data.src;
      image.alt = data.alt;
      image.removeAttribute('referrerpolicy');
      image.style.objectPosition = data.objectPosition || 'center center';
    });
  };

  const initRecentWorkCarousel = () => {
    const gallery = document.querySelector('.work-gallery');
    const controls = gallery?.parentElement?.querySelector('.work-carousel-controls');
    if (!gallery || !controls || controls.dataset.jvCarouselReady === 'true') return;

    controls.dataset.jvCarouselReady = 'true';

    const prev = controls.querySelector('.work-carousel-prev');
    const next = controls.querySelector('.work-carousel-next');
    const dotsWrap = controls.querySelector('.work-carousel-dots');
    const cards = () => Array.from(gallery.querySelectorAll('.work-card'));

    let currentIndex = 0;
    let scrollTimer = 0;
    let dots = [];

    const centeredLeft = (card) => {
      const max = Math.max(0, gallery.scrollWidth - gallery.clientWidth);
      const target = card.offsetLeft - ((gallery.clientWidth - card.offsetWidth) / 2);
      return Math.max(0, Math.min(max, target));
    };

    const updateDots = () => {
      dots.forEach((dot, index) => {
        const active = index === currentIndex;
        dot.classList.toggle('is-active', active);
        dot.setAttribute('aria-current', active ? 'true' : 'false');
      });
    };

    const goTo = (targetIndex, behavior = 'smooth') => {
      const list = cards();
      if (!list.length) return;
      currentIndex = ((targetIndex % list.length) + list.length) % list.length;
      gallery.scrollTo({ left: centeredLeft(list[currentIndex]), behavior });
      updateDots();
    };

    const buildDots = () => {
      if (!dotsWrap) return;
      dotsWrap.innerHTML = '';
      dots = cards().map((_, index) => {
        const dot = document.createElement('button');
        dot.type = 'button';
        dot.className = 'work-carousel-dot';
        dot.setAttribute('aria-label', `Go to recent work photo ${index + 1}`);
        dot.addEventListener('click', () => goTo(index));
        dotsWrap.appendChild(dot);
        return dot;
      });
      updateDots();
    };

    const settle = () => {
      if (window.innerWidth > MOBILE_MAX) return;
      const list = cards();
      if (!list.length) return;

      const center = gallery.scrollLeft + (gallery.clientWidth / 2);
      let nearest = 0;
      let nearestDistance = Infinity;

      list.forEach((card, index) => {
        const cardCenter = card.offsetLeft + (card.offsetWidth / 2);
        const distance = Math.abs(cardCenter - center);
        if (distance < nearestDistance) {
          nearest = index;
          nearestDistance = distance;
        }
      });

      currentIndex = nearest;
      updateDots();
    };

    prev?.addEventListener('click', () => {
      if (window.innerWidth <= MOBILE_MAX) goTo(currentIndex - 1);
    });

    next?.addEventListener('click', () => {
      if (window.innerWidth <= MOBILE_MAX) goTo(currentIndex + 1);
    });

    gallery.addEventListener('scroll', () => {
      if (window.innerWidth > MOBILE_MAX) return;
      clearTimeout(scrollTimer);
      scrollTimer = window.setTimeout(settle, 70);
    }, { passive: true });

    let lastMobileMode = null;

    const syncMode = () => {
      const isMobile = window.innerWidth <= MOBILE_MAX;

      if (lastMobileMode !== isMobile) {
        lastMobileMode = isMobile;
        buildRecentWork();
        currentIndex = 0;
      }

      if (isMobile) {
        buildDots();
        requestAnimationFrame(() => goTo(currentIndex, 'auto'));
      } else {
        gallery.scrollLeft = 0;
        if (dotsWrap) dotsWrap.innerHTML = '';
        dots = [];
      }
    };

    window.addEventListener('resize', syncMode);
    syncMode();
  };

  const socialIcon = (network) => {
    if (network === 'TikTok') {
      return '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M14.4 3c.3 2.1 1.5 3.5 3.7 3.9v3.2a8.3 8.3 0 0 1-3.6-1.1v6.1a6 6 0 1 1-5.2-5.9v3.2a2.9 2.9 0 1 0 2 2.7V3h3.1Z"/></svg>';
    }

    if (network === 'Instagram') {
      return '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7.2 2.8h9.6A4.4 4.4 0 0 1 21.2 7v10a4.4 4.4 0 0 1-4.4 4.2H7.2A4.4 4.4 0 0 1 2.8 17V7a4.4 4.4 0 0 1 4.4-4.2Zm0 2A2.4 2.4 0 0 0 4.8 7v10a2.4 2.4 0 0 0 2.4 2.2h9.6a2.4 2.4 0 0 0 2.4-2.2V7a2.4 2.4 0 0 0-2.4-2.2H7.2ZM12 7a5 5 0 1 1 0 10 5 5 0 0 1 0-10Zm0 2a3 3 0 1 0 0 6 3 3 0 0 0 0-6Zm5.3-3.2a1.2 1.2 0 1 1 0 2.4 1.2 1.2 0 0 1 0-2.4Z"/></svg>';
    }

    return '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M13.7 21v-8h2.7l.4-3h-3.1V8.1c0-.9.3-1.5 1.6-1.5H17V4a22 22 0 0 0-2.4-.1c-2.4 0-4 1.4-4 4.1v2H8v3h2.6v8h3.1Z"/></svg>';
  };

  const addFooterSocialLinks = () => {
    if (document.querySelector('.footer-social-links')) return;

    const contactColumn = Array.from(document.querySelectorAll('.site-footer .footer-column'))
      .find((column) => column.querySelector('a[href^="tel:"]') || column.querySelector('a[href^="mailto:"]'));

    if (!contactColumn) return;

    const socials = [
      ['TikTok', 'https://www.tiktok.com/@jvelectriic?_r=1&_t=ZP-99PKnCBc8BL'],
      ['Instagram', 'https://www.instagram.com/jvelectriicllc?utm_source=qr'],
      ['Facebook', 'https://www.facebook.com/profile.php?id=61584432115757']
    ];

    const wrap = document.createElement('div');
    wrap.className = 'footer-social-links';
    wrap.setAttribute('aria-label', 'JV Electric social media');

    socials.forEach(([network, url]) => {
      const link = document.createElement('a');
      link.className = 'footer-social-link';
      link.href = url;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      link.setAttribute('aria-label', `JV Electric on ${network}`);
      link.title = network;
      link.innerHTML = socialIcon(network);
      wrap.appendChild(link);
    });

    contactColumn.appendChild(wrap);
  };

  const setup = () => {
    injectStyles();
    removeFrontHeroPhotos();
    buildRecentWork();
    enforceRecentWorkImages();
    initRecentWorkCarousel();
    addFooterSocialLinks();
  };

  const reassert = () => {
    injectStyles();
    removeFrontHeroPhotos();
    enforceRecentWorkImages();
    addFooterSocialLinks();
  };

  // Run now because script.js is loaded at the bottom of index.html.
  setup();

  // The existing script has a few DOMContentLoaded image swaps. Reassert after them so the new photos win.
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', reassert, { once: true });
  } else {
    reassert();
  }

  window.addEventListener('load', reassert, { once: true });
})();
