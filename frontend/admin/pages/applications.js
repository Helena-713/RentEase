RE.adminPages = RE.adminPages || {};

RE.adminPages.applications = async function (app, params) {
  if (params.id) {
    const res = await RE.api.applications.get(params.id);
    const a = res.data;
    app.innerHTML = `
      <div class="page-header">
        <a href="#/applications" class="btn btn-secondary btn-sm">&larr; Back</a>
        <h1>Application Details</h1>
      </div>
      <div class="card"><div class="card-body">
        <p>Status: ${RE.utils.badge(a.status)}</p>
        <p><strong>Property:</strong> ${a.property ? RE.utils.escapeHtml(a.property.title) : '—'}</p>
        <p><strong>Tenant:</strong> ${a.tenant ? RE.utils.escapeHtml(RE.utils.fullName(a.tenant)) : '—'}</p>
        <p><strong>Message:</strong> ${a.message ? RE.utils.escapeHtml(a.message) : '—'}</p>
        <p><strong>Submitted:</strong> ${RE.utils.formatDateTime(a.createdAt)}</p>
        ${!['CANCELLED','COMPLETED','WITHDRAWN','REJECTED'].includes(a.status) ? `
          <button class="btn btn-danger" id="cancel-btn">Cancel Application</button>` : ''}
      </div></div>`;
    const cancelBtn = app.querySelector('#cancel-btn');
    if (cancelBtn) {
      cancelBtn.onclick = async () => {
        if (!await RE.ui.confirm('Cancel this application?')) return;
        try {
          await RE.api.applications.cancel(params.id);
          RE.ui.toast('Application cancelled', 'success');
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
    const res = await RE.api.applications.list(q);
    const items = res.data;
    const meta = res.meta;

    app.innerHTML = `
      <div class="page-header"><h1>All Applications</h1></div>
      <div id="filter"></div>
      <div class="table-wrap"><table>
        <thead><tr><th>Property</th><th>Tenant</th><th>Status</th><th>Date</th><th></th></tr></thead>
        <tbody>
          ${items.map((a) => `
            <tr>
              <td>${a.property ? RE.utils.escapeHtml(a.property.title) : '—'}</td>
              <td>${a.tenant ? RE.utils.escapeHtml(RE.utils.fullName(a.tenant)) : '—'}</td>
              <td>${RE.utils.badge(a.status)}</td>
              <td>${RE.utils.formatDate(a.createdAt)}</td>
              <td><a href="#/applications/${a.id}" class="btn btn-secondary btn-sm">View</a></td>
            </tr>`).join('')}
        </tbody>
      </table></div>
      <div id="pagination"></div>`;

    app.querySelector('#filter').appendChild(RE.ui.filterBar(
      ['PENDING','APPROVED','REJECTED','WITHDRAWN','CANCELLED','COMPLETED'], status, (s) => load(1, s)
    ));
    const pagEl = app.querySelector('#pagination');
    if (pagEl && meta) RE.ui.appendPagination(pagEl, meta, (pg) => load(pg, status));
  }

  await load(1, '');
};
