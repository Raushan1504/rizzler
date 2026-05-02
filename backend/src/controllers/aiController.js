const { generateBio, generateIcebreaker } = require('../services/aiService');
const User = require('../models/User');

const generateAiBio = async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt) {
      return res.status(400).json({ success: false, message: 'Prompt is required' });
    }

    const bio = await generateBio(prompt);
    
    return res.status(200).json({
      success: true,
      data: bio,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to generate bio',
    });
  }
};

const generateAiIcebreaker = async (req, res) => {
  try {
    const { matchId } = req.body;
    const currentUserId = req.user._id;

    // Fetch the match and populate the users
    const Match = require('../models/Match');
    const match = await Match.findById(matchId).populate('users');
    
    if (!match) {
      return res.status(404).json({ success: false, message: 'Match not found' });
    }

    const matchedUser = match.users.find(u => u._id.toString() !== currentUserId.toString());
    const currentUser = match.users.find(u => u._id.toString() === currentUserId.toString());

    if (!matchedUser || !currentUser) {
      return res.status(400).json({ success: false, message: 'Invalid match data' });
    }

    const matchData = {
      userName: currentUser.name,
      userInterests: currentUser.interests,
      matchName: matchedUser.name,
      matchInterests: matchedUser.interests,
      matchBio: matchedUser.bio,
    };

    const icebreaker = await generateIcebreaker(matchData);
    
    return res.status(200).json({
      success: true,
      data: icebreaker,
    });
  } catch (error) {
    console.error('Icebreaker generation error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to generate icebreaker',
    });
  }
};

module.exports = { generateAiBio, generateAiIcebreaker };
