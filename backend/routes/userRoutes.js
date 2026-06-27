const express = require('express');
const router = express.Router();
const {
  getUsers,
  updateUserProfile,
  getUserNotifications,
  markNotificationsRead
} = require('../controllers/userController');
const { protect, admin } = require('../middleware/authMiddleware');

router.route('/')
  .get(protect, admin, getUsers);

router.route('/notifications')
  .get(protect, getUserNotifications);

router.route('/notifications/mark-read')
  .put(protect, markNotificationsRead);

router.route('/:id')
  .put(protect, updateUserProfile);

module.exports = router;
