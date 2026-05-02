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

/**
 * @desc    Unmatch / Delete a match
 * @route   DELETE /api/matches/:matchId
 * @access  Private
 */
const deleteMatch = async (req, res) => {
  try {
    const { matchId } = req.params;
    const currentUserId = req.user._id;

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
        message: 'You do not have permission to delete this match',
      });
    }

    // Delete the match (and ideally messages, but we rely on DB cascade or keep them orphaned for MVP)
    await Match.findByIdAndDelete(matchId);

    return res.status(200).json({
      success: true,
      message: 'Successfully unmatched',
    });
  } catch (error) {
    console.error('Delete match error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while deleting match',
    });
  }
};

module.exports = { getMatches, deleteMatch };
