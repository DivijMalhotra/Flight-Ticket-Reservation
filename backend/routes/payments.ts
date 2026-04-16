import { Router, Request, Response } from 'express';
import { pool } from '../config/db.js';
import { RowDataPacket, ResultSetHeader } from 'mysql2';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

const router = Router();

// POST create payment intent — calls the real Stripe API
router.post('/create-intent', async (req: Request, res: Response) => {
  try {
    const { Res_ID, Amount } = req.body;

    const [rows] = await pool.query<RowDataPacket[]>(
      'SELECT * FROM Reservation WHERE Res_ID = ?', [Res_ID]
    );
    if (rows.length === 0) return res.status(404).json({ error: 'Reservation not found' });

    const amountInPaise = Math.round((Amount || rows[0].Total_Amount) * 100);

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInPaise,
      currency: 'inr',
      metadata: { Res_ID: String(Res_ID) },
    });

    res.json({
      clientSecret: paymentIntent.client_secret,
      amount: Amount || rows[0].Total_Amount,
    });
  } catch (err: any) {
    console.error('Stripe create-intent error:', err.message);
    res.status(400).json({ error: err.message });
  }
});

// POST create Stripe Checkout Session — redirects user to Stripe's hosted page
router.post('/create-checkout-session', async (req: Request, res: Response) => {
  try {
    const { Res_ID, Amount, Flight_Info } = req.body;

    const [rows] = await pool.query<RowDataPacket[]>(
      'SELECT * FROM Reservation WHERE Res_ID = ?', [Res_ID]
    );
    if (rows.length === 0) return res.status(404).json({ error: 'Reservation not found' });

    const amountInPaise = Math.round((Amount || rows[0].Total_Amount) * 100);
    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';

    // Build a descriptive product name from flight info
    const flightDesc = Flight_Info
      ? `Flight — ${Flight_Info.Source} → ${Flight_Info.Destination}`
      : `Flight Reservation #${Res_ID}`;
    const flightMeta = Flight_Info
      ? `${Flight_Info.Airline} · ${Flight_Info.Class_Type} · Seats: ${Flight_Info.Seat_Num} · ${Flight_Info.Travel_Date} · ${Flight_Info.Travelers || 1} traveler(s)`
      : '';

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      line_items: [
        {
          price_data: {
            currency: 'inr',
            unit_amount: amountInPaise,
            product_data: {
              name: flightDesc,
              description: flightMeta || undefined,
            },
          },
          quantity: 1,
        },
      ],
      metadata: { Res_ID: String(Res_ID) },
      success_url: `${clientUrl}/payment/${Res_ID}?status=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${clientUrl}/payment/${Res_ID}?status=cancelled`,
    });

    res.json({ url: session.url });
  } catch (err: any) {
    console.error('Stripe checkout session error:', err.message);
    res.status(400).json({ error: err.message });
  }
});

// POST confirm payment (uses transaction — for UPI / Net Banking fallback)
router.post('/confirm', async (req: Request, res: Response) => {
  const conn = await pool.getConnection();
  try {
    const { Res_ID, Pay_Mode } = req.body;

    await conn.beginTransaction();

    // Check reservation exists
    const [resRows] = await conn.query<RowDataPacket[]>(
      'SELECT * FROM Reservation WHERE Res_ID = ?', [Res_ID]
    );
    if (resRows.length === 0) { await conn.rollback(); return res.status(404).json({ error: 'Reservation not found' }); }
    const reservation = resRows[0];

    // Check if already paid
    const [existingPay] = await conn.query<RowDataPacket[]>(
      "SELECT * FROM Payment WHERE Res_ID = ? AND Pay_Status = 'Success' LIMIT 1", [Res_ID]
    );
    if ((existingPay as any[]).length > 0) {
      await conn.rollback();
      return res.json({ message: 'Already paid', payment: existingPay[0] });
    }

    // Get next Pay_ID
    const [maxPay] = await conn.query<RowDataPacket[]>(
      'SELECT COALESCE(MAX(Pay_ID), 4000) + 1 AS nextId FROM Payment'
    );
    const nextPayId = maxPay[0].nextId;
    const today = new Date().toISOString().split('T')[0];

    // Insert payment
    await conn.query<ResultSetHeader>(
      'INSERT INTO Payment (Pay_ID, Res_ID, Amount, Pay_Date, Pay_Mode, Pay_Status) VALUES (?, ?, ?, ?, ?, ?)',
      [nextPayId, Res_ID, reservation.Total_Amount, today, Pay_Mode || 'UPI', 'Success']
    );

    // Update reservation status to Confirmed
    await conn.query<ResultSetHeader>(
      "UPDATE Reservation SET Res_Status = 'Confirmed' WHERE Res_ID = ?", [Res_ID]
    );

    await conn.commit();

    res.json({
      message: 'Payment successful',
      payment: { Pay_ID: nextPayId, Res_ID, Amount: reservation.Total_Amount, Pay_Date: today, Pay_Mode: Pay_Mode || 'UPI', Pay_Status: 'Success' },
    });
  } catch (err: any) {
    await conn.rollback();
    res.status(400).json({ error: err.message });
  } finally {
    conn.release();
  }
});

// POST webhook — verifies Stripe signature and processes events
router.post('/webhook', async (req: Request, res: Response) => {
  const sig = req.headers['stripe-signature'] as string | undefined;

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      req.body,                               // raw body (Buffer) — express.raw() middleware required
      sig!,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    if (event.type === 'payment_intent.succeeded') {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      const resId = paymentIntent.metadata?.Res_ID;
      if (resId) {
        const conn = await pool.getConnection();
        try {
          await conn.beginTransaction();

          // Get next Pay_ID
          const [maxPay] = await conn.query<RowDataPacket[]>(
            'SELECT COALESCE(MAX(Pay_ID), 4000) + 1 AS nextId FROM Payment'
          );
          const nextPayId = maxPay[0].nextId;
          const today = new Date().toISOString().split('T')[0];
          const amountInINR = paymentIntent.amount / 100;

          // Check if payment already recorded for this reservation
          const [existingPay] = await conn.query<RowDataPacket[]>(
            "SELECT * FROM Payment WHERE Res_ID = ? AND Pay_Status = 'Success' LIMIT 1", [resId]
          );

          if ((existingPay as any[]).length === 0) {
            await conn.query<ResultSetHeader>(
              'INSERT INTO Payment (Pay_ID, Res_ID, Amount, Pay_Date, Pay_Mode, Pay_Status) VALUES (?, ?, ?, ?, ?, ?)',
              [nextPayId, resId, amountInINR, today, 'Credit Card', 'Success']
            );
          }

          await conn.query<ResultSetHeader>(
            "UPDATE Reservation SET Res_Status = 'Confirmed' WHERE Res_ID = ?", [resId]
          );

          await conn.commit();
        } catch (dbErr) {
          await conn.rollback();
          throw dbErr;
        } finally {
          conn.release();
        }
      }
    }

    if (event.type === 'payment_intent.payment_failed') {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      const resId = paymentIntent.metadata?.Res_ID;
      if (resId) {
        await pool.query<ResultSetHeader>(
          "UPDATE Payment SET Pay_Status = 'Failed' WHERE Res_ID = ?", [resId]
        );
      }
    }

    res.json({ received: true });
  } catch (err: any) {
    console.error('Webhook processing error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

export default router;
