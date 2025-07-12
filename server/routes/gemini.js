const express = require('express');
const router = express.Router();
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

router.post('/ask', async (req, res) => {
  const { question } = req.body;
  console.log('[Gemini] /ask endpoint hit. Question:', question);
  const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
  if (!GEMINI_API_KEY) {
    console.error('[Gemini] GEMINI_API_KEY is missing!');
    return res.status(500).json({ answer: 'Gemini API key is missing. Please check your server .env configuration.' });
  }
  if (!question || question.length > 1024) {
    console.error('[Gemini] Invalid question.');
    return res.status(400).json({ answer: 'Prompt is missing or too long. Please shorten your request.' });
  }
  try {
    console.log('[Gemini] Sending request to Gemini API...');
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                { text: question }
              ]
            }
          ]
        })
      }
    );
    console.log('[Gemini] Response received from Gemini API. Status:', response.status);
    const data = await response.json();
    if (data.error) {
      console.error('[Gemini] Gemini API error:', data.error);
      return res.status(502).json({ answer: data.error.message || 'Gemini API error. Please try again later.' });
    }
    const aiText = data?.candidates?.[0]?.content?.parts?.[0]?.text || 'Sorry, I could not generate a response.';
    res.json({ answer: aiText });
  } catch (err) {
    console.error('[Gemini] Internal server error:', err);
    res.status(500).json({ answer: 'Internal server error. Please try again later or contact support.' });
  }
});

// List available models for this API key
router.get('/list-models', async (req, res) => {
  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1/models?key=${GEMINI_API_KEY}`
    );
    const data = await response.json();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Failed to list models.' });
  }
});

module.exports = router; 