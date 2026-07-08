RE.adminPages = RE.adminPages || {};

RE.adminPages.dashboard = async function (app) {
  const results = await Promise.allSettled([
    RE.api.users.list({ page: 1, limit: 1 }),
    RE.api.verifications.pending({ page: 1, limit: 1 }),
    RE.api.properties.pending({ page: 1, limit: 1 }),
    RE.api.applications.list({ page: 1, limit: 1 }),
    RE.api.amenities.list({ page: 1, limit: 1 }),
    RE.api.reviews.list({ page: 1, limit: 1 }),
  ]);

  const totals = results.map((r) => (r.status === 'fulfilled' ? r.value.meta?.total ?? 0 : '—'));

  app.innerHTML = `
    <div class="page-header"><h1>Admin Dashboard</h1><p>Platform overview and quick links</p></div>
    <div class="stat-cards">
      <div class="stat-card"><div class="value">${totals[0]}</div><div class="label">Users</div></div>
      <div class="stat-card"><div class="value">${totals[1]}</div><div class="label">Pending Verifications</div></div>
      <div class="stat-card"><div class="value">${totals[2]}</div><div class="label">Pending Properties</div></div>
      <div class="stat-card"><div class="value">${totals[3]}</div><div class="label">Applications</div></div>
      <div class="stat-card"><div class="value">${totals[4]}</div><div class="label">Amenities</div></div>
      <div class="stat-card"><div class="value">${totals[5]}</div><div class="label">Reviews</div></div>
    </div>
    <div class="grid grid-3">
      <a href="#/users" class="card" style="text-decoration:none"><div class="card-body"><h3>Users</h3><p class="meta">Manage all user accounts</p></div></a>
      <a href="#/verifications" class="card" style="text-decoration:none"><div class="card-body"><h3>Verifications</h3><p class="meta">Review landlord documents</p></div></a>
      <a href="#/properties" class="card" style="text-decoration:none"><div class="card-body"><h3>Properties</h3><p class="meta">Approve property listings</p></div></a>
      <a href="#/applications" class="card" style="text-decoration:none"><div class="card-body"><h3>Applications</h3><p class="meta">View all applications</p></div></a>
      <a href="#/amenities" class="card" style="text-decoration:none"><div class="card-body"><h3>Amenities</h3><p class="meta">Manage amenity catalog</p></div></a>
      <a href="#/reviews" class="card" style="text-decoration:none"><div class="card-body"><h3>Reviews</h3><p class="meta">View all reviews</p></div></a>
    </div>`;
};
