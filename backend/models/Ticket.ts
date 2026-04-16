import mongoose, { Schema, Document } from 'mongoose';

export interface ITicket extends Document {
  Ticket_ID: number;
  Res_ID: number;
  Schedule_ID: number;
  Seat_Num: string;
  Class_Type: string;
  Price: number;
  Ticket_Status: string;
}

const TicketSchema = new Schema<ITicket>({
  Ticket_ID: { type: Number, required: true, unique: true },
  Res_ID: { type: Number, required: true, ref: 'Reservation' },
  Schedule_ID: { type: Number, required: true, ref: 'FlightSchedule' },
  Seat_Num: { type: String, required: true },
  Class_Type: { type: String, required: true, enum: ['Economy', 'Business', 'First'] },
  Price: { type: Number, required: true },
  Ticket_Status: { type: String, required: true, enum: ['Booked', 'Cancelled'] },
}, { timestamps: true });

TicketSchema.index({ Res_ID: 1 });
TicketSchema.index({ Schedule_ID: 1 });

export default mongoose.model<ITicket>('Ticket', TicketSchema);
