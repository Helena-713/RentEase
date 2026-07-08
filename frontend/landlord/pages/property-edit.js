RE.landlordPages = RE.landlordPages || {};

RE.landlordPages.propertyEdit = async function (app, params) {
  const [propRes, amenRes] = await Promise.all([
    RE.api.properties.get(params.id),
    RE.api.amenities.list({ page: 1, limit: 100 }),
  ]);
  const property = propRes.data;
  const allAmenities = amenRes.data || [];
  const selectedIds = new Set((property.amenities || []).map((a) => a.id));

  let activeRentalApplicationId = null;
  if (property.status === 'RENTED') {
    try {
      const appsRes = await RE.api.applications.landlord({ status: 'APPROVED', page: 1, limit: 50 });
      const apps = appsRes.data || [];
      activeRentalApplicationId = apps.find((a) => a.propertyId === property.id)?.id || null;
    } catch {
      activeRentalApplicationId = null;
    }
  }

  app.innerHTML = `
    <div class="page-header">
      <a href="#/" class="btn btn-secondary btn-sm">&larr; Back</a>
      <h1>Edit Property</h1>
      <p>${RE.utils.badge(property.status)} ${property.isApproved ? '' : '<span class="badge badge-warning">PENDING APPROVAL</span>'}</p>
    </div>
    <div class="two-col">
      <div class="card"><div class="card-body">
        <h3>Details</h3>
        <form id="edit-form">
          <div class="form-group"><label>Title</label><input name="title" value="${RE.utils.escapeHtml(property.title)}" required></div>
          <div class="form-group"><label>Description</label><textarea name="description" rows="3" required>${RE.utils.escapeHtml(property.description)}</textarea></div>
          <div class="form-group"><label>Address</label><input name="address" value="${RE.utils.escapeHtml(property.address)}" required></div>
          <div class="form-row">
            <div class="form-group"><label>City</label><input name="city" value="${RE.utils.escapeHtml(property.city)}" required></div>
            <div class="form-group"><label>State</label><input name="state" value="${RE.utils.escapeHtml(property.state)}" required></div>
          </div>
          <div class="form-row">
            <div class="form-group"><label>Price</label><input type="number" name="price" step="0.01" value="${property.price}" required></div>
            <div class="form-group"><label>Type</label>
              <select name="propertyType">${['APARTMENT','HOUSE','CONDO','STUDIO'].map((t) => `<option value="${t}" ${property.propertyType===t?'selected':''}>${t}</option>`).join('')}</select>
            </div>
          </div>
          <div class="form-row">
            <div class="form-group"><label>Bedrooms</label><input type="number" name="bedrooms" value="${property.bedrooms}"></div>
            <div class="form-group"><label>Bathrooms</label><input type="number" name="bathrooms" value="${property.bathrooms}"></div>
            <div class="form-group"><label>Area</label><input type="number" name="areaSqft" value="${property.areaSqft}"></div>
          </div>
          <button type="submit" class="btn btn-primary">Save Changes</button>
        </form>
      </div></div>
      <div>
        <div class="card" style="margin-bottom:1rem"><div class="card-body">
          <h3>Images</h3>
          <div class="gallery" id="image-gallery">
            ${(property.images||[]).map((img) => `
              <div style="position:relative">
                <img src="${RE.uploadUrl(img.imageUrl)}" alt="">
                <button class="btn btn-danger btn-sm" style="margin-top:4px;width:100%" data-del-img="${img.id}">Delete</button>
              </div>`).join('') || '<p class="meta">No images</p>'}
          </div>
          <form id="img-form" style="margin-top:1rem">
            <div class="form-group"><label>Add Images</label><div id="property-images-picker"></div></div>
            <button type="submit" class="btn btn-secondary btn-sm">Upload</button>
          </form>
        </div></div>
        <div class="card" style="margin-bottom:1rem"><div class="card-body">
          <h3>Amenities</h3>
          <div class="chip-list" id="amenity-chips">
            ${allAmenities.map((a) => `<button type="button" class="chip ${selectedIds.has(a.id)?'selected':''}" data-amenity="${a.id}">${RE.utils.escapeHtml(a.name)}</button>`).join('')}
          </div>
          <button class="btn btn-secondary btn-sm" id="save-amenities" style="margin-top:0.75rem">Save Amenities</button>
        </div></div>
        ${property.status === 'RENTED' ? `
          <div class="card"><div class="card-body">
            <h3>Mark Available</h3>
            <p class="meta">Completes the rental cycle and allows reviews.</p>
            <button class="btn btn-primary" id="mark-available">Mark as Available</button>
          </div></div>` : ''}
      </div>
    </div>`;

  RE.ui.bindZoomableImages(app.querySelector('#image-gallery'));

  const selected = new Set(selectedIds);
  app.querySelectorAll('#amenity-chips .chip').forEach((chip) => {
    chip.onclick = () => {
      const id = chip.dataset.amenity;
      if (selected.has(id)) { selected.delete(id); chip.classList.remove('selected'); }
      else { selected.add(id); chip.classList.add('selected'); }
    };
  });

  app.querySelector('#save-amenities').onclick = async () => {
    try {
      await RE.api.properties.setAmenities(params.id, { amenityIds: Array.from(selected) });
      RE.ui.toast('Amenities updated', 'success');
    } catch (err) { RE.ui.toast(RE.api.handleError(err).message, 'error'); }
  };

  app.querySelector('#edit-form').onsubmit = async (e) => {
    e.preventDefault();
    const f = e.target;
    const fd = new FormData();
    ['title','description','address','city','state','price','propertyType','bedrooms','bathrooms','areaSqft'].forEach((k) => fd.append(k, f[k].value));
    try {
      await RE.api.properties.update(params.id, fd);
      RE.ui.toast('Property updated', 'success');
    } catch (err) { RE.ui.toast(RE.api.handleError(err).message, 'error'); }
  };

  const maxNewImages = Math.max(0, 10 - (property.images?.length || 0));
  const imagePicker = RE.ui.mountStagedImagePicker(
    app.querySelector('#property-images-picker'),
    {
      maxFiles: maxNewImages,
      emptyText: maxNewImages > 0
        ? 'No images staged yet. Click Add images to choose files.'
        : 'Maximum images reached.',
    }
  );

  app.querySelector('#img-form').onsubmit = async (e) => {
    e.preventDefault();
    const imageFiles = imagePicker.getFiles();

    if (!imageFiles.length) {
      RE.ui.toast('Please add at least one image to upload.', 'error');
      return;
    }

    const fd = new FormData();
    imageFiles.forEach((f) => fd.append('propertyImages', f));
    try {
      await RE.api.properties.update(params.id, fd);
      RE.ui.toast('Images uploaded', 'success');
      imagePicker.clear();
      RE.landlordPages.propertyEdit(app, params);
    } catch (err) { RE.ui.toast(RE.api.handleError(err).message, 'error'); }
  };

  app.querySelectorAll('[data-del-img]').forEach((btn) => {
    btn.onclick = async () => {
      if (!await RE.ui.confirm('Delete this image?')) return;
      try {
        await RE.api.properties.deleteImage(params.id, btn.dataset.delImg);
        RE.ui.toast('Image deleted', 'success');
        RE.landlordPages.propertyEdit(app, params);
      } catch (err) { RE.ui.toast(RE.api.handleError(err).message, 'error'); }
    };
  });

  const availBtn = app.querySelector('#mark-available');
  if (availBtn) {
    availBtn.onclick = async () => {
      if (!await RE.ui.confirm('Mark property as available? This completes the rental.')) return;
      try {
        await RE.api.properties.setAvailable(params.id);
        RE.ui.toast('Rental completed — you can now review your tenant', 'success');
        if (activeRentalApplicationId) location.hash = '#/applications/' + activeRentalApplicationId;
        else location.hash = '#/applications';
      } catch (err) { RE.ui.toast(RE.api.handleError(err).message, 'error'); }
    };
  }
};
