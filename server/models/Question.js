const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema(
  {
    topicId: {
      type: String,
      required: true,
      trim: true
    },
    questionText: {
      type: String,
      required: true,
      trim: true
    },
    options: {
      type: [String], 
      required: true,
      default: []
    },
    correctOptionIndex: {
      type: Number,
      required: true,
      min: 0,
      default: 0
    },
    points: {
      type: Number,
      required: true,
      min: 1,
      default: 100
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Question', questionSchema);