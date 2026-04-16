import { Router, Request, Response } from 'express';
import { pool } from '../config/db.js';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

const router = Router();

// ─── GET all reservations (enriched with passenger, ticket, flight, payment info) ───
router.get('/', async (_req: Request, res: Response) => {
  // 1. Get all reservations with passenger info
  const [reservations] = await pool.query<RowDataPacket[]>(`
    SELECT r.*, p.Name AS Passenger_Name, p.Email AS Passenger_Email,
           p.Contact_Number AS Passenger_Contact, p.Passport_Number AS Passenger_Passport
    FROM Reservation r
    JOIN Passenger p ON r.Passenger_ID = p.Passenger_ID
    ORDER BY r.Res_ID DESC
  `);

  // 2. Get all tickets enriched with flight info and individual passenger info
  const [tickets] = await pool.query<RowDataPacket[]>(`
    SELECT t.*, f.Flight_Number, f.Airline_Name, f.Source, f.Destination,
           fs.Depart_Time, fs.Arrival_Time, fs.Travel_Date,
           p.Name AS Passenger_Name, p.Email AS Passenger_Email, 
           p.Contact_Number AS Passenger_Contact, p.Passport_Number AS Passenger_Passport
    FROM Ticket t
    JOIN Flight_Schedule fs ON t.Schedule_ID = fs.Schedule_ID
    JOIN Flight f ON fs.Flight_ID = f.Flight_ID
    JOIN Passenger p ON t.Passenger_ID = p.Passenger_ID
  `);

  // 3. Get all payments
  const [payments] = await pool.query<RowDataPacket[]>('SELECT * FROM Payment');

  // 4. Group by reservation
  const enriched = reservations.map((r: any) => ({
    Res_ID: r.Res_ID,
    Res_Date: r.Res_Date,
    Res_Status: r.Res_Status,
    Total_Amount: r.Total_Amount,
    Passenger_ID: r.Passenger_ID,
    Passenger_Name: r.Passenger_Name,
    Passenger_Email: r.Passenger_Email,
    Passenger_Contact: r.Passenger_Contact,
    Passenger_Passport: r.Passenger_Passport,
    tickets: (tickets as any[])
      .filter((t: any) => t.Res_ID === r.Res_ID)
      .map((t: any) => ({
        Ticket_ID: t.Ticket_ID,
        Seat_Num: t.Seat_Num,
        Class_Type: t.Class_Type,
        Price: t.Price,
        Ticket_Status: t.Ticket_Status,
        Passenger_ID: t.Passenger_ID,
        Passenger_Name: t.Passenger_Name,
        Passenger_Email: t.Passenger_Email,
        Passenger_Contact: t.Passenger_Contact,
        Passenger_Passport: t.Passenger_Passport,
        Flight_Number: t.Flight_Number || '—',
        Airline_Name: t.Airline_Name || '—',
        Source: t.Source || '—',
        Destination: t.Destination || '—',
        Depart_Time: t.Depart_Time || '—',
        Arrival_Time: t.Arrival_Time || '—',
        Travel_Date: t.Travel_Date || '—',
      })),
    payments: (payments as any[])
      .filter((p: any) => p.Res_ID === r.Res_ID)
      .map((p: any) => ({
        Pay_ID: p.Pay_ID,
        Amount: p.Amount,
        Pay_Date: p.Pay_Date,
        Pay_Mode: p.Pay_Mode,
        Pay_Status: p.Pay_Status,
      })),
  }));

  res.json(enriched);
});

// ─── GET reservation by ID (enriched) ───
router.get('/:id', async (req: Request, res: Response) => {
  const resId = Number(req.params.id);

  const [resRows] = await pool.query<RowDataPacket[]>(
    'SELECT * FROM Reservation WHERE Res_ID = ?', [resId]
  );
  if (resRows.length === 0) return res.status(404).json({ error: 'Reservation not found' });

  const reservation = resRows[0];

  const [tickets] = await pool.query<RowDataPacket[]>(`
    SELECT t.*, f.Flight_Number, f.Airline_Name, f.Source, f.Destination,
           fs.Depart_Time, fs.Arrival_Time, fs.Travel_Date,
           p.Name AS Passenger_Name, p.Email AS Passenger_Email, 
           p.Contact_Number AS Passenger_Contact, p.Passport_Number AS Passenger_Passport
    FROM Ticket t
    JOIN Flight_Schedule fs ON t.Schedule_ID = fs.Schedule_ID
    JOIN Flight f ON fs.Flight_ID = f.Flight_ID
    JOIN Passenger p ON t.Passenger_ID = p.Passenger_ID
    WHERE t.Res_ID = ?
  `, [resId]);

  const [payments] = await pool.query<RowDataPacket[]>(
    'SELECT * FROM Payment WHERE Res_ID = ?', [resId]
  );

  res.json({ reservation, tickets, payments });
});

