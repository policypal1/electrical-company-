
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
const servicesSearchInput = document.querySelector('#services-search-input');
const servicesSearchClear = document.querySelector('.services-search-clear');
const servicesSearchMeta = document.querySelector('#services-search-meta');
const servicesEmpty = document.querySelector('#services-empty');

const normalizeText = (value) => value
  .toLowerCase()
  .normalize('NFD')
  .replace(/[̀-ͯ]/g, '')
  .replace(/[^a-z0-9\s]/g, ' ')
  .replace(/\s+/g, ' ')
  .trim();

const tokenize = (value) => normalizeText(value).split(' ').filter(Boolean);

const levenshtein = (a, b) => {
  if (a === b) return 0;
  if (!a.length) return b.length;
  if (!b.length) return a.length;

  const previous = Array.from({ length: b.length + 1 }, (_, index) => index);

  for (let i = 0; i < a.length; i += 1) {
    let current = [i + 1];
    for (let j = 0; j < b.length; j += 1) {
      const insertCost = current[j] + 1;
      const deleteCost = previous[j + 1] + 1;
      const replaceCost = previous[j] + (a[i] === b[j] ? 0 : 1);
      current.push(Math.min(insertCost, deleteCost, replaceCost));
    }
    for (let j = 0; j < current.length; j += 1) previous[j] = current[j];
  }

  return previous[b.length];
};

const fuzzyWordMatch = (queryWord, candidateWord) => {
  if (!queryWord || !candidateWord) return false;
  if (candidateWord.includes(queryWord) || queryWord.includes(candidateWord)) return true;
  const maxDistance = queryWord.length <= 4 ? 1 : queryWord.length <= 7 ? 2 : 3;
  return levenshtein(queryWord, candidateWord) <= maxDistance;
};

const synonymGroups = [
  ['panel', 'pannel', 'panle', 'breaker box', 'service panel', 'main panel', 'electrical panel', 'subpanel', 'service upgrade'],
  ['ev', 'ev charger', 'car charger', 'electric vehicle', 'tesla charger', 'level 2 charger', 'wall connector'],
  ['lighting', 'lights', 'light fixture', 'light fixtures', 'recessed lighting', 'can lights', 'security lighting'],
  ['outlet', 'outlets', 'switch', 'switches', 'plug', 'plugs', 'receptacle', 'receptacles', 'gfci'],
  ['repair', 'repairs', 'troubleshooting', 'dead outlet', 'flickering lights', 'breaker keeps tripping'],
  ['hot tub', 'spa', 'swim spa', 'jacuzzi'],
  ['rv', 'rv outlet', 'rv plug', 'motorhome', 'motor home', 'camper', 'travel trailer', 'shore power', '30 amp', '50 amp'],
  ['dedicated circuit', 'new circuit', '240v', '240 volt', 'appliance circuit'],
  ['remodel', 'renovation', 'addition', 'rewire', 'rewiring'],
  ['smoke detector', 'co detector', 'carbon monoxide', 'alarm'],
  ['ceiling fan', 'fan', 'fans'],
  ['surge', 'surge protection', 'surge protector'],
  ['garage', 'shop', 'workshop', 'shed'],
  ['outdoor', 'exterior', 'backyard', 'patio', 'weatherproof'],
  ['electrical updates', 'general electrical', 'home electrical', 'modernization', 'upgrades']
].map((group) => group.map(normalizeText));

const expandQuery = (query) => {
  const normalized = normalizeText(query);
  const tokens = tokenize(query);
  const expanded = new Set([normalized, ...tokens]);

  synonymGroups.forEach((group) => {
    const groupHit = group.some((term) => normalized.includes(term) || term.includes(normalized) || tokens.some((token) => fuzzyWordMatch(token, term)));
    if (groupHit) group.forEach((term) => expanded.add(term));
  });

  return Array.from(expanded).filter(Boolean);
};

