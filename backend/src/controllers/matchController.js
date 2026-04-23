const Match = require('../models/Match');

/**
 * @desc    Get all matches for the authenticated user
 * @route   GET /api/matches
 * @access  Private
 */
const getMatches = async (req, res) => {
  try {
    const currentUserId = req.user._id;

    const matches = await Match.find({
      users: currentUserId,
      isActive: true,
    })
      .populate('users', 'name photos bio')
      .sort({ createdAt: -1 });

    // Transform: strip current user from each match, return only the matched person
    const formattedMatches = matches.map((match) => {
      const matchedUser = match.users.find(
        (user) => user._id.toString() !== currentUserId.toString()
      );

      return {
        _id: match._id,
        user: matchedUser,
        createdAt: match.createdAt,
      };
    });

    return res.status(200).json({
      success: true,
      data: formattedMatches,
    });
  } catch (error) {
    console.error('Get matches error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while fetching matches',
    });
  }
};

module.exports = { getMatches };
