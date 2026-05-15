const User = require('../models/User');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');

/**
 * Profile Controller - User profile management
 */

// @desc    Update user profile
// @route   PUT /api/profile/update
exports.updateProfile = async (req, res, next) => {
  try {
    const { name, email, currency, theme, monthlyBudget } = req.body;
    const updateData = {};

    if (name) updateData.name = name;
    if (email) updateData.email = email;
    if (currency) updateData.currency = currency;
    if (theme) updateData.theme = theme;
    if (monthlyBudget !== undefined) updateData.monthlyBudget = monthlyBudget;

    const user = await User.findByIdAndUpdate(req.user._id, updateData, {
      new: true,
      runValidators: true
    });

    res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        currency: user.currency,
        theme: user.theme,
        monthlyBudget: user.monthlyBudget
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Change password
// @route   PUT /api/profile/password
exports.changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, message: 'Please provide current and new password' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, message: 'New password must be at least 6 characters' });
    }

    const user = await User.findById(req.user._id).select('+password');
    const isMatch = await user.comparePassword(currentPassword);

    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Current password is incorrect' });
    }

    user.password = newPassword;
    await user.save();

    res.json({ success: true, message: 'Password updated successfully' });
  } catch (error) {
    next(error);
  }
};

// @desc    Upload avatar
// @route   POST /api/profile/avatar
exports.uploadAvatar = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please upload an image' });
    }

    // Delete old avatar if exists
    const user = await User.findById(req.user._id);
    if (user.avatar && user.avatar.startsWith('/uploads/')) {
      const oldPath = path.join(__dirname, '..', user.avatar);
      if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
    }

    const avatarUrl = `/uploads/avatars/${req.file.filename}`;
    user.avatar = avatarUrl;
    await user.save();

    res.json({ success: true, avatar: avatarUrl });
  } catch (error) {
    next(error);
  }
};