if (servicesGrid && servicesToggle) {
  const toggleLabel = servicesToggle.querySelector('span');

  const allServices = Array.from(servicesGrid.querySelectorAll('.service-card')).map((card) => {
    const title = card.querySelector('h3')?.textContent?.trim() || '';
    const description = card.querySelector('p')?.textContent?.trim() || '';
    const aliases = (card.dataset.aliases || '').split('|').map((entry) => entry.trim()).filter(Boolean);
    const searchText = normalizeText([title, description, ...aliases].join(' '));
    const tokenSet = Array.from(new Set(tokenize([title, description, ...aliases].join(' '))));
    return {
      card,
      title,
      searchText,
      titleText: normalizeText(title),
      tokens: tokenSet
    };
  });

  const totalServices = allServices.length;

  const updateServiceLabel = () => {
    const expanded = servicesGrid.classList.contains('is-expanded');
    if (!toggleLabel) return;
    if (expanded) {
      toggleLabel.textContent = 'Show Fewer Services';
    } else {
      toggleLabel.textContent = window.innerWidth <= 620
        ? 'View All 16 Services'
        : 'View All Residential Services';
    }
  };

  const scoreService = (query, service) => {
    const normalizedQuery = normalizeText(query);
    if (!normalizedQuery) return 1;

    let score = 0;
    const expandedQueries = expandQuery(query);
    const queryTokens = Array.from(new Set(expandedQueries.flatMap((entry) => tokenize(entry))));

    if (service.titleText.includes(normalizedQuery)) score += 160;
    if (service.searchText.includes(normalizedQuery)) score += 110;

    expandedQueries.forEach((term) => {
      if (service.searchText.includes(term)) {
        score += term.includes(' ') ? 45 : 26;
      }
    });

    let matchedTokens = 0;
    queryTokens.forEach((queryToken) => {
      const hasMatch = service.tokens.some((candidateToken) => fuzzyWordMatch(queryToken, candidateToken));
      if (hasMatch) matchedTokens += 1;
    });

    if (matchedTokens > 0) score += matchedTokens * 22;
    if (queryTokens.length > 0 && matchedTokens === queryTokens.length) score += 54;

    return score;
  };

  const applyServiceSearch = () => {
    const query = servicesSearchInput ? servicesSearchInput.value : '';
    const normalizedQuery = normalizeText(query);
    const isSearching = normalizedQuery.length > 0;

    servicesGrid.classList.toggle('is-searching', isSearching);
    servicesToggle.classList.toggle('is-search-active', isSearching);

    if (servicesSearchClear) {
      servicesSearchClear.hidden = !isSearching;
    }

    const ranked = allServices
      .map((service) => ({ ...service, score: scoreService(normalizedQuery, service) }))
      .sort((a, b) => b.score - a.score);

    let visibleCount = 0;

    ranked.forEach((service, index) => {
      const show = !isSearching || service.score > 0;
      service.card.classList.toggle('is-hidden', !show);
      service.card.style.order = String(index + 1);
      if (show) visibleCount += 1;
    });

    if (servicesSearchMeta) {
      servicesSearchMeta.textContent = isSearching
        ? `${visibleCount} ${visibleCount === 1 ? 'service' : 'services'} found for “${query.trim()}”.`
        : `Showing all ${totalServices} services.`;
    }

    if (servicesEmpty) {
      servicesEmpty.hidden = !(isSearching && visibleCount === 0);
    }
  };

  servicesToggle.addEventListener('click', () => {
    const animateDesktopGrid = window.innerWidth >= 761 && !servicesGrid.classList.contains('is-searching');

    if (!animateDesktopGrid) {
      const expanded = servicesGrid.classList.toggle('is-expanded');
      servicesToggle.setAttribute('aria-expanded', String(expanded));
      updateServiceLabel();
      return;
    }

    const startHeight = servicesGrid.getBoundingClientRect().height;
    const willExpand = !servicesGrid.classList.contains('is-expanded');

    servicesGrid.style.height = 'auto';
    servicesGrid.classList.toggle('is-expanded', willExpand);
    const endHeight = servicesGrid.getBoundingClientRect().height;

    servicesGrid.style.height = `${startHeight}px`;
    servicesGrid.style.overflow = 'hidden';
    servicesGrid.style.transition = 'height 520ms cubic-bezier(.22,.78,.24,1)';
    servicesGrid.getBoundingClientRect();

    requestAnimationFrame(() => {
      servicesGrid.style.height = `${endHeight}px`;
    });

    const cleanup = (event) => {
      if (event.propertyName !== 'height') return;
      servicesGrid.style.height = '';
      servicesGrid.style.overflow = '';
      servicesGrid.style.transition = '';
      servicesGrid.removeEventListener('transitionend', cleanup);
    };

    servicesGrid.addEventListener('transitionend', cleanup);
    servicesToggle.setAttribute('aria-expanded', String(willExpand));
    updateServiceLabel();
  });

  if (servicesSearchInput) {
    servicesSearchInput.addEventListener('input', applyServiceSearch);
    servicesSearchInput.addEventListener('search', applyServiceSearch);
  }

  if (servicesSearchClear && servicesSearchInput) {
    servicesSearchClear.addEventListener('click', () => {
      servicesSearchInput.value = '';
      servicesSearchInput.focus();
      applyServiceSearch();
    });
  }

  window.addEventListener('resize', updateServiceLabel);
  updateServiceLabel();
  applyServiceSearch();
}


