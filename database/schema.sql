-- ============================================================
-- FLIGHT TICKET RESERVATION SYSTEM — SQL Schema
-- Phase 2: Database Design (3NF/BCNF Normalized)
-- ============================================================

-- 1. Passenger Table
CREATE TABLE Passenger (
    Passenger_ID    INT             PRIMARY KEY,
    Name            VARCHAR(100)    NOT NULL,
    DOB             DATE            NOT NULL,
    Gender          VARCHAR(10)     NOT NULL CHECK (Gender IN ('Male', 'Female', 'Other')),
    Passport_Number VARCHAR(20)     NOT NULL UNIQUE,
    Email           VARCHAR(100)    NOT NULL UNIQUE,
    Contact_Number  VARCHAR(15)     NOT NULL
);

-- 2. Flight Table
CREATE TABLE Flight (
    Flight_ID       INT             PRIMARY KEY,
    Flight_Number   VARCHAR(10)     NOT NULL UNIQUE,
    Airline_Name    VARCHAR(50)     NOT NULL,
    Source          VARCHAR(50)     NOT NULL,
    Destination     VARCHAR(50)     NOT NULL,
    Base_Price      DECIMAL(10,2)   NOT NULL CHECK (Base_Price > 0)
);

-- 3. Flight_Schedule Table
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
);

-- 4. Reservation Table
CREATE TABLE Reservation (
    Res_ID          INT             PRIMARY KEY,
    Passenger_ID    INT             NOT NULL,
    Res_Date        DATE            NOT NULL,
    Res_Status      VARCHAR(20)     NOT NULL CHECK (Res_Status IN ('Confirmed', 'Cancelled', 'Pending')),
    Total_Amount    DECIMAL(10,2)   NOT NULL,
    FOREIGN KEY (Passenger_ID) REFERENCES Passenger(Passenger_ID)
        ON DELETE CASCADE ON UPDATE CASCADE
);

-- 5. Ticket Table
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
);

-- 6. Payment Table
CREATE TABLE Payment (
    Pay_ID          INT             PRIMARY KEY,
    Res_ID          INT             NOT NULL,
    Amount          DECIMAL(10,2)   NOT NULL,
    Pay_Date        DATE            NOT NULL,
    Pay_Mode        VARCHAR(20)     NOT NULL CHECK (Pay_Mode IN ('UPI', 'Credit Card', 'Debit Card', 'Net Banking')),
    Pay_Status      VARCHAR(20)     NOT NULL CHECK (Pay_Status IN ('Success', 'Failed', 'Pending')),
    FOREIGN KEY (Res_ID) REFERENCES Reservation(Res_ID)
        ON DELETE CASCADE ON UPDATE CASCADE
);
