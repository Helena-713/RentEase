RE.landlordRouter = RE.router.create([
  {
    path: '/',
    guard: () => RE.auth.requireAuth() && RE.auth.requireRole('LAND_LORD'),
    render: RE.landlordPages.properties,
  },
  {
    path: '/properties/new',
    guard: () => RE.auth.requireRole('LAND_LORD'),
    render: (app) => RE.landlordPages.properties(app, { id: 'new' }),
  },
  {
    path: '/properties/:id',
    guard: () => RE.auth.requireRole('LAND_LORD'),
    render: (app, params) => {
      if (params.id === 'new') return RE.landlordPages.properties(app, params);
      return RE.landlordPages.propertyEdit(app, params);
    },
  },
  { path: '/login', render: RE.landlordPages.auth.login },
  { path: '/register', render: RE.landlordPages.auth.register },
  {
    path: '/applications',
    guard: () => RE.auth.requireRole('LAND_LORD'),
    render: RE.landlordPages.applications,
  },
  {
    path: '/applications/:id',
    guard: () => RE.auth.requireRole('LAND_LORD'),
    render: RE.landlordPages.applications,
  },
  {
    path: '/verification',
    guard: () => {
      if (!RE.auth.requireRole('LAND_LORD')) return false;
      if (RE.auth.isLandlordVerified()) {
        location.hash = '#/';
        return false;
      }
      return true;
    },
    render: RE.landlordPages.verification,
  },
  {
    path: '/profile',
    guard: () => RE.auth.requireRole('LAND_LORD'),
    render: RE.landlordPages.profile,
  },
]);
