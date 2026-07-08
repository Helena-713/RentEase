RE.tenantPages = RE.tenantPages || {};

RE.tenantPages.home = async function (app) {
  let page = 1;
  const limit = 9;

  async function load(p) {
    page = p;
    app.innerHTML = RE.ui.loading();
    const res = await RE.api.properties.list({ page, limit });
    const properties = res.data;
    const meta = res.meta;

    app.innerHTML = `
      <div class="page-header">
        <h1>Browse Properties</h1>
        <p>Find your next rental home</p>
      </div>
      <div class="grid grid-3" id="property-grid">
        ${properties.length ? properties.map((p) => RE.ui.propertyCard(p, '#/properties/')).join('') : RE.ui.empty('No properties available')}
      </div>
      <div id="pagination"></div>`;

    const grid = app.querySelector('#property-grid');
    if (grid) RE.ui.bindPropertyCards(grid, (href) => { location.hash = href; });
    const pagEl = app.querySelector('#pagination');
    if (pagEl && meta) RE.ui.appendPagination(pagEl, meta, load);
  }

  await load(1);
};
