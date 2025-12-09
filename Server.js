// server.js
const express = require('express');
const cors = require('cors');
const { Configuration, OpenAIApi } = require('openai');

require('dotenv').config();

const app = express();
const port = process.env.PORT || 3001;

// ONLY allow your frontend origin (or remove in dev)
const corsOptions = {
  origin: process.env.FRONTEND_URL || 'http://localhost:3000', // your HTML file served via http-server
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());

// Initialize OpenAI
const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY, // ← Securely loaded from .env
});
const openai = new OpenAIApi(configuration);

// Chat endpoint
app.post('/api/chat', async (req, res) => {
  try {
    const { messages } = req.body;

    const completion = await openai.createChatCompletion({
      model: "gpt-4-turbo",
      messages: [
        {
          role: "system",
          content: "You are Neural AI — brilliant, friendly, ultra-modern. Be concise but helpful. Use emojis sparingly. If asked about images, say: 'Switch to the Image Generator tab to create visuals!'"
        },
        ...messages
      ],
      temperature: 0.7,
      max_tokens: 500,
    });

    const reply = completion.data.choices[0].message.content;
    res.json({ reply });
  } catch (error) {
    console.error('Chat error:', error.response?.data || error.message);
    res.status(500).json({ error: error.message || 'Failed to generate response' });
  }
});

// Image generation endpoint
app.post('/api/generate-image', async (req, res) => {
  try {
    const { prompt } = req.body;

    const imageResponse = await openai.createImage({
      model: "dall-e-3",
      prompt: prompt,
      n: 1,
      size: "1024x1024",
    });

    const imageUrl = imageResponse.data.data[0].url;
    res.json({ imageUrl });
  } catch (error) {
    console.error('Image error:', error.response?.data || error.message);
    res.status(500).json({ error: error.message || 'Failed to generate image' });
  }
});

app.listen(port, () => {
  console.log(`✅ Neural AI backend running on http://localhost:${port}`);
  console.log(`🌐 CORS allowed for: ${corsOptions.origin}`);
});
