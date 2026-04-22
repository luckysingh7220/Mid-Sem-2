const express = require('express');
const router = express.Router();

// @desc    Get current user's profile
// @route   GET /api/users/profile
// @access  Protected
router.get('/profile', (req, res) => {
  // req.user is set by authMiddleware
  res.json({
    _id: req.user._id,
    name: req.user.name,
    email: req.user.email,
    createdAt: req.user.createdAt,
  });
});

module.exports = router;
