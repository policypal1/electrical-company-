// Mobile logo width fix: prevent the full JV Electric wordmark from being clipped on narrow phones.
const mobileBrandLogoFix = document.querySelector('.mobile-brand-logo');
if (mobileBrandLogoFix) mobileBrandLogoFix.style.width = '178px';

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

// ===== v21 focused carousel and mobile interaction fixes =====
(() => {
  const cloneButton = (root, selector) => {
    const oldButton = root?.querySelector(selector);
    if (!oldButton) return null;
    const newButton = oldButton.cloneNode(true);
    oldButton.replaceWith(newButton);
    return newButton;
  };

  const centeredLeft = (track, card) => {
    const max = Math.max(0, track.scrollWidth - track.clientWidth);
    return Math.max(0, Math.min(max, card.offsetLeft - ((track.clientWidth - card.offsetWidth) / 2)));
  };

  const jumpTo = (track, card) => {
    if (!track || !card) return;
    const previous = track.style.scrollBehavior;
    track.style.scrollBehavior = 'auto';
    track.scrollLeft = centeredLeft(track, card);
    requestAnimationFrame(() => {
      track.style.scrollBehavior = previous;
    });
  };

  /* Services: keep movement inside the horizontal rail and stop at the ends. */
  const servicesTrack = document.querySelector('#services-grid');
  const servicesShell = document.querySelector('.services-rail-shell');
  if (servicesTrack && servicesShell) {
    const prev = cloneButton(servicesShell, '.services-rail-prev');
    const next = cloneButton(servicesShell, '.services-rail-next');

    const cards = () => Array.from(servicesTrack.querySelectorAll('.service-card')).filter((card) => {
      const style = getComputedStyle(card);
      return !card.classList.contains('is-hidden') && style.display !== 'none' && style.visibility !== 'hidden';
    });

    const nearestIndex = () => {
      const visible = cards();
      if (!visible.length) return 0;
      const center = servicesTrack.scrollLeft + (servicesTrack.clientWidth / 2);
      let best = 0;
      let distance = Infinity;
      visible.forEach((card, index) => {
        const d = Math.abs((card.offsetLeft + card.offsetWidth / 2) - center);
        if (d < distance) {
          best = index;
          distance = d;
        }
      });
      return best;
    };

    const update = () => {
      if (!prev || !next || window.innerWidth > 760) return;
      const visible = cards();
      const index = nearestIndex();
      prev.classList.toggle('is-disabled', index <= 0);
      next.classList.toggle('is-disabled', index >= visible.length - 1);
    };

    const go = (direction) => {
      if (window.innerWidth > 760) return;
      const visible = cards();
      if (!visible.length) return;
      const current = nearestIndex();
      const target = Math.max(0, Math.min(visible.length - 1, current + direction));
      servicesTrack.scrollTo({ left: centeredLeft(servicesTrack, visible[target]), behavior: 'smooth' });
      window.setTimeout(update, 330);
    };

    prev?.addEventListener('click', () => go(-1));
    next?.addEventListener('click', () => go(1));

    let serviceScrollTimer;
    servicesTrack.addEventListener('scroll', () => {
      clearTimeout(serviceScrollTimer);
      serviceScrollTimer = window.setTimeout(update, 90);
    }, { passive: true });

    window.addEventListener('resize', update);
    window.addEventListener('load', update);
    update();
  }

  const buildDots = (wrap, count, activeIndex, className, activeClass, onClick) => {
    if (!wrap) return;
    wrap.innerHTML = '';
    for (let i = 0; i < count; i += 1) {
      const dot = document.createElement('button');
      dot.type = 'button';
      dot.className = `${className}${i === activeIndex ? ` ${activeClass}` : ''}`;
      dot.setAttribute('aria-label', `Go to review ${i + 1}`);
      dot.addEventListener('click', () => onClick(i));
      wrap.appendChild(dot);
    }
  };

  const makeInfiniteMobileCarousel = ({ track, cardSelector, prev, next, dots, dotClass, activeDotClass }) => {
    if (!track) return () => {};
    let logicalIndex = 0;
    let settleTimer = 0;
    let cloneFirst = null;
    let cloneLast = null;

    const originals = () => Array.from(track.querySelectorAll(`${cardSelector}:not(.carousel-clone)`));

    const renderDots = () => {
      const count = originals().length;
      buildDots(dots, count, logicalIndex, dotClass, activeDotClass, (index) => goToLogical(index));
    };

    const teardownClones = () => {
      track.querySelectorAll('.carousel-clone').forEach((clone) => clone.remove());
      cloneFirst = null;
      cloneLast = null;
    };

    const setupClones = () => {
      teardownClones();
      const cards = originals();
      if (cards.length < 2) return;
      cloneLast = cards[cards.length - 1].cloneNode(true);
      cloneFirst = cards[0].cloneNode(true);
      cloneLast.classList.add('carousel-clone');
      cloneFirst.classList.add('carousel-clone');
      cloneLast.setAttribute('aria-hidden', 'true');
      cloneFirst.setAttribute('aria-hidden', 'true');
      track.insertBefore(cloneLast, cards[0]);
      track.appendChild(cloneFirst);
      requestAnimationFrame(() => jumpTo(track, originals()[logicalIndex]));
    };

    const goToLogical = (index) => {
      const cards = originals();
      if (!cards.length) return;
      logicalIndex = (index + cards.length) % cards.length;
      track.scrollTo({ left: centeredLeft(track, cards[logicalIndex]), behavior: 'smooth' });
      renderDots();
    };

    const move = (direction) => {
      const cards = originals();
      if (cards.length < 2) return;

      if (direction > 0 && logicalIndex === cards.length - 1 && cloneFirst) {
        logicalIndex = 0;
        track.scrollTo({ left: centeredLeft(track, cloneFirst), behavior: 'smooth' });
        renderDots();
        window.setTimeout(() => jumpTo(track, cards[0]), 390);
        return;
      }

      if (direction < 0 && logicalIndex === 0 && cloneLast) {
        logicalIndex = cards.length - 1;
        track.scrollTo({ left: centeredLeft(track, cloneLast), behavior: 'smooth' });
        renderDots();
        window.setTimeout(() => jumpTo(track, cards[cards.length - 1]), 390);
        return;
      }

      goToLogical(logicalIndex + direction);
    };

    const settleFromManualScroll = () => {
      clearTimeout(settleTimer);
      settleTimer = window.setTimeout(() => {
        const children = Array.from(track.children).filter((child) => child.matches(cardSelector));
        const cards = originals();
        if (!children.length || !cards.length) return;
        const center = track.scrollLeft + track.clientWidth / 2;
        let nearest = children[0];
        let distance = Infinity;
        children.forEach((card) => {
          const d = Math.abs((card.offsetLeft + card.offsetWidth / 2) - center);
          if (d < distance) {
            nearest = card;
            distance = d;
          }
        });

        if (nearest === cloneLast) {
          logicalIndex = cards.length - 1;
          jumpTo(track, cards[cards.length - 1]);
        } else if (nearest === cloneFirst) {
          logicalIndex = 0;
          jumpTo(track, cards[0]);
        } else {
          logicalIndex = Math.max(0, cards.indexOf(nearest));
        }
        renderDots();
      }, 110);
    };

    const prevHandler = () => move(-1);
    const nextHandler = () => move(1);
    const scrollHandler = () => settleFromManualScroll();

    prev?.addEventListener('click', prevHandler);
    next?.addEventListener('click', nextHandler);
    track.addEventListener('scroll', scrollHandler, { passive: true });

    setupClones();
    renderDots();

    return () => {
      clearTimeout(settleTimer);
      prev?.removeEventListener('click', prevHandler);
      next?.removeEventListener('click', nextHandler);
      track.removeEventListener('scroll', scrollHandler);
      teardownClones();
    };
  };

  /* Mini yellow review carousel below the hero. */
  const heroReviewTrack = document.querySelector('.hero-review-track');
  const heroReviewCarousel = document.querySelector('.hero-review-carousel');
  const heroReviewDots = document.querySelector('.hero-review-dots');
  if (heroReviewTrack && heroReviewCarousel) {
    const heroPrev = cloneButton(heroReviewCarousel, '.hero-review-prev');
    const heroNext = cloneButton(heroReviewCarousel, '.hero-review-next');
    let destroyHeroCarousel = null;
    let heroWasMobile = null;

    const syncHeroReviewMode = () => {
      const isMobile = window.innerWidth <= 760;
      if (heroWasMobile === isMobile) return;
      heroWasMobile = isMobile;
      if (destroyHeroCarousel) {
        destroyHeroCarousel();
        destroyHeroCarousel = null;
      }
      if (isMobile) {
        destroyHeroCarousel = makeInfiniteMobileCarousel({
          track: heroReviewTrack,
          cardSelector: '.hero-review-card',
          prev: heroPrev,
          next: heroNext,
          dots: heroReviewDots,
          dotClass: 'hero-review-dot',
          activeDotClass: 'is-active'
        });
      }
    };

    syncHeroReviewMode();
    window.addEventListener('resize', syncHeroReviewMode);
  }

  /* Main review section: three-card page carousel on desktop, seamless single-card carousel on mobile. */
  const reviewsShell = document.querySelector('.reviews-carousel-shell');
  const reviewsTrack = document.querySelector('.reviews-grid');
  if (reviewsShell && reviewsTrack) {
    const prev = cloneButton(reviewsShell, '.reviews-cycle-prev');
    const next = cloneButton(reviewsShell, '.reviews-cycle-next');
    let dots = document.querySelector('.reviews-dots');
    if (!dots) {
      dots = document.createElement('div');
      dots.className = 'reviews-dots';
      reviewsShell.insertAdjacentElement('afterend', dots);
    }

    let destroyMobileReviews = null;
    let reviewsWereMobile = null;

    const removeMobileClones = () => {
      reviewsTrack.querySelectorAll('.carousel-clone').forEach((clone) => clone.remove());
    };

    const desktopCycle = (direction) => {
      if (window.innerWidth <= 760) return;
      removeMobileClones();
      const cards = Array.from(reviewsTrack.querySelectorAll('.review-card'));
      if (cards.length < 2) return;
      const className = direction > 0 ? 'is-cycling-next' : 'is-cycling-prev';
      reviewsTrack.classList.add(className);
      window.setTimeout(() => {
        if (direction > 0) {
          reviewsTrack.appendChild(reviewsTrack.firstElementChild);
        } else {
          reviewsTrack.insertBefore(reviewsTrack.lastElementChild, reviewsTrack.firstElementChild);
        }
        reviewsTrack.classList.remove(className);
      }, 150);
    };

    const syncMainReviewMode = () => {
      const isMobile = window.innerWidth <= 760;
      if (reviewsWereMobile === isMobile) return;
      reviewsWereMobile = isMobile;
      if (destroyMobileReviews) {
        destroyMobileReviews();
        destroyMobileReviews = null;
      }

      if (isMobile) {
        destroyMobileReviews = makeInfiniteMobileCarousel({
          track: reviewsTrack,
          cardSelector: '.review-card',
          prev,
          next,
          dots,
          dotClass: 'reviews-dot',
          activeDotClass: 'is-active'
        });
      } else {
        removeMobileClones();
        dots.innerHTML = '';
      }
    };

    prev?.addEventListener('click', () => desktopCycle(-1));
    next?.addEventListener('click', () => desktopCycle(1));

    syncMainReviewMode();
    window.addEventListener('resize', syncMainReviewMode);
  }
})();

