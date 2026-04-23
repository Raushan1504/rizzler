const Anthropic = require('@anthropic-ai/sdk');

const client = new Anthropic({
  apiKey: process.env.CLAUDE_API_KEY,
});

const generateBio = async (prompt) => {
  try {
    const message = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 300,
      messages: [
        {
          role: 'user',
          content: `You are a creative dating profile writer. Generate a fun, authentic, and engaging dating profile bio based on the following information. Keep it under 500 characters and make it sound natural, not generic.\n\n${prompt}`,
        },
      ],
    });
    const textBlock = message.content.find((block) => block.type === 'text');
    return textBlock ? textBlock.text : '';
  } catch (error) {
    console.error('Claude generateBio error:', error);
    throw new Error('Failed to generate bio. Please try again later.');
  }
};

const generateIcebreaker = async (matchData) => {
  try {
    const { userName, userInterests, matchName, matchInterests, matchBio } = matchData;
    const prompt = `Generate a creative, personalized icebreaker message for a dating app.
Sender: ${userName}, interests: ${(userInterests || []).join(', ')}
Match: ${matchName}, interests: ${(matchInterests || []).join(', ')}, bio: ${matchBio || 'N/A'}
Write a short, witty opening message (1-2 sentences). Reference shared interests if possible.`;

    const message = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 150,
      messages: [{ role: 'user', content: prompt }],
    });
    const textBlock = message.content.find((block) => block.type === 'text');
    return textBlock ? textBlock.text : '';
  } catch (error) {
    console.error('Claude generateIcebreaker error:', error);
    throw new Error('Failed to generate icebreaker. Please try again later.');
  }
};

module.exports = { generateBio, generateIcebreaker };
