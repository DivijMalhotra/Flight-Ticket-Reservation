/**
 * Run with: npm run seed
 * Seeds MongoDB with Flight Reservation System data.
 * 8-10 realistic records per table with referential integrity.
 */
import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import { connectDB } from './config/db.js';
import Passenger from './models/Passenger.js';
import Flight from './models/Flight.js';
import FlightSchedule from './models/FlightSchedule.js';
import Reservation from './models/Reservation.js';
import Ticket from './models/Ticket.js';
import Payment from './models/Payment.js';

async function seed() {
  await connectDB();

  console.log('🧹 Clearing existing data...');
  await Payment.deleteMany({});
  await Ticket.deleteMany({});
  await Reservation.deleteMany({});
  await FlightSchedule.deleteMany({});
  await Flight.deleteMany({});
  await Passenger.deleteMany({});

  // ── PASSENGERS (10) ──
  const passengers = [
    { Passenger_ID: 1, Name: 'Aarav Sharma', DOB: '1990-05-14', Gender: 'Male', Passport_Number: 'A1234567', Email: 'aarav@email.com', Contact_Number: '9876543210' },
    { Passenger_ID: 2, Name: 'Priya Singh', DOB: '1985-11-22', Gender: 'Female', Passport_Number: 'B2345678', Email: 'priya@email.com', Contact_Number: '9876543211' },
    { Passenger_ID: 3, Name: 'Rohan Patel', DOB: '1992-03-08', Gender: 'Male', Passport_Number: 'C3456789', Email: 'rohan@email.com', Contact_Number: '9876543212' },
    { Passenger_ID: 4, Name: 'Sneha Gupta', DOB: '1998-07-30', Gender: 'Female', Passport_Number: 'D4567890', Email: 'sneha@email.com', Contact_Number: '9876543213' },
    { Passenger_ID: 5, Name: 'Vikram Reddy', DOB: '1988-01-15', Gender: 'Male', Passport_Number: 'E5678901', Email: 'vikram@email.com', Contact_Number: '9876543214' },
    { Passenger_ID: 6, Name: 'Ananya Iyer', DOB: '1995-09-25', Gender: 'Female', Passport_Number: 'F6789012', Email: 'ananya@email.com', Contact_Number: '9876543215' },
    { Passenger_ID: 7, Name: 'Karan Mehta', DOB: '1991-12-02', Gender: 'Male', Passport_Number: 'G7890123', Email: 'karan@email.com', Contact_Number: '9876543216' },
    { Passenger_ID: 8, Name: 'Divya Nair', DOB: '1993-06-18', Gender: 'Female', Passport_Number: 'H8901234', Email: 'divya@email.com', Contact_Number: '9876543217' },
    { Passenger_ID: 9, Name: 'Arjun Verma', DOB: '1987-04-11', Gender: 'Male', Passport_Number: 'I9012345', Email: 'arjun@email.com', Contact_Number: '9876543218' },
    { Passenger_ID: 10, Name: 'Meera Joshi', DOB: '1996-08-05', Gender: 'Female', Passport_Number: 'J0123456', Email: 'meera@email.com', Contact_Number: '9876543219' },
  ];
  console.log('👤 Inserting passengers...');
  await Passenger.insertMany(passengers);

  // ── FLIGHTS (10) ──
  const flights = [
    { Flight_ID: 101, Flight_Number: 'AI-101', Airline_Name: 'Air India', Source: 'Delhi', Destination: 'Mumbai', Base_Price: 5500 },
    { Flight_ID: 102, Flight_Number: 'SG-202', Airline_Name: 'SpiceJet', Source: 'Mumbai', Destination: 'Bangalore', Base_Price: 4200 },
    { Flight_ID: 103, Flight_Number: '6E-303', Airline_Name: 'IndiGo', Source: 'Delhi', Destination: 'Chennai', Base_Price: 6000 },
    { Flight_ID: 104, Flight_Number: 'UK-404', Airline_Name: 'Vistara', Source: 'Kolkata', Destination: 'Delhi', Base_Price: 5800 },
    { Flight_ID: 105, Flight_Number: 'AI-505', Airline_Name: 'Air India', Source: 'Bangalore', Destination: 'Delhi', Base_Price: 6500 },
    { Flight_ID: 106, Flight_Number: 'SG-606', Airline_Name: 'SpiceJet', Source: 'Chennai', Destination: 'Hyderabad', Base_Price: 3800 },
    { Flight_ID: 107, Flight_Number: '6E-707', Airline_Name: 'IndiGo', Source: 'Hyderabad', Destination: 'Mumbai', Base_Price: 4500 },
    { Flight_ID: 108, Flight_Number: 'UK-808', Airline_Name: 'Vistara', Source: 'Delhi', Destination: 'Kolkata', Base_Price: 5200 },
    { Flight_ID: 109, Flight_Number: 'G8-909', Airline_Name: 'GoAir', Source: 'Pune', Destination: 'Delhi', Base_Price: 4800 },
    { Flight_ID: 110, Flight_Number: 'AI-110', Airline_Name: 'Air India', Source: 'Mumbai', Destination: 'Delhi', Base_Price: 5600 },
  ];
  console.log('✈️  Inserting flights...');
  await Flight.insertMany(flights);

  // ── FLIGHT SCHEDULES (dynamic — every flight for next 30 days) ──
  const flightTemplates = [
    { Flight_ID: 101, Depart_Time: '06:00', Arrival_Time: '08:15', Seats: 120, Delay: 0 },
    { Flight_ID: 102, Depart_Time: '09:30', Arrival_Time: '11:00', Seats: 80, Delay: 15 },
    { Flight_ID: 103, Depart_Time: '14:00', Arrival_Time: '16:30', Seats: 150, Delay: 0 },
    { Flight_ID: 104, Depart_Time: '07:45', Arrival_Time: '10:00', Seats: 60, Delay: 30 },
    { Flight_ID: 105, Depart_Time: '18:00', Arrival_Time: '21:00', Seats: 45, Delay: 0 },
    { Flight_ID: 106, Depart_Time: '11:15', Arrival_Time: '12:30', Seats: 90, Delay: 10 },
    { Flight_ID: 107, Depart_Time: '20:00', Arrival_Time: '22:00', Seats: 55, Delay: 0 },
    { Flight_ID: 108, Depart_Time: '05:30', Arrival_Time: '07:45', Seats: 100, Delay: 45 },
    { Flight_ID: 109, Depart_Time: '16:30', Arrival_Time: '18:45', Seats: 70, Delay: 0 },
    { Flight_ID: 110, Depart_Time: '12:00', Arrival_Time: '14:10', Seats: 130, Delay: 20 },
  ];
  const schedules: any[] = [];
  let schedId = 1001;
  for (let day = 0; day < 30; day++) {
    const d = new Date(); d.setDate(d.getDate() + day);
    const dateStr = d.toISOString().split('T')[0];
    for (const t of flightTemplates) {
      schedules.push({
        Schedule_ID: schedId++,
        Flight_ID: t.Flight_ID,
        Depart_Time: t.Depart_Time,
        Arrival_Time: t.Arrival_Time,
        Travel_Date: dateStr,
        Available_Seats: t.Seats,
        Delay_Minutes: t.Delay,
      });
    }
  }
  console.log(`📅 Inserting ${schedules.length} flight schedules (30 days)...`);
  await FlightSchedule.insertMany(schedules);

  // ── RESERVATIONS (10) ──
  const reservations = [
    { Res_ID: 2001, Passenger_ID: 1, Res_Date: '2026-04-25', Res_Status: 'Confirmed', Total_Amount: 5500 },
    { Res_ID: 2002, Passenger_ID: 2, Res_Date: '2026-04-25', Res_Status: 'Confirmed', Total_Amount: 4200 },
    { Res_ID: 2003, Passenger_ID: 3, Res_Date: '2026-04-26', Res_Status: 'Pending', Total_Amount: 6000 },
    { Res_ID: 2004, Passenger_ID: 4, Res_Date: '2026-04-26', Res_Status: 'Confirmed', Total_Amount: 5800 },
    { Res_ID: 2005, Passenger_ID: 5, Res_Date: '2026-04-27', Res_Status: 'Cancelled', Total_Amount: 6500 },
    { Res_ID: 2006, Passenger_ID: 6, Res_Date: '2026-04-27', Res_Status: 'Confirmed', Total_Amount: 3800 },
    { Res_ID: 2007, Passenger_ID: 7, Res_Date: '2026-04-28', Res_Status: 'Confirmed', Total_Amount: 4500 },
    { Res_ID: 2008, Passenger_ID: 8, Res_Date: '2026-04-28', Res_Status: 'Confirmed', Total_Amount: 5200 },
    { Res_ID: 2009, Passenger_ID: 9, Res_Date: '2026-04-29', Res_Status: 'Pending', Total_Amount: 4800 },
    { Res_ID: 2010, Passenger_ID: 10, Res_Date: '2026-04-29', Res_Status: 'Confirmed', Total_Amount: 5600 },
  ];
  console.log('📝 Inserting reservations...');
  await Reservation.insertMany(reservations);

  // ── TICKETS (10) ──
  const tickets = [
    { Ticket_ID: 3001, Res_ID: 2001, Schedule_ID: 1001, Seat_Num: '12A', Class_Type: 'Economy', Price: 5500, Ticket_Status: 'Booked' },
    { Ticket_ID: 3002, Res_ID: 2002, Schedule_ID: 1002, Seat_Num: '1A', Class_Type: 'Business', Price: 4200, Ticket_Status: 'Booked' },
    { Ticket_ID: 3003, Res_ID: 2003, Schedule_ID: 1003, Seat_Num: '15C', Class_Type: 'Economy', Price: 6000, Ticket_Status: 'Booked' },
    { Ticket_ID: 3004, Res_ID: 2004, Schedule_ID: 1004, Seat_Num: '3B', Class_Type: 'First', Price: 5800, Ticket_Status: 'Booked' },
    { Ticket_ID: 3005, Res_ID: 2005, Schedule_ID: 1005, Seat_Num: '8A', Class_Type: 'Economy', Price: 6500, Ticket_Status: 'Cancelled' },
    { Ticket_ID: 3006, Res_ID: 2006, Schedule_ID: 1006, Seat_Num: '22D', Class_Type: 'Economy', Price: 3800, Ticket_Status: 'Booked' },
    { Ticket_ID: 3007, Res_ID: 2007, Schedule_ID: 1007, Seat_Num: '5A', Class_Type: 'Business', Price: 4500, Ticket_Status: 'Booked' },
    { Ticket_ID: 3008, Res_ID: 2008, Schedule_ID: 1008, Seat_Num: '10B', Class_Type: 'Economy', Price: 5200, Ticket_Status: 'Booked' },
    { Ticket_ID: 3009, Res_ID: 2009, Schedule_ID: 1009, Seat_Num: '18C', Class_Type: 'Economy', Price: 4800, Ticket_Status: 'Booked' },
    { Ticket_ID: 3010, Res_ID: 2010, Schedule_ID: 1010, Seat_Num: '7A', Class_Type: 'First', Price: 5600, Ticket_Status: 'Booked' },
  ];
  console.log('🎫 Inserting tickets...');
  await Ticket.insertMany(tickets);

  // ── PAYMENTS (10) ──
  const payments = [
    { Pay_ID: 4001, Res_ID: 2001, Amount: 5500, Pay_Date: '2026-04-25', Pay_Mode: 'UPI', Pay_Status: 'Success' },
    { Pay_ID: 4002, Res_ID: 2002, Amount: 4200, Pay_Date: '2026-04-25', Pay_Mode: 'Credit Card', Pay_Status: 'Success' },
    { Pay_ID: 4003, Res_ID: 2003, Amount: 6000, Pay_Date: '2026-04-26', Pay_Mode: 'Net Banking', Pay_Status: 'Pending' },
    { Pay_ID: 4004, Res_ID: 2004, Amount: 5800, Pay_Date: '2026-04-26', Pay_Mode: 'Debit Card', Pay_Status: 'Success' },
    { Pay_ID: 4005, Res_ID: 2005, Amount: 6500, Pay_Date: '2026-04-27', Pay_Mode: 'UPI', Pay_Status: 'Failed' },
    { Pay_ID: 4006, Res_ID: 2006, Amount: 3800, Pay_Date: '2026-04-27', Pay_Mode: 'UPI', Pay_Status: 'Success' },
    { Pay_ID: 4007, Res_ID: 2007, Amount: 4500, Pay_Date: '2026-04-28', Pay_Mode: 'Credit Card', Pay_Status: 'Success' },
    { Pay_ID: 4008, Res_ID: 2008, Amount: 5200, Pay_Date: '2026-04-28', Pay_Mode: 'Debit Card', Pay_Status: 'Success' },
    { Pay_ID: 4009, Res_ID: 2009, Amount: 4800, Pay_Date: '2026-04-29', Pay_Mode: 'Net Banking', Pay_Status: 'Pending' },
    { Pay_ID: 4010, Res_ID: 2010, Amount: 5600, Pay_Date: '2026-04-29', Pay_Mode: 'UPI', Pay_Status: 'Success' },
  ];
  console.log('💳 Inserting payments...');
  await Payment.insertMany(payments);

  console.log('✅ Seed complete! All 6 tables populated with 10 records each.');
  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});