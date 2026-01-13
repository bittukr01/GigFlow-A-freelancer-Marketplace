const mongoose = require('mongoose');

const BidSchema = new mongoose.Schema({
  gig: { type: mongoose.Schema.Types.ObjectId, ref: 'Gig', required: true },
  bidder: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  message: { type: String },
  price: { type: Number, required: true },
  status: { type: String, enum: ['Pending', 'Hired', 'Rejected'], default: 'Pending' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Bid', BidSchema);
