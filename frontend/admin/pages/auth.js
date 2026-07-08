RE.adminPages = RE.adminPages || {};

RE.adminPages.auth = {
  async login(app) {
    app.innerHTML = `
      <div class="auth-card card"><div class="card-body">
        <h1>Admin Log In</h1>
        <p class="meta" style="margin-bottom:1.5rem">Admin portal — no self-registration</p>
        <form id="login-form">
          <div class="form-group"><label>Email</label><input type="email" name="email" required></div>
          <div class="form-group"><label>Password</label><input type="password" name="password" required></div>
          <button type="submit" class="btn btn-primary btn-block">Log In</button>
        </form>
      </div></div>`;
    app.querySelector('#login-form').onsubmit = async (e) => {
      e.preventDefault();
      const form = e.target;
      try {
        const res = await RE.api.auth.login({ email: form.email.value, password: form.password.value });
        if (res.data.user.role !== 'ADMIN') {
          RE.ui.toast('Admin access only. Redirecting to your portal...', 'error');
          RE.auth.login(res.data);
          setTimeout(() => RE.auth.redirectToPortal(res.data.user.role), 1500);
          return;
        }
        RE.auth.login(res.data);
        RE.ui.toast('Welcome, Admin!', 'success');
        location.hash = '#/';
      } catch (err) { RE.ui.toast(RE.api.handleError(err).message, 'error'); }
    };
  },
};
