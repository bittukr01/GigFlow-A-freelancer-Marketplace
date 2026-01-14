const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const dotenv = require('dotenv');
const authRoutes = require('./routes/auth');
const gigsRoutes = require('./routes/gigs');
const bidsRoutes = require('./routes/bids');

dotenv.config();

const app = express();

app.use(express.json());
app.use(cookieParser());

// ✅ ALLOWED ORIGINS (LOCAL + DEPLOY)
const allowedOrigins = [
  'http://localhost:5173',
  'https://gigflow-frontend-8kyr.onrender.com/'
];

app.use(
  cors({
    origin: function (origin, callback) {
      // allow requests with no origin (like Postman)
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      } else {
        console.log('Blocked by CORS:', origin);
        return callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
  })
);

app.get('/', (req, res) => res.json({ ok: true }));

app.use('/api/auth', authRoutes);
app.use('/api/gigs', gigsRoutes);
app.use('/api/bids', bidsRoutes);

// basic error handler
app.use((err, req, res, next) => {
  console.error('Express error handler:', err && err.stack ? err.stack : err);
  res.status(500).json({ message: err.message || 'Server error' });
});

module.exports = app;
