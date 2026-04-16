import { Router, Request, Response } from 'express';
import { pool } from '../config/db.js';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

const router = Router();

// GET all passengers
router.get('/', async (_req: Request, res: Response) => {
  const [rows] = await pool.query<RowDataPacket[]>(
    'SELECT * FROM Passenger ORDER BY Passenger_ID ASC'
  );
  res.json(rows);
});

// GET single passenger
router.get('/:id', async (req: Request, res: Response) => {
  const [rows] = await pool.query<RowDataPacket[]>(
    'SELECT * FROM Passenger WHERE Passenger_ID = ?',
    [Number(req.params.id)]
  );
  if (rows.length === 0) return res.status(404).json({ error: 'Passenger not found' });
  res.json(rows[0]);
});

// POST add passenger (auto-increment ID)
router.post('/', async (req: Request, res: Response) => {
  try {
    const { Name, DOB, Gender, Passport_Number, Email, Contact_Number } = req.body;

    // Get next ID
    const [maxRow] = await pool.query<RowDataPacket[]>(
      'SELECT COALESCE(MAX(Passenger_ID), 0) + 1 AS nextId FROM Passenger'
    );
    const nextId = maxRow[0].nextId;

    await pool.query<ResultSetHeader>(
      'INSERT INTO Passenger (Passenger_ID, Name, DOB, Gender, Passport_Number, Email, Contact_Number) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [nextId, Name, DOB, Gender, Passport_Number, Email, Contact_Number]
    );
    res.status(201).json({ Passenger_ID: nextId, Name, DOB, Gender, Passport_Number, Email, Contact_Number });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// PUT update passenger
router.put('/:id', async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const { Name, DOB, Gender, Passport_Number, Email, Contact_Number } = req.body;

  const [result] = await pool.query<ResultSetHeader>(
    `UPDATE Passenger SET Name = COALESCE(?, Name), DOB = COALESCE(?, DOB), Gender = COALESCE(?, Gender),
     Passport_Number = COALESCE(?, Passport_Number), Email = COALESCE(?, Email), Contact_Number = COALESCE(?, Contact_Number)
     WHERE Passenger_ID = ?`,
    [Name, DOB, Gender, Passport_Number, Email, Contact_Number, id]
  );
  if (result.affectedRows === 0) return res.status(404).json({ error: 'Passenger not found' });

  const [rows] = await pool.query<RowDataPacket[]>('SELECT * FROM Passenger WHERE Passenger_ID = ?', [id]);
  res.json(rows[0]);
});

// DELETE passenger
router.delete('/:id', async (req: Request, res: Response) => {
  const [result] = await pool.query<ResultSetHeader>(
    'DELETE FROM Passenger WHERE Passenger_ID = ?',
    [Number(req.params.id)]
  );
  if (result.affectedRows === 0) return res.status(404).json({ error: 'Passenger not found' });
  res.json({ message: 'Passenger deleted' });
});

export default router;
