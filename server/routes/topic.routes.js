const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const Topic = require('../models/Topic');

// JWT Secret for Admin Verification
const ADMIN_JWT_SECRET = process.env.ADMIN_JWT_SECRET || 'forgeai-admin-secret-change-me';

// Inline middleware to check Admin Authorization
const requireAdmin = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: 'Access denied. No token provided.' });
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'Access denied. Invalid token format.' });
    }

    jwt.verify(token, ADMIN_JWT_SECRET, (err, decoded) => {
      if (err) {
        return res.status(403).json({ error: 'Access denied. Invalid or expired token.' });
      }
      req.admin = decoded;
      next();
    });
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error in authorization' });
  }
};

// Helper: generate unique slug from title
const generateSlug = (title) => {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');
};

// GET /api/topics - PUBLIC - List all topics
router.get('/', async (req, res) => {
  try {
    const topics = await Topic.find({}).sort({ title: 1 });
    return res.status(200).json(topics);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to retrieve topics', message: error.message });
  }
});

// GET /api/topics/:id - PUBLIC - Get single topic (handles both ID and Slug queries)
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    let topic = null;

    // Check if ID is a valid MongoDB ObjectId
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      topic = await Topic.findById(id);
    }

    // Fallback to searching by slug
    if (!topic) {
      topic = await Topic.findOne({ slug: id });
    }

    if (!topic) {
      return res.status(404).json({ error: 'Topic not found' });
    }

    return res.status(200).json(topic);
  } catch (error) {
    return res.status(500).json({ error: 'Error retrieving topic', message: error.message });
  }
});

// POST /api/topics - PUBLIC - Create a new topic
router.post('/', async (req, res) => {
  try {
    const { title, description, difficulty, slug } = req.body;

    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }

    const computedSlug = slug || generateSlug(title);

    // Ensure slug uniqueness
    const existingTopic = await Topic.findOne({ slug: computedSlug });
    if (existingTopic) {
      return res.status(400).json({ error: `A topic with slug "${computedSlug}" already exists` });
    }

    const newTopic = new Topic({
      title,
      description: description || '',
      difficulty: difficulty || 'Medium',
      slug: computedSlug
    });

    const savedTopic = await newTopic.save();
    return res.status(201).json(savedTopic);
  } catch (error) {
    return res.status(400).json({ error: 'Failed to create topic', message: error.message });
  }
});

// PUT /api/topics/:id - requireAdmin only - Update an existing topic
router.put('/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, difficulty, slug } = req.body;

    const topic = await Topic.findById(id);
    if (!topic) {
      return res.status(404).json({ error: 'Topic not found' });
    }

    if (title) topic.title = title;
    if (description !== undefined) topic.description = description;
    if (difficulty) topic.difficulty = difficulty;
    if (slug) {
      // Ensure the updated custom slug is unique
      const existingWithSlug = await Topic.findOne({ slug, _id: { $ne: id } });
      if (existingWithSlug) {
        return res.status(400).json({ error: `The slug "${slug}" is already in use by another topic` });
      }
      topic.slug = slug;
    } else if (title) {
      // Re-generate slug if title changed and slug is not explicitly supplied
      topic.slug = generateSlug(title);
    }

    const updatedTopic = await topic.save();
    return res.status(200).json(updatedTopic);
  } catch (error) {
    return res.status(400).json({ error: 'Failed to update topic', message: error.message });
  }
});

// DELETE /api/topics/:id - requireAdmin only - Delete a topic
router.delete('/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const deletedTopic = await Topic.findByIdAndDelete(id);

    if (!deletedTopic) {
      return res.status(404).json({ error: 'Topic not found' });
    }

    return res.status(200).json({
      message: 'Topic deleted successfully',
      topic: deletedTopic
    });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to delete topic', message: error.message });
  }
});

module.exports = router;