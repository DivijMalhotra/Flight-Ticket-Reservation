import { Router, Request, Response } from 'express';
import { pool } from '../config/db.js';
import { RowDataPacket } from 'mysql2';

const router = Router();

// Q1: Passengers traveling to Delhi
router.get('/passengers-to-delhi', async (_req: Request, res: Response) => {
  const [rows] = await pool.query<RowDataPacket[]>(`
    SELECT DISTINCT p.Passenger_ID, p.Name, p.Email
    FROM Passenger p
    JOIN Reservation r ON p.Passenger_ID = r.Passenger_ID
    JOIN Ticket t ON r.Res_ID = t.Res_ID
    JOIN Flight_Schedule fs ON t.Schedule_ID = fs.Schedule_ID
    JOIN Flight f ON fs.Flight_ID = f.Flight_ID
    WHERE f.Destination = 'Delhi' AND t.Ticket_Status = 'Booked'
  `);
  res.json(rows);
});

// Q2: Tickets for a specific date
router.get('/tickets-by-date', async (req: Request, res: Response) => {
  const { date } = req.query;
  if (!date) return res.status(400).json({ error: 'date query param required' });

  const [rows] = await pool.query<RowDataPacket[]>(`
    SELECT t.Ticket_ID, t.Seat_Num, t.Class_Type, t.Price, t.Ticket_Status,
           fs.Travel_Date, f.Flight_Number
    FROM Ticket t
    JOIN Flight_Schedule fs ON t.Schedule_ID = fs.Schedule_ID
    JOIN Flight f ON fs.Flight_ID = f.Flight_ID
    WHERE fs.Travel_Date = ?
  `, [date]);
  res.json(rows);
});

// Q3: Passengers with no reservation (LEFT JOIN)
router.get('/passengers-no-reservation', async (_req: Request, res: Response) => {
  const [rows] = await pool.query<RowDataPacket[]>(`
    SELECT p.Passenger_ID, p.Name, p.Email
    FROM Passenger p
    LEFT JOIN Reservation r ON p.Passenger_ID = r.Passenger_ID
    WHERE r.Res_ID IS NULL
  `);
  res.json(rows);
});

// Q4: Total UPI payments (GROUP BY + aggregate)
router.get('/total-upi-payments', async (_req: Request, res: Response) => {
  const [rows] = await pool.query<RowDataPacket[]>(`
    SELECT Pay_Mode, COUNT(*) AS Total_Transactions, SUM(Amount) AS Total_Amount
    FROM Payment
    WHERE Pay_Mode = 'UPI'
    GROUP BY Pay_Mode
  `);
  if (rows.length === 0) return res.json({ Pay_Mode: 'UPI', Total_Amount: 0, Count: 0 });
  res.json(rows[0]);
});

// Q5: Flights with seats > 50
router.get('/flights-seats-gt-50', async (_req: Request, res: Response) => {
  const [rows] = await pool.query<RowDataPacket[]>(`
    SELECT f.Flight_ID, f.Flight_Number, f.Airline_Name, f.Source, f.Destination,
           fs.Schedule_ID, fs.Travel_Date, fs.Available_Seats
    FROM Flight f
    JOIN Flight_Schedule fs ON f.Flight_ID = fs.Flight_ID
    WHERE fs.Available_Seats > 50
  `);
  res.json(rows);
});

// Q6: Delayed flights
router.get('/delayed-flights', async (_req: Request, res: Response) => {
  const [rows] = await pool.query<RowDataPacket[]>(`
    SELECT f.Flight_Number, f.Airline_Name, f.Source, f.Destination,
           fs.Travel_Date, fs.Depart_Time, fs.Delay_Minutes
    FROM Flight f
    JOIN Flight_Schedule fs ON f.Flight_ID = fs.Flight_ID
    WHERE fs.Delay_Minutes > 0
    ORDER BY fs.Delay_Minutes DESC
  `);
  res.json(rows);
});

// Q7: Passenger name + travel date for flights to Delhi
router.get('/passenger-travel-delhi', async (_req: Request, res: Response) => {
  const [rows] = await pool.query<RowDataPacket[]>(`
    SELECT p.Name AS Passenger_Name, fs.Travel_Date, f.Destination
    FROM Passenger p
    JOIN Reservation r ON p.Passenger_ID = r.Passenger_ID
    JOIN Ticket t ON r.Res_ID = t.Res_ID
    JOIN Flight_Schedule fs ON t.Schedule_ID = fs.Schedule_ID
    JOIN Flight f ON fs.Flight_ID = f.Flight_ID
    WHERE f.Destination = 'Delhi' AND t.Ticket_Status = 'Booked'
  `);
  res.json(rows);
});

// Q8: Successful payments (enriched)
router.get('/successful-payments', async (_req: Request, res: Response) => {
  const [rows] = await pool.query<RowDataPacket[]>(`
    SELECT pay.Pay_ID, pay.Amount, pay.Pay_Date, pay.Pay_Mode,
           p.Name AS Passenger_Name, f.Flight_Number
    FROM Payment pay
    JOIN Reservation r ON pay.Res_ID = r.Res_ID
    JOIN Passenger p ON r.Passenger_ID = p.Passenger_ID
    JOIN Ticket t ON r.Res_ID = t.Res_ID
    JOIN Flight_Schedule fs ON t.Schedule_ID = fs.Schedule_ID
    JOIN Flight f ON fs.Flight_ID = f.Flight_ID
    WHERE pay.Pay_Status = 'Success'
  `);
  res.json(rows);
});

export default router;
