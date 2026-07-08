RE.auth.setPortal('tenant');
RE.api.setLoginPath('#/login');
RE.ui.init();
RE.ui.setupMobileNav();

function renderNav() {
  const links = document.getElementById('nav-links');
  const actions = document.getElementById('nav-actions');
  const loggedIn = RE.auth.isLoggedIn() && RE.auth.hasRole('TENANT');

  links.innerHTML = loggedIn ? `
    <a href="#/">Browse</a>
    <a href="#/applications">My Applications</a>
    <a href="#/messages" class="nav-link-with-badge">Messages<span class="nav-unread-badge" hidden></span></a>
    <a href="#/profile">Profile</a>` : `<a href="#/">Browse</a>`;

  actions.innerHTML = loggedIn
    ? `<span class="meta">${RE.utils.escapeHtml(RE.utils.fullName(RE.auth.getUser()))}</span>
       <button class="btn btn-secondary btn-sm" id="logout-btn">Logout</button>`
    : `<a href="#/login" class="btn btn-secondary btn-sm">Log In</a>
       <a href="#/register" class="btn btn-primary btn-sm">Register</a>`;

  const logoutBtn = document.getElementById('logout-btn');
  if (logoutBtn) logoutBtn.onclick = () => {
    RE.messages.stopPolling();
    RE.auth.logout();
    renderNav();
    RE.tenantRouter.start();
  };

  const hash = location.hash.slice(1) || '/';
  links.querySelectorAll('a').forEach((a) => {
    const href = a.getAttribute('href').slice(1);
    if (hash === href || (href !== '/' && hash.startsWith(href))) a.classList.add('active');
  });
  RE.ui.setupMobileNav();
  if (loggedIn) {
    RE.messages.updateNavBadge();
    RE.messages.startBadgePolling();
  } else {
    RE.messages.stopPolling();
  }
}

window.addEventListener('hashchange', () => {
  RE.ui.closeMobileNav();
  const hash = location.hash.slice(1) || '/';
  if (!hash.startsWith('/messages')) {
    RE.messages.stopPolling('inbox');
    RE.messages.stopPolling('thread');
  }
  renderNav();
});
window.addEventListener('resize', () => {
  if (window.innerWidth > 768) RE.ui.closeMobileNav();
});
renderNav();
RE.tenantRouter.start();
