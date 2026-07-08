RE.auth.setPortal('admin');
RE.api.setLoginPath('#/login');
RE.ui.init();
RE.ui.setupMobileNav();

if (!RE.auth.isLoggedIn() && !location.hash.includes('login')) {
  location.hash = '#/login';
}

function renderNav() {
  const links = document.getElementById('nav-links');
  const actions = document.getElementById('nav-actions');
  const loggedIn = RE.auth.isLoggedIn() && RE.auth.hasRole('ADMIN');

  links.innerHTML = loggedIn ? `
    <a href="#/">Dashboard</a>
    <a href="#/users">Users</a>
    <a href="#/verifications">Verifications</a>
    <a href="#/properties">Properties</a>
    <a href="#/applications">Applications</a>
    <a href="#/amenities">Amenities</a>
    <a href="#/reviews">Reviews</a>` : '';

  actions.innerHTML = loggedIn
    ? `<span class="meta">${RE.utils.escapeHtml(RE.utils.fullName(RE.auth.getUser()))}</span>
       <button class="btn btn-secondary btn-sm" id="logout-btn">Logout</button>`
    : '';

  const logoutBtn = document.getElementById('logout-btn');
  if (logoutBtn) logoutBtn.onclick = () => { RE.auth.logout(); renderNav(); RE.adminRouter.start(); };

  const hash = location.hash.slice(1) || '/';
  links.querySelectorAll('a').forEach((a) => {
    const href = a.getAttribute('href').slice(1);
    if (hash === href || (href !== '/' && hash.startsWith(href))) a.classList.add('active');
  });
  RE.ui.setupMobileNav();
}

window.addEventListener('hashchange', () => {
  RE.ui.closeMobileNav();
  renderNav();
});
window.addEventListener('resize', () => {
  if (window.innerWidth > 768) RE.ui.closeMobileNav();
});
renderNav();
RE.adminRouter.start();
