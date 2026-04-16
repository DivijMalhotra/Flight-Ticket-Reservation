import { Router, Request, Response } from 'express';
import Flight from '../models/Flight.js';
import FlightSchedule from '../models/FlightSchedule.js';

const router = Router();

// GET all flights
router.get('/', async (_req: Request, res: Response) => {
  const flights = await Flight.find().sort({ Flight_ID: 1 });
  res.json(flights);
});

// GET search flights by source, destination, date
router.get('/search', async (req: Request, res: Response) => {
  const { source, destination, date } = req.query;
  const query: any = {};
  if (source) query.Source = { $regex: new RegExp(source as string, 'i') };
  if (destination) query.Destination = { $regex: new RegExp(destination as string, 'i') };

  const flights = await Flight.find(query);
  const flightIds = flights.map(f => f.Flight_ID);

  const schedQuery: any = { Flight_ID: { $in: flightIds } };
  if (date) schedQuery.Travel_Date = date;

  const schedules = await FlightSchedule.find(schedQuery);

  // Merge flight info into schedule results
  const results = schedules.map(s => {
    const flight = flights.find(f => f.Flight_ID === s.Flight_ID);
    return {
      Schedule_ID: s.Schedule_ID,
      Flight_ID: s.Flight_ID,
      Flight_Number: flight?.Flight_Number,
      Airline_Name: flight?.Airline_Name,
      Source: flight?.Source,
      Destination: flight?.Destination,
      Depart_Time: s.Depart_Time,
      Arrival_Time: s.Arrival_Time,
      Travel_Date: s.Travel_Date,
      Available_Seats: s.Available_Seats,
      Delay_Minutes: s.Delay_Minutes,
      Base_Price: flight?.Base_Price,
    };
  });

  res.json(results);
});

// GET single flight
router.get('/:id', async (req: Request, res: Response) => {
  const f = await Flight.findOne({ Flight_ID: Number(req.params.id) });
  if (!f) return res.status(404).json({ error: 'Flight not found' });
  res.json(f);
});

// POST add flight
router.post('/', async (req: Request, res: Response) => {
  try {
    const flight = await Flight.create(req.body);
    res.status(201).json(flight);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

export default router;
