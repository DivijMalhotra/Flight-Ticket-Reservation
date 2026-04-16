-- ============================================================
-- FLIGHT TICKET RESERVATION SYSTEM — Sample Data
-- Phase 3: Data Insertion (10 records per table)
-- ============================================================

-- Passengers
INSERT INTO Passenger VALUES (1, 'Aarav Sharma', '1990-05-14', 'Male', 'A1234567', 'aarav@email.com', '9876543210');
INSERT INTO Passenger VALUES (2, 'Priya Singh', '1985-11-22', 'Female', 'B2345678', 'priya@email.com', '9876543211');
INSERT INTO Passenger VALUES (3, 'Rohan Patel', '1992-03-08', 'Male', 'C3456789', 'rohan@email.com', '9876543212');
INSERT INTO Passenger VALUES (4, 'Sneha Gupta', '1998-07-30', 'Female', 'D4567890', 'sneha@email.com', '9876543213');
INSERT INTO Passenger VALUES (5, 'Vikram Reddy', '1988-01-15', 'Male', 'E5678901', 'vikram@email.com', '9876543214');
INSERT INTO Passenger VALUES (6, 'Ananya Iyer', '1995-09-25', 'Female', 'F6789012', 'ananya@email.com', '9876543215');
INSERT INTO Passenger VALUES (7, 'Karan Mehta', '1991-12-02', 'Male', 'G7890123', 'karan@email.com', '9876543216');
INSERT INTO Passenger VALUES (8, 'Divya Nair', '1993-06-18', 'Female', 'H8901234', 'divya@email.com', '9876543217');
INSERT INTO Passenger VALUES (9, 'Arjun Verma', '1987-04-11', 'Male', 'I9012345', 'arjun@email.com', '9876543218');
INSERT INTO Passenger VALUES (10, 'Meera Joshi', '1996-08-05', 'Female', 'J0123456', 'meera@email.com', '9876543219');

-- Flights
INSERT INTO Flight VALUES (101, 'AI-101', 'Air India', 'Delhi', 'Mumbai', 5500);
INSERT INTO Flight VALUES (102, 'SG-202', 'SpiceJet', 'Mumbai', 'Bangalore', 4200);
INSERT INTO Flight VALUES (103, '6E-303', 'IndiGo', 'Delhi', 'Chennai', 6000);
INSERT INTO Flight VALUES (104, 'UK-404', 'Vistara', 'Kolkata', 'Delhi', 5800);
INSERT INTO Flight VALUES (105, 'AI-505', 'Air India', 'Bangalore', 'Delhi', 6500);
INSERT INTO Flight VALUES (106, 'SG-606', 'SpiceJet', 'Chennai', 'Hyderabad', 3800);
INSERT INTO Flight VALUES (107, '6E-707', 'IndiGo', 'Hyderabad', 'Mumbai', 4500);
INSERT INTO Flight VALUES (108, 'UK-808', 'Vistara', 'Delhi', 'Kolkata', 5200);
INSERT INTO Flight VALUES (109, 'G8-909', 'GoAir', 'Pune', 'Delhi', 4800);
INSERT INTO Flight VALUES (110, 'AI-110', 'Air India', 'Mumbai', 'Delhi', 5600);

-- Flight Schedules
INSERT INTO Flight_Schedule VALUES (1001, 101, '06:00', '08:15', '2025-05-01', 120, 0);
INSERT INTO Flight_Schedule VALUES (1002, 102, '09:30', '11:00', '2025-05-01', 80, 15);
INSERT INTO Flight_Schedule VALUES (1003, 103, '14:00', '16:30', '2025-05-02', 150, 0);
INSERT INTO Flight_Schedule VALUES (1004, 104, '07:45', '10:00', '2025-05-02', 60, 30);
INSERT INTO Flight_Schedule VALUES (1005, 105, '18:00', '21:00', '2025-05-03', 45, 0);
INSERT INTO Flight_Schedule VALUES (1006, 106, '11:15', '12:30', '2025-05-03', 90, 10);
INSERT INTO Flight_Schedule VALUES (1007, 107, '20:00', '22:00', '2025-05-04', 55, 0);
INSERT INTO Flight_Schedule VALUES (1008, 108, '05:30', '07:45', '2025-05-04', 100, 45);
INSERT INTO Flight_Schedule VALUES (1009, 109, '16:30', '18:45', '2025-05-05', 70, 0);
INSERT INTO Flight_Schedule VALUES (1010, 110, '12:00', '14:10', '2025-05-05', 130, 20);

