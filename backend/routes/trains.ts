import { Router, Request, Response } from 'express';
import Train from '../models/Train.js';
import Seat from '../models/Seat.js';
import Booking from '../models/Booking.js';

const router = Router();


router.get('/search', async (req: Request, res: Response) => {
  const { from, to, date } = req.query as { from: string; to: string; date: string };

  if (!from || !to || !date)
    return res.status(400).json({ error: 'from, to, and date are required' });

  try {
    const trains = await Train.find({
      'stations.id': { $all: [from, to] },
    });

    const validTrains = trains.filter((train) => {
      const fromStation = train.stations.find((s) => s.id === from);
      const toStation = train.stations.find((s) => s.id === to);
      return fromStation && toStation && fromStation.index < toStation.index;
    });

    const results = await Promise.all(
      validTrains.map(async (train) => {
        const availableCount = await Seat.countDocuments({
          trainId: train._id,
          journeyDate: date,
          status: 'AVAILABLE',
        });

        return {
          id: train._id,
          trainNumber: train.trainNumber,
          trainName: train.trainName,
          stations: train.stations,
          departureTime: train.departureTime,
          duration: train.duration,
          basePrice: train.basePrice,
          availableSeats: availableCount,
        };
      })
    );

    res.json({ trains: results });
  } catch (err) {
    console.error('Train search error:', err);
    res.status(500).json({ error: 'Search failed' });
  }
});


router.get('/smart-search', async (req: Request, res: Response) => {
  const { from, to, date } = req.query as { from: string; to: string; date: string };

  if (!from || !to || !date)
    return res.status(400).json({ error: 'from, to, and date are required' });

  try {
    const trains = await Train.find({ 'stations.id': { $all: [from, to] } });
    const validTrains = trains.filter((train) => {
      const f = train.stations.find((s) => s.id === from);
      const t = train.stations.find((s) => s.id === to);
      return f && t && f.index < t.index;
    });

    const suggestions: object[] = [];

    for (const train of validTrains) {
      const fromStation = train.stations.find((s) => s.id === from)!;
      const toStation = train.stations.find((s) => s.id === to)!;


      const overlappingBookings = await Booking.find({
        trainId: train._id,
        journeyDate: date,
        status: 'CONFIRMED',
        fromStationIndex: { $lt: toStation.index },
        toStationIndex: { $gt: fromStation.index },
      }).select('seatIds');

      const bookedSeatIds = new Set(overlappingBookings.flatMap((b) => b.seatIds.map((id) => id.toString())));

      const totalSeats = await Seat.countDocuments({ trainId: train._id, journeyDate: date });
      const directlyAvailable = totalSeats - bookedSeatIds.size;

      if (directlyAvailable > 0) {
        suggestions.push({
          trainId: train._id,
          trainName: train.trainName,
          trainNumber: train.trainNumber,
          availableSeats: directlyAvailable,
          suggestion: null,
        });
        continue;
      }

      const intermediateStations = train.stations
        .filter((s) => Number(s.index) > Number(fromStation.index) && Number(s.index) < Number(toStation.index))
        .sort((a, b) => Number(a.index) - Number(b.index)); 

      let bestSuggestion = null;
      for (const altStation of intermediateStations) {
        
        const altOverlapping = await Booking.find({
          trainId: train._id,
          journeyDate: date,
          status: 'CONFIRMED',
          fromStationIndex: { $lt: Number(toStation.index) },
          toStationIndex: { $gt: Number(altStation.index) },
        }).select('seatIds');

        const altBookedIds = new Set(altOverlapping.flatMap((b) => b.seatIds.map((id) => id.toString())));
        const altAvailable = totalSeats - altBookedIds.size;

        if (altAvailable > 0) {
          bestSuggestion = {
            boardFrom: altStation,
            availableSeats: altAvailable,
            reason: `${altAvailable} seats available if you board from ${altStation.name}`,
          };
          break; 
        }
      }

      suggestions.push({
        trainId: train._id,
        trainName: train.trainName,
        trainNumber: train.trainNumber,
        availableSeats: 0,
        suggestion: bestSuggestion,
      });
    }

    res.json({ results: suggestions });
  } catch (err) {
    console.error('Smart search error:', err);
    res.status(500).json({ error: 'Smart search failed' });
  }
});


router.get('/:id', async (req: Request, res: Response) => {
  try {
    const train = await Train.findById(req.params.id);
    if (!train) return res.status(404).json({ error: 'Train not found' });
    res.json({ train });
  } catch {
    res.status(500).json({ error: 'Failed to fetch train' });
  }
});

export default router;
