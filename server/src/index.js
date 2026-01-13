const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const authRoutes = require('./routes/auth');
const gigsRoutes = require('./routes/gigs');
const bidsRoutes = require('./routes/bids');

dotenv.config();

const app = express();
app.use(express.json());
app.use(cookieParser());

const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

app.use(cors({ origin: CLIENT_URL, credentials: true }));

app.get('/', (req, res) => res.json({ ok: true }));

app.use('/api/auth', authRoutes);
app.use('/api/gigs', gigsRoutes);
app.use('/api/bids', bidsRoutes);

// basic error handler
app.use((err, req, res, next) => {
  console.error('Express error handler:', err && err.stack ? err.stack : err);
  const message = err && err.message ? err.message : 'Server error';
  const payload = { message };
  if (process.env.NODE_ENV !== 'production') payload.error = err;
  res.status(500).json(payload);
});

module.exports = app;
