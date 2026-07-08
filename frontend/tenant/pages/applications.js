RE.tenantPages = RE.tenantPages || {};

RE.tenantPages.applications = async function (app, params) {
  if (params.id) {
    const res = await RE.api.applications.mineById(params.id);
    const app_ = res.data;
    const prop = app_.property;
    app.innerHTML = `
      <div class="page-header">
        <a href="#/applications" class="btn btn-secondary btn-sm">&larr; Back</a>
        <h1>Application Details</h1>
      </div>
      <div class="card"><div class="card-body">
        <p>Status: ${RE.utils.badge(app_.status)}</p>
        <p><strong>Property:</strong> ${prop ? RE.utils.escapeHtml(prop.title) : '—'}</p>
        <p><strong>Address:</strong> ${prop ? RE.utils.escapeHtml(prop.address + ', ' + prop.city) : '—'}</p>
        <p><strong>Price:</strong> ${prop ? RE.utils.formatPrice(prop.price) : '—'}</p>
        <p><strong>Message:</strong> ${app_.message ? RE.utils.escapeHtml(app_.message) : '—'}</p>
        <p><strong>Submitted:</strong> ${RE.utils.formatDateTime(app_.createdAt)}</p>
        ${app_.status === 'PENDING' ? '<button class="btn btn-danger" id="withdraw-btn">Withdraw Application</button>' : ''}
      </div></div>`;

    if (app_.status === 'COMPLETED' && prop?.id) {
      const reviewWrap = document.createElement('div');
      app.appendChild(reviewWrap);
      RE.reviewSection.mount(reviewWrap, {
        propertyId: prop.id,
        targetType: 'LANDLORD',
        receivedTargetType: 'TENANT',
        revieweeLabel: 'Review your landlord',
      });
    }

    const btn = app.querySelector('#withdraw-btn');
    if (btn) {
      btn.onclick = async () => {
        if (!await RE.ui.confirm('Withdraw this application?')) return;
        try {
          await RE.api.applications.withdraw(params.id);
          RE.ui.toast('Application withdrawn', 'success');
          location.hash = '#/applications';
        } catch (err) { RE.ui.toast(RE.api.handleError(err).message, 'error'); }
      };
    }
    return;
  }

  let page = 1;
  let status = '';

  async function load(p, s) {
    page = p; status = s;
    app.innerHTML = RE.ui.loading();
    const q = { page, limit: 10 };
    if (status) q.status = status;
    const res = await RE.api.applications.mine(q);
    const items = res.data;
    const meta = res.meta;

    app.innerHTML = `
      <div class="page-header"><h1>My Applications</h1></div>
      <div id="filter"></div>
      <div class="table-wrap">
        <table>
          <thead><tr><th>Property</th><th>Status</th><th>Date</th><th></th></tr></thead>
          <tbody>
            ${items.length ? items.map((a) => `
              <tr>
                <td>${a.property ? RE.utils.escapeHtml(a.property.title) : '—'}</td>
                <td>${RE.utils.badge(a.status)}</td>
                <td>${RE.utils.formatDate(a.createdAt)}</td>
                <td><a href="#/applications/${a.id}" class="btn btn-secondary btn-sm">View</a></td>
              </tr>`).join('') : '<tr><td colspan="4">' + RE.ui.empty('No applications yet') + '</td></tr>'}
          </tbody>
        </table>
      </div>
      <div id="pagination"></div>`;

    const filterEl = app.querySelector('#filter');
    filterEl.appendChild(RE.ui.filterBar(
      ['PENDING', 'APPROVED', 'REJECTED', 'WITHDRAWN', 'COMPLETED'],
      status,
      (s) => load(1, s)
    ));
    const pagEl = app.querySelector('#pagination');
    if (pagEl && meta) RE.ui.appendPagination(pagEl, meta, (p) => load(p, status));
  }

  await load(1, '');
};
