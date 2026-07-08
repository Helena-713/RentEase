RE.auth.setPortal('landlord');
RE.api.setLoginPath('#/login');
RE.ui.init();
RE.ui.setupMobileNav();

if (!RE.auth.isLoggedIn() && !location.hash.includes('login') && !location.hash.includes('register')) {
  location.hash = '#/login';
}

async function renderNav() {
  const links = document.getElementById('nav-links');
  const actions = document.getElementById('nav-actions');
  const loggedIn = RE.auth.isLoggedIn() && RE.auth.hasRole('LAND_LORD');

  if (loggedIn) {
    let showVerification = true;
    try {
      const verification = await RE.auth.fetchLandlordVerification();
      showVerification = verification?.status !== 'VERIFIED';
    } catch {
      showVerification = true;
    }

    const navItems = [
      '<a href="#/">My Properties</a>',
      '<a href="#/applications">Applications</a>',
      '<a href="#/messages" class="nav-link-with-badge">Messages<span class="nav-unread-badge" hidden></span></a>',
    ];
    if (showVerification) {
      navItems.push('<a href="#/verification">Verification</a>');
    }
    navItems.push(
      '<a href="#/profile">Profile</a>'
    );
    links.innerHTML = navItems.join('');
  } else {
    links.innerHTML = '';
  }

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
    RE.landlordRouter.start();
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

async function init() {
  if (RE.auth.isLoggedIn() && RE.auth.hasRole('LAND_LORD')) {
    try {
      await RE.auth.fetchLandlordVerification();
    } catch { /* nav falls back to showing Verification */ }
  }
  await renderNav();
  RE.landlordRouter.start();
}

init();
