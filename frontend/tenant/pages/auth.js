RE.tenantPages = RE.tenantPages || {};

RE.tenantPages.auth = {
  async login(app) {
    app.innerHTML = `
      <div class="auth-card card">
        <div class="card-body">
          <h1>Log In</h1>
          <p class="meta" style="margin-bottom:1.5rem">Tenant portal</p>
          <form id="login-form">
            <div class="form-group"><label>Email</label><input type="email" name="email" required></div>
            <div class="form-group"><label>Password</label><input type="password" name="password" required></div>
            <button type="submit" class="btn btn-primary btn-block">Log In</button>
          </form>
          <p class="auth-footer">No account? <a href="#/register">Register</a></p>
        </div>
      </div>`;
    app.querySelector('#login-form').onsubmit = async (e) => {
      e.preventDefault();
      const form = e.target;
      try {
        const res = await RE.api.auth.login({
          email: form.email.value,
          password: form.password.value,
        });
        if (res.data.user.role !== 'TENANT') {
          RE.ui.toast('This portal is for tenants. Redirecting...', 'error');
          RE.auth.login(res.data);
          setTimeout(() => RE.auth.redirectToPortal(res.data.user.role), 1500);
          return;
        }
        RE.auth.login(res.data);
        RE.ui.toast('Welcome back!', 'success');
        location.hash = '#/';
      } catch (err) {
        const e2 = RE.api.handleError(err);
        RE.ui.toast(e2.message, 'error');
        RE.ui.renderFormErrors(form, e2.errors);
      }
    };
  },

  async register(app) {
    app.innerHTML = `
      <div class="auth-card card">
        <div class="card-body">
          <h1>Register</h1>
          <p class="meta" style="margin-bottom:1.5rem">Create a tenant account</p>
          <form id="register-form" enctype="multipart/form-data">
            <div class="form-row">
              <div class="form-group"><label>First Name</label><input name="firstName" required></div>
              <div class="form-group"><label>Last Name</label><input name="lastName" required></div>
            </div>
            <div class="form-group"><label>Email</label><input type="email" name="email" required></div>
            <div class="form-group"><label>Password</label><input type="password" name="password" required minlength="8"></div>
            <div class="form-group"><label>Phone (E.164)</label><input name="phone" placeholder="+251912345678" required></div>
            <div class="form-group"><label>Profile Image (optional)</label><input type="file" name="profileImage" accept="image/*"></div>
            <button type="submit" class="btn btn-primary btn-block">Register</button>
          </form>
          <p class="auth-footer">Have an account? <a href="#/login">Log In</a></p>
        </div>
      </div>`;
    app.querySelector('#register-form').onsubmit = async (e) => {
      e.preventDefault();
      const form = e.target;
      const fd = new FormData(form);
      fd.set('role', 'TENANT');
      try {
        const res = await RE.api.auth.register(fd);
        RE.auth.login(res.data);
        RE.ui.toast('Account created!', 'success');
        location.hash = '#/';
      } catch (err) {
        const e2 = RE.api.handleError(err);
        RE.ui.toast(e2.message, 'error');
        RE.ui.renderFormErrors(form, e2.errors);
      }
    };
  },
};
