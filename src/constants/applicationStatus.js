const ApplicationStatus = {
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
  WITHDRAWN: 'WITHDRAWN',
  CANCELLED: 'CANCELLED',
  COMPLETED: 'COMPLETED',
};

const APPLICATION_STATUSES = Object.values(ApplicationStatus);

const TERMINAL_APPLICATION_STATUSES = [
  ApplicationStatus.REJECTED,
  ApplicationStatus.WITHDRAWN,
  ApplicationStatus.CANCELLED,
  ApplicationStatus.COMPLETED,
];

module.exports = {
  ApplicationStatus,
  APPLICATION_STATUSES,
  TERMINAL_APPLICATION_STATUSES,
};
