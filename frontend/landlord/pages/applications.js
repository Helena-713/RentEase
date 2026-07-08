RE.landlordPages = RE.landlordPages || {};

RE.landlordPages.applications = async function (app, params) {
  if (params.id) {
    const res = await RE.api.applications.landlordById(params.id);
    const a = res.data;
    const tenant = a.tenant;
    const prop = a.property;
    app.innerHTML = `
      <div class="page-header">
        <a href="#/applications" class="btn btn-secondary btn-sm">&larr; Back</a>
        <h1>Application Details</h1>
      </div>
      <div class="card"><div class="card-body">
        <p>Status: ${RE.utils.badge(a.status)}</p>
        <p><strong>Property:</strong> ${prop ? RE.utils.escapeHtml(prop.title) : '—'} ${prop?.status ? RE.utils.badge(prop.status) : ''}</p>
        <p><strong>Tenant:</strong> ${tenant ? RE.utils.escapeHtml(RE.utils.fullName(tenant)) : '—'}</p>
        <p><strong>Email:</strong> ${tenant ? RE.utils.escapeHtml(tenant.email) : '—'}</p>
        <p><strong>Phone:</strong> ${tenant ? RE.utils.escapeHtml(tenant.phone) : '—'}</p>
        <p><strong>Message:</strong> ${a.message ? RE.utils.escapeHtml(a.message) : '—'}</p>
        <p><strong>Submitted:</strong> ${RE.utils.formatDateTime(a.createdAt)}</p>
        <div id="tenant-ratings" style="margin-top:1rem"></div>
        ${a.status === 'APPROVED' && prop?.status === 'RENTED' ? '<p class="meta" style="margin-top:0.5rem">This property is currently rented. Mark it available when the tenancy ends to complete the rental and leave a review.</p>' : ''}
        <div class="actions" style="margin-top:1rem">
          ${a.status === 'PENDING' ? `
            <button class="btn btn-primary" id="approve-btn">Approve</button>
            <button class="btn btn-danger" id="reject-btn">Reject</button>` : ''}
          ${a.status === 'APPROVED' && prop?.status === 'RESERVED' ? `<button class="btn btn-primary" id="rent-btn">Mark as Rented</button>` : ''}
          ${a.status === 'APPROVED' && prop?.status === 'RENTED' ? `<button class="btn btn-primary" id="mark-available">Mark as Available</button>` : ''}
        </div>
      </div></div>`;

    if (tenant?.id) {
      RE.ratings.mount(app.querySelector('#tenant-ratings'), {
        userId: tenant.id,
        targetType: 'TENANT',
        title: 'Tenant Ratings',
        emptyText: 'No tenant ratings yet.',
      });
    }

    if (a.status === 'COMPLETED' && prop?.id) {
      const reviewWrap = document.createElement('div');
      app.appendChild(reviewWrap);
      RE.reviewSection.mount(reviewWrap, {
        propertyId: prop.id,
        applicationId: a.id,
        targetType: 'TENANT',
        receivedTargetType: 'LANDLORD',
        revieweeLabel: `Review ${tenant ? RE.utils.fullName(tenant) : 'your tenant'}`,
      });
    }

    const approve = app.querySelector('#approve-btn');
    if (approve) approve.onclick = async () => {
      try { await RE.api.applications.approve(params.id); RE.ui.toast('Approved', 'success'); location.hash = '#/applications'; }
      catch (err) { RE.ui.toast(RE.api.handleError(err).message, 'error'); }
    };
    const reject = app.querySelector('#reject-btn');
    if (reject) reject.onclick = async () => {
      if (!await RE.ui.confirm('Reject this application?')) return;
      try { await RE.api.applications.reject(params.id); RE.ui.toast('Rejected', 'success'); location.hash = '#/applications'; }
      catch (err) { RE.ui.toast(RE.api.handleError(err).message, 'error'); }
    };
    const rent = app.querySelector('#rent-btn');
    if (rent) rent.onclick = async () => {
      if (!await RE.ui.confirm('Mark property as rented?')) return;
      try { await RE.api.applications.rent(params.id); RE.ui.toast('Marked as rented', 'success'); location.hash = '#/applications'; }
      catch (err) { RE.ui.toast(RE.api.handleError(err).message, 'error'); }
    };
    const availBtn = app.querySelector('#mark-available');
    if (availBtn) availBtn.onclick = async () => {
      if (!await RE.ui.confirm('Mark property as available? This completes the rental.')) return;
      try {
        await RE.api.properties.setAvailable(prop.id);
        RE.ui.toast('Rental completed — you can now review your tenant', 'success');
        RE.landlordPages.applications(app, params);
      } catch (err) { RE.ui.toast(RE.api.handleError(err).message, 'error'); }
    };
    return;
  }

  let page = 1;
  let status = '';

  async function load(p, s) {
    page = p; status = s;
    app.innerHTML = RE.ui.loading();
    const q = { page, limit: 10 };
    if (status) q.status = status;
    const res = await RE.api.applications.landlord(q);
    const items = res.data;
    const meta = res.meta;

    app.innerHTML = `
      <div class="page-header"><h1>Applications</h1><p>Review tenant applications for your properties</p></div>
      <div id="filter"></div>
      <div class="table-wrap"><table>
        <thead><tr><th>Property</th><th>Tenant</th><th>Status</th><th>Date</th><th></th></tr></thead>
        <tbody>
          ${items.length ? items.map((a) => `
            <tr>
              <td>${a.property ? RE.utils.escapeHtml(a.property.title) : '—'}</td>
              <td>${a.tenant ? RE.utils.escapeHtml(RE.utils.fullName(a.tenant)) : '—'}</td>
              <td>${RE.utils.badge(a.status)}</td>
              <td>${RE.utils.formatDate(a.createdAt)}</td>
              <td><a href="#/applications/${a.id}" class="btn btn-secondary btn-sm">View</a></td>
            </tr>`).join('') : '<tr><td colspan="5">' + RE.ui.empty('No applications') + '</td></tr>'}
        </tbody>
      </table></div>
      <div id="pagination"></div>`;

    app.querySelector('#filter').appendChild(RE.ui.filterBar(
      ['PENDING','APPROVED','REJECTED','COMPLETED'], status, (s) => load(1, s)
    ));
    const pagEl = app.querySelector('#pagination');
    if (pagEl && meta) RE.ui.appendPagination(pagEl, meta, (pg) => load(pg, status));
  }

  await load(1, '');
};
