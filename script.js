/*
 * JV Electric update bootstrap
 * Preserves the exact script.js version that was on main when this update was built,
 * then loads the client-requested hero / recent-work / social updates.
 *
 * This file is intentionally tiny: copy it over the existing script.js alongside
 * jv-client-updates.js and the supplied WebP images.
 */
document.write('<script src="https://cdn.jsdelivr.net/gh/policypal1/electrical-company-@f4caf453cd8b502ecbdee36dd0a4b4fced37fcef/script.js"></' + 'script>');
document.write('<script src="jv-client-updates.js"></' + 'script>');

/* JV Electric contact-form configuration. */
window.JV_SITE_CONFIG = Object.freeze({
  formEndpoint: 'https://script.google.com/macros/s/AKfycbwEWIQbxN1CaLSqlhBkCW3amonPw8KChDklOiDnwmu4AUqJpzHEvRsrSaVUpD_DFX3Vfw/exec'
});

(() => {
  const form = document.querySelector('#estimate-form');
  if (!form) return;

  const card = form.closest('.contact-form-card');
  const endpoint = String(window.JV_SITE_CONFIG?.formEndpoint || '').trim();
  const button = form.querySelector('button[type="submit"]');
  const status = form.querySelector('.contact-form-status');
  const originalButtonText = button?.textContent || 'Request Estimate';
  let pending = false;
  let timeoutId = 0;

  const style = document.createElement('style');
  style.textContent = `
    .form-honeypot {
      position: absolute !important;
      left: -10000px !important;
      width: 1px !important;
      height: 1px !important;
      overflow: hidden !important;
    }
    .contact-form-status {
      min-height: 1.4em;
      margin: 12px 0 0;
      font-size: .95rem;
      line-height: 1.45;
    }
    .contact-form-status.is-success { color: #207a3b; }
    .contact-form button[disabled] { opacity: .72; cursor: wait; }
    .jv-form-error {
      min-height: 330px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      text-align: center;
      padding: 36px 22px;
    }
    .jv-form-error h3 {
      margin: 0 0 12px;
      font-size: clamp(1.65rem, 3vw, 2.2rem);
      line-height: 1.1;
      color: #151515;
    }
    .jv-form-error p {
      max-width: 520px;
      margin: 0 0 24px;
      color: #555;
      font-size: 1rem;
      line-height: 1.55;
    }
    .jv-form-error a {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-height: 54px;
      padding: 0 26px;
      border-radius: 10px;
      background: #ffc400;
      color: #111;
      font-weight: 800;
      text-decoration: none;
    }
  `;
  document.head.appendChild(style);

  const iframe = document.createElement('iframe');
  iframe.name = 'jv-estimate-form-target';
  iframe.title = 'Estimate request submission';
  iframe.hidden = true;
  document.body.appendChild(iframe);

  const setStatus = (message, type = '') => {
    if (!status) return;
    status.textContent = message;
    status.classList.toggle('is-success', type === 'success');
  };

  const setBusy = (busy) => {
    if (!button) return;
    button.disabled = busy;
    button.textContent = busy ? 'Sending…' : originalButtonText;
  };

  const resetPending = () => {
    pending = false;
    window.clearTimeout(timeoutId);
    setBusy(false);
  };

  const showFullFormError = () => {
    resetPending();
    if (!card) {
      setStatus('Error. Please call (360) 442-3618.');
      return;
    }

    card.innerHTML = `
      <div class="jv-form-error" role="alert">
        <h3>We couldn’t send your request.</h3>
        <p>Please call JV Electric directly and we’ll help you with your estimate.</p>
        <a href="tel:+13604423618">Call (360) 442-3618</a>
      </div>
    `;
  };

  window.addEventListener('message', (event) => {
    const data = event.data;
    if (!pending || !data || data.source !== 'jv-electric-form') return;

    if (data.ok) {
      resetPending();
      form.reset();
      setStatus('Thanks. Your estimate request was sent. JV Electric will follow up soon.', 'success');
    } else {
      showFullFormError();
    }
  });

  form.addEventListener('submit', (event) => {
    setStatus('');

    if (!/^https:\/\/script\.google\.com\/macros\/s\//i.test(endpoint)) {
      event.preventDefault();
      showFullFormError();
      return;
    }

    if (!form.checkValidity()) {
      event.preventDefault();
      form.reportValidity();
      return;
    }

    if (pending) {
      event.preventDefault();
      return;
    }

    pending = true;
    setBusy(true);
    setStatus('Sending your request…');

    form.action = endpoint;
    form.method = 'POST';
    form.target = iframe.name;

    timeoutId = window.setTimeout(() => {
      if (pending) showFullFormError();
    }, 18000);
  });
})();
