const express = require('express');
const router = express.Router();
const Question = require('../models/Question');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.ADMIN_JWT_SECRET || 'forgeai-admin-secret-change-me';

// Inline admin authorization middleware
const requireAdmin = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: 'Authorization header is missing' });
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'Token is missing' });
    }

    jwt.verify(token, JWT_SECRET, (err, decoded) => {
      if (err) {
        return res.status(403).json({ error: 'Invalid or expired token' });
      }
      // Check if user has admin role in token payload
      if (decoded && decoded.role === 'admin') {
        req.user = decoded;
        next();
      } else {
        return res.status(403).json({ error: 'Admin privileges required' });
      }
    });
  } catch (error) {
    return res.status(500).json({ error: 'Internal authorization error' });
  }
};

// GET /api/questions - PUBLIC: list all questions (with optional topicId filter)
router.get('/', async (req, res) => {
  try {
    const { topicId } = req.query;
    const filter = {};
    if (topicId) {
      filter.topicId = topicId;
    }
    const questions = await Question.find(filter);
    return res.status(200).json(questions);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch questions: ' + error.message });
  }
});

// GET /api/questions/:id - PUBLIC: fetch single question details
router.get('/:id', async (req, res) => {
  try {
    const question = await Question.findById(req.params.id);
    if (!question) {
      return res.status(404).json({ error: 'Question not found' });
    }
    return res.status(200).json(question);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch question: ' + error.message });
  }
});

// POST /api/questions - PUBLIC: anyone can create (visitors submitting, admin panels)
router.post('/', async (req, res) => {
  try {
    const { topicId, questionText, options, correctOptionIndex, points } = req.body;

    if (!topicId || !questionText || !options) {
      return res.status(400).json({ error: 'topicId, questionText, and options are required fields' });
    }

    const parsedCorrectIndex = Number(correctOptionIndex);
    if (isNaN(parsedCorrectIndex)) {
      return res.status(400).json({ error: 'correctOptionIndex must be a number' });
    }

    const finalOptions = Array.isArray(options) 
      ? options 
      : (typeof options === 'string' && options.startsWith('[') ? JSON.parse(options) : [options]);

    const question = new Question({
      topicId,
      questionText,
      options: finalOptions,
      correctOptionIndex: parsedCorrectIndex,
      points: points !== undefined ? Number(points) : 10
    });

    const savedQuestion = await question.save();
    return res.status(201).json(savedQuestion);
  } catch (error) {
    return res.status(400).json({ error: 'Failed to create question: ' + error.message });
  }
});

// PUT /api/questions/:id - requireAdmin: edit existing question
router.put('/:id', requireAdmin, async (req, res) => {
  try {
    const { topicId, questionText, options, correctOptionIndex, points } = req.body;
    
    const question = await Question.findById(req.params.id);
    if (!question) {
      return res.status(404).json({ error: 'Question not found' });
    }

    if (topicId !== undefined) question.topicId = topicId;
    if (questionText !== undefined) question.questionText = questionText;
    if (options !== undefined) {
      question.options = Array.isArray(options) 
        ? options 
        : (typeof options === 'string' && options.startsWith('[') ? JSON.parse(options) : [options]);
    }
    if (correctOptionIndex !== undefined) {
      const parsedCorrectIndex = Number(correctOptionIndex);
      if (isNaN(parsedCorrectIndex)) {
        return res.status(400).json({ error: 'correctOptionIndex must be a number' });
      }
      question.correctOptionIndex = parsedCorrectIndex;
    }
    if (points !== undefined) {
      question.points = Number(points);
    }

    const updatedQuestion = await question.save();
    return res.status(200).json(updatedQuestion);
  } catch (error) {
    return res.status(400).json({ error: 'Failed to update question: ' + error.message });
  }
});

// DELETE /api/questions/:id - requireAdmin: delete question
router.delete('/:id', requireAdmin, async (req, res) => {
  try {
    const question = await Question.findByIdAndDelete(req.params.id);
    if (!question) {
      return res.status(404).json({ error: 'Question not found' });
    }
    return res.status(200).json({ message: 'Question successfully deleted', id: req.params.id });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to delete question: ' + error.message });
  }
});

module.exports = router;