// ─── POST create reservation + ticket(s) (uses MySQL transaction) ───
// Supports both single-traveler (legacy) and multi-traveler bookings.
// Multi-traveler: send { Schedule_ID, Class_Type, Travelers: [{ Passenger_ID, Seat_Num }, ...] }
// Single-traveler (legacy): send { Passenger_ID, Schedule_ID, Seat_Num, Class_Type }
router.post('/book', async (req: Request, res: Response) => {
  const conn = await pool.getConnection();
  try {
    const { Schedule_ID, Class_Type, Travelers, Passenger_ID, Seat_Num } = req.body;

    // Normalize into a travelers array
    const travelerList: { Passenger_ID: number; Seat_Num: string }[] = Travelers && Array.isArray(Travelers) && Travelers.length > 0
      ? Travelers
      : [{ Passenger_ID, Seat_Num }];

    const travelerCount = travelerList.length;

    await conn.beginTransaction();

    // 1. Check schedule exists & has enough seats
    const [schedRows] = await conn.query<RowDataPacket[]>(
      'SELECT fs.*, f.Base_Price FROM Flight_Schedule fs JOIN Flight f ON fs.Flight_ID = f.Flight_ID WHERE fs.Schedule_ID = ?',
      [Schedule_ID]
    );
    if (schedRows.length === 0) { await conn.rollback(); return res.status(404).json({ error: 'Schedule not found' }); }
    const schedule = schedRows[0];
    if (schedule.Available_Seats < travelerCount) {
      await conn.rollback();
      return res.status(400).json({ error: `Only ${schedule.Available_Seats} seat(s) available, but ${travelerCount} requested` });
    }

    // 2. Calculate per-ticket price
    let perTicketPrice = schedule.Base_Price;
    if (Class_Type === 'Business') perTicketPrice = Math.round(perTicketPrice * 1.8);
    else if (Class_Type === 'First') perTicketPrice = Math.round(perTicketPrice * 3);

    const totalAmount = perTicketPrice * travelerCount;

    // 3. Get next IDs
    const [resMax] = await conn.query<RowDataPacket[]>('SELECT COALESCE(MAX(Res_ID), 2000) + 1 AS nextId FROM Reservation');
    const nextResId = resMax[0].nextId;

    const [tickMax] = await conn.query<RowDataPacket[]>('SELECT COALESCE(MAX(Ticket_ID), 3000) + 1 AS nextId FROM Ticket');
    let nextTicketId = tickMax[0].nextId;

    const today = new Date().toISOString().split('T')[0];

    // Use the first traveler's Passenger_ID as the reservation owner
    const primaryPassengerId = travelerList[0].Passenger_ID;

    // 4. Insert reservation (Pending)
    await conn.query<ResultSetHeader>(
      'INSERT INTO Reservation (Res_ID, Passenger_ID, Res_Date, Res_Status, Total_Amount) VALUES (?, ?, ?, ?, ?)',
      [nextResId, primaryPassengerId, today, 'Pending', totalAmount]
    );

    // 5. Insert ticket(s) — one per traveler
    const tickets: any[] = [];
    for (const traveler of travelerList) {
      const seatNum = traveler.Seat_Num || `${Math.floor(Math.random() * 30) + 1}${['A','B','C','D'][Math.floor(Math.random()*4)]}`;
      await conn.query<ResultSetHeader>(
        'INSERT INTO Ticket (Ticket_ID, Res_ID, Schedule_ID, Seat_Num, Class_Type, Price, Ticket_Status, Passenger_ID) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [nextTicketId, nextResId, Schedule_ID, seatNum, Class_Type, perTicketPrice, 'Booked', traveler.Passenger_ID]
      );
      tickets.push({ Ticket_ID: nextTicketId, Res_ID: nextResId, Schedule_ID, Seat_Num: seatNum, Class_Type, Price: perTicketPrice, Ticket_Status: 'Booked', Passenger_ID: traveler.Passenger_ID });
      nextTicketId++;
    }

    // 6. Decrease available seats by traveler count
    await conn.query<ResultSetHeader>(
      'UPDATE Flight_Schedule SET Available_Seats = Available_Seats - ? WHERE Schedule_ID = ?',
      [travelerCount, Schedule_ID]
    );

    await conn.commit();

    res.status(201).json({
      reservation: { Res_ID: nextResId, Passenger_ID: primaryPassengerId, Res_Date: today, Res_Status: 'Pending', Total_Amount: totalAmount },
      tickets,
      // Legacy single-ticket field for backward compatibility
      ticket: tickets[0],
    });
  } catch (err: any) {
    await conn.rollback();
    res.status(400).json({ error: err.message });
  } finally {
    conn.release();
  }
});

// ─── PUT cancel reservation (uses MySQL transaction) ───
router.put('/:id/cancel', async (req: Request, res: Response) => {
  const conn = await pool.getConnection();
  try {
    const resId = Number(req.params.id);
    await conn.beginTransaction();

    // 1. Update reservation status
    const [result] = await conn.query<ResultSetHeader>(
      "UPDATE Reservation SET Res_Status = 'Cancelled' WHERE Res_ID = ?", [resId]
    );
    if (result.affectedRows === 0) { await conn.rollback(); return res.status(404).json({ error: 'Reservation not found' }); }

    // 2. Get booked tickets → restore seats
    const [tickets] = await conn.query<RowDataPacket[]>(
      "SELECT * FROM Ticket WHERE Res_ID = ? AND Ticket_Status = 'Booked'", [resId]
    );
    for (const ticket of tickets as any[]) {
      await conn.query<ResultSetHeader>(
        "UPDATE Ticket SET Ticket_Status = 'Cancelled' WHERE Ticket_ID = ?", [ticket.Ticket_ID]
      );
      await conn.query<ResultSetHeader>(
        'UPDATE Flight_Schedule SET Available_Seats = Available_Seats + 1 WHERE Schedule_ID = ?', [ticket.Schedule_ID]
      );
    }

    // 3. Mark payments as Failed
    await conn.query<ResultSetHeader>(
      "UPDATE Payment SET Pay_Status = 'Failed' WHERE Res_ID = ?", [resId]
    );

    await conn.commit();

    const [updated] = await pool.query<RowDataPacket[]>('SELECT * FROM Reservation WHERE Res_ID = ?', [resId]);
    res.json({ message: 'Reservation cancelled', reservation: updated[0] });
  } catch (err: any) {
    await conn.rollback();
    res.status(400).json({ error: err.message });
  } finally {
    conn.release();
  }
});

export default router;
