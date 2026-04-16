import { Router, Request, Response } from 'express';
import { pool } from '../config/db.js';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

const router = Router();

// GET all flights
router.get('/', async (_req: Request, res: Response) => {
  const [rows] = await pool.query<RowDataPacket[]>(
    'SELECT * FROM Flight ORDER BY Flight_ID ASC'
  );
  res.json(rows);
});

// GET search flights by source, destination, date
router.get('/search', async (req: Request, res: Response) => {
  const { source, destination, date } = req.query;

  let sql = `
    SELECT fs.Schedule_ID, fs.Flight_ID, f.Flight_Number, f.Airline_Name,
           f.Source, f.Destination, fs.Depart_Time, fs.Arrival_Time,
           fs.Travel_Date, fs.Available_Seats, fs.Delay_Minutes, f.Base_Price
    FROM Flight_Schedule fs
    JOIN Flight f ON fs.Flight_ID = f.Flight_ID
    WHERE 1=1
  `;
  const params: any[] = [];

  if (source) {
    sql += ' AND f.Source LIKE ?';
    params.push(`%${source}%`);
  }
  if (destination) {
    sql += ' AND f.Destination LIKE ?';
    params.push(`%${destination}%`);
  }
  if (date) {
    sql += ' AND fs.Travel_Date = ?';
    params.push(date);
  }

  sql += ' ORDER BY fs.Depart_Time ASC';

  const [rows] = await pool.query<RowDataPacket[]>(sql, params);
  res.json(rows);
});

// GET single flight
router.get('/:id', async (req: Request, res: Response) => {
  const [rows] = await pool.query<RowDataPacket[]>(
    'SELECT * FROM Flight WHERE Flight_ID = ?',
    [Number(req.params.id)]
  );
  if (rows.length === 0) return res.status(404).json({ error: 'Flight not found' });
  res.json(rows[0]);
});

// POST add flight
router.post('/', async (req: Request, res: Response) => {
  try {
    const { Flight_ID, Flight_Number, Airline_Name, Source, Destination, Base_Price } = req.body;
    await pool.query<ResultSetHeader>(
      'INSERT INTO Flight (Flight_ID, Flight_Number, Airline_Name, Source, Destination, Base_Price) VALUES (?, ?, ?, ?, ?, ?)',
      [Flight_ID, Flight_Number, Airline_Name, Source, Destination, Base_Price]
    );
    res.status(201).json({ Flight_ID, Flight_Number, Airline_Name, Source, Destination, Base_Price });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

export default router;
