window.RE = window.RE || {};

RE.reviewSection = (function () {
  function escape(s) {
    return RE.utils.escapeHtml(String(s ?? ''));
  }

  function findForRental(items, { propertyId, applicationId, targetType }) {
    const list = items || [];
    if (applicationId) {
      return (
        list.find((r) => r.applicationId === applicationId && r.targetType === targetType) ||
        null
      );
    }
    return (
      list.find((r) => r.propertyId === propertyId && r.targetType === targetType) ||
      null
    );
  }

  function otherTargetType(targetType) {
    return targetType === 'LANDLORD' ? 'TENANT' : 'LANDLORD';
  }

  function personLabel(person, fallback) {
    if (person) return RE.utils.fullName(person);
    return fallback;
  }

  async function mount(container, opts) {
    const propertyId = opts?.propertyId;
    const applicationId = opts?.applicationId;
    const targetType = opts?.targetType;
    const revieweeLabel = opts?.revieweeLabel || 'Leave a review';
    const receivedTargetType = opts?.receivedTargetType || otherTargetType(targetType);

    if (!container) return;
    if (!propertyId || !targetType) {
      container.innerHTML = '<div class="alert alert-error">Reviews could not be loaded.</div>';
      return;
    }

    container.innerHTML = RE.ui.loading();

    let mineItems = [];
    let receivedItems = [];
    try {
      const [mineRes, recvRes] = await Promise.all([
        RE.api.reviews.mine({ page: 1, limit: 100 }),
        RE.api.reviews.received({ page: 1, limit: 100 }),
      ]);
      mineItems = mineRes.data || [];
      receivedItems = recvRes.data || [];
    } catch (err) {
      container.innerHTML = `<div class="alert alert-error">${escape(RE.api.handleError(err).message)}</div>`;
      return;
    }

    const myReview = findForRental(mineItems, { propertyId, applicationId, targetType });
    const theirReview = findForRental(receivedItems, {
      propertyId,
      applicationId,
      targetType: receivedTargetType,
    });

    container.innerHTML = `
      <div class="card" style="margin-top:1rem"><div class="card-body">
        <h3>Reviews</h3>
        <div class="two-col" style="margin-top:0.75rem">
          <div>
            <h4 style="margin:0 0 0.5rem">Your review</h4>
            <div id="my-review"></div>
          </div>
          <div>
            <h4 style="margin:0 0 0.5rem">Their review</h4>
            <div id="their-review"></div>
          </div>
        </div>
      </div></div>
    `;

    const myEl = container.querySelector('#my-review');
    const theirEl = container.querySelector('#their-review');

    if (theirReview) {
      theirEl.innerHTML = `
        <p class="rating-item-author">From: <strong>${escape(personLabel(theirReview.reviewer, 'Anonymous reviewer'))}</strong></p>
        <p><span class="rating">${RE.ui.stars(theirReview.rating)}</span> ${RE.utils.badge(theirReview.targetType)}</p>
        ${theirReview.comment ? `<p>${escape(theirReview.comment)}</p>` : '<p class="meta">No comment.</p>'}
        <p class="meta">${RE.utils.formatDateTime(theirReview.createdAt)}</p>
      `;
    } else {
      theirEl.innerHTML = '<p class="meta">No review yet.</p>';
    }

    if (myReview) {
      myEl.innerHTML = `
        <p class="rating-item-author">To: <strong>${escape(personLabel(myReview.reviewee, 'Unknown'))}</strong></p>
        <p><span class="rating">${RE.ui.stars(myReview.rating)}</span> ${RE.utils.badge(myReview.targetType)}</p>
        ${myReview.comment ? `<p>${escape(myReview.comment)}</p>` : '<p class="meta">No comment.</p>'}
        <p class="meta">You already submitted this review.</p>
      `;
      return;
    }

    myEl.innerHTML = `
      <p class="meta">${escape(revieweeLabel)}</p>
      <form id="review-form">
        <div class="form-group">
          <label>Rating (1-5)</label>
          <input type="number" name="rating" min="1" max="5" required>
        </div>
        <div class="form-group">
          <label>Comment</label>
          <textarea name="comment" rows="2"></textarea>
        </div>
        <button type="submit" class="btn btn-primary">Submit Review</button>
      </form>
      <div class="meta" style="margin-top:0.5rem">Reviews are only allowed after the rental is completed.</div>
    `;

    const form = myEl.querySelector('#review-form');
    form.onsubmit = async (e) => {
      e.preventDefault();
      try {
        await RE.api.reviews.create({
          propertyId,
          applicationId: applicationId || undefined,
          targetType,
          rating: parseInt(form.rating.value, 10),
          comment: form.comment.value || undefined,
        });
        RE.ui.toast('Review submitted!', 'success');
        await mount(container, opts);
      } catch (err) {
        RE.ui.toast(RE.api.handleError(err).message, 'error');
      }
    };
  }

  return { mount };
})();

