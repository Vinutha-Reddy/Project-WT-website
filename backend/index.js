// index.js

const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Path to data file
const DATA_FILE = path.join(__dirname, 'data.json');

// Helper: read JSON data
function readData() {
  try {
    const data = fs.readFileSync(DATA_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (err) {
    return { responses: [] }; // if file doesn't exist or is empty
  }
}

// Helper: write JSON data
function writeData(obj) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(obj, null, 2));
}

// Health check route
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Submit a response
// Expected body: { userId?: string, mood, energy, stress, productivity, sleep, social, health, motivation, focus, overall, note?: string }
app.post('/api/responses', (req, res) => {
  try {
    const { mood, energy, stress, productivity, sleep, social, health, motivation, focus, overall, note, userId } = req.body;
    
    // Validate required fields
    const requiredFields = { mood, energy, stress, productivity, sleep, social, health, motivation, focus, overall };
    for (const [field, value] of Object.entries(requiredFields)) {
      if (!value) return res.status(400).json({ error: `${field} is required` });
    }

    const data = readData();
    const response = {
      id: Date.now().toString(),
      userId: userId || null,
      mood,
      energy,
      stress,
      productivity,
      sleep,
      social,
      health,
      motivation,
      focus,
      overall,
      note: note || null,
      timestamp: new Date().toISOString()
    };

    data.responses.push(response);
    writeData(data);

    res.status(201).json({ success: true, response });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'internal server error' });
  }
});

// Get all responses (for dev use)
app.get('/api/responses', (req, res) => {
  const data = readData();
  res.json(data.responses);
});

// Get summary / analytics
app.get('/api/summary', (req, res) => {
  const data = readData();
  const responses = data.responses || [];
  const total = responses.length;
  
  if (total === 0) {
    return res.json({ 
      total: 0, 
      similarity: 0,
      message: "Be the first to share how you're feeling!" 
    });
  }

  // Get user's current response for comparison
  const userResponse = req.query;
  
  // Calculate exact matches (people feeling exactly the same across ALL categories)
  let exactMatches = 0;
  let partialMatches = 0;
  
  const categories = ['mood', 'energy', 'stress', 'productivity', 'sleep', 'social', 'health', 'motivation', 'focus', 'overall'];
  
  responses.forEach(response => {
    let matchingCategories = 0;
    
    categories.forEach(category => {
      if (userResponse[category] && response[category] === userResponse[category]) {
        matchingCategories++;
      }
    });
    
    // Exact match: all 10 categories match
    if (matchingCategories === 10) {
      exactMatches++;
    }
    // Partial match: 7+ categories match
    else if (matchingCategories >= 7) {
      partialMatches++;
    }
  });

  // Calculate individual category statistics
  const stats = {};
  categories.forEach(category => {
    const counts = {};
    responses.forEach(r => {
      if (r[category]) {
        counts[r[category]] = (counts[r[category]] || 0) + 1;
      }
    });
    
    const percentages = {};
    Object.keys(counts).forEach(option => {
      percentages[option] = Math.round((counts[option] / total) * 100);
    });
    
    stats[category] = { counts, percentages };
  });

  // Calculate similarity percentages
  const exactSimilarity = Math.round((exactMatches / total) * 100);
  const overallSimilarity = Math.round(((exactMatches + partialMatches) / total) * 100);

  const result = {
    total,
    exactMatches,
    partialMatches,
    exactSimilarity,
    overallSimilarity,
    stats,
    message: exactMatches > 0 
      ? `${exactMatches} ${exactMatches === 1 ? 'person feels' : 'people feel'} exactly like you today!`
      : partialMatches > 0 
        ? `${partialMatches} ${partialMatches === 1 ? 'person feels' : 'people feel'} very similar to you today!`
        : "You're unique today! No one feels exactly like you."
  };

  res.json(result);
});

// Start server
app.listen(PORT, () => {
  console.log(`WT backend running on http://localhost:${PORT}`);
});
