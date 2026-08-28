
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
    heroVisual.classList.toggle('main-focused', enabled);
    mainProjectCard.setAttribute('aria-pressed', String(enabled));
  };

  const toggleMainFocus = () => {
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
    if (window.innerWidth > 760) {
      mainProjectCard.setAttribute('aria-pressed', String(heroVisual.classList.contains('main-focused')));
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
  const maxDistance = queryWord.length <= 6 ? 1 : queryWord.length <= 10 ? 2 : 3;
  return levenshtein(queryWord, candidateWord) <= maxDistance;
};

const synonymGroups = [
  ['panel','panels','panel upgrade','panel replacement','breaker panel','breaker box','fuse box','electrical box','main panel','main breaker','service panel','service upgrade','subpanel','200 amp','100 amp'],
  ['ev','ev charger','ev charging','electric vehicle','electric car','car charger','home charger','tesla','tesla charger','wall connector','level 2 charger','charging station','nema 14 50','14 50 outlet'],
  ['lighting','lights','light','light fixture','recessed lights','can lights','ceiling light','security lights','outdoor lights','porch light','motion light'],
  ['outlet','outlets','wall outlet','socket','sockets','switch','switches','light switch','plug','plugs','receptacle','gfci','gfi','usb outlet','add outlet','replace outlet'],
  ['repair','repairs','electrical repair','troubleshooting','diagnose','dead outlet','outlet not working','flickering lights','breaker keeps tripping','no power','lost power','power issue','electrical problem','short circuit'],
  ['hot tub','hot tub hookup','hot tub wiring','spa','spa hookup','spa wiring','swim spa','jacuzzi','hot tub power','50 amp spa'],
  ['rv','rv outlet','rv plug','rv hookup','rv power','motorhome','motor home','motor','camper','travel trailer','trailer hookup','shore power','30 amp rv','50 amp rv','rv receptacle'],
  ['dedicated circuit','new circuit','add circuit','circuit install','220','220v','220 volt','240v','240 volt','240 outlet','220 outlet','dedicated power','appliance circuit','mini split circuit','ac circuit'],
  ['remodel','remodel wiring','renovation','addition','rewire','rewiring','house rewire','home rewire','whole house wiring','house wiring','home wiring','residential wiring','wiring','wire','new wiring','kitchen wiring','bathroom wiring'],
  ['appliance','appliance circuit','range','stove','stove outlet','oven','dryer','dryer circuit','dryer outlet','dryer plug','dishwasher','microwave','laundry circuit','kitchen circuit'],
  ['smoke detector','smoke alarm','carbon monoxide','co detector','carbon monoxide detector','hardwired smoke detector','alarm','alarms'],
  ['ceiling fan','ceiling fans','fan','fans','fan install','fan replacement','fan wiring'],
  ['surge','surge protection','surge protector','whole home surge','whole house surge','panel surge protector'],
  ['garage','garage power','garage outlets','garage wiring','shop','shop power','shop wiring','workshop','shed','shed power','shed wiring'],
  ['outdoor','outside','exterior','backyard','backyard power','patio','patio power','landscape lighting','outdoor outlet','weatherproof outlet','porch light','deck lighting'],
  ['electrical updates','electrical upgrade','home electrical','house electrical','general electrical','residential electrical','electrician','electrical work','home electrical work','modernization','old wiring','code correction']
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

  const searchStopWords = new Set(['a', 'an', 'and', 'for', 'the', 'to', 'of', 'in', 'on', 'at', 'with', 'my', 'our', 'i', 'need', 'want']);

  const getMeaningfulQueryTokens = (query) => Array.from(new Set(
    tokenize(query).filter((token) => !searchStopWords.has(token))
  ));

  const scoreService = (query, service) => {
    const normalizedQuery = normalizeText(query);
    if (!normalizedQuery) return 1;

    const queryTokens = getMeaningfulQueryTokens(query);
    let score = 0;
    let matchedTokens = 0;

    if (service.titleText === normalizedQuery) score += 240;
    else if (service.titleText.includes(normalizedQuery)) score += 180;

    if (service.searchText.includes(normalizedQuery)) score += 150;

    queryTokens.forEach((queryToken) => {
      const exactish = service.tokens.some((candidateToken) =>
        candidateToken === queryToken ||
        (queryToken.length >= 5 && candidateToken.startsWith(queryToken)) ||
        (candidateToken.length >= 5 && queryToken.startsWith(candidateToken))
      );

      const titleTokens = tokenize(service.titleText);
      const titleHit = titleTokens.some((titleToken) =>
        titleToken === queryToken || fuzzyWordMatch(queryToken, titleToken)
      );

      if (exactish) {
        matchedTokens += 1;
        score += titleHit ? 62 : 38;
        return;
      }

      const fuzzy = service.tokens.some((candidateToken) => fuzzyWordMatch(queryToken, candidateToken));
      if (fuzzy) {
        matchedTokens += 1;
        score += titleHit ? 48 : 26;
      }
    });

    if (queryTokens.length > 0) {
      const coverage = matchedTokens / queryTokens.length;
      if (coverage === 1) score += 82;
      else if (coverage >= .66) score += 44;
      else if (coverage >= .5) score += 18;
    }

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

    const meaningfulQueryTokens = getMeaningfulQueryTokens(query);
    const minimumScore = meaningfulQueryTokens.length >= 2 ? 60 : 24;
    const bestScore = ranked.length ? ranked[0].score : 0;
    const relevanceFloor = Math.max(minimumScore, Math.floor(bestScore * 0.85));

    ranked.forEach((service, index) => {
      const show = !isSearching || service.score >= relevanceFloor;
      service.card.classList.toggle('is-hidden', !show);
      service.card.style.order = String(index + 1);
      if (show) visibleCount += 1;
    });

    if (servicesSearchMeta) {
      servicesSearchMeta.textContent = isSearching
        ? `${visibleCount} ${visibleCount === 1 ? 'service' : 'services'} found for “${query.trim()}”.`
        : `Browse all ${totalServices} residential services.`;
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

  const syncMobileServicesState = () => {
    if (window.innerWidth <= 760) {
      servicesGrid.classList.add('is-expanded');
      servicesToggle.setAttribute('aria-expanded', 'true');
    }
    updateServiceLabel();
  };

  window.addEventListener('resize', () => {
    syncMobileServicesState();
    updateServiceArrowsV17();
  });
  syncMobileServicesState();
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


// ===== v17 mobile interactions =====
const servicesPrevV17=document.querySelector('.services-rail-prev');
const servicesNextV17=document.querySelector('.services-rail-next');
const visibleServiceCardsV17=()=>servicesGrid?Array.from(servicesGrid.querySelectorAll('.service-card')).filter(card=>{const s=getComputedStyle(card);return !card.classList.contains('is-hidden')&&s.display!=='none'&&s.visibility!=='hidden'}):[];
const updateServiceArrowsV17=()=>{if(!servicesGrid||!servicesPrevV17||!servicesNextV17)return;if(innerWidth>760){servicesPrevV17.classList.remove('is-disabled');servicesNextV17.classList.remove('is-disabled');return}const max=Math.max(0,servicesGrid.scrollWidth-servicesGrid.clientWidth);servicesPrevV17.classList.toggle('is-disabled',servicesGrid.scrollLeft<=4);servicesNextV17.classList.toggle('is-disabled',servicesGrid.scrollLeft>=max-4)};
const scrollServicesV17=dir=>{if(!servicesGrid||innerWidth>760)return;const cards=visibleServiceCardsV17();if(!cards.length)return;const r=servicesGrid.getBoundingClientRect(),center=r.left+r.width/2;let idx=0,best=Infinity;cards.forEach((card,i)=>{const x=card.getBoundingClientRect(),d=Math.abs(x.left+x.width/2-center);if(d<best){best=d;idx=i}});idx=Math.max(0,Math.min(cards.length-1,idx+(dir==='next'?1:-1)));cards[idx].scrollIntoView({behavior:'smooth',inline:'center',block:'nearest'})};
if(servicesPrevV17)servicesPrevV17.addEventListener('click',()=>scrollServicesV17('prev'));
if(servicesNextV17)servicesNextV17.addEventListener('click',()=>scrollServicesV17('next'));
if(servicesGrid){servicesGrid.addEventListener('scroll',()=>requestAnimationFrame(updateServiceArrowsV17),{passive:true});new MutationObserver(()=>requestAnimationFrame(()=>{if(innerWidth<=760)servicesGrid.scrollTo({left:0,behavior:'smooth'});updateServiceArrowsV17()})).observe(servicesGrid,{attributes:true,subtree:true,attributeFilter:['class','style']})}
addEventListener('resize',updateServiceArrowsV17);addEventListener('load',updateServiceArrowsV17);

const scrollMobileReviewsV17=dir=>{if(!reviewsGridV15||innerWidth>760)return;const cards=Array.from(reviewsGridV15.querySelectorAll('.review-card'));if(!cards.length)return;const r=reviewsGridV15.getBoundingClientRect(),center=r.left+r.width/2;let idx=0,best=Infinity;cards.forEach((card,i)=>{const x=card.getBoundingClientRect(),d=Math.abs(x.left+x.width/2-center);if(d<best){best=d;idx=i}});idx=Math.max(0,Math.min(cards.length-1,idx+(dir==='next'?1:-1)));cards[idx].scrollIntoView({behavior:'smooth',inline:'center',block:'nearest'})};
if(reviewsPrevV15)reviewsPrevV15.addEventListener('click',()=>scrollMobileReviewsV17('prev'));
if(reviewsNextV15)reviewsNextV15.addEventListener('click',()=>scrollMobileReviewsV17('next'));

const mobileFloatingCallV17=document.querySelector('.mobile-floating-call');const heroSectionV17=document.querySelector('.hero');
const updateFloatingCallV17=()=>{if(!mobileFloatingCallV17||!heroSectionV17)return;mobileFloatingCallV17.classList.toggle('is-visible',innerWidth<=760&&heroSectionV17.getBoundingClientRect().bottom<=12)};
addEventListener('scroll',updateFloatingCallV17,{passive:true});addEventListener('resize',updateFloatingCallV17);addEventListener('load',updateFloatingCallV17);updateFloatingCallV17();

// ===== v19 requested refinements =====
document.querySelectorAll('.brand-logo, .mobile-brand-logo, .footer-logo').forEach((logoLink) => {
  logoLink.addEventListener('click', (event) => {
    event.preventDefault();
    window.location.assign('./');
  });
});

// ===== v20 requested refinements =====
(() => {
  const servicesGridEl = document.querySelector('#services-grid');
  const servicesShell = document.querySelector('.services-rail-shell');
  if (servicesGridEl && servicesShell) {
    const getVisibleCards = () => Array.from(servicesGridEl.querySelectorAll('.service-card')).filter((card) => !card.classList.contains('is-hidden'));

    const scrollToCard = (card) => {
      if (!card) return;
      const max = Math.max(0, servicesGridEl.scrollWidth - servicesGridEl.clientWidth);
      const left = Math.max(0, Math.min(max, card.offsetLeft - ((servicesGridEl.clientWidth - card.offsetWidth) / 2)));
      servicesGridEl.scrollTo({ left, behavior: 'smooth' });
    };

    const rebindButton = (selector, handler) => {
      const oldButton = servicesShell.querySelector(selector);
      if (!oldButton) return null;
      const newButton = oldButton.cloneNode(true);
      oldButton.replaceWith(newButton);
      newButton.addEventListener('click', handler);
      return newButton;
    };

    const findNearestCardIndex = (cards) => {
      const center = servicesGridEl.scrollLeft + (servicesGridEl.clientWidth / 2);
      let bestIndex = 0;
      let bestDistance = Infinity;
      cards.forEach((card, index) => {
        const cardCenter = card.offsetLeft + (card.offsetWidth / 2);
        const distance = Math.abs(cardCenter - center);
        if (distance < bestDistance) {
          bestDistance = distance;
          bestIndex = index;
        }
      });
      return bestIndex;
    };

    rebindButton('.services-rail-prev', () => {
      if (window.innerWidth > 760) return;
      const cards = getVisibleCards();
      if (!cards.length) return;
      const index = findNearestCardIndex(cards);
      const nextIndex = index <= 0 ? cards.length - 1 : index - 1;
      scrollToCard(cards[nextIndex]);
    });

    rebindButton('.services-rail-next', () => {
      if (window.innerWidth > 760) return;
      const cards = getVisibleCards();
      if (!cards.length) return;
      const index = findNearestCardIndex(cards);
      const nextIndex = index >= cards.length - 1 ? 0 : index + 1;
      scrollToCard(cards[nextIndex]);
    });
  }

  const reviewsShell = document.querySelector('.reviews-carousel-shell');
  const reviewsGridEl = document.querySelector('.reviews-grid');
  if (reviewsShell && reviewsGridEl) {
    const reviewCards = () => Array.from(reviewsGridEl.querySelectorAll('.review-card'));
    const dotsWrap = document.createElement('div');
    dotsWrap.className = 'reviews-dots';
    reviewsShell.insertAdjacentElement('afterend', dotsWrap);

    const getActiveIndex = () => {
      const cards = reviewCards();
      const center = reviewsGridEl.scrollLeft + (reviewsGridEl.clientWidth / 2);
      let bestIndex = 0;
      let bestDistance = Infinity;
      cards.forEach((card, index) => {
        const cardCenter = card.offsetLeft + (card.offsetWidth / 2);
        const distance = Math.abs(cardCenter - center);
        if (distance < bestDistance) {
          bestDistance = distance;
          bestIndex = index;
        }
      });
      return bestIndex;
    };

    const goToReview = (index) => {
      const cards = reviewCards();
      const card = cards[index];
      if (!card) return;
      if (window.innerWidth > 760) {
        // desktop: rotate DOM order until selected card is first
        while (Array.from(reviewsGridEl.children).indexOf(card) > 0) {
          reviewsGridEl.appendChild(reviewsGridEl.firstElementChild);
        }
        renderDots();
        return;
      }
      const max = Math.max(0, reviewsGridEl.scrollWidth - reviewsGridEl.clientWidth);
      const left = Math.max(0, Math.min(max, card.offsetLeft - ((reviewsGridEl.clientWidth - card.offsetWidth) / 2)));
      reviewsGridEl.scrollTo({ left, behavior: 'smooth' });
      renderDots(index);
    };

    const renderDots = (forcedIndex = null) => {
      const cards = reviewCards();
      const activeIndex = forcedIndex ?? getActiveIndex();
      dotsWrap.innerHTML = '';
      cards.forEach((_, index) => {
        const dot = document.createElement('button');
        dot.type = 'button';
        dot.className = `reviews-dot${index === activeIndex ? ' is-active' : ''}`;
        dot.setAttribute('aria-label', `Go to review ${index + 1}`);
        dot.addEventListener('click', () => goToReview(index));
        dotsWrap.appendChild(dot);
      });
    };

    const rebindReviewButton = (selector, direction) => {
      const oldButton = reviewsShell.querySelector(selector);
      if (!oldButton) return;
      const newButton = oldButton.cloneNode(true);
      oldButton.replaceWith(newButton);
      newButton.addEventListener('click', () => {
        const cards = reviewCards();
        if (!cards.length) return;
        if (window.innerWidth > 760) {
          if (direction === 'next') {
            reviewsGridEl.appendChild(reviewsGridEl.firstElementChild);
          } else {
            reviewsGridEl.insertBefore(reviewsGridEl.lastElementChild, reviewsGridEl.firstElementChild);
          }
          renderDots(0);
          return;
        }
        const currentIndex = getActiveIndex();
        const nextIndex = direction === 'next'
          ? (currentIndex + 1) % cards.length
          : (currentIndex - 1 + cards.length) % cards.length;
        goToReview(nextIndex);
      });
    };

    rebindReviewButton('.reviews-cycle-prev', 'prev');
    rebindReviewButton('.reviews-cycle-next', 'next');
    reviewsGridEl.addEventListener('scroll', () => window.requestAnimationFrame(() => renderDots()), { passive: true });
    window.addEventListener('resize', () => renderDots());
    renderDots();
  }
})();
