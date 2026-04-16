import { Router, Request, Response } from 'express';
import { pool } from '../config/db.js';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

const router = Router();

// POST create payment intent (simulated for demo - in production use Stripe)
router.post('/create-intent', async (req: Request, res: Response) => {
  try {
    const { Res_ID, Amount } = req.body;

    const [rows] = await pool.query<RowDataPacket[]>(
      'SELECT * FROM Reservation WHERE Res_ID = ?', [Res_ID]
    );
    if (rows.length === 0) return res.status(404).json({ error: 'Reservation not found' });

    res.json({
      clientSecret: `pi_demo_${Res_ID}_${Date.now()}`,
      amount: Amount || rows[0].Total_Amount,
    });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// POST confirm payment (uses transaction)
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

// POST webhook (Stripe webhook simulation)
router.post('/webhook', async (req: Request, res: Response) => {
  try {
    const { type, data } = req.body;

    if (type === 'payment_intent.succeeded') {
      const resId = data?.metadata?.Res_ID;
      if (resId) {
        await pool.query<ResultSetHeader>("UPDATE Reservation SET Res_Status = 'Confirmed' WHERE Res_ID = ?", [resId]);
        await pool.query<ResultSetHeader>("UPDATE Payment SET Pay_Status = 'Success' WHERE Res_ID = ?", [resId]);
      }
    }

    if (type === 'payment_intent.payment_failed') {
      const resId = data?.metadata?.Res_ID;
      if (resId) {
        await pool.query<ResultSetHeader>("UPDATE Payment SET Pay_Status = 'Failed' WHERE Res_ID = ?", [resId]);
      }
    }

    res.json({ received: true });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

export default router;
