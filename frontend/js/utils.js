window.RE = window.RE || {};

RE.utils = {
  escapeHtml(str) {
    if (str == null) return '';
    const div = document.createElement('div');
    div.textContent = String(str);
    return div.innerHTML;
  },

  formatPrice(price) {
    if (price == null || price === '') return '—';
    const n = typeof price === 'number' ? price : Number(price);
    if (!Number.isFinite(n)) return '—';
    return `${new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(n)} birr`;
  },

  formatDate(dateStr) {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric',
    });
  },

  formatDateTime(dateStr) {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  },

  badgeClass(status) {
    const map = {
      PENDING: 'badge-warning',
      APPROVED: 'badge-success',
      VERIFIED: 'badge-success',
      REJECTED: 'badge-danger',
      WITHDRAWN: 'badge-neutral',
      CANCELLED: 'badge-danger',
      COMPLETED: 'badge-info',
      AVAILABLE: 'badge-success',
      RESERVED: 'badge-warning',
      RENTED: 'badge-info',
      INACTIVE: 'badge-neutral',
    };
    return map[status] || 'badge-neutral';
  },

  badge(status) {
    const cls = RE.utils.badgeClass(status);
    return `<span class="badge ${cls}">${RE.utils.escapeHtml(status)}</span>`;
  },

  fullName(user) {
    if (!user) return '—';
    return `${user.firstName} ${user.lastName}`;
  },

  propertyCover(images) {
    if (!images || !images.length) return '';
    const cover = images.find((i) => i.isCover) || images[0];
    return cover.imageUrl;
  },

  parseHash() {
    const hash = location.hash.slice(1) || '/';
    const parts = hash.split('/').filter(Boolean);
    return { path: '/' + parts.join('/'), parts };
  },

  buildQuery(params) {
    const q = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v != null && v !== '') q.set(k, v);
    });
    const s = q.toString();
    return s ? '?' + s : '';
  },
};
