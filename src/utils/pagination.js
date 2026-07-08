const getPaginationOptions = ({ page, limit }) => ({
  limit,
  offset: (page - 1) * limit,
});

const buildPaginationMeta = ({ page, limit, total }) => ({
  page,
  limit,
  total,
  totalPages: total === 0 ? 0 : Math.ceil(total / limit),
});

const sendPaginatedResponse = (res, { items, total, page, limit }) => {
  res.status(200).json({
    success: true,
    data: items,
    meta: buildPaginationMeta({ page, limit, total }),
  });
};

module.exports = {
  getPaginationOptions,
  buildPaginationMeta,
  sendPaginatedResponse,
};
