-- ============================================================
-- FLIGHT TICKET RESERVATION SYSTEM — SQL Queries
-- Phase 6: Important SQL Queries (JOINs, GROUP BY, WHERE)
-- ============================================================

-- Q1: Passengers traveling to Delhi
SELECT DISTINCT p.Passenger_ID, p.Name, p.Email
FROM Passenger p
JOIN Reservation r ON p.Passenger_ID = r.Passenger_ID
JOIN Ticket t ON r.Res_ID = t.Res_ID
JOIN Flight_Schedule fs ON t.Schedule_ID = fs.Schedule_ID
JOIN Flight f ON fs.Flight_ID = f.Flight_ID
WHERE f.Destination = 'Delhi' AND t.Ticket_Status = 'Booked';

-- Q2: Tickets for a specific date (e.g., 2025-05-01)
SELECT t.Ticket_ID, t.Seat_Num, t.Class_Type, t.Price, t.Ticket_Status,
       fs.Travel_Date, f.Flight_Number
FROM Ticket t
JOIN Flight_Schedule fs ON t.Schedule_ID = fs.Schedule_ID
JOIN Flight f ON fs.Flight_ID = f.Flight_ID
WHERE fs.Travel_Date = '2025-05-01';

-- Q3: Passengers with no reservation (LEFT JOIN / NOT IN)
SELECT p.Passenger_ID, p.Name, p.Email
FROM Passenger p
LEFT JOIN Reservation r ON p.Passenger_ID = r.Passenger_ID
WHERE r.Res_ID IS NULL;

-- Alternatively using NOT IN:
-- SELECT * FROM Passenger WHERE Passenger_ID NOT IN (SELECT Passenger_ID FROM Reservation);

-- Q4: Total UPI payments (GROUP BY + aggregate)
SELECT Pay_Mode, COUNT(*) AS Total_Transactions, SUM(Amount) AS Total_Amount
FROM Payment
WHERE Pay_Mode = 'UPI'
GROUP BY Pay_Mode;

-- Q5: Flights with available seats > 50
SELECT f.Flight_ID, f.Flight_Number, f.Airline_Name, f.Source, f.Destination,
       fs.Schedule_ID, fs.Travel_Date, fs.Available_Seats
FROM Flight f
JOIN Flight_Schedule fs ON f.Flight_ID = fs.Flight_ID
WHERE fs.Available_Seats > 50;

-- Q6: Delayed flights (Delay_Minutes > 0)
SELECT f.Flight_Number, f.Airline_Name, f.Source, f.Destination,
       fs.Travel_Date, fs.Depart_Time, fs.Delay_Minutes
FROM Flight f
JOIN Flight_Schedule fs ON f.Flight_ID = fs.Flight_ID
WHERE fs.Delay_Minutes > 0
ORDER BY fs.Delay_Minutes DESC;

-- Q7: Passenger name + travel date for flights to Delhi
SELECT p.Name AS Passenger_Name, fs.Travel_Date, f.Destination
FROM Passenger p
JOIN Reservation r ON p.Passenger_ID = r.Passenger_ID
JOIN Ticket t ON r.Res_ID = t.Res_ID
JOIN Flight_Schedule fs ON t.Schedule_ID = fs.Schedule_ID
JOIN Flight f ON fs.Flight_ID = f.Flight_ID
WHERE f.Destination = 'Delhi' AND t.Ticket_Status = 'Booked';

-- Q8: Successful payments
SELECT pay.Pay_ID, pay.Amount, pay.Pay_Date, pay.Pay_Mode,
       p.Name AS Passenger_Name, f.Flight_Number
FROM Payment pay
JOIN Reservation r ON pay.Res_ID = r.Res_ID
JOIN Passenger p ON r.Passenger_ID = p.Passenger_ID
JOIN Ticket t ON r.Res_ID = t.Res_ID
JOIN Flight_Schedule fs ON t.Schedule_ID = fs.Schedule_ID
JOIN Flight f ON fs.Flight_ID = f.Flight_ID
WHERE pay.Pay_Status = 'Success';
