RE.tenantPages = RE.tenantPages || {};

RE.tenantPages.home = async function (app) {
  let page = 1;
  const limit = 9;
  const PROPERTY_TYPES = ['APARTMENT', 'HOUSE', 'CONDO', 'STUDIO'];
  const selectedAmenityIds = new Set();

  let currentFilters = {
    city: '',
    state: '',
    propertyType: '',
    bedroomsMin: '',
    bathroomsMin: '',
    priceMin: '',
    priceMax: '',
    areaMin: '',
    areaMax: '',
    q: '',
    amenityIds: '',
  };

  let allAmenities = [];
  try {
    const amenRes = await RE.api.amenities.list({ page: 1, limit: 100 });
    allAmenities = amenRes.data || [];
  } catch (_) {
    allAmenities = [];
  }

  function renderFiltersSummary() {
    const parts = [];

    const city = (currentFilters.city || '').trim();
    const state = (currentFilters.state || '').trim();
    const location = [city, state].filter(Boolean).join(', ');
    if (location) parts.push(location);

    if (currentFilters.propertyType) parts.push(currentFilters.propertyType);

    const priceMin = currentFilters.priceMin !== '' ? Number(currentFilters.priceMin) : null;
    const priceMax = currentFilters.priceMax !== '' ? Number(currentFilters.priceMax) : null;
    if (Number.isFinite(priceMin) || Number.isFinite(priceMax)) {
      const left = Number.isFinite(priceMin) ? RE.utils.formatPrice(priceMin) : 'Any';
      const right = Number.isFinite(priceMax) ? RE.utils.formatPrice(priceMax) : 'Any';
      parts.push(`${left}–${right}`);
    }

    const bd = currentFilters.bedroomsMin !== '' ? Number(currentFilters.bedroomsMin) : null;
    if (Number.isFinite(bd)) parts.push(`${bd}+ bd`);

    const ba = currentFilters.bathroomsMin !== '' ? Number(currentFilters.bathroomsMin) : null;
    if (Number.isFinite(ba)) parts.push(`${ba}+ ba`);

    const areaMin = currentFilters.areaMin !== '' ? Number(currentFilters.areaMin) : null;
    const areaMax = currentFilters.areaMax !== '' ? Number(currentFilters.areaMax) : null;
    if (Number.isFinite(areaMin) || Number.isFinite(areaMax)) {
      const left = Number.isFinite(areaMin) ? `${areaMin} sqft` : 'Any';
      const right = Number.isFinite(areaMax) ? `${areaMax} sqft` : 'Any';
      parts.push(`${left}–${right}`);
    }

    const q = (currentFilters.q || '').trim();
    if (q) parts.push(`“${q}”`);

    if (selectedAmenityIds.size) {
      parts.push(`${selectedAmenityIds.size} amenit${selectedAmenityIds.size === 1 ? 'y' : 'ies'}`);
    }

    if (!parts.length) return 'No filters applied';
    return parts.join(' • ');
  }

  function renderAmenityChips() {
    if (!allAmenities.length) return '';
    return `
      <div class="form-group">
        <label>Amenities</label>
        <div class="chip-list" id="amenity-chips">
          ${allAmenities
            .map(
              (a) => `
              <button type="button" class="chip ${selectedAmenityIds.has(a.id) ? 'selected' : ''}" data-amenity="${a.id}">
                ${RE.utils.escapeHtml(a.name)}
              </button>`
            )
            .join('')}
        </div>
      </div>`;
  }

  function readFiltersFromUI() {
    const get = (sel) => app.querySelector(sel);
    const city = get('#filter-city')?.value?.trim() || '';
    const state = get('#filter-state')?.value?.trim() || '';
    const propertyType = get('#filter-type')?.value || '';
    const bedroomsMin = get('#filter-bedrooms')?.value || '';
    const bathroomsMin = get('#filter-bathrooms')?.value || '';
    const priceMin = get('#filter-price-min')?.value || '';
    const priceMax = get('#filter-price-max')?.value || '';
    const areaMin = get('#filter-area-min')?.value || '';
    const areaMax = get('#filter-area-max')?.value || '';
    const q = get('#filter-q')?.value?.trim() || '';
    const amenityIds = Array.from(selectedAmenityIds).join(',');

    currentFilters = {
      city,
      state,
      propertyType,
      bedroomsMin,
      bathroomsMin,
      priceMin,
      priceMax,
      areaMin,
      areaMax,
      q,
      amenityIds,
    };
  }

  async function load(p) {
    page = p;
    app.innerHTML = RE.ui.loading();
    const res = await RE.api.properties.list({ page, limit, ...currentFilters });
    const properties = res.data;
    const meta = res.meta;

    app.innerHTML = `
      <div class="page-header">
        <h1>Browse Properties</h1>
        <p>Find your next rental home</p>
      </div>
      <div class="card" style="margin-bottom:1rem">
        <div class="card-body">
          <div class="filters-header">
            <button class="btn btn-secondary btn-sm" id="filters-toggle" type="button" aria-expanded="false">
              Show filters
            </button>
            <div id="filters-summary" title="${RE.utils.escapeHtml(renderFiltersSummary())}">
              ${RE.utils.escapeHtml(renderFiltersSummary())}
            </div>
          </div>
          <div id="filters-panel" hidden>
            <div class="form-row" style="margin-top:0.75rem">
              <div class="form-group">
                <label for="filter-city">City</label>
                <input id="filter-city" type="text" value="${RE.utils.escapeHtml(currentFilters.city || '')}" placeholder="e.g. Austin">
              </div>
              <div class="form-group">
                <label for="filter-state">State</label>
                <input id="filter-state" type="text" value="${RE.utils.escapeHtml(currentFilters.state || '')}" placeholder="e.g. TX">
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label for="filter-type">Property type</label>
                <select id="filter-type">
                  <option value="">Any</option>
                  ${PROPERTY_TYPES
                    .map((t) => `<option value="${t}" ${currentFilters.propertyType === t ? 'selected' : ''}>${t}</option>`)
                    .join('')}
                </select>
              </div>
              <div class="form-group">
                <label for="filter-q">Search</label>
                <input id="filter-q" type="text" value="${RE.utils.escapeHtml(currentFilters.q || '')}" placeholder="Title, address, description">
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label for="filter-bedrooms">Bedrooms (min)</label>
                <input id="filter-bedrooms" type="number" min="0" value="${RE.utils.escapeHtml(currentFilters.bedroomsMin || '')}">
              </div>
              <div class="form-group">
                <label for="filter-bathrooms">Bathrooms (min)</label>
                <input id="filter-bathrooms" type="number" min="0" value="${RE.utils.escapeHtml(currentFilters.bathroomsMin || '')}">
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label for="filter-price-min">Price min</label>
                <input id="filter-price-min" type="number" min="0" value="${RE.utils.escapeHtml(currentFilters.priceMin || '')}">
              </div>
              <div class="form-group">
                <label for="filter-price-max">Price max</label>
                <input id="filter-price-max" type="number" min="0" value="${RE.utils.escapeHtml(currentFilters.priceMax || '')}">
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label for="filter-area-min">Area sqft min</label>
                <input id="filter-area-min" type="number" min="0" value="${RE.utils.escapeHtml(currentFilters.areaMin || '')}">
              </div>
              <div class="form-group">
                <label for="filter-area-max">Area sqft max</label>
                <input id="filter-area-max" type="number" min="0" value="${RE.utils.escapeHtml(currentFilters.areaMax || '')}">
              </div>
            </div>
            ${renderAmenityChips()}
            <div class="actions" style="margin-top:0.25rem">
              <button class="btn btn-primary" id="filter-apply">Apply</button>
              <button class="btn btn-secondary" id="filter-reset">Reset</button>
            </div>
          </div>
        </div>
      </div>
      <div class="grid grid-3" id="property-grid">
        ${properties.length ? properties.map((p) => RE.ui.propertyCard(p, '#/properties/')).join('') : RE.ui.empty('No properties available')}
      </div>
      <div id="pagination"></div>`;

    const grid = app.querySelector('#property-grid');
    if (grid) RE.ui.bindPropertyCards(grid, (href) => { location.hash = href; });
    const pagEl = app.querySelector('#pagination');
    if (pagEl && meta) RE.ui.appendPagination(pagEl, meta, load);

    const summaryEl = app.querySelector('#filters-summary');
    const toggleBtn = app.querySelector('#filters-toggle');
    const panelEl = app.querySelector('#filters-panel');

    const updateSummary = () => {
      const text = renderFiltersSummary();
      if (!summaryEl) return;
      summaryEl.textContent = text;
      summaryEl.title = text;
    };

    const setPanelOpen = (isOpen) => {
      if (!toggleBtn || !panelEl) return;
      panelEl.hidden = !isOpen;
      toggleBtn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
      toggleBtn.textContent = isOpen ? 'Hide filters' : 'Show filters';
    };

    if (toggleBtn) {
      toggleBtn.onclick = () => {
        const expanded = toggleBtn.getAttribute('aria-expanded') === 'true';
        setPanelOpen(!expanded);
      };
    }

    app.querySelectorAll('#amenity-chips .chip').forEach((chip) => {
      chip.onclick = () => {
        const id = chip.dataset.amenity;
        if (!id) return;
        if (selectedAmenityIds.has(id)) selectedAmenityIds.delete(id);
        else selectedAmenityIds.add(id);
        chip.classList.toggle('selected', selectedAmenityIds.has(id));
        updateSummary();
      };
    });

    const applyBtn = app.querySelector('#filter-apply');
    if (applyBtn) {
      applyBtn.onclick = async () => {
        readFiltersFromUI();
        updateSummary();
        setPanelOpen(false);
        await load(1);
      };
    }

    const resetBtn = app.querySelector('#filter-reset');
    if (resetBtn) {
      resetBtn.onclick = async () => {
        selectedAmenityIds.clear();
        currentFilters = {
          city: '',
          state: '',
          propertyType: '',
          bedroomsMin: '',
          bathroomsMin: '',
          priceMin: '',
          priceMax: '',
          areaMin: '',
          areaMax: '',
          q: '',
          amenityIds: '',
        };
        updateSummary();
        setPanelOpen(false);
        await load(1);
      };
    }

    updateSummary();
    setPanelOpen(false);
  }

  await load(1);
};
