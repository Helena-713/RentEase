window.RE = window.RE || {};

RE.messages = (function () {
  const PAGE_SIZE = 5;
  const POLL = { BADGE: 30000, INBOX: 20000, THREAD: 8000 };
  const timers = { badge: null, inbox: null, thread: null };

  function escape(s) {
    return RE.utils.escapeHtml(String(s ?? ''));
  }

  function senderName(message) {
    if (message.sender) return RE.utils.fullName(message.sender);
    return 'Unknown';
  }

  function renderBubble(message, currentUserId) {
    const mine = message.senderId === currentUserId;
    return `
      <div class="message-bubble ${mine ? 'mine' : 'theirs'}">
        <p class="message-bubble-author">${escape(senderName(message))}</p>
        <p class="message-bubble-text">${escape(message.message)}</p>
        <p class="meta message-bubble-time">${RE.utils.formatDateTime(message.createdAt)}</p>
      </div>`;
  }

  function renderBubblesHtml(messages, currentUserId) {
    return messages.map((m) => renderBubble(m, currentUserId)).join('');
  }

  function appendBubbles(bubblesEl, messages, currentUserId) {
    const empty = bubblesEl.querySelector('.message-empty');
    if (empty) empty.remove();
    bubblesEl.insertAdjacentHTML('beforeend', renderBubblesHtml(messages, currentUserId));
  }

  function isNearBottom(scrollEl, threshold = 80) {
    return scrollEl.scrollHeight - scrollEl.scrollTop - scrollEl.clientHeight < threshold;
  }

  function renderThread(container, state, currentUserId, scrollOpts) {
    const hasMore = state.messages.length < state.total;
    const prevScrollEl = container.querySelector('#message-list-scroll');
    const prevScrollHeight = scrollOpts?.preserveScroll ? prevScrollEl?.scrollHeight || 0 : 0;

    container.innerHTML = `
      <div class="message-thread">
        <div class="message-list-scroll" id="message-list-scroll">
          ${hasMore ? '<div class="load-more-messages"><button type="button" class="btn btn-secondary btn-sm" id="load-more-messages">Load more</button></div>' : ''}
          <div id="message-bubbles">
            ${state.messages.length
              ? renderBubblesHtml(state.messages, currentUserId)
              : '<p class="meta message-empty">No messages yet. Start the conversation below.</p>'}
          </div>
        </div>
        <form class="message-compose" id="message-compose">
          <div class="form-group">
            <label class="sr-only">Message</label>
            <textarea name="message" rows="2" placeholder="Type your message..." required></textarea>
          </div>
          <button type="submit" class="btn btn-primary">Send</button>
        </form>
      </div>`;

    const loadBtn = container.querySelector('#load-more-messages');
    if (loadBtn) {
      loadBtn.onclick = async () => {
        loadBtn.disabled = true;
        loadBtn.textContent = 'Loading...';
        try {
          state.page += 1;
          const res = await RE.api.conversations.messages(state.conversationId, {
            page: state.page,
            limit: PAGE_SIZE,
          });
          const older = (res.data || []).reverse();
          state.messages = [...older, ...state.messages];
          renderThread(container, state, currentUserId, { preserveScroll: true });
        } catch (err) {
          RE.ui.toast(RE.api.handleError(err).message, 'error');
          state.page -= 1;
          loadBtn.disabled = false;
          loadBtn.textContent = 'Load more';
        }
      };
    }

    const form = container.querySelector('#message-compose');
    form.onsubmit = async (e) => {
      e.preventDefault();
      const text = form.message.value.trim();
      if (!text) return;
      const submitBtn = form.querySelector('button[type="submit"]');
      submitBtn.disabled = true;
      try {
        const res = await RE.api.conversations.send(state.conversationId, { message: text });
        state.messages.push(res.data);
        state.total += 1;
        form.reset();
        renderThread(container, state, currentUserId);
        const scrollEl = container.querySelector('#message-list-scroll');
        if (scrollEl) scrollEl.scrollTop = scrollEl.scrollHeight;
      } catch (err) {
        RE.ui.toast(RE.api.handleError(err).message, 'error');
      } finally {
        submitBtn.disabled = false;
      }
    };

    const scrollEl = container.querySelector('#message-list-scroll');
    if (scrollEl) {
      if (scrollOpts?.preserveScroll && prevScrollHeight) {
        scrollEl.scrollTop = scrollEl.scrollHeight - prevScrollHeight;
      } else if (!hasMore) {
        scrollEl.scrollTop = scrollEl.scrollHeight;
      }
    }
  }

  async function pollThread(container, state, currentUserId) {
    if (document.hidden) return;

    const scrollEl = container.querySelector('#message-list-scroll');
    const bubblesEl = container.querySelector('#message-bubbles');
    if (!scrollEl || !bubblesEl) return;

    const wasNearBottom = isNearBottom(scrollEl);

    try {
      const res = await RE.api.conversations.messages(state.conversationId, {
        page: 1,
        limit: PAGE_SIZE,
      });
      const latest = (res.data || []).reverse();
      state.total = res.meta?.total ?? state.total;

      const existingIds = new Set(state.messages.map((m) => m.id));
      const incoming = latest
        .filter((m) => !existingIds.has(m.id))
        .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

      if (!incoming.length) return;

      const fromOther = incoming.some((m) => m.senderId !== currentUserId);
      state.messages.push(...incoming);
      appendBubbles(bubblesEl, incoming, currentUserId);

      if (wasNearBottom) scrollEl.scrollTop = scrollEl.scrollHeight;

      if (fromOther) {
        await RE.api.conversations.markRead(state.conversationId).catch(() => {});
        updateNavBadge();
      }
    } catch {
      /* fail silently; next tick retries */
    }
  }

  function startThreadPolling(container, state, currentUserId) {
    stopPolling('thread');
    timers.thread = setInterval(() => {
      pollThread(container, state, currentUserId);
    }, POLL.THREAD);
  }

  async function mountThread(container, conversationId) {
    if (!container) return;

    if (container._threadDestroy) {
      container._threadDestroy();
      container._threadDestroy = null;
    }
    stopPolling('thread');

    const currentUserId = RE.auth.getUser()?.id;
    const state = {
      conversationId,
      messages: [],
      page: 1,
      total: 0,
    };

    container.innerHTML = RE.ui.loading();

    try {
      await RE.api.conversations.markRead(conversationId).catch(() => {});

      const res = await RE.api.conversations.messages(conversationId, {
        page: 1,
        limit: PAGE_SIZE,
      });
      state.messages = (res.data || []).reverse();
      state.total = res.meta?.total ?? state.messages.length;

      renderThread(container, state, currentUserId);

      const scrollEl = container.querySelector('#message-list-scroll');
      if (scrollEl) scrollEl.scrollTop = scrollEl.scrollHeight;

      startThreadPolling(container, state, currentUserId);
      const destroy = () => stopPolling('thread');
      container._threadDestroy = destroy;
      return { destroy };
    } catch (err) {
      container.innerHTML = `<div class="alert alert-error">${escape(RE.api.handleError(err).message)}</div>`;
      return null;
    }
  }

  function initials(name) {
    if (!name) return '?';
    const parts = String(name).trim().split(/\s+/).filter(Boolean);
    if (!parts.length) return '?';
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  }

  function isConversationUnread(conversation) {
    const currentUserId = RE.auth.getUser()?.id;
    const lastMessage = conversation?.lastMessage;
    if (!currentUserId || !lastMessage) return false;
    return lastMessage.senderId !== currentUserId && !lastMessage.isRead;
  }

  function renderConversationCard(conversation, { href, partyName }) {
    const property = conversation.property;
    const preview = conversation.lastMessage?.message || 'No messages yet';
    const date = conversation.lastMessageAt || conversation.createdAt;
    const unread = isConversationUnread(conversation);

    return `
      <a href="${escape(href)}" class="conversation-card${unread ? ' conversation-card--unread' : ''}">
        <span class="conversation-avatar" aria-hidden="true">${escape(initials(partyName))}</span>
        <span class="conversation-card-content">
          <span class="conversation-card-header">
            <strong class="conversation-card-title">
              ${unread ? '<span class="conversation-unread-dot" aria-hidden="true"></span>' : ''}
              ${property ? escape(property.title) : 'Property'}
            </strong>
            <span class="conversation-card-date meta">${RE.utils.formatDate(date)}</span>
          </span>
          <span class="conversation-card-party meta">${escape(partyName)}</span>
          <span class="conversation-preview${unread ? ' conversation-preview--unread' : ''}">${escape(preview)}</span>
        </span>
        <span class="conversation-card-chevron" aria-hidden="true">›</span>
      </a>`;
  }

  async function fetchUnreadCount() {
    if (!RE.auth.isLoggedIn()) return 0;

    const isTenant = RE.auth.hasRole('TENANT');
    const isLandlord = RE.auth.hasRole('LAND_LORD');
    if (!isTenant && !isLandlord) return 0;

    try {
      const res = isTenant
        ? await RE.api.conversations.mine({ page: 1, limit: 50 })
        : await RE.api.conversations.landlord({ page: 1, limit: 50 });
      return (res.data || []).filter(isConversationUnread).length;
    } catch {
      return 0;
    }
  }

  function updateNavBadge() {
    const badge = document.querySelector('.nav-unread-badge');
    if (!badge) return;

    fetchUnreadCount().then((count) => {
      if (count > 0) {
        badge.hidden = false;
        badge.textContent = count > 9 ? '9+' : String(count);
      } else {
        badge.hidden = true;
        badge.textContent = '';
      }
    });
  }

  function stopPolling(scope) {
    if (!scope) {
      Object.keys(timers).forEach((key) => {
        if (timers[key]) clearInterval(timers[key]);
        timers[key] = null;
      });
      return;
    }
    if (timers[scope]) {
      clearInterval(timers[scope]);
      timers[scope] = null;
    }
  }

  function startBadgePolling() {
    if (timers.badge) return;
    timers.badge = setInterval(() => {
      if (document.hidden) return;
      if (!RE.auth.isLoggedIn()) return;
      updateNavBadge();
    }, POLL.BADGE);
  }

  function startInboxPolling(onRefresh) {
    stopPolling('inbox');
    timers.inbox = setInterval(() => {
      if (document.hidden) return;
      onRefresh({ silent: true });
    }, POLL.INBOX);
  }

  return {
    mountThread,
    PAGE_SIZE,
    isConversationUnread,
    renderConversationCard,
    fetchUnreadCount,
    updateNavBadge,
    stopPolling,
    startBadgePolling,
    startInboxPolling,
  };
})();
