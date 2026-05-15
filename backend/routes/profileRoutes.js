const express = require('express');
const router = express.Router();
const { updateProfile, changePassword, uploadAvatar } = require('../controllers/profileController');
const { protect } = require('../middleware/auth');
const multer = require('multer');

// Configure multer for avatar uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/avatars/'),
  filename: (req, file, cb) => {
    const ext = file.originalname.split('.').pop();
    cb(null, `avatar_${req.user._id}_${Date.now()}.${ext}`);
  }
});
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true);
    else cb(new Error('Only image files are allowed'), false);
  }
});

router.use(protect);

router.put('/update', updateProfile);
router.put('/password', changePassword);
router.post('/avatar', upload.single('avatar'), uploadAvatar);

module.exports = router;
