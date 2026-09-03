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

/* JV Electric contact-form configuration.
 * After deploying the included Google Apps Script as a Web App,
 * replace the placeholder below with the /exec URL.
 */
window.JV_SITE_CONFIG = Object.freeze({
  formEndpoint: 'PASTE_GOOGLE_APPS_SCRIPT_WEB_APP_URL_HERE'
});

(() => {
  const form = document.querySelector('#estimate-form');
  if (!form) return;

  const config = window.JV_SITE_CONFIG || {};
  const endpoint = String(config.formEndpoint || '').trim();
  const button = form.querySelector('button[type="submit"]');
  const status = form.querySelector('.contact-form-status');
  const originalButtonText = button?.textContent || 'Request Estimate';
  const PLACEHOLDER = 'PASTE_GOOGLE_APPS_SCRIPT_WEB_APP_URL_HERE';
  let pending = false;
  let timeoutId = 0;

  const style = document.createElement('style');
  style.textContent = `
    .form-honeypot { position:absolute !important; left:-10000px !important; width:1px !important; height:1px !important; overflow:hidden !important; }
    .contact-form-status { min-height:1.4em; margin:12px 0 0; font-size:.95rem; line-height:1.45; }
    .contact-form-status.is-success { color:#d9ffd9; }
    .contact-form-status.is-error { color:#ffd7d7; }
    .contact-form button[disabled] { opacity:.72; cursor:wait; }
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
    status.classList.toggle('is-error', type === 'error');
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

  const upsertHidden = (name, value) => {
    let input = form.querySelector(`input[type="hidden"][name="${name}"]`);
    if (!input) {
      input = document.createElement('input');
      input.type = 'hidden';
      input.name = name;
      form.appendChild(input);
    }
    input.value = value;
  };

  window.addEventListener('message', (event) => {
    const data = event.data;
    if (!pending || !data || data.source !== 'jv-electric-form') return;

    resetPending();
    if (data.ok) {
      form.reset();
      setStatus('Thanks. Your estimate request was sent. JV Electric will follow up soon.', 'success');
    } else {
      setStatus('We could not send your request. Please call (360) 442-3618.', 'error');
    }
  });

  form.addEventListener('submit', (event) => {
    setStatus('');

    if (!endpoint || endpoint === PLACEHOLDER || !/^https:\/\/script\.google\.com\/macros\/s\//i.test(endpoint)) {
      event.preventDefault();
      setStatus('The online form is not connected yet. Please call (360) 442-3618.', 'error');
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

    upsertHidden('pageUrl', window.location.href);
    upsertHidden('referrer', document.referrer || 'Direct');
    upsertHidden('submittedAt', new Date().toISOString());

    form.action = endpoint;
    form.method = 'POST';
    form.target = iframe.name;

    timeoutId = window.setTimeout(() => {
      if (!pending) return;
      resetPending();
      setStatus('The request is taking too long. Please call (360) 442-3618.', 'error');
    }, 18000);
  });
})();
