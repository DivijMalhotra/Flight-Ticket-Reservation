import { Router, Request, Response } from 'express';
import Passenger from '../models/Passenger.js';
import Flight from '../models/Flight.js';
import FlightSchedule from '../models/FlightSchedule.js';
import Reservation from '../models/Reservation.js';
import Ticket from '../models/Ticket.js';
import Payment from '../models/Payment.js';

const router = Router();

// Q1: Passengers traveling to Delhi
router.get('/passengers-to-delhi', async (_req: Request, res: Response) => {
  const flights = await Flight.find({ Destination: 'Delhi' });
  const flightIds = flights.map(f => f.Flight_ID);
  const schedules = await FlightSchedule.find({ Flight_ID: { $in: flightIds } });
  const scheduleIds = schedules.map(s => s.Schedule_ID);
  const tickets = await Ticket.find({ Schedule_ID: { $in: scheduleIds }, Ticket_Status: 'Booked' });
  const resIds = [...new Set(tickets.map(t => t.Res_ID))];
  const reservations = await Reservation.find({ Res_ID: { $in: resIds } });
  const passengerIds = reservations.map(r => r.Passenger_ID);
  const passengers = await Passenger.find({ Passenger_ID: { $in: passengerIds } });
  res.json(passengers);
});

// Q2: Tickets for a specific date
router.get('/tickets-by-date', async (req: Request, res: Response) => {
  const { date } = req.query;
  if (!date) return res.status(400).json({ error: 'date query param required' });
  const schedules = await FlightSchedule.find({ Travel_Date: date as string });
  const scheduleIds = schedules.map(s => s.Schedule_ID);
  const tickets = await Ticket.find({ Schedule_ID: { $in: scheduleIds } });
  res.json(tickets);
});

// Q3: Passengers with no reservation
router.get('/passengers-no-reservation', async (_req: Request, res: Response) => {
  const reservations = await Reservation.find();
  const bookedIds = new Set(reservations.map(r => r.Passenger_ID));
  const allPassengers = await Passenger.find();
  const result = allPassengers.filter(p => !bookedIds.has(p.Passenger_ID));
  res.json(result);
});

// Q4: Total UPI payments
router.get('/total-upi-payments', async (_req: Request, res: Response) => {
  const upiPayments = await Payment.find({ Pay_Mode: 'UPI' });
  const total = upiPayments.reduce((sum, p) => sum + p.Amount, 0);
  res.json({ Pay_Mode: 'UPI', Total_Amount: total, Count: upiPayments.length });
});

// Q5: Flights with seats > 50
router.get('/flights-seats-gt-50', async (_req: Request, res: Response) => {
  const schedules = await FlightSchedule.find({ Available_Seats: { $gt: 50 } });
  const flightIds = [...new Set(schedules.map(s => s.Flight_ID))];
  const flights = await Flight.find({ Flight_ID: { $in: flightIds } });
  const result = schedules.map(s => {
    const f = flights.find(fl => fl.Flight_ID === s.Flight_ID);
    return { ...s.toObject(), Flight_Number: f?.Flight_Number, Airline_Name: f?.Airline_Name };
  });
  res.json(result);
});

// Q6: Delayed flights
router.get('/delayed-flights', async (_req: Request, res: Response) => {
  const schedules = await FlightSchedule.find({ Delay_Minutes: { $gt: 0 } });
  const flightIds = [...new Set(schedules.map(s => s.Flight_ID))];
  const flights = await Flight.find({ Flight_ID: { $in: flightIds } });
  const result = schedules.map(s => {
    const f = flights.find(fl => fl.Flight_ID === s.Flight_ID);
    return { ...s.toObject(), Flight_Number: f?.Flight_Number, Airline_Name: f?.Airline_Name, Source: f?.Source, Destination: f?.Destination };
  });
  res.json(result);
});

// Q7: Passenger + travel date for Delhi
router.get('/passenger-travel-delhi', async (_req: Request, res: Response) => {
  const flights = await Flight.find({ Destination: 'Delhi' });
  const flightIds = flights.map(f => f.Flight_ID);
  const schedules = await FlightSchedule.find({ Flight_ID: { $in: flightIds } });
  const scheduleMap = new Map(schedules.map(s => [s.Schedule_ID, s]));
  const tickets = await Ticket.find({ Schedule_ID: { $in: schedules.map(s => s.Schedule_ID) }, Ticket_Status: 'Booked' });
  const resIds = [...new Set(tickets.map(t => t.Res_ID))];
  const reservations = await Reservation.find({ Res_ID: { $in: resIds } });
  const passengers = await Passenger.find({ Passenger_ID: { $in: reservations.map(r => r.Passenger_ID) } });
  const passengerMap = new Map(passengers.map(p => [p.Passenger_ID, p]));
  const resMap = new Map(reservations.map(r => [r.Res_ID, r]));

  const result = tickets.map(t => {
    const sched = scheduleMap.get(t.Schedule_ID);
    const reservation = resMap.get(t.Res_ID);
    const passenger = reservation ? passengerMap.get(reservation.Passenger_ID) : null;
    return { Passenger_Name: passenger?.Name, Travel_Date: sched?.Travel_Date, Destination: 'Delhi' };
  });
  res.json(result);
});

// Q8: Successful payments
router.get('/successful-payments', async (_req: Request, res: Response) => {
  const payments = await Payment.find({ Pay_Status: 'Success' });
  res.json(payments);
});

export default router;
