const VerificationStatus = {
  PENDING: 'PENDING',
  VERIFIED: 'VERIFIED',
  REJECTED: 'REJECTED',
};

const VERIFICATION_STATUSES = Object.values(VerificationStatus);

const REVIEW_STATUSES = [
  VerificationStatus.VERIFIED,
  VerificationStatus.REJECTED,
];

const EDITABLE_STATUSES = [
  VerificationStatus.PENDING,
  VerificationStatus.REJECTED,
];

module.exports = {
  VerificationStatus,
  VERIFICATION_STATUSES,
  REVIEW_STATUSES,
  EDITABLE_STATUSES,
};
