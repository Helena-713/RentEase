RE.adminPages = RE.adminPages || {};

RE.adminPages.verifications = async function (app) {
  let page = 1;

  async function load(p) {
    page = p;
    app.innerHTML = RE.ui.loading();
    const res = await RE.api.verifications.pending({ page, limit: 10 });
    const items = res.data;
    const meta = res.meta;

    app.innerHTML = `
      <div class="page-header"><h1>Pending Verifications</h1></div>
      <div class="table-wrap"><table>
        <thead><tr><th>Landlord</th><th>Email</th><th>Status</th><th>Submitted</th><th>Actions</th></tr></thead>
        <tbody>
          ${items.length ? items.map((v) => `
            <tr>
              <td>${v.user ? RE.utils.escapeHtml(RE.utils.fullName(v.user)) : '—'}</td>
              <td>${v.user ? RE.utils.escapeHtml(v.user.email) : '—'}</td>
              <td>${RE.utils.badge(v.status)}</td>
              <td>${RE.utils.formatDate(v.createdAt)}</td>
              <td class="actions">
                ${v.verificationDocument ? `<a href="${RE.uploadUrl(v.verificationDocument)}" target="_blank" class="btn btn-secondary btn-sm">View Doc</a>` : ''}
                <button class="btn btn-primary btn-sm" data-approve="${v.id}">Approve</button>
                <button class="btn btn-danger btn-sm" data-reject="${v.id}">Reject</button>
              </td>
            </tr>`).join('') : '<tr><td colspan="5">' + RE.ui.empty('No pending verifications') + '</td></tr>'}
        </tbody>
      </table></div>
      <div id="pagination"></div>`;

    const pagEl = app.querySelector('#pagination');
    if (pagEl && meta) RE.ui.appendPagination(pagEl, meta, load);

    app.querySelectorAll('[data-approve]').forEach((btn) => {
      btn.onclick = async () => {
        try {
          await RE.api.verifications.review(btn.dataset.approve, { status: 'VERIFIED' });
          RE.ui.toast('Verification approved', 'success');
          load(page);
        } catch (err) { RE.ui.toast(RE.api.handleError(err).message, 'error'); }
      };
    });

    app.querySelectorAll('[data-reject]').forEach((btn) => {
      btn.onclick = async () => {
        const reason = prompt('Rejection reason:');
        if (!reason) return;
        try {
          await RE.api.verifications.review(btn.dataset.reject, { status: 'REJECTED', rejectionReason: reason });
          RE.ui.toast('Verification rejected', 'success');
          load(page);
        } catch (err) { RE.ui.toast(RE.api.handleError(err).message, 'error'); }
      };
    });
  }

  await load(1);
};