const footerYear = document.getElementById('footer-year');
if (footerYear) footerYear.textContent = String(new Date().getFullYear());


const faqItemsV13 = Array.from(document.querySelectorAll('.faq-item'));

const closeFaqItem = (item, animate = true) => {
  const button = item.querySelector('.faq-button');
  const panel = item.querySelector('.faq-panel');
  if (!button || !panel) return;

  button.setAttribute('aria-expanded', 'false');
  item.classList.remove('is-open');

  if (!animate) {
    panel.style.height = '0px';
    panel.style.opacity = '0';
    return;
  }

  if (panel.style.height === 'auto' || !panel.style.height) {
    panel.style.height = `${panel.scrollHeight}px`;
    panel.offsetHeight;
  }

  requestAnimationFrame(() => {
    panel.style.height = '0px';
    panel.style.opacity = '0';
  });
};

const openFaqItem = (item) => {
  const button = item.querySelector('.faq-button');
  const panel = item.querySelector('.faq-panel');
  if (!button || !panel) return;

  item.classList.add('is-open');
  button.setAttribute('aria-expanded', 'true');
  panel.style.opacity = '1';
  panel.style.height = `${panel.scrollHeight}px`;

  const onEnd = (event) => {
    if (event.propertyName !== 'height') return;
    if (item.classList.contains('is-open')) panel.style.height = 'auto';
    panel.removeEventListener('transitionend', onEnd);
  };
  panel.addEventListener('transitionend', onEnd);
};

faqItemsV13.forEach((item) => {
  closeFaqItem(item, false);
  const button = item.querySelector('.faq-button');
  if (!button) return;

  button.addEventListener('click', () => {
    const shouldOpen = !item.classList.contains('is-open');

    faqItemsV13.forEach((other) => {
      if (other !== item) closeFaqItem(other, true);
    });

    if (shouldOpen) {
      openFaqItem(item);
    } else {
      closeFaqItem(item, true);
    }
  });
});

/* Desktop review cycling. This reorders the existing real/placeholder review cards,
   so it will keep working when more review cards are added later. */
const reviewsGridV15 = document.querySelector('.reviews-grid');
const reviewsPrevV15 = document.querySelector('.reviews-cycle-prev');
const reviewsNextV15 = document.querySelector('.reviews-cycle-next');
let reviewsCyclingV15 = false;

const cycleReviewsV15 = (direction) => {
  if (!reviewsGridV15 || reviewsCyclingV15 || window.innerWidth <= 760) return;
  const cards = Array.from(reviewsGridV15.children);
  if (cards.length < 2) return;

  reviewsCyclingV15 = true;
  const className = direction === 'next' ? 'is-cycling-next' : 'is-cycling-prev';
  reviewsGridV15.classList.add(className);

  window.setTimeout(() => {
    if (direction === 'next') {
      reviewsGridV15.appendChild(reviewsGridV15.firstElementChild);
    } else {
      reviewsGridV15.insertBefore(reviewsGridV15.lastElementChild, reviewsGridV15.firstElementChild);
    }

    reviewsGridV15.classList.remove(className);
    window.setTimeout(() => {
      reviewsCyclingV15 = false;
    }, 220);
  }, 160);
};

if (reviewsPrevV15) reviewsPrevV15.addEventListener('click', () => cycleReviewsV15('prev'));
if (reviewsNextV15) reviewsNextV15.addEventListener('click', () => cycleReviewsV15('next'));
