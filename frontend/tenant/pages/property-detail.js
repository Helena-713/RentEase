RE.tenantPages = RE.tenantPages || {};

RE.tenantPages.propertyDetail = async function (app, params) {
  const propRes = await RE.api.properties.public(params.id);
  const property = propRes.data;
  const landlord = property.landlord;
  const images = property.images || [];
  const amenities = property.amenities || [];
  const isTenant = RE.auth.isLoggedIn() && RE.auth.hasRole('TENANT');

  const coverImage = images.find((i) => i.isCover) || images[0];
  const galleryImages = coverImage ? images.filter((i) => i.id !== coverImage.id) : [];

  app.innerHTML = `
    <div class="property-detail">
      <div class="page-header">
        <a href="#/" class="btn btn-secondary btn-sm">&larr; Back to browse</a>
      </div>

      ${coverImage ? `
        <div class="property-hero">
          <img class="zoomable-image" src="${RE.uploadUrl(coverImage.imageUrl)}" alt="${RE.utils.escapeHtml(property.title)}">
        </div>` : ''}

      <div class="property-detail-grid">
        <div class="property-detail-main">
          <div class="card property-section">
            <div class="card-body">
              <h1>${RE.utils.escapeHtml(property.title)}</h1>
              <p class="property-overview-price">
                ${RE.utils.formatPrice(property.price)} <span class="meta">/month</span>
              </p>
              <p class="property-overview-meta">
                ${RE.utils.escapeHtml(property.address)}, ${RE.utils.escapeHtml(property.city)}, ${RE.utils.escapeHtml(property.state)}
              </p>
              <div class="property-badges">
                ${RE.utils.badge(property.status)}
                ${RE.utils.badge(property.propertyType)}
              </div>
              <div class="property-stats">
                <div class="stat-card">
                  <div class="value">${property.bedrooms}</div>
                  <div class="label">Bedrooms</div>
                </div>
                <div class="stat-card">
                  <div class="value">${property.bathrooms}</div>
                  <div class="label">Bathrooms</div>
                </div>
                <div class="stat-card">
                  <div class="value">${property.areaSqft}</div>
                  <div class="label">Sq Ft</div>
                </div>
                <div class="stat-card">
                  <div class="value">${RE.utils.escapeHtml(property.propertyType)}</div>
                  <div class="label">Type</div>
                </div>
              </div>
            </div>
          </div>

          ${galleryImages.length ? `
            <div class="card property-section">
              <div class="card-body">
                <h3 class="property-section-title">More Photos</h3>
                <div class="property-gallery-thumbs gallery">
                  ${galleryImages.map((i) => `<img class="zoomable-image" src="${RE.uploadUrl(i.imageUrl)}" alt="">`).join('')}
                </div>
              </div>
            </div>` : ''}

          <div class="card property-section">
            <div class="card-body">
              <h3 class="property-section-title">Description</h3>
              <p>${RE.utils.escapeHtml(property.description)}</p>
            </div>
          </div>

          ${amenities.length ? `
            <div class="card property-section">
              <div class="card-body">
                <h3 class="property-section-title">Amenities</h3>
                <div class="chip-list">
                  ${amenities.map((a) => `<span class="chip">${RE.utils.escapeHtml(a.name)}</span>`).join('')}
                </div>
              </div>
            </div>` : ''}

          ${landlord || property.landlordId ? `
            <div class="card property-section">
              <div class="card-body">
                <h3 class="property-section-title">Landlord Ratings</h3>
                <div id="landlord-ratings"></div>
              </div>
            </div>` : ''}
        </div>

        <div class="property-detail-sidebar">
          ${landlord ? `
            <div class="card">
              <div class="card-body">
                <h3 class="property-section-title">Landlord</h3>
                <p><strong>${RE.utils.escapeHtml(RE.utils.fullName(landlord))}</strong></p>
                <p class="meta">${RE.utils.escapeHtml(landlord.email)}</p>
                <p class="meta">${RE.utils.escapeHtml(landlord.phone)}</p>
              </div>
            </div>` : ''}
          ${isTenant && landlord ? `
            <div class="card">
              <div class="card-body">
                <button type="button" class="btn btn-secondary btn-block" id="message-landlord-btn">Message Landlord</button>
              </div>
            </div>` : ''}
          <div class="card">
            <div class="card-body">
              <h3 class="property-section-title">Apply for this property</h3>
              ${isTenant ? `
                <form id="apply-form">
                  <div class="form-group">
                    <label>Message (optional)</label>
                    <textarea name="message" rows="3" placeholder="Tell the landlord about yourself..."></textarea>
                  </div>
                  <button type="submit" class="btn btn-primary btn-block">Submit Application</button>
                </form>` : `
                <p class="meta">${RE.auth.isLoggedIn() ? 'Only tenants can apply.' : 'Please log in as a tenant to apply.'}</p>
                <a href="#/login" class="btn btn-primary btn-block">Log In</a>`}
            </div>
          </div>
        </div>
      </div>
    </div>`;

  const landlordId = landlord?.id || property.landlordId;
  if (landlordId) {
    RE.ratings.mount(app.querySelector('#landlord-ratings'), {
      userId: landlordId,
      targetType: 'LANDLORD',
      title: 'Landlord Ratings',
      emptyText: 'No landlord ratings yet.',
      embedded: true,
    });
  }

  RE.ui.bindZoomableImages(app, '.property-hero img, .property-gallery-thumbs img');

  if (isTenant) {
    const msgBtn = app.querySelector('#message-landlord-btn');
    if (msgBtn) {
      msgBtn.onclick = async () => {
        try {
          const res = await RE.api.conversations.create({ propertyId: property.id });
          location.hash = `#/messages/${res.data.id}`;
        } catch (err) {
          RE.ui.toast(RE.api.handleError(err).message, 'error');
        }
      };
    }

    const form = app.querySelector('#apply-form');
    form.onsubmit = async (e) => {
      e.preventDefault();
      try {
        await RE.api.applications.create({
          propertyId: property.id,
          message: form.message.value || undefined,
        });
        RE.ui.toast('Application submitted!', 'success');
        location.hash = '#/applications';
      } catch (err) {
        RE.ui.toast(RE.api.handleError(err).message, 'error');
      }
    };
  }
};
