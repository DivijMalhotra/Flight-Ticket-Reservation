/**
 * Run with: npm run seed
 * Creates the flight_reservation database, all tables, and inserts sample data.
 * Uses mysql2 — completely replaces the old MongoDB seed.
 */
import dotenv from 'dotenv';
dotenv.config();

import mysql from 'mysql2/promise';

async function seed() {
  // ── 1. Connect WITHOUT a database to create it if needed ──
  const initConn = await mysql.createConnection({
    host: process.env.MYSQL_HOST || 'localhost',
    user: process.env.MYSQL_USER || 'root',
    password: process.env.MYSQL_PASSWORD || '',
    port: Number(process.env.MYSQL_PORT) || 3306,
  });

  const dbName = process.env.MYSQL_DATABASE || 'flight_reservation';
  console.log(`🗄️  Creating database "${dbName}" if not exists...`);
  await initConn.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\``);
  await initConn.query(`USE \`${dbName}\``);

  // ── 2. Drop tables in reverse dependency order ──
  console.log('🧹 Dropping existing tables...');
  await initConn.query('SET FOREIGN_KEY_CHECKS = 0');
  await initConn.query('DROP TABLE IF EXISTS Payment');
  await initConn.query('DROP TABLE IF EXISTS Ticket');
  await initConn.query('DROP TABLE IF EXISTS Reservation');
  await initConn.query('DROP TABLE IF EXISTS Flight_Schedule');
  await initConn.query('DROP TABLE IF EXISTS Flight');
  await initConn.query('DROP TABLE IF EXISTS Passenger');
  await initConn.query('SET FOREIGN_KEY_CHECKS = 1');

  // ── 3. Create tables ──
  console.log('📐 Creating tables...');

  await initConn.query(`
    CREATE TABLE Passenger (
      Passenger_ID    INT             PRIMARY KEY,
      Name            VARCHAR(100)    NOT NULL,
      DOB             DATE            NOT NULL,
      Gender          VARCHAR(10)     NOT NULL CHECK (Gender IN ('Male', 'Female', 'Other')),
      Passport_Number VARCHAR(20)     NOT NULL UNIQUE,
      Email           VARCHAR(100)    NOT NULL UNIQUE,
      Contact_Number  VARCHAR(15)     NOT NULL
    )
  `);

  await initConn.query(`
    CREATE TABLE Flight (
      Flight_ID       INT             PRIMARY KEY,
      Flight_Number   VARCHAR(10)     NOT NULL UNIQUE,
      Airline_Name    VARCHAR(50)     NOT NULL,
      Source          VARCHAR(50)     NOT NULL,
      Destination     VARCHAR(50)     NOT NULL,
      Base_Price      DECIMAL(10,2)   NOT NULL CHECK (Base_Price > 0)
    )
  `);

  await initConn.query(`
    CREATE TABLE Flight_Schedule (
      Schedule_ID     INT             PRIMARY KEY,
      Flight_ID       INT             NOT NULL,
      Depart_Time     TIME            NOT NULL,
      Arrival_Time    TIME            NOT NULL,
      Travel_Date     DATE            NOT NULL,
      Available_Seats INT             NOT NULL CHECK (Available_Seats >= 0),
      Delay_Minutes   INT             DEFAULT 0,
      FOREIGN KEY (Flight_ID) REFERENCES Flight(Flight_ID)
        ON DELETE CASCADE ON UPDATE CASCADE
    )
  `);

  await initConn.query(`
    CREATE TABLE Reservation (
      Res_ID          INT             PRIMARY KEY,
      Passenger_ID    INT             NOT NULL,
      Res_Date        DATE            NOT NULL,
      Res_Status      VARCHAR(20)     NOT NULL CHECK (Res_Status IN ('Confirmed', 'Cancelled', 'Pending')),
      Total_Amount    DECIMAL(10,2)   NOT NULL,
      FOREIGN KEY (Passenger_ID) REFERENCES Passenger(Passenger_ID)
        ON DELETE CASCADE ON UPDATE CASCADE
    )
  `);

  await initConn.query(`
    CREATE TABLE Ticket (
      Ticket_ID       INT             PRIMARY KEY,
      Res_ID          INT             NOT NULL,
      Schedule_ID     INT             NOT NULL,
      Seat_Num        VARCHAR(10)     NOT NULL,
      Class_Type      VARCHAR(20)     NOT NULL CHECK (Class_Type IN ('Economy', 'Business', 'First')),
      Price           DECIMAL(10,2)   NOT NULL,
      Ticket_Status   VARCHAR(20)     NOT NULL CHECK (Ticket_Status IN ('Booked', 'Cancelled')),
      FOREIGN KEY (Res_ID) REFERENCES Reservation(Res_ID)
        ON DELETE CASCADE ON UPDATE CASCADE,
      FOREIGN KEY (Schedule_ID) REFERENCES Flight_Schedule(Schedule_ID)
        ON DELETE CASCADE ON UPDATE CASCADE
    )
  `);

  await initConn.query(`
    CREATE TABLE Payment (
      Pay_ID          INT             PRIMARY KEY,
      Res_ID          INT             NOT NULL,
      Amount          DECIMAL(10,2)   NOT NULL,
      Pay_Date        DATE            NOT NULL,
      Pay_Mode        VARCHAR(20)     NOT NULL CHECK (Pay_Mode IN ('UPI', 'Credit Card', 'Debit Card', 'Net Banking')),
      Pay_Status      VARCHAR(20)     NOT NULL CHECK (Pay_Status IN ('Success', 'Failed', 'Pending')),
      FOREIGN KEY (Res_ID) REFERENCES Reservation(Res_ID)
        ON DELETE CASCADE ON UPDATE CASCADE
    )
  `);

  console.log('✅ All 6 tables created successfully.');

  // ── 4. Insert Passengers (10) ──
  console.log('👤 Inserting passengers...');
  const passengers = [
    [1, 'Aarav Sharma', '1990-05-14', 'Male', 'A1234567', 'aarav@email.com', '9876543210'],
    [2, 'Priya Singh', '1985-11-22', 'Female', 'B2345678', 'priya@email.com', '9876543211'],
    [3, 'Rohan Patel', '1992-03-08', 'Male', 'C3456789', 'rohan@email.com', '9876543212'],
    [4, 'Sneha Gupta', '1998-07-30', 'Female', 'D4567890', 'sneha@email.com', '9876543213'],
    [5, 'Vikram Reddy', '1988-01-15', 'Male', 'E5678901', 'vikram@email.com', '9876543214'],
    [6, 'Ananya Iyer', '1995-09-25', 'Female', 'F6789012', 'ananya@email.com', '9876543215'],
    [7, 'Karan Mehta', '1991-12-02', 'Male', 'G7890123', 'karan@email.com', '9876543216'],
    [8, 'Divya Nair', '1993-06-18', 'Female', 'H8901234', 'divya@email.com', '9876543217'],
    [9, 'Arjun Verma', '1987-04-11', 'Male', 'I9012345', 'arjun@email.com', '9876543218'],
    [10, 'Meera Joshi', '1996-08-05', 'Female', 'J0123456', 'meera@email.com', '9876543219'],
  ];
  await initConn.query(
    'INSERT INTO Passenger (Passenger_ID, Name, DOB, Gender, Passport_Number, Email, Contact_Number) VALUES ?',
    [passengers]
  );

  // ── 5. Insert Flights (10) ──
  console.log('✈️  Inserting flights...');
  const flights = [
    [101, 'AI-101', 'Air India', 'Delhi', 'Mumbai', 5500],
    [102, 'SG-202', 'SpiceJet', 'Mumbai', 'Bangalore', 4200],
    [103, '6E-303', 'IndiGo', 'Delhi', 'Chennai', 6000],
    [104, 'UK-404', 'Vistara', 'Kolkata', 'Delhi', 5800],
    [105, 'AI-505', 'Air India', 'Bangalore', 'Delhi', 6500],
    [106, 'SG-606', 'SpiceJet', 'Chennai', 'Hyderabad', 3800],
    [107, '6E-707', 'IndiGo', 'Hyderabad', 'Mumbai', 4500],
    [108, 'UK-808', 'Vistara', 'Delhi', 'Kolkata', 5200],
    [109, 'G8-909', 'GoAir', 'Pune', 'Delhi', 4800],
    [110, 'AI-110', 'Air India', 'Mumbai', 'Delhi', 5600],
  ];
  await initConn.query(
    'INSERT INTO Flight (Flight_ID, Flight_Number, Airline_Name, Source, Destination, Base_Price) VALUES ?',
    [flights]
  );

  // ── 6. Insert Flight Schedules (30 days × 10 flights = 300) ──
  const flightTemplates = [
    { Flight_ID: 101, Depart_Time: '06:00:00', Arrival_Time: '08:15:00', Seats: 120, Delay: 0 },
    { Flight_ID: 102, Depart_Time: '09:30:00', Arrival_Time: '11:00:00', Seats: 80, Delay: 15 },
    { Flight_ID: 103, Depart_Time: '14:00:00', Arrival_Time: '16:30:00', Seats: 150, Delay: 0 },
    { Flight_ID: 104, Depart_Time: '07:45:00', Arrival_Time: '10:00:00', Seats: 60, Delay: 30 },
    { Flight_ID: 105, Depart_Time: '18:00:00', Arrival_Time: '21:00:00', Seats: 45, Delay: 0 },
    { Flight_ID: 106, Depart_Time: '11:15:00', Arrival_Time: '12:30:00', Seats: 90, Delay: 10 },
    { Flight_ID: 107, Depart_Time: '20:00:00', Arrival_Time: '22:00:00', Seats: 55, Delay: 0 },
    { Flight_ID: 108, Depart_Time: '05:30:00', Arrival_Time: '07:45:00', Seats: 100, Delay: 45 },
    { Flight_ID: 109, Depart_Time: '16:30:00', Arrival_Time: '18:45:00', Seats: 70, Delay: 0 },
    { Flight_ID: 110, Depart_Time: '12:00:00', Arrival_Time: '14:10:00', Seats: 130, Delay: 20 },
  ];

  const schedules: any[][] = [];
  let schedId = 1001;
  for (let day = 0; day < 30; day++) {
    const d = new Date();
    d.setDate(d.getDate() + day);
    const dateStr = d.toISOString().split('T')[0];
    for (const t of flightTemplates) {
      schedules.push([schedId++, t.Flight_ID, t.Depart_Time, t.Arrival_Time, dateStr, t.Seats, t.Delay]);
    }
  }
  console.log(`📅 Inserting ${schedules.length} flight schedules (30 days)...`);
  // Insert in batches of 50 to avoid query size limits
  for (let i = 0; i < schedules.length; i += 50) {
    const batch = schedules.slice(i, i + 50);
    await initConn.query(
      'INSERT INTO Flight_Schedule (Schedule_ID, Flight_ID, Depart_Time, Arrival_Time, Travel_Date, Available_Seats, Delay_Minutes) VALUES ?',
      [batch]
    );
  }

  // ── 7. Insert Reservations (10) ──
  console.log('📝 Inserting reservations...');
  const reservations = [
    [2001, 1, '2026-04-25', 'Confirmed', 5500],
    [2002, 2, '2026-04-25', 'Confirmed', 4200],
    [2003, 3, '2026-04-26', 'Pending', 6000],
    [2004, 4, '2026-04-26', 'Confirmed', 5800],
    [2005, 5, '2026-04-27', 'Cancelled', 6500],
    [2006, 6, '2026-04-27', 'Confirmed', 3800],
    [2007, 7, '2026-04-28', 'Confirmed', 4500],
    [2008, 8, '2026-04-28', 'Confirmed', 5200],
    [2009, 9, '2026-04-29', 'Pending', 4800],
    [2010, 10, '2026-04-29', 'Confirmed', 5600],
  ];
  await initConn.query(
    'INSERT INTO Reservation (Res_ID, Passenger_ID, Res_Date, Res_Status, Total_Amount) VALUES ?',
    [reservations]
  );

  // ── 8. Insert Tickets (10) ──
  console.log('🎫 Inserting tickets...');
  const tickets = [
    [3001, 2001, 1001, '12A', 'Economy', 5500, 'Booked'],
    [3002, 2002, 1002, '1A', 'Business', 4200, 'Booked'],
    [3003, 2003, 1003, '15C', 'Economy', 6000, 'Booked'],
    [3004, 2004, 1004, '3B', 'First', 5800, 'Booked'],
    [3005, 2005, 1005, '8A', 'Economy', 6500, 'Cancelled'],
    [3006, 2006, 1006, '22D', 'Economy', 3800, 'Booked'],
    [3007, 2007, 1007, '5A', 'Business', 4500, 'Booked'],
    [3008, 2008, 1008, '10B', 'Economy', 5200, 'Booked'],
    [3009, 2009, 1009, '18C', 'Economy', 4800, 'Booked'],
    [3010, 2010, 1010, '7A', 'First', 5600, 'Booked'],
  ];
  await initConn.query(
    'INSERT INTO Ticket (Ticket_ID, Res_ID, Schedule_ID, Seat_Num, Class_Type, Price, Ticket_Status) VALUES ?',
    [tickets]
  );

  // ── 9. Insert Payments (10) ──
  console.log('💳 Inserting payments...');
  const payments = [
    [4001, 2001, 5500, '2026-04-25', 'UPI', 'Success'],
    [4002, 2002, 4200, '2026-04-25', 'Credit Card', 'Success'],
    [4003, 2003, 6000, '2026-04-26', 'Net Banking', 'Pending'],
    [4004, 2004, 5800, '2026-04-26', 'Debit Card', 'Success'],
    [4005, 2005, 6500, '2026-04-27', 'UPI', 'Failed'],
    [4006, 2006, 3800, '2026-04-27', 'UPI', 'Success'],
    [4007, 2007, 4500, '2026-04-28', 'Credit Card', 'Success'],
    [4008, 2008, 5200, '2026-04-28', 'Debit Card', 'Success'],
    [4009, 2009, 4800, '2026-04-29', 'Net Banking', 'Pending'],
    [4010, 2010, 5600, '2026-04-29', 'UPI', 'Success'],
  ];
  await initConn.query(
    'INSERT INTO Payment (Pay_ID, Res_ID, Amount, Pay_Date, Pay_Mode, Pay_Status) VALUES ?',
    [payments]
  );

  console.log('\n✅ Seed complete! All 6 tables populated:');
  console.log('   • 10 Passengers');
  console.log('   • 10 Flights');
  console.log(`   • ${schedules.length} Flight Schedules (30 days × 10 flights)`);
  console.log('   • 10 Reservations');
  console.log('   • 10 Tickets');
  console.log('   • 10 Payments');

  await initConn.end();
}

seed().catch((err) => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});