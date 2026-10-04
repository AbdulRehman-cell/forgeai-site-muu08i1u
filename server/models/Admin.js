const mongoose = require('mongoose');

const adminSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    role: {
      type: String,
      required: true,
      default: 'admin'
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Admin', adminSchema);