const mongoose = require('mongoose');
const Swipe = require('../models/Swipe');
const Match = require('../models/Match');
const User = require('../models/User');

/**
 * @desc    Swipe on a user (like or dislike)
 * @route   POST /api/swipe
 * @access  Private
 */
const swipeUser = async (req, res) => {
  try {
    const { swipedUserId, action } = req.body;
    const currentUserId = req.user._id;

    // Validate action
    if (!action || !['like', 'dislike'].includes(action)) {
      return res.status(400).json({
        success: false,
        message: 'Action must be "like" or "dislike"',
      });
    }

    // Validate swipedUserId is provided
    if (!swipedUserId) {
      return res.status(400).json({
        success: false,
        message: 'swipedUserId is required',
      });
    }

    // Validate swipedUserId is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(swipedUserId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid user ID',
      });
    }

    // Prevent self-swipe
    if (currentUserId.toString() === swipedUserId.toString()) {
      return res.status(400).json({
        success: false,
        message: 'You cannot swipe on yourself',
      });
    }

    // Verify swiped user exists
    const swipedUser = await User.findById(swipedUserId);
    if (!swipedUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Save swipe (unique index will prevent duplicates)
    try {
      await Swipe.create({
        swiper: currentUserId,
        swiped: swipedUserId,
        action,
      });
    } catch (error) {
      if (error.code === 11000) {
        return res.status(409).json({
          success: false,
          message: 'You have already swiped on this user',
        });
      }
      throw error;
    }

    // Check for mutual match only on "like"
    if (action === 'like') {
      const reciprocalSwipe = await Swipe.findOne({
        swiper: swipedUserId,
        swiped: currentUserId,
        action: 'like',
      });

      if (reciprocalSwipe) {
        // Sort user IDs to create a canonical pair (prevents duplicate matches)
        const sortedUsers = [currentUserId, swipedUserId].sort((a, b) =>
          a.toString().localeCompare(b.toString())
        );

        // Only create match if one doesn't already exist
        const existingMatch = await Match.findOne({
          users: { $all: sortedUsers },
        });

        if (!existingMatch) {
          await Match.create({ users: sortedUsers });
        }

        return res.status(200).json({
          success: true,
          data: { isMatch: true },
        });
      }
    }

    return res.status(200).json({
      success: true,
      data: { isMatch: false },
    });
  } catch (error) {
    console.error('Swipe error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while processing swipe',
    });
  }
};

module.exports = { swipeUser };
