import express from 'express';
import { createServer } from 'http';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

import { connectDB } from './config/db.js';
import passengerRoutes from './routes/passengers.js';
import flightRoutes from './routes/flights.js';
import scheduleRoutes from './routes/schedules.js';
import reservationRoutes from './routes/reservations.js';
import queryRoutes from './routes/queries.js';
import paymentRoutes from './routes/payments.js';

async function startServer() {
  await connectDB();

  const app = express();
  const httpServer = createServer(app);
  const PORT = Number(process.env.PORT) || 5000;
  const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

  // Middleware
  app.use(cors({ origin: CLIENT_URL, credentials: true }));
  app.use(express.json());

  // Routes
  app.use('/api/passengers', passengerRoutes);
  app.use('/api/flights', flightRoutes);
  app.use('/api/schedules', scheduleRoutes);
  app.use('/api/reservations', reservationRoutes);
  app.use('/api/queries', queryRoutes);
  app.use('/api/payments', paymentRoutes);

  // Health check
  app.get('/api/health', (_, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));

  httpServer.listen(PORT, '0.0.0.0', () => {
    console.log(`\n✈️  SkyFlow Backend running on http://localhost:${PORT}`);
    console.log(`   Client URL: ${CLIENT_URL}`);
  });
}

startServer();
