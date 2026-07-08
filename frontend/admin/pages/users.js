RE.adminPages = RE.adminPages || {};

RE.adminPages.users = async function (app) {
  let page = 1;

  async function load(p) {
    page = p;
    app.innerHTML = RE.ui.loading();
    const res = await RE.api.users.list({ page, limit: 10 });
    const items = res.data;
    const meta = res.meta;

    app.innerHTML = `
      <div class="page-header"><h1>Users</h1></div>
      <div class="table-wrap"><table>
        <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Status</th><th></th></tr></thead>
        <tbody>
          ${items.map((u) => `
            <tr>
              <td>${RE.utils.escapeHtml(RE.utils.fullName(u))}</td>
              <td>${RE.utils.escapeHtml(u.email)}</td>
              <td>${RE.utils.badge(u.role)}</td>
              <td>${u.isActive ? RE.utils.badge('APPROVED') : RE.utils.badge('INACTIVE')}</td>
              <td><button class="btn btn-secondary btn-sm" data-edit="${u.id}">Edit</button></td>
            </tr>`).join('')}
        </tbody>
      </table></div>
      <div id="pagination"></div>
      <div id="edit-modal"></div>`;

    const pagEl = app.querySelector('#pagination');
    if (pagEl && meta) RE.ui.appendPagination(pagEl, meta, load);

    app.querySelectorAll('[data-edit]').forEach((btn) => {
      btn.onclick = () => showEdit(btn.dataset.edit, items.find((u) => u.id === btn.dataset.edit));
    });
  }

  function showEdit(id, user) {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
      <div class="modal">
        <h3>Edit User</h3>
        <form id="edit-user-form">
          <div class="form-row">
            <div class="form-group"><label>First Name</label><input name="firstName" value="${RE.utils.escapeHtml(user.firstName)}"></div>
            <div class="form-group"><label>Last Name</label><input name="lastName" value="${RE.utils.escapeHtml(user.lastName)}"></div>
          </div>
          <div class="form-group"><label>Phone</label><input name="phone" value="${RE.utils.escapeHtml(user.phone)}"></div>
          <div class="form-group"><label>New Password</label><input type="password" name="password"></div>
          <div class="modal-actions">
            <button type="button" class="btn btn-secondary" id="cancel-edit">Cancel</button>
            <button type="submit" class="btn btn-primary">Save</button>
          </div>
        </form>
      </div>`;
    document.body.appendChild(modal);
    modal.querySelector('#cancel-edit').onclick = () => modal.remove();
    modal.querySelector('#edit-user-form').onsubmit = async (e) => {
      e.preventDefault();
      const f = e.target;
      const fd = new FormData();
      if (f.firstName.value) fd.append('firstName', f.firstName.value);
      if (f.lastName.value) fd.append('lastName', f.lastName.value);
      if (f.phone.value) fd.append('phone', f.phone.value);
      if (f.password.value) fd.append('password', f.password.value);
      try {
        await RE.api.users.update(id, fd);
        RE.ui.toast('User updated', 'success');
        modal.remove();
        load(page);
      } catch (err) { RE.ui.toast(RE.api.handleError(err).message, 'error'); }
    };
  }

  await load(1);
};