// ===== v22 final mobile refinements =====
(() => {
  const heroVisualEl = document.querySelector('.hero-visual');
  const mainCardEl = document.querySelector('.project-card-main');

  if (heroVisualEl && mainCardEl) {
    const focusMainCard = () => {
      if (window.innerWidth <= 760) {
        heroVisualEl.classList.add('main-focused');
        mainCardEl.setAttribute('aria-pressed', 'true');
      }
    };

    mainCardEl.addEventListener('touchstart', focusMainCard, { passive: true });
    mainCardEl.addEventListener('pointerdown', focusMainCard);
    mainCardEl.addEventListener('click', () => {
      if (window.innerWidth <= 760) {
        heroVisualEl.classList.add('main-focused');
        mainCardEl.setAttribute('aria-pressed', 'true');
      }
    });
  }

  // Replace the mini customer-reviews carousel with a simpler, non-bouncy mobile slider.
  const oldTrack = document.querySelector('.hero-review-track');
  const heroCarousel = document.querySelector('.hero-review-carousel');
  const heroDots = document.querySelector('.hero-review-dots');
  const heroPrevBtnOld = document.querySelector('.hero-review-prev');
  const heroNextBtnOld = document.querySelector('.hero-review-next');

  if (oldTrack && heroCarousel && heroDots && heroPrevBtnOld && heroNextBtnOld) {
    const cleanTrack = oldTrack.cloneNode(true);
    cleanTrack.querySelectorAll('.carousel-clone').forEach((node) => node.remove());
    oldTrack.replaceWith(cleanTrack);

    const heroPrevBtn = heroPrevBtnOld.cloneNode(true);
    heroPrevBtnOld.replaceWith(heroPrevBtn);
    const heroNextBtn = heroNextBtnOld.cloneNode(true);
    heroNextBtnOld.replaceWith(heroNextBtn);

    const cards = () => Array.from(cleanTrack.querySelectorAll('.hero-review-card'));
    let currentIndex = 0;

    const renderDots = () => {
      heroDots.innerHTML = '';
      cards().forEach((_, index) => {
        const dot = document.createElement('button');
        dot.type = 'button';
        dot.className = `hero-review-dot${index === currentIndex ? ' is-active' : ''}`;
        dot.setAttribute('aria-label', `Go to highlighted review ${index + 1}`);
        dot.addEventListener('click', () => goTo(index));
        heroDots.appendChild(dot);
      });
    };

    const goTo = (index) => {
      const list = cards();
      if (!list.length) return;
      currentIndex = (index + list.length) % list.length;
      const card = list[currentIndex];
      const left = Math.max(0, card.offsetLeft - ((cleanTrack.clientWidth - card.offsetWidth) / 2));
      cleanTrack.scrollTo({ left, behavior: 'smooth' });
      renderDots();
    };

    heroPrevBtn.addEventListener('click', () => {
      if (window.innerWidth <= 760) goTo(currentIndex - 1);
    });

    heroNextBtn.addEventListener('click', () => {
      if (window.innerWidth <= 760) goTo(currentIndex + 1);
    });

    let scrollTimer = 0;
    cleanTrack.addEventListener('scroll', () => {
      if (window.innerWidth > 760) return;
      clearTimeout(scrollTimer);
      scrollTimer = window.setTimeout(() => {
        const list = cards();
        if (!list.length) return;
        const center = cleanTrack.scrollLeft + cleanTrack.clientWidth / 2;
        let bestIndex = 0;
        let bestDistance = Infinity;
        list.forEach((card, index) => {
          const cardCenter = card.offsetLeft + (card.offsetWidth / 2);
          const dist = Math.abs(cardCenter - center);
          if (dist < bestDistance) {
            bestDistance = dist;
            bestIndex = index;
          }
        });
        currentIndex = bestIndex;
        renderDots();
      }, 70);
    }, { passive: true });

    const syncHeroStrip = () => {
      if (window.innerWidth <= 760) {
        goTo(currentIndex);
      } else {
        cleanTrack.scrollLeft = 0;
        heroDots.innerHTML = '';
      }
    };

    window.addEventListener('resize', syncHeroStrip);
    renderDots();
    syncHeroStrip();
  }
})();

