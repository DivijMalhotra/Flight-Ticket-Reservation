import mongoose, { Schema, Document } from 'mongoose';

export interface IFlight extends Document {
  Flight_ID: number;
  Flight_Number: string;
  Airline_Name: string;
  Source: string;
  Destination: string;
  Base_Price: number;
}

const FlightSchema = new Schema<IFlight>({
  Flight_ID: { type: Number, required: true, unique: true },
  Flight_Number: { type: String, required: true, unique: true },
  Airline_Name: { type: String, required: true },
  Source: { type: String, required: true },
  Destination: { type: String, required: true },
  Base_Price: { type: Number, required: true },
}, { timestamps: true });

export default mongoose.model<IFlight>('Flight', FlightSchema);
