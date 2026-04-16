import { Router, Request, Response } from 'express';
import { pool } from '../config/db.js';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

const router = Router();

// GET all schedules
router.get('/', async (_req: Request, res: Response) => {
  const [rows] = await pool.query<RowDataPacket[]>(
    'SELECT * FROM Flight_Schedule ORDER BY Schedule_ID ASC'
  );
  res.json(rows);
});

// GET schedule by ID (enriched with flight info via JOIN)
router.get('/:id', async (req: Request, res: Response) => {
  const [rows] = await pool.query<RowDataPacket[]>(
    `SELECT fs.*, f.Source, f.Destination, f.Flight_Number, f.Airline_Name, f.Base_Price
     FROM Flight_Schedule fs
     JOIN Flight f ON fs.Flight_ID = f.Flight_ID
     WHERE fs.Schedule_ID = ?`,
    [Number(req.params.id)]
  );
  if (rows.length === 0) return res.status(404).json({ error: 'Schedule not found' });
  res.json(rows[0]);
});

// POST add schedule
router.post('/', async (req: Request, res: Response) => {
  try {
    const { Schedule_ID, Flight_ID, Depart_Time, Arrival_Time, Travel_Date, Available_Seats, Delay_Minutes } = req.body;
    await pool.query<ResultSetHeader>(
      `INSERT INTO Flight_Schedule (Schedule_ID, Flight_ID, Depart_Time, Arrival_Time, Travel_Date, Available_Seats, Delay_Minutes)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [Schedule_ID, Flight_ID, Depart_Time, Arrival_Time, Travel_Date, Available_Seats, Delay_Minutes || 0]
    );
    res.status(201).json({ Schedule_ID, Flight_ID, Depart_Time, Arrival_Time, Travel_Date, Available_Seats, Delay_Minutes: Delay_Minutes || 0 });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

export default router;
