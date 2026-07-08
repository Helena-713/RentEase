RE.tenantPages = RE.tenantPages || {};

RE.tenantPages.profile = async function (app) {
  const res = await RE.api.users.me();
  const user = res.data;

  app.innerHTML = `
    <div class="page-header"><h1>My Profile</h1></div>
    <div class="card" style="max-width:500px"><div class="card-body">
      ${user.profileImage ? `<img src="${RE.uploadUrl(user.profileImage)}" alt="" style="width:80px;height:80px;border-radius:50%;object-fit:cover;margin-bottom:1rem">` : ''}
      <p><strong>Email:</strong> ${RE.utils.escapeHtml(user.email)}</p>
      <p><strong>Role:</strong> ${RE.utils.badge(user.role)}</p>
      <form id="profile-form" enctype="multipart/form-data">
        <div class="form-row">
          <div class="form-group"><label>First Name</label><input name="firstName" value="${RE.utils.escapeHtml(user.firstName)}" required></div>
          <div class="form-group"><label>Last Name</label><input name="lastName" value="${RE.utils.escapeHtml(user.lastName)}" required></div>
        </div>
        <div class="form-group"><label>Phone</label><input name="phone" value="${RE.utils.escapeHtml(user.phone)}" required></div>
        <div class="form-group"><label>Profile Image</label><input type="file" name="profileImage" accept="image/*"></div>
        <hr style="margin:1rem 0;border:none;border-top:1px solid var(--color-border)">
        <div class="form-group"><label>New Password</label><input type="password" name="password" minlength="8"></div>
        <div class="form-group"><label>Current Password (required to change)</label><input type="password" name="currentPassword"></div>
        <button type="submit" class="btn btn-primary">Save Changes</button>
      </form>
    </div></div>`;

  app.querySelector('#profile-form').onsubmit = async (e) => {
    e.preventDefault();
    const form = e.target;
    const fd = new FormData();
    fd.append('firstName', form.firstName.value);
    fd.append('lastName', form.lastName.value);
    fd.append('phone', form.phone.value);
    if (form.profileImage.files[0]) fd.append('profileImage', form.profileImage.files[0]);
    if (form.password.value) {
      fd.append('password', form.password.value);
      fd.append('currentPassword', form.currentPassword.value);
    }
    try {
      const res = await RE.api.users.updateMe(fd);
      const session = RE.auth.getSession();
      session.user = res.data;
      RE.auth.saveSession(session);
      RE.ui.toast('Profile updated!', 'success');
      RE.tenantPages.profile(app);
    } catch (err) {
      RE.ui.toast(RE.api.handleError(err).message, 'error');
      RE.ui.renderFormErrors(form, RE.api.handleError(err).errors);
    }
  };
};
