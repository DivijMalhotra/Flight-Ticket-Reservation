import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config();

async function migrate() {
  const conn = await mysql.createConnection({
    host: process.env.MYSQL_HOST || 'localhost',
    user: process.env.MYSQL_USER || 'root',
    password: process.env.MYSQL_PASSWORD || '',
    database: process.env.MYSQL_DATABASE || 'flight_reservation',
    port: Number(process.env.MYSQL_PORT) || 3306,
  });

  try {
    console.log('Adding Passenger_ID to Ticket...');
    await conn.query('ALTER TABLE Ticket ADD COLUMN Passenger_ID INT');
    
    console.log('Populating Passenger_ID for existing tickets based on Reservation...');
    await conn.query(`
      UPDATE Ticket t
      JOIN Reservation r ON t.Res_ID = r.Res_ID
      SET t.Passenger_ID = r.Passenger_ID
    `);

    console.log('Making Passenger_ID NOT NULL and adding foreign key...');
    await conn.query('ALTER TABLE Ticket MODIFY Passenger_ID INT NOT NULL');
    await conn.query(`
      ALTER TABLE Ticket 
      ADD CONSTRAINT fk_ticket_passenger 
      FOREIGN KEY (Passenger_ID) REFERENCES Passenger(Passenger_ID) 
      ON DELETE CASCADE ON UPDATE CASCADE
    `);
    console.log('Migration successful!');
  } catch (err) {
    console.error('Migration failed:', err);
  } finally {
    await conn.end();
  }
}

migrate();
