window.RE = window.RE || {};

const AUTH_KEY = 'rentease_auth';

RE.auth = {
  _portal: null,
  _landlordVerification: null,

  setPortal(portal) { this._portal = portal; },

  clearLandlordVerificationCache() {
    this._landlordVerification = null;
  },

  getSession() {
    try {
      const raw = localStorage.getItem(AUTH_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch { return null; }
  },

  saveSession(data) {
    localStorage.setItem(AUTH_KEY, JSON.stringify(data));
  },

  clearSession() {
    localStorage.removeItem(AUTH_KEY);
  },

  getToken() {
    return this.getSession()?.token || null;
  },

  getUser() {
    return this.getSession()?.user || null;
  },

  isLoggedIn() {
    const s = this.getSession();
    if (!s?.token) return false;
    if (s.expiresAt && new Date(s.expiresAt) < new Date()) {
      this.clearSession();
      return false;
    }
    return true;
  },

  hasRole(role) {
    return this.getUser()?.role === role;
  },

  login(data) {
    this.saveSession({ token: data.token, expiresAt: data.expiresAt, user: data.user });
  },

  logout() {
    this.clearSession();
    this.clearLandlordVerificationCache();
    location.hash = '#/login';
  },

  getPortalForRole(role) {
    const map = { TENANT: 'tenant', LAND_LORD: 'landlord', ADMIN: 'admin' };
    return map[role] || null;
  },

  redirectToPortal(role) {
    const portal = this.getPortalForRole(role);
    if (portal) location.href = RE.config.PORTALS[portal];
  },

  requireRole(role, options = {}) {
    if (!this.isLoggedIn()) {
      if (!options.publicRoute) location.hash = '#/login';
      return false;
    }
    if (this.getUser().role !== role) {
      RE.ui.toast('Access denied. Redirecting to your portal.', 'error');
      setTimeout(() => this.redirectToPortal(this.getUser().role), 1500);
      return false;
    }
    return true;
  },

  requireAuth() {
    if (!this.isLoggedIn()) {
      location.hash = '#/login';
      return false;
    }
    return true;
  },

  async fetchLandlordVerification({ refresh = false } = {}) {
    if (!this.hasRole('LAND_LORD')) return null;
    if (!refresh && this._landlordVerification) return this._landlordVerification;

    const res = await RE.api.users.me();
    const verification = res.data.landlordVerification || null;
    this._landlordVerification = verification;
    if (verification) {
      sessionStorage.setItem('landlord_verification', JSON.stringify(verification));
    }
    return verification;
  },

  isLandlordVerified() {
    return this._landlordVerification?.status === 'VERIFIED';
  },
};
