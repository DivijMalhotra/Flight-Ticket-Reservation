import mongoose, { Schema, Document } from 'mongoose';

export interface IPassenger extends Document {
  Passenger_ID: number;
  Name: string;
  DOB: string;
  Gender: string;
  Passport_Number: string;
  Email: string;
  Contact_Number: string;
}

const PassengerSchema = new Schema<IPassenger>({
  Passenger_ID: { type: Number, required: true, unique: true },
  Name: { type: String, required: true },
  DOB: { type: String, required: true },
  Gender: { type: String, required: true, enum: ['Male', 'Female', 'Other'] },
  Passport_Number: { type: String, required: true, unique: true },
  Email: { type: String, required: true, unique: true },
  Contact_Number: { type: String, required: true },
}, { timestamps: true });

export default mongoose.model<IPassenger>('Passenger', PassengerSchema);
