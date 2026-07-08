RE.adminPages = RE.adminPages || {};

RE.adminPages.properties = async function (app) {
  let page = 1;

  async function load(p) {
    page = p;
    app.innerHTML = RE.ui.loading();
    const res = await RE.api.properties.pending({ page, limit: 10 });
    const items = res.data;
    const meta = res.meta;

    app.innerHTML = `
      <div class="page-header"><h1>Pending Properties</h1></div>
      <div class="table-wrap"><table>
        <thead><tr><th>Title</th><th>City</th><th>Price</th><th>Landlord</th><th>Actions</th></tr></thead>
        <tbody>
          ${items.length ? items.map((p) => `
            <tr>
              <td>${RE.utils.escapeHtml(p.title)}</td>
              <td>${RE.utils.escapeHtml(p.city)}</td>
              <td>${RE.utils.formatPrice(p.price)}</td>
              <td>${p.landlord ? RE.utils.escapeHtml(RE.utils.fullName(p.landlord)) : '—'}</td>
              <td class="actions">
                <button class="btn btn-primary btn-sm" data-approve="${p.id}">Approve</button>
                <button class="btn btn-danger btn-sm" data-reject="${p.id}">Reject</button>
              </td>
            </tr>`).join('') : '<tr><td colspan="5">' + RE.ui.empty('No pending properties') + '</td></tr>'}
        </tbody>
      </table></div>
      <div id="pagination"></div>`;

    const pagEl = app.querySelector('#pagination');
    if (pagEl && meta) RE.ui.appendPagination(pagEl, meta, load);

    app.querySelectorAll('[data-approve]').forEach((btn) => {
      btn.onclick = async () => {
        try {
          await RE.api.properties.review(btn.dataset.approve, { isApproved: true });
          RE.ui.toast('Property approved', 'success');
          load(page);
        } catch (err) { RE.ui.toast(RE.api.handleError(err).message, 'error'); }
      };
    });

    app.querySelectorAll('[data-reject]').forEach((btn) => {
      btn.onclick = async () => {
        const reason = prompt('Rejection reason:');
        if (!reason) return;
        try {
          await RE.api.properties.review(btn.dataset.reject, { isApproved: false, rejectionReason: reason });
          RE.ui.toast('Property rejected', 'success');
          load(page);
        } catch (err) { RE.ui.toast(RE.api.handleError(err).message, 'error'); }
      };
    });
  }

  await load(1);
};
