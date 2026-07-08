RE.landlordPages = RE.landlordPages || {};

RE.landlordPages.properties = async function (app, params) {
  if (params.id === 'new') {
    let amenities = [];
    try {
      const res = await RE.api.amenities.list({ page: 1, limit: 100 });
      amenities = res.data;
    } catch { /* ignore */ }

    app.innerHTML = `
      <div class="page-header">
        <a href="#/" class="btn btn-secondary btn-sm">&larr; Back</a>
        <h1>Add Property</h1>
      </div>
      <div class="card"><div class="card-body">
        <form id="create-form" enctype="multipart/form-data">
          <div class="form-group"><label>Title</label><input name="title" required></div>
          <div class="form-group"><label>Description</label><textarea name="description" rows="4" required></textarea></div>
          <div class="form-group"><label>Address</label><input name="address" required></div>
          <div class="form-row">
            <div class="form-group"><label>City</label><input name="city" required></div>
            <div class="form-group"><label>State</label><input name="state" required></div>
          </div>
          <div class="form-row">
            <div class="form-group"><label>Price</label><input type="number" name="price" step="0.01" required></div>
            <div class="form-group"><label>Type</label>
              <select name="propertyType" required>
                <option value="APARTMENT">Apartment</option>
                <option value="HOUSE">House</option>
                <option value="CONDO">Condo</option>
                <option value="STUDIO">Studio</option>
              </select>
            </div>
          </div>
          <div class="form-row">
            <div class="form-group"><label>Bedrooms</label><input type="number" name="bedrooms" min="0" required></div>
            <div class="form-group"><label>Bathrooms</label><input type="number" name="bathrooms" min="0" required></div>
            <div class="form-group"><label>Area (sqft)</label><input type="number" name="areaSqft" min="1" required></div>
          </div>
          <div class="form-group"><label>Images (up to 10)</label><input type="file" name="propertyImages" accept="image/*" multiple></div>
          ${amenities.length ? `<div class="form-group"><label>Amenities</label><div class="chip-list" id="amenity-chips">${amenities.map((a) => `<label class="chip"><input type="checkbox" name="amenityIds" value="${a.id}" style="display:none"><span>${RE.utils.escapeHtml(a.name)}</span></label>`).join('')}</div></div>` : ''}
          <button type="submit" class="btn btn-primary">Create Property</button>
        </form>
      </div></div>`;

    app.querySelectorAll('#amenity-chips .chip').forEach((chip) => {
      chip.onclick = () => {
        const cb = chip.querySelector('input');
        cb.checked = !cb.checked;
        chip.classList.toggle('selected', cb.checked);
      };
    });

    app.querySelector('#create-form').onsubmit = async (e) => {
      e.preventDefault();
      const form = e.target;
      const fd = new FormData();
      ['title','description','address','city','state','price','propertyType','bedrooms','bathrooms','areaSqft'].forEach((f) => {
        fd.append(f, form[f].value);
      });
      Array.from(form.propertyImages.files).forEach((f) => fd.append('propertyImages', f));
      try {
        const res = await RE.api.properties.create(fd);
        const amenityIds = Array.from(form.querySelectorAll('input[name="amenityIds"]:checked')).map((c) => c.value);
        if (amenityIds.length) {
          await RE.api.properties.setAmenities(res.data.id, { amenityIds });
        }
        RE.ui.toast('Property created! Awaiting admin approval.', 'success');
        location.hash = '#/';
      } catch (err) {
        const e2 = RE.api.handleError(err);
        if (e2.status === 403) RE.ui.toast('You must be verified to create properties. Go to Verification.', 'error');
        else RE.ui.toast(e2.message, 'error');
      }
    };
    return;
  }

  let page = 1;
  async function load(p) {
    page = p;
    app.innerHTML = RE.ui.loading();
    const res = await RE.api.properties.mine({ page, limit: 9 });
    const items = res.data;
    const meta = res.meta;

    app.innerHTML = `
      <div class="page-header" style="display:flex;justify-content:space-between;align-items:center">
        <div><h1>My Properties</h1><p>Manage your rental listings</p></div>
        <a href="#/properties/new" class="btn btn-primary">+ Add Property</a>
      </div>
      <div class="grid grid-3">
        ${items.length ? items.map((p) => {
          const img = RE.utils.propertyCover(p.images);
          return `<div class="card property-card" data-href="#/properties/${p.id}">
            ${img ? `<img class="card-img" src="${RE.uploadUrl(img)}" alt="">` : '<div class="card-img"></div>'}
            <div class="card-body">
              <h3>${RE.utils.escapeHtml(p.title)}</h3>
              <p class="price">${RE.utils.formatPrice(p.price)}</p>
              <p>${RE.utils.badge(p.status)} ${p.isApproved ? RE.utils.badge('APPROVED') : '<span class="badge badge-warning">PENDING APPROVAL</span>'}</p>
            </div>
          </div>`;
        }).join('') : RE.ui.empty('No properties yet. Add your first listing!')}
      </div>
      <div id="pagination"></div>`;

    app.querySelectorAll('.property-card').forEach((c) => {
      c.onclick = () => { location.hash = c.dataset.href; };
      RE.ui.bindZoomableImages(c, '.card-img');
    });
    const pagEl = app.querySelector('#pagination');
    if (pagEl && meta) RE.ui.appendPagination(pagEl, meta, load);
  }

  await load(1);
};
