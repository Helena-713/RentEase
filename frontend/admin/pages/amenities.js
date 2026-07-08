RE.adminPages = RE.adminPages || {};

RE.adminPages.amenities = async function (app) {
  let page = 1;

  async function load(p) {
    page = p;
    app.innerHTML = RE.ui.loading();
    const res = await RE.api.amenities.list({ page, limit: 20 });
    const items = res.data;
    const meta = res.meta;

    app.innerHTML = `
      <div class="page-header"><h1>Amenities</h1></div>
      <div class="card" style="max-width:400px;margin-bottom:1.5rem"><div class="card-body">
        <h3>Add Amenity</h3>
        <form id="add-form" style="display:flex;gap:0.5rem">
          <input name="name" placeholder="Amenity name" required style="flex:1">
          <button type="submit" class="btn btn-primary">Add</button>
        </form>
      </div></div>
      <div class="chip-list">
        ${items.map((a) => `<span class="chip">${RE.utils.escapeHtml(a.name)}</span>`).join('') || RE.ui.empty('No amenities')}
      </div>
      <div id="pagination"></div>`;

    app.querySelector('#add-form').onsubmit = async (e) => {
      e.preventDefault();
      try {
        await RE.api.amenities.create({ name: e.target.name.value });
        RE.ui.toast('Amenity created', 'success');
        load(page);
      } catch (err) { RE.ui.toast(RE.api.handleError(err).message, 'error'); }
    };

    const pagEl = app.querySelector('#pagination');
    if (pagEl && meta) RE.ui.appendPagination(pagEl, meta, load);
  }

  await load(1);
};
