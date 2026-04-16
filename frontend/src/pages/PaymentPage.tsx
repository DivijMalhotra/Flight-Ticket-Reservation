import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { api } from '@/services/api';
import { formatCurrency } from '@/lib/utils';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import PageHero from '@/components/PageHero';
import {
  CreditCard, Lock, Shield, CheckCircle2, Plane, Calendar,
  Armchair, Wallet, ExternalLink, Loader2,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.5 },
};

const PaymentPage: React.FC = () => {
  const { reservationId } = useParams<{ reservationId: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [reservation, setReservation] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [payMode, setPayMode] = useState('UPI');
  const [upiId, setUpiId] = useState('');
  const [stripeRedirecting, setStripeRedirecting] = useState(false);

  const stripeStatus = searchParams.get('status');
  const sessionId = searchParams.get('session_id');

  useEffect(() => {
    api.getReservation(Number(reservationId))
      .then(setReservation)
      .catch(() => toast.error('Reservation not found'))
      .finally(() => setLoading(false));
  }, [reservationId]);

  useEffect(() => {
    if (stripeStatus === 'success' && reservation) {
      setProcessing(true);
      api.confirmPayment({
        Res_ID: Number(reservationId),
        Pay_Mode: 'Credit Card',
      })
        .then(async (result) => {
          toast.success('Payment successful!');
          const updatedRes = await api.getReservation(Number(reservationId));
          navigate('/booking-confirm', {
            state: {
              reservation: updatedRes.reservation,
              ticket: updatedRes.tickets?.[0],
              payment: updatedRes.payments?.[0] || result.payment,
            },
          });
        })
        .catch(() => {
          toast.success('Payment received!');
          navigate('/booking-confirm', {
            state: {
              reservation: reservation?.reservation,
              ticket: reservation?.tickets?.[0],
              payment: reservation?.payments?.[0],
            },
          });
        });
    } else if (stripeStatus === 'cancelled') {
      toast.error('Payment was cancelled');
    }
  }, [stripeStatus, reservation]);

  const validatePayment = (): boolean => {
    if (payMode === 'UPI') {
      if (!upiId || !upiId.includes('@')) {
        toast.error('Enter a valid UPI ID (e.g. name@upi)');
        return false;
      }
    }
    return true;
  };

  const handlePay = async () => {
    if (!validatePayment()) return;
    setProcessing(true);
    try {
      const result = await api.confirmPayment({
        Res_ID: Number(reservationId),
        Pay_Mode: payMode,
      });
      toast.success('Payment successful!');
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

  const handleStripeCheckout = async () => {
    setStripeRedirecting(true);
    try {
      const ticket = reservation?.tickets?.[0];
      const checkoutRes = await api.createCheckoutSession({
        Res_ID: Number(reservationId),
        Amount: amount,
        Flight_Info: ticket ? {
          Source: ticket.Source || '—',
          Destination: ticket.Destination || '—',
          Airline: ticket.Airline_Name || 'Airline',
          Class_Type: ticket.Class_Type || 'Economy',
          Seat_Num: ticket.Seat_Num || '—',
          Travel_Date: ticket.Travel_Date || '—',
        } : undefined,
      });
      if (checkoutRes.url) {
        window.location.href = checkoutRes.url;
      } else {
        toast.error('Failed to create checkout session');
      }
    } catch (err: any) {
      toast.error(err.message || 'Checkout failed');
    } finally {
      setStripeRedirecting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="spinner" />
      </div>
    );
  }

  if (stripeStatus === 'success' && processing) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
        >
          <Loader2 size={36} className="text-brand-500" />
        </motion.div>
        <p className="text-gray-400 text-sm">Confirming your payment...</p>
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

  const amount = Number(reservation?.reservation?.Total_Amount) || 0;
  const ticket = reservation?.tickets?.[0];
  const isCardMode = payMode === 'Credit Card' || payMode === 'Debit Card';

  return (
    <>
      <PageHero
        icon={Wallet}
        title="Complete Payment"
        subtitle={`Reservation #${reservationId} · Secure checkout powered by Stripe`}
        badge="256-bit SSL encrypted"
      />

      <div className="container-app -mt-6 relative z-10 pb-12">
        <motion.div {...fadeUp}>
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-6 max-w-2xl mx-auto">
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

                {/* Stripe Checkout redirect */}
                {isCardMode && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="space-y-4"
                  >
                    <div className="rounded-xl border border-brand-500/15 bg-brand-500/5 p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Shield size={15} className="text-brand-500" />
                        <span className="text-xs font-semibold text-white">Secure Stripe Checkout</span>
                      </div>
                      <p className="text-[0.72rem] text-gray-400 leading-relaxed">
                        You'll be redirected to Stripe's secure payment page. We support all major cards — Visa, Mastercard, Amex, and more.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={handleStripeCheckout}
                      disabled={stripeRedirecting}
                      className="btn btn-primary !rounded-xl w-full"
                    >
                      {stripeRedirecting ? (
                        <span className="flex items-center justify-center gap-2">
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Redirecting to Stripe...
                        </span>
                      ) : (
                        <span className="flex items-center justify-center gap-2">
                          <ExternalLink size={16} /> Pay {formatCurrency(amount)} with Stripe
                        </span>
                      )}
                    </button>
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

                {/* Pay button — only for UPI / Net Banking */}
                {!isCardMode && (
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
                )}

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
    </>
  );
};

export default PaymentPage;
