import mongoose, { Schema, Document } from 'mongoose';

export interface IReservation extends Document {
  Res_ID: number;
  Passenger_ID: number;
  Res_Date: string;
  Res_Status: string;
  Total_Amount: number;
}

const ReservationSchema = new Schema<IReservation>({
  Res_ID: { type: Number, required: true, unique: true },
  Passenger_ID: { type: Number, required: true, ref: 'Passenger' },
  Res_Date: { type: String, required: true },
  Res_Status: { type: String, required: true, enum: ['Confirmed', 'Cancelled', 'Pending'] },
  Total_Amount: { type: Number, required: true },
}, { timestamps: true });

ReservationSchema.index({ Passenger_ID: 1 });

export default mongoose.model<IReservation>('Reservation', ReservationSchema);
