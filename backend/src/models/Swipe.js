const mongoose = require('mongoose');

const swipeSchema = new mongoose.Schema(
  {
    swiper: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Swiper is required'],
      index: true,
    },
    swiped: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Swiped user is required'],
      index: true,
    },
    action: {
      type: String,
      enum: ['like', 'dislike'],
      required: [true, 'Swipe action is required'],
    },
  },
  {
    timestamps: true,
  }
);

// Compound index to ensure a user can only swipe on another user once
swipeSchema.index({ swiper: 1, swiped: 1 }, { unique: true });

module.exports = mongoose.model('Swipe', swipeSchema);
