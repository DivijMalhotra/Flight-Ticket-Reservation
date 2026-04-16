import { Router, Request, Response } from 'express';
import Passenger from '../models/Passenger.js';

const router = Router();

// GET all passengers
router.get('/', async (_req: Request, res: Response) => {
  const passengers = await Passenger.find().sort({ Passenger_ID: 1 });
  res.json(passengers);
});

// GET single passenger
router.get('/:id', async (req: Request, res: Response) => {
  const p = await Passenger.findOne({ Passenger_ID: Number(req.params.id) });
  if (!p) return res.status(404).json({ error: 'Passenger not found' });
  res.json(p);
});

// POST add passenger
router.post('/', async (req: Request, res: Response) => {
  try {
    const last = await Passenger.findOne().sort({ Passenger_ID: -1 });
    const nextId = last ? last.Passenger_ID + 1 : 1;
    const passenger = await Passenger.create({ ...req.body, Passenger_ID: nextId });
    res.status(201).json(passenger);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// PUT update passenger
router.put('/:id', async (req: Request, res: Response) => {
  const p = await Passenger.findOneAndUpdate(
    { Passenger_ID: Number(req.params.id) },
    req.body,
    { new: true, runValidators: true }
  );
  if (!p) return res.status(404).json({ error: 'Passenger not found' });
  res.json(p);
});

// DELETE passenger
router.delete('/:id', async (req: Request, res: Response) => {
  const p = await Passenger.findOneAndDelete({ Passenger_ID: Number(req.params.id) });
  if (!p) return res.status(404).json({ error: 'Passenger not found' });
  res.json({ message: 'Passenger deleted' });
});

export default router;
