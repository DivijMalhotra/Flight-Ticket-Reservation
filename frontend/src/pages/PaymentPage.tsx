import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '@/services/api';
import { formatCurrency } from '@/lib/utils';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import {
  CreditCard, Lock, Shield, CheckCircle2, Plane, Calendar,
  User, Armchair, Wallet,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const PaymentPage: React.FC = () => {
  const { reservationId } = useParams<{ reservationId: string }>();
  const navigate = useNavigate();
  const [reservation, setReservation] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [payMode, setPayMode] = useState('UPI');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvc, setCardCvc] = useState('');
  const [upiId, setUpiId] = useState('');

  useEffect(() => {
    api.getReservation(Number(reservationId))
      .then(setReservation)
      .catch(() => toast.error('Reservation not found'))
      .finally(() => setLoading(false));
  }, [reservationId]);

  const validatePayment = (): boolean => {
    if (payMode === 'UPI') {
      if (!upiId || !upiId.includes('@')) {
        toast.error('Enter a valid UPI ID (e.g. name@upi)');
        return false;
      }
    }
    if (payMode === 'Credit Card' || payMode === 'Debit Card') {
      if (cardNumber.replace(/\s/g, '').length < 16) {
        toast.error('Enter a valid 16-digit card number');
        return false;
      }
      if (!cardExpiry || cardExpiry.length < 5) {
        toast.error('Enter a valid expiry (MM/YY)');
        return false;
      }
      if (!cardCvc || cardCvc.length < 3) {
        toast.error('Enter a valid CVC');
        return false;
      }
    }
    return true;
  };

  const handlePay = async () => {
    if (!validatePayment()) return;

    setProcessing(true);
    try {
      // Simulate a brief payment processing delay
      await new Promise(resolve => setTimeout(resolve, 2000));

      const result = await api.confirmPayment({
        Res_ID: Number(reservationId),
        Pay_Mode: payMode,
      });

      toast.success('Payment successful!');

      // Fetch updated reservation for confirmation page
      const updatedRes = await api.getReservation(Number(reservationId));
      navigate('/booking-confirm', {
        state: {
          reservation: updatedRes.reservation,
          ticket: updatedRes.tickets?.[0],
          payment: updatedRes.payments?.[0] || result.payment,
        },
      });
    } catch (err: any) {
      toast.error(err.message || 'Payment failed');
    } finally {
      setProcessing(false);
    }
  };

  const formatCardNumber = (val: string) => {
    const digits = val.replace(/\D/g, '').slice(0, 16);
    return digits.replace(/(.{4})/g, '$1 ').trim();
  };

  const formatExpiry = (val: string) => {
    const digits = val.replace(/\D/g, '').slice(0, 4);
    if (digits.length >= 2) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
    return digits;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="spinner" />
      </div>
    );
  }

  if (!reservation) {
    return (
      <div className="container-app page-section text-center">
        <p className="text-gray-400">Reservation not found.</p>
      </div>
    );
  }

  const amount = reservation?.reservation?.Total_Amount || 0;
  const ticket = reservation?.tickets?.[0];

  return (
    <div className="container-app page-section">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl mx-auto"
      >
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-brand-500/10 border border-brand-500/20 mb-4">
            <Wallet className="w-7 h-7 text-brand-500" />
          </div>
          <h1 className="text-2xl font-bold text-white">Complete Payment</h1>
          <p className="text-gray-400 text-sm mt-1">Reservation #{reservationId} · Secure checkout</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-6">
          {/* Left — Payment Form */}
          <div className="space-y-5">
            {/* Order summary card */}
            {ticket && (
              <div className="card !p-4">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Flight Summary</h3>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-brand-500/10 flex items-center justify-center">
                    <Plane size={18} className="text-brand-500" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-white">
                      {ticket.Source || '—'} → {ticket.Destination || '—'}
                    </p>
                    <p className="text-xs text-gray-500 flex items-center gap-2">
                      <span className="flex items-center gap-1"><Calendar size={10} /> {ticket.Travel_Date}</span>
                      <span>·</span>
                      <span className="flex items-center gap-1"><Armchair size={10} /> {ticket.Seat_Num} ({ticket.Class_Type})</span>
                    </p>
                  </div>
                  <p className="text-lg font-extrabold text-brand-500">{formatCurrency(amount)}</p>
                </div>
              </div>
            )}

            {/* Payment Method */}
            <div className="card !p-5">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2 mb-4">
                <CreditCard size={16} className="text-brand-500" /> Payment Method
              </h3>
              <div className="grid grid-cols-2 gap-3 mb-5">
                {['UPI', 'Credit Card', 'Debit Card', 'Net Banking'].map(mode => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => setPayMode(mode)}
                    className={cn(
                      'px-4 py-3 rounded-lg border text-sm font-medium transition-all cursor-pointer text-left',
                      payMode === mode
                        ? 'bg-brand-500/10 border-brand-500 text-brand-500'
                        : 'bg-surface-input border-border text-gray-400 hover:border-gray-500'
                    )}
                  >
                    {mode}
                  </button>
                ))}
              </div>

              {/* UPI Input */}
              {payMode === 'UPI' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="space-y-3"
                >
                  <div className="form-group">
                    <label>UPI ID</label>
                    <input
                      type="text"
                      placeholder="yourname@paytm"
                      value={upiId}
                      onChange={(e) => setUpiId(e.target.value)}
                      className="form-input w-full"
                    />
                  </div>
                  <div className="flex gap-2">
                    {['@paytm', '@gpay', '@phonepe', '@ybl'].map(suffix => (
                      <button
                        key={suffix}
                        type="button"
                        onClick={() => setUpiId(prev => {
                          const base = prev.split('@')[0] || 'user';
                          return `${base}${suffix}`;
                        })}
                        className="text-[0.68rem] px-2.5 py-1 rounded bg-white/5 border border-white/10 text-gray-400 hover:text-brand-500 hover:border-brand-500/30 cursor-pointer transition-all"
                      >
                        {suffix}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Card Input */}
              {(payMode === 'Credit Card' || payMode === 'Debit Card') && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="space-y-3"
                >
                  <div className="form-group">
                    <label>Card Number</label>
                    <input
                      type="text"
                      placeholder="4242 4242 4242 4242"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                      className="form-input w-full font-mono tracking-wider"
                      maxLength={19}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="form-group">
                      <label>Expiry Date</label>
                      <input
                        type="text"
                        placeholder="MM/YY"
                        value={cardExpiry}
                        onChange={(e) => setCardExpiry(formatExpiry(e.target.value))}
                        className="form-input w-full font-mono"
                        maxLength={5}
                      />
                    </div>
                    <div className="form-group">
                      <label>CVC</label>
                      <input
                        type="text"
                        placeholder="123"
                        value={cardCvc}
                        onChange={(e) => setCardCvc(e.target.value.replace(/\D/g, '').slice(0, 4))}
                        className="form-input w-full font-mono"
                        maxLength={4}
                      />
                    </div>
                  </div>
                  <p className="text-[0.68rem] text-gray-600">Use test card: 4242 4242 4242 4242 · 12/29 · 123</p>
                </motion.div>
              )}

              {/* Net Banking */}
              {payMode === 'Net Banking' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                >
                  <div className="form-group">
                    <label>Select Bank</label>
                    <select className="form-input w-full">
                      <option>State Bank of India</option>
                      <option>HDFC Bank</option>
                      <option>ICICI Bank</option>
                      <option>Axis Bank</option>
                      <option>Kotak Mahindra Bank</option>
                    </select>
                  </div>
                </motion.div>
              )}
            </div>
          </div>

          {/* Right — Payment Summary */}
          <div className="lg:sticky lg:top-20 self-start">
            <div className="card !p-5 space-y-4">
              <h3 className="text-sm font-semibold text-white">Payment Summary</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Base fare</span>
                  <span className="text-white">{formatCurrency(amount)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Taxes & fees</span>
                  <span className="text-white">₹0</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Method</span>
                  <span className="text-white font-medium">{payMode}</span>
                </div>
                <div className="border-t border-white/5 pt-3 flex justify-between">
                  <span className="text-white font-semibold">Total</span>
                  <span className="text-xl font-extrabold text-brand-500">
                    {formatCurrency(amount)}
                  </span>
                </div>
              </div>

              <button
                onClick={handlePay}
                disabled={processing}
                className="btn btn-primary !rounded-xl"
              >
                {processing ? (
                  <span className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Processing payment...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Lock size={16} /> Pay {formatCurrency(amount)}
                  </span>
                )}
              </button>

              {/* Security badges */}
              <div className="flex flex-col gap-2 pt-2">
                <div className="flex items-center gap-2 text-[0.7rem] text-gray-600">
                  <Shield size={12} className="text-green-500" /> 256-bit SSL Encrypted
                </div>
                <div className="flex items-center gap-2 text-[0.7rem] text-gray-600">
                  <CheckCircle2 size={12} className="text-green-500" /> PCI DSS Compliant
                </div>
                <div className="flex items-center gap-2 text-[0.7rem] text-gray-600">
                  <Lock size={12} className="text-green-500" /> Secure payment gateway
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default PaymentPage;
