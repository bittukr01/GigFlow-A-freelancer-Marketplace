// const http = require('http');
// const app = require('./index');
// const connectDB = require('./config/db');
// const dotenv = require('dotenv');

// dotenv.config();

// const PORT = process.env.PORT || 4000;

// connectDB(process.env.MONGO_URI || 'mongodb://localhost:27017/gigflow');

// const server = http.createServer(app);

// const { Server } = require('socket.io');
// const io = new Server(server, {
//   cors: {
//     origin: process.env.CLIENT_URL || 'http://localhost:5173',
//     credentials: true
//   }
// });

// // Map userId -> socket rooms
// io.on('connection', (socket) => {
//   const { userId } = socket.handshake.query || {};
//   if (userId) socket.join(userId);
//   socket.on('join', (id) => socket.join(id));
//   socket.on('disconnect', () => {});
// });

// app.set('io', io);

// server.listen(PORT, () => {
//   console.log(`Server listening on ${PORT}`);
// });

// process.on('unhandledRejection', (reason, p) => {
//   console.error('Unhandled Rejection at:', p, 'reason:', reason);
// });

// process.on('uncaughtException', (err) => {
//   console.error('Uncaught Exception thrown:', err && err.stack ? err.stack : err);
// });

const http = require('http');
const app = require('./index');
const connectDB = require('./config/db');
const dotenv = require('dotenv');

dotenv.config();

const PORT = process.env.PORT || 4000;

connectDB(process.env.MONGO_URI || 'mongodb://localhost:27017/gigflow');

const server = http.createServer(app);

const { Server } = require('socket.io');

// ✅ FIXED: Socket.IO CORS with credentials support
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true
  }
});

// Map userId -> socket rooms
io.on('connection', (socket) => {
  const { userId } = socket.handshake.query || {};
  if (userId) socket.join(userId);
  socket.on('join', (id) => socket.join(id));
  socket.on('disconnect', () => {});
});

app.set('io', io);

server.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});

process.on('unhandledRejection', (reason, p) => {
  console.error('Unhandled Rejection at:', p, 'reason:', reason);
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception thrown:', err && err.stack ? err.stack : err);
});
