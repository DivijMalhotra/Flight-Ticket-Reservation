import { Router, Request, Response } from 'express';
import Payment from '../models/Payment.js';
import Reservation from '../models/Reservation.js';
import Ticket from '../models/Ticket.js';

const router = Router();

// POST create payment intent (simulated for demo - in production use Stripe)
router.post('/create-intent', async (req: Request, res: Response) => {
  try {
    const { Res_ID, Amount } = req.body;
    const reservation = await Reservation.findOne({ Res_ID });
    if (!reservation) return res.status(404).json({ error: 'Reservation not found' });

    // In production, create a Stripe PaymentIntent here
    res.json({
      clientSecret: `pi_demo_${Res_ID}_${Date.now()}`,
      amount: Amount || reservation.Total_Amount,
    });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// POST confirm payment
router.post('/confirm', async (req: Request, res: Response) => {
  try {
    const { Res_ID, Pay_Mode } = req.body;

    const reservation = await Reservation.findOne({ Res_ID });
    if (!reservation) return res.status(404).json({ error: 'Reservation not found' });

    // Check if payment already exists
    const existing = await Payment.findOne({ Res_ID, Pay_Status: 'Success' });
    if (existing) return res.json({ message: 'Already paid', payment: existing });

    const lastPay = await Payment.findOne().sort({ Pay_ID: -1 });
    const nextPayId = lastPay ? lastPay.Pay_ID + 1 : 4001;
    const today = new Date().toISOString().split('T')[0];

    const payment = await Payment.create({
      Pay_ID: nextPayId,
      Res_ID,
      Amount: reservation.Total_Amount,
      Pay_Date: today,
      Pay_Mode: Pay_Mode || 'UPI',
      Pay_Status: 'Success',
    });

    // Update reservation status
    await Reservation.updateOne({ Res_ID }, { Res_Status: 'Confirmed' });

    res.json({ message: 'Payment successful', payment });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// POST webhook (Stripe webhook simulation)
router.post('/webhook', async (req: Request, res: Response) => {
  try {
    const { type, data } = req.body;

    if (type === 'payment_intent.succeeded') {
      const resId = data?.metadata?.Res_ID;
      if (resId) {
        await Reservation.updateOne({ Res_ID: resId }, { Res_Status: 'Confirmed' });
        await Payment.updateMany({ Res_ID: resId }, { Pay_Status: 'Success' });
      }
    }

    if (type === 'payment_intent.payment_failed') {
      const resId = data?.metadata?.Res_ID;
      if (resId) {
        await Payment.updateMany({ Res_ID: resId }, { Pay_Status: 'Failed' });
      }
    }

    res.json({ received: true });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

export default router;
