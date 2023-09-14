const express = require('express');
const router = express.Router();
const { adminMiddleware } = require('../utils/auth');

router.use(adminMiddleware);

router.get('/someAdminEndpoint', (req, res) => {
  // Your logic here
});

module.exports = router;