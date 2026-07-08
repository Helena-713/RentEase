window.RE = window.RE || {};

RE.api = (function () {
  let client = null;
  let loginPath = '#/login';

  function getClient() {
    if (!client) {
      client = axios.create({ baseURL: RE.config.API_BASE });
      client.interceptors.request.use((config) => {
        const token = RE.auth.getToken();
        if (token) config.headers.Authorization = 'Bearer ' + token;
        return config;
      });
      client.interceptors.response.use(
        (res) => res,
        (err) => {
          if (err.response?.status === 401 && !err.config?.skipAuthRedirect) {
            RE.auth.clearSession();
            if (!location.hash.includes('/login')) location.hash = loginPath;
          }
          return Promise.reject(err);
        }
      );
    }
    return client;
  }

  function setLoginPath(path) { loginPath = path; }

  async function request(method, url, data, config = {}) {
    const headers = { ...(config.headers || {}) };
    if (data instanceof FormData) {
      delete headers['Content-Type'];
    }
    const res = await getClient().request({ method, url, data, ...config, headers });
    return res.data;
  }

  function handleError(err) {
    const msg = err.response?.data?.message || err.message || 'Request failed';
    const errors = err.response?.data?.errors || [];
    return { message: msg, errors, status: err.response?.status };
  }

  return {
    setLoginPath,
    handleError,

    health: () => request('GET', '/health'),

    auth: {
      login: (body) => request('POST', '/auth/login', body),
      register: (formData) => request('POST', '/auth/register', formData),
    },

    users: {
      me: () => request('GET', '/users/me'),
      updateMe: (formData) => request('PATCH', '/users/me', formData),
      list: (q) => request('GET', '/users' + RE.utils.buildQuery(q)),
      update: (id, formData) => request('PATCH', `/users/${id}`, formData),
      reviews: (id, q) => request('GET', `/users/${id}/reviews` + RE.utils.buildQuery(q)),
      uploadVerification: (formData) => request('PATCH', '/users/me/landlord-verification', formData),
    },

    properties: {
      list: (q) => request('GET', '/properties' + RE.utils.buildQuery(q)),
      public: (id) => request('GET', `/properties/public/${id}`),
      mine: (q) => request('GET', '/properties/mine' + RE.utils.buildQuery(q)),
      get: (id) => request('GET', `/properties/${id}`),
      create: (formData) => request('POST', '/properties', formData),
      update: (id, formData) => request('PATCH', `/properties/${id}`, formData),
      pending: (q) => request('GET', '/properties/pending' + RE.utils.buildQuery(q)),
      review: (id, body) => request('PATCH', `/properties/${id}/review`, body),
      setAvailable: (id) => request('PATCH', `/properties/${id}/available`),
      setAmenities: (id, body) => request('PUT', `/properties/${id}/amenities`, body),
      deleteImage: (id, imageId) => request('DELETE', `/properties/${id}/images/${imageId}`),
    },

    applications: {
      create: (body) => request('POST', '/applications', body),
      mine: (q) => request('GET', '/applications/mine' + RE.utils.buildQuery(q)),
      mineById: (id) => request('GET', `/applications/mine/${id}`),
      withdraw: (id) => request('PATCH', `/applications/${id}/withdraw`),
      landlord: (q) => request('GET', '/applications/landlord' + RE.utils.buildQuery(q)),
      landlordById: (id) => request('GET', `/applications/landlord/${id}`),
      approve: (id) => request('PATCH', `/applications/${id}/approve`),
      reject: (id) => request('PATCH', `/applications/${id}/reject`),
      rent: (id) => request('PATCH', `/applications/${id}/rent`),
      list: (q) => request('GET', '/applications' + RE.utils.buildQuery(q)),
      get: (id) => request('GET', `/applications/${id}`),
      cancel: (id) => request('PATCH', `/applications/${id}/cancel`),
    },

    reviews: {
      create: (body) => request('POST', '/reviews', body),
      mine: (q) => request('GET', '/reviews/mine' + RE.utils.buildQuery(q)),
      received: (q) => request('GET', '/reviews/received' + RE.utils.buildQuery(q)),
      list: (q) => request('GET', '/reviews' + RE.utils.buildQuery(q)),
      get: (id) => request('GET', `/reviews/${id}`),
    },

    amenities: {
      list: (q) => request('GET', '/amenities' + RE.utils.buildQuery(q)),
      get: (id) => request('GET', `/amenities/${id}`),
      create: (body) => request('POST', '/amenities', body),
    },

    verifications: {
      pending: (q) => request('GET', '/landlord-verifications/pending' + RE.utils.buildQuery(q)),
      review: (id, body) => request('PATCH', `/landlord-verifications/${id}/review`, body),
    },

    conversations: {
      create: (body) => request('POST', '/conversations', body),
      mine: (q) => request('GET', '/conversations/mine' + RE.utils.buildQuery(q)),
      landlord: (q) => request('GET', '/conversations/landlord' + RE.utils.buildQuery(q)),
      get: (id) => request('GET', `/conversations/${id}`),
      messages: (id, q) => request('GET', `/conversations/${id}/messages` + RE.utils.buildQuery(q)),
      send: (id, body) => request('POST', `/conversations/${id}/messages`, body),
      markRead: (id) => request('PATCH', `/conversations/${id}/read`),
    },
  };
})();
