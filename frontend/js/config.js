window.RE = window.RE || {};

RE.config = {
  API_ORIGIN: 'http://localhost:3000',
  get API_BASE() { return this.API_ORIGIN + '/api'; },
  PORTALS: {
    tenant: '/tenant/',
    landlord: '/landlord/',
    admin: '/admin/',
    home: '/',
  },
};

RE.uploadUrl = function (path) {
  if (!path) return '';
  if (path.startsWith('http')) return path;
  return RE.config.API_ORIGIN + path;
};
