const mongoose = require('mongoose');
const Bid = require('../models/Bid');
const Gig = require('../models/Gig');

exports.createBid = async (req, res) => {
  try {
    const { gigId, message, price } = req.body;
    const gig = await Gig.findById(gigId);
    if (!gig) return res.status(404).json({ message: 'Gig not found' });
    if (gig.owner.toString() === req.user._id.toString()) return res.status(400).json({ message: 'Owner cannot bid' });
    const bid = await Bid.create({ gig: gigId, bidder: req.user._id, message, price });

    // Emit socket event to gig owner about new bid
    const io = req.app.get('io');
    if (io && gig.owner) {
      io.to(gig.owner.toString()).emit('new_bid', { gigId: gig._id.toString(), bid: { _id: bid._id.toString(), bidder: req.user._id.toString(), message, price } });
    }

    res.json({ bid });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.myCounts = async (req, res) => {
  try {
    const userId = req.user._id;
    const totalBids = await Bid.countDocuments({ bidder: userId });
    const hiredJobs = await Bid.countDocuments({ bidder: userId, status: 'Hired' });
    res.json({ totalBids, hiredJobs });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.myHired = async (req, res) => {
  try {
    const userId = req.user._id;
    const hired = await Bid.find({ bidder: userId, status: 'Hired' }).populate({ path: 'gig', populate: { path: 'owner', select: 'name avatarUrl' } }).sort({ createdAt: -1 });
    res.json({ hired });
  } catch (err) {
    console.error('myHired error', err && err.stack ? err.stack : err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Hire a bidder for a gig. Uses transaction to prevent race conditions and emits socket event.
exports.hire = async (req, res) => {
  let session = null;
  // Attempt to start a transaction session; if not supported (single-node), proceed without it
  try {
    session = await mongoose.startSession();
    session.startTransaction();
  } catch (e) {
    console.warn('MongoDB transactions not available, proceeding without transaction:', e && e.message);
    session = null;
  }

  try {
    const { gigId, bidId } = req.body;
    console.log('Hire request received:', { user: req.user?._id, gigId, bidId });
    const gig = session ? await Gig.findById(gigId).session(session) : await Gig.findById(gigId);
    if (!gig) {
      console.warn('Hire failed: gig not found', gigId);
      if (session) await session.abortTransaction();
      return res.status(404).json({ message: 'Gig not found' });
    }
    if (gig.owner.toString() !== req.user._id.toString()) {
      console.warn('Hire auth failed: requester not owner', { owner: gig.owner.toString(), requester: req.user._id.toString() });
      if (session) await session.abortTransaction();
      return res.status(403).json({ message: 'Not authorized' });
    }
    if (gig.status === 'Assigned') {
      console.warn('Hire failed: gig already assigned', gigId);
      if (session) await session.abortTransaction();
      return res.status(400).json({ message: 'Gig already assigned' });
    }
    const bid = session ? await Bid.findById(bidId).session(session) : await Bid.findById(bidId);
    if (!bid || bid.gig.toString() !== gig._id.toString()) {
      console.warn('Hire failed: invalid bid or bid/gig mismatch', { bid: bid?._id, bidGig: bid?._id && bid.gig ? bid.gig.toString() : null, gig: gig._id });
      if (session) await session.abortTransaction();
      return res.status(400).json({ message: 'Invalid bid' });
    }

    // Set selected bid to Hired, others to Rejected, assign gig
    if (session) {
      await Bid.updateMany({ gig: gig._id, _id: { $ne: bid._id } }, { $set: { status: 'Rejected' } }).session(session);
      bid.status = 'Hired';
      await bid.save({ session });
      gig.status = 'Assigned';
      gig.assignedTo = bid.bidder;
      await gig.save({ session });
      await session.commitTransaction();
    } else {
      // fallback: non-transactional updates
      await Bid.updateMany({ gig: gig._id, _id: { $ne: bid._id } }, { $set: { status: 'Rejected' } });
      bid.status = 'Hired';
      await bid.save();
      gig.status = 'Assigned';
      gig.assignedTo = bid.bidder;
      await gig.save();
    }

    // Emit socket event if socket server exists
    const io = req.app.get('io');
    if (io) {
      io.to(bid.bidder.toString()).emit('hired', { project: gig.title, gigId: gig._id.toString() });
    }

    res.json({ message: 'Hired', gig, bid });
  } catch (err) {
    console.error('Hire controller error:', err && err.stack ? err.stack : err);
    // If this error is due to transactions not being supported, retry without transactions
    const msg = err && err.message ? err.message : '';
    if (msg.includes('Transaction numbers are only allowed') || msg.toLowerCase().includes('transactions')) {
      console.warn('Retrying hire without transactions due to unsupported server transactions');
      try {
        // non-transactional fallback: perform same steps without a session
        const { gigId, bidId } = req.body;
        const gig2 = await Gig.findById(gigId);
        if (!gig2) return res.status(404).json({ message: 'Gig not found' });
        if (gig2.owner.toString() !== req.user._id.toString()) return res.status(403).json({ message: 'Not authorized' });
        if (gig2.status === 'Assigned') return res.status(400).json({ message: 'Gig already assigned' });
        const bid2 = await Bid.findById(bidId);
        if (!bid2 || bid2.gig.toString() !== gig2._id.toString()) return res.status(400).json({ message: 'Invalid bid' });
        await Bid.updateMany({ gig: gig2._id, _id: { $ne: bid2._id } }, { $set: { status: 'Rejected' } });
        bid2.status = 'Hired';
        await bid2.save();
        gig2.status = 'Assigned';
        gig2.assignedTo = bid2.bidder;
        await gig2.save();
        // Emit socket event
        const io = req.app.get('io');
        if (io) io.to(bid2.bidder.toString()).emit('hired', { project: gig2.title, gigId: gig2._id.toString() });
        return res.json({ message: 'Hired', gig: gig2, bid: bid2 });
      } catch (err2) {
        console.error('Fallback hire (no transactions) failed:', err2 && err2.stack ? err2.stack : err2);
        if (session) await session.abortTransaction();
        const message2 = (err2 && err2.message) ? err2.message : 'Server error';
        return res.status(500).json({ message: 'Server error', error: message2 });
      }
    }
    if (session) await session.abortTransaction();
    const message = (err && err.message) ? err.message : 'Server error';
    // expose message in development to aid debugging
    res.status(500).json({ message: 'Server error', error: message });
  } finally {
    if (session) session.endSession();
  }
};
