import 'dotenv/config';
import cors from 'cors';
import express from 'express';
import mongoose from 'mongoose';
import appointmentsRouter from './routes/appointments.js';

const app = express();
const port = Number(process.env.PORT) || 5000;

app.use(cors({ origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173' }));
app.use(express.json({ limit: '20kb' }));

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected' });
});
app.use('/api/appointments', appointmentsRouter);
app.use((error, req, res, next) => {
  console.error(error);
  if (res.headersSent) return next(error);
  res.status(500).json({ message: 'The server could not complete your request.' });
});

async function start() {
  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) throw new Error('MONGODB_URI is required. Copy backend/.env.example to backend/.env and configure MongoDB.');
  await mongoose.connect(mongoUri);
  app.listen(port, () => console.log(`Smart Queue API listening on http://localhost:${port}`));
}

start().catch((error) => {
  console.error('Unable to start Smart Queue API:', error.message);
  process.exitCode = 1;
});
