RE.adminRouter = RE.router.create([
  {
    path: '/',
    guard: () => RE.auth.requireRole('ADMIN'),
    render: RE.adminPages.dashboard,
  },
  { path: '/login', render: RE.adminPages.auth.login },
  {
    path: '/users',
    guard: () => RE.auth.requireRole('ADMIN'),
    render: RE.adminPages.users,
  },
  {
    path: '/verifications',
    guard: () => RE.auth.requireRole('ADMIN'),
    render: RE.adminPages.verifications,
  },
  {
    path: '/properties',
    guard: () => RE.auth.requireRole('ADMIN'),
    render: RE.adminPages.properties,
  },
  {
    path: '/applications',
    guard: () => RE.auth.requireRole('ADMIN'),
    render: RE.adminPages.applications,
  },
  {
    path: '/applications/:id',
    guard: () => RE.auth.requireRole('ADMIN'),
    render: RE.adminPages.applications,
  },
  {
    path: '/amenities',
    guard: () => RE.auth.requireRole('ADMIN'),
    render: RE.adminPages.amenities,
  },
  {
    path: '/reviews',
    guard: () => RE.auth.requireRole('ADMIN'),
    render: RE.adminPages.reviews,
  },
  {
    path: '/reviews/:id',
    guard: () => RE.auth.requireRole('ADMIN'),
    render: RE.adminPages.reviews,
  },
]);
