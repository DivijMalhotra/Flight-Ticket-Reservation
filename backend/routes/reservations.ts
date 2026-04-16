import { Router, Request, Response } from 'express';
import Reservation from '../models/Reservation.js';
import Ticket from '../models/Ticket.js';
import Payment from '../models/Payment.js';
import FlightSchedule from '../models/FlightSchedule.js';
import Flight from '../models/Flight.js';
import Passenger from '../models/Passenger.js';

const router = Router();

// GET all reservations (enriched with full details)
router.get('/', async (_req: Request, res: Response) => {
  const reservations = await Reservation.find().sort({ Res_ID: -1 });

  // Batch-fetch all related data
  const resIds = reservations.map(r => r.Res_ID);
  const passengerIds = [...new Set(reservations.map(r => r.Passenger_ID))];

  const [tickets, payments, passengers] = await Promise.all([
    Ticket.find({ Res_ID: { $in: resIds } }),
    Payment.find({ Res_ID: { $in: resIds } }),
    Passenger.find({ Passenger_ID: { $in: passengerIds } }),
  ]);

  // Fetch schedule + flight info for tickets
  const scheduleIds = [...new Set(tickets.map(t => t.Schedule_ID))];
  const schedules = await FlightSchedule.find({ Schedule_ID: { $in: scheduleIds } });
  const flightIds = [...new Set(schedules.map(s => s.Flight_ID))];
  const flights = await Flight.find({ Flight_ID: { $in: flightIds } });

  // Build lookup maps
  const passengerMap = new Map(passengers.map(p => [p.Passenger_ID, p]));
  const scheduleMap = new Map(schedules.map(s => [s.Schedule_ID, s]));
  const flightMap = new Map(flights.map(f => [f.Flight_ID, f]));

  const enriched = reservations.map(r => {
    const passenger = passengerMap.get(r.Passenger_ID);
    const resTickets = tickets.filter(t => t.Res_ID === r.Res_ID);
    const resPayments = payments.filter(p => p.Res_ID === r.Res_ID);

    const ticketDetails = resTickets.map(t => {
      const schedule = scheduleMap.get(t.Schedule_ID);
      const flight = schedule ? flightMap.get(schedule.Flight_ID) : null;
      return {
        Ticket_ID: t.Ticket_ID,
        Seat_Num: t.Seat_Num,
        Class_Type: t.Class_Type,
        Price: t.Price,
        Ticket_Status: t.Ticket_Status,
        Flight_Number: flight?.Flight_Number || '—',
        Airline_Name: flight?.Airline_Name || '—',
        Source: flight?.Source || '—',
        Destination: flight?.Destination || '—',
        Depart_Time: schedule?.Depart_Time || '—',
        Arrival_Time: schedule?.Arrival_Time || '—',
        Travel_Date: schedule?.Travel_Date || '—',
      };
    });

    return {
      Res_ID: r.Res_ID,
      Res_Date: r.Res_Date,
      Res_Status: r.Res_Status,
      Total_Amount: r.Total_Amount,
      Passenger_ID: r.Passenger_ID,
      Passenger_Name: passenger?.Name || '—',
      Passenger_Email: passenger?.Email || '—',
      Passenger_Contact: passenger?.Contact_Number || '—',
      Passenger_Passport: passenger?.Passport_Number || '—',
      tickets: ticketDetails,
      payments: resPayments.map(p => ({
        Pay_ID: p.Pay_ID,
        Amount: p.Amount,
        Pay_Date: p.Pay_Date,
        Pay_Mode: p.Pay_Mode,
        Pay_Status: p.Pay_Status,
      })),
    };
  });

  res.json(enriched);
});

