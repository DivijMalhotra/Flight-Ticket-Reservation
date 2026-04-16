import mongoose, { Schema, Document } from 'mongoose';

export interface IFlightSchedule extends Document {
  Schedule_ID: number;
  Flight_ID: number;
  Depart_Time: string;
  Arrival_Time: string;
  Travel_Date: string;
  Available_Seats: number;
  Delay_Minutes: number;
}

const FlightScheduleSchema = new Schema<IFlightSchedule>({
  Schedule_ID: { type: Number, required: true, unique: true },
  Flight_ID: { type: Number, required: true, ref: 'Flight' },
  Depart_Time: { type: String, required: true },
  Arrival_Time: { type: String, required: true },
  Travel_Date: { type: String, required: true },
  Available_Seats: { type: Number, required: true, min: 0 },
  Delay_Minutes: { type: Number, default: 0 },
}, { timestamps: true });

FlightScheduleSchema.index({ Flight_ID: 1, Travel_Date: 1 });

export default mongoose.model<IFlightSchedule>('FlightSchedule', FlightScheduleSchema);
