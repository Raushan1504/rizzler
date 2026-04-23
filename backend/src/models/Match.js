const mongoose = require('mongoose');

const matchSchema = new mongoose.Schema(
  {
    users: {
      type: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
      ],
      validate: {
        validator: function (arr) {
          return arr.length === 2;
        },
        message: 'A match must have exactly 2 users',
      },
      required: [true, 'Users are required for a match'],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient lookups by user
matchSchema.index({ users: 1 });

module.exports = mongoose.model('Match', matchSchema);
