window.RE = window.RE || {};

RE.ui = {
  toastContainer: null,
  _mobileNavClose: null,

  init() {
    if (!this.toastContainer) {
      this.toastContainer = document.createElement('div');
      this.toastContainer.className = 'toast-container';
      document.body.appendChild(this.toastContainer);
    }
  },

  setupMobileNav() {
    const toggle = document.getElementById('nav-toggle');
    const links = document.getElementById('nav-links');
    if (!toggle || !links) return null;

    const close = () => {
      links.classList.remove('open');
      toggle.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
    };

    toggle.onclick = () => {
      const isOpen = links.classList.toggle('open');
      toggle.classList.toggle('open', isOpen);
      toggle.setAttribute('aria-expanded', String(isOpen));
    };

    links.querySelectorAll('a').forEach((a) => {
      a.onclick = close;
    });

    this._mobileNavClose = close;
    return { close };
  },

  closeMobileNav() {
    if (this._mobileNavClose) this._mobileNavClose();
  },

  toast(message, type = 'info') {
    this.init();
    const el = document.createElement('div');
    el.className = 'toast toast-' + type;
    el.textContent = message;
    this.toastContainer.appendChild(el);
    setTimeout(() => el.remove(), 4000);
  },

  loading() {
    return '<div class="loading"><div class="spinner"></div></div>';
  },

  empty(message) {
    return `<div class="empty-state"><p>${RE.utils.escapeHtml(message)}</p></div>`;
  },

  appendPagination(container, meta, onPage) {
    const el = this.pagination(meta, onPage);
    if (el) container.appendChild(el);
  },

  pagination(meta, onPage) {
    if (!meta || meta.totalPages <= 1) return null;
    const wrap = document.createElement('div');
    wrap.className = 'pagination';
    const prev = document.createElement('button');
    prev.className = 'btn btn-secondary btn-sm';
    prev.textContent = 'Previous';
    prev.disabled = meta.page <= 1;
    prev.onclick = () => onPage(meta.page - 1);
    const info = document.createElement('span');
    info.textContent = `Page ${meta.page} of ${meta.totalPages} (${meta.total} total)`;
    const next = document.createElement('button');
    next.className = 'btn btn-secondary btn-sm';
    next.textContent = 'Next';
    next.disabled = meta.page >= meta.totalPages;
    next.onclick = () => onPage(meta.page + 1);
    wrap.append(prev, info, next);
    return wrap;
  },

  openImageLightbox(src) {
    const overlay = document.createElement('div');
    overlay.className = 'image-lightbox';
    const img = document.createElement('img');
    img.src = src;
    img.alt = '';
    overlay.appendChild(img);
    const close = () => {
      overlay.remove();
      document.removeEventListener('keydown', onKey);
    };
    const onKey = (e) => {
      if (e.key === 'Escape') close();
    };
    overlay.onclick = close;
    img.onclick = (e) => e.stopPropagation();
    document.addEventListener('keydown', onKey);
    document.body.appendChild(overlay);
  },

  bindZoomableImages(container, selector = 'img') {
    if (!container) return;
    container.querySelectorAll(selector).forEach((img) => {
      img.classList.add('zoomable-image');
      img.onclick = (e) => {
        e.stopPropagation();
        this.openImageLightbox(img.src);
      };
    });
  },

  confirm(message) {
    return new Promise((resolve) => {
      const overlay = document.createElement('div');
      overlay.className = 'modal-overlay';
      overlay.innerHTML = `
        <div class="modal">
          <h3>Confirm</h3>
          <p>${RE.utils.escapeHtml(message)}</p>
          <div class="modal-actions">
            <button class="btn btn-secondary" data-action="cancel">Cancel</button>
            <button class="btn btn-danger" data-action="ok">Confirm</button>
          </div>
        </div>`;
      overlay.querySelector('[data-action="cancel"]').onclick = () => { overlay.remove(); resolve(false); };
      overlay.querySelector('[data-action="ok"]').onclick = () => { overlay.remove(); resolve(true); };
      document.body.appendChild(overlay);
    });
  },

  propertyCard(property, linkPrefix) {
    const img = RE.utils.propertyCover(property.images);
    const imgSrc = img ? RE.uploadUrl(img) : '';
    const href = linkPrefix + property.id;
    return `
      <div class="card property-card" data-href="${href}">
        ${imgSrc ? `<img class="card-img" src="${imgSrc}" alt="">` : '<div class="card-img"></div>'}
        <div class="card-body">
          <h3>${RE.utils.escapeHtml(property.title)}</h3>
          <p class="price">${RE.utils.formatPrice(property.price)}<span class="meta"> /mo</span></p>
          <p class="meta">${RE.utils.escapeHtml(property.city)}, ${RE.utils.escapeHtml(property.state)}</p>
          <p class="meta">${property.bedrooms} bed · ${property.bathrooms} bath · ${property.areaSqft} sqft</p>
        </div>
      </div>`;
  },

  bindPropertyCards(container, navigate) {
    container.querySelectorAll('.property-card').forEach((card) => {
      card.onclick = () => navigate(card.dataset.href);
      this.bindZoomableImages(card, '.card-img');
    });
  },

  renderFormErrors(form, errors) {
    form.querySelectorAll('.error').forEach((el) => el.remove());
    if (!errors?.length) return;
    errors.forEach((e) => {
      const field = form.querySelector(`[name="${e.field}"]`);
      if (field) {
        const err = document.createElement('div');
        err.className = 'error';
        err.textContent = e.message;
        field.parentElement.appendChild(err);
      }
    });
  },

  stars(rating) {
    return '★'.repeat(rating) + '☆'.repeat(5 - rating);
  },

  filterBar(statuses, current, onChange) {
    const wrap = document.createElement('div');
    wrap.className = 'chip-list';
    wrap.style.marginBottom = '1rem';
    const all = document.createElement('button');
    all.className = 'chip' + (!current ? ' selected' : '');
    all.textContent = 'All';
    all.onclick = () => onChange('');
    wrap.appendChild(all);
    statuses.forEach((s) => {
      const btn = document.createElement('button');
      btn.className = 'chip' + (current === s ? ' selected' : '');
      btn.textContent = s;
      btn.onclick = () => onChange(s);
      wrap.appendChild(btn);
    });
    return wrap;
  },
};

RE.router = {
  create(routes) {
    let currentParams = {};

    function matchRoute(hash) {
      const path = hash || '/';
      for (const route of routes) {
        const pattern = route.path.replace(/:\w+/g, '([^/]+)');
        const regex = new RegExp('^' + pattern + '$');
        const m = path.match(regex);
        if (m) {
          const paramNames = (route.path.match(/:\w+/g) || []).map((p) => p.slice(1));
          const params = {};
          paramNames.forEach((name, i) => { params[name] = m[i + 1]; });
          return { route, params };
        }
      }
      return null;
    }

    async function navigate() {
      const { path } = RE.utils.parseHash();
      const matched = matchRoute(path);
      const app = document.getElementById('app');
      if (!matched) {
        app.innerHTML = RE.ui.empty('Page not found');
        return;
      }
      currentParams = matched.params;
      if (matched.route.guard && !matched.route.guard()) return;
      app.innerHTML = RE.ui.loading();
      try {
        await matched.route.render(app, matched.params);
      } catch (err) {
        const e = RE.api.handleError(err);
        app.innerHTML = `<div class="alert alert-danger">${RE.utils.escapeHtml(e.message)}</div>`;
      }
    }

    window.addEventListener('hashchange', navigate);
    return { start: navigate, getParams: () => currentParams };
  },

  go(path) { location.hash = '#' + path; },
};