// GET reservation by ID (enriched with ticket + flight details)
router.get('/:id', async (req: Request, res: Response) => {
  const resId = Number(req.params.id);
  const reservation = await Reservation.findOne({ Res_ID: resId });
  if (!reservation) return res.status(404).json({ error: 'Reservation not found' });

  const tickets = await Ticket.find({ Res_ID: resId });
  const payments = await Payment.find({ Res_ID: resId });

  // Enrich tickets with flight info
  const enrichedTickets = await Promise.all(tickets.map(async (t) => {
    const schedule = await FlightSchedule.findOne({ Schedule_ID: t.Schedule_ID });
    const flight = schedule ? await Flight.findOne({ Flight_ID: schedule.Flight_ID }) : null;
    return {
      Ticket_ID: t.Ticket_ID,
      Seat_Num: t.Seat_Num,
      Class_Type: t.Class_Type,
      Price: t.Price,
      Ticket_Status: t.Ticket_Status,
      Flight_Number: flight?.Flight_Number || '—',
      Airline_Name: flight?.Airline_Name || '—',
      Source: flight?.Source || '—',
      Destination: flight?.Destination || '—',
      Depart_Time: schedule?.Depart_Time || '—',
      Arrival_Time: schedule?.Arrival_Time || '—',
      Travel_Date: schedule?.Travel_Date || '—',
    };
  }));

  res.json({ reservation, tickets: enrichedTickets, payments });
});

// POST create reservation + ticket (Pending — payment happens on payment page)
router.post('/book', async (req: Request, res: Response) => {
  try {
    const { Passenger_ID, Schedule_ID, Seat_Num, Class_Type } = req.body;

    const schedule = await FlightSchedule.findOne({ Schedule_ID });
    if (!schedule) return res.status(404).json({ error: 'Schedule not found' });
    if (schedule.Available_Seats <= 0) return res.status(400).json({ error: 'No seats available' });

    const flight = await Flight.findOne({ Flight_ID: schedule.Flight_ID });
    if (!flight) return res.status(404).json({ error: 'Flight not found' });

    const basePrice = flight.Base_Price;
    let price = basePrice;
    if (Class_Type === 'Business') price = Math.round(basePrice * 1.8);
    else if (Class_Type === 'First') price = Math.round(basePrice * 3);

    const lastRes = await Reservation.findOne().sort({ Res_ID: -1 });
    const nextResId = lastRes ? lastRes.Res_ID + 1 : 2001;

    const lastTicket = await Ticket.findOne().sort({ Ticket_ID: -1 });
    const nextTicketId = lastTicket ? lastTicket.Ticket_ID + 1 : 3001;

    const today = new Date().toISOString().split('T')[0];

    // Create reservation as Pending (payment not yet done)
    const reservation = await Reservation.create({
      Res_ID: nextResId,
      Passenger_ID,
      Res_Date: today,
      Res_Status: 'Pending',
      Total_Amount: price,
    });

    // Create ticket
    const ticket = await Ticket.create({
      Ticket_ID: nextTicketId,
      Res_ID: nextResId,
      Schedule_ID,
      Seat_Num: Seat_Num || `${Math.floor(Math.random() * 30) + 1}${['A','B','C','D'][Math.floor(Math.random()*4)]}`,
      Class_Type,
      Price: price,
      Ticket_Status: 'Booked',
    });

    // Decrease available seats
    await FlightSchedule.updateOne(
      { Schedule_ID },
      { $inc: { Available_Seats: -1 } }
    );

    res.status(201).json({ reservation, ticket });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// PUT cancel reservation
router.put('/:id/cancel', async (req: Request, res: Response) => {
  const resId = Number(req.params.id);

  const reservation = await Reservation.findOneAndUpdate(
    { Res_ID: resId },
    { Res_Status: 'Cancelled' },
    { new: true }
  );
  if (!reservation) return res.status(404).json({ error: 'Reservation not found' });

  // Cancel all tickets under this reservation
  const tickets = await Ticket.find({ Res_ID: resId, Ticket_Status: 'Booked' });
  for (const ticket of tickets) {
    await Ticket.updateOne({ Ticket_ID: ticket.Ticket_ID }, { Ticket_Status: 'Cancelled' });
    await FlightSchedule.updateOne(
      { Schedule_ID: ticket.Schedule_ID },
      { $inc: { Available_Seats: 1 } }
    );
  }

  // Mark payment as failed
  await Payment.updateMany({ Res_ID: resId }, { Pay_Status: 'Failed' });

  res.json({ message: 'Reservation cancelled', reservation });
});

export default router;
