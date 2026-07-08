const express = require('express');

const router = express.Router();

router.use('/auth', require('./auth.routes'));
router.use('/users', require('./user.routes'));
router.use('/landlord-verifications', require('./landlordVerification.routes'));
router.use('/properties', require('./property.routes'));
router.use('/amenities', require('./amenity.routes'));
router.use('/applications', require('./application.routes'));
router.use('/reviews', require('./review.routes'));

router.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    data: {
      status: 'ok',
      timestamp: new Date().toISOString(),
    },
  });
});

module.exports = router;
