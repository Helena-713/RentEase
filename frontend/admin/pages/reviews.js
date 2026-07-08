RE.adminPages = RE.adminPages || {};

RE.adminPages.reviews = async function (app, params) {
  if (params.id) {
    const res = await RE.api.reviews.get(params.id);
    const r = res.data;
    app.innerHTML = `
      <div class="page-header">
        <a href="#/reviews" class="btn btn-secondary btn-sm">&larr; Back</a>
        <h1>Review Details</h1>
      </div>
      <div class="card"><div class="card-body">
        <p><span class="rating">${RE.ui.stars(r.rating)}</span> ${RE.utils.badge(r.targetType)}</p>
        <p><strong>Property:</strong> ${r.property ? RE.utils.escapeHtml(r.property.title) : '—'}</p>
        <p><strong>Reviewer:</strong> ${r.reviewer ? RE.utils.escapeHtml(RE.utils.fullName(r.reviewer)) : '—'}</p>
        <p><strong>Reviewee:</strong> ${r.reviewee ? RE.utils.escapeHtml(RE.utils.fullName(r.reviewee)) : '—'}</p>
        <p><strong>Comment:</strong> ${r.comment ? RE.utils.escapeHtml(r.comment) : '—'}</p>
        <p><strong>Date:</strong> ${RE.utils.formatDateTime(r.createdAt)}</p>
      </div></div>`;
    return;
  }

  let page = 1;

  async function load(p) {
    page = p;
    app.innerHTML = RE.ui.loading();
    const res = await RE.api.reviews.list({ page, limit: 10 });
    const items = res.data;
    const meta = res.meta;

    app.innerHTML = `
      <div class="page-header"><h1>All Reviews</h1></div>
      <div class="table-wrap"><table>
        <thead><tr><th>Rating</th><th>Type</th><th>Property</th><th>Reviewer</th><th>Date</th><th></th></tr></thead>
        <tbody>
          ${items.map((r) => `
            <tr>
              <td><span class="rating">${RE.ui.stars(r.rating)}</span></td>
              <td>${RE.utils.badge(r.targetType)}</td>
              <td>${r.property ? RE.utils.escapeHtml(r.property.title) : '—'}</td>
              <td>${r.reviewer ? RE.utils.escapeHtml(RE.utils.fullName(r.reviewer)) : '—'}</td>
              <td>${RE.utils.formatDate(r.createdAt)}</td>
              <td><a href="#/reviews/${r.id}" class="btn btn-secondary btn-sm">View</a></td>
            </tr>`).join('')}
        </tbody>
      </table></div>
      <div id="pagination"></div>`;

    const pagEl = app.querySelector('#pagination');
    if (pagEl && meta) RE.ui.appendPagination(pagEl, meta, load);
  }

  await load(1);
};