-- Reservations
INSERT INTO Reservation VALUES (2001, 1, '2025-04-25', 'Confirmed', 5500);
INSERT INTO Reservation VALUES (2002, 2, '2025-04-25', 'Confirmed', 4200);
INSERT INTO Reservation VALUES (2003, 3, '2025-04-26', 'Pending', 6000);
INSERT INTO Reservation VALUES (2004, 4, '2025-04-26', 'Confirmed', 5800);
INSERT INTO Reservation VALUES (2005, 5, '2025-04-27', 'Cancelled', 6500);
INSERT INTO Reservation VALUES (2006, 6, '2025-04-27', 'Confirmed', 3800);
INSERT INTO Reservation VALUES (2007, 7, '2025-04-28', 'Confirmed', 4500);
INSERT INTO Reservation VALUES (2008, 8, '2025-04-28', 'Confirmed', 5200);
INSERT INTO Reservation VALUES (2009, 9, '2025-04-29', 'Pending', 4800);
INSERT INTO Reservation VALUES (2010, 10, '2025-04-29', 'Confirmed', 5600);

-- Tickets
INSERT INTO Ticket VALUES (3001, 2001, 1001, '12A', 'Economy', 5500, 'Booked');
INSERT INTO Ticket VALUES (3002, 2002, 1002, '1A', 'Business', 4200, 'Booked');
INSERT INTO Ticket VALUES (3003, 2003, 1003, '15C', 'Economy', 6000, 'Booked');
INSERT INTO Ticket VALUES (3004, 2004, 1004, '3B', 'First', 5800, 'Booked');
INSERT INTO Ticket VALUES (3005, 2005, 1005, '8A', 'Economy', 6500, 'Cancelled');
INSERT INTO Ticket VALUES (3006, 2006, 1006, '22D', 'Economy', 3800, 'Booked');
INSERT INTO Ticket VALUES (3007, 2007, 1007, '5A', 'Business', 4500, 'Booked');
INSERT INTO Ticket VALUES (3008, 2008, 1008, '10B', 'Economy', 5200, 'Booked');
INSERT INTO Ticket VALUES (3009, 2009, 1009, '18C', 'Economy', 4800, 'Booked');
INSERT INTO Ticket VALUES (3010, 2010, 1010, '7A', 'First', 5600, 'Booked');

-- Payments
INSERT INTO Payment VALUES (4001, 2001, 5500, '2025-04-25', 'UPI', 'Success');
INSERT INTO Payment VALUES (4002, 2002, 4200, '2025-04-25', 'Credit Card', 'Success');
INSERT INTO Payment VALUES (4003, 2003, 6000, '2025-04-26', 'Net Banking', 'Pending');
INSERT INTO Payment VALUES (4004, 2004, 5800, '2025-04-26', 'Debit Card', 'Success');
INSERT INTO Payment VALUES (4005, 2005, 6500, '2025-04-27', 'UPI', 'Failed');
INSERT INTO Payment VALUES (4006, 2006, 3800, '2025-04-27', 'UPI', 'Success');
INSERT INTO Payment VALUES (4007, 2007, 4500, '2025-04-28', 'Credit Card', 'Success');
INSERT INTO Payment VALUES (4008, 2008, 5200, '2025-04-28', 'Debit Card', 'Success');
INSERT INTO Payment VALUES (4009, 2009, 4800, '2025-04-29', 'Net Banking', 'Pending');
INSERT INTO Payment VALUES (4010, 2010, 5600, '2025-04-29', 'UPI', 'Success');