// ===== mobile bottom-review navigation + larger floating call button =====
(() => {
  const style = document.createElement('style');
  style.setAttribute('data-jv-mobile-ui-fixes', 'true');
  style.textContent = `
    @media (max-width: 760px) {
      /* Keep the lower review arrows off the cards and align them with the dots. */
      .reviews-carousel-shell {
        overflow: visible !important;
      }

      .reviews-carousel-shell .reviews-cycle-button {
        position: absolute !important;
        top: auto !important;
        bottom: -56px !important;
        transform: none !important;
        z-index: 6 !important;
        width: 44px !important;
        height: 44px !important;
      }

      .reviews-carousel-shell .reviews-cycle-prev {
        left: calc(50% - 88px) !important;
        right: auto !important;
      }

      .reviews-carousel-shell .reviews-cycle-next {
        right: calc(50% - 88px) !important;
        left: auto !important;
      }

      .reviews-dots {
        min-height: 44px !important;
        margin-top: 12px !important;
      }

      /* Slightly larger floating Call Now pill. */
      .mobile-floating-call {
        min-height: 62px !important;
        padding: 0 26px !important;
        font-size: 16px !important;
        gap: 11px !important;
      }

      .mobile-floating-call svg {
        width: 22px !important;
        height: 22px !important;
      }
    }
  `;
  document.head.appendChild(style);
})();
