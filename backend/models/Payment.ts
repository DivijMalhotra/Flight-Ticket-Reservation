import mongoose, { Schema, Document } from 'mongoose';

export interface IPayment extends Document {
  Pay_ID: number;
  Res_ID: number;
  Amount: number;
  Pay_Date: string;
  Pay_Mode: string;
  Pay_Status: string;
}

const PaymentSchema = new Schema<IPayment>({
  Pay_ID: { type: Number, required: true, unique: true },
  Res_ID: { type: Number, required: true, ref: 'Reservation' },
  Amount: { type: Number, required: true },
  Pay_Date: { type: String, required: true },
  Pay_Mode: { type: String, required: true, enum: ['UPI', 'Credit Card', 'Debit Card', 'Net Banking'] },
  Pay_Status: { type: String, required: true, enum: ['Success', 'Failed', 'Pending'] },
}, { timestamps: true });

PaymentSchema.index({ Res_ID: 1 });

export default mongoose.model<IPayment>('Payment', PaymentSchema);
