const express = require('express');
const router = express.Router();
const { getNotifications, markAsRead, markAllRead, deleteNotification } = require('../controllers/notificationController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/', getNotifications);
router.put('/:id/read', markAsRead);
router.put('/read-all', markAllRead);
router.delete('/:id', deleteNotification);

module.exports = router;
