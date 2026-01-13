const Gig = require('../models/Gig');
const Bid = require('../models/Bid');

exports.createGig = async (req, res) => {
  try {
    const { title, description, budget } = req.body;
    const gig = await Gig.create({ title, description, budget, owner: req.user._id });
    res.json({ gig });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.listGigs = async (req, res) => {
  try {
    const { search } = req.query;
    const filter = {};
    if (search) filter.title = { $regex: search, $options: 'i' };
    const gigs = await Gig.find(filter).populate('owner', 'name avatarUrl').sort({ createdAt: -1 }).limit(100);
    res.json({ gigs });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getGig = async (req, res) => {
  try {
    const gig = await Gig.findById(req.params.id).populate('owner', 'name avatarUrl');
    if (!gig) return res.status(404).json({ message: 'Not found' });
    // Only return bids if the requester is the owner
    let bids = [];
    if (req.user && gig.owner && req.user._id.toString() === gig.owner._id.toString()) {
      bids = await Bid.find({ gig: gig._id }).populate('bidder', 'name avatarUrl');
    }
    res.json({ gig, bids });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};
