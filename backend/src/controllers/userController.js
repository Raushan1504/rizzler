const User = require('../models/User');
const Swipe = require('../models/Swipe');
const cloudinary = require('../config/cloudinary');

/**
 * @desc    Get authenticated user's profile
 * @route   GET /api/users/profile
 * @access  Private
 */
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching profile',
    });
  }
};

/**
 * @desc    Update authenticated user's profile
 * @route   PUT /api/users/profile
 * @access  Private
 */
const updateProfile = async (req, res) => {
  try {
    // Fields allowed for update — prevents mass-assignment attacks
    const allowedFields = [
      'name',
      'age',
      'gender',
      'bio',
      'interests',
      'photos',
      'intent',
    ];

    const updates = {};
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    }

    // Handle Cloudinary upload if there are new photos (base64)
    if (updates.photos && updates.photos.length > 0) {
      const uploadedPhotos = [];
      for (const photo of updates.photos) {
        if (photo.startsWith('data:image')) {
          try {
            const result = await cloudinary.uploader.upload(photo, {
              folder: 'rizzler_profiles',
            });
            uploadedPhotos.push(result.secure_url);
          } catch (uploadError) {
            console.error('Cloudinary upload error:', uploadError);
            // Fallback to saving base64 if Cloudinary is not configured
            uploadedPhotos.push(photo);
          }
        } else {
          // Already a URL
          uploadedPhotos.push(photo);
        }
      }
      updates.photos = uploadedPhotos;
    }

    // Prevent empty updates
    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No valid fields provided for update',
      });
    }

    const user = await User.findByIdAndUpdate(req.user._id, updates, {
      returnDocument: 'after', // Return the updated document
      runValidators: true, // Run schema validators on update
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    // Handle Mongoose validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({
        success: false,
        message: messages.join('. '),
      });
    }

    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating profile',
    });
  }
};

/**
 * @desc    Get discoverable users (exclude self and already swiped)
 * @route   GET /api/users/discover
 * @access  Private
 */
const getDiscoverUsers = async (req, res) => {
  try {
    const currentUserId = req.user._id;
    // Get all user IDs the current user has already swiped on
    const swipes = await Swipe.find({ swiper: currentUserId }).select('swiped');
    const swipedUserIds = swipes.map((swipe) => swipe.swiped);

    // Exclude current user + already swiped users
    const excludeIds = [currentUserId, ...swipedUserIds];

    const users = await User.find({ _id: { $nin: excludeIds } })
      .select('name age gender bio interests photos intent')
      .limit(10);

    return res.status(200).json({
      success: true,
      data: users,
    });
  } catch (error) {
    console.error('Discover users error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while fetching discover users',
    });
  }
};

module.exports = { getProfile, updateProfile, getDiscoverUsers };
