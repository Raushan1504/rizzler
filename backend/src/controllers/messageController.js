const Message = require('../models/Message');
const Match = require('../models/Match');

/**
 * @desc    Get all messages for a specific match
 * @route   GET /api/messages/:matchId
 * @access  Private
 */
const getMessages = async (req, res) => {
  try {
    const { matchId } = req.params;
    const currentUserId = req.user._id;

    // Verify the match exists and the user is part of it
    const match = await Match.findById(matchId);
    
    if (!match) {
      return res.status(404).json({
        success: false,
        message: 'Match not found',
      });
    }

    if (!match.users.includes(currentUserId)) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to view these messages',
      });
    }

    const messages = await Message.find({ matchId })
      .populate('sender', 'name photos')
      .sort({ createdAt: 1 }); // Oldest first for chat UI

    return res.status(200).json({
      success: true,
      data: messages,
    });
  } catch (error) {
    console.error('Get messages error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while fetching messages',
    });
  }
};

module.exports = { getMessages };
