RE.landlordPages = RE.landlordPages || {};

RE.landlordPages.verification = async function (app) {
  let verification = null;
  try {
    verification = await RE.auth.fetchLandlordVerification({ refresh: true });
  } catch (err) {
    RE.ui.toast(RE.api.handleError(err).message, 'error');
    return;
  }

  if (verification?.status === 'VERIFIED') {
    location.hash = '#/';
    return;
  }

  app.innerHTML = `
    <div class="page-header"><h1>Landlord Verification</h1>
      <p>Upload your identity document to get verified and start listing properties.</p>
    </div>
    ${verification ? `<div class="alert alert-info" id="status-alert">Current status: <strong>${RE.utils.escapeHtml(verification.status)}</strong>
      ${verification.rejectionReason ? `<br>Reason: ${RE.utils.escapeHtml(verification.rejectionReason)}` : ''}
    </div>` : ''}
    <div class="card" style="max-width:500px"><div class="card-body">
      <form id="verify-form">
        <div class="form-group">
          <label>Verification Document (PDF or image)</label>
          <input type="file" name="verificationDocument" accept=".pdf,image/*" required>
        </div>
        <button type="submit" class="btn btn-primary">Upload Document</button>
      </form>
    </div></div>
    <div class="alert alert-warning" style="margin-top:1.5rem;max-width:500px">
      You must be verified by an admin before you can create property listings.
    </div>`;

  app.querySelector('#verify-form').onsubmit = async (e) => {
    e.preventDefault();
    const fd = new FormData();
    fd.append('verificationDocument', e.target.verificationDocument.files[0]);
    try {
      const res = await RE.api.users.uploadVerification(fd);
      RE.auth._landlordVerification = {
        status: res.data.status,
        rejectionReason: res.data.rejectionReason,
      };
      sessionStorage.setItem('landlord_verification', JSON.stringify(RE.auth._landlordVerification));
      RE.ui.toast('Document uploaded! Awaiting admin review.', 'success');
      RE.landlordPages.verification(app);
    } catch (err) { RE.ui.toast(RE.api.handleError(err).message, 'error'); }
  };
};
