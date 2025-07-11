const express = require('express');
const router = express.Router();
const Feedback = require('../models/Feedback');

router.get('/ping', (req, res) => {
  res.json({ message: 'pong' });
});

router.use('/auth', require('./auth'));
router.use('/bmi', require('./bmi'));
router.use('/steps', require('./steps'));
router.use('/activity', require('./activity'));
router.use('/weight', require('./weight'));
router.use('/milestone', require('./milestone'));
router.use('/nutrition', require('./nutrition'));
router.use('/calories', require('./calories'));
router.use('/settings', require('./settings'));

// Get all feedbacks
router.get('/feedback', async (req, res) => {
  try {
    const feedbacks = await Feedback.find()
      .sort({ createdAt: -1 }) // Most recent first
      .limit(50); // Limit to last 50 feedbacks
    
    res.json({ 
      success: true, 
      feedbacks 
    });
  } catch (error) {
    console.error('Error fetching feedbacks:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch feedbacks' 
    });
  }
});

// Submit feedback
router.post('/feedback', async (req, res) => {
  try {
    const { name, email, message, rating } = req.body;
    
    // Validate required fields
    if (!name || !email || !message || !rating) {
      return res.status(400).json({ 
        success: false, 
        message: 'All fields are required including rating' 
      });
    }

    // Validate rating range
    if (rating < 1 || rating > 5) {
      return res.status(400).json({ 
        success: false, 
        message: 'Rating must be between 1 and 5' 
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please provide a valid email address' 
      });
    }

    // Save feedback to database
    const newFeedback = new Feedback({
      name,
      email,
      rating,
      message
    });

    await newFeedback.save();

    console.log('New Feedback Saved:', {
      name,
      email,
      rating,
      message,
      timestamp: new Date().toISOString()
    });

    res.json({ 
      success: true, 
      message: 'Thank you for your feedback! We appreciate your input.' 
    });

  } catch (error) {
    console.error('Feedback submission error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to submit feedback. Please try again.' 
    });
  }
});

module.exports = router; 