require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fetch = require('node-fetch'); // make sure node-fetch@2 installed

const app = express();
const PORT = 5000;

app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));

function getSystemPrompt(role) {
  switch (role) {
    case 'student':
      return 'You are a helpful assistant who supports students with study tips, career guidance, and mental health.';
    case 'farmer':
      return 'You are a knowledgeable assistant helping farmers with crop advice, weather updates, and agricultural tips.';
    case 'doctor':
      return 'You are a medical assistant providing health information and advice for doctors and healthcare professionals.';
    default:
      return 'You are a kind, empathetic counselor offering general support.';
  }
}

app.post('/chat', async (req, res) => {
  const { message, role } = req.body;
  const systemPrompt = getSystemPrompt(role);

  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'http://localhost:5000',
        'X-Title': 'Mental Health Chatbot',
      },
      body: JSON.stringify({
        model: 'openai/gpt-3.5-turbo',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: message }
        ],
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('OpenRouter API error:', data);
      return res.status(500).json({ error: 'OpenRouter API error', details: data });
    }

    res.json({ reply: data.choices[0].message.content });

  } catch (err) {
    console.error('Fetch failed:', err);
    res.status(500).json({ error: 'Server error', details: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
