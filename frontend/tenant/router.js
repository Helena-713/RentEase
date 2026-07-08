RE.tenantRouter = RE.router.create([
  { path: '/', render: RE.tenantPages.home },
  { path: '/properties/:id', render: RE.tenantPages.propertyDetail },
  { path: '/login', render: RE.tenantPages.auth.login },
  { path: '/register', render: RE.tenantPages.auth.register },
  {
    path: '/applications',
    guard: () => RE.auth.requireRole('TENANT'),
    render: RE.tenantPages.applications,
  },
  {
    path: '/applications/:id',
    guard: () => RE.auth.requireRole('TENANT'),
    render: RE.tenantPages.applications,
  },
  {
    path: '/profile',
    guard: () => RE.auth.requireRole('TENANT'),
    render: RE.tenantPages.profile,
  },
  {
    path: '/messages',
    guard: () => RE.auth.requireRole('TENANT'),
    render: RE.tenantPages.messages,
  },
  {
    path: '/messages/:id',
    guard: () => RE.auth.requireRole('TENANT'),
    render: RE.tenantPages.messages,
  },
]);
