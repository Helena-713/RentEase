RE.tenantPages = RE.tenantPages || {};

RE.tenantPages.messages = async function (app, params) {
  if (params.id) {
    RE.messages.stopPolling('inbox');

    const convRes = await RE.api.conversations.get(params.id);
    const conv = convRes.data;
    const property = conv.property;
    const landlord = conv.landlord;

    app.innerHTML = `
      <div class="page-header">
        <a href="#/messages" class="btn btn-secondary btn-sm">&larr; Back to Messages</a>
        <h1>${property ? RE.utils.escapeHtml(property.title) : 'Conversation'}</h1>
        <p class="meta">${landlord ? `With ${RE.utils.escapeHtml(RE.utils.fullName(landlord))}` : ''}</p>
      </div>
      <div class="card"><div class="card-body">
        <div id="message-thread"></div>
      </div></div>`;

    RE.messages.mountThread(app.querySelector('#message-thread'), params.id);
    return;
  }

  let page = 1;

  function renderInboxItems(items) {
    return items.length ? items.map((c) => {
      const landlord = c.landlord;
      return RE.messages.renderConversationCard(c, {
        href: `#/messages/${c.id}`,
        partyName: landlord ? RE.utils.fullName(landlord) : 'Landlord',
      });
    }).join('') : RE.ui.empty('No conversations yet. Message a landlord from a property page.');
  }

  async function load(p, opts = {}) {
    page = p;
    if (!opts.silent) app.innerHTML = RE.ui.loading();

    const res = await RE.api.conversations.mine({ page, limit: 10 });
    const items = res.data || [];
    const meta = res.meta;

    if (opts.silent) {
      const inboxEl = app.querySelector('.messages-inbox');
      if (inboxEl) {
        inboxEl.innerHTML = renderInboxItems(items);
        return;
      }
    }

    app.innerHTML = `
      <div class="page-header">
        <h1>Messages</h1>
        <p>Chat with landlords about properties</p>
      </div>
      <div class="card messages-inbox-panel">
        <div class="messages-inbox">
          ${renderInboxItems(items)}
        </div>
      </div>
      <div id="pagination" class="messages-pagination"></div>`;

    const pagEl = app.querySelector('#pagination');
    if (pagEl && meta) RE.ui.appendPagination(pagEl, meta, load);

    RE.messages.stopPolling('inbox');
    RE.messages.startInboxPolling(() => load(page, { silent: true }));
  }

  await load(1);
};
