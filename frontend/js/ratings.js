window.RE = window.RE || {};

RE.ratings = (function () {
  function escape(s) {
    return RE.utils.escapeHtml(String(s ?? ''));
  }

  function filterByTarget(reviews, targetType) {
    return (reviews || []).filter((r) => r.targetType === targetType);
  }

  function average(reviews) {
    if (!reviews?.length) return null;
    const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
    return Math.round((sum / reviews.length) * 10) / 10;
  }

  function reviewerLabel(review) {
    if (review.reviewer) return RE.utils.fullName(review.reviewer);
    return 'Anonymous reviewer';
  }

  function renderReviews(reviews, limit) {
    return reviews.slice(0, limit).map((r) => `
      <div class="rating-item">
        <div class="rating-item-header">
          <p class="rating-item-author"><strong>${escape(reviewerLabel(r))}</strong></p>
          <span class="meta rating-item-date">${RE.utils.formatDate(r.createdAt)}</span>
        </div>
        <div class="rating-item-stars"><span class="rating">${RE.ui.stars(r.rating)}</span></div>
        ${r.comment ? `<p class="rating-item-comment">${escape(r.comment)}</p>` : ''}
      </div>`).join('');
  }

  async function mount(container, opts) {
    const userId = opts?.userId;
    const targetType = opts?.targetType;
    const title = opts?.title || 'Ratings';
    const emptyText = opts?.emptyText || 'No ratings yet.';
    const embedded = opts?.embedded === true;

    if (!container) return;
    if (!userId || !targetType) {
      container.innerHTML = '';
      return;
    }

    container.innerHTML = RE.ui.loading();

    let reviews = [];
    try {
      const res = await RE.api.users.reviews(userId, { page: 1, limit: 20 });
      reviews = filterByTarget(res.data || [], targetType);
    } catch (err) {
      container.innerHTML = `<div class="alert alert-error">${escape(RE.api.handleError(err).message)}</div>`;
      return;
    }

    const avg = average(reviews);
    const titleHtml = embedded ? '' : `<h3 class="property-section-title">${escape(title)}</h3>`;
    container.innerHTML = `
      ${titleHtml}
      ${reviews.length
        ? `<p class="rating-summary"><strong>${avg}</strong> ★ (${reviews.length} review${reviews.length === 1 ? '' : 's'})</p>
           <div class="rating-list">${renderReviews(reviews, 5)}</div>`
        : `<p class="meta">${escape(emptyText)}</p>`}
    `;
  }

  return { average, filterByTarget, mount };
})();
