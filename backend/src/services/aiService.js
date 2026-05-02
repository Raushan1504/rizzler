const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize the Gemini client
// We initialize it inside the functions to ensure process.env.GEMINI_API_KEY is loaded
const getGenAI = () => {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY is missing in .env');
  }
  return new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
};

const generateBio = async (prompt) => {
  try {
    const genAI = getGenAI();
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const fullPrompt = `You are a creative dating profile writer. Generate a fun, authentic, and engaging dating profile bio based on the following information. Keep it under 500 characters and make it sound natural, not generic.\n\n${prompt}`;

    const result = await model.generateContent(fullPrompt);
    const response = await result.response;
    return response.text() || '';
  } catch (error) {
    console.error('Gemini generateBio error:', error);
    throw new Error('Failed to generate bio. Please try again later.');
  }
};

const generateIcebreaker = async (matchData) => {
  try {
    const genAI = getGenAI();
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const { userName, userInterests, matchName, matchInterests, matchBio } = matchData;
    const fullPrompt = `Generate a creative, personalized icebreaker message for a dating app.
Sender: ${userName}, interests: ${(userInterests || []).join(', ')}
Match: ${matchName}, interests: ${(matchInterests || []).join(', ')}, bio: ${matchBio || 'N/A'}
Write a short, witty opening message (1-2 sentences). Reference shared interests if possible.`;

    const result = await model.generateContent(fullPrompt);
    const response = await result.response;
    return response.text() || '';
  } catch (error) {
    console.error('Gemini generateIcebreaker error:', error);
    throw new Error('Failed to generate icebreaker. Please try again later.');
  }
};

module.exports = { generateBio, generateIcebreaker };
