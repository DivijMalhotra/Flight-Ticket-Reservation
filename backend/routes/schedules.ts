import { Router, Request, Response } from 'express';
import FlightSchedule from '../models/FlightSchedule.js';
import Flight from '../models/Flight.js';

const router = Router();

// GET all schedules
router.get('/', async (_req: Request, res: Response) => {
  const schedules = await FlightSchedule.find().sort({ Schedule_ID: 1 });
  res.json(schedules);
});

// GET schedule by ID (enriched with flight info)
router.get('/:id', async (req: Request, res: Response) => {
  const s = await FlightSchedule.findOne({ Schedule_ID: Number(req.params.id) });
  if (!s) return res.status(404).json({ error: 'Schedule not found' });

  const flight = await Flight.findOne({ Flight_ID: s.Flight_ID });

  res.json({
    ...s.toObject(),
    Source: flight?.Source,
    Destination: flight?.Destination,
    Flight_Number: flight?.Flight_Number,
    Airline_Name: flight?.Airline_Name,
    Base_Price: flight?.Base_Price,
  });
});

// POST add schedule
router.post('/', async (req: Request, res: Response) => {
  try {
    const schedule = await FlightSchedule.create(req.body);
    res.status(201).json(schedule);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

export default router;
